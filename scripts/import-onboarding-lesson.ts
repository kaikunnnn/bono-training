/**
 * Sanity 本番に「BONOのはじめかた（オンボーディング）」レッスンと、その配下の
 * Quest 3件 / Article 7件を一括投入する土台スクリプト。
 *
 * 本文はまだ土台（短いプレースホルダ）。文言・URLは Studio で後から詰める前提。
 * 安全のため lesson は isHidden=true で投入し、Studio 確認後に公開へ切り替える。
 *
 * 構成（ユーザー指定）:
 *   Q1 サービスの基本機能を使えるようになる
 *     1. コンテンツを"完了"させてみよう
 *     2. Slackコミュニティに入ろう
 *   Q2 トレーニング計画を立てよう
 *     3. まず取り組むコンテンツを決めよう
 *     4. 2週間以内に進める時間をセットしよう
 *   Q3 アクションしてみよう
 *     5. 自己紹介を投稿しよう
 *     6. 相談・質問をしてみよう
 *     7. （番外）フィードバックを依頼しよう
 *
 * 実行:
 *   npx tsx scripts/import-onboarding-lesson.ts --dry-run   # 投入せず内容を出力
 *   npx tsx scripts/import-onboarding-lesson.ts             # 本番投入（SANITY_WRITE_TOKEN 必須）
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import crypto from "crypto";
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

interface ArticleDef {
  key: string;
  questKey: string;
  articleNumber: number;
  title: string;
  slug: string;
  articleType: "intro" | "explain" | "practice" | "challenge" | "demo";
  excerpt: string;
  /** 本文（markdown。土台の短いプレースホルダ） */
  body: string;
  tags: string[];
}

const TAGS = ["オンボーディング", "はじめかた"];

