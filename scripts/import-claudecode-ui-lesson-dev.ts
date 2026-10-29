/**
 * 「体験から組み立てるAI UIデザイン Claude Code入門」レッスンを、確認用の Sanity development dataset にだけ投入する。
 * production dataset には書き込まない（dataset は 'development' に固定。env には依存しない）。
 * 型: scripts/import-cursor-ui-lesson-dev.ts（issues/260 動画1）をコピーして最小変更
 *     変更点はレッスン固有の定数・構成と、本文の Markdown リンク [text](url) → link マーク対応のみ
 *     （リンク対応は scripts/import-ai-ui-styling-lesson.ts の parseInline が前例）
 *
 * 実行:
 *   npx tsx scripts/import-claudecode-ui-lesson-dev.ts --dry-run   # 作成予定一覧と _id/slug の衝突チェックのみ
 *   npx tsx scripts/import-claudecode-ui-lesson-dev.ts             # development へ createOrReplace
 *
 * - 書き込みは createOrReplace で `ccu-` プレフィックスの _id のみ。削除・patch はしない
 * - 元MD: rebono/体験から動くUIをつくるデザイン入門_ClaudeCode/（構成は issues/260 の動画2 構成案 v1）
 * - videoUrl は下書きMDの frontmatter `videoUrl:`（Vimeo）から入れる。無い記事（確認）は未設定
 */
