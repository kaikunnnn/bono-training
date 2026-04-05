/**
 * Sanityのロードマップの gradientPreset を新しい命名に更新するスクリプト
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// 旧プリセット名 → 新プリセット名のマッピング
const PRESET_MAPPING = {
  'galaxy': 'career-change',      // UIUXデザイナー転職
  'ocean': 'ui-beginner',         // UIデザイン入門
  'uivisual': 'ui-visual',        // UIビジュアル入門
  'teal': 'ui-visual',            // UIビジュアル入門（tealもui-visualに統合）
  'infoarch': 'info-arch',        // 情報設計基礎
  'sunset': 'ux-design',          // UXデザイン基礎
  'rose': 'ux-design',            // rose は使われていないが、念のためux-designに
};

async function updateGradientPresets() {
  console.log('🚀 グラデーションプリセットの更新を開始...\n');

  // 全ロードマップを取得
  const roadmaps = await client.fetch(`*[_type == "roadmap"] { _id, title, gradientPreset }`);

  console.log(`📋 ${roadmaps.length}件のロードマップを取得\n`);

  for (const roadmap of roadmaps) {
    const oldPreset = roadmap.gradientPreset;
    const newPreset = PRESET_MAPPING[oldPreset];

    if (!newPreset) {
      console.log(`⚠️ "${roadmap.title}": 不明なプリセット "${oldPreset}" - スキップ`);
      continue;
    }

    if (oldPreset === newPreset) {
      console.log(`✓ "${roadmap.title}": 既に "${newPreset}" - スキップ`);
      continue;
    }

    try {
      await client
        .patch(roadmap._id)
        .set({ gradientPreset: newPreset })
        .commit();

      console.log(`✅ "${roadmap.title}": ${oldPreset} → ${newPreset}`);
    } catch (error) {
      console.error(`❌ "${roadmap.title}": エラー - ${error.message}`);
    }
  }

  console.log('\n🎉 更新完了！');
}

updateGradientPresets();
