## blog_page. > bonoSite-main から該当するページのスタイルとアニメーションのみを流用する

bonoSite-main

    •	流用元サイトの要素分解（レイアウト、カード、本文、目次、タグ/カテゴリ、CTA、トーン&マナー）
    •	タイポ/カラー/余白/アニメのルール
    •	「どこをそのまま使う／どこをアレンジする」境界

## bonosSite-main から流用したいデザイン解説

binoSite-main にあるコードから以下のページの「見た目のデザインと構造」をそのまま真似してください。
記事管理の CMS などの方法は新しく実装し直しますがブログのトップとその詳細ページのデザインはここから使いたいです

### ページ

- /blog
  - /blog は / のトップページのデザインが該当します
- /blog/:slug
  - /content/:slug のページのデザインが該当します
  - ※本文に CSS が効いてないのですがこれは実装ミスです。実際は適用されたデザインが望ましい
- /blog/category 以下
  - これは該当するページがないので新規作成します

## 1. レイアウト構造（詳細コード定義）

### 1-1. コンテナ設定

```javascript
// tailwind.config.js の container 設定
module.exports = {
  theme: {
    extend: {
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
    },
  },
}
```

### 1-2. ページレイアウト構造

```jsx
// /blog メインページのレイアウト構造
<div className="min-h-screen bg-Top">
  {/* ヘッダー */}
  <Header className="fixed py-6 px-6 z-50" />

  {/* メインコンテンツ */}
  <main className="container pt-24">
    {/* ページタイトルセクション */}
    <div className="text-center py-12">
      <h1 className="text-4xl md:text-5xl font-bold !leading-normal mb-4">
        ブログ
      </h1>
      <p className="text-lg text-gray-600">
        最新の記事をお届けします
      </p>
    </div>

    {/* コンテンツエリア */}
    <div className="w-11/12 md:w-10/12 mx-auto">
      {/* カテゴリフィルター */}
      <div className="mb-8">
        {/* CategoryFilter コンポーネント */}
      </div>

      {/* 記事一覧グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* BlogCard コンポーネント群 */}
      </div>

      {/* ページネーション */}
      <div className="mt-12 flex justify-center">
        {/* Pagination コンポーネント */}
      </div>
    </div>
  </main>

  {/* フッター */}
  <Footer />
</div>
```

### 1-3. 記事詳細ページのレイアウト構造

```jsx
// /blog/:slug 記事詳細ページのレイアウト構造
<div className="min-h-screen bg-Top">
  {/* ヘッダー */}
  <Header className="fixed py-6 px-6 z-50" />

  {/* メインコンテンツ */}
  <main className="container pt-24">
    {/* 記事ヘッダーセクション */}
    <div className="text-center py-12 m-12">
      {/* アイキャッチ（EyecatchEpisode風） */}
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
          📝
        </div>
        <h1 className="text-4xl md:text-5xl font-bold !leading-normal">
          記事タイトル
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          記事の説明文がここに入ります
        </p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>2024年1月15日</span>
          <span>•</span>
          <span>山田太郎</span>
          <span>•</span>
          <span>5分で読める</span>
        </div>
        {/* カテゴリ・タグ */}
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            テクノロジー
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
            React
          </span>
        </div>
      </div>
    </div>

    {/* 記事本文エリア */}
    <div className="w-11/12 md:w-10/12 mx-auto">
      <article className="prose prose-lg max-w-none">
        {/* 記事本文コンテンツ */}
      </article>

      {/* 関連記事セクション */}
      <div className="mt-16 pt-8 border-t">
        <h3 className="text-2xl font-bold mb-6">関連記事</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 関連記事カード */}
        </div>
      </div>
    </div>
  </main>

  {/* フッター */}
  <Footer />
</div>
```

### 1-4. 背景設定

```css
/* styles/globals.css */
.bg-Top {
  background-image: url('/top-image.svg');
  background-repeat: no-repeat;
  background-position: top center;
  background-size: cover;
}
```

### 1-5. ヘッダー設定

```jsx
// ブログページ用ヘッダー
<header className="fixed top-0 left-0 right-0 py-6 px-6 z-50 bg-white/80 backdrop-blur-sm border-b">
  <div className="container flex items-center justify-between">
    {/* ロゴ */}
    <Link to="/" className="text-2xl font-bold">
      Logo
    </Link>

    {/* ナビゲーション */}
    <nav className="hidden md:flex items-center space-x-6">
      <Link to="/blog" className="text-gray-700 hover:text-gray-900">
        ブログ
      </Link>
      {/* その他のナビリンク */}
    </nav>

    {/* モバイルメニューボタン */}
    <button className="md:hidden">
      <MenuIcon className="w-6 h-6" />
    </button>
  </div>
</header>
```

### 1-6. グリッドシステム

```jsx
// レスポンシブグリッドの基本設定
<div className="grid gap-6">
  {/* モバイル: 1列, タブレット: 2列, デスクトップ: 3列 */}
  <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {/* カードコンポーネント */}
  </div>
</div>

// 大きなカードの場合（フィーチャー記事など）
<div className="grid gap-6">
  {/* モバイル: 1列, デスクトップ: 2列 */}
  <div className="grid-cols-1 lg:grid-cols-2">
    {/* フィーチャーカードコンポーネント */}
  </div>
</div>
```

### 1-7. サイドバーレイアウト（カテゴリページ用）

```jsx
// /blog/category/:category ページのレイアウト
<div className="w-11/12 md:w-10/12 mx-auto">
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
    {/* サイドバー */}
    <aside className="lg:col-span-1">
      <div className="sticky top-32">
        <h3 className="text-lg font-semibold mb-4">カテゴリ</h3>
        <nav className="space-y-2">
          {/* カテゴリリンク */}
        </nav>
      </div>
    </aside>

    {/* メインコンテンツ */}
    <main className="lg:col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 記事カード */}
      </div>
    </main>
  </div>
</div>
```

## 3. タイポグラフィ（詳細コード定義）

### 3-1. フォント読み込み設定

```css
/* styles/globals.css - フォント読み込み */
@import url('https://fonts.googleapis.com/css2?family=Hind:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Dongle:wght@300;400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@300;400;500;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Dela+Gothic+One&display=swap');
@import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');

:root {
  --font-hind: 'Hind', sans-serif;
  --font-dongle: 'Dongle', sans-serif;
  --font-noto-sans-jp: 'Noto Sans JP', sans-serif;
  --font-zen-kaku: 'Zen Kaku Gothic New', sans-serif;
  --font-dela-gothic: 'Dela Gothic One', cursive;
  --font-dot-gothic: 'DotGothic16', cursive;
}
```

### 3-2. ベースフォント設定

```css
/* styles/globals.css - ベースフォント */
body {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.6;
  color: #374151; /* text-gray-700 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Inter フォールバック（既存のプロジェクトで使用されている場合） */
body {
  font-family: "Inter", var(--font-hind), var(--font-noto-sans-jp), sans-serif;
}
```

### 3-3. Tailwind Config フォント設定

