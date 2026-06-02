/**
 * Sanity 本番に「AIxUIスタイリング入門」レッスンと、その配下の Quest/Article を
 * 一括投入するスクリプト。
 *
 * 流れ:
 *   1. ローカルの Markdown ファイルを Portable Text に変換
 *   2. Article 7件を create
 *   3. Quest 3件を create（articles 参照付き）
 *   4. Lesson 1件を create（quests 参照付き、isHidden=true で投入）
 *   5. Quest の lesson 参照を後から patch
 *
 * 実行:
 *   npx tsx scripts/import-ai-ui-styling-lesson.ts --dry-run   # 投入せず JSON 出力のみ
 *   npx tsx scripts/import-ai-ui-styling-lesson.ts             # 本番投入
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import crypto from "crypto";
import fs from "fs";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");

const writeToken = process.env.SANITY_WRITE_TOKEN;
if (!writeToken && !DRY_RUN) {
  console.error("⚠️  SANITY_WRITE_TOKEN が必要です（.env.local を確認）");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: writeToken,
  useCdn: false,
});

// ============================================
// 入力データ定義
// ============================================

const DOC_ROOT =
  "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/02_Projects/03AIxAIでUIデザインする実践入門ガイド";
const ISSUES_ROOT =
  "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/issues";

interface ArticleDef {
  key: string;
  questKey: string;
  articleNumber: number;
  title: string;
  slug: string;
  articleType: "intro" | "explain" | "practice" | "challenge" | "demo";
  excerpt: string;
  videoUrl?: string;
  filePath: string;
  /**
   * 本文として抽出する範囲を絞るための関数。
   * 未指定なら frontmatter 除去後の全文を本文とする。
   */
  extractBody?: (raw: string) => string;
  tags: string[];
}

const ARTICLES: ArticleDef[] = [
  {
    key: "q1a1",
    questKey: "q1",
    articleNumber: 1,
    title: "AIにUIを作らせて分かった、これからUIデザインで習得するべきこと",
    slug: "ai-ui-styling-why-intro",
    articleType: "intro",
    excerpt:
      "AIでそれなりのUIが作れる今、スタイリングの勉強はもういらない? 答えはNO。出張申請のSaaS画面を5パターン作って見えた、AI時代に本当に学ぶべき2つのことを、実例とともに解説します。",
    filePath: `${DOC_ROOT}/序章の文章でWHYこのコンテンツが必要かをとう.md`,
    extractBody: (raw) => {
      // 「---」より下、「👇本文」以降を本文とする
      const afterFrontMatter = raw.split(/^---\s*$/m).slice(1).join("---");
      const afterMarker = afterFrontMatter.split("👇本文").slice(-1)[0];
      return afterMarker.trim();
    },
    tags: ["AI", "UIスタイリング", "ディレクション"],
  },
  {
    key: "q2a1",
    questKey: "q2",
    articleNumber: 1,
    title: "土台づくり｜環境構築・ハブページ・パターンA",
    slug: "ai-ui-styling-foundation-pattern-a",
    articleType: "practice",
    excerpt:
      "初学者がAIを使ってUIスタイリングを学ぶ実践シリーズ第1回。環境構築、パターン比較ページ、パターンA（指示なし）を実装し、AIが作ったスタイリングを後から分解して理解するための土台を作ります。",
    videoUrl: "https://vimeo.com/1197228069",
    filePath: `${DOC_ROOT}/動画詳細ページ記事/01_土台づくり_環境構築・ハブページ・パターンA.md`,
    tags: ["AI", "UIスタイリング", "環境構築", "実践"],
  },
  {
    key: "q2a2",
    questKey: "q2",
    articleNumber: 2,
    title: "パターンBをつくる｜ディレクション次第でUIは変わる",
    slug: "ai-ui-styling-pattern-b-direction",
    articleType: "practice",
    excerpt:
      "AIを使ってUIスタイリングを学ぶ実践シリーズ。参考画像をコンポーネント・トークン・ページ全体の3層で分解させる指示を組み立て、パターンB（参考から学ぶver.）を実装。AIに頼って雰囲気を出すのではなく、UIの「普通」を分解して学ぶ土台をつくります。",
    videoUrl: "https://vimeo.com/1197228011",
    filePath: `${DOC_ROOT}/動画詳細ページ記事/02_パターンBをつくる_ディレクション次第でUIは変わる.md`,
    tags: ["AI", "UIスタイリング", "ディレクション", "パターン比較"],
  },
  {
    key: "q2a3",
    questKey: "q2",
    articleNumber: 3,
    title: "スタイリング解説ページをつくる｜なぜこのUIになったかを言語化する",
    slug: "ai-ui-styling-explanation-page",
    articleType: "practice",
    excerpt:
      "AIを使ってUIスタイリングを学ぶ実践シリーズ。生成したパターンの「なぜこのUIになったか」をAIに言語化させて解説ページを作り、画像でビジュアライズまで仕上げます。AIの作業メモリが残っているうちに分解させることで、自分のデザインスキルに変換していくフェーズです。",
    videoUrl: "https://vimeo.com/1197228107",
    filePath: `${DOC_ROOT}/動画詳細ページ記事/03_スタイリング解説ページをつくる_なぜこのUIになったかを言語化する.md`,
    tags: ["AI", "UIスタイリング", "解説", "分解"],
  },
  {
    key: "q2a4",
    questKey: "q2",
    articleNumber: 4,
    title: "design.md を解説する｜マークダウンだけではテイストは作りきれない",
    slug: "ai-ui-styling-design-md",
    articleType: "explain",
    excerpt:
      "AIを使ってUIスタイリングを学ぶ実践シリーズ。パターンDで使う `design.md`（デザインの振る舞いをマークダウンで定義するファイル）を解説します。Stitchなどで流行りつつある形式ですが、文字だけでテイストを作りきるのは難しい前提で、トークンや画像とどう組むかを考えます。",
    videoUrl: "https://vimeo.com/1197228143",
    filePath: `${DOC_ROOT}/動画詳細ページ記事/04_designmdを解説する_マークダウンだけではテイストは作りきれない.md`,
    tags: ["AI", "design.md", "スタイリング"],
  },
  {
    key: "q2a5",
    questKey: "q2",
    articleNumber: 5,
    title:
      "全パターンを比較する｜「作れた」で終わらずコントロールできるまで持っていく",
    slug: "ai-ui-styling-pattern-comparison",
    articleType: "practice",
    excerpt:
      "AIを使ってUIスタイリングを学ぶ実践シリーズ。指示なしAから design.md を使ったパターンまで、生成した全パターンを並べて比較します。AIで「今っぽいUIが作れた」で終わらせず、調整・コントロールできるところまで持っていくために、トークンとコンポーネントの分解が肝になる回です。",
    videoUrl: "https://vimeo.com/1197228177",
    filePath: `${DOC_ROOT}/動画詳細ページ記事/05_全パターンを比較する_「作れた」で終わらずコントロールできるまで持っていく.md`,
    tags: ["AI", "UIスタイリング", "パターン比較", "コントロール"],
  },
  {
    key: "q3a1",
    questKey: "q3",
    articleNumber: 1,
    title: "作成中",
    slug: "ai-ui-styling-coming-soon",
    articleType: "intro",
    excerpt: "このレッスンの続きを準備中です。",
    filePath: `${ISSUES_ROOT}/作成中.....md`,
    tags: ["AI", "UIスタイリング"],
  },
];

