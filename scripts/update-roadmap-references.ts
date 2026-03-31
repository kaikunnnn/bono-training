/**
 * ロードマップ間の参照を更新するスクリプト
 *
 * UIUXデザイナー転職ロードマップのステップ2-5に、
 * 他のロードマップへの参照を追加する
 *
 * 使い方:
 * npx tsx scripts/update-roadmap-references.ts
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";

// 複数の.envファイルを読み込み
dotenv.config({ path: ".env.local" });
dotenv.config({ path: "sanity-studio/.env" });

const projectId = process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || "production";
const token = process.env.SANITY_TOKEN || process.env.SANITY_AUTH_TOKEN || process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
  console.error("❌ SANITY_PROJECT_ID が設定されていません");
  process.exit(1);
}

if (!token) {
  console.error("❌ SANITY_TOKEN が設定されていません");
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

// ステップとロードマップのマッピング
// UIUXデザイナー転職ロードマップのステップ2-5に対応するロードマップ
const STEP_ROADMAP_MAPPING = [
  { stepIndex: 1, roadmapSlug: "ui-design-beginner" },     // Step 2: UIデザイン入門
  { stepIndex: 2, roadmapSlug: "ui-visual" },              // Step 3: UIビジュアル入門
  { stepIndex: 3, roadmapSlug: "information-architecture" }, // Step 4: 情報設計基礎
  { stepIndex: 4, roadmapSlug: "ux-design" },              // Step 5: UXデザイン基礎
];

async function main() {
  console.log("\n📋 ロードマップ参照の更新を開始します...\n");

  // 1. 全ロードマップを取得
  console.log("🔍 Sanityからロードマップ一覧を取得中...");
  const roadmaps = await client.fetch<Array<{
    _id: string;
    slug: { current: string };
    title: string;
    steps: Array<{
      _key: string;
      title: string;
      sections: Array<{
        _key: string;
        title: string;
        contents?: Array<{ _key: string; _type: string; _ref: string }>;
      }>;
    }>;
  }>>(
    `*[_type == "roadmap"] { _id, slug, title, steps }`
  );

  // slug → _id マップを作成
  const roadmapMap = new Map<string, { _id: string; title: string }>();
  roadmaps.forEach((rm) => {
    if (rm.slug?.current) {
      roadmapMap.set(rm.slug.current, { _id: rm._id, title: rm.title });
    }
  });
  console.log(`   → ${roadmapMap.size}件のロードマップを取得\n`);

  // ロードマップ一覧を表示
  console.log("📋 取得したロードマップ:");
  roadmapMap.forEach((info, slug) => {
    console.log(`   - ${slug}: ${info.title} (${info._id})`);
  });
  console.log("");

  // 2. UIUXデザイナー転職ロードマップを取得
  const careerChangeRoadmap = roadmaps.find(
    (rm) => rm.slug?.current === "uiux-career-change"
  );

  if (!careerChangeRoadmap) {
    console.error("❌ UIUXデザイナー転職ロードマップが見つかりません");
    process.exit(1);
  }

  console.log(`\n🎯 対象: ${careerChangeRoadmap.title} (${careerChangeRoadmap._id})`);
  console.log(`   ステップ数: ${careerChangeRoadmap.steps?.length || 0}\n`);

  // 3. ステップを更新
  const updatedSteps = [...careerChangeRoadmap.steps];

  for (const mapping of STEP_ROADMAP_MAPPING) {
    const { stepIndex, roadmapSlug } = mapping;
    const targetRoadmap = roadmapMap.get(roadmapSlug);

    if (!targetRoadmap) {
      console.log(`   ⚠️ ロードマップ未発見: ${roadmapSlug}`);
      continue;
    }

    const step = updatedSteps[stepIndex];
    if (!step) {
      console.log(`   ⚠️ ステップ${stepIndex + 1}が存在しません`);
      continue;
    }

    // 最初のセクションのcontentsにロードマップ参照を追加
    const section = step.sections?.[0];
    if (!section) {
      console.log(`   ⚠️ ステップ${stepIndex + 1}にセクションがありません`);
      continue;
    }

    // 既存のcontentsを取得（なければ空配列）
    const existingContents = section.contents || [];

    // 既にロードマップ参照があるかチェック
    const alreadyHasRef = existingContents.some(
      (c) => c._ref === targetRoadmap._id
    );

    if (alreadyHasRef) {
      console.log(`   ✓ ステップ${stepIndex + 1}: 既に参照があります（${targetRoadmap.title}）`);
      continue;
    }

    // ロードマップ参照を追加
    const newContent = {
      _key: `roadmap-ref-${roadmapSlug}`,
      _type: "reference",
      _ref: targetRoadmap._id,
    };

    section.contents = [...existingContents, newContent];
    console.log(`   📎 ステップ${stepIndex + 1}: ${targetRoadmap.title}への参照を追加`);
  }

  // 4. Sanityに更新を保存
  console.log("\n💾 Sanityに保存中...");
  try {
    await client
      .patch(careerChangeRoadmap._id)
      .set({ steps: updatedSteps })
      .commit();
    console.log("✅ 保存成功！\n");
  } catch (error) {
    console.error("❌ 保存失敗:", error);
    process.exit(1);
  }

  // 5. 確認のため再取得
  console.log("🔍 更新後のデータを確認中...");
  const updatedRoadmap = await client.fetch<{
    title: string;
    steps: Array<{
      title: string;
      sections: Array<{
        title: string;
        contents?: Array<{ _ref: string }>;
      }>;
    }>;
  }>(
    `*[_type == "roadmap" && slug.current == "uiux-career-change"][0] {
      title,
      steps[] {
        title,
        sections[] {
          title,
          contents[]-> { _id, _type, title, slug }
        }
      }
    }`
  );

  console.log("\n📋 更新後のステップ構成:");
  updatedRoadmap.steps.forEach((step, i) => {
    console.log(`\n  ステップ${i + 1}: ${step.title}`);
    step.sections?.forEach((section, j) => {
      console.log(`    セクション${j + 1}: ${section.title}`);
      if (section.contents && section.contents.length > 0) {
        section.contents.forEach((content: any) => {
          const typeIcon = content._type === "roadmap" ? "🗺️" : "📚";
          console.log(`      ${typeIcon} ${content.title} (${content._type})`);
        });
      } else {
        console.log("      (コンテンツなし)");
      }
    });
  });

  console.log("\n\n🎉 ロードマップ参照の更新が完了しました！");
  console.log("   /dev/roadmap-preview/uiux-career-change で確認してください。\n");
}

main().catch(console.error);
