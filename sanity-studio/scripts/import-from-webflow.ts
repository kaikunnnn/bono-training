/**
 * Webflow → Sanity Import Script
 *
 * WebflowのSeriesとVideosデータを取得してSanityに投稿する
 *
 * Usage:
 * npm run import-webflow -- --series-id=684a8fd0ff2a7184d2108210
 */

import { createClient } from '@sanity/client';
import { JSDOM } from 'jsdom';

// Sanity client setup
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'cqszh4up',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_AUTH_TOKEN, // 書き込み権限が必要
  useCdn: false,
});

// Webflow configuration
const WEBFLOW_TOKEN = process.env.WEBFLOW_TOKEN || '674b54cf2429858c005eb647787f444c749bb324a1ca1615b6cf4967b4033e76';
const SERIES_COLLECTION_ID = '6029d01e01a7fb81007f8e4e';
const VIDEOS_COLLECTION_ID = '6029d027f6cb8852cbce8c75';

interface WebflowVideo {
  id: string;
  name: string;
  slug: string;
  fieldData: Record<string, any>;
  [key: string]: any;
}

interface WebflowSeries {
  id: string;
  name: string;
  slug: string;
  fieldData: Record<string, any>;
  [key: string]: any;
}

/**
 * Fetch Webflow Series by ID
 */
