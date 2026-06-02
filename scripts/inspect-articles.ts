/**
 * lesson "dezainanokiyaria" 配下の article を取得し、
 * 除外リストを適用してインポート候補をリストアップ。
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

const LESSON_SLUG = "dezainanokiyaria";

// BON-327 コメント c9a6bd84 で指定された除外記事（タイトル部分マッチ）
// + ユーザー追加除外（ラジオ3本・一般ハウツー1本）
const EXCLUDE_TITLE_PATTERNS = [
  "未経験からフリーランスUIデザイナーになるステップ",
  "Webデザインの価値を上げる方法",
  "ビジュアルが良くても採用が通過されない理由",
  "デザインで仕事を得られるスキル基準",
  "資産化",
  "デザイナーの相場",
  "デザイナーが自分に合う会社を見分ける方法",
  "ファーストキャリアはデザイン組織化された会社",
  // 追加除外（インタビューではない・ラジオ系）
  "ほぼラジオ",
];

async function main() {
  // lesson 配下の quest を経由して article を取得
  const articles = await client.fetch(
    `
    *[_type == "article" && quest->lesson->slug.current == $lessonSlug]
    | order(publishedAt desc, _createdAt desc) {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      _createdAt,
      excerpt,
      tags,
      author,
      isPremium,
      "thumbnailUrl": thumbnail.asset->url,
      thumbnailUrl,
      "questTitle": quest->title,
      "lessonTitle": quest->lesson->title
    }
  `,
    { lessonSlug: LESSON_SLUG }
  );

  console.log(`=== lesson "${LESSON_SLUG}" 配下の article ===`);
  console.log("総件数:", articles.length);
  console.log("");

  // 除外チェック
  const included: typeof articles = [];
  const excluded: { title: string; reason: string }[] = [];

  for (const a of articles) {
    const excludePattern = EXCLUDE_TITLE_PATTERNS.find((p) => a.title.includes(p));
    if (excludePattern) {
      excluded.push({ title: a.title, reason: excludePattern });
    } else {
      included.push(a);
    }
  }

  console.log(`--- インポート対象 (${included.length}件) ---`);
  for (const a of included) {
    const date = a.publishedAt ? a.publishedAt.slice(0, 10) : a._createdAt?.slice(0, 10) ?? "?";
    const hasThumb = a.thumbnailUrl ? "🖼" : "❌";
    console.log(`${hasThumb} [${date}] ${a.title}`);
    console.log(`   slug: ${a.slug}`);
  }

  console.log(`\n--- 除外 (${excluded.length}件) ---`);
  for (const e of excluded) {
    console.log(`× ${e.title}`);
    console.log(`   reason: matched "${e.reason}"`);
  }

  // サマリー
  const withThumb = included.filter((a) => a.thumbnailUrl).length;
  const withPublished = included.filter((a) => a.publishedAt).length;
  console.log(`\n=== サマリー ===`);
  console.log(`総件数: ${articles.length}`);
  console.log(`インポート対象: ${included.length}`);
  console.log(`  └ thumbnail あり: ${withThumb}`);
  console.log(`  └ publishedAt あり: ${withPublished}`);
  console.log(`除外: ${excluded.length}`);
}

main().catch(console.error);
