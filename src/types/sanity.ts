import { PortableTextBlock } from "@portabletext/types";

// Sanity Image型
export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  caption?: string;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

// Sanity Slug型
export interface SanitySlug {
  _type: "slug";
  current: string;
}

// Article型
export interface Article {
  _id: string;
  _type: "article";
  articleNumber?: number;
  articleType?: "explain" | "intro" | "practice" | "challenge";
  title: string;
  slug: SanitySlug;
  excerpt?: string;
  coverImage?: SanityImage;
  thumbnail?: SanityImage;
  thumbnailUrl?: string;
  videoUrl?: string;
  videoDuration?: number;
  content: PortableTextBlock[];
  learningObjectives?: string[];
  quest?: {
    _ref: string;
    _type: "reference";
  };
  publishedAt?: string;
  author?: string;
  tags?: string[];
  isPremium?: boolean;
}

// Quest型
export interface Quest {
  _id: string;
  _type: "quest";
  questNumber: number;
  title: string;
  slug: SanitySlug;
  description?: string;
  goal: string;
  estTimeMins?: number;
  lesson?: {
    _ref: string;
    _type: "reference";
  };
  articles?: Article[];
}

// Lesson型
export interface Lesson {
  _id: string;
  _type: "lesson";
  title: string;
  slug: SanitySlug;
  description?: string;
  iconImage?: SanityImage;
  coverImage?: SanityImage;
  category?: "情報設計" | "UI" | "UX";
  isPremium?: boolean;
  overview?: PortableTextBlock[];
  contentHeading?: string;
  quests?: Quest[];
}

// Article Detail ページ用の拡張型（Lesson/Quest情報を含む）
export interface ArticleWithContext extends Article {
  questInfo?: {
    _id: string;
    questNumber: number;
    title: string;
    articles: {
      _id: string;
      slug: SanitySlug;
      title: string;
      videoDuration?: number;
    }[];
  };
  lessonInfo?: {
    _id: string;
    title: string;
    slug: SanitySlug;
    iconImage?: SanityImage;
    quests: {
      _id: string;
      questNumber: number;
      title: string;
      articles: {
        _id: string;
        slug: SanitySlug;
        title: string;
        videoDuration?: number;
      }[];
    }[];
  };
}

// サイドナビゲーション用の型
export interface SideNavLesson {
  title: string;
  slug: string;
  thumbnail?: SanityImage;
  progressPercent: number; // 計算されたプログレス
}

export interface SideNavContentItem {
  id: string;
  title: string;
  duration?: number;
  slug: string;
  isCompleted: boolean;
  isFocus: boolean;
}

export interface SideNavQuest {
  id: string;
  questNumber: number;
  title: string;
  items: SideNavContentItem[];
  isFocus: boolean; // この quest に現在の記事が含まれるか
}

export interface SideNavData {
  lesson: SideNavLesson;
  quests: SideNavQuest[];
}

// Article Navigation (前後記事)
export interface ArticleNavigation {
  previous?: {
    slug: string;
    title: string;
  };
  next?: {
    slug: string;
    title: string;
  };
}