interface QuestDef {
  key: string;
  questNumber: number;
  title: string;
  slug: string;
  goal: string;
  description?: string;
}

const QUESTS: QuestDef[] = [
  {
    key: "q1",
    questNumber: 1,
    title: "クエスト1: AIでUI作成して、デザインスキルは上がるの？",
    slug: "ai-ui-styling-q1-why",
    goal: "AIでUIを作る前に、なぜスタイリングのディレクションスキルが必要なのかを理解する",
  },
  {
    key: "q2",
    questNumber: 2,
    title: "クエスト2: AIにUIスタイリングを生成させる",
    slug: "ai-ui-styling-q2-generate",
    goal: "テイスト→ルール→トークン→部品→画面 の構造でAIに指示し、狙ったスタイリングを生成・分解できる状態にする",
  },
  {
    key: "q3",
    questNumber: 3,
    title: "クエスト3: スタイリングシステムをつくり、まなぶ",
    slug: "ai-ui-styling-q3-system",
    goal: "（準備中）",
  },
];

const LESSON_DEF = {
  title: "AIxUIスタイリング入門",
  slug: "ai-ui-styling-intro",
  description:
    "AIでUIの見た目が作れたらそれでおしまいなのか？デザイン力が絡むと変わる出力の差を理解した後に\"UIスタイルのディレクション\"に必要なデザインシステムを習得する入門コンテンツです。",
  isPremium: false,
  isHidden: true, // 安全のため一旦非公開で投入、Studio 確認後に公開に切り替え
  tags: ["AI", "UIスタイリング", "デザインシステム"],
  purposes: [
    "AIにUIスタイリングをディレクションする力を身につける",
    "テイスト→ルール→トークン→部品→画面 という構造を理解する",
    "デザインシステムの基本を入門レベルで習得する",
  ],
};

// ============================================
// Portable Text 変換
// ============================================

function randKey(len = 12): string {
  return crypto.randomBytes(len / 2).toString("hex");
}

