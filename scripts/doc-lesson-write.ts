/**
 * 作業資料（#307）を、本番 Sanity にレッスン（レッスン → クエスト → 記事）として書き込む。
 *
 * 作業資料は「URL を直接開いた人だけが見る」ページ。サイト側は _id の頭が `doc-` のものを
 * 一覧・新着・検索・サイトマップ・AIチャットから外し、noindex を付ける（src/lib/doc-content-utils.ts）。
 *
 * 実行:
 *   npx tsx scripts/doc-lesson-write.ts <資料フォルダ>            # dry-run（既定。書き込まない）
 *   npx tsx scripts/doc-lesson-write.ts <資料フォルダ> --write    # 本番へ書き込む
 *   npx tsx scripts/doc-lesson-write.ts <資料フォルダ> --write --prune  # 元から消えた記事・クエストも削除
 *   npx tsx scripts/doc-lesson-write.ts <資料フォルダ> --write --dev    # 開発用 dataset に書く（ローカルで表示確認）
 *
 * 安全のためのガード（このスクリプトは確認なしでの実行を許可される前提なので、緩めないこと）:
 *   - 書けるのは _id が `doc-<key>` で始まるドキュメントだけ。書き込み・削除の直前に1件ずつ確かめる
 *   - 既存の本物のレッスン・記事（doc- 以外）と slug が被ったら中止する
 *   - 資料フォルダは rebono/作業資料/ の下だけ
 *   - patch はしない。createOrReplace と、--prune 時の delete（doc-<key>- のみ）だけ
 *   - 画像は Sanity の画像アセットとして追加アップロードするだけ（既存アセットは消さない）
 *
 * 資料フォルダの形（中身は rebono に置く。bono-training は公開リポなので中身をここに書かない）:
 *   rebono/作業資料/<フォルダ>/
 *     lesson.md                 frontmatter: key（英小文字・数字・-）, title, description（任意）
 *     01_<クエスト名>/
 *       01_<何でも>.md          frontmatter: title, premium（任意。true で会員限定）
 *       img/xxx.png             本文の ![代替テキスト](img/xxx.png) で貼る
 *     02_<クエスト名>/ ...
 *
 * 本文で使える書き方: ## 〜 ####、段落、- 箇条書き（入れ子可）、1. 番号付き、> 引用、
 *   **太字**、[文字](https://…)、| 表 |（Sanity の表ブロックになる）、![代替](相対パス)、```コード```
 */