```javascript
// tailwind.config.js - フォント設定
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // プライマリフォント（本文・UI用）
        sans: ['Inter', 'Hind', 'Noto Sans JP', 'sans-serif'],
        hind: ['var(--font-hind)', 'sans-serif'],

        // 日本語専用フォント
        'noto-sans': ['var(--font-noto-sans-jp)', 'sans-serif'],
        'zen-kaku': ['var(--font-zen-kaku)', 'sans-serif'],

        // 装飾・アクセント用フォント
        dongle: ['var(--font-dongle)', 'sans-serif'],
        'dela-gothic': ['var(--font-dela-gothic)', 'cursive'],
        'dot-gothic': ['var(--font-dot-gothic)', 'cursive'],
      },
      fontSize: {
        // 既存サイズ
        xxs: ['10px', { lineHeight: '14px' }],
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '32px' }],
        '2xl': ['24px', { lineHeight: '36px' }],
        '3xl': ['30px', { lineHeight: '42px' }],
        '4xl': ['36px', { lineHeight: '50px' }],
        '5xl': ['48px', { lineHeight: '56px' }],
        '6xl': ['60px', { lineHeight: '72px' }],
        '7xl': ['72px', { lineHeight: '84px' }],
        '8xl': ['96px', { lineHeight: '112px' }],
        '9xl': ['128px', { lineHeight: '144px' }],
      },
    },
  },
}
```

### 3-4. 見出しスタイル（階層別）

```css
/* styles/globals.css - 見出し設定 */

/* H1 - ページメインタイトル（記事詳細ページ） */
h1, .h1 {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-size: 2.25rem; /* text-4xl: 36px */
  font-weight: 700; /* font-bold */
  line-height: normal !important; /* !leading-normal */
  color: #111827; /* text-gray-900 */
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  h1, .h1 {
    font-size: 3rem; /* md:text-5xl: 48px */
  }
}

/* H2 - セクションタイトル */
h2, .h2 {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-size: 1.875rem; /* text-3xl: 30px */
  font-weight: 700; /* font-bold */
  line-height: 1.2;
  color: #111827; /* text-gray-900 */
  margin-top: 2rem;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  h2, .h2 {
    font-size: 2.25rem; /* md:text-4xl: 36px */
  }
}

/* H3 - サブセクションタイトル */
h3, .h3 {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-size: 1.5rem; /* text-2xl: 24px */
  font-weight: 600; /* font-semibold */
  line-height: 1.3;
  color: #1f2937; /* text-gray-800 */
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

/* H4 - 小見出し */
h4, .h4 {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-size: 1.25rem; /* text-xl: 20px */
  font-weight: 600; /* font-semibold */
  line-height: 1.4;
  color: #374151; /* text-gray-700 */
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

/* H5, H6 - 補助見出し */
h5, h6, .h5, .h6 {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-size: 1.125rem; /* text-lg: 18px */
  font-weight: 600; /* font-semibold */
  line-height: 1.4;
  color: #4b5563; /* text-gray-600 */
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
```

### 3-5. カードタイトル・説明文スタイル

```css
/* CardTitle スタイル（ブログカード用） */
.card-title {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-size: 1.125rem; /* text-lg: 18px */
  font-weight: 600; /* font-semibold */
  line-height: 1.4;
  color: #111827; /* text-gray-900 */
}

/* CardDescription スタイル（ブログカード用） */
.card-description {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-size: 1rem; /* text-base: 16px */
  font-weight: 400; /* font-normal */
  line-height: 1.5;
  color: #6b7280; /* text-gray-500 */
}

/* フィーチャーカード用のより大きなタイトル */
.featured-card-title {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-size: 1.5rem; /* text-2xl: 24px */
  font-weight: 700; /* font-bold */
  line-height: 1.25; /* leading-tight */
  color: #111827; /* text-gray-900 */
}

.featured-card-description {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-size: 1.125rem; /* text-lg: 18px */
  font-weight: 400; /* font-normal */
  line-height: 1.6;
  color: #4b5563; /* text-gray-600 */
}
```

### 3-6. 本文・記事コンテンツスタイル

```css
/* 記事本文のproseスタイル */
.prose {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-size: 1.125rem; /* text-lg: 18px */
  line-height: 1.7; /* leading-relaxed */
  color: #374151; /* text-gray-700 */
  max-width: none;
}

.prose p {
  margin-bottom: 1.25em;
  font-weight: 400;
}

.prose strong {
  font-weight: 600;
  color: #111827; /* text-gray-900 */
}

.prose em {
  font-style: italic;
}

/* リスト */
.prose ul, .prose ol {
  margin: 1.25em 0;
  padding-left: 1.625em;
}

.prose li {
  margin: 0.5em 0;
}

/* 引用 */
.prose blockquote {
  font-style: italic;
  border-left: 4px solid #e5e7eb; /* border-gray-200 */
  padding-left: 1em;
  margin: 1.5em 0;
  color: #6b7280; /* text-gray-500 */
}

/* コード */
.prose code {
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
  font-size: 0.875em;
  color: #dc2626; /* text-red-600 */
  background-color: #f3f4f6; /* bg-gray-100 */
  padding: 0.125em 0.25em;
  border-radius: 0.25rem;
}

.prose pre {
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
  background-color: #1f2937; /* bg-gray-800 */
  color: #f9fafb; /* text-gray-50 */
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5em 0;
}

.prose pre code {
  color: inherit;
  background: none;
  padding: 0;
}
```

### 3-7. UI要素のフォントスタイル

```css
/* ボタンテキスト */
.button-text {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-weight: 500; /* font-medium */
  letter-spacing: 0.025em; /* tracking-wider */
}

/* バッジ・タグテキスト */
.badge-text {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-size: 0.75rem; /* text-xs: 12px */
  font-weight: 500; /* font-medium */
  letter-spacing: 0.05em; /* tracking-wide */
  text-transform: uppercase;
}

/* メタ情報（日付、著者など） */
.meta-text {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-size: 0.875rem; /* text-sm: 14px */
  font-weight: 400; /* font-normal */
  color: #6b7280; /* text-gray-500 */
}

/* ナビゲーションリンク */
.nav-link {
  font-family: var(--font-hind), var(--font-noto-sans-jp), sans-serif;
  font-size: 1rem; /* text-base: 16px */
  font-weight: 500; /* font-medium */
  color: #374151; /* text-gray-700 */
  text-decoration: none;
  transition: color 0.15s ease-in-out;
}

.nav-link:hover {
  color: #111827; /* text-gray-900 */
}
```

### 3-8. レスポンシブタイポグラフィクラス

```css
/* ユーティリティクラス */
@media (min-width: 640px) {
  .sm\\:text-responsive {
    font-size: 1.125rem; /* 18px */
  }
}

@media (min-width: 768px) {
  .md\\:text-responsive {
    font-size: 1.25rem; /* 20px */
  }
}

@media (min-width: 1024px) {
  .lg\\:text-responsive {
    font-size: 1.375rem; /* 22px */
  }
}

/* 記事タイトル用レスポンシブ */
.responsive-title {
  font-size: 1.875rem; /* 30px - mobile */
  line-height: normal !important;
  font-weight: 700;
}

@media (min-width: 768px) {
  .responsive-title {
    font-size: 3rem; /* 48px - desktop */
  }
}
```

