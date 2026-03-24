/**
 * 外部リンクのテストデータを追加するスクリプト
 *
 * UIUXデザイナー転職ロードマップのStep 6 Section 2に
 * テスト用の外部リンクを追加する
 *
 * 使い方:
 * npx tsx scripts/add-external-links-test.ts
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: "sanity-studio/.env" });

const projectId = process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || "production";
const token = process.env.SANITY_TOKEN || process.env.SANITY_AUTH_TOKEN || process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("❌ 環境変数が設定されていません");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

console.log(`🔧 Sanity接続: ${projectId} / ${dataset}`);

// テスト用外部リンク
const TEST_EXTERNAL_LINKS = [
  {
    _key: "ext-link-1",
    _type: "externalLink",
    url: "https://www.wantedly.com/",
    title: "Wantedly",
    description: "デザイナー求人が多い転職サービス。カジュアル面談から始められます。",
    thumbnailUrl: "https://www.wantedly.com/ogp.png",
  },
  {
    _key: "ext-link-2",
    _type: "externalLink",
    url: "https://note.com/",
    title: "note",
    description: "ポートフォリオの説明記事を書いたり、デザイナーの転職体験記を読むのに便利。",
    thumbnailUrl: null,
  },
  {
    _key: "ext-link-3",
    _type: "externalLink",
    url: "https://www.figma.com/community",
    title: "Figma Community",
    description: "他のデザイナーの作品を参考にしたり、テンプレートを活用できます。",
    thumbnailUrl: null,
  },
];

async function main() {
  console.log("\n📋 外部リンクのテストデータを追加します...\n");

  // 1. UIUXデザイナー転職ロードマップを取得
  const roadmap = await client.fetch<{
    _id: string;
    title: string;
    steps: Array<{
      _key: string;
      title: string;
      sections: Array<{
        _key: string;
        title: string;
        description?: string;
        contents?: Array<any>;
      }>;
    }>;
  }>(
    `*[_type == "roadmap" && slug.current == "uiux-career-change"][0] {
      _id,
      title,
      steps
    }`
  );

  if (!roadmap) {
    console.error("❌ ロードマップが見つかりません");
    process.exit(1);
  }

  console.log(`🎯 対象: ${roadmap.title}`);
  console.log(`   ステップ数: ${roadmap.steps.length}\n`);

  // 2. Step 6 Section 2を探す
  const step6Index = 5; // 0-indexed
  const section2Index = 1; // 0-indexed

  const step6 = roadmap.steps[step6Index];
  if (!step6) {
    console.error("❌ Step 6が見つかりません");
    process.exit(1);
  }

  console.log(`   Step 6: ${step6.title}`);
  console.log(`   セクション数: ${step6.sections?.length || 0}`);

  // Section 2がなければ作成、あれば更新
  if (!step6.sections || step6.sections.length < 2) {
    console.log("   ⚠️ Section 2が存在しないため、作成します");
    if (!step6.sections) {
      step6.sections = [];
    }
    step6.sections.push({
      _key: "section-5-1",
      title: "転職活動の準備",
      description: "求人探しや面接準備に役立つリソース",
      contents: TEST_EXTERNAL_LINKS,
    });
  } else {
    const section2 = step6.sections[section2Index];
    console.log(`   Section 2: ${section2.title}`);
    console.log(`   現在のコンテンツ数: ${section2.contents?.length || 0}`);

    // 既存のコンテンツに追加
    section2.contents = [
      ...(section2.contents || []),
      ...TEST_EXTERNAL_LINKS,
    ];
  }

  // 3. 更新を保存
  const updatedSteps = [...roadmap.steps];
  updatedSteps[step6Index] = step6;

  console.log("\n💾 保存中...");
  await client
    .patch(roadmap._id)
    .set({ steps: updatedSteps })
    .commit();

  console.log("✅ 保存成功！\n");

  // 4. 確認
  console.log("📋 追加した外部リンク:");
  TEST_EXTERNAL_LINKS.forEach((link, i) => {
    console.log(`   ${i + 1}. ${link.title}`);
    console.log(`      URL: ${link.url}`);
    console.log(`      説明: ${link.description}`);
  });

  console.log("\n🎉 完了！");
  console.log("   /dev/roadmap-preview/uiux-career-change で確認してください。\n");
}

main().catch(console.error);