import { createClient } from "@sanity/client";
import crypto from "crypto";
import { config } from "dotenv";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { basename, dirname, join, relative, resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local"), quiet: true });

const WRITE = process.argv.includes("--write");
const PRUNE = process.argv.includes("--prune");
const PROJECT_ID = "cqszh4up";
// --dev のときだけ開発用 dataset（表示の確認用）。それ以外は本番
const DATASET = process.argv.includes("--dev") ? "development" : "production";
const DOC_ID_PREFIX = "doc-";
const SOURCE_ROOT = "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/作業資料";

const folderArg = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!folderArg) {
  throw new Error("資料フォルダを指定してください（例: rebono/作業資料/<フォルダ>）");
}
const SOURCE_DIR = resolve(folderArg);
if (relative(SOURCE_ROOT, SOURCE_DIR).startsWith("..") || SOURCE_DIR === SOURCE_ROOT) {
  throw new Error(`資料フォルダは ${SOURCE_ROOT}/ の下だけです: ${SOURCE_DIR}`);
}
if (PRUNE && !WRITE) {
  console.log("※ --prune は --write と一緒のときだけ削除します（今回は削除予定の表示のみ）");
}
if (WRITE && !process.env.SANITY_WRITE_TOKEN) {
  throw new Error("SANITY_WRITE_TOKEN が .env.local にありません");
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// ============================================================
// Markdown → Portable Text
// ============================================================

function key() {
  return crypto.randomBytes(6).toString("hex");
}

type Span = { _type: "span"; _key: string; marks: string[]; text: string };
type LinkDef = { _type: "link"; _key: string; href: string };
type Block = {
  _type: "block";
  _key: string;
  style: string;
  markDefs: LinkDef[];
  children: Span[];
  level?: number;
  listItem?: "bullet" | "number";
};
type ImageNode = { _type: "image"; _key: string; alt: string; _file: string; asset?: { _type: "reference"; _ref: string } };
type ContentNode = Block | ImageNode | Record<string, unknown>;

// **太字** と [文字](https://…) のリンクだけを扱う
function spans(text: string): { children: Span[]; markDefs: LinkDef[] } {
  const parts: Span[] = [];
  const markDefs: LinkDef[] = [];
  const inline = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let cursor = 0;
  for (const match of text.matchAll(inline)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push({ _type: "span", _key: key(), marks: [], text: text.slice(cursor, start) });
    if (match[1] !== undefined) {
      parts.push({ _type: "span", _key: key(), marks: ["strong"], text: match[1] });
    } else {
      const def: LinkDef = { _type: "link", _key: key(), href: match[3] };
      markDefs.push(def);
      parts.push({ _type: "span", _key: key(), marks: [def._key], text: match[2] });
    }
    cursor = start + match[0].length;
  }
  if (cursor < text.length) parts.push({ _type: "span", _key: key(), marks: [], text: text.slice(cursor) });
  return {
    children: parts.length ? parts : [{ _type: "span", _key: key(), marks: [], text }],
    markDefs,
  };
}

function block(text: string, style = "normal", listItem?: "bullet" | "number", level = 1): Block {
  return { _type: "block", _key: key(), style, ...spans(text), ...(listItem ? { level, listItem } : {}) };
}

/** ```フェンス → customContainer(note)。スキーマにコードブロック型が無いため、1行=1ブロック＋codeマーク */
function codeContainer(lines: string[], title: string): ContentNode {
  return {
    _type: "customContainer",
    _key: key(),
    containerType: "note",
    title,
    content: lines
      .filter((line) => line.trim())
      .map((line) => ({
        _type: "block",
        _key: key(),
        style: "normal",
        markDefs: [],
        children: [{ _type: "span", _key: key(), marks: ["code"], text: line }],
      })),
  };
}

/** | a | b | の表 → tableBlock（セルは文字だけ。**太字** の記号は外す） */
function tableBlock(lines: string[]): ContentNode {
  const cells = (line: string) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim().replace(/\*\*([^*]+)\*\*/g, "$1"));
  const isSeparator = (line: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
  const hasHeader = lines.length >= 2 && isSeparator(lines[1]);
  const rows = lines
    .filter((line) => !isSeparator(line))
    .map((line, i) => ({ _type: "tableRow", _key: key(), isHeader: hasHeader && i === 0, cells: cells(line) }));
  return { _type: "tableBlock", _key: key(), rows };
}

type Frontmatter = Record<string, string>;

function parseFrontmatter(raw: string, file: string): { fm: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) throw new Error(`${file}: frontmatter がありません`);
  const fm: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1").trim();
  }
  return { fm, body: raw.slice(match[0].length) };
}