### 3-9. 日本語特有の調整

```css
/* 日本語テキストの最適化 */
.japanese-optimized {
  font-feature-settings: 'palt' 1; /* プロポーショナルメトリクス */
  letter-spacing: 0.02em; /* 文字間隔調整 */
  word-break: break-word; /* 単語の改行 */
  overflow-wrap: break-word; /* 長い単語の改行 */
}

/* 英数字との混在テキスト */
.mixed-lang-text {
  font-variant-numeric: tabular-nums; /* 数字の幅統一 */
  font-feature-settings: 'kern' 1, 'liga' 1; /* カーニング・合字 */
}
```

## 4. カラーパレット（詳細コード定義）

### 4-1. 基本カラーパレット（Tailwind標準）

```css
/* styles/globals.css - 基本カラー定義 */
:root {
  /* グレースケール（stone系統） - メインカラー */
  --stone-50: #fafaf9;
  --stone-100: #f5f5f4;
  --stone-200: #e7e5e4;
  --stone-300: #d6d3d1;
  --stone-400: #a8a29e;
  --stone-500: #78716c;
  --stone-600: #57534e;
  --stone-700: #44403c;
  --stone-800: #292524;
  --stone-900: #1c1917;
  --stone-950: #0c0a09;

  /* グレー系統 - セカンダリカラー */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --gray-950: #030712;
}
```

### 4-2. ボタンカラースキーム

```css
/* ボタン専用カラー */
.btn-primary {
  background-color: var(--stone-900); /* bg-stone-900 */
  color: var(--stone-50); /* text-stone-50 */
  border: none;
}

.btn-primary:hover {
  background-color: var(--stone-800); /* hover:bg-stone-900/90 相当 */
}

.btn-secondary {
  background-color: var(--stone-100); /* bg-stone-100 */
  color: var(--stone-900); /* text-stone-900 */
  border: 1px solid var(--stone-200);
}

.btn-secondary:hover {
  background-color: var(--stone-200);
  border-color: var(--stone-300);
}

.btn-outline {
  background-color: transparent;
  color: var(--stone-700);
  border: 1px solid var(--stone-300);
}

.btn-outline:hover {
  background-color: var(--stone-50);
  border-color: var(--stone-400);
}
```

### 4-3. カテゴリ専用カラー（bg-category.css）

```css
/* styles/bg-category.css - カテゴリ別カラーシステム */

/* カテゴリカラー定義 */
:root {
  /* Tweet系 - 紫系 */
  --category-tweet-bg: #E0DFEA;
  --category-tweet-text: #5B21B6;
  --category-tweet-border: #C4B5FD;

  /* Book系 - 青系 */
  --category-book-bg: #C7E1E7;
  --category-book-text: #1E40AF;
  --category-book-border: #93C5FD;

  /* Bono系 - ピンク系 */
  --category-bono-bg: #F8E5EE;
  --category-bono-text: #BE185D;
  --category-bono-border: #F9A8D4;

  /* Output系 - グリーン系 */
  --category-output-bg: #E4EFE2;
  --category-output-text: #166534;
  --category-output-border: #86EFAC;
}

/* カテゴリ背景クラス */
.bg-tweet {
  background-color: var(--category-tweet-bg);
  color: var(--category-tweet-text);
  border: 1px solid var(--category-tweet-border);
}

.bg-book {
  background-color: var(--category-book-bg);
  color: var(--category-book-text);
  border: 1px solid var(--category-book-border);
}

.bg-bono {
  background-color: var(--category-bono-bg);
  color: var(--category-bono-text);
  border: 1px solid var(--category-bono-border);
}

.bg-output {
  background-color: var(--category-output-bg);
  color: var(--category-output-text);
  border: 1px solid var(--category-output-border);
}

/* ホバーエフェクト */
.bg-tweet:hover {
  background-color: #D8D6E3;
  transform: translateY(-1px);
}

.bg-book:hover {
  background-color: #BEDAE0;
  transform: translateY(-1px);
}

.bg-bono:hover {
  background-color: #F5DEE7;
  transform: translateY(-1px);
}

.bg-output:hover {
  background-color: #DCE7DA;
  transform: translateY(-1px);
}
```

### 4-4. ブログ専用カテゴリカラーマッピング

```typescript
// src/data/blog/categories.ts - カテゴリカラー設定
export const categoryColors = {
  // テクノロジー関連
  tech: {
    background: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    accent: 'bg-blue-500',
    cssVar: '--category-tech-bg: #eff6ff; --category-tech-text: #1e40af;'
  },

  // デザイン関連
  design: {
    background: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    accent: 'bg-purple-500',
    cssVar: '--category-design-bg: #faf5ff; --category-design-text: #6b21a8;'
  },

  // ビジネス関連
  business: {
    background: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
    accent: 'bg-green-500',
    cssVar: '--category-business-bg: #f0fdf4; --category-business-text: #166534;'
  },

  // ライフスタイル関連
  lifestyle: {
    background: 'bg-pink-50',
    text: 'text-pink-800',
    border: 'border-pink-200',
    accent: 'bg-pink-500',
    cssVar: '--category-lifestyle-bg: #fdf2f8; --category-lifestyle-text: #be185d;'
  },

  // ニュース関連
  news: {
    background: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    accent: 'bg-yellow-500',
    cssVar: '--category-news-bg: #fffbeb; --category-news-text: #92400e;'
  },

  // チュートリアル関連
  tutorial: {
    background: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    accent: 'bg-indigo-500',
    cssVar: '--category-tutorial-bg: #eef2ff; --category-tutorial-text: #3730a3;'
  }
}
```

### 4-5. 状態別カラーシステム

```css
/* 成功・エラー・警告・情報カラー */
:root {
  /* Success - 成功 */
  --color-success-50: #f0fdf4;
  --color-success-100: #dcfce7;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;

  /* Error - エラー */
  --color-error-50: #fef2f2;
  --color-error-100: #fee2e2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;

  /* Warning - 警告 */
  --color-warning-50: #fffbeb;
  --color-warning-100: #fef3c7;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;

  /* Info - 情報 */
  --color-info-50: #eff6ff;
  --color-info-100: #dbeafe;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;
  --color-info-700: #1d4ed8;
}

/* 状態別クラス */
.text-success { color: var(--color-success-600); }
.bg-success { background-color: var(--color-success-50); }
.border-success { border-color: var(--color-success-200); }

.text-error { color: var(--color-error-600); }
.bg-error { background-color: var(--color-error-50); }
.border-error { border-color: var(--color-error-200); }

.text-warning { color: var(--color-warning-600); }
.bg-warning { background-color: var(--color-warning-50); }
.border-warning { border-color: var(--color-warning-200); }

.text-info { color: var(--color-info-600); }
.bg-info { background-color: var(--color-info-50); }
.border-info { border-color: var(--color-info-200); }
```

### 4-6. テキストカラー階層

