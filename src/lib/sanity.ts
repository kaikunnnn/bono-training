import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { LessonWithDetails, LessonMetadata, Lesson, ArticleWithContext, Feedback, FeedbackCategory } from "@/types/sanity";
import type { SanityRoadmapListItem, SanityRoadmapDetail } from "@/types/sanity-roadmap";
import type { Guide, GuideCategory } from "@/types/guide";

// Sanity client（遅延初期化：ビルド時のpage data収集でenv未設定エラーを防ぐ）
let _client: ReturnType<typeof createClient> | null = null;

function getClient(): ReturnType<typeof createClient> {
  if (!_client) {
    _client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
      useCdn: false, // リアルタイム更新のためCDNを無効化
    });
  }
  return _client;
}

/**
 * 遅延初期化されたSanityクライアントを取得する関数。
 * Proxyはprivateフィールドを転送できないため関数エクスポートに変更。
 */
export { getClient as client };

let _builder: ReturnType<typeof imageUrlBuilder> | null = null;

export function urlFor(source: Parameters<ReturnType<typeof imageUrlBuilder>["image"]>[0]) {
  if (!_builder) {
    _builder = imageUrlBuilder(getClient());
  }
  return _builder.image(source);
}

// ============================================
// Lesson 関連のクエリ（Server Components用）
// ============================================

/**
 * レッスン詳細を取得（SSR用）
 */
export const getLesson = unstable_cache(
  async (slug: string): Promise<LessonWithDetails | null> => {
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
      iconImage {
        _type,
        asset {
          _ref,
          _type
        }
      },
      "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url),
      tags,
      "category": category->title,
      isPremium,
      overview,
      purposes,
      contentHeading,
      "quests": quests[]-> {
        _id,
        questNumber,
        title,
        description,
        goal,
        estTimeMins,
        "articles": articles[]-> {
          _id,
          title,
          slug,
          articleType,
          thumbnail {
            _type,
            asset {
              _ref,
              _type
            }
          },
          thumbnailUrl,
          videoUrl,
          videoDuration,
          isPremium
        }
      }
    }
  `;

  const lesson = await getClient().fetch<LessonWithDetails | null>(query, { slug });

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
  },
  ["sanity:lesson"],
  { tags: ["lesson", "article", "quest"], revalidate: 3600 }
);

/**
 * OGP用のレッスンメタデータを取得
 */
export const getLessonMetadata = unstable_cache(
  async (slug: string): Promise<LessonMetadata | null> => {
    const query = `
      *[_type == "lesson" && slug.current == $slug][0] {
        title,
        description,
        "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
        "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url)
      }
    `;

    return getClient().fetch<LessonMetadata | null>(query, { slug });
  },
  ["sanity:lesson:metadata"],
  { tags: ["lesson"], revalidate: 3600 }
);

/**
 * すべてのレッスンスラッグを取得（静的生成用）
 */
export const getAllLessonSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const query = `*[_type == "lesson"].slug.current`;
    return getClient().fetch<string[]>(query);
  },
  ["sanity:lessons:slugs"],
  { tags: ["lesson"], revalidate: 3600 }
);

/**
 * すべてのレッスンを取得（一覧ページ用）
 */
export const getAllLessons = unstable_cache(
  async (): Promise<Lesson[]> => {
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
        "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url),
        tags,
        isPremium
      }
    `;
    return getClient().fetch<Lesson[]>(query);
  },
  ["sanity:lessons:all"],
  { tags: ["lesson"], revalidate: 3600 }
);

export interface LessonWithArticleIds extends Lesson {
  articleIds: string[];
}

/**
 * すべてのレッスンを記事ID付きで取得（進捗計算用）
 */
