/**
 * レッスンカテゴリ追加スクリプト
 *
 * 追加するカテゴリ:
 * - 進め方
 * - AI
 * - ビジュアル
 * - ラジオ
 * - その他
 *
 * 実行:
 *   node scripts/add-lesson-categories.mjs
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error('❌ 必要な環境変数が不足しています: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_WRITE_TOKEN');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

// 追加するカテゴリ
const categoriesToAdd = [
  { title: '進め方', slug: 'process', order: 10 },
  { title: 'AI', slug: 'ai', order: 20 },
  { title: 'ビジュアル', slug: 'visual', order: 30 },
  { title: 'ラジオ', slug: 'radio', order: 40 },
  { title: 'その他', slug: 'others', order: 50 },
];

async function main() {
  console.log(`▶ Sanityカテゴリ追加 (${projectId}/${dataset})`);
  console.log('');

  // 既存カテゴリを確認
  const existingCategories = await client.fetch(`*[_type == "category"] | order(order asc) { title, "slug": slug.current, order }`);
  console.log('📋 既存カテゴリ:');
  if (existingCategories.length === 0) {
    console.log('   (なし)');
  } else {
    existingCategories.forEach((cat) => {
      console.log(`   - ${cat.order}. ${cat.title} (${cat.slug})`);
    });
  }
  console.log('');

  let created = 0;
  let skipped = 0;

  for (const cat of categoriesToAdd) {
    // 同一titleまたはslugが存在するかチェック
    const exists = await client.fetch(
      `count(*[_type == "category" && (title == $title || slug.current == $slug)])`,
      { title: cat.title, slug: cat.slug }
    );

    if (exists > 0) {
      console.log(`⏭️  スキップ: ${cat.title} (既存)`);
      skipped++;
      continue;
    }

    const doc = {
      _type: 'category',
      title: cat.title,
      slug: { _type: 'slug', current: cat.slug },
      order: cat.order,
    };

    await client.create(doc);
    console.log(`✅ 作成: ${cat.title}`);
    created++;
  }

  console.log('');
  console.log(`🎉 完了: 作成=${created}, スキップ=${skipped}, 合計=${categoriesToAdd.length}`);
}

main().catch((e) => {
  console.error('❌ エラー:', e);
  process.exit(1);
});