```css
/* テキストカラーの階層システム */
.text-primary {
  color: var(--gray-900); /* 最も重要なテキスト */
}

.text-secondary {
  color: var(--gray-700); /* 一般的なテキスト */
}

.text-tertiary {
  color: var(--gray-500); /* 補助的なテキスト */
}

.text-quaternary {
  color: var(--gray-400); /* 非常に軽いテキスト */
}

/* リンクカラー */
.text-link {
  color: var(--color-info-600);
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color 0.15s ease-in-out;
}

.text-link:hover {
  color: var(--color-info-700);
  text-decoration-color: currentColor;
}

/* アクセントテキスト */
.text-accent {
  color: var(--stone-900);
  font-weight: 600;
}
```

### 4-7. 背景カラーシステム

```css
/* 背景カラー階層 */
.bg-primary {
  background-color: #ffffff; /* 純白背景 */
}

.bg-secondary {
  background-color: var(--gray-50); /* 軽いグレー背景 */
}

.bg-tertiary {
  background-color: var(--gray-100); /* より濃いグレー背景 */
}

/* カード背景 */
.bg-card {
  background-color: #ffffff;
  border: 1px solid var(--gray-200);
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.bg-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

/* オーバーレイ背景 */
.bg-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.bg-overlay-light {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
}
```

### 4-8. ボーダーカラーシステム

```css
/* ボーダーカラー */
.border-primary {
  border-color: var(--gray-200);
}

.border-secondary {
  border-color: var(--gray-300);
}

.border-accent {
  border-color: var(--stone-300);
}

.border-focus {
  border-color: var(--color-info-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 区切り線 */
.divider {
  border-top: 1px solid var(--gray-200);
}

.divider-thick {
  border-top: 2px solid var(--gray-300);
}
```

### 4-9. Tailwind Config カスタムカラー

```javascript
// tailwind.config.js - カスタムカラー設定
module.exports = {
  theme: {
    extend: {
      colors: {
        // カテゴリ専用カラー
        category: {
          tweet: {
            50: '#f8f6ff',
            100: '#E0DFEA',
            500: '#8B5CF6',
            600: '#7C3AED',
            700: '#6D28D9'
          },
          book: {
            50: '#f0f9ff',
            100: '#C7E1E7',
            500: '#3B82F6',
            600: '#2563EB',
            700: '#1D4ED8'
          },
          bono: {
            50: '#fdf2f8',
            100: '#F8E5EE',
            500: '#EC4899',
            600: '#DB2777',
            700: '#BE185D'
          },
          output: {
            50: '#f0fdf4',
            100: '#E4EFE2',
            500: '#22C55E',
            600: '#16A34A',
            700: '#15803D'
          }
        },

        // ブランドカラー
        brand: {
          primary: '#1c1917', // stone-900
          secondary: '#78716c', // stone-500
          accent: '#3b82f6' // blue-500
        }
      }
    }
  }
}
```

## 2. コンポーネントデザイン（詳細コード定義）

### 2-1. ブログカードコンポーネント

```jsx
// BlogCard.tsx - ShadCN Cardベース
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User } from "lucide-react"
import { motion } from "framer-motion"

const BlogCard = ({ post, variant = "default" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="rounded-xl border bg-card text-card-foreground shadow hover:shadow-lg transition-shadow h-full flex flex-col">
        {/* サムネイル画像 */}
        <div className="aspect-[16/9] rounded-t-xl overflow-hidden">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>

        <CardHeader className="pb-3">
          {/* カテゴリバッジ */}
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {post.category}
            </Badge>
          </div>

          {/* タイトル */}
          <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
            {post.title}
          </CardTitle>

          {/* 説明文 */}
          <CardDescription className="text-base text-gray-500 line-clamp-2">
            {post.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 flex-grow">
          {/* タグ */}
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="pt-0 mt-auto">
          {/* メタ情報 */}
          <div className="flex items-center justify-between w-full text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.publishedAt).toLocaleDateString('ja-JP')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{post.readingTime}分</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
```

### 2-2. フィーチャーカード（大きなカード）

```jsx
// BlogFeaturedCard.tsx - 特別な記事用の大きなカード
const BlogFeaturedCard = ({ post }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="rounded-xl border bg-card text-card-foreground shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* 左側: 画像 */}
          <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>

          {/* 右側: コンテンツ */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              {/* フィーチャーバッジ */}
              <div className="flex items-center space-x-2 mb-3">
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  ⭐ 注目記事
                </Badge>
                <Badge variant="secondary">
                  {post.category}
                </Badge>
              </div>

              {/* タイトル */}
              <CardTitle className="text-2xl font-bold mb-3 leading-tight">
                {post.title}
              </CardTitle>

              {/* 説明文 */}
              <CardDescription className="text-lg text-gray-600 mb-4 line-clamp-3">
                {post.description}
              </CardDescription>

              {/* タグ */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* メタ情報 */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.publishedAt).toLocaleDateString('ja-JP')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime}分</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
```

### 2-3. ボタンコンポーネント（ShadCN Button）

```jsx
// Button設定 - components/ui/button.tsx
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-stone-900 text-stone-50 hover:bg-stone-900/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// 使用例
<Button variant="default" size="lg" className="pt-3 pb-2.5">
  続きを読む
</Button>
```

### 2-4. カテゴリフィルターコンポーネント

```jsx
// CategoryFilter.tsx
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-white rounded-lg shadow-sm border">
      {/* すべてのカテゴリボタン */}
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(null)}
        className="rounded-full"
      >
        すべて
      </Button>

      {/* カテゴリボタン */}
      {categories.map((category) => (
        <Button
          key={category.slug}
          variant={selectedCategory === category.slug ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.slug)}
          className="rounded-full"
        >
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${category.color}`}
          />
          {category.name}
        </Button>
      ))}
    </div>
  )
}
```

### 2-5. ページネーションコンポーネント

```jsx
// Pagination.tsx
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* 前のページボタン */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center space-x-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>前へ</span>
      </Button>

      {/* ページ番号ボタン */}
      <div className="flex space-x-1">
        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="w-10 h-10"
          >
            {page}
          </Button>
        ))}
      </div>

      {/* 次のページボタン */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center space-x-1"
      >
        <span>次へ</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
```

### 2-6. アイキャッチコンポーネント（記事詳細用）

```jsx
// BlogPostHeader.tsx - EyecatchEpisode風
const BlogPostHeader = ({ post }) => {
  return (
    <div className="text-center py-12 m-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-6"
      >
        {/* 絵文字アイコン（正方形） */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
          📝
        </div>

        {/* タイトル */}
        <h1 className="text-4xl md:text-5xl font-bold !leading-normal max-w-4xl">
          {post.title}
        </h1>

        {/* 説明文 */}
        <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
          {post.description}
        </p>

        {/* メタ情報 */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(post.publishedAt).toLocaleDateString('ja-JP')}</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime}分で読める</span>
          </div>
        </div>

        {/* カテゴリとタグ */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge className="text-sm px-4 py-2">
            {post.category}
          </Badge>
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-sm px-3 py-1">
              {tag}
            </Badge>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
```

### 2-7. バッジコンポーネント（カテゴリ用）

```jsx
// CategoryBadge.tsx - カテゴリ別カラー対応
const CategoryBadge = ({ category, variant = "default", size = "default" }) => {
  const categoryColors = {
    tech: "bg-blue-100 text-blue-800 border-blue-200",
    design: "bg-purple-100 text-purple-800 border-purple-200",
    business: "bg-green-100 text-green-800 border-green-200",
    lifestyle: "bg-pink-100 text-pink-800 border-pink-200",
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    default: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  return (
    <Badge
      className={`
        ${categoryColors[category.slug] || "bg-gray-100 text-gray-800 border-gray-200"}
        ${sizeClasses[size]}
        rounded-full border font-medium
      `}
    >
      {category.name}
    </Badge>
  )
}
```

## 5. アニメーション・インタラクション（詳細コード定義）

### 5-1. Framer Motion設定

```typescript
// src/utils/animations.ts - アニメーション定義
import { Variants } from "framer-motion"

// カード用アニメーション（SeriesCard.js風）
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
}

// リスト用アニメーション（段階的表示）
export const listContainerVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
}

// ページトランジション
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
}

// ヘッダー用アニメーション
export const headerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -50
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: 0.1
    }
  }
}
```

### 5-2. ホバーエフェクト（CSS）

```css
/* styles/globals.css - ホバーエフェクト */

