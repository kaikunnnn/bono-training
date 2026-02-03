/**
 * Webflow → Sanity インポートスクリプト
 *
 * 使用方法:
 *   # テストインポート（1件）
 *   npx ts-node scripts/webflow-import/import.ts --test
 *
 *   # 特定のレッスンをインポート
 *   npx ts-node scripts/webflow-import/import.ts --slug ui-trace
 *
 *   # 全件インポート
 *   npx ts-node scripts/webflow-import/import.ts --all
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createClient } from '@sanity/client';

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from sanity-studio/.env.local
dotenv.config({ path: 'sanity-studio/.env.local' });
dotenv.config({ path: '.env.local' });

// ============================================
// Configuration
// ============================================

const SANITY_PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.SANITY_STUDIO_DATASET || process.env.VITE_SANITY_DATASET || 'production';
const SANITY_TOKEN = process.env.SANITY_AUTH_TOKEN;

if (!SANITY_PROJECT_ID || !SANITY_TOKEN) {
  console.error('❌ Missing Sanity configuration');
  console.error('   SANITY_PROJECT_ID:', SANITY_PROJECT_ID ? '✓' : '✗');
  console.error('   SANITY_AUTH_TOKEN:', SANITY_TOKEN ? '✓' : '✗');
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
// Types
// ============================================

interface PreviewLesson {
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

interface PreviewQuest {
  _type: 'quest';
  _id: string;
  questNumber: number;
  title: string;
  lessonSlug: string;
  webflowId: string;
}

interface PreviewArticle {
  _type: 'article';
  _id: string;
  articleNumber: number;
  title: string;
  slug: { _type: 'slug'; current: string };
  contentType: 'video' | 'text';
  videoUrl?: string;
  videoDuration?: string;
  isPremium: boolean;
  questId: string;
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
  lessons: PreviewLesson[];
  quests: PreviewQuest[];
  articles: PreviewArticle[];
}

// ============================================
// Import Functions
// ============================================

async function checkExistingDocument(type: string, slug: string): Promise<string | null> {
  const query = `*[_type == $type && slug.current == $slug][0]._id`;
  const result = await sanityClient.fetch(query, { type, slug });
  return result || null;
}

async function importLesson(lesson: PreviewLesson, quests: PreviewQuest[], articles: PreviewArticle[]): Promise<void> {
  console.log(`\n📚 レッスン: ${lesson.title}`);

  // Check if lesson already exists
  const existingLesson = await checkExistingDocument('lesson', lesson.slug.current);
  if (existingLesson) {
    console.log(`   ⏭️  スキップ（既存: ${existingLesson}）`);
    return;
  }

  // Filter quests and articles for this lesson
  const lessonQuests = quests.filter(q => q.lessonSlug === lesson.slug.current);
  const questIds: string[] = [];

  // 1. Create articles first
  for (const quest of lessonQuests) {
    const questArticles = articles.filter(a => a.questId === quest._id);

    for (const article of questArticles) {
      const existingArticle = await checkExistingDocument('article', article.slug.current);
      if (existingArticle) {
        console.log(`   ⏭️  記事スキップ: ${article.title}`);
        continue;
      }

      const articleDoc = {
        _type: 'article',
        articleNumber: article.articleNumber,
        title: article.title,
        slug: article.slug,
        contentType: article.contentType,
        videoUrl: article.videoUrl,
        videoDuration: article.videoDuration,
        isPremium: article.isPremium,
        content: [], // Empty content for now
      };

      const created = await sanityClient.create(articleDoc);
      console.log(`   ✅ 記事作成: ${article.title} (${created._id})`);
    }
  }

  // 2. Create quests with article references
  for (const quest of lessonQuests) {
    const questArticles = articles.filter(a => a.questId === quest._id);

    // Get article IDs from Sanity
    const articleRefs = [];
    for (const article of questArticles) {
      const articleId = await checkExistingDocument('article', article.slug.current);
      if (articleId) {
        articleRefs.push({ _type: 'reference', _ref: articleId, _key: articleId });
      }
    }

    const questDoc = {
      _type: 'quest',
      questNumber: quest.questNumber,
      title: quest.title,
      slug: { _type: 'slug', current: `${lesson.slug.current}-quest-${quest.questNumber}` },
      articles: articleRefs,
      // lesson reference will be added after lesson is created
    };

    const createdQuest = await sanityClient.create(questDoc);
    questIds.push(createdQuest._id);
    console.log(`   ✅ クエスト作成: ${quest.title} (${createdQuest._id})`);
  }

  // 3. Create lesson with quest references
  const lessonDoc = {
    _type: 'lesson',
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description,
    iconImageUrl: lesson.iconImageUrl,
    thumbnailUrl: lesson.thumbnailUrl,
    isPremium: lesson.isPremium,
    quests: questIds.map((id, index) => ({ _type: 'reference', _ref: id, _key: `quest-${index}` })),
  };

  const createdLesson = await sanityClient.create(lessonDoc);
  console.log(`   ✅ レッスン作成: ${lesson.title} (${createdLesson._id})`);

  // 4. Update quests with lesson reference
  for (const questId of questIds) {
    await sanityClient.patch(questId).set({ lesson: { _type: 'reference', _ref: createdLesson._id } }).commit();
  }

  // 5. Update articles with quest reference
  for (const quest of lessonQuests) {
    const questArticles = articles.filter(a => a.questId === quest._id);
    const sanityQuestId = questIds[lessonQuests.indexOf(quest)];

    for (const article of questArticles) {
      const articleId = await checkExistingDocument('article', article.slug.current);
      if (articleId) {
        await sanityClient.patch(articleId).set({ quest: { _type: 'reference', _ref: sanityQuestId } }).commit();
      }
    }
  }

  console.log(`   🎉 完了: ${lessonQuests.length}クエスト, ${articles.filter(a => lessonQuests.some(q => q._id === a.questId)).length}記事`);
}

// ============================================
// Main
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const isAll = args.includes('--all');
  const slugIndex = args.indexOf('--slug');
  const targetSlug = slugIndex !== -1 ? args[slugIndex + 1] : null;

  console.log('🚀 Webflow → Sanity インポート開始\n');
  console.log(`   Project: ${SANITY_PROJECT_ID}`);
  console.log(`   Dataset: ${SANITY_DATASET}`);
  console.log('');

  // Load preview data
  const previewFiles = fs.readdirSync(path.join(__dirname, 'output'))
    .filter(f => f.startsWith('preview-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (previewFiles.length === 0) {
    console.error('❌ プレビューファイルが見つかりません');
    console.error('   先に preview.ts を実行してください');
    process.exit(1);
  }

  const previewPath = path.join(__dirname, 'output', previewFiles[0]);
  console.log(`📄 プレビューファイル: ${previewFiles[0]}\n`);

  const preview: PreviewResult = JSON.parse(fs.readFileSync(previewPath, 'utf-8'));

  let lessonsToImport: PreviewLesson[] = [];

  if (isTest) {
    // Test mode: import first small lesson (UIトレース入門)
    const testLesson = preview.lessons.find(l => l.slug.current === 'ui-trace');
    if (testLesson) {
      lessonsToImport = [testLesson];
    } else {
      // Fallback: first lesson with fewest articles
      lessonsToImport = [preview.lessons[0]];
    }
    console.log('🧪 テストモード: 1件のみインポート');
  } else if (targetSlug) {
    const lesson = preview.lessons.find(l => l.slug.current === targetSlug);
    if (!lesson) {
      console.error(`❌ スラッグ "${targetSlug}" のレッスンが見つかりません`);
      process.exit(1);
    }
    lessonsToImport = [lesson];
    console.log(`🎯 指定レッスン: ${targetSlug}`);
  } else if (isAll) {
    lessonsToImport = preview.lessons;
    console.log(`📦 全件インポート: ${lessonsToImport.length}件`);
  } else {
    console.log('使用方法:');
    console.log('  --test         テストインポート（1件）');
    console.log('  --slug <slug>  指定レッスンをインポート');
    console.log('  --all          全件インポート');
    process.exit(0);
  }

  console.log(`\n対象: ${lessonsToImport.length}レッスン\n`);
  console.log('='.repeat(50));

  for (const lesson of lessonsToImport) {
    try {
      await importLesson(lesson, preview.quests, preview.articles);
    } catch (error) {
      console.error(`❌ エラー: ${lesson.title}`, error);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ インポート完了');
}

main().catch(console.error);
