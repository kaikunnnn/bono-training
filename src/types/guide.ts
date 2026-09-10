import type { PortableTextBlock } from "@portabletext/types";

/**
 * ガイドカテゴリの型定義
 */
export type GuideCategory = "career" | "learning" | "industry" | "tools" | "practice";

/**
 * 記事タイプ
 * - guide: 体系的なガイド（既存）
 * - blog: 気軽な読みもの・トレンド系（新規）
 */
export type GuideType = "guide" | "blog";

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
  type?: GuideType; // デフォルト "guide"（未設定の既存記事はguide扱い）
  tags?: string[];

  // 表示設定
  thumbnailUrl?: string;
  videoUrl?: string;
  linkUrl?: string;

  // メタ情報
  author: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime?: string;

  // アクセス制限
  isPremium?: boolean;

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
