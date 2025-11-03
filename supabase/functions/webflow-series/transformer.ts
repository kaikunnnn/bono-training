import type { WebflowVideo, WebflowSeries, Article, Quest, Lesson } from './types.ts';

/**
 * Transform Webflow Video to Article
 */
function transformVideoToArticle(video: WebflowVideo): Article {
  const name = video.fieldData?.name || video.name;
  const slug = video.fieldData?.slug || video.slug;
  const videoUrl = video.fieldData?.['link-video'] || video['link-video'];
  const videoDuration = video.fieldData?.['video-length'] || video['video-length'];
  const description = video.fieldData?.description || video.description;

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
 * Group Videos into Quests based on isthisasectiontitle? field
 * 
 * Logic:
 * - Videos with isthisasectiontitle? = true are Quest titles
 * - Subsequent videos belong to that Quest until the next section title
 */
export function groupVideosIntoQuests(videos: WebflowVideo[]): Quest[] {
  const quests: Quest[] = [];
  let currentQuest: Quest | null = null;
  let questNumber = 0;

  for (const video of videos) {
    const isSectionTitle = video.fieldData?.['isthisasectiontitle?'] ?? video['isthisasectiontitle?'];
    
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
