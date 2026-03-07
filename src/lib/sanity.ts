import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { LessonWithDetails, LessonMetadata, Lesson, ArticleWithContext } from "@/types/sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false, // リアルタイム更新のためCDNを無効化
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// ============================================
// Lesson 関連のクエリ（Server Components用）
// ============================================

/**
 * レッスン詳細を取得（SSR用）
 */
export async function getLesson(slug: string): Promise<LessonWithDetails | null> {
  const query = `
    *[_type == "lesson" && slug.current == $slug][0] {
      _id,
      _type,
      title,
      slug,
      description,
      lessonNumber,
      thumbnail,
      thumbnailUrl,
      iconImage,
      "iconImageUrl": iconImage.asset->url,
      tags,
      isPremium,
      overview,
      contentHeading,
      "quests": quests[]-> {
        _id,
        questNumber,
        title,
        goal,
        "articles": articles[]-> {
          _id,
          title,
          slug,
          articleType,
          videoDuration,
          isPremium
        }
      }
    }
  `;

  const lesson = await client.fetch<LessonWithDetails | null>(query, { slug });

  if (!lesson) {
    return null;
  }

  // 記事数と総時間を計算
  let totalArticles = 0;
  let totalDuration = 0;

  if (lesson.quests) {
    for (const quest of lesson.quests) {
      if (quest.articles) {
        totalArticles += quest.articles.length;
        for (const article of quest.articles) {
          if (article.videoDuration) {
            const duration = typeof article.videoDuration === 'string'
              ? parseInt(article.videoDuration, 10)
              : article.videoDuration;
            if (!isNaN(duration)) {
              totalDuration += duration;
            }
          }
        }
      }
    }
  }

  return {
    ...lesson,
    totalArticles,
    totalDuration,
  };
}

/**
 * OGP用のレッスンメタデータを取得
 */
export async function getLessonMetadata(slug: string): Promise<LessonMetadata | null> {
  const query = `
    *[_type == "lesson" && slug.current == $slug][0] {
      title,
      description,
      "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
      "iconImageUrl": iconImage.asset->url
    }
  `;

  return client.fetch<LessonMetadata | null>(query, { slug });
}

/**
 * すべてのレッスンスラッグを取得（静的生成用）
 */
export async function getAllLessonSlugs(): Promise<string[]> {
  const query = `*[_type == "lesson"].slug.current`;
  return client.fetch<string[]>(query);
}

/**
 * すべてのレッスンを取得（一覧ページ用）
 */
export async function getAllLessons(): Promise<Lesson[]> {
  const query = `
    *[_type == "lesson"] | order(lessonNumber asc) {
      _id,
      _type,
      title,
      slug,
      description,
      lessonNumber,
      thumbnail,
      thumbnailUrl,
      iconImage,
      "iconImageUrl": iconImage.asset->url,
      tags,
      isPremium
    }
  `;
  return client.fetch<Lesson[]>(query);
}

// ============================================
// Article 関連のクエリ（Server Components用）
// ============================================

/**
 * 記事詳細を取得（SSR用）
 * Quest と Lesson のコンテキスト情報も含む
 */
export async function getArticleWithContext(slug: string): Promise<ArticleWithContext | null> {
  const query = `
    *[_type == "article" && slug.current == $slug][0] {
      _id,
      _type,
      articleNumber,
      articleType,
      title,
      slug,
      excerpt,
      thumbnail,
      thumbnailUrl,
      videoUrl,
      videoDuration,
      content[] {
        ...,
        _type == "image" => {
          ...,
          "asset": asset-> {
            _id,
            url
          }
        }
      },
      learningObjectives,
      publishedAt,
      author,
      tags,
      isPremium,
      "questInfo": *[_type == "quest" && ^._id in articles[]._ref][0] {
        _id,
        questNumber,
        title,
        "articles": articles[]-> {
          _id,
          articleType,
          title,
          slug,
          videoDuration,
          isPremium
        },
        "lessonInfo": lesson-> {
          _id,
          title,
          slug,
          iconImage,
          "iconImageUrl": iconImage.asset->url,
          "quests": quests[]-> {
            _id,
            questNumber,
            title,
            "articles": articles[]-> {
              _id,
              articleType,
              title,
              slug,
              videoDuration,
              isPremium
            }
          }
        }
      }
    }
  `;

  const article = await client.fetch<ArticleWithContext | null>(query, { slug });

  if (!article) {
    return null;
  }

  // lessonInfo をトップレベルに移動
  if (article.questInfo?.lessonInfo) {
    return {
      ...article,
      lessonInfo: article.questInfo.lessonInfo,
    };
  }

  return article;
}

/**
 * OGP用の記事メタデータを取得
 */
export interface ArticleMetadata {
  title: string;
  excerpt?: string;
  thumbnailUrl?: string;
  lessonTitle?: string;
}

export async function getArticleMetadata(slug: string): Promise<ArticleMetadata | null> {
  const query = `
    *[_type == "article" && slug.current == $slug][0] {
      title,
      excerpt,
      "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
      "lessonTitle": *[_type == "quest" && ^._id in articles[]._ref][0].lesson->title
    }
  `;

  return client.fetch<ArticleMetadata | null>(query, { slug });
}
