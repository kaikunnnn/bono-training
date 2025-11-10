# Blog ページ レイアウト実装仕様書（デスクトップ版）

## 概要

BONO blog のメインページ（`/blog`）のデスクトップ版レイアウトの完全な実装仕様です。
この仕様書に基づいて、AI エージェントがそのまま実装できるようにすべての必要情報をまとめています。

---

## Figma デザイン情報

- **Figma URL**: https://www.figma.com/design/ee9rQHm0c0QLHpMgCqZpRe/BONO-blog-2025-data?node-id=1-3
- **Node ID**: `1:3`
- **ページ名**: `blog_page`
- **デザインサイズ**: 1920×1811px

---

## 全体構造

### ページ構成（上から順に）

```
blog_page (1920×1811px)
├── background_gradation_color (背景レイヤー - 固定)
├── header (ヘッダー - 固定位置)
├── sun image (装飾 - 右下固定)
└── Main (メインコンテンツ)
    ├── herosection (ヒーローセクション)
    ├── blog_list (ブログ記事一覧)
    └── Footer (フッター)
```

---

## レイアウト詳細

### 1. 背景グラデーション（background_gradation_color）

#### 配置

- **位置**: ページ全体の背景として固定
- **サイズ**: 1920×1811px
- **z-index**: 最背面
- **透明度**: 100%

#### 実装方法

```typescript
// 既存の BackgroundGradation コンポーネントを使用
import { BackgroundGradation } from "@/components/common/BackgroundGradation";

// ページ全体の背景として配置
<div className="fixed inset-0 -z-10 w-[1920px] h-[1811px] overflow-hidden">
  <BackgroundGradation />
</div>;
```

#### 注意事項

- `/blog` 全体に適用する背景グラデーション
- スクロールしても固定表示（`position: fixed`）
- 他のコンテンツの下に配置（`z-index: -10`）

---

### 2. ヘッダー（header）

#### 配置

- **位置**: 左上固定（`top: 0, left: 0`）
- **サイズ**: 1920×74.07px
- **パディング**: 24px（上下左右）
- **z-index**: 最前面

#### 構成要素

- **BONO ロゴ**
  - サイズ: 88×26.07px
  - 位置: 左から 24px、上から 24px
  - アセット: `/assets/d6495cc76015bd725cb662d469f2c31129d53e32.svg`

#### 実装コード

```typescript
<header className="fixed top-0 left-0 w-[1920px] z-50 p-6">
  <div className="w-[112px]">
    <a href="/" className="block w-[88px] h-[26.07px]">
      <img
        src="/assets/d6495cc76015bd725cb662d469f2c31129d53e32.svg"
        alt="BONO"
        className="w-full h-full"
      />
    </a>
  </div>
</header>
```

---

### 3. 太陽の装飾（sun image）

#### 配置

- **位置**: 右下固定
  - `left: 1724px`
  - `bottom: 268px`
- **サイズ**: 260×260px
- **透明度**: 100%

#### 実装コード

```typescript
<div className="fixed left-[1724px] bottom-[268px] w-[260px] h-[260px] z-0">
  <img
    src="/assets/82c8bc0c7e4edf6d630d1c217268bbafd904b609.svg"
    alt=""
    className="w-full h-full"
    aria-hidden="true"
  />
</div>
```

#### 注意事項

- 装飾的な要素のため `aria-hidden="true"` を設定
- スクロールに応じて位置が変わる（`position: absolute` または `fixed`）

---

### 4. メインコンテンツ（Main）

#### 全体構成

- **幅**: 1920px（中央配置）
- **構造**: 縦方向の flex コンテナ
- **アイテム配置**: 中央揃え

#### 4-1. ヒーローセクション（herosection）

##### 配置

- **サイズ**: 1920×461px
- **パディング**:
  - 上: 80px（ヘッダー分のスペース確保）
  - 下: 144px
  - 左右: 0px

##### 構成要素

###### "HOPE." ロゴ

- **サイズ**: 344×89px
- **位置**: 中央配置
- **アセット**: `/assets/bbde0d9860756a76727bcbe17eabccd0d60e09f6.svg`

###### サブタイトル

- **テキスト**: "BONO をつくる 30 代在宅独身男性のクラフト日誌"
- **フォント**: Noto Sans JP Medium
- **サイズ**: 14px
- **行高**: 20px
- **色**: #9CA3AF（Gray Chateau）
- **letter-spacing**: 0.7px
- **配置**: 中央揃え

##### 実装コード

```typescript
// 既存の Herosection コンポーネントを使用
import { Herosection } from "@/components/blog/Herosection";

<section className="w-[1920px] pt-[80px] pb-0 flex items-start justify-center">
  <Herosection />
</section>;
```

##### 間隔

- ロゴとサブタイトルの間: 32px

---

#### 4-2. ブログ記事一覧（blog_list）

##### 配置

- **幅**: 1120px（中央配置）
- **高さ**: 自動（コンテンツに応じて）
- **位置**: ヒーローセクションの直下

##### 構成要素

###### 見出し（heading）

- **高さ**: 64px
- **パディング**: 左右 10px、上下 16px
- **テキスト**: "All Episodes"
- **フォント**: Hind Bold
- **サイズ**: 24px
- **行高**: 48px
- **色**: #000000（Black）
- **letter-spacing**: 0.6px

###### リスト（List）

- **間隔**: 各アイテム間 12px
- **アイテム数**: 6 件表示（初期表示）

##### ブログカードアイテム（Item-link）

###### サイズ

- **幅**: 1120px
- **最小高さ**: 152px（コンテンツに応じて可変）

###### スタイル

- **背景色**: #FFFFFF（White）
- **角丸**: 16px
- **影**: `0px 1px 2px 0px rgba(0,0,0,0.05)`
- **パディング**:
  - 左: 12px
  - 右: 24px
  - 上下: 12px

