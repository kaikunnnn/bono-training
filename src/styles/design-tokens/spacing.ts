/**
 * BONO Blog - Spacing Design Tokens
 *
 * 99frontend 仕様に基づくスペーシング定義
 * 全ての値はピクセル単位で正確に定義
 * 参照: .claude/docs/blog/99frontend/
 */

export const BLOG_SPACING = {
  // ヘッダー
  header: {
    height: '74.07px',
    padding: '24px',
    paddingTablet: '16px',
    paddingMobile: '12px',
    logoWidth: '112px',
    logoHeight: '26.07px',
    logoImageWidth: '88px',
    logoImageHeight: '26.07px',
  },

  // ヒーローセクション
  hero: {
    height: {
      desktop: '381px',
      tablet: '340px',
      mobile: '280px',
    },
    paddingTop: '16px',
    paddingBottom: {
      desktop: '164px',
      tablet: '100px',
      mobile: '80px',
    },
    titleWidth: '344px',
    titleHeight: '89px',
    subtitleWidth: '325px',
    subtitleHeight: '20px',
    gap: '32px', // タイトルとサブタイトルの間
  },

  // ブログカード
  card: {
    width: '1120px',
    height: '159px',
    padding: '12px',
    gap: '32px', // サムネイルとテキストの間
    thumbnailWidth: '240px',
    thumbnailHeight: '135px',
    thumbnailWidthTablet: '180px',
    thumbnailHeightTablet: '120px',
    thumbnailWidthMobile: '120px',
    thumbnailHeightMobile: '80px',
    emojiSize: '64px',
    emojiSizeTablet: '48px',
    emojiSizeMobile: '40px',
    borderRadius: '8px',
    textGap: '8px', // タイトルとメタ情報の間
    metaGap: '12px', // カテゴリと日付の間
  },

  // ブログリスト
  list: {
    maxWidth: '872px',
    gap: '24px', // カード間のギャップ（垂直方向）
    padding: {
      desktop: '0px',
      tablet: '32px',
      mobile: '16px',
    },
  },

  // カテゴリフィルター
  categoryFilter: {
    gap: '16px',
    buttonPadding: '8px 16px',
    buttonBorderRadius: '8px',
  },

  // ページネーション
  pagination: {
    gap: '8px',
    buttonSize: '40px',
    buttonBorderRadius: '8px',
  },

  // ブレークポイント
  breakpoints: {
    mobile: '375px',
    tablet: '768px',
    desktop: '1920px',
  },
} as const;

// TypeScript型定義
export type BlogSpacing = typeof BLOG_SPACING;
