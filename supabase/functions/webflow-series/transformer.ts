import type { WebflowVideo, WebflowSeries, Article, Quest, Lesson } from './types.ts';

/**
 * Transform Webflow Video to Article
 */
function transformVideoToArticle(video: WebflowVideo): Article {
  const name = video.fieldData?.name || video.name;
  const slug = video.fieldData?.slug || video.slug;

  // 🔄 FreeContentの論理を反転してisPremiumに変換
  // FreeContent ON (true)  → isPremium false（無料）
  // FreeContent OFF (false/undefined) → isPremium true（有料）
  const freeContent = video.fieldData?.['freecontent'] ?? video['freecontent'];
  const isPremium = !freeContent;  // 論理反転

  // 📹 動画URLの取得：無料/有料で異なるフィールドを使用
  let videoUrl: string | undefined;
  if (!isPremium) {
    // 無料コンテンツ: freevideourl を優先、フォールバックとして link-video も確認
    videoUrl = video.fieldData?.['freevideourl'] ?? video['freevideourl'] ??
               video.fieldData?.['free-video-url'] ?? video['free-video-url'] ??
               video.fieldData?.['link-video-3'] ?? video.fieldData?.['link-video'] ?? video['link-video'];
  } else {
    // 有料コンテンツ: link-video を使用
    videoUrl = video.fieldData?.['link-video-3'] ?? video.fieldData?.['link-video'] ?? video['link-video'];
  }

  const videoDuration = video.fieldData?.['video-length'] || video['video-length'];
  const description = video.fieldData?.['description-3'] || video.fieldData?.description || video.description;

  return {
    _id: `webflow-video-${video.id}`,
    _type: 'article',
    title: name,
    slug: slug,
    videoUrl: videoUrl,
    videoDuration: videoDuration,
    isPremium: isPremium,  // 🆕 プレミアムフラグ
    content: description,
    source: 'webflow',
    webflowId: video.id,
  };
}

/**
 * Normalize boolean value from Webflow API
 * Handles boolean, string, and number types
 */
function normalizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  if (typeof value === 'number') return value === 1;
  return false;
}

/**
 * Group Videos into Quests based on is-this-a-section-title-3 field
 * 
 * Logic:
 * - Videos are sorted by series-video-order-3 first
 * - Videos with is-this-a-section-title-3 = true are Quest titles
 * - Subsequent videos belong to that Quest until the next section title
 */
export function groupVideosIntoQuests(videos: WebflowVideo[]): Quest[] {
  const sortedVideos = [...videos].sort((a, b) => {
    const orderA = a.fieldData?.['series-video-order-3'] ?? a['series-video-order'] ?? 0;
    const orderB = b.fieldData?.['series-video-order-3'] ?? b['series-video-order'] ?? 0;
    return orderA - orderB;
  });

  const quests: Quest[] = [];
  let currentQuest: Quest | null = null;
  let questNumber = 0;

  for (const video of sortedVideos) {
    const isSectionTitleRaw = video.fieldData?.['is-this-a-section-title-3'] ?? video['isthisasectiontitle?'];
    const isSectionTitle = normalizeBoolean(isSectionTitleRaw);
    
    if (isSectionTitle) {
      if (currentQuest && currentQuest.articles.length > 0) {
        quests.push(currentQuest);
      }
      
      questNumber++;
      const name = video.fieldData?.name || video.name;
      currentQuest = {
        _id: `webflow-quest-${questNumber}`,
        _type: 'quest',
        questNumber: questNumber,
        title: name,
        articles: [],
        source: 'webflow',
      };
    } else if (currentQuest) {
      const article = transformVideoToArticle(video);
      currentQuest.articles.push(article);
    } else {
      if (!currentQuest) {
        questNumber++;
        currentQuest = {
          _id: `webflow-quest-${questNumber}`,
          _type: 'quest',
          questNumber: questNumber,
          title: 'Videos',
          articles: [],
          source: 'webflow',
        };
      }
      const article = transformVideoToArticle(video);
      currentQuest.articles.push(article);
    }
  }

  if (currentQuest && currentQuest.articles.length > 0) {
    quests.push(currentQuest);
  }

  return quests;
}

/**
 * Transform Webflow Series and Videos to Lesson structure
 */
export function transformToLesson(
  series: WebflowSeries,
  videos: WebflowVideo[]
): Lesson {
  const name = series.fieldData?.name || series.name;
  const slug = series.fieldData?.slug || series.slug;

  // 🆕 Extract additional fields from Webflow Series (実際のフィールド名を使用)
  const description =
    series.fieldData?.['descriptions-2'] ||
    series['descriptions-2'] ||
    series.fieldData?.description ||
    series.description;

  const iconImage = series.fieldData?.thumbnail?.url || series.thumbnail?.url;

  // OGP画像 (実際のフィールド名: ogpimezi)
  const coverImage =
    series.fieldData?.ogpimezi?.url ||
    series.ogpimezi?.url ||
    iconImage; // フォールバック: thumbnailをカバー画像として使用

  const category = series.fieldData?.categories || series.categories;
  const overview = series.fieldData?.aboutthisseries || series.aboutthisseries;

  const quests = groupVideosIntoQuests(videos);

  return {
    _id: `webflow-series-${series.id}`,
    _type: 'lesson',
    title: name,
    slug: slug,
    description,      // 🆕 説明文
    coverImage,       // 🆕 カバー画像URL
    iconImage,        // 🆕 アイコン画像URL
    category,         // 🆕 カテゴリ
    overview,         // 🆕 詳細説明（HTML）
    quests: quests,
    source: 'webflow',
    webflowId: series.id,
  };
}