import { createClient } from "@sanity/client";
import crypto from "crypto";
import { config } from "dotenv";
import { createReadStream, existsSync, readdirSync, readFileSync } from "fs";
import { join, resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local"), quiet: true });

const DRY_RUN = process.argv.includes("--dry-run");
const PROJECT_ID = "cqszh4up";
const DATASET = "development";
const ID_PREFIX = "ccu-";
const SLUG_PREFIX = "claudecode-ui-";
const SOURCE_DIR =
  "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/体験から動くUIをつくるデザイン入門_ClaudeCode";
// レッスン画像（動画の画面を切り抜いたもの）。iconImage=表紙(縦2:3) / thumbnail=リンク用(横16:9)
const THUMB_DIR = "/Users/kaitakumi/Documents/01_BONO事業/BONO_動画/10_AIコーディングUIデザイン/thumbnails";
const LESSON_IMAGES = {
  iconImage: join(THUMB_DIR, "claudecode_表紙_2x3.png"),
  thumbnail: join(THUMB_DIR, "claudecode_リンク用_16x9.png"),
};
// 記事サムネイル（各記事の動画から1枚。確認記事は同じクエストの動画から）。ファイル名は {key}_{記事番号}.png
const articleThumbPath = (articleId: string) =>
  join(THUMB_DIR, "articles", `claudecode_${articleId.replace(`${ID_PREFIX}article-`, "")}.png`);
const PLACEHOLDER_TEXT = "（準備中：動画撮影後に作成）";

if (!DRY_RUN && !process.env.SANITY_WRITE_TOKEN) {
  throw new Error("SANITY_WRITE_TOKEN が .env.local にありません");
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: "2024-01-01",
  // dry-run は匿名読み取り（development は公開データセット）。本実行のみ書き込みトークンを使う
  token: DRY_RUN ? undefined : process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// 二重ガード: 万一 config が書き換わっていても development 以外には絶対に書かない
function assertDevelopment() {
  const { dataset, projectId } = client.config();
  if (dataset !== "development") {
    throw new Error(`dataset が development ではありません (${dataset})。中止します`);
  }
  if (projectId !== PROJECT_ID) {
    throw new Error(`projectId が想定外です (${projectId})。中止します`);
  }
}
assertDevelopment();

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

// 下書きMDは本文にh1を持たない（タイトルは frontmatter の title）
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
// 構成（issues/260 動画2 構成案 v1：セクション0〜3＋まとめ）
// ============================================================

type ArticleKind = "intro" | "explain" | "practice" | "challenge" | "demo";
const ARTICLE_KINDS: ArticleKind[] = ["intro", "explain", "practice", "challenge", "demo"];
type ArticleSpec = {
  number: string;
  /** frontmatter の articleType と一致すること（不一致なら中止） */
  kind: ArticleKind;
  /** MDが無い枠のみ */
  placeholder?: { title: string; isPremium: boolean };
};
/** title は frontmatter の section から「セクションN 」を除いたもの（buildDocs で照合） */
type QuestSpec = {
  key: string;
  title: string;
  goal: string;
  folder?: string;
  articles: ArticleSpec[];
};

// goal は issues/260 動画2 構成案 v1 の各セクションの「ゴール」（セクション0・まとめは指示文）
const QUESTS: QuestSpec[] = [
  {
    key: "section0",
    title: "はじめに：Claude Codeで、アイデアを「動くUI」にする",
    goal: "このレッスンの流れとゴールを知る",
    folder: "セクション0",
    articles: [
      { number: "0-1", kind: "intro" },
      { number: "0-2", kind: "challenge" },
    ],
  },
  {
    key: "section1",
    title: "Claude Codeを使える状態にする",
    goal: "Claude Codeがターミナルで動いて、会話ができる",
    folder: "セクション1",
    articles: [
      { number: "1-1", kind: "practice" },
      { number: "1-2", kind: "practice" },
      { number: "1-3", kind: "challenge" },
    ],
  },
  {
    key: "section2",
    title: "ユーザーと体験を伝えて、動くUIをつくる",
    goal: "誰のどんな体験かを伝えて動くUIを作り、頼み方を変えて直せる",
    folder: "セクション2",
    articles: [
      { number: "2-1", kind: "practice" },
      { number: "2-2", kind: "practice" },
      { number: "2-3", kind: "challenge" },
    ],
  },
  {
    key: "section3",
    title: "Claude Codeの6つの基本操作を覚える",
    goal: "6つの基本操作を自分で使える",
    folder: "セクション3",
    articles: [
      { number: "3-1", kind: "practice" },
      { number: "3-2", kind: "practice" },
      { number: "3-3", kind: "practice" },
      { number: "3-4", kind: "practice" },
      { number: "3-5", kind: "challenge" },
    ],
  },
  {
    key: "summary",
    title: "まとめ",
    goal: "できるようになったことを振り返る",
    folder: "まとめ",
    articles: [{ number: "4-1", kind: "intro" }],
  },
];

const LESSON_ID = `${ID_PREFIX}lesson`;
const LESSON_SLUG = "claudecode-ui-design-intro";
const PUBLISHED_AT = "2026-10-26T00:00:00.000Z";

// issues/260「動画2の把握」のゴール（Claude Codeを使えるようにする／動くTodoサービスで「自分でも作れる」）と構成案v1から。誇張しない
const LESSON_DESCRIPTION =
  "Claude Codeを使える状態にして、ユーザーと体験のゴールを伝えて動くTodoサービスをつくるレッスンです。頼み方を変えて直す方法と、Claude Codeの6つの基本操作も覚えます。";
const LESSON_PURPOSES = [
  "Claude Codeをいつでも使える状態にする",
  "誰のどんな体験かを伝えて、動くUIをつくれるようになる",
  "頼み方を変えて直し、Claude Codeの基本操作を自分で使えるようになる",
];

function findSourceFile(folder: string, number: string): string {
  const dir = join(SOURCE_DIR, folder);
  const hits = readdirSync(dir).filter((f) => f.startsWith(`${number}_`) && f.endsWith(".md"));
  if (hits.length !== 1) throw new Error(`${folder}/${number}_*.md が ${hits.length} 件見つかりました`);
  return join(dir, hits[0]);
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
  const articles: Doc[] = [];
  const quests: Doc[] = [];

  // 下書きフォルダの .md が全て構成に含まれているか（取りこぼし防止）
  for (const questSpec of QUESTS) {
    const mdFiles = readdirSync(join(SOURCE_DIR, questSpec.folder!)).filter((f) => f.endsWith(".md"));
    if (mdFiles.length !== questSpec.articles.length) {
      throw new Error(`${questSpec.folder}: .md ${mdFiles.length} 件と構成 ${questSpec.articles.length} 件が一致しません`);
    }
  }

  QUESTS.forEach((questSpec, questIndex) => {
    const questId = `${ID_PREFIX}quest-${questSpec.key}`;
    const articleIds: string[] = [];

    questSpec.articles.forEach((spec, articleIndex) => {
      let title: string;
      let isPremium: boolean;
      let content: ContentNode[];
      let source: string;
      let videoUrl: string | undefined;

      if (spec.placeholder) {
        title = spec.placeholder.title;
        isPremium = spec.placeholder.isPremium;
        content = [block(PLACEHOLDER_TEXT)];
        source = "(placeholder)";
      } else {
        const file = findSourceFile(questSpec.folder!, spec.number);
        const { fm, body } = parseFrontmatter(readFileSync(file, "utf8"));
        if (fm.number !== spec.number) {
          throw new Error(`${file}: frontmatter number (${fm.number}) が ${spec.number} と一致しません`);
        }
        if (!fm.title || !fm.type) throw new Error(`${file}: title/type がありません`);
        if (!/^(無料|有料)/.test(fm.type)) throw new Error(`${file}: type が無料/有料で始まりません (${fm.type})`);
        if (!ARTICLE_KINDS.includes(fm.articleType as ArticleKind) || fm.articleType !== spec.kind) {
          throw new Error(`${file}: articleType (${fm.articleType}) が構成 (${spec.kind}) と一致しません`);
        }
        const sectionTitle = (fm.section ?? "").replace(/^セクション\d+\s+/, "");
        if (sectionTitle !== questSpec.title) {
          throw new Error(`${file}: section (${fm.section}) が Quest タイトル (${questSpec.title}) と一致しません`);
        }
        title = fm.title;
        isPremium = fm.type.startsWith("有料");
        content = markdownToPortableText(body, stats);
        checkLinks(content, stats, file);
        source = file.slice(SOURCE_DIR.length + 1);
        if (fm.videoUrl) {
          if (!/^https:\/\/vimeo\.com\/\d+$/.test(fm.videoUrl)) {
            throw new Error(`${file}: videoUrl が Vimeo の形式ではありません (${fm.videoUrl})`);
          }
          videoUrl = fm.videoUrl;
        }
      }
      // 今回のレッスンは全記事無料
      if (isPremium) throw new Error(`${spec.number}: isPremium=true になっています（全記事無料の想定）`);

      const id = `${ID_PREFIX}article-${spec.number}`;
      articleIds.push(id);
      const excerpt = spec.placeholder ? undefined : excerptFrom(content);
      articles.push({
        _id: id,
        _type: "article",
        articleNumber: articleIndex + 1,
        contentType: "text",
        articleType: spec.kind,
        isPremium,
        title,
        slug: { _type: "slug", current: `${SLUG_PREFIX}${spec.number}` },
        ...(excerpt ? { excerpt } : {}),
        ...(videoUrl ? { videoUrl } : {}),
        author: "bono",
        publishedAt: PUBLISHED_AT,
        content,
        _source: source,
      });
    });

    quests.push({
      _id: questId,
      _type: "quest",
      questNumber: questIndex + 1, // schema: min(1)。1〜8（セクション0 = 1）
      title: questSpec.title,
      slug: { _type: "slug", current: `${SLUG_PREFIX}quest-${questSpec.key}` },
      goal: questSpec.goal,
      lesson: { _type: "reference", _ref: LESSON_ID },
      articles: articleIds.map(ref),
    });
  });

  const lesson: Doc = {
    _id: LESSON_ID,
    _type: "lesson",
    title: "体験から組み立てるAI UIデザイン Claude Code入門",
    subtitle: "ステップ2｜ユーザーと体験のゴールを伝えて、数分で体験の全体像を確かめる",
    slug: { _type: "slug", current: LESSON_SLUG },
    description: LESSON_DESCRIPTION,
    purposes: LESSON_PURPOSES,
    isPremium: false,
    // development では一覧に出して確認する（本番投入時は別途決める）。一覧のAIセクションは tags の "AI" で振り分けられる
    isHidden: false,
    tags: ["AI", "Claude Code"],
    quests: quests.map((q) => ref(q._id)),
  };

  return { articles, quests, lesson, stats };
}

// ============================================================
// Main
// ============================================================

async function main() {
  const { articles, quests, lesson, stats } = buildDocs();
  const docs: Doc[] = [...articles, ...quests, lesson];

  for (const doc of docs) {
    if (!doc._id.startsWith(ID_PREFIX)) throw new Error(`_id に ${ID_PREFIX} が付いていません: ${doc._id}`);
  }

  console.log(`Dataset: ${client.config().dataset} / mode: ${DRY_RUN ? "DRY-RUN" : "WRITE"}`);
  console.log(`作成予定: lesson 1 / quest ${quests.length} / article ${articles.length}（計 ${docs.length}）\n`);
  for (const doc of docs) {
    const slug = (doc.slug as { current: string }).current;
    const extra =
      doc._type === "article"
        ? ` premium=${doc.isPremium} type=${doc.articleType} blocks=${(doc.content as unknown[]).length} src=${doc._source}`
        : doc._type === "quest"
          ? ` questNumber=${doc.questNumber} articles=${(doc.articles as unknown[]).length} goal=${doc.goal}`
          : ` isHidden=${doc.isHidden} quests=${(doc.quests as unknown[]).length}`;
    console.log(`  ${doc._type.padEnd(7)} ${doc._id.padEnd(22)} slug=${slug.padEnd(28)} ${doc.title}${extra}`);
  }
  console.log(
    `\n変換: コードブロック ${stats.codeBlocks} / チェックリスト項目 ${stats.checklistItems} / ネストしたリスト項目 ${stats.nestedItems} / 引用ブロック ${stats.quoteBlocks} / リンク ${stats.links}`,
  );
  console.log(`lesson.description (${(lesson.description as string).length}字): ${lesson.description}`);
  console.log(`lesson.purposes: ${(lesson.purposes as string[]).join(" / ")}\n`);

  // 衝突チェック: ccu- 以外の既存ドキュメントと slug が被っていないか / 既存の ccu- ドキュメントの有無
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
  if (foreign.length > 0) {
    throw new Error(`${ID_PREFIX} 以外のドキュメントと slug/draft が衝突しています。書き込みを中止します`);
  }
  if (sameId.length > 0 && DRY_RUN) {
    console.log("  ※ 同じ _id は本スクリプトの過去の投入分。本実行では createOrReplace で上書きされます");
  }

  for (const [field, path] of Object.entries(LESSON_IMAGES)) {
    if (!existsSync(path)) throw new Error(`lesson.${field} の画像がありません: ${path}`);
    console.log(`lesson.${field}: ${path}`);
  }
  for (const doc of articles) {
    const path = articleThumbPath(doc._id);
    if (!existsSync(path)) throw new Error(`${doc._id} のサムネイルがありません: ${path}`);
  }
  console.log(`記事サムネイル: ${articles.length} 本すべて画像あり（${join(THUMB_DIR, "articles")}）`);

  if (DRY_RUN) {
    console.log("\nDRY-RUN のため書き込みません");
    return;
  }

  assertDevelopment();
  // 画像をアップロードして lesson に付ける（同じ画像は Sanity 側で重複せず同じ asset になる）
  for (const [field, path] of Object.entries(LESSON_IMAGES)) {
    const asset = await client.assets.upload("image", createReadStream(path), {
      filename: path.split("/").pop(),
    });
    lesson[field] = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
    console.log(`アップロード: lesson.${field} → ${asset._id}`);
  }
  for (const doc of articles) {
    const path = articleThumbPath(doc._id);
    const asset = await client.assets.upload("image", createReadStream(path), {
      filename: path.split("/").pop(),
    });
    doc.thumbnail = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  }
  console.log(`アップロード: 記事サムネイル ${articles.length} 本`);
  // lesson ↔ quest が相互参照のため、1トランザクションでまとめて作成する
  const tx = client.transaction();
  for (const doc of docs) {
    const { _source, ...rest } = doc;
    void _source;
    tx.createOrReplace(rest as Doc);
  }
  const res = await tx.commit();
  console.log(`\n書き込み完了: ${res.results.length} 件 (transactionId=${res.transactionId})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
