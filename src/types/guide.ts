import type { PortableTextBlock } from "@portabletext/react";

/**
 * ガイドカテゴリの型定義
 */
export type GuideCategory = "career" | "learning" | "industry" | "tools";

/**
 * ガイド記事の型定義（Sanity）
 */
export interface Guide {
  _id: string;

  // 基本情報
  title: string;
  description: string;
  slug: string;

  // 分類
  category: GuideCategory;
  tags: string[];

  // 表示設定
  thumbnailUrl?: string;
  videoUrl?: string;

  // メタ情報
  author: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime?: string;

  // アクセス制限
  isPremium: boolean;

  // コンテンツ（Portable Text）
  content?: PortableTextBlock[];
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
