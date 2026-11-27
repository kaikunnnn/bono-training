/**
 * レッスン「デザイナーのためのAIリサーチ入門」（#319 の 11/21 決めた形）を、確認用の Sanity development dataset にだけ投入する。
 * 既定は development。production へは `--production` を付けたときだけ書く（2026-11-27 オーナー依頼でレッスンを本番に出す）。
 *   本番: npx tsx scripts/import-ai-research-lesson-dev.ts --production --dry-run → 内容を見せて承認 → オーナーが --production で実行
 * 型: scripts/import-claudecode-ui-lesson-dev.ts をコピーして最小変更
 *     変更点: 構成とタイトルは src/app/dev/ai-research-lesson/directions.ts の q から読む／本文は下書きMD（11/14時点の番号）を今の番号に当てはめる
 *     ／1記事に下書きが2本あるときは続けて入れる（2本目の動画はリンク）／記事サムネイルは public/images/lesson-ai-research/thumbs
 *
 * 実行:
 *   npx tsx scripts/import-ai-research-lesson-dev.ts --dry-run   # 作成予定一覧と _id/slug の衝突チェックのみ
 *   SANITY_WRITE_TOKEN=… npx tsx scripts/import-ai-research-lesson-dev.ts   # development へ createOrReplace
 *
 * - 書き込みは createOrReplace で `air-` プレフィックスの _id のみ。削除・patch はしない
 * - 元MD: rebono/AIリサーチではじめるUIデザイン/クエスト01〜04
 */
import { createClient } from "@sanity/client";
import crypto from "crypto";
import { config } from "dotenv";
import { createReadStream, existsSync, readdirSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { DIRECTIONS, ROWS, THUMBS } from "../src/app/dev/ai-research-lesson/directions";

config({ path: resolve(__dirname, "..", ".env.local"), quiet: true });

const DRY_RUN = process.argv.includes("--dry-run");
const PROJECT_ID = "cqszh4up";
const PRODUCTION = process.argv.includes("--production");
const DATASET = PRODUCTION ? "production" : "development";
const ID_PREFIX = "air-";
// 記事URL /contents/ai-research-01-1（11/27 オーナー決定。既存AIレッスンの claudecode-ui-0-1 と同じく中身がわかる形）
// 公開後は番号を詰め直しても _id と slug を変えない（進捗・ブックマーク・外部リンクが別記事を指すため）
const SLUG_PREFIX = "ai-research-";
// 中身が未完成の記事は publishedAt を付けない（新着・更新一覧に出さない。11/27 オーナー決定）
const UNLISTED = new Set(["01-2", "04-1", "04-2"]); // 01-3 は 11/27 に本文を完成
// --only=01-3 のように記事番号を渡すと、その記事だけを書き込む（本番で1本だけ直すとき）
const ONLY = process.argv.find((a) => a.startsWith("--only="))?.slice("--only=".length).split(",") ?? null;
const OVERWRITE = process.argv.includes("--overwrite");
const SOURCE_DIR = "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/AIリサーチではじめるUIデザイン";
const PUBLIC_DIR = resolve(__dirname, "..", "public");
const PLACEHOLDER_TEXT = "（準備中：下書きはまだありません）";

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: "2024-01-01",
  // dry-run は匿名読み取り（development は公開データセット）。本実行のみ書き込みトークンを使う
  // dry-run は匿名読み取り（development は公開データセット）。production の dry-run は衝突チェックに読み取りトークンを使う
  token: DRY_RUN && !PRODUCTION ? undefined : process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// 二重ガード: 万一 config が書き換わっていても development 以外には絶対に書かない
function assertDevelopment() {
  const { dataset, projectId } = client.config();
  if (dataset !== (PRODUCTION ? "production" : "development")) {
    throw new Error(`dataset が想定外です (${dataset})。中止します`);
  }
  if (projectId !== PROJECT_ID) {
    throw new Error(`projectId が想定外です (${projectId})。中止します`);
  }
}
assertDevelopment();
if ((!DRY_RUN || PRODUCTION) && !/^[\x21-\x7e]+$/.test(process.env.SANITY_WRITE_TOKEN ?? "")) {
  console.error("SANITY_WRITE_TOKEN が空か、英数字以外を含んでいます。書き込まずに止めます");
  process.exit(1);
}

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
type ContentNode = Block | Record<string, unknown>;

// [text](url) → link マーク（markDefs）、**text** → strong。url は https:// か、サイト内の /パス。前例: import-ai-ui-styling-lesson.ts の parseInline
function spans(text: string): { children: Span[]; markDefs: LinkDef[] } {
  const parts: Span[] = [];
  const markDefs: LinkDef[] = [];
  const inline = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)|\*\*([^*]+)\*\*/g;
  let cursor = 0;
  for (const match of text.matchAll(inline)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      parts.push({ _type: "span", _key: key(), marks: [], text: text.slice(cursor, start) });
    }
    if (match[1] !== undefined) {
      const linkKey = key();
      markDefs.push({ _type: "link", _key: linkKey, href: match[2] });
      parts.push({ _type: "span", _key: key(), marks: [linkKey], text: match[1] });
    } else {
      parts.push({ _type: "span", _key: key(), marks: ["strong"], text: match[3] });
    }
    cursor = start + match[0].length;
  }
  if (cursor < text.length) {
    parts.push({ _type: "span", _key: key(), marks: [], text: text.slice(cursor) });
  }
  return {
    children: parts.length ? parts : [{ _type: "span", _key: key(), marks: [], text }],
    markDefs,
  };
}

