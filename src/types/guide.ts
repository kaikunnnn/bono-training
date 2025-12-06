/**
 * ガイドカテゴリの型定義
 */
export type GuideCategory = "career" | "learning" | "industry" | "tools";

/**
 * ガイド記事の型定義
 */
export interface Guide {
  // 基本情報
  title: string;
  description: string;
  slug: string;

  // 分類
  category: GuideCategory;
  tags: string[];

  // 表示設定
  thumbnail?: string;
  icon?: string;
  order_index: number;

  // メタ情報
  author: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: string;

  // アクセス制限
  isPremium: boolean;

  // SEO（オプション）
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };

  // 関連記事
  relatedGuides?: string[];

  // コンテンツ
  content?: string; // Markdown本文
}

/**
 * カテゴリ情報の型定義
 */
export interface GuideCategoryInfo {
  id: GuideCategory;
  label: string;
  description: string;
  icon: string;
}
