export interface WebflowVideo {
  id: string;
  slug: string;
  name: string;
  'isthisasectiontitle?': boolean;
  'series-video-order': number;
  'link-video'?: string;
  'video-length'?: string;
  description?: string;
  series?: string; // Reference to Series
  fieldData?: {
    name: string;
    slug: string;
    'isthisasectiontitle?': boolean;
    'series-video-order': number;
    'link-video'?: string;
    'video-length'?: string;
    description?: string;
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
  _type: 'article';
  title: string;
  slug: string;
  videoUrl?: string;
  videoDuration?: string;
  content?: string;
  source: 'webflow';
  webflowId: string;
}

export interface Quest {
  _id: string;
  _type: 'quest';
  questNumber: number;
  title: string;
  articles: Article[];
  source: 'webflow';
}

export interface Lesson {
  _id: string;
  _type: 'lesson';
  title: string;
  slug: string;
  quests: Quest[];
  source: 'webflow';
  webflowId: string;
}

export interface WebflowSeriesResponse {
  lesson: Lesson;
  success: boolean;
  cached?: boolean;
  timestamp: string;
}
