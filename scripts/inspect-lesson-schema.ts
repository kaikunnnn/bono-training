/**
 * 既存 Sanity Lesson/Quest/Article の構造を確認するための調査スクリプト。
 *
 * 実行: npx tsx scripts/inspect-lesson-schema.ts
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function main() {
  // 1) lessonNumber 一覧と最大値
  const lessonNumbers = await client.fetch<Array<{ _id: string; title: string; lessonNumber: number | null; slug: { current: string } }>>(
    `*[_type == "lesson"] | order(lessonNumber asc){ _id, title, lessonNumber, slug }`
  );
  console.log("=== すべての Lesson (lessonNumber 昇順) ===");
  for (const l of lessonNumbers) {
    console.log(`#${l.lessonNumber ?? "(null)"}  ${l.title}  → slug: ${l.slug?.current}`);
  }
  const maxNumber = lessonNumbers
    .map((l) => l.lessonNumber ?? 0)
    .reduce((m, n) => (n > m ? n : m), 0);
  console.log(`\nmax lessonNumber: ${maxNumber}\n`);

  // 2) サンプル Lesson の全フィールド（最新作成）
  const sampleLesson = await client.fetch(
    `*[_type == "lesson"] | order(_createdAt desc)[0]{ ... }`
  );
  console.log("=== サンプル Lesson (最新作成) の全フィールド ===");
  console.log(JSON.stringify(sampleLesson, null, 2));

  // 3) サンプル Quest
  const sampleQuest = await client.fetch(
    `*[_type == "quest"] | order(_createdAt desc)[0]{ ... }`
  );
  console.log("\n=== サンプル Quest の全フィールド ===");
  console.log(JSON.stringify(sampleQuest, null, 2));

  // 4) サンプル Article（最新）
  const sampleArticle = await client.fetch(
    `*[_type == "article"] | order(_createdAt desc)[0]{ ... }`
  );
  console.log("\n=== サンプル Article の全フィールド ===");
  console.log(JSON.stringify(sampleArticle, null, 2));

  // 5) articleType の取りうる値
  const articleTypes = await client.fetch<string[]>(
    `array::unique(*[_type == "article" && defined(articleType)].articleType)`
  );
  console.log("\n=== 使われている articleType 一覧 ===");
  console.log(articleTypes);

  // 6) tags のサンプル
  const tags = await client.fetch<string[]>(
    `array::unique(*[_type == "lesson" && defined(tags)].tags[])`
  );
  console.log("\n=== Lesson tags サンプル ===");
  console.log(tags?.slice(0, 30));

  // 7) category の選択肢
  const categories = await client.fetch(
    `*[_type == "lessonCategory"]{ _id, title, slug }`
  );
  console.log("\n=== lessonCategory 一覧 ===");
  console.log(JSON.stringify(categories, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
