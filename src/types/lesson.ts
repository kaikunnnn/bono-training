/**
 * 紐づくロードマップ情報
 */
export interface LinkedRoadmap {
  slug: string;
  title: string;
  shortTitle?: string;
}

/**
 * レッスンの型定義
 */
export interface Lesson {
  /** 一意のID */
  id: string;
  /** カテゴリー（例: "情報設計", "UIデザイン"） */
  category?: string;
  /** レッスンタイトル */
  title: string;
  /** 説明文（2-3行程度） */
  description?: string;
  /** サムネイル画像のパス */
  thumbnail?: string;
  /** URL用のスラッグ（将来の詳細ページ用） */
  slug: string;
  /** 紐づくロードマップ */
  linkedRoadmaps?: LinkedRoadmap[];
}