###### 内部構造（Container）

- **レイアウト**: 横並び（flex row）
- **間隔**: 32px
- **配置**: アイテム中央揃え

###### サムネイル（thumbnail - 16:9）

- **サイズ**: 240×135px
- **背景色**: #D8E7EF（淡いブルー）
- **角丸**: 12px
- **パディング**: 上下 40px
- **内容**: 絵文字画像（64×64px）中央配置

###### テキストコンテナ

- **幅**: 701.34px
- **レイアウト**: 縦並び（flex column）
- **間隔**: 8px

**タイトル（Heading 4）**

- **フォント**: Noto Sans JP Bold
- **サイズ**: 16px
- **行高**: 24px
- **色**: #0F172A（Azure 11）
- **テキスト**: "アンチ合理性。熱を帯びるつくり手を育めるか。BONO の 2023 年"

**メタ情報コンテナ**

- **レイアウト**: 横並び
- **間隔**: 12.01px

**カテゴリ（category）**

- **フォント**: Hind Medium
- **サイズ**: 12px
- **行高**: 16px
- **色**: #9CA3AF（Azure 65）
- **テキスト**: "BONO"

**更新日（updated_date）**

- **フォント**: Hind Medium / Noto Sans JP Medium
- **サイズ**: 12px
- **行高**: 16px
- **色**: #9CA3AF（Azure 65）
- **テキスト**: "2023 年 08 月 25 日"

##### 実装コード

```typescript
// 既存の BlogCard コンポーネントを使用
import { BlogCard } from "@/components/blog/BlogCard";

<section className="w-[1120px]">
  {/* 見出し */}
  <div className="h-16 px-2.5 py-4 mb-0">
    <h2 className="font-['Hind'] font-bold text-2xl leading-[48px] tracking-[0.6px] text-black">
      All Episodes
    </h2>
  </div>

  {/* ブログカード一覧 */}
  <div className="flex flex-col gap-3 w-full">
    {blogPosts.map((post) => (
      <BlogCard
        key={post.id}
        title={post.title}
        category={post.category}
        date={post.date}
        thumbnail={post.thumbnail}
        className="bg-white rounded-2xl shadow-sm min-h-[152px] pl-3 pr-6 py-3"
      />
    ))}
  </div>
</section>;
```

---

#### 4-3. フッター（Footer）

##### 配置

- **幅**: 1920px（全幅）
- **パディング**:
  - 上: 160px
  - 下: 64px
  - 左右: 0px
- **間隔**: 内部要素間 8px

##### 構成要素

###### コピーライト

- **位置**: 中央揃え
- **フォント**: Hind Medium
- **サイズ**: 14px
- **行高**: 20px
- **色**: #6B7280（Grey 46）
- **テキスト**: "Copyright©︎kaikun"

###### リンクリスト

- **レイアウト**: 横並び（中央揃え）
- **間隔**: 12px

**リンク項目**

1. MIT License
2. Privacy Policy
3. ログイン
4. 新規登録

**スタイル**

- **フォント**: Hind Medium / Noto Sans JP Medium
- **サイズ**: 14px
- **行高**: 20px
- **色**: #6B7280（Grey 46）

##### 実装コード

```typescript
<footer className="w-[1920px] pt-[160px] pb-16 flex flex-col gap-2">
  {/* コピーライト */}
  <div className="w-full text-center">
    <p className="font-['Hind'] font-medium text-sm leading-5 text-[#6B7280]">
      Copyright©︎kaikun
    </p>
  </div>

  {/* リンクリスト */}
  <div className="w-full flex items-center justify-center gap-3">
    <a
      href="/license"
      className="font-['Hind'] font-medium text-sm leading-5 text-[#6B7280]"
    >
      MIT License
    </a>
    <a
      href="/privacy"
      className="font-['Hind'] font-medium text-sm leading-5 text-[#6B7280]"
    >
      Privacy Policy
    </a>
    <a
      href="/login"
      className="font-['Noto_Sans_JP'] font-medium text-sm leading-5 text-[#6B7280]"
    >
      ログイン
    </a>
    <a
      href="/signup"
      className="font-['Noto_Sans_JP'] font-medium text-sm leading-5 text-[#6B7280]"
    >
      新規登録
    </a>
  </div>
</footer>
```

---

## デザイントークン

### カラーパレット

```typescript
const colors = {
  // Primary Colors
  white: "#FFFFFF",
  black: "#000000",

  // Gray Scale
  grayChateauL: "#9CA3AF", // Azure 65, Grey 46
  paleSky: "#6B7280",
  ebony: "#151834",
  azureDark: "#0F172A", // Azure 11

  // Accent Colors
  blue75: "#8388FA",
  blue38: "#1135B3",
  blue14: "#151834",
  orange75: "#FAA38300", // 透明度 0%
  orange74: "#FC9F7C",
  red68: "#EE6C6C",

  // Background Colors
  thumbnailBg: "#D8E7EF", // サムネイル背景
};
```

### タイポグラフィ

```typescript
const typography = {
  // Heading
  heading1: {
    family: "Hind",
    weight: 700,
    size: 24,
    lineHeight: 48,
    letterSpacing: 0.6,
  },

  // Heading 4 (Semantic)
  heading4: {
    family: "Noto Sans JP",
    weight: 700,
    size: 16,
    lineHeight: 24,
  },

  // Body
  bodyMedium: {
    family: "Hind",
    weight: 500,
    size: 14,
    lineHeight: 20,
  },

  // Small Text
  small: {
    family: "Hind",
    weight: 500,
    size: 12,
    lineHeight: 16,
  },

  // Link (Semantic)
  link: {
    family: "Noto Sans JP",
    weight: 500,
    size: 14,
    lineHeight: 20,
  },

  // Subtitle
  subtitle: {
    family: "Noto Sans JP",
    weight: 500,
    size: 14,
    lineHeight: 20,
    letterSpacing: 0.7,
  },
};
```