type PtSpan = {
  _type: "span";
  _key: string;
  marks: string[];
  text: string;
};

type PtMarkDef = { _key: string; _type: string; href?: string };

type PtBlock = {
  _type: "block";
  _key: string;
  style: string;
  markDefs: PtMarkDef[];
  children: PtSpan[];
  level?: number;
  listItem?: string;
};

/**
 * Markdown ファイルから frontmatter とコメントを除去
 */
function stripMeta(raw: string): string {
  let out = raw;
  // YAML frontmatter (---\n...---\n) を除去
  out = out.replace(/^---\n[\s\S]*?\n---\n?/, "");
  // HTML コメント
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  return out.trim();
}

/**
 * 1行の Markdown 文字列をインラインで解析し、span 配列と markDefs を返す
 */
function parseInline(text: string): { spans: PtSpan[]; markDefs: PtMarkDef[] } {
  const markDefs: PtMarkDef[] = [];
  const tokens: Array<{ marks: string[]; text: string }> = [];

  // 順序: link → bold の順で処理（リンクテキストが太字を含む可能性は今回想定しない）
  // 正規表現でトークン化する: ** ** と [text](url) を抜き出す
  const pattern = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      tokens.push({ marks: [], text: text.slice(lastIndex, m.index) });
    }
    if (m[1]) {
      // リンク [text](url)
      const linkKey = randKey();
      markDefs.push({ _key: linkKey, _type: "link", href: m[3] });
      tokens.push({ marks: [linkKey], text: m[2] });
    } else if (m[4]) {
      // 太字 **text**
      tokens.push({ marks: ["strong"], text: m[5] });
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({ marks: [], text: text.slice(lastIndex) });
  }
  if (tokens.length === 0) {
    tokens.push({ marks: [], text });
  }

  const spans: PtSpan[] = tokens
    .filter((t) => t.text.length > 0)
    .map((t) => ({
      _type: "span",
      _key: randKey(),
      marks: t.marks,
      text: t.text,
    }));

  return { spans, markDefs };
}

function buildBlock(
  text: string,
  style: string,
  opts: { level?: number; listItem?: string } = {}
): PtBlock {
  const { spans, markDefs } = parseInline(text);
  const block: PtBlock = {
    _type: "block",
    _key: randKey(),
    style,
    markDefs,
    children: spans,
  };
  if (opts.level) block.level = opts.level;
  if (opts.listItem) block.listItem = opts.listItem;
  return block;
}

/**
 * Markdown を Portable Text ブロック配列に変換
 */
function markdownToPortableText(md: string): PtBlock[] {
  const lines = stripMeta(md).split("\n");
  const blocks: PtBlock[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ").trim();
    if (text) blocks.push(buildBlock(text, "normal"));
    paragraph = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, ""); // 末尾の空白除去
    const trimmed = line.trim();

    if (!trimmed) {
      flush();
      continue;
    }

    // ヘッダー
    const h = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      flush();
      const level = Math.min(h[1].length, 4);
      blocks.push(buildBlock(h[2], `h${level}`));
      continue;
    }

    // 引用
    const q = trimmed.match(/^>\s?(.*)$/);
    if (q) {
      flush();
      blocks.push(buildBlock(q[1], "blockquote"));
      continue;
    }

    // 箇条書き（- or *）
    const ul = trimmed.match(/^[-*]\s+(.+)$/);
    if (ul) {
      flush();
      blocks.push(buildBlock(ul[1], "normal", { level: 1, listItem: "bullet" }));
      continue;
    }

    // 番号付きリスト
    const ol = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ol) {
      flush();
      blocks.push(buildBlock(ol[1], "normal", { level: 1, listItem: "number" }));
      continue;
    }

    paragraph.push(trimmed);
  }
  flush();

  return blocks;
}

// ============================================
// メイン処理
// ============================================

