import type { WebflowVideo, WebflowSeries, Article, Quest, Lesson } from './types.ts';

/**
 * Transform Webflow Video to Article
 */
function transformVideoToArticle(video: WebflowVideo): Article {
  const name = video.fieldData?.name || video.name;
  const slug = video.fieldData?.slug || video.slug;
  const videoUrl = video.fieldData?.['link-video-3'] || video.fieldData?.['link-video'] || video['link-video'];
  const videoDuration = video.fieldData?.['video-length'] || video['video-length'];
  const description = video.fieldData?.['description-3'] || video.fieldData?.description || video.description;

  return {
    _id: `webflow-video-${video.id}`,
    _type: 'article',
    title: name,
    slug: slug,
    videoUrl: videoUrl,
    videoDuration: videoDuration,
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
  
  const quests = groupVideosIntoQuests(videos);

  return {
    _id: `webflow-series-${series.id}`,
    _type: 'lesson',
    title: name,
    slug: slug,
    quests: quests,
    source: 'webflow',
    webflowId: series.id,
  };
}
