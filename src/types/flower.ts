/**
 * 璃奈フラワー - レッスン完了可視化機能の型定義
 */

export type GrowthStage = 0 | 1 | 2 | 3 | 4 | 5;

export interface LessonProgress {
  lessonId: string;           // Sanity Lesson ID
  lessonTitle: string;        // レッスンタイトル
  lessonSlug?: string;        // レッスンスラッグ（遷移用）
  category?: string;          // カテゴリー（UI, UX, 情報設計）
  totalArticles: number;      // レッスン内の総記事数
  completedArticles: number;  // 完了した記事数
  completionRate: number;     // 完了率 (0-100)
  growthStage: GrowthStage;   // 成長段階 (0-5)
  lastUpdated: string;        // 最終更新日時 (ISO 8601)
}

export interface UserFlowerCollection {
  userId: string;
  flowers: LessonProgress[];
  totalFlowersCompleted: number;
  lastUpdated: string;
}

export interface FlowerColors {
  seed: string;
  stem: string;
  leaf: string;
  bud: string;
  petal: string;
  center: string;
  sparkle: string;
}

export const RINA_FLOWER_COLORS: FlowerColors = {
  seed: '#8B4513',      // 茶色
  stem: '#2D5016',      // 濃緑
  leaf: '#4CAF50',      // 緑
  bud: '#FFB6C1',       // ライトピンク
  petal: '#FF69B4',     // ホットピンク（璃奈カラー）
  center: '#FFD700',    // ゴールド
  sparkle: '#FFFFFF'    // 白（パーティクル）
};

export const GROWTH_STAGE_NAMES: Record<GrowthStage, string> = {
  0: '種',
  1: '芽',
  2: '成長中',
  3: 'つぼみ',
  4: '開花中',
  5: '満開'
};

export const GROWTH_STAGE_DESCRIPTIONS: Record<GrowthStage, string> = {
  0: 'まだ始まっていません',
  1: '学習を始めました！',
  2: '順調に成長しています',
  3: 'もう少しで完成です',
  4: 'あと一歩で満開です！',
  5: 'レッスン完了おめでとうございます！'
};
