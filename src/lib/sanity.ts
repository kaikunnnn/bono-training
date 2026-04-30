import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { LessonWithDetails, LessonMetadata, Lesson, ArticleWithContext, Feedback, FeedbackCategory } from "@/types/sanity";
import type { SanityRoadmapListItem, SanityRoadmapDetail } from "@/types/sanity-roadmap";

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

/** @deprecated getClient() を内部で使用。外部からは関数経由でアクセスしてください */
export const client = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

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
      "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url)
    }
  `;

  return getClient().fetch<LessonMetadata | null>(query, { slug });
}

/**
 * すべてのレッスンスラッグを取得（静的生成用）
 */
export async function getAllLessonSlugs(): Promise<string[]> {
  const query = `*[_type == "lesson"].slug.current`;
  return getClient().fetch<string[]>(query);
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
      "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url),
      tags,
      isPremium
    }
  `;
  return getClient().fetch<Lesson[]>(query);
}

export interface LessonWithArticleIds extends Lesson {
  articleIds: string[];
}

/**
 * すべてのレッスンを記事ID付きで取得（進捗計算用）
 */
export async function getAllLessonsWithArticleIds(): Promise<LessonWithArticleIds[]> {
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
      "articleIds": quests[]->articles[]->_id
    }
  `;
  const lessons = await getClient().fetch<LessonWithArticleIds[]>(query);
  // articleIds内のnullを除去
  return lessons.map(lesson => ({
    ...lesson,
    articleIds: (lesson.articleIds || []).filter(Boolean),
  }));
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

  return getClient().fetch<ArticleMetadata | null>(query, { slug });
}

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
export async function getAllArticles(): Promise<ArticleListItem[]> {
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
}

/**
 * レッスンに紐づく記事を取得
 */
export async function getArticlesByLesson(lessonSlug: string): Promise<ArticleListItem[]> {
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
}

// ============================================
// Feedback 関連のクエリ（Server Components用）
// ============================================

/**
 * すべてのフィードバックカテゴリを取得
 */
export async function getFeedbackCategories(): Promise<FeedbackCategory[]> {
  const query = `
    *[_type == "feedbackCategory"] | order(title asc) {
      _id,
      title,
      slug
    }
  `;
  return getClient().fetch<FeedbackCategory[]>(query);
}

/**
 * すべてのフィードバックを取得
 */
export async function getAllFeedbacks(): Promise<Feedback[]> {
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
}

/**
 * カテゴリ別のフィードバックを取得
 */
export async function getFeedbacksByCategory(categorySlug: string): Promise<Feedback[]> {
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
}

/**
 * 最近のフィードバックを取得
 */
export async function getRecentFeedbacks(limit: number = 4, excludeSlug?: string): Promise<Feedback[]> {
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
}

/**
 * 関連フィードバックを取得（同カテゴリ）
 */
export async function getRelatedFeedbacks(
  categorySlug: string,
  excludeSlug: string,
  limit: number = 3
): Promise<Feedback[]> {
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
}

/**
 * すべてのフィードバックスラッグを取得（静的生成用）
 */
export async function getAllFeedbackSlugs(): Promise<string[]> {
  const query = `*[_type == "feedback"].slug.current`;
  return getClient().fetch<string[]>(query);
}

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
export async function getBlogPosts(params?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<BlogPostsResponse> {
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
}

/**
 * スラッグでブログ記事を取得
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
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
}

/**
 * 最新のブログ記事を取得
 */
export async function getLatestBlogPosts(limit: number = 4, excludeId?: string): Promise<BlogPost[]> {
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
}

/**
 * すべてのブログスラッグを取得（静的生成用）
 */
export async function getAllBlogSlugs(): Promise<string[]> {
  const query = `*[_type == "blogPost"].slug.current`;
  return getClient().fetch<string[]>(query);
}

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
export async function getAllRoadmaps(): Promise<SanityRoadmapListItem[]> {
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
}

/**
 * ロードマップ詳細を取得（SSR用）
 */
export async function getRoadmapBySlug(slug: string): Promise<SanityRoadmapDetail | null> {
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
}

/**
 * ロードマップの全slugを取得（静的生成用）
 */
export async function getAllRoadmapSlugs(): Promise<string[]> {
  const query = `*[_type == "roadmap"].slug.current`;
  return getClient().fetch<string[]>(query);
}
