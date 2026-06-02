/**
 * テストデータと思われる userOutput を検索する。
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
  const targets = ["テスト", "あきら"];

  // 完全一致
  const found = await client.fetch(
    `*[_type == "userOutput" && (
      author.displayName in $targets ||
      author.slackAccountName in $targets ||
      author.userId in $targets
    )] {
      _id, _type, articleTitle, articleUrl, author, submittedAt, _createdAt
    } | order(_createdAt desc)`,
    { targets }
  );

  console.log(`=== 完全一致で見つかった件数: ${(found as unknown[])?.length ?? 0} ===\n`);
  console.log(JSON.stringify(found, null, 2));

  // 念のため部分一致でも検索（テストXX、あきらXX 等）
  const partial = await client.fetch(
    `*[_type == "userOutput" && (
      author.displayName match "テスト*" ||
      author.displayName match "*テスト*" ||
      author.displayName match "あきら*" ||
      author.slackAccountName match "テスト*" ||
      author.slackAccountName match "*テスト*" ||
      author.slackAccountName match "あきら*"
    )] {
      _id, articleTitle, articleUrl, author, submittedAt
    } | order(_createdAt desc)`
  );
  console.log(`\n=== 部分一致で見つかった件数: ${(partial as unknown[])?.length ?? 0} ===\n`);
  console.log(JSON.stringify(partial, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
