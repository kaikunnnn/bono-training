/**
 * 記事データ修正スクリプト
 *
 * 問題:
 * 1. contentType が null になっている
 * 2. videoUrl がオブジェクトのまま（文字列URLが必要）
 *
 * 使用方法:
 *   cd sanity-studio && npx ts-node ../scripts/webflow-import/fix-articles.ts
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

interface ArticleToFix {
  _id: string;
  title: string;
  contentType: string | null;
  videoUrl: string | { url?: string; metadata?: any } | null;
}

async function main() {
  console.log('🚀 記事データ修正スクリプト開始\n');

  const sanityToken = process.env.SANITY_AUTH_TOKEN;
  if (!sanityToken) {
    console.error('❌ SANITY_AUTH_TOKEN が設定されていません');
    process.exit(1);
  }

  // 全記事を取得
  console.log('📋 記事を取得中...');
  const articles = await client.fetch<ArticleToFix[]>(
    `*[_type == "article"]{_id, title, contentType, videoUrl}`
  );
  console.log(`   → ${articles.length}件の記事を取得\n`);

  let fixedContentType = 0;
  let fixedVideoUrl = 0;
  let skipped = 0;

  console.log('🔄 修正中...\n');

  for (const article of articles) {
    let needsUpdate = false;
    const updates: Record<string, any> = {};

    // 1. videoUrl がオブジェクトの場合、URL文字列を抽出
    let videoUrlString: string | null = null;

    if (article.videoUrl) {
      if (typeof article.videoUrl === 'string') {
        videoUrlString = article.videoUrl;
      } else if (typeof article.videoUrl === 'object' && article.videoUrl.url) {
        // オブジェクト形式 {url: "...", metadata: {...}} からURLを抽出
        videoUrlString = article.videoUrl.url;
        updates.videoUrl = videoUrlString;
        needsUpdate = true;
        fixedVideoUrl++;
        console.log(`   🔧 videoUrl修正: ${article.title}`);
        console.log(`      ${article.videoUrl.url}`);
      }
    }

    // 2. contentType が null の場合、videoUrl の有無で判定
    if (article.contentType === null || article.contentType === undefined) {
      const hasVideo = !!videoUrlString;
      updates.contentType = hasVideo ? 'video' : 'text';
      needsUpdate = true;
      fixedContentType++;
      console.log(`   📝 contentType設定: ${article.title} → ${updates.contentType}`);
    }

    // 更新実行
    if (needsUpdate) {
      await client.patch(article._id).set(updates).commit();
    } else {
      skipped++;
    }

    // Rate limiting
    if (needsUpdate) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  // 結果表示
  console.log('\n' + '='.repeat(50));
  console.log('📊 結果サマリー');
  console.log('='.repeat(50));
  console.log(`contentType修正: ${fixedContentType}件`);
  console.log(`videoUrl修正: ${fixedVideoUrl}件`);
  console.log(`スキップ（修正不要）: ${skipped}件`);
  console.log(`合計: ${articles.length}件`);
}

main().catch(console.error);
