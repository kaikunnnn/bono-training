/**
 * 既存 story 23件に対応する article から isPremium をコピー
 *
 * 実行: npx tsx scripts/update-stories-premium.ts [--dry-run]
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");

const writeToken = process.env.SANITY_WRITE_TOKEN;
if (!writeToken && !DRY_RUN) {
  console.error("⚠️  SANITY_WRITE_TOKEN が必要です");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: writeToken,
  useCdn: false,
});

async function main() {
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  const stories: { _id: string; slug: string }[] = await client.fetch(
    `*[_type == "story"]{ _id, "slug": slug.current }`
  );
  console.log(`対象: ${stories.length}件\n`);

  let updated = 0;
  let skipped = 0;
  let freeCount = 0;
  let premiumCount = 0;

  for (const story of stories) {
    const article: { isPremium?: boolean } | null = await client.fetch(
      `*[_type == "article" && slug.current == $slug][0]{isPremium}`,
      { slug: story.slug }
    );

    if (!article) {
      console.log(`⏭  ${story.slug} → article 不在`);
      skipped++;
      continue;
    }

    const isPremium = article.isPremium ?? false;
    const label = isPremium ? "🔒 有料" : "🆓 無料";
    console.log(`${label}  ${story.slug}  → isPremium=${isPremium}`);

    if (isPremium) premiumCount++;
    else freeCount++;

    if (DRY_RUN) continue;

    await client.patch(story._id).set({ isPremium }).commit();
    updated++;
  }

  console.log(`\n=== 完了 ===`);
  console.log(`更新: ${updated} / スキップ: ${skipped} / 全 ${stories.length}`);
  console.log(`内訳: 🔒 有料 ${premiumCount} / 🆓 無料 ${freeCount}`);
}

main().catch(console.error);
