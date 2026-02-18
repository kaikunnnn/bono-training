import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { ArticleWithContext, Event, Question, QuestionCategory, Feedback, FeedbackCategory } from "@/types/sanity";

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || "2024-01-01",
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

/**
 * Article Detail ページ用のデータ取得
 * 記事の詳細 + 所属するQuest + Lesson + サイドナビゲーション用の全データを取得
 *
 * Quest.lessonフィールドを使って直接Lessonを取得
 */
export async function getArticleWithContext(
  slug: string
): Promise<ArticleWithContext | null> {
  const articleQuery = `
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

      // 記事が所属するQuestを取得
      "questInfo": *[_type == "quest" && references(^._id)][0] {
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
        // Quest.lessonフィールドから直接Lessonを取得
        "lessonInfo": lesson-> {
          _id,
          title,
          slug,
          iconImage,
          iconImageUrl,
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

  const article = await client.fetch<any>(articleQuery, { slug });

  // 記事が見つからない場合
  if (!article) {
    return null;
  }

  // questInfo がない場合はそのまま返す（lessonInfo なし）
  if (!article.questInfo) {
    console.warn(`[getArticleWithContext] Article "${slug}" has no questInfo`);
    return article;
  }

  // lessonInfo がない場合は警告を出す
  if (!article.questInfo.lessonInfo) {
    console.warn(`[getArticleWithContext] Quest "${article.questInfo._id}" has no lesson reference`);
  }

  // lessonInfo をトップレベルに移動
  return {
    ...article,
    lessonInfo: article.questInfo.lessonInfo,
  };
}

/**
 * Event Detail ページ用のデータ取得
 * イベントの詳細を取得
 */
/**
 * 全イベント一覧を取得（デバッグ用）
 */
export async function getAllEvents(): Promise<Event[]> {
  const query = `*[_type == "event"] { _id, title, slug }`;
  const events = await client.fetch<Event[]>(query);
  console.log("[getAllEvents] Found events:", events);
  return events;
}

export async function getEvent(slug: string): Promise<Event | null> {
  console.log("[getEvent] Fetching event with slug:", slug);

  const eventQuery = `
    *[_type == "event" && slug.current == $slug][0] {
      _id,
      _type,
      title,
      slug,
      summary,
      registrationUrl,
      thumbnail {
        ...,
        "asset": asset-> {
          _id,
          url
        }
      },
      thumbnailUrl,
      eventMonth,
      eventPeriod,
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
      publishedAt
    }
  `;

  const event = await client.fetch<Event | null>(eventQuery, { slug });
  console.log("[getEvent] Result:", event);
  return event;
}

// ============================================
// Question 関連のクエリ
// ============================================

/**
 * 質問カテゴリ一覧を取得
 */
export async function getQuestionCategories(): Promise<QuestionCategory[]> {
  const query = `
    *[_type == "questionCategory"] | order(title asc) {
      _id,
      title,
      slug
    }
  `;
  return client.fetch<QuestionCategory[]>(query);
}

/**
 * 質問一覧を取得
 */
export async function getAllQuestions(): Promise<Question[]> {
  const query = `
    *[_type == "question"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      "category": category-> {
        _id,
        title,
        slug
      },
      "questionExcerpt": pt::text(questionContent)[0..150],
      publishedAt
    }
  `;
  return client.fetch<Question[]>(query);
}

/**
 * カテゴリ別の質問一覧を取得
 */
export async function getQuestionsByCategory(categorySlug: string): Promise<Question[]> {
  const query = `
    *[_type == "question" && category->slug.current == $categorySlug] | order(publishedAt desc) {
      _id,
      title,
      slug,
      "category": category-> {
        _id,
        title,
        slug
      },
      "questionExcerpt": pt::text(questionContent)[0..150],
      publishedAt
    }
  `;
  return client.fetch<Question[]>(query, { categorySlug });
}

/**
 * 質問詳細を取得
 */
export async function getQuestion(slug: string): Promise<Question | null> {
  const query = `
    *[_type == "question" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      "category": category-> {
        _id,
        title,
        slug
      },
      questionContent[] {
        ...,
        _type == "image" => {
          ...,
          "asset": asset-> {
            _id,
            url
          }
        }
      },
      answerContent[] {
        ...,
        _type == "image" => {
          ...,
          "asset": asset-> {
            _id,
            url
          }
        }
      },
      publishedAt
    }
  `;
  return client.fetch<Question | null>(query, { slug });
}

/**
 * 最近の質問を取得（詳細ページの下部に表示）
 */
export async function getRecentQuestions(limit: number = 3, excludeSlug?: string): Promise<Question[]> {
  const query = excludeSlug
    ? `
      *[_type == "question" && slug.current != $excludeSlug] | order(publishedAt desc)[0...$limit] {
        _id,
        title,
        slug,
        "category": category-> {
          _id,
          title,
          slug
        },
        publishedAt
      }
    `
    : `
      *[_type == "question"] | order(publishedAt desc)[0...$limit] {
        _id,
        title,
        slug,
        "category": category-> {
          _id,
          title,
          slug
        },
        publishedAt
      }
    `;
  return client.fetch<Question[]>(query, { limit, excludeSlug });
}

/**
 * 関連質問を取得（同じカテゴリの質問）
 */
export async function getRelatedQuestions(
  categorySlug: string,
  excludeSlug: string,
  limit: number = 3
): Promise<Question[]> {
  const query = `
    *[_type == "question" && category->slug.current == $categorySlug && slug.current != $excludeSlug] | order(publishedAt desc)[0...$limit] {
      _id,
      title,
      slug,
      "category": category-> {
        _id,
        title,
        slug
      },
      publishedAt
    }
  `;
  return client.fetch<Question[]>(query, { categorySlug, excludeSlug, limit });
}

// ============================================
// Feedback 関連のクエリ
// ============================================

/**
 * フィードバックカテゴリ一覧を取得
 */
export async function getFeedbackCategories(): Promise<FeedbackCategory[]> {
  const query = `
    *[_type == "feedbackCategory"] | order(title asc) {
      _id,
      title,
      slug
    }
  `;
  return client.fetch<FeedbackCategory[]>(query);
}

/**
 * フィードバック一覧を取得
 */
export async function getAllFeedbacks(): Promise<Feedback[]> {
  const query = `
    *[_type == "feedback"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      "category": category-> {
        _id,
        title,
        slug
      },
      targetOutput,
      "feedbackExcerpt": pt::text(feedbackContent)[0..150],
      publishedAt
    }
  `;
  return client.fetch<Feedback[]>(query);
}

/**
 * カテゴリ別のフィードバック一覧を取得
 */
export async function getFeedbacksByCategory(categorySlug: string): Promise<Feedback[]> {
  const query = `
    *[_type == "feedback" && category->slug.current == $categorySlug] | order(publishedAt desc) {
      _id,
      title,
      slug,
      "category": category-> {
        _id,
        title,
        slug
      },
      targetOutput,
      "feedbackExcerpt": pt::text(feedbackContent)[0..150],
      publishedAt
    }
  `;
  return client.fetch<Feedback[]>(query, { categorySlug });
}

/**
 * フィードバック詳細を取得
 */
export async function getFeedback(slug: string): Promise<Feedback | null> {
  const query = `
    *[_type == "feedback" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      "category": category-> {
        _id,
        title,
        slug
      },
      targetOutput,
      publishedAt,
      vimeoUrl,
      figmaUrl,
      reviewPoints[] {
        ...,
        _type == "image" => {
          ...,
          "asset": asset-> {
            _id,
            url
          }
        }
      },
      requestContent[] {
        ...,
        _type == "image" => {
          ...,
          "asset": asset-> {
            _id,
            url
          }
        }
      },
      feedbackContent[] {
        ...,
        _type == "image" => {
          ...,
          "asset": asset-> {
            _id,
            url
          }
        }
      }
    }
  `;
  return client.fetch<Feedback | null>(query, { slug });
}

/**
 * 最近のフィードバックを取得（詳細ページの下部に表示）
 */
export async function getRecentFeedbacks(limit: number = 3, excludeSlug?: string): Promise<Feedback[]> {
  const query = excludeSlug
    ? `
      *[_type == "feedback" && slug.current != $excludeSlug] | order(publishedAt desc)[0...$limit] {
        _id,
        title,
        slug,
        "category": category-> {
          _id,
          title,
          slug
        },
        targetOutput,
        publishedAt
      }
    `
    : `
      *[_type == "feedback"] | order(publishedAt desc)[0...$limit] {
        _id,
        title,
        slug,
        "category": category-> {
          _id,
          title,
          slug
        },
        targetOutput,
        publishedAt
      }
    `;
  return client.fetch<Feedback[]>(query, { limit, excludeSlug });
}

/**
 * 関連フィードバックを取得（同じカテゴリのフィードバック）
 */
export async function getRelatedFeedbacks(
  categorySlug: string,
  excludeSlug: string,
  limit: number = 3
): Promise<Feedback[]> {
  const query = `
    *[_type == "feedback" && category->slug.current == $categorySlug && slug.current != $excludeSlug] | order(publishedAt desc)[0...$limit] {
      _id,
      title,
      slug,
      "category": category-> {
        _id,
        title,
        slug
      },
      targetOutput,
      publishedAt
    }
  `;
  return client.fetch<Feedback[]>(query, { categorySlug, excludeSlug, limit });
}
