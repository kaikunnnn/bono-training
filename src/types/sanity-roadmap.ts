/**
 * Sanity ロードマップの型定義
 *
 * Sanity CMSのroadmapスキーマに対応した型定義
 */

// ============================================
// グラデーションプリセット
// ============================================

export type GradientPreset =
  | "galaxy"
  | "infoarch"
  | "sunset"
  | "ocean"
  | "teal"
  | "rose"
  | "uivisual";

/** グラデーションプリセットのCSS値 */
export const GRADIENT_PRESETS: Record<GradientPreset, string> = {
  galaxy: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  infoarch: "linear-gradient(135deg, #6b7280 0%, #92400e 100%)",
  sunset: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
  ocean: "linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)",
  teal: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
  rose: "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)",
  uivisual: "linear-gradient(180deg, #304750 0%, #5D5B65 100%)",
};

/** グラデーションプリセットのTailwindクラス */
export const GRADIENT_CLASSES: Record<GradientPreset, string> = {
  galaxy: "from-[#667eea] to-[#764ba2]",
  infoarch: "from-[#6b7280] to-[#92400e]",
  sunset: "from-[#f97316] to-[#ec4899]",
  ocean: "from-[#3b82f6] to-[#0ea5e9]",
  teal: "from-[#14b8a6] to-[#06b6d4]",
  rose: "from-[#f43f5e] to-[#fb7185]",
  uivisual: "from-[#304750] to-[#5D5B65]",
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
    return { background: GRADIENT_PRESETS.galaxy };
  }
  return { background: GRADIENT_PRESETS[preset] };
}

/**
 * グラデーションTailwindクラスを取得
 */
export function getGradientClass(preset?: GradientPreset): string {
  if (!preset || !GRADIENT_CLASSES[preset]) {
    return GRADIENT_CLASSES.galaxy;
  }
  return GRADIENT_CLASSES[preset];
}
