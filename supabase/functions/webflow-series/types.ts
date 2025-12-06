export interface WebflowVideo {
  id: string;
  slug: string;
  name: string;
  "isthisasectiontitle?": boolean;
  "series-video-order": number;
  "link-video"?: string;
  "video-length"?: string;
  "free-content"?: boolean; // 🆕 プレミアムフラグ（ON=無料、OFF=有料）- 旧フィールド名
  freecontent?: boolean; // 🆕 プレミアムフラグ（実際のWebflow APIフィールド名）
  freevideourl?: string; // 🆕 無料コンテンツ用の動画URL
  description?: string;
  series?: string; // Reference to Series
  fieldData?: {
    name: string;
    slug: string;
    "is-this-a-section-title-3": boolean;
    "series-video-order-3": number;
    "link-video-3"?: string;
    "video-length"?: string;
    "description-3"?: string;
    "free-content"?: boolean; // 🆕 旧フィールド名（後方互換性）
    freecontent?: boolean; // 🆕 プレミアムフラグ（実際のWebflow APIフィールド名）
    freevideourl?: string; // 🆕 無料コンテンツ用の動画URL
    "free-video-url"?: string; // 🆕 無料動画URL（代替フィールド名）
    description?: string; // ← （フォールバック用）
    series?: string;
  };
}

export interface WebflowSeries {
  id: string;
  slug: string;
  name: string;
  thumbnail?: {
    url: string;
    alt?: string;
  }; // Thumbnail画像（iconImage用）
  ogpimezi?: {
    url: string;
    alt?: string;
  }; // OGP画像（coverImage用）- 実際のフィールド名
  description?: string; // 説明文（HTML）
  "descriptions-2"?: string; // 短い説明文
  categories?: string; // カテゴリ（Reference ID）
  aboutthisseries?: string; // このシリーズについて（HTML）
  fieldData?: {
    name: string;
    slug: string;
    thumbnail?: {
      url: string;
      alt?: string;
    }; // Thumbnail画像
    ogpimezi?: {
      url: string;
      alt?: string;
    }; // OGP画像
    description?: string; // 説明文（HTML）
    "descriptions-2"?: string; // 短い説明文
    categories?: string; // カテゴリ（Reference ID）
    aboutthisseries?: string; // このシリーズについて（HTML）
  };
}

export interface WebflowCollectionResponse<T> {
  items: T[];
  count?: number;
  limit?: number;
  offset?: number;
}

export interface Article {
  _id: string;
  _type: "article";
  title: string;
  slug: string;
  videoUrl?: string;
  videoDuration?: string;
  isPremium: boolean; // 🆕 プレミアムフラグ（true=有料、false=無料）
  content?: string;
  source: "webflow";
  webflowId: string;
}

export interface Quest {
  _id: string;
  _type: "quest";
  questNumber: number;
  title: string;
  articles: Article[];
  source: "webflow";
}

export interface Lesson {
  _id: string;
  _type: "lesson";
  title: string;
  slug: string;
  description?: string; // 🆕 説明文
  coverImage?: string; // 🆕 カバー画像URL
  iconImage?: string; // 🆕 アイコン画像URL
  category?: string; // 🆕 カテゴリ
  overview?: string; // 🆕 詳細説明（HTML）
  quests: Quest[];
  source: "webflow";
  webflowId: string;
}

export interface WebflowSeriesResponse {
  lesson: Lesson;
  success: boolean;
  cached?: boolean;
  timestamp: string;
}