### スペーシング

```typescript
const spacing = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 32,
  xl: 64,
  xxl: 96,
  xxxl: 144,
  xxxxl: 160,
};
```

### サイズ

```typescript
const sizes = {
  // Layout
  pageWidth: 1920,
  contentWidth: 1120,

  // Components
  headerHeight: 74.07,
  heroHeight: 461,
  blogCardMinHeight: 152,
  thumbnailWidth: 240,
  thumbnailHeight: 135,
  emojiSize: 64,
  sunSize: 260,
  logoWidth: 88,
  logoHeight: 26.07,
  hopeLogoWidth: 344,
  hopeLogoHeight: 89,
};
```

### その他

```typescript
const effects = {
  // Border Radius
  borderRadius: {
    sm: 12,
    md: 16,
  },

  // Shadow
  cardShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",

  // Opacity
  full: 100,
};
```

---

## レスポンシブ対応

### ブレークポイント設定

```typescript
const breakpoints = {
  mobile: "375px",
  mobileMax: "767px",
  tablet: "768px",
  tabletMax: "1919px",
  desktop: "1920px",
};
```

### レイアウト調整戦略

#### 1. コンテナ幅の比率計算

デスクトップデザインの比率を維持しながら、画面サイズに応じて調整します。

**デスクトップ基準値（1920px）**

- ページ全体: 1920px
- コンテンツ幅: 1120px
- 比率: 1120 / 1920 = **58.33%**

**レスポンシブ適用**

```typescript
// コンテンツ幅の計算
const contentWidth = {
  desktop: "min(1120px, 100%)", // 最大1120px
  tablet: "min(1120px, 90%)", // 最大1120px、または画面幅の90%
  mobile: "min(1120px, 95%)", // 最大1120px、または画面幅の95%
};
```

#### 2. ヘッダー（header）

```typescript
// レスポンシブヘッダー
<header
  className="
  fixed top-0 left-0 right-0 z-50
  w-full max-w-[1920px] mx-auto
  p-6 md:p-6 sm:p-4
"
>
  <div className="w-[112px]">
    <a href="/" className="block w-[88px] h-[26.07px]">
      <img src="/assets/logo.svg" alt="BONO" />
    </a>
  </div>
</header>
```

**パディング調整**

- Desktop (1920px+): 24px
- Tablet (768px-1919px): 24px
- Mobile (375px-767px): 16px

#### 3. ヒーローセクション（herosection）

```typescript
<section
  className="
  w-full max-w-[1920px] mx-auto
  pt-[80px] md:pt-[60px] sm:pt-[48px]
  pb-0
  px-6 md:px-6 sm:px-4
"
>
  <Herosection />
</section>
```

**パディング調整**

- Desktop: 上 80px
- Tablet: 上 60px
- Mobile: 上 48px

**"HOPE." ロゴサイズ**

```css
/* Desktop */
width: 344px;
height: 89px;

/* Tablet */
width: 280px; /* 約81% */
height: 72.5px;

/* Mobile */
width: 200px; /* 約58% */
height: 51.7px;
```

#### 4. ブログ記事一覧（blog_list）

```typescript
<section
  className="
  w-full max-w-[1120px] mx-auto
  px-6 md:px-6 sm:px-4
"
>
  {/* 見出し */}
  <div className="h-16 px-2.5 py-4 mb-0">
    <h2
      className="
      font-['Hind'] font-bold
      text-2xl md:text-xl sm:text-lg
      leading-[48px] md:leading-[40px] sm:leading-[32px]
      tracking-[0.6px]
      text-black
    "
    >
      All Episodes
    </h2>
  </div>

  {/* ブログカード一覧 */}
  <div className="flex flex-col gap-3 w-full">
    {blogPosts.map((post) => (
      <BlogCard key={post.id} {...post} />
    ))}
  </div>
</section>
```

**見出しサイズ調整**

- Desktop: 24px (line-height: 48px)
- Tablet: 20px (line-height: 40px)
- Mobile: 18px (line-height: 32px)

#### 5. ブログカード（Item-link）内部レイアウト

**Desktop（1920px+）**

```typescript
<div
  className="
  bg-white rounded-2xl shadow-sm
  min-h-[152px]
  pl-3 pr-6 py-3
  flex flex-row items-center gap-8
"
>
  {/* サムネイル: 240×135px */}
  <div className="w-[240px] h-[135px] flex-shrink-0">
    <img src={thumbnail} />
  </div>

  {/* テキスト: 701.34px */}
  <div className="flex-1 flex flex-col gap-2">
    <h3>{title}</h3>
    <div className="flex gap-3">
      <span>{category}</span>
      <span>{date}</span>
    </div>
  </div>
</div>
```

**Tablet（768px-1919px）**

```typescript
<div
  className="
  bg-white rounded-2xl shadow-sm
  min-h-[140px]
  pl-3 pr-6 py-3
  flex flex-row items-center gap-6
"
>
  {/* サムネイル: 200×112.5px（約83%） */}
  <div className="w-[200px] h-[112.5px] flex-shrink-0">
    <img src={thumbnail} />
  </div>

  {/* テキスト: flex-1 */}
  <div className="flex-1 flex flex-col gap-2">
    <h3 className="text-[15px] leading-[22px]">{title}</h3>
    <div className="flex gap-3 text-[11px]">
      <span>{category}</span>
      <span>{date}</span>
    </div>
  </div>
</div>
```

**Mobile（375px-767px）**

