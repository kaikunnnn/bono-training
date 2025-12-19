/**
 * Favorite Article Card - Type Definitions
 * BONO UI/UXダッシュボード用
 */

/**
 * カテゴリカラーの型定義
 */
export interface CategoryColor {
  /** 背景色（HEXカラーコード） */
  bg: string;
  /** テキスト色（HEXカラーコード） */
  text: string;
}

/**
 * お気に入り記事カードのProps
 */
export interface FavoriteArticleCardProps {
  /**
   * アイコン画像URL、テキスト、または絵文字
   * @example "CC"
   * @example "🎨"
   * @example "https://example.com/icon.png"
   * @default "CC"
   */
  icon?: string;

  /**
   * アイコン背景色（HEXカラーコード）
   * @example "#F5F5F5"
   * @default "#F5F5F5"
   */
  iconBgColor?: string;

  /**
   * カテゴリ名
   * @example "ビジュアル"
   * @example "コーディング"
   */
  category: string;

  /**
   * カテゴリの表示色
   * @default { bg: "#E8F5E9", text: "#2E7D32" }
   */
  categoryColor?: CategoryColor;

  /**
   * 記事のタイトル
   * @example "送る視線①：ビジュアル"
   */
  title: string;

  /**
   * 記事の説明文
   * @example "by「3種盛」ではじめるUIデザイン入門"
   */
  description: string;

  /**
   * お気に入り状態
   * @default false
   */
  isFavorite?: boolean;

  /**
   * お気に入りボタンクリック時のコールバック
   */
  onFavoriteToggle?: (isFavorite: boolean) => void;

  /**
   * カード全体クリック時のコールバック
   */
  onClick?: () => void;

  /**
   * カスタムクラス名
   */
  className?: string;

  /**
   * 記事ID（データ管理用）
   */
  articleId?: string;
}

/**
 * 記事データの型定義
 */
export interface ArticleData {
  id: string;
  icon?: string;
  iconBgColor?: string;
  category: string;
  categoryColor?: CategoryColor;
  title: string;
  description: string;
  isFavorite: boolean;
  author?: string;
  publishedAt?: Date;
  url?: string;
}

/**
 * カテゴリカラープリセット
 */
export const CATEGORY_COLORS = {
  visual: {
    bg: '#E8F5E9',
    text: '#2E7D32',
  },
  coding: {
    bg: '#E3F2FD',
    text: '#1565C0',
  },
  design: {
    bg: '#F3E5F5',
    text: '#6A1B9A',
  },
  typography: {
    bg: '#FBE9E7',
    text: '#D84315',
  },
  ux: {
    bg: '#FFF9C4',
    text: '#F57F17',
  },
  default: {
    bg: '#E8F5E9',
    text: '#2E7D32',
  },
} as const;

/**
 * カテゴリ名の型
 */
export type CategoryName = keyof typeof CATEGORY_COLORS;

/**
 * カテゴリからカラーを取得
 */
export function getCategoryColor(category: string): CategoryColor {
  const normalizedCategory = category.toLowerCase() as CategoryName;
  return CATEGORY_COLORS[normalizedCategory] || CATEGORY_COLORS.default;
}

/**
 * アイコンタイプの型
 */
export type IconType = 'text' | 'emoji' | 'image';

/**
 * アイコンタイプを判定
 */
export function getIconType(icon: string): IconType {
  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return 'image';
  }
  if (/[\u{1F300}-\u{1F9FF}]/u.test(icon)) {
    return 'emoji';
  }
  return 'text';
}
