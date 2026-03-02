/**
 * Webflow → Sanity 記事タイトル修正スクリプト
 *
 * 目的: 記事タイトルを name → videotitle に修正
 *
 * 使用方法:
 *   npx tsx scripts/webflow-import/fix-article-titles.ts --preview  # プレビュー
 *   npx tsx scripts/webflow-import/fix-article-titles.ts --execute  # 実行
 */

import * as dotenv from 'dotenv';
import { createClient } from '@sanity/client';

// Load environment variables
dotenv.config({ path: 'sanity-studio/.env.local' });
dotenv.config({ path: '.env.local' });

// ============================================
// Configuration
// ============================================

const SANITY_PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.SANITY_STUDIO_DATASET || process.env.VITE_SANITY_DATASET || 'production';
const SANITY_TOKEN = process.env.SANITY_AUTH_TOKEN;
const WEBFLOW_TOKEN = process.env.WEBFLOW_TOKEN || process.env.WEBFLOW_API_TOKEN;

const WEBFLOW_API_BASE = 'https://api.webflow.com/v2';
const VIDEOS_COLLECTION_ID = '6029d027f6cb8852cbce8c75';

if (!SANITY_PROJECT_ID || !SANITY_TOKEN) {
  console.error('❌ Missing Sanity configuration');
  process.exit(1);
}

if (!WEBFLOW_TOKEN) {
  console.error('❌ Missing WEBFLOW_TOKEN');
  process.exit(1);
}

const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
});

// ============================================
// Webflow API
// ============================================

interface WebflowVideo {
  id: string;
  fieldData?: {
    name?: string;
    videotitle?: string;
    slug?: string;
  };
}

async function fetchAllVideos(): Promise<WebflowVideo[]> {
  const allVideos: WebflowVideo[] = [];
  let offset = 0;
  const limit = 100;

  console.log('📥 Webflowから全動画データを取得中...');

  while (true) {
    const url = `${WEBFLOW_API_BASE}/collections/${VIDEOS_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${WEBFLOW_TOKEN}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Webflow API error: ${response.status}`);
    }

    const data = await response.json() as { items: WebflowVideo[] };
    allVideos.push(...data.items);

    console.log(`   → ${allVideos.length}件取得...`);

    if (data.items.length < limit) break;
    offset += limit;

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return allVideos;
}

// ============================================
// Main
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const isPreview = args.includes('--preview');
  const isExecute = args.includes('--execute');

  if (!isPreview && !isExecute) {
    console.log('使用方法:');
    console.log('  --preview  プレビュー（変更なし）');
    console.log('  --execute  実行（Sanityを更新）');
    process.exit(0);
  }

  console.log('🚀 記事タイトル修正スクリプト開始\n');
  console.log(`   モード: ${isPreview ? 'プレビュー' : '実行'}`);
  console.log(`   Project: ${SANITY_PROJECT_ID}`);
  console.log(`   Dataset: ${SANITY_DATASET}\n`);

  // 1. Webflowから全動画データを取得
  const webflowVideos = await fetchAllVideos();
  console.log(`   合計: ${webflowVideos.length}件\n`);

  // slug → videotitle のマップを作成
  const videoTitleMap = new Map<string, { videotitle: string; name: string }>();
  for (const video of webflowVideos) {
    const slug = video.fieldData?.slug;
    const videotitle = video.fieldData?.videotitle;
    const name = video.fieldData?.name;

    if (slug && videotitle) {
      videoTitleMap.set(slug, { videotitle, name: name || '' });
    }
  }

  // 2. Sanityから記事を取得
  console.log('📥 Sanityから記事一覧を取得中...');
  const articles = await sanityClient.fetch<Array<{
    _id: string;
    title: string;
    slug: { current: string };
  }>>(`*[_type == "article"] {
    _id,
    title,
    slug
  }`);
  console.log(`   → ${articles.length}件の記事\n`);

  // 3. タイトル比較＆更新
  console.log('='.repeat(60));
  let updatedCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;

  for (const article of articles) {
    const slug = article.slug?.current;
    if (!slug) {
      skippedCount++;
      continue;
    }

    const webflowData = videoTitleMap.get(slug);
    if (!webflowData) {
      notFoundCount++;
      continue;
    }

    const { videotitle, name } = webflowData;

    // タイトルが異なる場合のみ更新
    if (article.title === videotitle) {
      skippedCount++;
      continue;
    }

    // タイトルが name と同じで videotitle と異なる場合
    if (article.title === name && name !== videotitle) {
      console.log(`\n📝 ${slug}`);
      console.log(`   現在: "${article.title}"`);
      console.log(`   修正: "${videotitle}"`);

      if (isExecute) {
        await sanityClient.patch(article._id).set({ title: videotitle }).commit();
        console.log(`   ✅ 更新完了`);
      } else {
        console.log(`   (プレビューモード)`);
      }
      updatedCount++;
    } else if (article.title !== videotitle) {
      // タイトルが両方と異なる場合も表示
      console.log(`\n⚠️  ${slug}`);
      console.log(`   現在:      "${article.title}"`);
      console.log(`   videotitle: "${videotitle}"`);
      console.log(`   name:       "${name}"`);
      console.log(`   → 手動確認が必要`);
      skippedCount++;
    } else {
      skippedCount++;
    }
  }

  // 4. サマリー
  console.log('\n' + '='.repeat(60));
  console.log('📊 結果サマリー');
  console.log('='.repeat(60));
  console.log(`更新対象:     ${updatedCount}件`);
  console.log(`スキップ:     ${skippedCount}件 (既に正しい or 変更不要)`);
  console.log(`Webflowなし:  ${notFoundCount}件`);

  if (isPreview && updatedCount > 0) {
    console.log('\n💡 実行するには --execute オプションを付けてください');
  }
}

main().catch(console.error);