/* カードホバーエフェクト */
.card-hover {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

/* ボタンホバーエフェクト */
.btn-hover {
  transition: all 0.15s ease-in-out;
  position: relative;
  overflow: hidden;
}

.btn-hover:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-hover:active {
  transform: translateY(0);
  transition-duration: 0.05s;
}

/* リンクホバーエフェクト */
.link-hover {
  position: relative;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
}

.link-hover::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.3s ease-out;
}

.link-hover:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

/* 画像ホバーエフェクト */
.image-hover {
  overflow: hidden;
  transition: all 0.3s ease-out;
}

.image-hover img {
  transition: transform 0.3s ease-out;
}

.image-hover:hover img {
  transform: scale(1.05);
}

/* タグ・バッジホバーエフェクト */
.badge-hover {
  transition: all 0.15s ease-in-out;
  cursor: pointer;
}

.badge-hover:hover {
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### 5-3. Tailwind Config アニメーション設定

```javascript
// tailwind.config.js - アニメーション設定
module.exports = {
  theme: {
    extend: {
      keyframes: {
        // アコーディオンアニメーション（Radix UI用）
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },

        // 左スクロールアニメーション（マルチロゴ等）
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },

        // フロートアニメーション（ふわふわ）
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },

        // フェードイン
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0px)' },
        },

        // スケールイン
        'scale-in': {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        }
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'scroll-left': 'scroll-left 120s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out'
      }
    }
  }
}
```

### 5-4. 実装例: アニメーション付きブログカード

```jsx
// BlogCard.tsx with animations
import { motion } from "framer-motion"
import { cardVariants } from "@/utils/animations"

const BlogCard = ({ post, index }) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ delay: index * 0.1 }}
      className="h-full cursor-pointer"
    >
      <div className="card-hover bg-white rounded-xl border shadow">
        <div className="image-hover aspect-[16/9] rounded-t-xl overflow-hidden">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6">
          <div className="badge-hover inline-block mb-2">
            <Badge variant="secondary">{post.category}</Badge>
          </div>
          <h3 className="link-hover text-lg font-semibold mb-2">
            {post.title}
          </h3>
        </div>
      </div>
    </motion.div>
  )
}
```

## 6. レスポンシブ対応（詳細コード定義）

### 6-1. ブレークポイント設定

```javascript
// tailwind.config.js - ブレークポイント設定
module.exports = {
  theme: {
    screens: {
      'xs': '475px',    // 小さなモバイル
      'sm': '640px',    // モバイル
      'md': '768px',    // タブレット
      'lg': '1024px',   // ラップトップ
      'xl': '1280px',   // デスクトップ
      '2xl': '1536px',  // 大画面
    },
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          'sm': '2rem',
          'lg': '4rem',
          'xl': '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
}
```

### 6-2. レスポンシブレイアウト

```css
/* styles/globals.css - レスポンシブレイアウト */

/* コンテナレスポンシブ */
.responsive-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .responsive-container {
    max-width: 640px;
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (min-width: 768px) {
  .responsive-container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .responsive-container {
    max-width: 1024px;
    padding-left: 4rem;
    padding-right: 4rem;
  }
}

@media (min-width: 1280px) {
  .responsive-container {
    max-width: 1400px; /* bonoSite-mainの設定 */
    padding-left: 5rem;
    padding-right: 5rem;
  }
}

/* グリッドレスポンシブ */
.responsive-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr; /* mobile: 1列 */
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr); /* tablet: 2列 */
    gap: 2rem;
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr); /* desktop: 3列 */
    gap: 2.5rem;
  }
}

/* フィーチャーグリッド */
.featured-responsive-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr; /* mobile: 1列 */
}

@media (min-width: 1024px) {
  .featured-responsive-grid {
    grid-template-columns: repeat(2, 1fr); /* desktop: 2列 */
    gap: 3rem;
  }
}
```

### 6-3. レスポンシブタイポグラフィ

```css
/* レスポンシブフォントサイズ */
.responsive-title {
  font-size: 1.875rem; /* 30px - mobile */
  line-height: 1.2;
  font-weight: 700;
}

@media (min-width: 640px) {
  .responsive-title {
    font-size: 2.25rem; /* 36px - tablet */
  }
}

@media (min-width: 768px) {
  .responsive-title {
    font-size: 3rem; /* 48px - desktop */
    line-height: normal !important; /* bonoSite-main の !leading-normal */
  }
}

/* レスポンシブサブタイトル */
.responsive-subtitle {
  font-size: 1rem; /* 16px - mobile */
  line-height: 1.5;
}

@media (min-width: 640px) {
  .responsive-subtitle {
    font-size: 1.125rem; /* 18px - tablet */
  }
}

@media (min-width: 768px) {
  .responsive-subtitle {
    font-size: 1.25rem; /* 20px - desktop */
  }
}

/* レスポンシブボディテキスト */
.responsive-body {
  font-size: 0.875rem; /* 14px - mobile */
  line-height: 1.6;
}

@media (min-width: 640px) {
  .responsive-body {
    font-size: 1rem; /* 16px - tablet+ */
  }
}
```

### 6-4. レスポンシブコンポーネント

```jsx
// ResponsiveCard.tsx
const ResponsiveCard = ({ post, featured = false }) => {
  return (
    <div className={`
      ${featured ? 'featured-responsive-grid' : 'responsive-grid'}
      w-full
    `}>
      <Card className={`
        w-full h-full flex flex-col
        ${featured ? 'md:grid md:grid-cols-2 md:gap-0' : ''}
      `}>
        {/* 画像セクション */}
        <div className={`
          ${featured ? 'aspect-[4/3] md:aspect-auto' : 'aspect-[16/9]'}
          overflow-hidden rounded-t-xl
          ${featured ? 'md:rounded-l-xl md:rounded-tr-none' : ''}
        `}>
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* コンテンツセクション */}
        <div className={`
          p-4 sm:p-6 flex flex-col justify-between flex-grow
          ${featured ? 'md:p-8' : ''}
        `}>
          <div>
            {/* タイトル */}
            <h3 className={`
              font-semibold mb-2 line-clamp-2
              ${featured ? 'text-xl sm:text-2xl md:text-3xl' : 'text-base sm:text-lg'}
            `}>
              {post.title}
            </h3>

            {/* 説明文 */}
            <p className={`
              text-gray-600 line-clamp-2 mb-4
              ${featured ? 'text-base sm:text-lg md:text-xl line-clamp-3' : 'text-sm sm:text-base'}
            `}>
              {post.description}
            </p>
          </div>

          {/* メタ情報 */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
            <span>{post.author}</span>
            <span>•</span>
            <span>{post.publishedAt}</span>
            <span>•</span>
            <span>{post.readingTime}分</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
```

### 6-5. レスポンシブナビゲーション

```jsx
// ResponsiveNavigation.tsx
const ResponsiveNavigation = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 py-4 sm:py-6 px-4 sm:px-6 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container flex items-center justify-between">
        {/* ロゴ */}
        <Link to="/" className="text-xl sm:text-2xl font-bold">
          Logo
        </Link>

        {/* デスクトップナビゲーション */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/blog" className="text-gray-700 hover:text-gray-900">
            ブログ
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-gray-900">
            About
          </Link>
        </nav>

        {/* モバイルメニューボタン */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="メニュー"
        >
          <div className="w-6 h-6 flex flex-col justify-center space-y-1">
            <span className={`w-full h-0.5 bg-gray-700 transition-transform ${isOpen ? 'rotate-45 translate-y-1' : ''}`} />
            <span className={`w-full h-0.5 bg-gray-700 transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`w-full h-0.5 bg-gray-700 transition-transform ${isOpen ? '-rotate-45 -translate-y-1' : ''}`} />
          </div>
        </button>
      </div>

      {/* モバイルメニュー */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white"
          >
            <nav className="container py-4 space-y-4">
              <Link
                to="/blog"
                className="block text-gray-700 hover:text-gray-900 text-lg"
                onClick={() => setIsOpen(false)}
              >
                ブログ
              </Link>
              <Link
                to="/about"
                className="block text-gray-700 hover:text-gray-900 text-lg"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
```

### 6-6. レスポンシブスペーシング

```css
/* レスポンシブマージン・パディング */
.responsive-spacing {
  padding: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .responsive-spacing {
    padding: 1.5rem;
    margin-bottom: 3rem;
  }
}

@media (min-width: 768px) {
  .responsive-spacing {
    padding: 2rem;
    margin-bottom: 4rem;
  }
}

@media (min-width: 1024px) {
  .responsive-spacing {
    padding: 3rem;
    margin-bottom: 5rem;
  }
}

/* 記事詳細ページのレスポンシブスペーシング（bonoSite-main の m-12） */
.article-spacing {
  margin: 2rem; /* mobile */
}

@media (min-width: 640px) {
  .article-spacing {
    margin: 2.5rem; /* sm */
  }
}

@media (min-width: 768px) {
  .article-spacing {
    margin: 3rem; /* md: 48px = 3rem（m-12相当） */
  }
}
```

### 6-7. レスポンシブユーティリティクラス

```css
/* 表示・非表示制御 */
.mobile-only {
  display: block;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }
}

