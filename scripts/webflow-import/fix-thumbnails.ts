/**
 * 記事サムネイル修正スクリプト
 *
 * Webflow動画のサムネイルを取得してSanity記事に設定する
 *
 * 使用方法:
 *   cd sanity-studio && npx ts-node ../scripts/webflow-import/fix-thumbnails.ts
 */

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

// .env.local を読み込み
dotenv.config({ path: '.env.local' });

const WEBFLOW_API_BASE = 'https://api.webflow.com/v2';
const VIDEOS_COLLECTION_ID = '6029d027f6cb8852cbce8c75';

const client = createClient({
  projectId: 'cqszh4up',
  dataset: 'development',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

interface WebflowVideo {
  id: string;
  fieldData?: {
    name?: string;
    slug?: string;
    'video-thumbnail'?: {
      fileId?: string;
      url?: string;
      alt?: string | null;
    };
  };
}

interface SanityArticle {
  _id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
}

// Webflowから全動画を取得
async function getAllWebflowVideos(token: string): Promise<WebflowVideo[]> {
  const allVideos: WebflowVideo[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const url = `${WEBFLOW_API_BASE}/collections/${VIDEOS_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`;
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
    allVideos.push(...data.items);

    if (data.items.length < limit) {
      break;
    }
    offset += limit;
  }

  return allVideos;
}

async function main() {
  console.log('🚀 サムネイル修正スクリプト開始\n');

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

  // Step 1: Webflowから全動画を取得
  console.log('📥 Webflowから動画を取得中...');
  const webflowVideos = await getAllWebflowVideos(webflowToken);
  console.log(`   → ${webflowVideos.length}件の動画を取得\n`);

  // サムネイルマップを作成（slug → thumbnailUrl）
  const thumbnailMap = new Map<string, string>();
  for (const video of webflowVideos) {
    const slug = video.fieldData?.slug;
    const thumbnailUrl = video.fieldData?.['video-thumbnail']?.url;
    if (slug && thumbnailUrl) {
      thumbnailMap.set(slug, thumbnailUrl);
    }
  }
  console.log(`   → ${thumbnailMap.size}件のサムネイルURLを抽出\n`);

  // Step 2: Sanityの全記事を取得
  console.log('📋 Sanityの記事を取得中...');
  const articles = await client.fetch<SanityArticle[]>(
    `*[_type == "article"]{_id, title, "slug": slug.current, thumbnailUrl}`
  );
  console.log(`   → ${articles.length}件の記事を取得\n`);

  // Step 3: サムネイルを設定
  console.log('🔄 サムネイルを設定中...\n');

  let updated = 0;
  let skipped = 0;
  let noMatch = 0;

  for (const article of articles) {
    // 既にサムネイルがある場合はスキップ
    if (article.thumbnailUrl) {
      skipped++;
      continue;
    }

    // Webflowのサムネイルを検索
    const thumbnailUrl = thumbnailMap.get(article.slug);

    if (!thumbnailUrl) {
      noMatch++;
      continue;
    }

    // サムネイルを更新
    await client
      .patch(article._id)
      .set({ thumbnailUrl })
      .commit();

    console.log(`   ✅ ${article.title}`);
    console.log(`      → ${thumbnailUrl.substring(0, 60)}...`);
    updated++;

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // 結果表示
  console.log('\n' + '='.repeat(50));
  console.log('📊 結果サマリー');
  console.log('='.repeat(50));
  console.log(`更新: ${updated}件`);
  console.log(`スキップ（設定済み）: ${skipped}件`);
  console.log(`マッチなし: ${noMatch}件`);
  console.log(`合計: ${articles.length}件`);
}

main().catch(console.error);