```typescript
<div
  className="
  bg-white rounded-2xl shadow-sm
  min-h-auto
  p-3
  flex flex-col gap-3
"
>
  {/* サムネイル: 100%幅、16:9比率 */}
  <div className="w-full aspect-[16/9] rounded-lg overflow-hidden">
    <img src={thumbnail} className="w-full h-full object-cover" />
  </div>

  {/* テキスト */}
  <div className="flex flex-col gap-2">
    <h3 className="text-[14px] leading-[20px] font-bold">{title}</h3>
    <div className="flex gap-2 text-[10px]">
      <span>{category}</span>
      <span>{date}</span>
    </div>
  </div>
</div>
```

#### 6. フッター（Footer）

```typescript
<footer
  className="
  w-full max-w-[1920px] mx-auto
  pt-[160px] md:pt-[120px] sm:pt-[80px]
  pb-16 md:pb-12 sm:pb-8
  px-6 md:px-6 sm:px-4
  flex flex-col gap-2
"
>
  {/* コピーライト */}
  <div className="w-full text-center">
    <p className="font-['Hind'] font-medium text-sm leading-5 text-[#6B7280]">
      Copyright©︎kaikun
    </p>
  </div>

  {/* リンクリスト */}
  <div
    className="
    w-full flex items-center justify-center
    gap-3 md:gap-3 sm:gap-2
    flex-wrap
  "
  >
    <a href="/license" className="text-sm sm:text-xs">
      MIT License
    </a>
    <a href="/privacy" className="text-sm sm:text-xs">
      Privacy Policy
    </a>
    <a href="/login" className="text-sm sm:text-xs">
      ログイン
    </a>
    <a href="/signup" className="text-sm sm:text-xs">
      新規登録
    </a>
  </div>
</footer>
```

**パディング調整**

- Desktop: 上 160px、下 64px
- Tablet: 上 120px、下 48px
- Mobile: 上 80px、下 32px

#### 7. 太陽の装飾（sun image）

**固定サイズ（全デバイス共通）**

```typescript
<div
  className="
  fixed
  right-[5%] md:right-[3%] sm:right-[2%]
  bottom-[268px] md:bottom-[200px] sm:bottom-[150px]
  w-[260px] h-[260px]
  z-0
"
>
  <img src="/assets/sun.svg" alt="" aria-hidden="true" />
</div>
```

**位置調整**

- Desktop: right: 196px (1920 - 1724 = 196)、bottom: 268px
- Tablet: right: 3%、bottom: 200px
- Mobile: right: 2%、bottom: 150px

#### 8. 背景グラデーション

**全画面固定**

```typescript
<div className="fixed inset-0 -z-10 w-full h-full overflow-hidden">
  <BackgroundGradation className="w-full h-full" />
</div>
```

### Tailwind CSS ブレークポイント設定

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      sm: "375px", // Mobile
      md: "768px", // Tablet
      lg: "1920px", // Desktop
    },
  },
};
```

### 完全なレスポンシブ実装例

```typescript
import React from "react";
import { BackgroundGradation } from "@/components/common/BackgroundGradation";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { Herosection } from "@/components/blog/Herosection";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogFooter } from "@/components/blog/BlogFooter";

