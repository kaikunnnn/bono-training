/**
 * Sanity ロードマップの型定義
 *
 * Sanity CMSのroadmapスキーマに対応した型定義
 */

import { type GradientPreset, getGradientCSS } from "@/styles/gradients";

// GradientPreset型とグラデーション定義は src/styles/gradients.ts に統一管理されています
// re-export for backward compatibility
export type { GradientPreset };

// ============================================
// 基本型
// ============================================

/** 変わる景色・面白くなる視点の項目 */
export interface SanityRoadmapItem {
  title: string;
  description?: string;
}

/** 変わる景色セクション */
export interface SanityChangingLandscape {
  description?: string;
  items?: SanityRoadmapItem[];
}

/** 面白くなる視点セクション */
export interface SanityInterestingPerspectives {
  description?: string;
  items?: SanityRoadmapItem[];
}

// ============================================
// カリキュラム構造
// ============================================

/** Sanity参照コンテンツ（レッスンまたはロードマップ） */
export interface SanityReferenceContent {
  _id: string;
  _type: "lesson" | "roadmap";
  title: string;
  slug: { current: string };
  description?: string;
  thumbnailUrl?: string;
  /** レッスンの場合のアイコン画像 */
  iconImageUrl?: string;
  /** ロードマップの場合のグラデーション */
  gradientPreset?: GradientPreset;
  /** ロードマップの場合の目安期間 */
  estimatedDuration?: string;
  /** ロードマップの場合のステップ数 */
  stepCount?: number;
  /** ロードマップの場合の短縮タイトル */
  shortTitle?: string;
}

/** 外部リンクコンテンツ */
export interface SanityExternalLink {
  _key: string;
  _type: "externalLink";
  url: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
}

/** セクション内のコンテンツ（参照または外部リンク） */
export type SanitySectionContent = SanityReferenceContent | SanityExternalLink;

/** セクション */
export interface SanityRoadmapSection {
  _key: string;
  title: string;
  description?: string;
  contents?: SanitySectionContent[];
}

/** ステップ */
export interface SanityRoadmapStep {
  _key: string;
  title: string;
  goals?: string[];
  sections?: SanityRoadmapSection[];
}

// ============================================
// ロードマップ本体
// ============================================

/** Sanityから取得するロードマップ（一覧用） */
export interface SanityRoadmapListItem {
  _id: string;
  title: string;
  shortTitle?: string;
  slug: { current: string };
  description: string;
  thumbnailUrl?: string;
  gradientPreset?: GradientPreset;
  estimatedDuration: string;
  stepCount: number;
}

/** Sanityから取得するロードマップ（詳細用） */
export interface SanityRoadmapDetail {
  _id: string;
  title: string;
  shortTitle?: string;
  slug: { current: string };
  description: string;
  tagline?: string;
  thumbnailUrl?: string;
  /** 詳細ページヒーロー用画像（優先）、未設定の場合はthumbnailUrlを使用 */
  heroImageUrl?: string;
  gradientPreset?: GradientPreset;
  estimatedDuration: string;
  changingLandscape?: SanityChangingLandscape;
  interestingPerspectives?: SanityInterestingPerspectives;
  steps?: SanityRoadmapStep[];
}

/** 関連ロードマップ */
export interface SanityRelatedRoadmap {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  thumbnailUrl?: string;
  gradientPreset?: GradientPreset;
  estimatedDuration: string;
  stepCount: number;
}

// ============================================
// ユーティリティ関数
// ============================================

/**
 * ステップ数を計算
 */
export function countSteps(roadmap: SanityRoadmapDetail): number {
  return roadmap.steps?.length ?? 0;
}

/**
 * 全レッスン数を計算
 */
export function countLessons(roadmap: SanityRoadmapDetail): number {
  if (!roadmap.steps) return 0;

  return roadmap.steps.reduce((total, step) => {
    if (!step.sections) return total;
    return (
      total +
      step.sections.reduce((sectionTotal, section) => {
        if (!section.contents) return sectionTotal;
        return (
          sectionTotal +
          section.contents.filter((c) => c._type === "lesson").length
        );
      }, 0)
    );
  }, 0);
}

/**
 * グラデーションCSSを取得
 */
export function getGradientStyle(
  preset?: GradientPreset
): React.CSSProperties {
  const fallbackPreset: GradientPreset = 'career-change';
  const gradientPreset = preset || fallbackPreset;
  return { background: getGradientCSS(gradientPreset) };
}
