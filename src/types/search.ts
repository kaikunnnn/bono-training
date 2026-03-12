/**
 * 検索機能の型定義
 *
 * 4つのコンテンツタイプを統一的に扱う：
 * - lesson: レッスンコース
 * - article: レッスンコース内の記事
 * - guide: ガイドコンテンツ
 * - roadmap: ロードマップ
 */

// ============================================
// コンテンツタイプ
// ============================================

/** 検索対象のコンテンツタイプ */
export type SearchContentType = "lesson" | "article" | "guide" | "roadmap";

/** コンテンツタイプのラベル */
export const CONTENT_TYPE_LABELS: Record<SearchContentType, string> = {
  lesson: "レッスン",
  article: "記事",
  guide: "ガイド",
  roadmap: "ロードマップ",
};

/** コンテンツタイプのアイコン（絵文字） */
export const CONTENT_TYPE_ICONS: Record<SearchContentType, string> = {
  lesson: "📚",
  article: "📝",
  guide: "💡",
  roadmap: "🗺️",
};

/** コンテンツタイプのカラー設定 */
export const CONTENT_TYPE_COLORS: Record<
  SearchContentType,
  {
    bg: string;
    text: string;
    border: string;
    accent: string;
  }
> = {
  lesson: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    accent: "bg-amber-500",
  },
  article: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    accent: "bg-emerald-500",
  },
  guide: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    accent: "bg-blue-500",
  },
  roadmap: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    accent: "bg-purple-500",
  },
};

// ============================================
// 検索結果の型
// ============================================

/** 検索結果の基本インターフェース */
export interface SearchResultBase {
  /** 一意のID */
  id: string;
  /** コンテンツタイプ */
  type: SearchContentType;
  /** タイトル */
  title: string;
  /** 説明文 */
  description: string;
  /** URL用スラッグまたはパス */
  slug: string;
  /** サムネイル画像URL（任意） */
  thumbnail?: string;
  /** カテゴリ（任意） */
  category?: string;
  /** タグ（任意） */
  tags?: string[];
  /** プレミアムコンテンツか */
  isPremium?: boolean;
}

/** レッスンコースの検索結果 */
export interface LessonSearchResult extends SearchResultBase {
  type: "lesson";
  /** レッスン数 */
  lessonCount?: number;
}

/** 記事の検索結果（レッスンコース内） */
export interface ArticleSearchResult extends SearchResultBase {
  type: "article";
  /** 親レッスンコースのタイトル */
  parentLessonTitle?: string;
  /** 親レッスンコースのスラッグ */
  parentLessonSlug?: string;
  /** 読了時間（分） */
  readingTime?: number;
}

/** ガイドの検索結果 */
export interface GuideSearchResult extends SearchResultBase {
  type: "guide";
  /** 読了時間（例: "10分"） */
  readingTime?: string;
  /** 公開日 */
  publishedAt?: string;
  /** 著者 */
  author?: string;
}

/** ロードマップの検索結果 */
export interface RoadmapSearchResult extends SearchResultBase {
  type: "roadmap";
  /** 期間（例: "6ヶ月"） */
  duration?: string;
  /** ステップ数 */
  stepsCount?: number;
  /** レッスン数 */
  lessonsCount?: number;
  /** グラデーション色（例: "from-blue-500 to-purple-600"） */
  gradientColors?: string;
}

/** 検索結果の統一型 */
export type SearchResult =
  | LessonSearchResult
  | ArticleSearchResult
  | GuideSearchResult
  | RoadmapSearchResult;

// ============================================
// 検索フィルター
// ============================================

/** 検索フィルター */
export interface SearchFilters {
  /** 検索クエリ */
  query: string;
  /** フィルタするコンテンツタイプ（空の場合は全て） */
  contentTypes: SearchContentType[];
  /** フィルタするカテゴリ（空の場合は全て） */
  categories: string[];
  /** プレミアムコンテンツのみ */
  premiumOnly?: boolean;
}

/** デフォルトのフィルター */
export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  query: "",
  contentTypes: [],
  categories: [],
  premiumOnly: false,
};

// ============================================
// 検索結果のグループ化
// ============================================

/** コンテンツタイプ別にグループ化された検索結果 */
export interface GroupedSearchResults {
  lesson: LessonSearchResult[];
  article: ArticleSearchResult[];
  guide: GuideSearchResult[];
  roadmap: RoadmapSearchResult[];
}

/** 検索結果をタイプ別にグループ化 */
export function groupSearchResults(
  results: SearchResult[]
): GroupedSearchResults {
  return {
    lesson: results.filter((r): r is LessonSearchResult => r.type === "lesson"),
    article: results.filter(
      (r): r is ArticleSearchResult => r.type === "article"
    ),
    guide: results.filter((r): r is GuideSearchResult => r.type === "guide"),
    roadmap: results.filter(
      (r): r is RoadmapSearchResult => r.type === "roadmap"
    ),
  };
}

// ============================================
// 型ガード
// ============================================

export function isLessonResult(
  result: SearchResult
): result is LessonSearchResult {
  return result.type === "lesson";
}

export function isArticleResult(
  result: SearchResult
): result is ArticleSearchResult {
  return result.type === "article";
}

export function isGuideResult(
  result: SearchResult
): result is GuideSearchResult {
  return result.type === "guide";
}

export function isRoadmapResult(
  result: SearchResult
): result is RoadmapSearchResult {
  return result.type === "roadmap";
}