async function fetchWebflowSeries(seriesId: string): Promise<WebflowSeries> {
  const response = await fetch(
    `https://api.webflow.com/v2/collections/${SERIES_COLLECTION_ID}/items/${seriesId}`,
    {
      headers: {
        'Authorization': `Bearer ${WEBFLOW_TOKEN}`,
        'accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch series: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch Webflow Videos filtered by series
 */
async function fetchWebflowVideos(seriesId: string): Promise<WebflowVideo[]> {
  const response = await fetch(
    `https://api.webflow.com/v2/collections/${VIDEOS_COLLECTION_ID}/items`,
    {
      headers: {
        'Authorization': `Bearer ${WEBFLOW_TOKEN}`,
        'accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch videos: ${response.statusText}`);
  }

  const data = await response.json();

  // Filter videos by series
  return data.items.filter((video: WebflowVideo) => {
    const videoSeriesId = video.fieldData?.series || video.series;
    return videoSeriesId === seriesId;
  });
}

/**
 * Generate random key for Sanity content
 */
function randomKey(length: number = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Parse video duration from MM:SS format to minutes
 */
function parseDuration(duration: string | number | null | undefined): number | null {
  if (typeof duration === 'number') return duration;
  if (!duration || duration === 'text') return null;

  const match = String(duration).match(/^(\d+):(\d+)$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Extract URL string from Webflow video URL (can be string or object)
 */
function extractVideoUrl(videoUrlRaw: any): string | null {
  if (!videoUrlRaw) return null;

  // If it's already a string, return it
  if (typeof videoUrlRaw === 'string') return videoUrlRaw;

  // If it's an object with url property, extract it
  if (typeof videoUrlRaw === 'object' && videoUrlRaw.url) {
    return videoUrlRaw.url;
  }

  return null;
}

/**
 * Transform and create Article in Sanity
 */
async function createArticle(video: WebflowVideo, orderIndex: number) {
  // Use VideoTitle field, fallback to name
  const title = video.fieldData?.['VideoTitle'] ||
                video.fieldData?.['videotitle'] ||
                video.fieldData?.name ||
                video.name;
  const slug = video.fieldData?.slug || video.slug;

  // isPremium logic: Webflow's freeContent is inverted
  const freeContent = video.fieldData?.['freecontent'] ?? video['freecontent'];
  const isPremium = !freeContent;

  // Video URL based on premium status
  let videoUrlRaw: any;
  if (!isPremium) {
    videoUrlRaw = video.fieldData?.['freevideourl'] ??
                  video['freevideourl'] ??
                  video.fieldData?.['free-video-url'] ??
                  video.fieldData?.['link-video-3'];
  } else {
    videoUrlRaw = video.fieldData?.['link-video-3'] ??
                  video.fieldData?.['link-video'];
  }

  // Extract URL string from raw value
  const videoUrl = extractVideoUrl(videoUrlRaw);

  // Get video duration as string (e.g., "36:21")
  const videoDurationRaw = video.fieldData?.['video-length'] || video['video-length'];
  // Keep as-is (string format like "36:21")
  const videoDuration = typeof videoDurationRaw === 'string' ? videoDurationRaw : null;

  const descriptionHtml = video.fieldData?.['description-3'] ||
                          video.fieldData?.['scene-3'] ||
                          video.fieldData?.description ||
                          video.description;

  // Get last published date from Webflow
  const lastPublished = video.lastPublished || video.fieldData?.lastPublished;

  // Convert HTML to Portable Text
  const content = descriptionHtml ? htmlToPortableText(descriptionHtml) : [{
    _type: 'block',
    _key: randomKey(12),
    style: 'normal',
    children: [{
      _type: 'span',
      _key: randomKey(12),
      text: '',
    }],
  }];

  // Get thumbnail URL from Webflow
  const thumbnailUrl = video.fieldData?.['video-thumbnail']?.url ||
                       video.fieldData?.['videothumbnail']?.url ||
                       video['video-thumbnail']?.url;

  const articleDoc = {
    _type: 'article',
    _id: `webflow-video-${video.id}`,
    articleNumber: orderIndex + 1,
    title: title,
    slug: {
      _type: 'slug',
      current: slug,
    },
    videoUrl: videoUrl,
    videoDuration: videoDuration,
    isPremium: isPremium,
    thumbnailUrl: thumbnailUrl || null, // Add thumbnail URL for frontend
    content: content,
    publishedAt: lastPublished || new Date().toISOString(),
  };

  console.log(`  → Creating article: ${title}`);
  return client.createOrReplace(articleDoc);
}

/**
 * Normalize boolean from various Webflow formats
 */
function normalizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  if (typeof value === 'number') return value === 1;
  return false;
}

/**
 * Group Videos into Quests and create in Sanity
 */
async function createQuestsFromVideos(videos: WebflowVideo[], lessonId: string, seriesId: string): Promise<string[]> {
  // Sort videos by order
  const sortedVideos = [...videos].sort((a, b) => {
    const orderA = a.fieldData?.['series-video-order-3'] ?? a['series-video-order'] ?? 0;
    const orderB = b.fieldData?.['series-video-order-3'] ?? b['series-video-order'] ?? 0;
    return orderA - orderB;
  });

  const questIds: string[] = [];
  let currentQuestData: {
    number: number;
    title: string;
    articleIds: string[];
  } | null = null;
  let questNumber = 0;
  let articleIndex = 0;

  for (const video of sortedVideos) {
    const isSectionTitleRaw = video.fieldData?.['is-this-a-section-title-3'] ??
                               video['isthisasectiontitle?'];
    const isSectionTitle = normalizeBoolean(isSectionTitleRaw);

    if (isSectionTitle) {
      // Save previous quest if exists
      if (currentQuestData && currentQuestData.articleIds.length > 0) {
        const questId = await createQuest(
          currentQuestData.number,
          currentQuestData.title,
          currentQuestData.articleIds,
          lessonId,
          seriesId
        );
        questIds.push(questId);
      }

      // Start new quest
      questNumber++;
      // Use VideoTitle for quest title (section titles also have this field)
      const title = video.fieldData?.['VideoTitle'] ||
                    video.fieldData?.['videotitle'] ||
                    video.fieldData?.name ||
                    video.name;
      currentQuestData = {
        number: questNumber,
        title: title,
        articleIds: [],
      };
      console.log(`\n📚 Quest ${questNumber}: ${title}`);
    } else {
      // Create article and add to current quest
      if (!currentQuestData) {
        questNumber++;
        currentQuestData = {
          number: questNumber,
          title: 'Videos',
          articleIds: [],
        };
        console.log(`\n📚 Quest ${questNumber}: Videos`);
      }

      const article = await createArticle(video, articleIndex);
      currentQuestData.articleIds.push(article._id);
      articleIndex++;
    }
  }

  // Save last quest
  if (currentQuestData && currentQuestData.articleIds.length > 0) {
    const questId = await createQuest(
      currentQuestData.number,
      currentQuestData.title,
      currentQuestData.articleIds,
      lessonId,
      seriesId
    );
    questIds.push(questId);
  }

  return questIds;
}

/**
 * Create Quest in Sanity
 */
async function createQuest(
  questNumber: number,
  title: string,
  articleIds: string[],
  lessonId: string,
  seriesId: string
): Promise<string> {
  // Quest IDを固定（タイムスタンプではなくシリーズIDとクエスト番号で）
  const questId = `webflow-series-${seriesId}-quest-${questNumber}`;

  const questDoc = {
    _type: 'quest',
    _id: questId,
    questNumber: questNumber,
    title: title,
    slug: {
      _type: 'slug',
      current: `${seriesId}-quest-${questNumber}`,
    },
    // goal: leave empty (optional field)
    estTimeMins: articleIds.length * 10, // 1記事あたり10分と仮定
    lesson: {
      _type: 'reference',
      _ref: lessonId,
    },
    articles: articleIds.map(id => ({
      _type: 'reference',
      _ref: id,
    })),
  };

  console.log(`  ✅ Creating quest: ${title} (${articleIds.length} articles) [${questId}]`);
  const result = await client.createOrReplace(questDoc);
  return result._id;
}

/**
 * Strip HTML tags from string
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Convert HTML to Portable Text blocks
 * Simplified version: converts basic HTML tags to Portable Text
 */
function htmlToPortableText(html: string): any[] {
  if (!html || html.trim() === '') {
    return [{
      _type: 'block',
      _key: randomKey(12),
      style: 'normal',
      children: [{
        _type: 'span',
        _key: randomKey(12),
        text: '',
      }],
    }];
  }

  const blocks: any[] = [];

  // Simple HTML parsing using JSDOM
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const body = document.body;

  // Process each top-level element
  body.childNodes.forEach((node) => {
    if (node.nodeType === 1) { // Element node
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      if (tagName === 'h2') {
        blocks.push({
          _type: 'block',
          _key: randomKey(12),
          style: 'h2',
          children: [{
            _type: 'span',
            _key: randomKey(12),
            text: element.textContent || '',
          }],
        });
      } else if (tagName === 'h3') {
        blocks.push({
          _type: 'block',
          _key: randomKey(12),
          style: 'h3',
          children: [{
            _type: 'span',
            _key: randomKey(12),
            text: element.textContent || '',
          }],
        });
      } else if (tagName === 'h4') {
        blocks.push({
          _type: 'block',
          _key: randomKey(12),
          style: 'h4',
          children: [{
            _type: 'span',
            _key: randomKey(12),
            text: element.textContent || '',
          }],
        });
      } else if (tagName === 'blockquote') {
        blocks.push({
          _type: 'block',
          _key: randomKey(12),
          style: 'blockquote',
          children: [{
            _type: 'span',
            _key: randomKey(12),
            text: element.textContent || '',
          }],
        });
      } else if (tagName === 'p') {
        blocks.push({
          _type: 'block',
          _key: randomKey(12),
          style: 'normal',
          children: [{
            _type: 'span',
            _key: randomKey(12),
            text: element.textContent || '',
          }],
        });
      } else if (tagName === 'ul') {
        // Process unordered list items (bullet points)
        element.querySelectorAll('li').forEach((li) => {
          blocks.push({
            _type: 'block',
            _key: randomKey(12),
            style: 'normal',
            listItem: 'bullet',
            children: [{
              _type: 'span',
              _key: randomKey(12),
              text: li.textContent || '',
            }],
          });
        });
      } else if (tagName === 'ol') {
        // Process ordered list items (numbered list)
        element.querySelectorAll('li').forEach((li) => {
          blocks.push({
            _type: 'block',
            _key: randomKey(12),
            style: 'normal',
            listItem: 'number',
            children: [{
              _type: 'span',
              _key: randomKey(12),
              text: li.textContent || '',
            }],
          });
        });
      }
    } else if (node.nodeType === 3) { // Text node
      const text = node.textContent?.trim();
      if (text) {
        blocks.push({
          _type: 'block',
          _key: randomKey(12),
          style: 'normal',
          children: [{
            _type: 'span',
            _key: randomKey(12),
            text: text,
          }],
        });
      }
    }
  });

  return blocks.length > 0 ? blocks : [{
    _type: 'block',
    _key: randomKey(12),
    style: 'normal',
    children: [{
      _type: 'span',
      _key: randomKey(12),
      text: stripHtml(html),
    }],
  }];
}

/**
 * Create Lesson in Sanity
 */
async function createLesson(
  series: WebflowSeries,
  questIds: string[]
): Promise<void> {
  const name = series.fieldData?.name || series.name;
  const slug = series.fieldData?.slug || series.slug;

  // Get description from Webflow: aboutthisseries (plain text)
  const descriptionRaw = series.fieldData?.['AboutThisSeries'] ||
                         series.fieldData?.['aboutthisseries'] ||
                         series['aboutthisseries'];

  // Convert HTML to plain text (strip tags)
  const description = descriptionRaw ? stripHtml(descriptionRaw) : undefined;

  // Get overview from Webflow: explainwhythisseries-description (Rich Text field)
  const overviewRaw = series.fieldData?.['ExplainWhyThisSeries-Description'] ||
                      series.fieldData?.['explainwhythisseries-description'] ||
                      series.fieldData?.['ExplainWhyThisSeriesDescription'] ||
                      series['ExplainWhyThisSeries-Description'];

  // Convert overview to Portable Text format to preserve formatting
  const overview = overviewRaw ? htmlToPortableText(overviewRaw) : undefined;

  // Get image URLs from Webflow
  // Cover image (OGP): ogp_thumbnail field
  const coverImageUrl = series.fieldData?.['ogp_thumbnail']?.url ||
                        series.fieldData?.['ogp-thumbnail']?.url ||
                        series.fieldData?.['ogpthumbnail']?.url ||
                        series['ogp_thumbnail']?.url;

  // Icon image: Thumbnail field
  const iconImageUrl = series.fieldData?.['Thumbnail']?.url ||
                       series.fieldData?.['thumbnail']?.url ||
                       series['Thumbnail']?.url;

  const lessonDoc = {
    _type: 'lesson',
    _id: `webflow-series-${series.id}`,
    title: name,
    slug: {
      _type: 'slug',
      current: slug,
    },
    description: description,
    overview: overview,
    coverImageUrl: coverImageUrl || null, // Add cover image URL for frontend
    iconImageUrl: iconImageUrl || null, // Add icon image URL for frontend
    webflowSource: series.id,
    quests: questIds.map(id => ({
      _type: 'reference',
      _ref: id,
    })),
  };

  console.log(`\n🎓 Creating lesson: ${name}`);
  await client.createOrReplace(lessonDoc);
  console.log(`  ✅ Lesson created with ${questIds.length} quests`);
}

/**
 * Main import function
 */
async function importFromWebflow(seriesId: string) {
  console.log(`\n🚀 Starting Webflow → Sanity import for series: ${seriesId}\n`);

  try {
    // 1. Fetch data from Webflow
    console.log('📥 Fetching Webflow data...');
    const series = await fetchWebflowSeries(seriesId);
    const videos = await fetchWebflowVideos(seriesId);
    console.log(`  → Series: ${series.name}`);
    console.log(`  → Videos: ${videos.length} found\n`);

    // 2. Generate Lesson ID
    const lessonId = `webflow-series-${seriesId}`;
    console.log(`📋 Lesson ID: ${lessonId}\n`);

    // 3. Create Lesson first (empty quests)
    console.log('📚 Creating Lesson in Sanity...');
    await createLesson(series, []);

    // 4. Create Quests and Articles (with lesson reference)
    console.log('📝 Creating Articles and Quests in Sanity...');
    const questIds = await createQuestsFromVideos(videos, lessonId, seriesId);

    // 5. Update Lesson with quest references
    console.log('🔄 Updating Lesson with Quest references...');
    await client
      .patch(lessonId)
      .set({
        quests: questIds.map(id => ({
          _type: 'reference',
          _ref: id,
        })),
      })
      .commit();
    console.log(`  ✅ Lesson updated with ${questIds.length} quests`);

    console.log('\n✅ Import completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const seriesIdArg = args.find(arg => arg.startsWith('--series-id='));

if (!seriesIdArg) {
  console.error('❌ Error: --series-id parameter is required');
  console.error('Usage: npm run import-webflow -- --series-id=684a8fd0ff2a7184d2108210');
  process.exit(1);
}

const seriesId = seriesIdArg.split('=')[1];
importFromWebflow(seriesId);