.desktop-only {
  display: none;
}

@media (min-width: 768px) {
  .desktop-only {
    display: block;
  }
}

.tablet-up {
  display: none;
}

@media (min-width: 640px) {
  .tablet-up {
    display: block;
  }
}

/* レスポンシブフレックス */
.responsive-flex {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .responsive-flex {
    flex-direction: row;
    gap: 2rem;
  }
}

/* レスポンシブテキスト整列 */
.responsive-text-align {
  text-align: center;
}

@media (min-width: 768px) {
  .responsive-text-align {
    text-align: left;
  }
}
```

### 6-8. レスポンシブページネーション

```jsx
// ResponsivePagination.tsx
const ResponsivePagination = ({ currentPage, totalPages, onPageChange }) => {
  const isMobile = window.innerWidth < 768

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* 前のページ */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center space-x-1"
      >
        <ChevronLeft className="w-4 h-4" />
        {!isMobile && <span>前へ</span>}
      </Button>

      {/* ページ番号 */}
      <div className="flex space-x-1">
        {isMobile ? (
          // モバイル: 現在ページのみ表示
          <span className="px-3 py-2 text-sm">
            {currentPage} / {totalPages}
          </span>
        ) : (
          // デスクトップ: 全ページ表示
          Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="w-10 h-10"
            >
              {page}
            </Button>
          ))
        )}
      </div>

      {/* 次のページ */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center space-x-1"
      >
        {!isMobile && <span>次へ</span>}
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
```

### 6-9. タッチデバイス対応

```css
/* タッチデバイス用スタイル */
@media (hover: none) and (pointer: coarse) {
  /* タッチデバイスでのホバーエフェクト無効化 */
  .card-hover:hover {
    transform: none;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  }

  /* タッチ用のより大きなタップエリア */
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }

  /* スクロール最適化 */
  .touch-scroll {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
}

/* タッチジェスチャー対応 */
.swipeable {
  touch-action: pan-x;
}

.pinch-zoom {
  touch-action: pinch-zoom;
}
```

## 7. 具体的な参照ページマッピング

### 7-1. bonoSite-main から流用するページ対応表

```typescript
// 流用対応表
const pageMapping = {
  // ブログ一覧ページ
  '/blog': {
    source: 'bonoSite-main の / (トップページ)',
    elements: {
      layout: 'MainLayout',
      header: 'Header コンポーネント',
      heroSection: 'ヒーローセクション → ブログタイトルセクション',
      cardGrid: 'SeriesCard グリッド → BlogCard グリッド',
      pagination: 'ページネーション',
      footer: 'Footer コンポーネント'
    },
    modifications: {
      title: '"最新シリーズ" → "最新の記事"',
      cardContent: 'SeriesCard → BlogCard',
      filterSection: '新規追加: CategoryFilter'
    }
  },

  // ブログ詳細ページ
  '/blog/:slug': {
    source: 'bonoSite-main の /content/:slug (コンテンツ詳細)',
    elements: {
      layout: 'ContentDetailLayout',
      header: 'EyecatchEpisode → BlogPostHeader',
      contentArea: 'ContentDetail → BlogPostContent',
      metadata: 'メタ情報（日付・著者・読了時間）',
      relatedSection: '関連記事セクション（新規追加）'
    },
    modifications: {
      eyecatch: '絵文字アイコン + タイトル + メタ情報',
      content: 'prose クラスでスタイリング',
      sidebar: 'サイドバーなし（フルワイド）'
    }
  },

  // カテゴリページ（新規）
  '/blog/category/:category': {
    source: '新規作成（/blog ページをベース）',
    elements: {
      layout: '/blog ページと同じ',
      categoryHeader: '新規: カテゴリ名 + 説明',
      filterSection: 'CategoryFilter（選択済み状態）',
      cardGrid: 'BlogCard グリッド（フィルタ済み）'
    }
  }
}
```

### 7-2. コンポーネント流用マッピング

```typescript
// コンポーネント流用対応表
const componentMapping = {
  // レイアウト関連
  'Header.js': {
    source: 'bonoSite-main/components/layout/Header.js',
    usage: 'そのまま流用（ナビゲーションにブログリンク追加）',
    modifications: ['ナビゲーションメニューに "ブログ" 追加']
  },

  'Footer.js': {
    source: 'bonoSite-main/components/layout/Footer.js',
    usage: 'そのまま流用',
    modifications: ['変更なし']
  },

  // カード関連
  'SeriesCard.js': {
    source: 'bonoSite-main/components/Series/layout/SeriesCard.js',
    newComponent: 'BlogCard.tsx',
    modifications: [
      'aspectRatio を "52/80" から "16/9" に変更',
      'CardTitle: シリーズタイトル → 記事タイトル',
      'CardDescription: シリーズ説明 → 記事説明',
      'メタ情報: エピソード数 → 投稿日・著者・読了時間',
      'タグ表示を追加',
      'カテゴリバッジを追加'
    ]
  },

  // アイキャッチ関連
  'EyecatchEpisode.js': {
    source: 'bonoSite-main/components/content/EyecatchEpisode.js',
    newComponent: 'BlogPostHeader.tsx',
    modifications: [
      '絵文字アイコン（正方形）はそのまま',
      'センター配置、m-12 余白はそのまま',
      'タイトル: エピソード名 → 記事タイトル',
      '説明文: エピソード説明 → 記事説明',
      'メタ情報: 投稿日・著者・読了時間を追加',
      'タグ・カテゴリ表示を追加'
    ]
  },

  // UI コンポーネント
  'Card系': {
    source: 'bonoSite-main/components/common/ui/card.jsx',
    usage: 'ShadCN Card をそのまま流用',
    style: 'rounded-xl border bg-card text-card-foreground shadow'
  },

  'Button系': {
    source: 'bonoSite-main/components/common/ui/button.jsx',
    usage: 'ShadCN Button をそのまま流用',
    variants: ['default: bg-stone-900 text-stone-50', 'outline', 'secondary']
  }
}
```

### 7-3. スタイリング流用マッピング

```typescript
// スタイル流用対応表
const styleMapping = {
  // 背景
  'bg-Top': {
    source: 'bonoSite-main/styles/globals.css',
    usage: 'url(\'/top-image.svg\') をそのまま使用',
    application: '全ページ背景'
  },

  // コンテナ設定
  'container': {
    source: 'bonoSite-main/tailwind.config.js',
    settings: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' }
    },
    usage: '全ページで統一'
  },

  // フォント設定
  'fontFamily': {
    source: 'bonoSite-main/styles/globals.css',
    primary: 'Hind, Noto Sans JP, sans-serif',
    weight: 500,
    usage: 'body フォントはそのまま流用'
  },

  // カラーシステム
  'colors': {
    source: 'bonoSite-main/styles/bg-category.css',
    categories: {
      'tweet': '#E0DFEA',
      'book': '#C7E1E7',
      'bono': '#F8E5EE',
      'output': '#E4EFE2'
    },
    usage: 'カテゴリバッジで流用'
  }
}
```

### 7-4. ページ構造対応表

```jsx
// /blog ページ構造（/ トップページベース）
const BlogIndexStructure = `
<div className="min-h-screen bg-Top">
  {/* Header: bonoSite-main Header.js そのまま */}
  <Header className="fixed py-6 px-6 z-50" />

  <main className="container pt-24">
    {/* Hero Section → Blog Title Section */}
    <div className="text-center py-12">
      <h1 className="text-4xl md:text-5xl font-bold !leading-normal mb-4">
        ブログ
      </h1>
      <p className="text-lg text-gray-600">
        最新の記事をお届けします
      </p>
    </div>

    <div className="w-11/12 md:w-10/12 mx-auto">
      {/* 新規追加: Category Filter */}
      <CategoryFilter />

      {/* SeriesCard Grid → BlogCard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* SeriesCard → BlogCard */}
        <BlogCard />
      </div>

      {/* Pagination: 既存のものを流用 */}
      <Pagination />
    </div>
  </main>

  {/* Footer: bonoSite-main Footer.js そのまま */}
  <Footer />
</div>
`;

