import { client } from '@/lib/sanity';
import type { Lesson, SanitySlug } from '@/types/sanity';

export interface ArticleInfo {
  _id: string;
  title: string;
  slug: SanitySlug;
  articleNumber?: number;
}

export interface LessonWithArticles extends Lesson {
  articleIds: string[];
  articles: ArticleInfo[];
  questCount: number;
  iconImageUrl?: string;
}

/**
 * すべてのレッスンと記事IDを取得
 * 注意: Lesson → Quest → Article という構造のため、Quest経由で記事を取得
 */
export async function getAllLessonsWithArticles(): Promise<LessonWithArticles[]> {
  const query = `*[_type == "lesson"] | order(lessonNumber asc) {
    _id,
    _type,
    title,
    slug,
    description,
    lessonNumber,
    coverImage,
    iconImage,
    tags,
    isPremium,
    "iconImageUrl": iconImage.asset->url,
    "quests": quests[]-> {
      _id,
      "articles": articles[]-> {
        _id,
        title,
        slug,
        articleNumber
      }
    },
    "questCount": count(quests)
  }`;

  const lessons = await client.fetch<any[]>(query);

  // Quest経由の記事をフラットにして、articleIds と articles を生成
  return lessons.map(lesson => {
    const allArticles: ArticleInfo[] = [];
    const allArticleIds: string[] = [];

    if (lesson.quests) {
      for (const quest of lesson.quests) {
        if (quest.articles) {
          for (const article of quest.articles) {
            allArticles.push(article);
            allArticleIds.push(article._id);
          }
        }
      }
    }

    return {
      ...lesson,
      articleIds: allArticleIds,
      articles: allArticles,
      questCount: lesson.questCount || 0,
    };
  });
}

/**
 * レッスンの次の未完了記事を取得
 * @param articles レッスン内の記事一覧
 * @param completedArticleIds 完了した記事IDの配列
 * @returns 次の未完了記事 または undefined
 */
export function getNextIncompleteArticle(
  articles: ArticleInfo[],
  completedArticleIds: string[]
): ArticleInfo | undefined {
  return articles.find(article => !completedArticleIds.includes(article._id));
}
