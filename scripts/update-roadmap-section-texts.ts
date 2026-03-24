/**
 * ロードマップのセクションテキストを更新するスクリプト
 *
 * UIUXデザイナー転職ロードマップのステップ2-5のセクションタイトル・説明を
 * ゴール指向の文言に更新する
 *
 * 使い方:
 * npx tsx scripts/update-roadmap-section-texts.ts
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";

// 複数の.envファイルを読み込み
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

// ステップごとの新しいセクションテキスト
// ゴール指向の文言に変更
const STEP_SECTION_UPDATES = [
  {
    stepIndex: 1, // Step 2: UIデザイン入門
    sectionIndex: 0,
    title: "Figmaの基本操作とUIトレースを習得",
    description: "デザインツールの使い方を身につけ、実際のUIを観察・再現する力を養います。",
  },
  {
    stepIndex: 2, // Step 3: UIビジュアル入門
    sectionIndex: 0,
    title: "UIの見た目を設計する基礎力を習得",
    description: "サイズ・余白・配色・タイポグラフィなど、UIビジュアルの基本原則を学びます。",
  },
  {
    stepIndex: 3, // Step 4: 情報設計基礎
    sectionIndex: 0,
    title: "使いやすいUIを設計する力を習得",
    description: "OOUI・ナビゲーション設計など、情報を整理し配置する考え方を学びます。",
  },
  {
    stepIndex: 4, // Step 5: UXデザイン基礎
    sectionIndex: 0,
    title: "顧客中心のデザインプロセスを習得",
    description: "ユーザーインタビューから課題発見、価値定義までの実践的なUXデザインを学びます。",
  },
];

async function main() {
  console.log("\n📋 セクションテキストの更新を開始します...\n");

  // 1. UIUXデザイナー転職ロードマップを取得
  console.log("🔍 ロードマップを取得中...");
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
        contents?: Array<{ _key: string; _type: string; _ref: string }>;
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
    console.error("❌ UIUXデザイナー転職ロードマップが見つかりません");
    process.exit(1);
  }

  console.log(`   → ${roadmap.title} (${roadmap._id})\n`);

  // 2. 現在の状態を表示
  console.log("📋 現在のセクションテキスト:");
  STEP_SECTION_UPDATES.forEach(({ stepIndex }) => {
    const step = roadmap.steps[stepIndex];
    const section = step?.sections?.[0];
    if (section) {
      console.log(`   Step ${stepIndex + 1}: "${section.title}"`);
      console.log(`           "${section.description || "(説明なし)"}"`);
    }
  });

  // 3. ステップを更新
  console.log("\n🔄 テキストを更新中...");
  const updatedSteps = [...roadmap.steps];

  for (const update of STEP_SECTION_UPDATES) {
    const { stepIndex, sectionIndex, title, description } = update;
    const step = updatedSteps[stepIndex];

    if (!step?.sections?.[sectionIndex]) {
      console.log(`   ⚠️ Step ${stepIndex + 1} Section ${sectionIndex + 1} が見つかりません`);
      continue;
    }

    step.sections[sectionIndex].title = title;
    step.sections[sectionIndex].description = description;
    console.log(`   ✓ Step ${stepIndex + 1}: "${title}"`);
  }

  // 4. Sanityに保存
  console.log("\n💾 Sanityに保存中...");
  try {
    await client
      .patch(roadmap._id)
      .set({ steps: updatedSteps })
      .commit();
    console.log("✅ 保存成功！\n");
  } catch (error) {
    console.error("❌ 保存失敗:", error);
    process.exit(1);
  }

  // 5. 更新後の確認
  console.log("📋 更新後のセクションテキスト:");
  STEP_SECTION_UPDATES.forEach(({ stepIndex, title, description }) => {
    console.log(`   Step ${stepIndex + 1}: "${title}"`);
    console.log(`           "${description}"`);
  });

  console.log("\n🎉 セクションテキストの更新が完了しました！");
  console.log("   /dev/roadmap-preview/uiux-career-change で確認してください。\n");
}

main().catch(console.error);
