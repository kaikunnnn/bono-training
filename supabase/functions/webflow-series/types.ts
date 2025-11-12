export interface WebflowVideo {
  id: string;
  slug: string;
  name: string;
  "isthisasectiontitle?": boolean;
  "series-video-order": number;
  "link-video"?: string;
  "video-length"?: string;
  "free-content"?: boolean; // 🆕 プレミアムフラグ（ON=無料、OFF=有料）
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
    "free-content"?: boolean; // 🆕 プレミアムフラグ（ON=無料、OFF=有料）
    description?: string; // ← （フォールバック用）
    series?: string;
  };
}

export interface WebflowSeries {
  id: string;
  slug: string;
  name: string;
  fieldData?: {
    name: string;
    slug: string;
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
