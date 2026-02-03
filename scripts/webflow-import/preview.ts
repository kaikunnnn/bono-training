/**
 * Webflow → Sanity インポート プレビュースクリプト
 *
 * 目的: 実際にインポートせず、データ変換結果を確認する
 *
 * 使用方法:
 *   npx ts-node scripts/webflow-import/preview.ts
 *
 * 必要な環境変数:
 *   WEBFLOW_API_TOKEN - Webflow APIトークン
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local を読み込み
dotenv.config({ path: '.env.local' });

const WEBFLOW_API_BASE = 'https://api.webflow.com/v2';
const VIDEOS_COLLECTION_ID = '6029d027f6cb8852cbce8c75';
const SERIES_COLLECTION_ID = '6029d01e01a7fb81007f8e4e';

// ============================================
// Types
// ============================================

interface WebflowSeries {
  id: string;
  fieldData?: {
    name?: string;
    slug?: string;
    thumbnail?: { url?: string };
    ogpimezi?: { url?: string };
    'descriptions-2'?: string;
    description?: string;
    categories?: string;
    aboutthisseries?: string;
  };
  // Legacy flat fields
  name?: string;
  slug?: string;
}

interface WebflowVideo {
  id: string;
  fieldData?: {
    name?: string;
    slug?: string;
    'is-this-a-section-title-3'?: boolean;
    'series-video-order-3'?: number;
    'link-video-3'?: string;
    'link-video'?: string;
    'video-length'?: string;
    freecontent?: boolean;
    freevideourl?: string;
    'description-3'?: string;
    series?: string;
  };
  // Legacy flat fields
  name?: string;
  slug?: string;
  series?: string;
}

interface SanityLesson {
  _type: 'lesson';
  _id: string;
  title: string;
  slug: { _type: 'slug'; current: string };
  description?: string;
  iconImageUrl?: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  webflowId: string;
}

interface SanityQuest {
  _type: 'quest';
  _id: string;
  questNumber: number;
  title: string;
  lessonSlug: string; // 親レッスンのslug（参照用）
  webflowId: string;
}

interface SanityArticle {
  _type: 'article';
  _id: string;
  articleNumber: number;
  title: string;
  slug: { _type: 'slug'; current: string };
  contentType: 'video' | 'text';
  videoUrl?: string;
  videoDuration?: string;
  isPremium: boolean;
  questId: string; // 親クエストのID（参照用）
  webflowId: string;
}

interface PreviewResult {
  timestamp: string;
  summary: {
    totalSeries: number;
    totalQuests: number;
    totalArticles: number;
    errors: string[];
  };
  lessons: SanityLesson[];
  quests: SanityQuest[];
  articles: SanityArticle[];
}

// ============================================
// Webflow API
// ============================================

async function fetchWebflow<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Webflow API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

async function getAllSeries(token: string): Promise<WebflowSeries[]> {
  const allSeries: WebflowSeries[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const url = `${WEBFLOW_API_BASE}/collections/${SERIES_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`;
    const response = await fetchWebflow<{ items: WebflowSeries[] }>(url, token);

    allSeries.push(...response.items);

    if (response.items.length < limit) {
      break;
    }
    offset += limit;
  }

  return allSeries;
}

async function getVideosForSeries(token: string, seriesId: string): Promise<WebflowVideo[]> {
  const allVideos: WebflowVideo[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const url = `${WEBFLOW_API_BASE}/collections/${VIDEOS_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`;
    const response = await fetchWebflow<{ items: WebflowVideo[] }>(url, token);

    const seriesVideos = response.items.filter(video => {
      const videoSeriesId = video.fieldData?.series || video.series;
      return videoSeriesId === seriesId;
    });

    allVideos.push(...seriesVideos);

    if (response.items.length < limit) {
      break;
    }
    offset += limit;
  }

  return allVideos;
}

// ============================================
// Transform
// ============================================

function transformSeriesToLesson(series: WebflowSeries): SanityLesson {
  const name = series.fieldData?.name || series.name || 'Untitled';
  const slug = series.fieldData?.slug || series.slug || series.id;
  const description = series.fieldData?.['descriptions-2'] || series.fieldData?.description;
  const iconImage = series.fieldData?.thumbnail?.url;
  const coverImage = series.fieldData?.ogpimezi?.url;

  return {
    _type: 'lesson',
    _id: `webflow-import-${series.id}`,
    title: name,
    slug: { _type: 'slug', current: slug },
    description,
    iconImageUrl: iconImage,
    thumbnailUrl: coverImage || iconImage,
    isPremium: false, // デフォルトは無料
    webflowId: series.id,
  };
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  if (typeof value === 'number') return value === 1;
  return false;
}

function transformVideosToQuestsAndArticles(
  videos: WebflowVideo[],
  lessonSlug: string
): { quests: SanityQuest[]; articles: SanityArticle[] } {
  // Sort by order
  const sortedVideos = [...videos].sort((a, b) => {
    const orderA = a.fieldData?.['series-video-order-3'] ?? 0;
    const orderB = b.fieldData?.['series-video-order-3'] ?? 0;
    return orderA - orderB;
  });

  const quests: SanityQuest[] = [];
  const articles: SanityArticle[] = [];

  let currentQuestId = '';
  let questNumber = 0;
  let articleNumber = 0;

  for (const video of sortedVideos) {
    const isSectionTitle = normalizeBoolean(video.fieldData?.['is-this-a-section-title-3']);
    const name = video.fieldData?.name || video.name || 'Untitled';
    const slug = video.fieldData?.slug || video.slug || video.id;

    if (isSectionTitle) {
      // This is a quest (section title)
      questNumber++;
      articleNumber = 0;
      currentQuestId = `webflow-quest-${lessonSlug}-${questNumber}`;

      quests.push({
        _type: 'quest',
        _id: currentQuestId,
        questNumber,
        title: name,
        lessonSlug,
        webflowId: video.id,
      });
    } else {
      // This is an article
      if (!currentQuestId) {
        // Create a default quest if no section title yet
        questNumber++;
        currentQuestId = `webflow-quest-${lessonSlug}-${questNumber}`;
        quests.push({
          _type: 'quest',
          _id: currentQuestId,
          questNumber,
          title: 'コンテンツ',
          lessonSlug,
          webflowId: `default-${lessonSlug}-${questNumber}`,
        });
      }

      articleNumber++;
      const freeContent = video.fieldData?.freecontent;
      const isPremium = !freeContent; // 論理反転
      const videoUrl = isPremium
        ? (video.fieldData?.['link-video-3'] || video.fieldData?.['link-video'])
        : (video.fieldData?.freevideourl || video.fieldData?.['link-video-3'] || video.fieldData?.['link-video']);

      articles.push({
        _type: 'article',
        _id: `webflow-article-${video.id}`,
        articleNumber,
        title: name,
        slug: { _type: 'slug', current: slug },
        contentType: videoUrl ? 'video' : 'text',
        videoUrl,
        videoDuration: video.fieldData?.['video-length'],
        isPremium,
        questId: currentQuestId,
        webflowId: video.id,
      });
    }
  }

  return { quests, articles };
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('🚀 Webflow → Sanity プレビュー開始\n');

  const token = process.env.WEBFLOW_API_TOKEN;
  if (!token) {
    console.error('❌ WEBFLOW_API_TOKEN が設定されていません');
    console.error('   .env.local に WEBFLOW_API_TOKEN=xxx を追加してください');
    process.exit(1);
  }

  const result: PreviewResult = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSeries: 0,
      totalQuests: 0,
      totalArticles: 0,
      errors: [],
    },
    lessons: [],
    quests: [],
    articles: [],
  };

  try {
    // 1. 全Seriesを取得
    console.log('📥 Webflowから全Seriesを取得中...');
    const allSeries = await getAllSeries(token);
    console.log(`   → ${allSeries.length}件のSeriesを取得\n`);

    result.summary.totalSeries = allSeries.length;

    // 2. 各Seriesを変換
    for (let i = 0; i < allSeries.length; i++) {
      const series = allSeries[i];
      const seriesName = series.fieldData?.name || series.name || 'Unknown';
      console.log(`[${i + 1}/${allSeries.length}] ${seriesName}`);

      try {
        // Lesson変換
        const lesson = transformSeriesToLesson(series);
        result.lessons.push(lesson);

        // Videos取得
        const videos = await getVideosForSeries(token, series.id);
        console.log(`   → ${videos.length}件の動画`);

        // Quests/Articles変換
        const { quests, articles } = transformVideosToQuestsAndArticles(
          videos,
          lesson.slug.current
        );
        result.quests.push(...quests);
        result.articles.push(...articles);

        console.log(`   → ${quests.length}クエスト, ${articles.length}記事\n`);
      } catch (error) {
        const errorMsg = `Series "${seriesName}" (${series.id}): ${error}`;
        console.error(`   ❌ エラー: ${error}\n`);
        result.summary.errors.push(errorMsg);
      }

      // Rate limiting: 少し待機
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    result.summary.totalQuests = result.quests.length;
    result.summary.totalArticles = result.articles.length;

    // 3. 結果を出力
    const outputDir = path.join(__dirname, 'output');
    const date = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `preview-${date}.json`);

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

    // 4. サマリー表示
    console.log('='.repeat(50));
    console.log('📊 プレビュー結果サマリー');
    console.log('='.repeat(50));
    console.log(`レッスン: ${result.summary.totalSeries}件`);
    console.log(`クエスト: ${result.summary.totalQuests}件`);
    console.log(`記事:     ${result.summary.totalArticles}件`);
    console.log(`エラー:   ${result.summary.errors.length}件`);
    console.log('');
    console.log(`📁 詳細結果: ${outputPath}`);

    if (result.summary.errors.length > 0) {
      console.log('\n⚠️ エラー一覧:');
      result.summary.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }

  } catch (error) {
    console.error('❌ 致命的エラー:', error);
    process.exit(1);
  }
}

main();
