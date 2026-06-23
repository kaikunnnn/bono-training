import { NextRequest } from "next/server";
import { createClient } from "@sanity/client";
import type {
  SearchResult,
  LessonSearchResult,
  ArticleSearchResult,
  GuideSearchResult,
} from "@/types/search";

// Node.js ランタイム（Sanity SDK の互換性）
export const runtime = "nodejs";

// Vercel Edge / Node の CDN キャッシュ：5 分 fresh、10 分 SWR
// クライアントの React Query にも staleTime 5 分があるので二重で守る
export const revalidate = 300;

// 検索専用 Sanity client（useCdn:true で高速化）
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: true,
});

// ============================================================
// Sanity データ型
// ============================================================

interface SanityLessonForSearch {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  thumbnailUrl?: string;
  categoryTitle?: string;
  tags?: string[];
  isPremium?: boolean;
  articleCount: number;
  linkedRoadmaps?: { slug: string; title: string; shortTitle?: string }[];
}

interface SanityArticleForSearch {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  thumbnailUrl?: string;
  tags?: string[];
  isPremium?: boolean;
  videoDuration?: string | number;
  lessonTitle?: string;
  lessonSlug?: string;
}

interface SanityGuideForSearch {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  readingTime?: string;
  isPremium?: boolean;
}

// ============================================================
// Sanity フェッチ
// ============================================================

async function fetchLessonsForSearch(): Promise<SanityLessonForSearch[]> {
  const query = `*[_type == "lesson"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    "thumbnailUrl": coalesce(
      iconImageUrl,
      iconImage.asset->url,
      thumbnailUrl,
      thumbnail.asset->url
    ),
    "categoryTitle": category->title,
    tags,
    isPremium,
    "articleCount": count(quests[]->articles[]),
    "linkedRoadmaps": *[_type == "roadmap" && references(^._id)] {
      "slug": slug.current,
      title,
      shortTitle
    }
  }`;
  return sanity.fetch(query);
}

async function fetchArticlesForSearch(): Promise<SanityArticleForSearch[]> {
  const query = `*[_type == "lesson"] {
    "lessonTitle": title,
    "lessonSlug": slug.current,
    "articles": quests[]->articles[]-> {
      _id,
      title,
      slug,
      excerpt,
      "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
      tags,
      isPremium,
      videoDuration
    }
  }`;
  const lessons = await sanity.fetch<
    {
      lessonTitle: string;
      lessonSlug: string;
      articles: SanityArticleForSearch[];
    }[]
  >(query);
  const all: SanityArticleForSearch[] = [];
  for (const lesson of lessons) {
    if (lesson.articles) {
      for (const article of lesson.articles) {
        if (article) {
          all.push({
            ...article,
            lessonTitle: lesson.lessonTitle,
            lessonSlug: lesson.lessonSlug,
          });
        }
      }
    }
  }
  return all;
}

async function fetchGuidesForSearch(): Promise<SanityGuideForSearch[]> {
  const query = `*[_type == "guide"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    "thumbnailUrl": thumbnail.asset->url,
    category,
    tags,
    publishedAt,
    readingTime,
    isPremium
  }`;
  return sanity.fetch(query);
}

// ============================================================
// SearchResult への変換
// ============================================================

function convertLessonToSearchResult(
  lesson: SanityLessonForSearch
): LessonSearchResult {
  return {
    id: lesson._id,
    type: "lesson",
    title: lesson.title,
    description: lesson.description || "",
    slug: lesson.slug?.current || "",
    thumbnail: lesson.thumbnailUrl,
    category: lesson.categoryTitle,
    tags: lesson.tags,
    isPremium: lesson.isPremium,
    lessonCount: lesson.articleCount,
    linkedRoadmaps: lesson.linkedRoadmaps,
  };
}

function convertArticleToSearchResult(
  article: SanityArticleForSearch
): ArticleSearchResult {
  let readingTime: number | undefined;
  if (article.videoDuration) {
    if (typeof article.videoDuration === "number") {
      readingTime = Math.ceil(article.videoDuration / 60);
    } else if (typeof article.videoDuration === "string") {
      const parts = article.videoDuration.split(":").map(Number);
      if (parts.length === 2) {
        readingTime = parts[0] + Math.ceil(parts[1] / 60);
      } else if (parts.length === 3) {
        readingTime = parts[0] * 60 + parts[1] + Math.ceil(parts[2] / 60);
      }
    }
  }
  return {
    id: article._id,
    type: "article",
    title: article.title,
    description: article.excerpt || "",
    slug: article.slug?.current || "",
    thumbnail: article.thumbnailUrl,
    tags: article.tags,
    isPremium: article.isPremium,
    parentLessonTitle: article.lessonTitle,
    parentLessonSlug: article.lessonSlug,
    readingTime,
  };
}

function convertGuideToSearchResult(
  guide: SanityGuideForSearch
): GuideSearchResult {
  return {
    id: guide._id,
    type: "guide",
    title: guide.title,
    description: guide.description || "",
    slug: guide.slug || "",
    thumbnail: guide.thumbnailUrl,
    category: guide.category,
    tags: guide.tags,
    publishedAt: guide.publishedAt,
    readingTime: guide.readingTime,
    isPremium: guide.isPremium ?? false,
  };
}

// ============================================================
// GET ハンドラ
// ============================================================

export async function GET(_req: NextRequest) {
  try {
    const [lessons, articles, guides] = await Promise.all([
      fetchLessonsForSearch(),
      fetchArticlesForSearch(),
      fetchGuidesForSearch(),
    ]);

    const results: SearchResult[] = [
      ...lessons.map(convertLessonToSearchResult),
      ...articles.map(convertArticleToSearchResult),
      ...guides.map(convertGuideToSearchResult),
    ];

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        // Vercel CDN: 5分 fresh、10分 stale-while-revalidate
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[api/search] error:", error);
    return new Response(
      JSON.stringify({ error: "検索データの取得に失敗しました" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
