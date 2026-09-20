import "server-only";

import { createClient } from "@sanity/client";
import { unstable_cache } from "next/cache";
import type {
  ArticleSearchResult,
  GuideSearchResult,
  LessonSearchResult,
  SearchResult,
} from "@/types/search";

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

let sanityClient: ReturnType<typeof createClient> | null = null;

function getSanityClient() {
  if (!sanityClient) {
    sanityClient = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion:
        process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
      useCdn: true,
    });
  }
  return sanityClient;
}

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
  return getSanityClient().fetch(query);
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
  const lessons = await getSanityClient().fetch<
    {
      lessonTitle: string;
      lessonSlug: string;
      articles: SanityArticleForSearch[];
    }[]
  >(query);
  const all: SanityArticleForSearch[] = [];
  for (const lesson of lessons) {
    for (const article of lesson.articles || []) {
      if (article) {
        all.push({
          ...article,
          lessonTitle: lesson.lessonTitle,
          lessonSlug: lesson.lessonSlug,
        });
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
  return getSanityClient().fetch(query);
}

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

async function fetchSearchData(): Promise<SearchResult[]> {
  const [lessons, articles, guides] = await Promise.all([
    fetchLessonsForSearch(),
    fetchArticlesForSearch(),
    fetchGuidesForSearch(),
  ]);

  return [
    ...lessons.map(convertLessonToSearchResult),
    ...articles.map(convertArticleToSearchResult),
    ...guides.map(convertGuideToSearchResult),
  ];
}

/**
 * 検索インデックスをサーバー側で共有キャッシュする。
 * 初期 HTML に同じデータを渡し、hydration 後の /api/search waterfall をなくす。
 */
export const getSearchData = unstable_cache(
  fetchSearchData,
  ["sanity:search:index"],
  {
    revalidate: 300,
    tags: ["lesson", "article", "quest", "guide", "roadmap", "category"],
  }
);