// /blog/:slug ページ構造（/content/:slug ベース）
const BlogPostStructure = `
<div className="min-h-screen bg-Top">
  {/* Header: 同じ */}
  <Header className="fixed py-6 px-6 z-50" />

  <main className="container pt-24">
    {/* EyecatchEpisode → BlogPostHeader */}
    <BlogPostHeader className="text-center py-12 m-12" />

    <div className="w-11/12 md:w-10/12 mx-auto">
      {/* ContentDetail → BlogPostContent */}
      <article className="prose prose-lg max-w-none">
        <BlogPostContent />
      </article>

      {/* 新規追加: Related Posts */}
      <RelatedPosts className="mt-16 pt-8 border-t" />
    </div>
  </main>

  <Footer />
</div>
`;
```

### 7-5. Framer Motion アニメーション流用

```typescript
// SeriesCard.js のアニメーション → BlogCard.tsx
const animationMapping = {
  'SeriesCard variants': {
    source: 'bonoSite-main/components/Series/layout/SeriesCard.js',
    pattern: 'リストのフェード&スライド',
    implementation: `
      // SeriesCard.js パターンを踏襲
      const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: "easeOut" }
        },
        hover: {
          y: -5,
          transition: { duration: 0.2 }
        }
      }

      // staggerChildren で段階的表示
      const listVariants = {
        visible: {
          transition: { staggerChildren: 0.1 }
        }
      }
    `
  }
}
```

### 7-6. 実装優先順位

```typescript
const implementationPriority = {
  'Phase 1 - 基本流用': [
    '1. Header.js をそのまま使用',
    '2. Footer.js をそのまま使用',
    '3. ShadCN UI コンポーネント（Card, Button）流用',
    '4. container 設定流用',
    '5. bg-Top 背景設定流用'
  ],

  'Phase 2 - カード変換': [
    '6. SeriesCard → BlogCard 変換',
    '7. aspectRatio 変更',
    '8. メタ情報変更（日付・著者・読了時間）',
    '9. カテゴリバッジ追加'
  ],

  'Phase 3 - ページ構造': [
    '10. / トップページ → /blog 変換',
    '11. /content/:slug → /blog/:slug 変換',
    '12. EyecatchEpisode → BlogPostHeader 変換'
  ],

  'Phase 4 - 新規機能': [
    '13. CategoryFilter 新規作成',
    '14. /blog/category/:category 新規作成',
    '15. RelatedPosts 新規作成'
  ]
}
```

## 8. Tailwind 設定のポイント（tailwind.config.js）

    •	darkMode: ["class"]（テーマ切替は class 制御）
    •	extend.keyframes:
    •	accordion-down / accordion-up（Radix想定）
    •	scrollLeft（マルチロゴ等の無限スクロール）
    •	float（ふわっと上下）
    •	extend.animation: scrollLeft 120s linear infinite, float 4s ease-in-out infinite
    •	extend.fontFamily: dongle, noto-sans（CSS var で差し込み）
    •	extend.fontSize.xxs = 10px

## 9. ブログ用マークダウンスタイル（完全版実装）

**サマリー**: ブログ用マークダウンスタイルの完全版を、remベースのレスポンシブ対応込みでコピペ可能な形式で提供します。

### 9-1. globals.css または layout.css

```css
/* レスポンシブフォントサイズ設定 */
:root {
  /* デスクトップ: 16px ベース */
  font-size: 16px;
}

