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
  articleType?: "explain" | "intro" | "practice" | "challenge" | "demo";
  title: string;
  slug: SanitySlug;
  excerpt?: string;
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
  thumbnail?: SanityImage;
  thumbnailUrl?: string;
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
      articleType?: "explain" | "intro" | "practice" | "challenge" | "demo";
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
        articleType?: "explain" | "intro" | "practice" | "challenge" | "demo";
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

// Event型
export interface Event {
  _id: string;
  _type: "event";
  title: string;
  slug: SanitySlug;
  summary?: string;
  registrationUrl?: string;
  thumbnail?: SanityImage & { asset?: { _id: string; url: string } };
  thumbnailUrl?: string;
  eventMonth?: number;
  eventPeriod?: "early" | "mid" | "late";
  content: PortableTextBlock[];
  publishedAt?: string;
}

// QuestionCategory型
export interface QuestionCategory {
  _id: string;
  _type?: "questionCategory";
  title: string;
  slug: SanitySlug;
}

// Question型
export interface Question {
  _id: string;
  _type?: "question";
  title: string;
  slug: SanitySlug;
  category?: QuestionCategory;
  questionContent?: PortableTextBlock[];
  answerContent?: PortableTextBlock[];
  questionExcerpt?: string; // 一覧用の抜粋
  publishedAt?: string;
}

// FeedbackCategory型
export interface FeedbackCategory {
  _id: string;
  _type?: "feedbackCategory";
  title: string;
  slug: SanitySlug;
}

// Feedback型
export interface Feedback {
  _id: string;
  _type?: "feedback";
  title: string;
  slug: SanitySlug;
  category?: FeedbackCategory;
  targetOutput?: string;
  publishedAt?: string;
  vimeoUrl?: string;
  figmaUrl?: string;
  reviewPoints?: PortableTextBlock[];
  requestContent?: PortableTextBlock[];
  feedbackContent?: PortableTextBlock[];
  feedbackExcerpt?: string; // 一覧用の抜粋
}
