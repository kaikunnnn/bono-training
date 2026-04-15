import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/sanity";
import {
  SearchResult,
  LessonSearchResult,
  ArticleSearchResult,
  GuideSearchResult,
  SearchContentType,
} from "@/types/search";

// ============================================
// Sanityデータ型
// ============================================

interface SanityLessonForSearch {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  thumbnailUrl?: string;
  category?: string;
  categoryTitle?: string;
  tags?: string[];
  isPremium?: boolean;
  articleCount: number;
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
  slug: string; // クエリで slug.current に解決済み
  description?: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  readingTime?: string;
  isPremium?: boolean;
}

// ============================================
// Sanityクエリ
// ============================================

/**
 * 検索用のレッスンデータを取得
 */
async function fetchLessonsForSearch(): Promise<SanityLessonForSearch[]> {
  try {
    const query = `*[_type == "lesson"] | order(_createdAt desc) {
      _id,
      title,
      slug,
      description,
      thumbnailUrl,
      "categoryTitle": category->title,
      tags,
      isPremium,
      "articleCount": count(quests[]->articles[])
    }`;
    return client.fetch(query);
  } catch (error) {
    console.error('検索用レッスンデータの取得に失敗:', error);
    throw new Error('検索データの読み込みに失敗しました。');
  }
}

/**
 * 検索用の記事データを取得（Lesson→Quest→Articleの構造をフラット化）
 */
async function fetchArticlesForSearch(): Promise<SanityArticleForSearch[]> {
  try {
    const query = `*[_type == "lesson"] {
      "lessonTitle": title,
      "lessonSlug": slug.current,
      "articles": quests[]->articles[]-> {
        _id,
        title,
        slug,
        excerpt,
        thumbnailUrl,
        tags,
        isPremium,
        videoDuration
      }
    }`;

    const lessons = await client.fetch<
      {
        lessonTitle: string;
        lessonSlug: string;
        articles: SanityArticleForSearch[];
      }[]
    >(query);

    // フラット化して親レッスン情報を付与
    const allArticles: SanityArticleForSearch[] = [];
    for (const lesson of lessons) {
      if (lesson.articles) {
        for (const article of lesson.articles) {
          if (article) {
            allArticles.push({
              ...article,
              lessonTitle: lesson.lessonTitle,
              lessonSlug: lesson.lessonSlug,
            });
          }
        }
      }
    }
    return allArticles;
  } catch (error) {
    console.error('検索用記事データの取得に失敗:', error);
    throw new Error('検索データの読み込みに失敗しました。');
  }
}

/**
 * 検索用のガイドデータを取得
 */
async function fetchGuidesForSearch(): Promise<SanityGuideForSearch[]> {
  try {
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
    return client.fetch(query);
  } catch (error) {
    console.error('検索用ガイドデータの取得に失敗:', error);
    throw new Error('検索データの読み込みに失敗しました。');
  }
}

// ============================================
// 変換関数
// ============================================

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
  };
}

function convertArticleToSearchResult(
  article: SanityArticleForSearch
): ArticleSearchResult {
  // videoDurationを分に変換
  let readingTime: number | undefined;
  if (article.videoDuration) {
    if (typeof article.videoDuration === "number") {
      readingTime = Math.ceil(article.videoDuration / 60);
    } else if (typeof article.videoDuration === "string") {
      // "MM:SS" or "HH:MM:SS" 形式をパース
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

// ============================================
// 統合検索データ取得
// ============================================

async function fetchAllSearchData(): Promise<SearchResult[]> {
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

    return results;
  } catch (error) {
    console.error('統合検索データの取得に失敗:', error);
    throw new Error('検索データの読み込みに失敗しました。ページを更新してもう一度お試しください。');
  }
}

// ============================================
// 検索ロジック
// ============================================

function filterSearchResults(
  data: SearchResult[],
  query: string,
  contentTypes: SearchContentType[]
): SearchResult[] {
  let results = data;

  // コンテンツタイプでフィルタ
  if (contentTypes.length > 0) {
    results = results.filter((item) => contentTypes.includes(item.type));
  }

  // テキスト検索
  if (query.trim()) {
    const normalizedQuery = query.toLowerCase().trim();
    results = results.filter((item) => {
      const searchableText = [
        item.title,
        item.description,
        item.category || "",
        ...(item.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }

  return results;
}

// ============================================
// React Query Hook
// ============================================

/**
 * 検索データを取得するフック
 */
export function useSearchData() {
  return useQuery({
    queryKey: ["searchData"],
    queryFn: fetchAllSearchData,
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 10 * 60 * 1000, // 10分
    refetchOnWindowFocus: false,
  });
}

/**
 * 検索を実行するフック
 */
export function useSearch(query: string, contentTypes: SearchContentType[]) {
  const { data: allData, isLoading, error } = useSearchData();

  const results = allData
    ? filterSearchResults(allData, query, contentTypes)
    : [];

  return {
    results,
    isLoading,
    error,
    totalCount: results.length,
  };
}

/**
 * 検索候補を取得する関数（オートコンプリート用）
 */
export function searchFromCache(
  data: SearchResult[],
  query: string,
  limit: number = 8
): SearchResult[] {
  if (!query.trim()) return [];

  const results = filterSearchResults(data, query, []);
  return results.slice(0, limit);
}