async function main() {
  console.log(`\n${DRY_RUN ? "🧪 DRY RUN" : "🚀 PRODUCTION"} モードで実行\n`);

  // ---- 既存 slug の重複チェック ----
  const allNewSlugs = [
    LESSON_DEF.slug,
    ...QUESTS.map((q) => q.slug),
    ...ARTICLES.map((a) => a.slug),
  ];
  const existingSlugs = await client.fetch<
    Array<{ _type: string; slug: { current: string } }>
  >(
    `*[_type in ["lesson", "quest", "article"] && slug.current in $slugs]{ _type, slug }`,
    { slugs: allNewSlugs }
  );
  if (existingSlugs.length > 0) {
    console.error("\n⛔ slug の重複があります。中止します:");
    console.error(existingSlugs);
    process.exit(1);
  }
  console.log("✅ slug 重複なし\n");

  // ---- Article を 7件作成 ----
  console.log("=== Articles 作成 ===");
  const articleIds: Record<string, string> = {};
  for (const def of ARTICLES) {
    const raw = fs.readFileSync(def.filePath, "utf8");
    const bodySource = def.extractBody ? def.extractBody(raw) : raw;
    const content = markdownToPortableText(bodySource);

    const doc: Record<string, unknown> = {
      _type: "article",
      title: def.title,
      slug: { _type: "slug", current: def.slug },
      articleNumber: def.articleNumber,
      articleType: def.articleType,
      excerpt: def.excerpt,
      content,
      tags: def.tags,
      isPremium: false,
      publishedAt: new Date().toISOString(),
    };
    if (def.videoUrl) doc.videoUrl = def.videoUrl;

    if (DRY_RUN) {
      console.log(`  📝 [${def.key}] ${def.title}`);
      console.log(
        `     slug=${def.slug}, articleType=${def.articleType}, blocks=${content.length}`
      );
      articleIds[def.key] = `dry-${def.key}`;
    } else {
      const created = await client.create(doc as { _type: string } & Record<string, unknown>);
      articleIds[def.key] = created._id;
      console.log(`  ✅ [${def.key}] _id=${created._id}  ${def.title}`);
    }
  }

  // ---- Quest を 3件作成（articles 参照付き）----
  console.log("\n=== Quests 作成 ===");
  const questIds: Record<string, string> = {};
  for (const def of QUESTS) {
    const articleRefs = ARTICLES.filter((a) => a.questKey === def.key)
      .sort((a, b) => a.articleNumber - b.articleNumber)
      .map((a) => ({
        _key: randKey(),
        _type: "reference",
        _ref: articleIds[a.key],
      }));

    const doc: Record<string, unknown> = {
      _type: "quest",
      title: def.title,
      slug: { _type: "slug", current: def.slug },
      questNumber: def.questNumber,
      goal: def.goal,
      articles: articleRefs,
    };

    if (DRY_RUN) {
      console.log(`  📝 [${def.key}] ${def.title}`);
      console.log(`     slug=${def.slug}, articles=${articleRefs.length}`);
      questIds[def.key] = `dry-${def.key}`;
    } else {
      const created = await client.create(doc as { _type: string } & Record<string, unknown>);
      questIds[def.key] = created._id;
      console.log(`  ✅ [${def.key}] _id=${created._id}  ${def.title}`);
    }
  }

  // ---- Lesson を作成（quests 参照付き）----
  console.log("\n=== Lesson 作成 ===");
  const questRefs = QUESTS.map((q) => ({
    _key: randKey(),
    _type: "reference",
    _ref: questIds[q.key],
  }));

  const lessonDoc: Record<string, unknown> = {
    _type: "lesson",
    title: LESSON_DEF.title,
    slug: { _type: "slug", current: LESSON_DEF.slug },
    description: LESSON_DEF.description,
    isPremium: LESSON_DEF.isPremium,
    isHidden: LESSON_DEF.isHidden,
    tags: LESSON_DEF.tags,
    purposes: LESSON_DEF.purposes,
    quests: questRefs,
  };

  let lessonId = "dry-lesson";
  if (DRY_RUN) {
    console.log(`  📝 ${LESSON_DEF.title}`);
    console.log(
      `     slug=${LESSON_DEF.slug}, isHidden=${LESSON_DEF.isHidden}, quests=${questRefs.length}`
    );
    console.log("\n--- Lesson doc (full) ---");
    console.log(JSON.stringify(lessonDoc, null, 2));
  } else {
    const created = await client.create(lessonDoc);
    lessonId = created._id;
    console.log(`  ✅ _id=${created._id}  ${LESSON_DEF.title}`);
  }

  // ---- Quest の lesson 参照を patch ----
  console.log("\n=== Quest に lesson 参照を patch ===");
  for (const def of QUESTS) {
    if (DRY_RUN) {
      console.log(`  📝 [${def.key}] lesson 参照を ${lessonId} に設定（patch）`);
    } else {
      await client
        .patch(questIds[def.key])
        .set({ lesson: { _type: "reference", _ref: lessonId } })
        .commit();
      console.log(`  ✅ [${def.key}] lesson 参照付与`);
    }
  }

  // ---- まとめ出力 ----
  console.log("\n=== 完了 ===");
  console.log("Lesson:", lessonId);
  console.log("Quests:", JSON.stringify(questIds, null, 2));
  console.log("Articles:", JSON.stringify(articleIds, null, 2));

  if (DRY_RUN) {
    console.log("\nℹ️  DRY RUN なので Sanity には何も書き込まれていません。");
  } else {
    console.log("\n✨ 本番投入完了");
  }
}

main().catch((e) => {
  console.error("\n💥 エラー:", e);
  process.exit(1);
});