function block(
  text: string,
  style = "normal",
  listItem?: "bullet" | "number",
  level = 1,
): Block {
  const { children, markDefs } = spans(text);
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs,
    children,
    ...(listItem ? { level, listItem } : {}),
  };
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

type Frontmatter = Record<string, string>;

function parseFrontmatter(raw: string): { fm: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) throw new Error("frontmatter がありません");
  const fm: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1").trim();
  }
  return { fm, body: raw.slice(match[0].length) };
}

type ConvertStats = {
  codeBlocks: number;
  checklistItems: number;
  nestedItems: number;
  quoteBlocks: number;
  links: number;
};

// リンク化の確認: link マーク数を数え、[text](url) が文字のまま残っていたら中止する
function checkLinks(content: ContentNode[], stats: ConvertStats, file: string) {
  for (const node of content) {
    const b = node as Block;
    if (b._type !== "block") continue;
    stats.links += b.markDefs.filter((d) => d._type === "link").length;
    const text = b.children.map((c) => c.text).join("");
    if (/\[[^\]]+\]\([^)]+\)/.test(text)) {
      throw new Error(`${file}: Markdown リンクが文字のまま残っています: ${text}`);
    }
  }
}

function markdownToPortableText(body: string, stats: ConvertStats): ContentNode[] {
  const lines = body.replace(/<!--[\s\S]*?-->/g, "").split("\n");

  const result: ContentNode[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];
  let lastHeading = "";
  let fence: string[] | null = null;
  // 連続する `> ` 行（複数行のプロンプト例）は1つの引用ブロックにまとめ、行は改行(\n)で保つ
  const flushQuote = () => {
    if (quote.length) {
      result.push(block(quote.join("\n"), "blockquote"));
      stats.quoteBlocks++;
    }
    quote = [];
  };
  const flush = () => {
    flushQuote();
    const text = paragraph.join(" ").trim();
    if (text) result.push(block(text));
    paragraph = [];
  };

  for (const line of lines) {
    // コードフェンスは見出し・リスト判定より先に処理する（中の「## 目的」「1.」を変換しない）
    if (/^\s*```/.test(line)) {
      if (fence) {
        result.push(codeContainer(fence, lastHeading || "プロンプト"));
        stats.codeBlocks++;
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
    if (!text) {
      flush();
      continue;
    }
    if (/^#\s+/.test(text)) {
      // 下書きの1行目の「# タイトル」は記事タイトルと重なるので外す。それ以外のh1は中止
      if (!result.length && !paragraph.length) continue;
      throw new Error(`本文中にh1があります（記事タイトルとh1が重複します）: ${text}`);
    }
    if (text.startsWith(">")) {
      if (paragraph.length) flush();
      quote.push(text.replace(/^>\s?/, ""));
      continue;
    }
    flushQuote();
    const heading = text.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flush();
      lastHeading = heading[2];
      result.push(block(heading[2], `h${heading[1].length}`));
      continue;
    }
    const indent = line.match(/^(\s*)/)?.[1].replace(/\t/g, "  ").length ?? 0;
    const level = Math.floor(indent / 2) + 1;
    if (level > 1) stats.nestedItems++;
    const checklist = text.match(/^[-*]\s+\[[ xX]\]\s+(.+)$/);
    if (checklist) {
      flush();
      stats.checklistItems++;
      result.push(block(checklist[1], "normal", "bullet", level));
      continue;
    }
    const bullet = text.match(/^[-*]\s+(.+)$/);
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
    paragraph.push(text);
  }
  if (fence) throw new Error("閉じられていないコードフェンスがあります");
  flush();
  return result;
}

// ============================================================
// 構成（#319 11/21 決めた形 = directions.ts の q）
// ============================================================

const DIRECTION = DIRECTIONS.q;
const ROWS_Q = DIRECTION.rows ?? ROWS;

/** 今の番号 → 下書きの番号（src/app/dev/ai-research-lesson/drafts.ts と同じ）。チャレンジは種類で決める */
const DRAFT_MAP: Record<string, string[]> = {
  "01-1": ["0-1"],
  "01-2": [],
  "02-1": ["1-3"],
  "02-2": ["1-4"],
  "02-3": ["1-5", "1-6"],
  "02-4": ["1-7", "1-8"],
  "03-1": ["2-2"],
  "03-2": ["2-3"],
  "03-3": ["2-4"],
  "03-4": ["2-5"],
  "04-1": ["3-2"],
  "04-2": [],
};
// 下書きMDの video_url より優先する動画（YouTubeに出した回）
const VIDEO_OVERRIDE: Record<string, string> = {
  "01-1": "https://www.youtube.com/watch?v=zZ-v_K-R0Z4", // 11/27 18:30 公開予約
};
const CHALLENGE_DRAFTS = ["3-1", "3-3"];

/** 下書きフォルダの外の、今回足す記事。file は「---」の行より後ろを本文にする */
const EXTRA_ARTICLES = [
  {
    section: 0,
    number: "01-3",
    title: "このレッスンの進め方：AIリサーチから、新規登録のブラッシュアップまで", // 11/27 オーナー「お題ではなく進め方に」
    type: "intro",
    file: "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/issues/319_assets/01-3_このレッスンの進め方_文章案.md",
  },
];

function findSourceFile(number: string): string {
  const hits: string[] = [];
  for (const q of readdirSync(SOURCE_DIR).filter((d) => d.startsWith("クエスト"))) {
    for (const f of readdirSync(join(SOURCE_DIR, q))) {
      if (f.startsWith(`${number}_`) && f.endsWith(".md") && !f.includes("_案")) hits.push(join(SOURCE_DIR, q, f));
    }
  }
  if (hits.length !== 1) throw new Error(`${number}_*.md が ${hits.length} 件見つかりました`);
  return hits[0];
}

/** 本文の最初の段落から抜粋（schema: excerpt max 200） */
function excerptFrom(content: ContentNode[]): string | undefined {
  const first = content.find(
    (n) => (n as Block)._type === "block" && (n as Block).style === "normal" && !(n as Block).listItem,
  ) as Block | undefined;
  if (!first) return undefined;
  const text = first.children.map((c) => c.text).join("");
  return text.length > 120 ? `${text.slice(0, 119)}…` : text;
}

function ref(id: string) {
  return { _type: "reference", _ref: id, _key: key() };
}

type Doc = Record<string, unknown> & { _id: string; _type: string; title: string };

function buildDocs() {
  const stats: ConvertStats = { codeBlocks: 0, checklistItems: 0, nestedItems: 0, quoteBlocks: 0, links: 0 };
  const articles: (Doc & { _thumb?: string })[] = [];
  const quests: Doc[] = [];

  DIRECTION.sectionTitles.forEach((questTitle, questIndex) => {
    const questKey = `section${questIndex}`;
    const questId = `${ID_PREFIX}quest-${questKey}`;
    const articleIds: string[] = [];

    ROWS_Q.map((row, rowIndex) => ({ row, rowIndex }))
      .filter(({ row }) => row.section === questIndex)
      .forEach(({ row, rowIndex }, articleIndex) => {
        const title = DIRECTION.articleTitles[rowIndex];
        const draftNumbers = row.type === "challenge" ? CHALLENGE_DRAFTS : (row.drafts ?? DRAFT_MAP[row.number] ?? []);
        let content: ContentNode[] = [];
        let videoUrl: string | undefined;
        const sources: string[] = [];

        draftNumbers.forEach((n, i) => {
          const file = findSourceFile(n);
          const { fm, body } = parseFrontmatter(readFileSync(file, "utf8"));
          if (fm.number !== n) throw new Error(`${file}: frontmatter number (${fm.number}) が ${n} と一致しません`);
          const url = (i === 0 && VIDEO_OVERRIDE[row.number]) || fm.video_url;
          if (url && !/^https:\/\/vimeo\.com\/\d+$/.test(url) && !/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+$/.test(url)) {
            throw new Error(`${file}: video_url が Vimeo の形式ではありません (${url})`);
          }
          const part = markdownToPortableText(body, stats);
          checkLinks(part, stats, file);
          if (i === 0) {
            videoUrl = url || undefined;
          } else {
            // 2本目の下書き: 見出しで区切り、動画はリンクで示す（記事に動画は1本しか置けないため）
            content.push(block(fm.title ?? n, "h2"));
            // 2本をつないだ動画の回（row.oneVideo）は、2本目の動画リンクを出さない
            if (url && !row.oneVideo) content.push(block(`[この続きの動画を開く（Vimeo）](${url})`));
          }
          content = content.concat(part);
          sources.push(file.slice(SOURCE_DIR.length + 1));
        });
        if (!content.length) content = [block(PLACEHOLDER_TEXT)];

        const id = `${ID_PREFIX}article-${row.number}`;
        articleIds.push(id);
        const excerpt = sources.length ? excerptFrom(content) : undefined;
        const thumbPath = row.thumb ?? THUMBS[row.number];
        articles.push({
          _id: id,
          _type: "article",
          articleNumber: articleIndex + 1,
          contentType: "text",
          articleType: row.type,
          isPremium: !row.free,
          title,
          slug: { _type: "slug", current: `${SLUG_PREFIX}${row.number}` },
          ...(excerpt ? { excerpt } : {}),
          ...(videoUrl ? { videoUrl } : {}),
          author: "bono",
          ...(UNLISTED.has(row.number) ? {} : { publishedAt: PUBLISHED_AT }),
          content,
          _source: sources.join(" + ") || "(placeholder)",
          ...(thumbPath ? { _thumb: join(PUBLIC_DIR, thumbPath) } : {}),
        });
      });

    // 下書きフォルダの外にある、今回足す記事（11/24 決定の 01-3 など）
    for (const extra of EXTRA_ARTICLES.filter((e) => e.section === questIndex)) {
      const raw = readFileSync(extra.file, "utf8");
      const sep = raw.indexOf("\n---\n");
      if (sep < 0) throw new Error(`${extra.file}: 本文の前の区切り（---）がありません`);
      const content = markdownToPortableText(raw.slice(sep + 5), stats);
      checkLinks(content, stats, extra.file);
      const id = `${ID_PREFIX}article-${extra.number}`;
      articleIds.push(id);
      const excerpt = excerptFrom(content);
      articles.push({
        _id: id,
        _type: "article",
        articleNumber: articleIds.length,
        contentType: "text",
        articleType: extra.type,
        isPremium: false,
        title: extra.title,
        slug: { _type: "slug", current: `${SLUG_PREFIX}${extra.number}` },
        ...(excerpt ? { excerpt } : {}),
        author: "bono",
        ...(UNLISTED.has(extra.number) ? {} : { publishedAt: PUBLISHED_AT }),
        content,
        _source: extra.file.split("/").slice(-2).join("/"),
        ...(THUMBS[extra.number] ? { _thumb: join(PUBLIC_DIR, THUMBS[extra.number]) } : {}),
      });
    }

    quests.push({
      _id: questId,
      _type: "quest",
      questNumber: questIndex + 1,
      title: questTitle,
      slug: { _type: "slug", current: `${SLUG_PREFIX}quest-${questKey}` },
      ...(DIRECTION.sectionGoals?.[questIndex] ? { goal: DIRECTION.sectionGoals[questIndex] } : {}),
      lesson: { _type: "reference", _ref: LESSON_ID },
      articles: articleIds.map(ref),
    });
  });

  const owner = DIRECTION.ownerCopy;
  const lesson: Doc = {
    _id: LESSON_ID,
    _type: "lesson",
    title: DIRECTION.lessonTitle ?? "AIリサーチではじめるUIデザイン",
    ...(DIRECTION.subtitle ? { subtitle: DIRECTION.subtitle } : {}),
    ...(DIRECTION.seoTitle ? { seoTitle: DIRECTION.seoTitle } : {}),
    slug: { _type: "slug", current: LESSON_SLUG },
    ...(owner ? { description: owner.description, purposes: owner.purposes } : {}),
    isPremium: false,
    // development では一覧に出して確認する
    isHidden: false,
    tags: ["AI"],
    quests: quests.map((q) => ref(q._id)),
  };

  return { articles, quests, lesson, stats };
}

const LESSON_ID = `${ID_PREFIX}lesson`;
// 本番のレッスンページの設定（persona-lesson-top-config の AI_RESEARCH_LESSON_SLUG）と同じ slug
const LESSON_SLUG = "ai-research-ui-design";
const PUBLISHED_AT = "2026-11-24T00:00:00.000Z";
// 11/26 オーナー指定のレッスンのアイコン画像（1200×1800、レッスン詳細のHeroに出る iconImage）
const LESSON_ICON = join(PUBLIC_DIR, "images/lesson-ai-research/lesson-icon.jpg");

// ============================================================
// Main
// ============================================================

async function main() {
  const { articles, quests, lesson, stats } = buildDocs();
  const all: Doc[] = [...articles, ...quests, lesson];
  const docs: Doc[] = ONLY
    ? all.filter((d) => ONLY.some((n) => d._id === `${ID_PREFIX}article-${n}`))
    : all;
  if (ONLY && docs.length !== ONLY.length) throw new Error(`--only の記事が見つかりません: ${ONLY.join(",")}`);

  for (const doc of docs) {
    if (!doc._id.startsWith(ID_PREFIX)) throw new Error(`_id に ${ID_PREFIX} が付いていません: ${doc._id}`);
  }

  console.log(`Dataset: ${client.config().dataset} / mode: ${DRY_RUN ? "DRY-RUN" : "WRITE"}`);
  console.log(`作成予定: lesson 1 / quest ${quests.length} / article ${articles.length}（計 ${docs.length}）\n`);
  for (const doc of docs) {
    const slug = (doc.slug as { current: string }).current;
    const extra =
      doc._type === "article"
        ? ` premium=${doc.isPremium} listed=${doc.publishedAt ? "新着に出す" : "出さない"} type=${doc.articleType} video=${doc.videoUrl ? "あり" : "なし"} blocks=${(doc.content as unknown[]).length} src=${doc._source}`
        : doc._type === "quest"
          ? ` questNumber=${doc.questNumber} articles=${(doc.articles as unknown[]).length} goal=${doc.goal ?? ""}`
          : ` isHidden=${doc.isHidden} quests=${(doc.quests as unknown[]).length}`;
    console.log(`  ${doc._type.padEnd(7)} ${doc._id.padEnd(22)} slug=${slug.padEnd(26)} ${doc.title}${extra}`);
  }
  console.log(
    `\n変換: コードブロック ${stats.codeBlocks} / チェックリスト項目 ${stats.checklistItems} / ネストしたリスト項目 ${stats.nestedItems} / 引用ブロック ${stats.quoteBlocks} / リンク ${stats.links}`,
  );

  const ids = docs.map((d) => d._id);
  const slugs = docs.map((d) => (d.slug as { current: string }).current);
  const existing = await client.fetch<{ _id: string; _type: string; slug?: string }[]>(
    `*[_id in $ids || _id in $draftIds || slug.current in $slugs]{_id, _type, "slug": slug.current}`,
    { ids, draftIds: ids.map((id) => `drafts.${id}`), slugs },
  );
  const foreign = existing.filter((d) => !ids.includes(d._id));
  const sameId = existing.filter((d) => ids.includes(d._id));
  console.log(`衝突チェック: 同じ _id の既存 ${sameId.length} 件 / 別 _id で slug が同じ・draft ${foreign.length} 件`);
  for (const d of existing) console.log(`  既存: ${d._type} ${d._id} slug=${d.slug}`);
  // production では、同じ _id が既にあれば止める（Studio で直した内容を黙って巻き戻さないため。上書きは --overwrite を明示）
  if (PRODUCTION && sameId.length > 0 && !OVERWRITE) {
    throw new Error(`production に同じ _id が ${sameId.length} 件あります。上書きするなら --overwrite を付けてください。中止します`);
  }
  if (foreign.length > 0) {
    throw new Error(`${ID_PREFIX} 以外のドキュメントと slug/draft が衝突しています。書き込みを中止します`);
  }

  for (const doc of articles) {
    if (doc._thumb && !existsSync(doc._thumb)) throw new Error(`${doc._id} のサムネイルがありません: ${doc._thumb}`);
  }
  console.log(`記事サムネイル: ${articles.filter((a) => a._thumb).length} / ${articles.length} 本`);
  if (!existsSync(LESSON_ICON)) throw new Error(`レッスンのアイコン画像がありません: ${LESSON_ICON}`);
  console.log(`レッスンのアイコン: ${LESSON_ICON.split("/").pop()}`);

  if (DRY_RUN) {
    console.log("\nDRY-RUN のため書き込みません");
    return;
  }

  assertDevelopment();
  for (const doc of articles) {
    if (!doc._thumb || !docs.includes(doc)) continue;
    const asset = await client.assets.upload("image", createReadStream(doc._thumb), {
      filename: doc._thumb.split("/").pop(),
    });
    doc.thumbnail = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  }
  console.log("アップロード: 記事サムネイル");
  if (docs.includes(lesson)) {
    const icon = await client.assets.upload("image", createReadStream(LESSON_ICON), { filename: "lesson-icon.jpg" });
    lesson.iconImage = { _type: "image", asset: { _type: "reference", _ref: icon._id } };
  }
  console.log("アップロード: レッスンのアイコン");
  // lesson ↔ quest が相互参照のため、1トランザクションでまとめて作成する
  const tx = client.transaction();
  for (const doc of docs) {
    const { _source, _thumb, ...rest } = doc as Doc & { _thumb?: string };
    void _source;
    void _thumb;
    tx.createOrReplace(rest as Doc);
  }
  const res = await tx.commit();
  console.log(`\n書き込み完了: ${res.results.length} 件 (transactionId=${res.transactionId})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
