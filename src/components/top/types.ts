/**
 * トップ トレーニングカード 型定義
 */

export type EyecatchType = 'info-arch' | 'uiux-career' | 'ux-design' | 'ui-visual';

export interface TrainingCardData {
  id: string;
  category: string;              // 左上ラベル（例: "情報設計"）
  categoryColor: string;         // カテゴリ文字色
  badge: string;                 // 右上ラベル（例: "トレーニング"）
  badgeOpacity?: number;         // バッジ透明度 (0-1)
  backgroundColor: string;       // カード背景色
  backgroundGradient?: string;   // 背景グラデーション（オプション）
  largeTitle: string;            // 中央大タイトル（例: "情報設計のきほん"）
  largeTitleColor: string;       // タイトル色
  description: string;           // 下部説明文
  descriptionOpacity?: number;   // 説明文透明度 (0-1)
  eyecatchType: EyecatchType;    // アイキャッチタイプ
  badgeRotation: number;         // バッジの傾き（deg）
  roadmapSlug: string;           // ロードマップのスラッグ（例: "roadmap-ia"）
  eyecatchPosition: {            // アイキャッチ位置（Figmaデザイン基準、デスクトップ420×570px）
    left: number;                // 左位置（px）
    top: number;                 // 上位置（px）
    width: number;               // 幅（px）
    height: number;              // 高さ（px）
  };
}