function markdownToPortableText(body: string, mdFile: string): ContentNode[] {
  const lines = body.replace(/<!--[\s\S]*?-->/g, "").split("\n");
  // 冒頭の h1 は記事タイトル（frontmatter の title を使う）なので落とす
  const first = lines.findIndex((line) => line.trim());
  if (first >= 0 && /^#\s+/.test(lines[first].trim())) lines.splice(first, 1);

  const result: ContentNode[] = [];
  let paragraph: string[] = [];
  let table: string[] = [];
  let lastHeading = "";
  let fence: string[] | null = null;
  const flush = () => {
    const text = paragraph.join(" ").trim();
    if (text) result.push(block(text));
    paragraph = [];
    if (table.length) result.push(tableBlock(table));
    table = [];
  };

  for (const line of lines) {
    // コードフェンスは見出し・リスト判定より先に処理する（中の「## 目的」「1.」を変換しない）
    if (/^\s*```/.test(line)) {
      if (fence) {
        result.push(codeContainer(fence, lastHeading || "メモ"));
        fence = null;
      } else {
        flush();
        fence = [];
      }
      continue;
    }
    if (fence) {
      fence.push(line.replace(/\s+$/, ""));
      continue;
    }

    const text = line.trim();
    if (text.startsWith("|")) {
      if (paragraph.length) {
        const keep = table;
        table = [];
        flush();
        table = keep;
      }
      table.push(text);
      continue;
    }
    if (table.length) flush();
    if (!text) {
      flush();
      continue;
    }
    if (/^#\s+/.test(text)) throw new Error(`${mdFile}: 本文の途中に h1 があります: ${text}`);
    const image = text.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (image) {
      flush();
      if (/^https?:/.test(image[2])) throw new Error(`${mdFile}: 画像は資料フォルダ内のファイルを指定してください: ${image[2]}`);
      const file = resolve(dirname(mdFile), image[2]);
      if (!existsSync(file)) throw new Error(`${mdFile}: 画像が見つかりません: ${image[2]}`);
      if (relative(SOURCE_DIR, file).startsWith("..")) throw new Error(`${mdFile}: 画像は資料フォルダの中に置いてください: ${image[2]}`);
      result.push({ _type: "image", _key: key(), alt: image[1], _file: file });
      continue;
    }
    const heading = text.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flush();
      lastHeading = heading[2];
      result.push(block(heading[2], `h${heading[1].length}`));
      continue;
    }
    const indent = line.match(/^(\s*)/)?.[1].replace(/\t/g, "  ").length ?? 0;
    const level = Math.floor(indent / 2) + 1;
    const bullet = text.match(/^[-*]\s+(?:\[[ xX]\]\s+)?(.+)$/);
    if (bullet) {
      flush();
      result.push(block(bullet[1], "normal", "bullet", level));
      continue;
    }
    const number = text.match(/^\d+\.\s+(.+)$/);
    if (number) {
      flush();
      result.push(block(number[1], "normal", "number", level));
      continue;
    }
    if (text.startsWith("> ")) {
      flush();
      result.push(block(text.slice(2), "blockquote"));
      continue;
    }
    paragraph.push(text);
  }
  if (fence) throw new Error(`${mdFile}: 閉じられていないコードフェンスがあります`);
  flush();
  return result;
}

// ============================================================
// 資料フォルダ → ドキュメント
// ============================================================

type Doc = Record<string, unknown> & { _id: string; _type: string; title: string };

function ref(id: string) {
  return { _type: "reference", _ref: id, _key: key() };
}

function numbered(dir: string, kind: "dir" | "md") {
  return readdirSync(dir)
    .filter((name) => /^\d{2}_/.test(name))
    .filter((name) => (kind === "dir" ? statSync(join(dir, name)).isDirectory() : name.endsWith(".md")))
    .sort();
}

function excerptFrom(content: ContentNode[]): string | undefined {
  const first = content.find(
    (n) => (n as Block)._type === "block" && (n as Block).style === "normal" && !(n as Block).listItem,
  ) as Block | undefined;
  if (!first) return undefined;
  const text = first.children.map((c) => c.text).join("");
  return text.length > 120 ? `${text.slice(0, 119)}…` : text;
}

function buildDocs() {
  const lessonFile = join(SOURCE_DIR, "lesson.md");
  if (!existsSync(lessonFile)) throw new Error(`${lessonFile} がありません`);
  const { fm: lessonFm } = parseFrontmatter(readFileSync(lessonFile, "utf8"), lessonFile);
  const docKey = lessonFm.key;
  if (!docKey || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(docKey)) {
    throw new Error(`lesson.md の key は英小文字・数字・ハイフンで書いてください (${docKey})`);
  }
  if (!lessonFm.title) throw new Error("lesson.md に title がありません");
  const base = `${DOC_ID_PREFIX}${docKey}`;
  const now = new Date().toISOString();

  const articles: Doc[] = [];
  const quests: Doc[] = [];
  const questDirs = numbered(SOURCE_DIR, "dir");
  if (questDirs.length === 0) throw new Error("クエストのフォルダ（01_〜）がありません");

  questDirs.forEach((questDir, qi) => {
    const qn = String(qi + 1).padStart(2, "0");
    const questId = `${base}-q${qn}`;
    const articleIds: string[] = [];
    const mdFiles = numbered(join(SOURCE_DIR, questDir), "md");
    if (mdFiles.length === 0) throw new Error(`${questDir}: 記事（01_〜.md）がありません`);

    mdFiles.forEach((mdName, ai) => {
      const an = String(ai + 1).padStart(2, "0");
      const file = join(SOURCE_DIR, questDir, mdName);
      const { fm, body } = parseFrontmatter(readFileSync(file, "utf8"), file);
      if (!fm.title) throw new Error(`${file}: title がありません`);
      const content = markdownToPortableText(body, file);
      const excerpt = excerptFrom(content);
      const id = `${base}-q${qn}-${an}`;
      articleIds.push(id);
      articles.push({
        _id: id,
        _type: "article",
        articleNumber: ai + 1,
        contentType: "text",
        articleType: "explain",
        isPremium: fm.premium === "true",
        title: fm.title,
        slug: { _type: "slug", current: `${base}-${qn}-${an}` },
        ...(excerpt ? { excerpt } : {}),
        author: "bono",
        publishedAt: now,
        content,
        _source: relative(SOURCE_DIR, file),
      });
    });

    quests.push({
      _id: questId,
      _type: "quest",
      questNumber: qi + 1,
      title: questDir.replace(/^\d{2}_/, ""),
      slug: { _type: "slug", current: questId },
      lesson: { _type: "reference", _ref: base },
      articles: articleIds.map(ref),
    });
  });

  const lesson: Doc = {
    _id: base,
    _type: "lesson",
    title: lessonFm.title,
    slug: { _type: "slug", current: base },
    ...(lessonFm.description ? { description: lessonFm.description } : {}),
    isPremium: false,
    isHidden: true,
    quests: quests.map((q) => ref(q._id)),
  };

  return { base, lesson, quests, articles };
}

// ============================================================
// 書き込み（ガードはここに集める）
// ============================================================

function assertTarget() {
  const { dataset, projectId } = client.config();
  if (!["production", "development"].includes(dataset ?? "") || dataset !== DATASET || projectId !== PROJECT_ID) {
    throw new Error(`書き込み先が想定外です (${projectId}/${dataset})。中止します`);
  }
}

/** このスクリプトが作る _id の形だけ: doc-<key> / doc-<key>-qNN / doc-<key>-qNN-NN */
function isOwnId(id: string, base: string) {
  if (id === base) return true;
  if (!id.startsWith(`${base}-`)) return false;
  return /^q\d{2}(-\d{2})?$/.test(id.slice(base.length + 1));
}

function assertDocId(id: string, base: string) {
  // 前方一致だけだと key "302" の資料が "302-course-policy" の資料まで消せてしまうので、形で絞る
  if (!isOwnId(id, base)) {
    throw new Error(`資料用の印（${base}）が付いていない _id には書きません: ${id}`);
  }
  if (!id.startsWith(DOC_ID_PREFIX)) throw new Error(`doc- で始まらない _id には書きません: ${id}`);
}

async function uploadImages(articles: Doc[]) {
  const cache = new Map<string, string>();
  let count = 0;
  for (const article of articles) {
    for (const node of article.content as ContentNode[]) {
      if ((node as ImageNode)._type !== "image") continue;
      const img = node as ImageNode;
      let assetId = cache.get(img._file);
      if (!assetId) {
        const asset = await client.assets.upload("image", readFileSync(img._file), { filename: basename(img._file) });
        assetId = asset._id;
        cache.set(img._file, assetId);
        count++;
      }
      img.asset = { _type: "reference", _ref: assetId };
    }
  }
  return count;
}

function stripLocal(doc: Doc): Doc {
  const { _source, ...rest } = doc;
  void _source;
  if (Array.isArray(rest.content)) {
    rest.content = (rest.content as ContentNode[]).map((n) => {
      if ((n as ImageNode)._type !== "image") return n;
      const { _file, ...image } = n as ImageNode;
      void _file;
      return image;
    });
  }
  return rest as Doc;
}

async function main() {
  const { base, lesson, quests, articles } = buildDocs();
  const docs: Doc[] = [...articles, ...quests, lesson];
  for (const doc of docs) assertDocId(doc._id, base);

  const imageCount = articles.reduce(
    (n, a) => n + (a.content as ContentNode[]).filter((c) => (c as ImageNode)._type === "image").length,
    0,
  );
  console.log(`書き込み先: ${PROJECT_ID}/${DATASET} / ${WRITE ? "WRITE" : "DRY-RUN（書き込みなし）"}`);
  console.log(`資料: ${SOURCE_DIR}`);
  console.log(`予定: lesson 1 / quest ${quests.length} / article ${articles.length} / 画像 ${imageCount}\n`);
  for (const doc of docs) {
    const slug = (doc.slug as { current: string }).current;
    const extra =
      doc._type === "article"
        ? ` premium=${doc.isPremium} blocks=${(doc.content as unknown[]).length} src=${doc._source}`
        : doc._type === "quest"
          ? ` articles=${(doc.articles as unknown[]).length}`
          : ` isHidden=${doc.isHidden} quests=${(doc.quests as unknown[]).length}`;
    console.log(`  ${doc._type.padEnd(7)} ${doc._id.padEnd(28)} ${doc.title}${extra}`);
    if (doc._type === "lesson") console.log(`          URL: ${DATASET === "production" ? "https://www.bo-no.design" : "http://localhost:3000"}/lessons/${slug}`);
  }

  // 衝突チェック: doc- 以外のドキュメントと slug が被っていないか
  const slugs = docs.map((d) => (d.slug as { current: string }).current);
  const sameSlug = await client.fetch<{ _id: string; _type: string; slug: string }[]>(
    `*[_type in ["lesson","quest","article"] && slug.current in $slugs]{_id, _type, "slug": slug.current}`,
    { slugs },
  );
  const ids = new Set(docs.map((d) => d._id));
  const foreign = sameSlug.filter((d) => !ids.has(d._id.replace(/^drafts\./, "")));
  if (foreign.length > 0) {
    for (const d of foreign) console.log(`  衝突: ${d._type} ${d._id} slug=${d.slug}`);
    throw new Error("資料以外のドキュメントと slug が衝突しています。中止します");
  }

  // 元から消えた記事・クエスト（同じ資料の古い分）
  const existing = await client.fetch<{ _id: string; _type: string; title?: string }[]>(
    `*[_id == $base || string::startsWith(_id, $prefix) || _id == $draftBase || string::startsWith(_id, $draftPrefix)]{_id, _type, title}`,
    { base, prefix: `${base}-`, draftBase: `drafts.${base}`, draftPrefix: `drafts.${base}-` },
  );
  const stale = existing.filter((d) => !d._id.startsWith("drafts.") && !ids.has(d._id) && isOwnId(d._id, base));
  const drafts = existing.filter((d) => d._id.startsWith("drafts."));
  console.log(`\n既存: ${existing.length - drafts.length} 件 / 元から消えた分: ${stale.length} 件 / Studioの下書き: ${drafts.length} 件`);
  for (const d of stale) console.log(`  ${PRUNE ? "削除予定" : "残す（--prune で削除）"}: ${d._type} ${d._id} ${d.title ?? ""}`);
  for (const d of drafts) console.log(`  ※ 下書きあり（このスクリプトは触らない）: ${d._id}`);

  if (!WRITE) {
    console.log("\nDRY-RUN のため書き込みません。書き込むときは --write を付けてください");
    return;
  }

  assertTarget();
  const uploaded = await uploadImages(articles);
  const tx = client.transaction();
  for (const doc of docs) {
    assertDocId(doc._id, base);
    tx.createOrReplace(stripLocal(doc));
  }
  if (PRUNE) {
    for (const d of stale) {
      assertDocId(d._id, base);
      tx.delete(d._id);
    }
  }
  const res = await tx.commit();
  console.log(`\n書き込み完了: ${res.results.length} 件（画像アップロード ${uploaded} 件） transactionId=${res.transactionId}`);
  const site = DATASET === "production" ? "https://www.bo-no.design" : "http://localhost:3000";
  console.log(`URL: ${site}/lessons/${base}${DATASET === "production" ? "（反映まで数十秒〜。webhook で再検証）" : ""}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