export const BlogPage: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen" data-name="blog_page">
      {/* 背景グラデーション */}
      <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden">
        <BackgroundGradation />
      </div>

      {/* ヘッダー */}
      <header
        className="
        fixed top-0 left-0 right-0 z-50
        w-full max-w-[1920px] mx-auto
        p-6 md:p-6 sm:p-4
      "
      >
        <div className="w-[112px]">
          <a href="/" className="block w-[88px] h-[26.07px]">
            <img
              src="/assets/d6495cc76015bd725cb662d469f2c31129d53e32.svg"
              alt="BONO"
              className="w-full h-full"
            />
          </a>
        </div>
      </header>

      {/* 太陽の装飾 */}
      <div
        className="
          fixed z-0
          right-[5%] md:right-[3%] sm:right-[2%]
          bottom-[268px] md:bottom-[200px] sm:bottom-[150px]
          w-[260px] h-[260px]
        "
        aria-hidden="true"
      >
        <img
          src="/assets/82c8bc0c7e4edf6d630d1c217268bbafd904b609.svg"
          alt=""
          className="w-full h-full"
        />
      </div>

      {/* メインコンテンツ */}
      <main className="w-full flex flex-col items-center">
        {/* ヒーローセクション */}
        <section
          className="
          w-full max-w-[1920px]
          pt-[80px] md:pt-[60px] sm:pt-[48px]
          pb-0
          px-6 md:px-6 sm:px-4
          flex items-start justify-center
        "
        >
          <Herosection />
        </section>

        {/* ブログ記事一覧 */}
        <section
          className="
          w-full max-w-[1120px]
          px-6 md:px-6 sm:px-4
        "
        >
          {/* 見出し */}
          <div className="h-16 px-2.5 py-4 mb-0">
            <h2
              className="
              font-['Hind'] font-bold
              text-2xl md:text-xl sm:text-lg
              leading-[48px] md:leading-[40px] sm:leading-[32px]
              tracking-[0.6px]
              text-black
            "
            >
              All Episodes
            </h2>
          </div>

          {/* ブログカード一覧 */}
          <div className="flex flex-col gap-3 w-full">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="
                  bg-white rounded-2xl shadow-sm
                  min-h-[152px] md:min-h-[140px] sm:min-h-auto
                  pl-3 pr-6 py-3 sm:p-3
                  flex flex-row sm:flex-col
                  items-center sm:items-start
                  gap-8 md:gap-6 sm:gap-3
                "
              >
                {/* サムネイル */}
                <div
                  className="
                  w-[240px] md:w-[200px] sm:w-full
                  h-[135px] md:h-[112.5px] sm:aspect-[16/9]
                  flex-shrink-0
                  bg-[#D8E7EF] rounded-xl
                  flex items-center justify-center
                  overflow-hidden
                "
                >
                  <img
                    src={post.thumbnail}
                    alt=""
                    className="w-16 h-16 sm:w-full sm:h-full sm:object-cover"
                  />
                </div>

                {/* テキストコンテンツ */}
                <div className="flex-1 flex flex-col gap-2">
                  <h3
                    className="
                    font-['Noto_Sans_JP'] font-bold
                    text-[16px] md:text-[15px] sm:text-[14px]
                    leading-[24px] md:leading-[22px] sm:leading-[20px]
                    text-[#0F172A]
                  "
                  >
                    {post.title}
                  </h3>
                  <div
                    className="
                    flex gap-3 sm:gap-2
                    text-[12px] md:text-[11px] sm:text-[10px]
                    text-[#9CA3AF]
                  "
                  >
                    <span className="font-['Hind']">{post.category}</span>
                    <span className="font-['Hind']">{post.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* フッター */}
        <footer
          className="
          w-full max-w-[1920px]
          pt-[160px] md:pt-[120px] sm:pt-[80px]
          pb-16 md:pb-12 sm:pb-8
          px-6 md:px-6 sm:px-4
          flex flex-col gap-2
        "
        >
          {/* コピーライト */}
          <div className="w-full text-center">
            <p
              className="
              font-['Hind'] font-medium
              text-sm leading-5
              text-[#6B7280]
            "
            >
              Copyright©︎kaikun
            </p>
          </div>

          {/* リンクリスト */}
          <div
            className="
            w-full flex items-center justify-center
            gap-3 md:gap-3 sm:gap-2
            flex-wrap
          "
          >
            <a
              href="/license"
              className="
                font-['Hind'] font-medium
                text-sm sm:text-xs leading-5
                text-[#6B7280]
                hover:text-[#374151]
                transition-colors
              "
            >
              MIT License
            </a>
            <a
              href="/privacy"
              className="
                font-['Hind'] font-medium
                text-sm sm:text-xs leading-5
                text-[#6B7280]
                hover:text-[#374151]
                transition-colors
              "
            >
              Privacy Policy
            </a>
            <a
              href="/login"
              className="
                font-['Noto_Sans_JP'] font-medium
                text-sm sm:text-xs leading-5
                text-[#6B7280]
                hover:text-[#374151]
                transition-colors
              "
            >
              ログイン
            </a>
            <a
              href="/signup"
              className="
                font-['Noto_Sans_JP'] font-medium
                text-sm sm:text-xs leading-5
                text-[#6B7280]
                hover:text-[#374151]
                transition-colors
              "
            >
              新規登録
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};
```

### レスポンシブ比率表

| 要素                 | Desktop (1920px) | Tablet (768px-1919px) | Mobile (375px-767px) |
| -------------------- | ---------------- | --------------------- | -------------------- |
| コンテンツ幅         | 1120px (58.33%)  | max(90%, 1120px)      | max(95%, 1120px)     |
| ヘッダーパディング   | 24px             | 24px                  | 16px                 |
| ヒーロー上パディング | 80px             | 60px                  | 48px                 |
| HOPE ロゴ幅          | 344px (100%)     | 280px (81%)           | 200px (58%)          |
| 見出しサイズ         | 24px             | 20px                  | 18px                 |
| サムネイル幅         | 240px            | 200px                 | 100%                 |
| サムネイル高さ       | 135px            | 112.5px               | aspect-ratio         |
| カードレイアウト     | 横並び           | 横並び                | 縦並び               |
| フッター上パディング | 160px            | 120px                 | 80px                 |
| フッター下パディング | 64px             | 48px                  | 32px                 |

### 注意事項

1. **コンテンツ幅の計算**

   - `max-w-[1120px]` で最大幅を制限
   - パーセンテージで画面サイズに応じて調整
   - 中央揃え（`mx-auto`）

2. **ブログカードの挙動**

   - Desktop/Tablet: サムネイルとテキストが横並び
   - Mobile: サムネイルとテキストが縦並び
   - サムネイルサイズは画面サイズに応じて調整

3. **固定要素**

   - 太陽の装飾: 260×260px 固定
   - ヘッダー: 固定位置（`position: fixed`）
   - 背景: 全画面固定

4. **フォントサイズ**
   - 画面サイズに応じて段階的に縮小
   - 可読性を維持

---

## アセット一覧

### 画像ファイル

```typescript
const assets = {
  // ロゴ
  bonoLogo: "/assets/d6495cc76015bd725cb662d469f2c31129d53e32.svg",
  hopeLogo: "/assets/bbde0d9860756a76727bcbe17eabccd0d60e09f6.svg",

  // 装飾
  sunImage: "/assets/82c8bc0c7e4edf6d630d1c217268bbafd904b609.svg",

  // サムネイル
  emojiImage: "/assets/113d7f736eba4886ca0872b90979d5d862bcba83.png",

  // 背景グラデーション（3 レイヤー）
  gradientLayer1: "/assets/fb68f6866821fadc0f0026a124dfad6e6cbb1484.svg",
  gradientLayer2: "/assets/29ca2670e745af2c300e38091b228d87e35a35a1.svg",
  gradientLayer3: "/assets/027aeae77486deef40eab3061f253a4ecb947ffe.svg",
};
```

### アセット配置場所

すべてのアセットは `/Users/kaitakumi/Documents/bono-training/public/assets/` に保存済み

---

## コンポーネント構成

### 使用する既存コンポーネント

1. **BackgroundGradation** (`@/components/common/BackgroundGradation`)

   - 背景グラデーション
   - 実装済み

2. **Herosection** (`@/components/blog/Herosection`)

   - ヒーローセクション
   - 別途詳細仕様あり

3. **BlogCard** (`@/components/blog/BlogCard`)
   - ブログカード
   - 別途詳細仕様あり

### 新規作成が必要なコンポーネント

1. **BlogHeader** (`@/components/blog/BlogHeader`)

   - ヘッダーコンポーネント

2. **BlogFooter** (`@/components/blog/BlogFooter`)

   - フッターコンポーネント

3. **BlogLayout** (`@/components/blog/BlogLayout`)
   - ページ全体のレイアウトコンポーネント

---

## 完全な実装例

### BlogPage.tsx

```typescript
import React from "react";
import { BackgroundGradation } from "@/components/common/BackgroundGradation";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { Herosection } from "@/components/blog/Herosection";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogFooter } from "@/components/blog/BlogFooter";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  thumbnail: string;
}

export const BlogPage: React.FC = () => {
  // ダミーデータ（実際は API から取得）
  const blogPosts: BlogPost[] = [
    {
      id: "1",
      title: "アンチ合理性。熱を帯びるつくり手を育めるか。BONOの2023年",
      category: "BONO",
      date: "2023年08月25日",
      thumbnail: "/assets/113d7f736eba4886ca0872b90979d5d862bcba83.png",
    },
    // ... 他の記事
  ];

  return (
    <div className="relative w-[1920px] h-[1811px]" data-name="blog_page">
      {/* 背景グラデーション */}
      <div className="fixed inset-0 -z-10 w-[1920px] h-[1811px] overflow-hidden">
        <BackgroundGradation />
      </div>

      {/* ヘッダー */}
      <BlogHeader />

      {/* 太陽の装飾 */}
      <div
        className="fixed left-[1724px] bottom-[268px] w-[260px] h-[260px] z-0"
        aria-hidden="true"
      >
        <img
          src="/assets/82c8bc0c7e4edf6d630d1c217268bbafd904b609.svg"
          alt=""
          className="w-full h-full"
        />
      </div>

      {/* メインコンテンツ */}
      <main className="w-[1920px] flex flex-col items-center">
        {/* ヒーローセクション */}
        <section className="w-[1920px] pt-[80px] pb-0 flex items-start justify-center">
          <Herosection />
        </section>

        {/* ブログ記事一覧 */}
        <section className="w-[1120px]">
          {/* 見出し */}
          <div className="h-16 px-2.5 py-4">
            <h2 className="font-['Hind'] font-bold text-2xl leading-[48px] tracking-[0.6px] text-black">
              All Episodes
            </h2>
          </div>

          {/* ブログカード一覧 */}
          <div className="flex flex-col gap-3 w-full">
            {blogPosts.map((post) => (
              <BlogCard
                key={post.id}
                title={post.title}
                category={post.category}
                date={post.date}
                thumbnail={post.thumbnail}
                className="bg-white rounded-2xl shadow-sm min-h-[152px] pl-3 pr-6 py-3"
              />
            ))}
          </div>
        </section>

        {/* フッター */}
        <BlogFooter />
      </main>
    </div>
  );
};
```

---

## z-index 管理

```typescript
const zIndex = {
  background: -10, // 背景グラデーション
  sunDecoration: 0, // 太陽の装飾
  content: 1, // メインコンテンツ
  header: 50, // ヘッダー
};
```

---

## アクセシビリティ

### 推奨設定

1. **装飾的な画像**

   - `alt=""` を設定
   - `aria-hidden="true"` を追加

2. **セマンティック HTML**

   - `<header>`, `<main>`, `<section>`, `<footer>` を使用
   - 見出しレベルを適切に設定（h1, h2）

3. **キーボードナビゲーション**

   - すべてのリンクとボタンにフォーカス可能
   - フォーカス時の視覚的フィードバック

4. **カラーコントラスト**
   - テキストと背景のコントラスト比を確認
   - WCAG AA 基準を満たす

---

## パフォーマンス最適化

### 画像最適化

1. **遅延読み込み**

   ```typescript
   <img loading="lazy" ... />
   ```

2. **適切なフォーマット**

   - ロゴ・アイコン: SVG
   - 写真: WebP（フォールバック PNG）

3. **プリロード**
   ```html
   <link
     rel="preload"
     as="image"
     href="/assets/d6495cc76015bd725cb662d469f2c31129d53e32.svg"
   />
   ```

### レンダリング最適化

1. **コンポーネントのメモ化**

   ```typescript
   export const BlogCard = React.memo(BlogCardComponent);
   ```

2. **仮想スクロール**
   - 記事数が多い場合は react-window を検討

---

## 実装チェックリスト

### デスクトップ（1920px）

- [ ] 背景グラデーションコンポーネントの配置
- [ ] ヘッダーコンポーネントの実装（固定位置）
- [ ] ヒーローセクションの配置
- [ ] ブログカード一覧の実装（横並びレイアウト）
- [ ] フッターコンポーネントの実装
- [ ] 太陽の装飾の配置
- [ ] すべてのアセットの配置確認
- [ ] デザイントークンの適用
- [ ] z-index の正しい設定

### タブレット（768px-1919px）

- [ ] コンテンツ幅が 90%または最大 1120px になることを確認
- [ ] ヘッダーパディングが 24px であることを確認
- [ ] ヒーローセクションの上パディングが 60px であることを確認
- [ ] HOPE ロゴが 280px に縮小されることを確認
- [ ] 見出しサイズが 20px になることを確認
- [ ] ブログカードのサムネイルが 200×112.5px になることを確認
- [ ] ブログカードが横並びレイアウトを維持することを確認
- [ ] フッターパディングが調整されることを確認（上 120px、下 48px）
- [ ] 太陽の装飾位置が調整されることを確認

### モバイル（375px-767px）

- [ ] コンテンツ幅が 95%または最大 1120px になることを確認
- [ ] ヘッダーパディングが 16px になることを確認
- [ ] ヒーローセクションの上パディングが 48px になることを確認
- [ ] HOPE ロゴが 200px に縮小されることを確認
- [ ] 見出しサイズが 18px になることを確認
- [ ] ブログカードが縦並びレイアウトになることを確認
- [ ] サムネイルが 100%幅、16:9 比率になることを確認
- [ ] フッターパディングが調整されることを確認（上 80px、下 32px）
- [ ] フッターリンクが折り返し表示されることを確認
- [ ] 太陽の装飾位置が調整されることを確認

### 共通

- [ ] Tailwind CSS のブレークポイント設定（sm: 375px, md: 768px, lg: 1920px）
- [ ] アクセシビリティチェック（ARIA 属性、キーボードナビゲーション）
- [ ] パフォーマンス測定（Lighthouse）
  - [ ] Desktop: 90 点以上
  - [ ] Mobile: 85 点以上
- [ ] 各ブラウザでの表示確認
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] 実機テスト
  - [ ] iPhone（375px, 390px, 428px）
  - [ ] Android（360px, 412px）
  - [ ] iPad（768px, 1024px）
- [ ] フォントの読み込み確認（Hind, Noto Sans JP）
- [ ] 画像の最適化確認
- [ ] ホバー状態の確認（リンク、ボタン）
- [ ] スクロール動作の確認

---

## トラブルシューティング

### レイアウトが崩れる場合

#### Desktop

1. **幅が正しく設定されているか確認**

   - ページ全体: max-w-[1920px]
   - コンテンツ: max-w-[1120px]
   - 中央揃え: mx-auto

2. **z-index の競合確認**

   - 背景: -10
   - 太陽の装飾: 0
   - コンテンツ: 1
   - ヘッダー: 50

3. **フォントの読み込み確認**
   - Hind: Google Fonts
   - Noto Sans JP: Google Fonts

#### Tablet/Mobile

1. **ブレークポイントが正しく動作しているか確認**

   ```bash
   # Tailwind CSS設定を確認
   cat tailwind.config.ts
   ```

2. **レスポンシブクラスが適用されているか確認**

   - `sm:` プレフィックス（375px 以上）
   - `md:` プレフィックス（768px 以上）
   - `lg:` プレフィックス（1920px 以上）

3. **パディング・マージンが正しく調整されているか確認**
   - ブラウザの開発者ツールで Computed Style を確認

### ブログカードのレイアウトが崩れる場合

#### Desktop/Tablet（横並びが崩れる）

1. **flex-row が適用されているか確認**

   ```html
   <div className="flex flex-row items-center gap-8"></div>
   ```

2. **サムネイルの flex-shrink-0 が設定されているか確認**

   ```html
   <div className="w-[240px] h-[135px] flex-shrink-0"></div>
   ```

3. **テキストコンテナの flex-1 が設定されているか確認**
   ```html
   <div className="flex-1 flex flex-col gap-2"></div>
   ```

#### Mobile（縦並びにならない）

1. **sm:flex-col が適用されているか確認**

   ```html
   <div className="flex flex-row sm:flex-col"></div>
   ```

2. **サムネイルの幅が 100%になっているか確認**

   ```html
   <div className="w-[240px] sm:w-full"></div>
   ```

3. **aspect-ratio が正しく動作しているか確認**
   ```html
   <div className="sm:aspect-[16/9]"></div>
   ```

### 背景グラデーションが表示されない場合

1. **SVG ファイルの存在確認**

   ```bash
   ls -la public/assets/fb68f6866821fadc0f0026a124dfad6e6cbb1484.svg
   ls -la public/assets/29ca2670e745af2c300e38091b228d87e35a35a1.svg
   ls -la public/assets/027aeae77486deef40eab3061f253a4ecb947ffe.svg
   ```

2. **`BackgroundGradation` コンポーネントの import 確認**

   ```typescript
   import { BackgroundGradation } from "@/components/common/BackgroundGradation";
   ```

3. **z-index の設定確認**

   ```html
   <div className="fixed inset-0 -z-10"></div>
   ```

4. **fixed positioning が正しく動作しているか確認**
   - 親要素に `position: relative` が設定されていないか確認

### 画像が表示されない場合

1. **アセットパスの確認**

   ```bash
   # 正しいパス
   /assets/d6495cc76015bd725cb662d469f2c31129d53e32.svg

   # 間違ったパス
   ./assets/...
   ../assets/...
   ```

2. **public フォルダへの配置確認**

   ```bash
   ls -la public/assets/
   ```

3. **ビルド後の dist フォルダ確認**

   ```bash
   npm run build
   ls -la dist/assets/
   ```

4. **画像の拡張子確認**
   - SVG: ロゴ、アイコン、装飾
   - PNG: 絵文字、写真

### フォントが正しく表示されない場合

1. **Google Fonts の読み込み確認**

   ```html
   <!-- index.html または _document.tsx -->
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link
     href="https://fonts.googleapis.com/css2?family=Hind:wght@500;700&family=Noto+Sans+JP:wght@500;700&display=swap"
     rel="stylesheet"
   />
   ```

2. **Tailwind CSS の font-family 設定確認**

   ```typescript
   // tailwind.config.ts
   export default {
     theme: {
       extend: {
         fontFamily: {
           hind: ["Hind", "sans-serif"],
           noto: ["Noto Sans JP", "sans-serif"],
         },
       },
     },
   };
   ```

3. **フォールバックフォントの確認**
   ```css
   font-family: "Hind", sans-serif;
   font-family: "Noto Sans JP", sans-serif;
   ```

### レスポンシブが動作しない場合

1. **viewport meta タグの確認**

   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   ```

2. **Tailwind CSS のビルド確認**

   ```bash
   npm run build
   # または
   npm run dev
   ```

3. **ブラウザのキャッシュクリア**

   - Cmd+Shift+R (Mac)
   - Ctrl+Shift+R (Windows)

4. **開発者ツールでブレークポイントを確認**
   - Responsive Design Mode を使用
   - 各ブレークポイントで表示を確認

### パフォーマンスが悪い場合

1. **画像の最適化**

   ```bash
   # SVGの最適化
   npx svgo public/assets/*.svg

   # PNGの最適化
   npx imagemin public/assets/*.png --out-dir=public/assets/optimized
   ```

2. **遅延読み込みの確認**

   ```html
   <img loading="lazy" ... />
   ```

3. **不要な再レンダリングの確認**

   ```typescript
   // React DevTools Profilerを使用
   // 不要な再レンダリングを特定
   ```

4. **バンドルサイズの確認**
   ```bash
   npm run build
   npm run analyze
   ```

### モバイルでスクロールがカクつく場合

1. **will-change プロパティの追加**

   ```css
   .scroll-container {
     will-change: transform;
   }
   ```

2. **transform の使用**

   ```css
   /* position の代わりに transform を使用 */
   transform: translateY(0);
   ```

3. **固定要素の最適化**
   ```css
   .fixed-element {
     transform: translateZ(0);
     backface-visibility: hidden;
   }
   ```

---

## 関連ドキュメント

- [背景グラデーション実装仕様](./background-gradation-implementation.md)
- [ヒーローセクション実装仕様](./herosection.md)
- [ブログカード実装仕様](./blogcard.md)
- [ナビゲーション実装仕様](./navigation-blog.md)

---

## 更新履歴

- 2025-11-10: 初版作成（Figma デザインから自動生成）
- 2025-11-10: レスポンシブ対応追加（Desktop/Tablet/Mobile）
- Node ID: 1:3
- Figma File: ee9rQHm0c0QLHpMgCqZpRe

---

## 備考

### デザインの意図

このレイアウトは、BONO blog のメインページとして以下の特徴を持ちます：

1. **シンプルで洗練されたデザイン**

   - 淡いグラデーション背景で柔らかい印象
   - ホワイトスペースを効果的に活用
   - ミニマルな UI で読みやすさを重視

2. **視線の流れ**

   - ヒーローセクション → ブログ一覧 → フッター
   - 中央揃えで視線を誘導
   - 縦スクロールで自然な閲覧体験

3. **装飾的要素**
   - 右下の太陽: 温かみと希望を表現
   - グラデーション: 優雅で落ち着いた雰囲気
   - 控えめな装飾でコンテンツを引き立てる

### 実装時の注意点

1. **レスポンシブレイアウト**

   - Desktop（1920px）: 固定幅 1120px、最適な読みやすさ
   - Tablet（768px-1919px）: 画面幅の 90%、柔軟な表示
   - Mobile（375px-767px）: 画面幅の 95%、縦並びレイアウト

2. **コンテンツ幅の比率維持**

   - デスクトップの比率（58.33%）を基準に調整
   - `max-w-[1120px]` で最大幅を制限
   - パーセンテージで画面サイズに応じて柔軟に対応

3. **ブログカードの挙動**

   - Desktop/Tablet: サムネイルとテキストが横並び
   - Mobile: サムネイルとテキストが縦並び
   - サムネイルサイズは画面サイズに応じて段階的に調整

4. **コンポーネントの再利用**

   - 既存コンポーネントを最大限活用
   - `BackgroundGradation`, `Herosection`, `BlogCard` を使用
   - 新規コンポーネントは最小限に（Header, Footer）

5. **パフォーマンス**

   - 画像の最適化（SVG, WebP）
   - 遅延読み込みの活用（`loading="lazy"`）
   - 不要な再レンダリングの防止（React.memo）
   - バンドルサイズの最適化

6. **保守性**

   - デザイントークンの活用（色、フォント、スペーシング）
   - コンポーネントの分離（単一責任の原則）
   - 明確な命名規則（BEM 風）
   - TypeScript による型安全性

7. **アクセシビリティ**

   - セマンティック HTML（header, main, section, footer）
   - ARIA 属性の適切な使用
   - キーボードナビゲーション対応
   - カラーコントラスト比の確保（WCAG AA 準拠）

8. **ブラウザ互換性**
   - モダンブラウザ対応（Chrome, Firefox, Safari, Edge）
   - CSS Grid/Flexbox の活用
   - aspect-ratio のフォールバック対応

### レスポンシブデザインの哲学

このデザインは「**モバイルファースト**」ではなく「**デスクトップベース**」のアプローチを採用しています：

1. **デスクトップデザインを基準**

   - 1920px のデザインを最適な状態として定義
   - 比率を維持しながら小さい画面に適応

2. **段階的な縮小**

   - Tablet: 約 80-90%のサイズ
   - Mobile: 約 60-70%のサイズ
   - レイアウトの変更は最小限（横 → 縦並び）

3. **コンテンツの優先順位**
   - すべてのデバイスで同じコンテンツを表示
   - 装飾要素（太陽）は固定サイズで維持
   - 読みやすさを最優先

### 技術スタック

- **フレームワーク**: React + TypeScript
- **スタイリング**: Tailwind CSS
- **ビルドツール**: Vite
- **画像形式**: SVG（ロゴ、アイコン）、PNG（写真）
- **フォント**: Google Fonts（Hind, Noto Sans JP）

### 今後の拡張性

1. **ダークモード対応**

   - カラートークンの拡張
   - `prefers-color-scheme` の活用

2. **アニメーション追加**

   - スクロールアニメーション
   - ホバーエフェクトの強化

3. **パフォーマンス最適化**

   - 画像の遅延読み込み
   - 仮想スクロール（記事数が多い場合）
   - Code Splitting

4. **SEO 対策**
   - メタタグの最適化
   - 構造化データの追加
   - サイトマップの生成
