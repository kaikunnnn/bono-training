/**
 * Sanity ロードマップの型定義
 *
 * Sanity CMSのroadmapスキーマに対応した型定義
 */

// ============================================
// グラデーションプリセット
// ============================================

export type GradientPreset =
  | "career-change"  // UIUXデザイナー転職
  | "ui-beginner"    // UIデザイン入門（Figma基礎）
  | "ui-visual"      // UIビジュアル入門
  | "info-arch"      // 情報設計基礎
  | "ux-design";     // UXデザイン基礎

/** グラデーションプリセットのCSS値（RoadmapCardV2と統一、方向: 下から上 0deg） */
export const GRADIENT_PRESETS: Record<GradientPreset, string> = {
  "career-change": "linear-gradient(0deg, #4E2D4D 0%, #292B41 19%, #0E0E16 100%)",
  "ui-beginner": "linear-gradient(0deg, #684B4B 0%, #231C26 81%, #F59EAF 100%)",
  "ui-visual": "linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(0deg, #304750 0%, #5D5B65 100%)",
  "info-arch": "linear-gradient(0deg, rgba(0,0,0,0.3), rgba(0,0,0,0.3)), linear-gradient(0deg, #8D7746 0%, #214234 100%)",
  "ux-design": "linear-gradient(0deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4)), linear-gradient(0deg, #2F3F6D 0%, #764749 46%, #E27979 88%, #F1BAC1 100%)",
};

/** グラデーションプリセットのTailwindクラス（RoadmapCardV2と統一） */
export const GRADIENT_CLASSES: Record<GradientPreset, string> = {
  "career-change": "from-[#4E2D4D] via-[#292B41] to-[#0E0E16]",
  "ui-beginner": "from-[#684B4B] via-[#231C26] to-[#F59EAF]",
  "ui-visual": "from-[#304750] to-[#5D5B65]",
  "info-arch": "from-[#8D7746] to-[#214234]",
  "ux-design": "from-[#2F3F6D] to-[#F1BAC1]",
};

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
  gradientPreset?: GradientPreset;
  estimatedDuration: string;
  howToNavigate?: string[];
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
  if (!preset || !GRADIENT_PRESETS[preset]) {
    return { background: GRADIENT_PRESETS['career-change'] };
  }
  return { background: GRADIENT_PRESETS[preset] };
}

/**
 * グラデーションTailwindクラスを取得
 */
export function getGradientClass(preset?: GradientPreset): string {
  if (!preset || !GRADIENT_CLASSES[preset]) {
    return GRADIENT_CLASSES['career-change'];
  }
  return GRADIENT_CLASSES[preset];
}
