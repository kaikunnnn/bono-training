/**
 * BONO Blog - Typography Design Tokens
 *
 * 99frontend 仕様に基づくタイポグラフィ定義
 * フォント: Noto Sans JP（タイトル）、Hind（メタ情報）
 * 参照: .claude/docs/blog/99frontend/
 */

export const BLOG_FONTS = {
  // フォントファミリー
  title: "'Noto Sans JP', sans-serif",
  meta: "'Hind', sans-serif",

  // ヒーローセクション
  hero: {
    title: {
      family: "'Noto Sans JP', sans-serif",
      size: {
        desktop: '96px',
        tablet: '56px',
        mobile: '48px',
      },
      weight: 700,
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
    },
    subtitle: {
      family: "'Noto Sans JP', sans-serif",
      size: '14px',
      weight: 500,
      lineHeight: '20px',
      letterSpacing: '0.7px',
    },
  },

  // ブログカード
  card: {
    title: {
      family: "'Noto Sans JP', sans-serif",
      size: '24px',
      weight: 700,
      lineHeight: '24px',
    },
    meta: {
      family: "'Hind', sans-serif",
      size: '12px',
      weight: 500,
      lineHeight: '16px',
    },
  },

  // ヘッダー
  header: {
    logo: {
      family: "'Noto Sans JP', sans-serif",
    },
  },

  // ブログ詳細ページ
  detail: {
    title: {
      family: "'Noto Sans JP', sans-serif",
      size: '48px',
      weight: 700,
      lineHeight: '1.2',
    },
    body: {
      family: "'Noto Sans JP', sans-serif",
      size: '16px',
      weight: 400,
      lineHeight: '1.8',
    },
  },
} as const;

// TypeScript型定義
export type BlogFonts = typeof BLOG_FONTS;