const ARTICLES: ArticleDef[] = [
  {
    key: "q1a1",
    questKey: "q1",
    articleNumber: 1,
    title: "コンテンツを”完了”させてみよう",
    slug: "bono-onboarding-a1-complete-content",
    articleType: "practice",
    excerpt:
      "BONOの学習は「コンテンツを進めて完了させる」のが基本。まずは1つ、最後まで進めて『完了』にしてみましょう。",
    body: [
      "BONOの学習は、コンテンツを進めて **完了** させていくのが基本です。",
      "まずは気になるコンテンツを1つ開いて、最後まで進めて「完了」にしてみましょう。完了のやり方と、進捗がどこに記録されるかをここで体験します。",
      "（※このステップの詳しい手順は準備中です）",
    ].join("\n\n"),
    tags: TAGS,
  },
  {
    key: "q1a2",
    questKey: "q1",
    articleNumber: 2,
    title: "Slackコミュニティに入ろう",
    slug: "bono-onboarding-a2-join-slack",
    articleType: "practice",
    excerpt:
      "BONOにはSlackコミュニティがあります。まず参加して、雰囲気をのぞいてみましょう。",
    body: [
      "BONOには Slack のコミュニティがあります。質問したり、他のメンバーの取り組みを見たりできる場所です。",
      "まずは参加して、チャンネルをのぞいてみましょう。",
      "（※参加リンク・手順は準備中です）",
    ].join("\n\n"),
    tags: TAGS,
  },
  {
    key: "q2a1",
    questKey: "q2",
    articleNumber: 1,
    title: "まず取り組むコンテンツを決めよう",
    slug: "bono-onboarding-a3-choose-content",
    articleType: "practice",
    excerpt:
      "迷わないように、最初に取り組むコンテンツを1つだけ決めます。",
    body: [
      "やることが多くて迷わないように、最初に取り組むコンテンツを **1つだけ** 決めます。",
      "ロードマップやレッスン一覧から、いま一番やりたいものを選びましょう。",
      "（※選び方のガイドは準備中です）",
    ].join("\n\n"),
    tags: TAGS,
  },
  {
    key: "q2a2",
    questKey: "q2",
    articleNumber: 2,
    title: "2週間以内に進める時間をセットしよう",
    slug: "bono-onboarding-a4-set-time",
    articleType: "practice",
    excerpt:
      "「いつやるか」を決めると学習は続きます。次の2週間の予定を押さえましょう。",
    body: [
      "学習は「いつやるか」を決めると続きます。",
      "次の2週間で、コンテンツに取り組む時間をカレンダーに入れましょう。",
      "（※おすすめの進め方は準備中です）",
    ].join("\n\n"),
    tags: TAGS,
  },
  {
    key: "q3a1",
    questKey: "q3",
    articleNumber: 1,
    title: "自己紹介を投稿しよう",
    slug: "bono-onboarding-a5-self-intro",
    articleType: "practice",
    excerpt: "コミュニティで最初のアクション。自己紹介を投稿してみましょう。",
    body: [
      "コミュニティで最初のアクションを起こしてみましょう。",
      "まずは自己紹介を投稿します。かんたんな内容でOKです。",
      "（※投稿先・テンプレは準備中です）",
    ].join("\n\n"),
    tags: TAGS,
  },
  {
    key: "q3a2",
    questKey: "q3",
    articleNumber: 2,
    title: "相談・質問をしてみよう",
    slug: "bono-onboarding-a6-ask-question",
    articleType: "practice",
    excerpt:
      "わからないことは掲示板で質問できます。1回やってみると学習が一気に進みます。",
    body: [
      "わからないことは掲示板で質問できます。小さな疑問でOKです。",
      "1回やってみると、聞くことに慣れて学習が一気に進みます。",
      "（※質問の投稿手順は準備中です）",
    ].join("\n\n"),
    tags: TAGS,
  },
  {
    key: "q3a3",
    questKey: "q3",
    articleNumber: 3,
    title: "（番外）フィードバックを依頼しよう",
    slug: "bono-onboarding-a7-request-feedback",
    articleType: "challenge",
    excerpt:
      "アウトプットができたら、フィードバックを依頼してみましょう。（番外編）",
    body: [
      "アウトプットができたら、フィードバックを依頼してみましょう。（番外編）",
      "他の人の視点をもらうと、次に伸ばすところが見えてきます。",
      "（※依頼フローは準備中です）",
    ].join("\n\n"),
    tags: TAGS,
  },
];

interface QuestDef {
  key: string;
  questNumber: number;
  title: string;
  slug: string;
  goal: string;
}

const QUESTS: QuestDef[] = [
  {
    key: "q1",
    questNumber: 1,
    title: "サービスの基本機能を使えるようになる",
    slug: "bono-onboarding-q1-basics",
    goal: "コンテンツの完了とコミュニティ参加で、BONOの基本操作に慣れる",
  },
  {
    key: "q2",
    questNumber: 2,
    title: "トレーニング計画を立てよう",
    slug: "bono-onboarding-q2-plan",
    goal: "取り組むコンテンツと時間を決めて、2週間の学習計画をつくる",
  },
  {
    key: "q3",
    questNumber: 3,
    title: "アクションしてみよう",
    slug: "bono-onboarding-q3-action",
    goal: "自己紹介・質問・フィードバック依頼で、コミュニティで最初のアクションを起こす",
  },
];

const LESSON_DEF = {
  title: "BONOのはじめかた",
  slug: "bono-onboarding",
  description:
    "課金したら最初にやる7ステップ。基本機能・トレーニング計画・最初のアクションを一気に整える、新メンバーのためのオンボーディングです。",
  isPremium: false,
  isHidden: true, // 安全のため一旦非公開で投入、Studio 確認後に公開へ
  tags: TAGS,
  purposes: [
    "サービスの基本機能を使えるようになる",
    "自分のトレーニング計画を立てる",
    "コミュニティで最初のアクションを起こす",
  ],
};

// ============================================
// Portable Text 変換（import-ai-ui-styling-lesson.ts と同じ実装）
// ============================================

function randKey(len = 12): string {
  return crypto.randomBytes(len / 2).toString("hex");
}

