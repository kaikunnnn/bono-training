/**
 * Pattern 12: gaaboo.jp スタイルシステム
 *
 * 分析結果に基づいた具体的な数値定義
 * https://gaaboo.jp/recruit/ から抽出
 */

export const gaabooStyles = {
  // ============================================
  // タイポグラフィ
  // ============================================
  typography: {
    // フォントサイズ
    size: {
      xs: '13px',      // キャプション、注釈
      sm: '14px',      // 小テキスト
      base: '15px',    // 本文（基準）
      md: '18px',      // h4、カードタイトル
      lg: '20px',      // h3、サブ見出し
      xl: '28px',      // h2、セクション見出し
      '2xl': '42px',   // h1、キャッチコピー
      '3xl': '52px',   // 特大見出し
    },
    // フォントウェイト
    weight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    // 行間
    leading: {
      tight: '1.35',    // 見出し
      snug: '1.45',     // サブ見出し
      normal: '1.6',    // 引用、キャプション
      relaxed: '1.75',  // 本文（重要！）
    },
    // 字間
    tracking: {
      tight: '-0.01em',
      normal: '0.01em',
      wide: '0.03em',   // 日本語見出し
    },
  },

  // ============================================
  // スペーシング
  // ============================================
  spacing: {
    // 基本単位（8pxベース）
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',   // セクション間

    // セマンティック
    section: {
      paddingY: '80px',
      paddingX: '24px',
    },
    header: {
      titleMb: '16px',
      descMb: '32px',
      toContent: '48px',
    },
    card: {
      gap: '24px',
      padding: '24px',
    },
    grid: {
      gap: '32px',
      gapSm: '24px',
    },
  },

  // ============================================
  // カラー
  // ============================================
  colors: {
    // プライマリ
    primary: '#f5533e',
    primaryHover: '#e04a35',

    // セカンダリ
    secondary: '#30abe6',
    secondaryHover: '#2899d1',

    // テキスト
    text: {
      primary: '#1a1a1a',    // 見出し
      body: '#333333',       // 本文
      secondary: '#555555',  // 補足
      muted: '#9e9e9e',      // 淡いテキスト
    },

    // 背景
    bg: {
      white: '#ffffff',
      light: '#f8f9fa',
      warm: '#F9F9F7',       // BONO既存
      dark: '#32373c',
    },

    // ボーダー
    border: {
      light: '#eeeeee',
      default: '#e0e0e0',
    },
  },

  // ============================================
  // 装飾
  // ============================================
  decoration: {
    // 角丸
    radius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      '2xl': '19px',    // 大きなカード
      '3xl': '24px',
      full: '9999px',
    },
    // シャドウ
    shadow: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
      md: '0 4px 12px rgba(0, 0, 0, 0.1)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
      hover: '0 8px 24px rgba(0, 0, 0, 0.12)',
    },
    // トランジション
    transition: {
      fast: '150ms ease-out',
      base: '200ms ease-out',
      slow: '300ms ease-out',
    },
  },

  // ============================================
  // レイアウト
  // ============================================
  layout: {
    maxWidth: '900px',       // gaaboo基準
    maxWidthWide: '1012px',  // BONO既存
    textMaxWidth: '720px',   // 読みやすいテキスト幅
    gutter: '24px',
  },
} as const;

// Tailwindで使いやすいクラス名
export const tw = {
  // セクション
  section: 'py-20 px-6',
  sectionGray: 'py-20 px-6 bg-[#f8f9fa]',
  container: 'max-w-[900px] mx-auto',
  containerWide: 'max-w-[1012px] mx-auto',

  // タイポグラフィ
  h1: 'text-[42px] font-bold leading-[1.35] tracking-[0.02em] text-[#1a1a1a]',
  h2: 'text-[28px] font-bold leading-[1.35] tracking-[0.03em] text-[#1a1a1a]',
  h3: 'text-[20px] font-semibold leading-[1.45] text-[#1a1a1a]',
  h4: 'text-[18px] font-semibold leading-[1.45] text-[#1a1a1a]',
  body: 'text-[15px] leading-[1.75] text-[#333333]',
  bodyLarge: 'text-[18px] leading-[1.7] text-[#333333]',
  caption: 'text-[13px] leading-[1.6] text-[#9e9e9e]',

  // カード
  card: 'bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200',
  cardLarge: 'bg-white rounded-[19px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]',

  // ボタン
  btnPrimary: 'bg-[#f5533e] hover:bg-[#e04a35] text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200',

  // グリッド
  grid2: 'grid grid-cols-1 md:grid-cols-2 gap-8',
  grid3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
} as const;