@media (max-width: 768px) {
  :root {
    /* タブレット: 15px ベース */
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  :root {
    /* スマホ: 14px ベース */
    font-size: 14px;
  }
}

/* ベーススタイル */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}
```

### 9-2. components/blog/BlogContent.tsx

```tsx
import styles from './BlogContent.module.css'
import { ReactNode } from 'react'

interface BlogContentProps {
  children: ReactNode
  className?: string
}

export function BlogContent({ children, className = '' }: BlogContentProps) {
  return (
    <div className={`${styles.content} ${className}`}>
      {children}
    </div>
  )
}

export default BlogContent
```

### 9-3. components/blog/BlogContent.module.css

```css
.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  line-height: 1.7;
  color: #374151;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ヘッディング */
.content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 3rem 0 1.5rem 0;
  color: #1f2937;
  border-bottom: 3px solid #e5e7eb;
  padding-bottom: 0.5rem;
  line-height: 1.2;
}

.content h2 {
  font-size: 2rem;
  font-weight: 600;
  margin: 2.5rem 0 1rem 0;
  color: #1f2937;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 0.25rem;
  line-height: 1.3;
}

.content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 2rem 0 0.75rem 0;
  color: #374151;
  line-height: 1.4;
}

.content h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.5rem 0 0.5rem 0;
  color: #374151;
  line-height: 1.4;
}

.content h5 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 1.25rem 0 0.5rem 0;
  color: #4b5563;
  line-height: 1.5;
}

.content h6 {
  font-size: 1rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  color: #4b5563;
  line-height: 1.5;
}

/* パラグラフ */
.content p {
  font-size: 1rem;
  margin: 1rem 0;
  text-align: justify;
  line-height: 1.7;
}

/* リスト */
.content ul {
  font-size: 1rem;
  margin: 1rem 0;
  padding-left: 1.5rem;
  list-style-type: disc;
}

.content ol {
  font-size: 1rem;
  margin: 1rem 0;
  padding-left: 1.5rem;
  list-style-type: decimal;
}

.content li {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.content li > ul,
.content li > ol {
  margin: 0.25rem 0;
}

/* ネストしたリスト */
.content ul ul {
  list-style-type: circle;
  margin-top: 0.25rem;
}

.content ul ul ul {
  list-style-type: square;
}

/* チェックリスト */
.content input[type="checkbox"] {
  margin-right: 0.5rem;
  cursor: pointer;
}

/* コードブロック */
.content pre {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 1.5rem 0;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.content pre code {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
  color: inherit;
}

/* インラインコード */
.content code {
  background: #f1f5f9;
  color: #dc2626;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
}

/* 引用 */
.content blockquote {
  border-left: 0.25rem solid #3b82f6;
  background: #f8fafc;
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  font-style: italic;
  font-size: 1rem;
  color: #4b5563;
  border-radius: 0 0.375rem 0.375rem 0;
}

.content blockquote p {
  margin: 0.5rem 0;
}

.content blockquote > *:first-child {
  margin-top: 0;
}

.content blockquote > *:last-child {
  margin-bottom: 0;
}

/* テーブル */
.content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.9rem;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.content th,
.content td {
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  text-align: left;
}

.content th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.content tbody tr:nth-child(even) {
  background: #f9fafb;
}

.content tbody tr:hover {
  background: #f3f4f6;
}

/* 水平線 */
.content hr {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 3rem 0;
}

/* リンク */
.content a {
  color: #3b82f6;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.content a:hover {
  color: #1d4ed8;
  border-bottom-color: #3b82f6;
}

.content a:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.125rem;
}

/* 画像 */
.content img {
  max-width: 100%;
  height: auto;
  margin: 1.5rem 0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 強調 */
.content strong {
  font-weight: 600;
  color: #1f2937;
}

.content em {
  font-style: italic;
  color: #4b5563;
}

/* 削除線 */
.content del {
  text-decoration: line-through;
  color: #6b7280;
}

/* マーク（ハイライト） */
.content mark {
  background: #fef3c7;
  padding: 0.125rem 0.25rem;
  border-radius: 0.125rem;
}

/* 上付き・下付き文字 */
.content sup {
  font-size: 0.75rem;
  vertical-align: super;
}

.content sub {
  font-size: 0.75rem;
  vertical-align: sub;
}

/* 定義リスト */
.content dl {
  margin: 1rem 0;
}

.content dt {
  font-weight: 600;
  color: #1f2937;
  margin: 1rem 0 0.25rem 0;
}

.content dd {
  margin: 0 0 0.5rem 1rem;
  color: #4b5563;
}

/* 詳細・要約 */
.content details {
  margin: 1rem 0;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

.content summary {
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.25rem;
  margin: -0.5rem -0.5rem 0.5rem -0.5rem;
}

.content summary:hover {
  background: #f3f4f6;
}

/* フッターとナビゲーション */
.content nav ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 1rem;
}

.content nav li {
  margin: 0;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .content {
    padding: 1.5rem 1rem;
  }

  .content h1 {
    margin: 2rem 0 1rem 0;
  }

  .content h2 {
    margin: 1.5rem 0 0.75rem 0;
  }

  .content pre {
    padding: 1rem;
    margin: 1rem -1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .content table {
    font-size: 0.8rem;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .content th,
  .content td {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 1rem;
  }

  .content blockquote {
    margin: 1rem -1rem;
    padding: 1rem;
    border-radius: 0;
  }

  .content img {
    margin: 1rem -1rem;
    border-radius: 0;
  }
}

/* プリント対応 */
@media print {
  .content {
    max-width: none;
    padding: 0;
    font-size: 12pt;
    line-height: 1.5;
  }

  .content h1 {
    font-size: 18pt;
    page-break-after: avoid;
  }

  .content h2 {
    font-size: 16pt;
    page-break-after: avoid;
  }

  .content h3 {
    font-size: 14pt;
    page-break-after: avoid;
  }

  .content pre {
    page-break-inside: avoid;
    border: 1px solid #000;
  }

  .content a {
    color: #000;
    text-decoration: underline;
  }
}
```

### 9-4. 使用例

```tsx
// pages/blog/[slug].tsx または app/blog/[slug]/page.tsx
import BlogContent from '@/components/blog/BlogContent'

export default function BlogPost() {
  const markdownContent = `
# ブログタイトル

これは**太字**で、これは*斜体*です。

## セクション見出し

- リスト項目1
- リスト項目2
  - ネストしたリスト

\`\`\`javascript
const hello = 'world';
console.log(hello);
\`\`\`

> これは引用文です。
> 複数行にわたります。

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| データ1 | データ2 | データ3 |
  `;

  return (
    <BlogContent>
      {/* MarkdownやMDXでレンダリングしたコンテンツ */}
      <div dangerouslySetInnerHTML={{ __html: markdownContent }} />
    </BlogContent>
  )
}
```

これで完全なマークダウンスタイルシステムが構築できます。