type PtSpan = { _type: "span"; _key: string; marks: string[]; text: string };
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

function parseInline(text: string): { spans: PtSpan[]; markDefs: PtMarkDef[] } {
  const markDefs: PtMarkDef[] = [];
  const tokens: Array<{ marks: string[]; text: string }> = [];
  const pattern = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      tokens.push({ marks: [], text: text.slice(lastIndex, m.index) });
    }
    if (m[1]) {
      const linkKey = randKey();
      markDefs.push({ _key: linkKey, _type: "link", href: m[3] });
      tokens.push({ marks: [linkKey], text: m[2] });
    } else if (m[4]) {
      tokens.push({ marks: ["strong"], text: m[5] });
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({ marks: [], text: text.slice(lastIndex) });
  }
  if (tokens.length === 0) tokens.push({ marks: [], text });
  const spans: PtSpan[] = tokens
    .filter((t) => t.text.length > 0)
    .map((t) => ({ _type: "span", _key: randKey(), marks: t.marks, text: t.text }));
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

function markdownToPortableText(md: string): PtBlock[] {
  const lines = md.split("\n");
  const blocks: PtBlock[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ").trim();
    if (text) blocks.push(buildBlock(text, "normal"));
    paragraph = [];
  };
  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flush();
      continue;
    }
    const h = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      flush();
      const level = Math.min(h[1].length, 4);
      blocks.push(buildBlock(h[2], `h${level}`));
      continue;
    }
    const ul = trimmed.match(/^[-*]\s+(.+)$/);
    if (ul) {
      flush();
      blocks.push(buildBlock(ul[1], "normal", { level: 1, listItem: "bullet" }));
      continue;
    }
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

  // ---- Article 7件 ----
  console.log("=== Articles 作成 ===");
  const articleIds: Record<string, string> = {};
  for (const def of ARTICLES) {
    const content = markdownToPortableText(def.body);
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
    if (DRY_RUN) {
      console.log(`  📝 [${def.key}] ${def.title}`);
      console.log(
        `     slug=${def.slug}, type=${def.articleType}, blocks=${content.length}`
      );
      articleIds[def.key] = `dry-${def.key}`;
    } else {
      const created = await client.create(
        doc as { _type: string } & Record<string, unknown>
      );
      articleIds[def.key] = created._id;
      console.log(`  ✅ [${def.key}] _id=${created._id}  ${def.title}`);
    }
  }

  // ---- Quest 3件（articles 参照付き）----
  console.log("\n=== Quests 作成 ===");
  const questIds: Record<string, string> = {};
  for (const def of QUESTS) {
    const articleRefs = ARTICLES.filter((a) => a.questKey === def.key)
      .sort((a, b) => a.articleNumber - b.articleNumber)
      .map((a) => ({ _key: randKey(), _type: "reference", _ref: articleIds[a.key] }));
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
      const created = await client.create(
        doc as { _type: string } & Record<string, unknown>
      );
      questIds[def.key] = created._id;
      console.log(`  ✅ [${def.key}] _id=${created._id}  ${def.title}`);
    }
  }

  // ---- Lesson（quests 参照付き）----
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
  } else {
    const created = await client.create(lessonDoc);
    lessonId = created._id;
    console.log(`  ✅ _id=${created._id}  ${LESSON_DEF.title}`);
  }

  // ---- Quest に lesson 参照を patch ----
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

  console.log("\n=== 完了 ===");
  console.log("Lesson:", lessonId, `(slug: ${LESSON_DEF.slug})`);
  console.log("先頭記事 slug:", ARTICLES[0].slug, "→ /contents/" + ARTICLES[0].slug);
  if (DRY_RUN) {
    console.log("\nℹ️  DRY RUN なので Sanity には何も書き込まれていません。");
  } else {
    console.log("\n✨ 本番投入完了（isHidden=true。Studioで確認後に公開へ）");
  }
}

main().catch((e) => {
  console.error("\n💥 エラー:", e);
  process.exit(1);
});
