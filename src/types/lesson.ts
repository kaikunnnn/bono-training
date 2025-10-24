/**
 * レッスンの型定義
 */
export interface Lesson {
  /** 一意のID */
  id: string;
  /** カテゴリー（例: "情報設計", "UIデザイン"） */
  category: string;
  /** レッスンタイトル */
  title: string;
  /** 説明文（2-3行程度） */
  description: string;
  /** カバー画像のパス */
  coverImage: string;
  /** URL用のスラッグ（将来の詳細ページ用） */
  slug: string;
}
