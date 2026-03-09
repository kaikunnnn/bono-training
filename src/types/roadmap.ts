/**
 * ロードマップの型定義
 *
 * ロードマップは複数のステップから構成され、
 * 各ステップは関連するレッスンコースにリンクする。
 */

// ============================================
// Roadmap 基本型
// ============================================

/** ロードマップの統計情報 */
export interface RoadmapStats {
  /** 期間（例: "6ヶ月"） */
  duration: string;
  /** ステップ数 */
  stepsCount: number;
  /** レッスン数 */
  lessonsCount: number;
  /** 想定学習時間（例: "100時間以上"） */
  estimatedHours?: string;
}

/** ロードマップ */
export interface Roadmap {
  /** 一意のID */
  id: string;
  /** URL用のスラッグ */
  slug: string;
  /** タイトル */
  title: string;
  /** サブタイトル（例: "未経験からUIUXデザイナーへ"） */
  subtitle?: string;
  /** 説明文 */
  description: string;
  /** 統計情報 */
  stats: RoadmapStats;
  /** 対象者（誰向けか） */
  audience?: RoadmapAudience[];
  /** このロードマップで得られるもの */
  benefits: RoadmapBenefit[];
  /** ステップ一覧 */
  steps: RoadmapStep[];
  /** 「詳しく知る」リンク先（例: "/roadmaps/career-change/about"） */
  aboutPageUrl?: string;
  /** 関連するガイド記事のスラッグ（例: "skills-requirements"） */
  relatedGuideSlug?: string;
  /** サムネイル画像URL */
  thumbnailUrl?: string;
  /** グラデーション背景色（例: "from-blue-500 to-purple-600"） */
  gradientColors?: string;
}

// ============================================
// RoadmapStep 型
// ============================================

/** ステップの種類 */
export type StepType = "course" | "special";

/** 通常のステップ（コースにリンク） */
export interface RoadmapStepCourse {
  /** ステップ番号（0から開始、Step 0は特殊） */
  stepNumber: number;
  /** ステップ種類 */
  type: "course";
  /** ステップタイトル */
  title: string;
  /** ステップ説明 */
  description: string;
  /** このステップのゴール（何を達成するか） */
  goal?: string;
  /** このステップで身につくスキル一覧 */
  skills?: string[];
  /** リンク先コースのスラッグ */
  linkedCourseSlug: string;
  /** このステップに含まれるレッスンのスラッグ一覧（Sanity連携用） */
  lessonSlugs: string[];
  /** 別のロードマップへのリンク（指定時はロードマップカードを表示） */
  linkedRoadmapSlug?: string;
}

/** 特殊ステップ（Step 0: リンク集・心構え） */
export interface RoadmapStepSpecial {
  /** ステップ番号（通常0） */
  stepNumber: number;
  /** ステップ種類 */
  type: "special";
  /** ステップタイトル */
  title: string;
  /** ステップ説明 */
  description: string;
  /** 特殊ステップのコンテンツ */
  content: SpecialStepContent;
}

/** ステップ（通常 or 特殊） */
export type RoadmapStep = RoadmapStepCourse | RoadmapStepSpecial;

// ============================================
// SpecialStepContent 型（Step 0用）
// ============================================

/** 特殊ステップ内のリンク */
export interface SpecialStepLink {
  /** リンクタイトル */
  title: string;
  /** リンク先URL */
  url: string;
  /** 説明（任意） */
  description?: string;
  /** アイコン名（任意、lucide-react） */
  icon?: string;
}

/** 特殊ステップ内のガイダンス項目 */
export interface SpecialStepGuidance {
  /** タイトル */
  title: string;
  /** 説明文 */
  description: string;
  /** アイコン名（任意） */
  icon?: string;
}

/** 特殊ステップのコンテンツ */
export interface SpecialStepContent {
  /** リンク集 */
  links: SpecialStepLink[];
  /** 心構え・ガイダンス */
  guidance: SpecialStepGuidance[];
  /** 注意点・Tips */
  tips?: string[];
}

// ============================================
// RoadmapBenefit 型
// ============================================

/** ロードマップで得られるもの */
export interface RoadmapBenefit {
  /** アイコン名（lucide-react） */
  icon: string;
  /** タイトル */
  title: string;
  /** 説明文 */
  description: string;
}

/** 対象者（誰向けか） */
export interface RoadmapAudience {
  /** ラベル（例: "UI未経験者"） */
  label: string;
  /** 説明（例: "デザインツールを触ったことがない方"） */
  description: string;
}

// ============================================
// Sanity連携用の型
// ============================================

/** Sanityから取得したレッスン情報（ロードマップ表示用） */
export interface RoadmapLesson {
  /** Sanity ID */
  _id: string;
  /** タイトル */
  title: string;
  /** スラッグ */
  slug: string;
  /** 説明 */
  description?: string;
  /** アイコン画像URL */
  iconImageUrl?: string;
  /** サムネイル画像URL */
  thumbnailUrl?: string;
  /** プレミアムコンテンツか */
  isPremium?: boolean;
}

// ============================================
// 型ガード
// ============================================

/** ステップが通常ステップ（コース）かどうか */
export function isStepCourse(step: RoadmapStep): step is RoadmapStepCourse {
  return step.type === "course";
}

/** ステップが特殊ステップかどうか */
export function isStepSpecial(step: RoadmapStep): step is RoadmapStepSpecial {
  return step.type === "special";
}
