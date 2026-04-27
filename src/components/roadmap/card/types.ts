import type { GradientPreset, GradientDef } from '@/styles/gradients';

export interface RoadmapCardV2Props {
  /** ロードマップのスラッグ（URLに使用） */
  slug: string;
  /** ロードマップのタイトル */
  title: string;
  /** ロードマップの説明文 */
  description: string;
  /** サムネイル画像URL */
  thumbnailUrl?: string;
  /** 目安期間（例: "1-2", "6~"） */
  estimatedDuration: string;
  /** ステップ数 */
  stepCount?: number;
  /** 短縮タイトル（バッジ表示用、例: "UXデザイン"） */
  shortTitle?: string;
  /** グラデーションプリセット */
  gradientPreset?: GradientPreset;
  /** カスタムグラデーション（プリセットより優先） */
  customGradient?: GradientDef;
  /** カードのバリアント */
  variant?: 'gradient' | 'white';
  /** レイアウト方向 */
  orientation?: 'vertical' | 'horizontal';
  /** サムネイルスタイル */
  thumbnailStyle?: 'default' | 'wave';
  /** リンク先のベースパス */
  basePath?: string;
  /** ラベルテキスト（shortTitleがない場合のフォールバック） */
  label?: string;
  /** 追加のクラス名 */
  className?: string;
}

export type TextVariant = 'light' | 'dark';
