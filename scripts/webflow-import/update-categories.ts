/**
 * レッスンにカテゴリを設定するスクリプト
 *
 * 使用方法:
 *   cd sanity-studio && npx ts-node ../scripts/webflow-import/update-categories.ts
 */

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

// .env.local を読み込み
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: 'cqszh4up',
  dataset: 'development',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

// Webflow Category ID → Sanity Category ID マッピング
const CATEGORY_MAPPING: Record<string, string> = {
  // UI系
  '615ab9810b4ab95806d45f76': 'category-ui',           // UIビジュアル系（11件）
  '627cc5d8373f253c97b31a29': 'category-ui',           // Figma入門（1件）
  '6029f9715d17750766e2ee69': 'category-ui',           // Webデザイン（1件）

  // 情報設計系
  '615e6d861c68ff18721facc1': 'category-information-architecture', // UI設計・情報設計系（13件）
  '6029f96ad659a155d7d4b1b3': 'category-information-architecture', // UI設計入門系（2件）

  // UX系
  '615e6da8390db0cc47100020': 'category-ux',           // UX系（4件）
  '6436305a94dc7732a0866939': 'category-ux',           // 顧客体験系（3件）

  // キャリア系（新規）
  '6029fa7645b53c0ee68dcbcb': 'category-career',       // キャリア系（5件）

  // BONO系（新規）
  '6029fa7dc325e44208b0a4ab': 'category-bono',         // BONO系（4件）
};

// Webflowからカテゴリ情報を取得
async function getWebflowCategories(token: string): Promise<Map<string, string>> {
  const WEBFLOW_API_BASE = 'https://api.webflow.com/v2';
  const SERIES_COLLECTION_ID = '6029d01e01a7fb81007f8e4e';

  const lessonToCategory = new Map<string, string>();
  let offset = 0;
  const limit = 100;

  while (true) {
    const url = `${WEBFLOW_API_BASE}/collections/${SERIES_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Webflow API error: ${response.status}`);
    }

    const data = await response.json();

    for (const item of data.items) {
      const slug = item.fieldData?.slug;
      const categoryId = item.fieldData?.categories;
      if (slug && categoryId) {
        lessonToCategory.set(slug, categoryId);
      }
    }

    if (data.items.length < limit) {
      break;
    }
    offset += limit;
  }

  return lessonToCategory;
}

async function main() {
  console.log('🚀 カテゴリ設定スクリプト開始\n');

  const webflowToken = process.env.WEBFLOW_TOKEN;
  if (!webflowToken) {
    console.error('❌ WEBFLOW_TOKEN が設定されていません');
    process.exit(1);
  }

  const sanityToken = process.env.SANITY_AUTH_TOKEN;
  if (!sanityToken) {
    console.error('❌ SANITY_AUTH_TOKEN が設定されていません');
    process.exit(1);
  }

  // Step 1: 新規カテゴリを作成
  console.log('📁 新規カテゴリを作成中...');

  const newCategories = [
    {
      _id: 'category-career',
      _type: 'category',
      title: 'キャリア',
      slug: { _type: 'slug', current: 'career' },
    },
    {
      _id: 'category-bono',
      _type: 'category',
      title: 'BONO',
      slug: { _type: 'slug', current: 'bono' },
    },
  ];

  for (const category of newCategories) {
    try {
      await client.createIfNotExists(category);
      console.log(`   ✅ ${category.title} カテゴリ作成`);
    } catch (error) {
      console.log(`   ⚠️ ${category.title} カテゴリは既に存在`);
    }
  }

  // Step 2: Webflowからカテゴリ情報を取得
  console.log('\n📥 Webflowからカテゴリ情報を取得中...');
  const webflowCategories = await getWebflowCategories(webflowToken);
  console.log(`   → ${webflowCategories.size}件のレッスンのカテゴリ情報を取得\n`);

  // Step 3: Sanityの全レッスンを取得
  console.log('📋 Sanityのレッスンを取得中...');
  const lessons = await client.fetch(`*[_type == "lesson"]{_id, title, "slug": slug.current, category}`);
  console.log(`   → ${lessons.length}件のレッスンを取得\n`);

  // Step 4: カテゴリを設定
  console.log('🔄 カテゴリを設定中...\n');

  let updated = 0;
  let skipped = 0;
  let noMapping = 0;

  for (const lesson of lessons) {
    const webflowCategoryId = webflowCategories.get(lesson.slug);

    if (!webflowCategoryId) {
      console.log(`   ⚠️ [${lesson.title}] Webflowにカテゴリ情報なし`);
      noMapping++;
      continue;
    }

    const sanityCategoryId = CATEGORY_MAPPING[webflowCategoryId];

    if (!sanityCategoryId) {
      console.log(`   ❌ [${lesson.title}] マッピングなし (Webflow ID: ${webflowCategoryId})`);
      noMapping++;
      continue;
    }

    // 既に設定済みならスキップ
    if (lesson.category?._ref === sanityCategoryId) {
      skipped++;
      continue;
    }

    // カテゴリを更新
    await client
      .patch(lesson._id)
      .set({
        category: {
          _type: 'reference',
          _ref: sanityCategoryId,
        },
      })
      .commit();

    console.log(`   ✅ [${lesson.title}] → ${sanityCategoryId}`);
    updated++;

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 結果表示
  console.log('\n' + '='.repeat(50));
  console.log('📊 結果サマリー');
  console.log('='.repeat(50));
  console.log(`更新: ${updated}件`);
  console.log(`スキップ（設定済み）: ${skipped}件`);
  console.log(`マッピングなし: ${noMapping}件`);
  console.log(`合計: ${lessons.length}件`);
}

main().catch(console.error);
