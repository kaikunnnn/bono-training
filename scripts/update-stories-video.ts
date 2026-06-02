/**
 * 既存の story 23件に対応する article から videoUrl/videoDuration をコピー
 *
 * 実行: npx tsx scripts/update-stories-video.ts [--dry-run]
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

  // story の slug 一覧
  const stories: { _id: string; slug: string }[] = await client.fetch(
    `*[_type == "story"]{ _id, "slug": slug.current }`
  );

  console.log(`対象: ${stories.length}件\n`);

  let updated = 0;
  let skipped = 0;

  for (const story of stories) {
    // 同じ slug の article から videoUrl, videoDuration を取得
    const article: { videoUrl?: string; videoDuration?: string } | null =
      await client.fetch(
        `*[_type == "article" && slug.current == $slug][0]{videoUrl, videoDuration}`,
        { slug: story.slug }
      );

    if (!article?.videoUrl) {
      console.log(`⏭  ${story.slug} → article に videoUrl なし`);
      skipped++;
      continue;
    }

    console.log(`📹 ${story.slug}`);
    console.log(`   videoUrl: ${article.videoUrl}`);
    console.log(`   videoDuration: ${article.videoDuration || "(なし)"}`);

    if (DRY_RUN) {
      console.log(`   ⏭ DRY RUN: スキップ`);
      continue;
    }

    await client
      .patch(story._id)
      .set({
        videoUrl: article.videoUrl,
        videoDuration: article.videoDuration,
      })
      .commit();
    console.log(`   ✅ 更新完了`);
    updated++;
  }

  console.log(`\n=== 完了 ===`);
  console.log(`更新: ${updated} / スキップ: ${skipped} / 全 ${stories.length}`);
}

main().catch(console.error);