export const getAllLessonsWithArticleIds = unstable_cache(
  async (): Promise<LessonWithArticleIds[]> => {
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
        "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url),
        tags,
        isPremium,
        "articleIds": quests[]->articles[]->_id,
        "quests": quests[]-> {
          "articles": articles[]-> {
            _id,
            title,
            slug
          }
        }
      }
    `;
    const lessons = await getClient().fetch<LessonWithArticleIds[]>(query);
    // articleIds内のnullを除去
    return lessons.map(lesson => ({
      ...lesson,
      articleIds: (lesson.articleIds || []).filter(Boolean),
    }));
  },
  ["sanity:lessons:withArticleIds"],
  { tags: ["lesson", "article", "quest"], revalidate: 3600 }
);

// ============================================
// Article 関連のクエリ（Server Components用）
// ============================================

/**
 * 記事詳細を取得（SSR用）
 * Quest と Lesson のコンテキスト情報も含む
 */
export const getArticleWithContext = cache(unstable_cache(
  async (slug: string): Promise<ArticleWithContext | null> => {
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
          "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url),
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

  const article = await getClient().fetch<ArticleWithContext | null>(query, { slug });

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
  },
  ["sanity:article:withContext"],
  { tags: ["article", "quest", "lesson"], revalidate: 3600 }
));

/**
 * OGP用の記事メタデータを取得
 */
export interface ArticleMetadata {
  title: string;
  excerpt?: string;
  thumbnailUrl?: string;
  lessonTitle?: string;
}

export const getArticleMetadata = unstable_cache(
  async (slug: string): Promise<ArticleMetadata | null> => {
    const query = `
      *[_type == "article" && slug.current == $slug][0] {
        title,
        excerpt,
        "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
        "lessonTitle": *[_type == "quest" && ^._id in articles[]._ref][0].lesson->title
      }
    `;

    return getClient().fetch<ArticleMetadata | null>(query, { slug });
  },
  ["sanity:article:metadata"],
  { tags: ["article", "quest", "lesson"], revalidate: 3600 }
);

// ============================================
// Article 一覧用クエリ
// ============================================

export interface ArticleListItem {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  thumbnailUrl?: string;
  articleType?: string;
  videoDuration?: string | number;
  isPremium?: boolean;
  publishedAt?: string;
  lessonTitle?: string;
  lessonSlug?: string;
}

/**
 * すべての記事を取得（一覧ページ用）
 */
export const getAllArticles = unstable_cache(
  async (): Promise<ArticleListItem[]> => {
    const query = `
      *[_type == "article"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
        articleType,
        videoDuration,
        isPremium,
        publishedAt,
        "lessonTitle": *[_type == "quest" && ^._id in articles[]._ref][0].lesson->title,
        "lessonSlug": *[_type == "quest" && ^._id in articles[]._ref][0].lesson->slug.current
      }
    `;
    return getClient().fetch<ArticleListItem[]>(query);
  },
  ["sanity:articles:all"],
  { tags: ["article", "quest", "lesson"], revalidate: 3600 }
);

/**
 * レッスンに紐づく記事を取得
 */
export const getArticlesByLesson = unstable_cache(
  async (lessonSlug: string): Promise<ArticleListItem[]> => {
    const query = `
      *[_type == "article" &&
        _id in *[_type == "quest" &&
          lesson->slug.current == $lessonSlug
        ].articles[]._ref
      ] | order(articleNumber asc) {
        _id,
        title,
        slug,
        excerpt,
        "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
        articleType,
        videoDuration,
        isPremium,
        publishedAt
      }
    `;
    return getClient().fetch<ArticleListItem[]>(query, { lessonSlug });
  },
  ["sanity:articles:byLesson"],
  { tags: ["article", "quest", "lesson"], revalidate: 3600 }
);

// ============================================
// Feedback 関連のクエリ（Server Components用）
// ============================================

/**
 * すべてのフィードバックカテゴリを取得
 */
export const getFeedbackCategories = unstable_cache(
  async (): Promise<FeedbackCategory[]> => {
    const query = `
      *[_type == "feedbackCategory"] | order(title asc) {
        _id,
        title,
        slug
      }
    `;
    return getClient().fetch<FeedbackCategory[]>(query);
  },
  ["sanity:feedbackCategories:all"],
  { tags: ["feedbackCategory"], revalidate: 3600 }
);

/**
 * すべてのフィードバックを取得
 */
export const getAllFeedbacks = unstable_cache(
  async (): Promise<Feedback[]> => {
    const query = `
      *[_type == "feedback"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        targetOutput,
        excerpt,
        publishedAt,
        vimeoUrl,
        figmaUrl,
        "category": category-> {
          _id,
          title,
          slug
        }
      }
    `;
    return getClient().fetch<Feedback[]>(query);
  },
  ["sanity:feedbacks:all"],
  { tags: ["feedback", "feedbackCategory"], revalidate: 3600 }
);

/**
 * カテゴリ別のフィードバックを取得
 */
export const getFeedbacksByCategory = unstable_cache(
  async (categorySlug: string): Promise<Feedback[]> => {
    const query = `
      *[_type == "feedback" && category->slug.current == $categorySlug] | order(publishedAt desc) {
        _id,
        title,
        slug,
        targetOutput,
        excerpt,
        publishedAt,
        vimeoUrl,
        figmaUrl,
        "category": category-> {
          _id,
          title,
          slug
        }
      }
    `;
    return getClient().fetch<Feedback[]>(query, { categorySlug });
  },
  ["sanity:feedbacks:byCategory"],
  { tags: ["feedback", "feedbackCategory"], revalidate: 3600 }
);

/**
 * フィードバック詳細を取得
 */
export const getFeedback = unstable_cache(
  async (slug: string): Promise<Feedback | null> => {
    const query = `
      *[_type == "feedback" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        targetOutput,
        excerpt,
        publishedAt,
        vimeoUrl,
        figmaUrl,
        reviewPoints,
        requestContent,
        feedbackContent,
        "category": category-> {
          _id,
          title,
          slug
        }
      }
    `;
    return getClient().fetch<Feedback | null>(query, { slug });
  },
  ["sanity:feedback"],
  { tags: ["feedback", "feedbackCategory"], revalidate: 3600 }
);

/**
 * 最近のフィードバックを取得
 */
export const getRecentFeedbacks = unstable_cache(
  async (limit: number = 4, excludeSlug?: string): Promise<Feedback[]> => {
    const query = excludeSlug
      ? `
        *[_type == "feedback" && slug.current != $excludeSlug] | order(publishedAt desc) [0...$limit] {
          _id,
          title,
          slug,
          targetOutput,
          excerpt,
          publishedAt,
          "category": category-> {
            _id,
            title,
            slug
          }
        }
      `
      : `
        *[_type == "feedback"] | order(publishedAt desc) [0...$limit] {
          _id,
          title,
          slug,
          targetOutput,
          excerpt,
          publishedAt,
          "category": category-> {
            _id,
            title,
            slug
          }
        }
      `;
    return getClient().fetch<Feedback[]>(query, { limit, excludeSlug });
  },
  ["sanity:feedbacks:recent"],
  { tags: ["feedback", "feedbackCategory"], revalidate: 3600 }
);

/**
 * 関連フィードバックを取得（同カテゴリ）
 */
export const getRelatedFeedbacks = unstable_cache(
  async (
    categorySlug: string,
    excludeSlug: string,
    limit: number = 3
  ): Promise<Feedback[]> => {
    const query = `
      *[_type == "feedback" && category->slug.current == $categorySlug && slug.current != $excludeSlug] | order(publishedAt desc) [0...$limit] {
        _id,
        title,
        slug,
        targetOutput,
        excerpt,
        publishedAt,
        "category": category-> {
          _id,
          title,
          slug
        }
      }
    `;
    return getClient().fetch<Feedback[]>(query, { categorySlug, excludeSlug, limit });
  },
  ["sanity:feedbacks:related"],
  { tags: ["feedback", "feedbackCategory"], revalidate: 3600 }
);

/**
 * すべてのフィードバックスラッグを取得（静的生成用）
 */
export const getAllFeedbackSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const query = `*[_type == "feedback"].slug.current`;
    return getClient().fetch<string[]>(query);
  },
  ["sanity:feedbacks:slugs"],
  { tags: ["feedback"], revalidate: 3600 }
);

// ============================================
// Blog 関連のクエリ（Server Components用）
// ============================================

import type { BlogPost, BlogPostsResponse } from "@/types/blog";
import type { PortableTextBlock } from "@portabletext/types";

interface SanityBlogPost {
  _id: string;
  title: string;
  slug?: { current?: string };
  publishedAt?: string;
  author?: string;
  description?: string;
  content?: PortableTextBlock[];
  contentHtml?: string;
  emoji?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  thumbnail?: Parameters<ReturnType<typeof imageUrlBuilder>["image"]>[0];
  thumbnailUrl?: string;
}

const DEFAULT_THUMBNAIL = "/placeholder-thumbnail.svg";

function estimateReadingTime(content: string | PortableTextBlock[]): number {
  if (typeof content === "string") {
    const text = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return Math.max(1, Math.round(text.length / 600));
  }

  const text = content
    .map((b) => {
      if ((b as { _type?: string })?._type !== "block") return "";
      const children = ((b as { children?: Array<{ text?: string }> }).children ?? []);
      return children.map((c) => c.text ?? "").join(" ");
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return Math.max(1, Math.round(text.length / 600));
}

function toBlogPost(doc: SanityBlogPost): BlogPost {
  const slug = doc.slug?.current ?? "";
  const publishedAt = doc.publishedAt ?? new Date().toISOString();
  const category = doc.category ?? "uncategorized";
  const content = doc.content ?? doc.contentHtml ?? "";

  const uploadedThumbnail = doc.thumbnail
    ? urlFor(doc.thumbnail).width(1200).height(675).fit("crop").url()
    : null;
  const thumbnail = uploadedThumbnail || doc.thumbnailUrl || DEFAULT_THUMBNAIL;

  return {
    id: doc._id,
    slug,
    title: doc.title,
    description: doc.description ?? "",
    content,
    author: doc.author ?? "BONO",
    publishedAt,
    category,
    tags: doc.tags ?? [],
    thumbnail,
    featured: !!doc.featured,
    readingTime: estimateReadingTime(content),
    emoji: doc.emoji,
  };
}

/**
 * ブログ記事一覧を取得
 */
export const getBlogPosts = unstable_cache(
  async (params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<BlogPostsResponse> => {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 9;
    const start = (page - 1) * limit;
    const end = start + limit;

    const categoryFilter = params?.category ? " && category == $category" : "";

    const query = `{
      "total": count(*[_type == "blogPost"${categoryFilter}]),
      "posts": *[_type == "blogPost"${categoryFilter}] | order(publishedAt desc) [$start...$end]{
        _id,
        title,
        slug,
        publishedAt,
        author,
        description,
        content[] {
          ...,
          _type == "image" => {
            ...,
            "asset": asset->{
              _id,
              url
            }
          }
        },
        contentHtml,
        emoji,
        category,
        tags,
        featured,
        thumbnail {
          ...,
          asset->
        },
        thumbnailUrl
      }
    }`;

    const data = await getClient().fetch<{ total: number; posts: SanityBlogPost[] }>(query, {
      start,
      end,
      category: params?.category,
    });

    const posts = (data?.posts ?? []).map(toBlogPost);
    const total = data?.total ?? posts.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts: total,
        postsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },
  ["sanity:blog:posts"],
  { tags: ["blogPost"], revalidate: 3600 }
);

/**
 * スラッグでブログ記事を取得
 */
export const getBlogPost = unstable_cache(
  async (slug: string): Promise<BlogPost | null> => {
    const query = `*[_type == "blogPost" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      publishedAt,
      author,
      description,
      content[] {
        ...,
        _type == "image" => {
          ...,
          "asset": asset->{
            _id,
            url
          }
        }
      },
      contentHtml,
      emoji,
      category,
      tags,
      featured,
      thumbnail {
        ...,
        asset->
      },
      thumbnailUrl
    }`;

    const doc = await getClient().fetch<SanityBlogPost | null>(query, { slug });
    if (!doc?._id) return null;
    return toBlogPost(doc);
  },
  ["sanity:blog:post"],
  { tags: ["blogPost"], revalidate: 3600 }
);

/**
 * 最新のブログ記事を取得
 */
export const getLatestBlogPosts = unstable_cache(
  async (limit: number = 4, excludeId?: string): Promise<BlogPost[]> => {
    const filter = excludeId ? "&& _id != $excludeId" : "";
    const query = `*[_type == "blogPost" ${filter}] | order(publishedAt desc) [0...$limit]{
      _id,
      title,
      slug,
      publishedAt,
      author,
      description,
      emoji,
      category,
      tags,
      featured,
      thumbnail {
        ...,
        asset->
      },
      thumbnailUrl
    }`;

    const docs = await getClient().fetch<SanityBlogPost[]>(query, { excludeId, limit });
    return (docs ?? []).map(toBlogPost);
  },
  ["sanity:blog:latest"],
  { tags: ["blogPost"], revalidate: 3600 }
);

/**
 * 前の記事を取得（公開日が現在の記事より前の最新記事）
 */
export const getPrevBlogPost = unstable_cache(
  async (currentId: string): Promise<BlogPost | null> => {
    const current = await getClient().fetch<{ publishedAt?: string } | null>(
      `*[_type == "blogPost" && _id == $id][0]{ publishedAt }`,
      { id: currentId }
    );
    if (!current?.publishedAt) return null;

    const query = `*[_type == "blogPost" && publishedAt < $publishedAt] | order(publishedAt desc)[0]{
      _id, title, slug, publishedAt, author, description, emoji, category, tags, featured,
      thumbnail { ..., asset-> }, thumbnailUrl
    }`;
    const doc = await getClient().fetch<SanityBlogPost | null>(query, { publishedAt: current.publishedAt });
    return doc?._id ? toBlogPost(doc) : null;
  },
  ["sanity:blog:prev"],
  { tags: ["blogPost"], revalidate: 3600 }
);

/**
 * 次の記事を取得（公開日が現在の記事より後の最古の記事）
 */
export const getNextBlogPost = unstable_cache(
  async (currentId: string): Promise<BlogPost | null> => {
    const current = await getClient().fetch<{ publishedAt?: string } | null>(
      `*[_type == "blogPost" && _id == $id][0]{ publishedAt }`,
      { id: currentId }
    );
    if (!current?.publishedAt) return null;

    const query = `*[_type == "blogPost" && publishedAt > $publishedAt] | order(publishedAt asc)[0]{
      _id, title, slug, publishedAt, author, description, emoji, category, tags, featured,
      thumbnail { ..., asset-> }, thumbnailUrl
    }`;
    const doc = await getClient().fetch<SanityBlogPost | null>(query, { publishedAt: current.publishedAt });
    return doc?._id ? toBlogPost(doc) : null;
  },
  ["sanity:blog:next"],
  { tags: ["blogPost"], revalidate: 3600 }
);

/**
 * すべてのブログスラッグを取得（静的生成用）
 */
export const getAllBlogSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const query = `*[_type == "blogPost"].slug.current`;
    return getClient().fetch<string[]>(query);
  },
  ["sanity:blog:slugs"],
  { tags: ["blogPost"], revalidate: 3600 }
);

// ============================================
// Training 関連のクエリ（Server Components用）
// ============================================

export interface SanityTrainingListItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  difficulty: string;
  category: string;
  tags: string[];
  isPremium: boolean;
  iconImageUrl: string;
  thumbnailUrl: string;
  backgroundSvg: string;
  estimatedTotalTime: string;
  task_count: number;
}

/**
 * トレーニング一覧を取得（Sanityから直接）
 * Edge Function のフォールバックとして使用
 */
export const getTrainingListFromSanity = unstable_cache(
  async (): Promise<SanityTrainingListItem[]> => {
    const query = `
      *[_type == "training"] | order(orderIndex asc) {
        _id,
        title,
        "slug": slug.current,
        description,
        "type": trainingType,
        difficulty,
        "category": category->title,
        tags,
        isPremium,
        orderIndex,
        iconImageUrl,
        thumbnailUrl,
        backgroundSvg,
        estimatedTotalTime,
        "task_count": count(tasks)
      }
    `;
    return getClient().fetch<SanityTrainingListItem[]>(query);
  },
  ["sanity:training:list"],
  { tags: ["training"], revalidate: 3600 }
);

export interface SanityTrainingDetailItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  difficulty: string;
  category: string;
  tags: string[];
  isPremium: boolean;
  iconImageUrl: string;
  thumbnailUrl: string;
  backgroundSvg: string;
  tasks: Array<{
    _id: string;
    title: string;
    slug: string;
    orderIndex: number;
    isPremium: boolean;
  }>;
}

/**
 * トレーニング詳細を取得（Sanityから直接）
 * Edge Function のフォールバックとして使用
 */
export const getTrainingDetailFromSanity = unstable_cache(
  async (slug: string): Promise<SanityTrainingDetailItem | null> => {
    const query = `
      *[_type == "training" && slug.current == $slug][0] {
        _id,
        title,
        "slug": slug.current,
        description,
        "type": trainingType,
        difficulty,
        "category": category->title,
        tags,
        isPremium,
        iconImageUrl,
        thumbnailUrl,
        backgroundSvg,
        "tasks": tasks[]-> {
          _id,
          title,
          "slug": slug.current,
          orderIndex,
          isPremium
        }
      }
    `;
    return getClient().fetch<SanityTrainingDetailItem | null>(query, { slug });
  },
  ["sanity:training:detail"],
  { tags: ["training", "trainingTask"], revalidate: 3600 }
);

/**
 * タスク詳細をSanityから直接取得（mainと同じGROQクエリ）
 * sections[]（Portable Text）を含む完全なタスクデータを返す
 */
interface SanityTrainingTaskDetail {
  _id: string;
  title: string;
  slug: string;
  description: string;
  orderIndex: number;
  isPremium: boolean;
  category: string;
  tags: string[];
  videoFull: string;
  videoPreview: string;
  previewSec: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sections: any[];
  training: { _id: string; title: string; slug: string; type: string };
  allTasks: { _id: string; title: string; slug: string; orderIndex: number }[];
}

export const getTrainingTaskDetailFromSanity = unstable_cache(
  async (
    trainingSlug: string,
    taskSlug: string
  ): Promise<SanityTrainingTaskDetail | null> => {
    const query = `
      *[_type == "trainingTask" && slug.current == $taskSlug && training->slug.current == $trainingSlug][0] {
        _id,
        title,
        "slug": slug.current,
        description,
        orderIndex,
        isPremium,
        category,
        tags,
        videoFull,
        videoPreview,
        previewSec,
        sections[] {
          _key,
          sectionTitle,
          sectionType,
          content
        },
        "training": training-> {
          _id,
          title,
          "slug": slug.current,
          "type": trainingType
        },
        "allTasks": training->tasks[]-> {
          _id,
          title,
          "slug": slug.current,
          orderIndex
        } | order(orderIndex asc)
      }
    `;
    return getClient().fetch<SanityTrainingTaskDetail | null>(query, { trainingSlug, taskSlug });
  },
  ["sanity:training:task"],
  { tags: ["trainingTask", "training"], revalidate: 3600 }
);

// ============================================
// Guide 関連のクエリ（Server Components用 — Sanity直接連携）
// ============================================

const GUIDE_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  category,
  description,
  isPremium,
  "thumbnailUrl": thumbnail.asset->url,
  videoUrl,
  linkUrl,
  tags,
  author,
  readingTime,
  publishedAt,
  updatedAt
`;

export const getAllGuidesFromSanity = unstable_cache(
  async (): Promise<Guide[]> => {
    const query = `*[_type == "guide" && defined(content) && length(content) > 0] | order(publishedAt desc) { ${GUIDE_FIELDS} }`;
    return getClient().fetch<Guide[]>(query);
  },
  ["sanity:guides:all"],
  { tags: ["guide"], revalidate: 3600 }
);

export const getGuidesByCategoryFromSanity = unstable_cache(
  async (category: GuideCategory): Promise<Guide[]> => {
    const query = `*[_type == "guide" && category == $category && defined(content) && length(content) > 0] | order(publishedAt desc) { ${GUIDE_FIELDS} }`;
    return getClient().fetch<Guide[]>(query, { category });
  },
  ["sanity:guides:byCategory"],
  { tags: ["guide"], revalidate: 3600 }
);

export const getGuideFromSanity = unstable_cache(
  async (slug: string): Promise<Guide | null> => {
    const query = `
      *[_type == "guide" && slug.current == $slug][0] {
        ${GUIDE_FIELDS},
        content[] {
          ...,
          _type == "image" => {
            ...,
            "asset": asset-> { _id, url }
          }
        }
      }
    `;
    return getClient().fetch<Guide | null>(query, { slug });
  },
  ["sanity:guide"],
  { tags: ["guide"], revalidate: 3600 }
);

export const getAllGuideSlugsFromSanity = unstable_cache(
  async (): Promise<string[]> => {
    const query = `*[_type == "guide"]{ "slug": slug.current }.slug`;
    return getClient().fetch<string[]>(query);
  },
  ["sanity:guides:slugs"],
  { tags: ["guide"], revalidate: 3600 }
);

// ============================================
// Event 関連のクエリ（Server Components用）
// ============================================

export const getEvent = unstable_cache(
  async (slug: string) => {
    const query = `
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
    return getClient().fetch(query, { slug });
  },
  ["sanity:event"],
  { tags: ["event"], revalidate: 3600 }
);

// ============================================
// Roadmap 関連のクエリ（Server Components用）
// ============================================

/**
 * コンテンツ取得用の共通GROQフラグメント
 * Sanityには2種類のデータ構造が存在:
 * 1. 直接参照型: { _type: "reference", _ref: "..." }
 * 2. contentItem型: { _type: "contentItem", itemType: "lesson|roadmap|externalLink", lesson/roadmap: { _ref: "..." } }
 */
const CONTENTS_PROJECTION = `contents[]{
  _type == "reference" => @->{
    _id,
    _type,
    title,
    slug,
    description,
    "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
    "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url),
    gradientPreset,
    estimatedDuration,
    shortTitle,
    "stepCount": count(steps)
  },
  _type == "contentItem" && itemType == "lesson" => lesson->{
    _id,
    _type,
    title,
    slug,
    description,
    "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
    "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url)
  },
  _type == "contentItem" && itemType == "roadmap" => roadmap->{
    _id,
    _type,
    title,
    slug,
    description,
    "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
    gradientPreset,
    estimatedDuration
  },
  _type == "contentItem" && itemType == "externalLink" => {
    "_key": _key,
    "_type": "externalLink",
    "url": externalUrl,
    "title": externalTitle,
    "description": externalDescription,
    "thumbnailUrl": externalThumbnailUrl
  },
  _type == "contentItem" && itemType == "link" => {
    "_key": _key,
    "_type": "externalLink",
    "url": linkUrl,
    "title": linkLabel,
    "description": null,
    "thumbnailUrl": null
  },
  _type == "externalLink" => {
    _key,
    _type,
    url,
    title,
    description,
    thumbnailUrl
  }
}`;

/**
 * ロードマップ一覧を取得（SSR用）
 */
export const getAllRoadmaps = unstable_cache(
  async (): Promise<SanityRoadmapListItem[]> => {
    const query = `*[_type == "roadmap"] | order(order asc) {
      _id,
      title,
      shortTitle,
      slug,
      description,
      tagline,
      "thumbnailUrl": thumbnail.asset->url,
      gradientPreset,
      estimatedDuration,
      "stepCount": count(steps),
      order,
      isPublished
    }`;
    return getClient().fetch<SanityRoadmapListItem[]>(query);
  },
  ["sanity:roadmaps:all"],
  { tags: ["roadmap"], revalidate: 3600 }
);

/**
 * ロードマップ詳細を取得（SSR用）
 */
export const getRoadmapBySlug = unstable_cache(
  async (slug: string): Promise<SanityRoadmapDetail | null> => {
    const query = `*[_type == "roadmap" && slug.current == $slug][0] {
      _id,
      title,
      shortTitle,
      slug,
      description,
      tagline,
      "thumbnailUrl": thumbnail.asset->url,
      "heroImageUrl": heroImage.asset->url,
      gradientPreset,
      estimatedDuration,
      changingLandscape,
      interestingPerspectives,
      order,
      isPublished,
      steps[] {
        _key,
        "title": coalesce(title, stepTitle),
        "goals": coalesce(goals, stepGoals),
        sections[] {
          _key,
          "title": coalesce(title, sectionTitle),
          description,
          ${CONTENTS_PROJECTION}
        }
      }
    }`;
    return getClient().fetch<SanityRoadmapDetail | null>(query, { slug });
  },
  ["sanity:roadmap"],
  { tags: ["roadmap", "lesson", "contentItem"], revalidate: 3600 }
);

/**
 * ロードマップの全slugを取得（静的生成用）
 */
export const getAllRoadmapSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const query = `*[_type == "roadmap"].slug.current`;
    return getClient().fetch<string[]>(query);
  },
  ["sanity:roadmaps:slugs"],
  { tags: ["roadmap"], revalidate: 3600 }
);
