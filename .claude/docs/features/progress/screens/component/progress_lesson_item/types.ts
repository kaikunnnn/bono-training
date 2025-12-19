/**
 * Progress Lesson Component Type Definitions
 * BONOオンライン学習プラットフォーム用
 */

/**
 * レッスン進捗カードのProps
 */
export interface ProgressLessonProps {
  /**
   * アイコン画像URL、テキスト、または絵文字
   * @example "COPY"
   * @example "🎨"
   * @example "https://example.com/icon.png"
   * @default "COPY"
   */
  icon?: string;

  /**
   * アイコン背景色
   * HEXカラーコードまたはTailwind CSSクラス
   * @example "#FFE5E5"
   * @example "bg-pink-100"
   * @default "#FFE5E5"
   */
  iconBgColor?: string;

  /**
   * レッスンのタイトル
   * @example "センスを盗む技術"
   */
  title: string;

  /**
   * 進捗率 (0-100)
   * @example 25
   * @min 0
   * @max 100
   */
  progress: number;

  /**
   * 現在のステップ名
   * @example "送る視線①:ビジュアル"
   */
  currentStep: string;

  /**
   * ステップが完了しているかどうか
   * true: ✓ (緑色)
   * false: ✕ (グレー)
   */
  isStepCompleted: boolean;

  /**
   * カードクリック時のコールバック
   * 指定された場合、カードがクリッカブルになる
   */
  onClick?: () => void;
}

/**
 * レッスンデータの型定義
 */
export interface LessonData {
  id: string;
  icon: string;
  iconBgColor: string;
  title: string;
  progress: number;
  currentStep: string;
  isStepCompleted: boolean;
  category?: 'ui' | 'ux' | 'coding' | 'design' | 'other';
  lastUpdated?: Date;
}

/**
 * レッスンカテゴリー別のアイコン背景色
 */
export const CATEGORY_COLORS: Record<string, string> = {
  ui: '#E3F2FD',        // 青
  ux: '#F3E5F5',        // 紫
  coding: '#FFF9C4',    // 黄
  design: '#E8F5E9',    // 緑
  typography: '#FBE9E7', // オレンジ
  prototype: '#E0F2F1',  // ティール
  default: '#FFE5E5',    // ピンク
};

/**
 * レッスンカテゴリー別のアイコン
 */
export const CATEGORY_ICONS: Record<string, string> = {
  ui: 'UI',
  ux: 'UX',
  coding: 'CODE',
  design: '🎨',
  typography: '📐',
  prototype: '🚀',
  default: 'COPY',
};

/**
 * 進捗ステータス
 */
export type ProgressStatus = 'not-started' | 'in-progress' | 'completed';

/**
 * 進捗率からステータスを判定
 */
export function getProgressStatus(progress: number): ProgressStatus {
  if (progress === 0) return 'not-started';
  if (progress === 100) return 'completed';
  return 'in-progress';
}

/**
 * レッスンデータのバリデーション
 */
export function validateLessonData(data: Partial<LessonData>): data is LessonData {
  return (
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.progress === 'number' &&
    data.progress >= 0 &&
    data.progress <= 100 &&
    typeof data.currentStep === 'string' &&
    typeof data.isStepCompleted === 'boolean'
  );
}

/**
 * カテゴリーからアイコンと背景色を取得
 */
export function getCategoryStyle(category?: string) {
  const cat = category || 'default';
  return {
    icon: CATEGORY_ICONS[cat] || CATEGORY_ICONS.default,
    iconBgColor: CATEGORY_COLORS[cat] || CATEGORY_COLORS.default,
  };
}
