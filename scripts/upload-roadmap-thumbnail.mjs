/**
 * ロードマップサムネイル画像をSanityにアップロードし、
 * 全ロードマップに設定するスクリプト
 */

import { createClient } from "@sanity/client";
import { createReadStream } from "fs";
import { basename } from "path";
import dotenv from "dotenv";

// .env.local から環境変数を読み込み
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const IMAGE_PATH = "./public/images/roadmap/dummy-thumbnail.png";

async function main() {
  console.log("🚀 ロードマップサムネイルアップロード開始...\n");

  // 1. 画像をSanityにアップロード
  console.log("📤 画像をアップロード中...");
  const imageAsset = await client.assets.upload("image", createReadStream(IMAGE_PATH), {
    filename: basename(IMAGE_PATH),
  });
  console.log(`✅ アップロード完了: ${imageAsset._id}`);
  console.log(`   URL: ${imageAsset.url}\n`);

  // 2. 全ロードマップを取得
  console.log("📋 ロードマップ一覧を取得中...");
  const roadmaps = await client.fetch(`*[_type == "roadmap"]{ _id, title }`);
  console.log(`   ${roadmaps.length} 件のロードマップを検出\n`);

  // 3. 各ロードマップにサムネイルを設定
  console.log("🔄 サムネイルを設定中...");
  for (const roadmap of roadmaps) {
    await client
      .patch(roadmap._id)
      .set({
        thumbnail: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
        },
      })
      .commit();
    console.log(`   ✅ ${roadmap.title}`);
  }

  console.log("\n🎉 完了！全ロードマップにサムネイルを設定しました。");
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
