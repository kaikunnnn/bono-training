# Blog ページ実装仕様 - クイックサマリー

## 📋 概要

BONO blog のメインページ（`/blog`）の完全なレスポンシブ実装仕様です。

- **Figma**: https://www.figma.com/design/ee9rQHm0c0QLHpMgCqZpRe/BONO-blog-2025-data?node-id=1-3
- **詳細仕様**: [blog-page-layout-specification.md](./blog-page-layout-specification.md)

---

## 🎯 レスポンシブブレークポイント

| デバイス | 画面幅 | コンテンツ幅 |
|---------|--------|------------|
| Desktop | 1920px+ | 1120px (58.33%) |
| Tablet | 768px-1919px | max(90%, 1120px) |
| Mobile | 375px-767px | max(95%, 1120px) |

---

## 🏗️ ページ構造

```
blog_page
├── 背景グラデーション (固定)
├── ヘッダー (固定位置)
├── 太陽の装飾 (右下固定)
└── メインコンテンツ
    ├── ヒーローセクション
    ├── ブログ記事一覧
    └── フッター
```

---

## 📐 主要コンポーネントのサイズ

### Desktop (1920px)

| 要素 | サイズ | 備考 |
|------|--------|------|
| ページ幅 | 1920px | 最大幅 |
| コンテンツ幅 | 1120px | 中央配置 |
| ヘッダー高さ | 74.07px | 固定位置 |
| HOPEロゴ | 344×89px | ヒーロー |
| ブログカード | 1120×152px | 横並び |
| サムネイル | 240×135px | 16:9 |
| 太陽装飾 | 260×260px | 固定サイズ |

### Tablet (768px-1919px)

| 要素 | サイズ | 変更点 |
|------|--------|--------|
| コンテンツ幅 | 90% (max 1120px) | 可変 |
| HOPEロゴ | 280×72.5px | 81%縮小 |
| 見出し | 20px | 縮小 |
| サムネイル | 200×112.5px | 83%縮小 |
| カードレイアウト | 横並び | 維持 |

### Mobile (375px-767px)

| 要素 | サイズ | 変更点 |
|------|--------|--------|
| コンテンツ幅 | 95% (max 1120px) | 可変 |
| HOPEロゴ | 200×51.7px | 58%縮小 |
| 見出し | 18px | 縮小 |
| サムネイル | 100%幅 | aspect-ratio 16:9 |
| カードレイアウト | 縦並び | **変更** |

---

## 🎨 デザイントークン

### カラー

```typescript
const colors = {
  white: "#FFFFFF",
  black: "#000000",
  grayChateauL: "#9CA3AF",
  paleSky: "#6B7280",
  ebony: "#151834",
  azureDark: "#0F172A",
  thumbnailBg: "#D8E7EF",
};
```

### フォント

```typescript
const fonts = {
  hind: "'Hind', sans-serif",
  notoSansJP: "'Noto Sans JP', sans-serif",
};

const fontSizes = {
  desktop: {
    heading: "24px",
    title: "16px",
    body: "14px",
    small: "12px",
  },
  tablet: {
    heading: "20px",
    title: "15px",
    body: "14px",
    small: "11px",
  },
  mobile: {
    heading: "18px",
    title: "14px",
    body: "14px",
    small: "10px",
  },
};
```

---

## 🧩 使用コンポーネント

### 既存コンポーネント

1. **BackgroundGradation** (`@/components/common/BackgroundGradation`)
   - 背景グラデーション
   - 全画面固定

2. **Herosection** (`@/components/blog/Herosection`)
   - ヒーローセクション
   - HOPEロゴ + サブタイトル

3. **BlogCard** (`@/components/blog/BlogCard`)
   - ブログカード
   - レスポンシブ対応

### 新規作成が必要

1. **BlogHeader** (`@/components/blog/BlogHeader`)
   - ヘッダー（BONOロゴ）

2. **BlogFooter** (`@/components/blog/BlogFooter`)
   - フッター（コピーライト + リンク）

---

## 💻 実装例（簡易版）

```typescript
export const BlogPage: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen">
      {/* 背景 */}
      <div className="fixed inset-0 -z-10">
        <BackgroundGradation />
      </div>

      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 md:p-6 sm:p-4">
        <BlogHeader />
      </header>

      {/* 太陽装飾 */}
      <div className="fixed right-[5%] bottom-[268px] w-[260px] h-[260px]">
        <img src="/assets/sun.svg" alt="" />
      </div>

      {/* メイン */}
      <main className="w-full flex flex-col items-center">
        {/* ヒーロー */}
        <section className="w-full max-w-[1920px] pt-[80px] md:pt-[60px] sm:pt-[48px]">
          <Herosection />
        </section>

        {/* ブログ一覧 */}
        <section className="w-full max-w-[1120px] px-6 md:px-6 sm:px-4">
          <h2 className="text-2xl md:text-xl sm:text-lg">All Episodes</h2>
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <BlogCard key={post.id} {...post} />
            ))}
          </div>
        </section>

        {/* フッター */}
        <footer className="w-full pt-[160px] md:pt-[120px] sm:pt-[80px]">
          <BlogFooter />
        </footer>
      </main>
    </div>
  );
};
```

---

## ✅ 実装チェックリスト（要点のみ）

### Desktop
- [ ] 1120px固定幅、中央配置
- [ ] ブログカード横並び（240px + 701px）
- [ ] すべてのアセット配置

### Tablet
- [ ] 90%幅（最大1120px）
- [ ] サムネイル200px
- [ ] 横並び維持

### Mobile
- [ ] 95%幅（最大1120px）
- [ ] ブログカード縦並び
- [ ] サムネイル100%幅、16:9

### 共通
- [ ] Tailwind設定（sm: 375px, md: 768px）
- [ ] アクセシビリティ
- [ ] パフォーマンス（Lighthouse 85+）
- [ ] 実機テスト

---

## 🚀 クイックスタート

### 1. アセットの配置

```bash
# 必要なアセットを確認
ls -la public/assets/

# 必要なファイル:
# - d6495cc76015bd725cb662d469f2c31129d53e32.svg (BONOロゴ)
# - bbde0d9860756a76727bcbe17eabccd0d60e09f6.svg (HOPEロゴ)
# - 82c8bc0c7e4edf6d630d1c217268bbafd904b609.svg (太陽)
# - 背景グラデーション用SVG (3ファイル)
```

### 2. Tailwind設定

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      sm: "375px",
      md: "768px",
      lg: "1920px",
    },
  },
};
```

### 3. フォント読み込み

```html
<!-- index.html -->
<link href="https://fonts.googleapis.com/css2?family=Hind:wght@500;700&family=Noto+Sans+JP:wght@500;700&display=swap" rel="stylesheet">
```

### 4. コンポーネント作成

```bash
# 新規作成が必要
touch src/components/blog/BlogHeader.tsx
touch src/components/blog/BlogFooter.tsx
touch src/pages/BlogPage.tsx
```

---

## 🔗 関連ドキュメント

- [完全な実装仕様](./blog-page-layout-specification.md) - 1600行以上の詳細仕様
- [背景グラデーション](./background-gradation-implementation.md) - 背景コンポーネント
- [ヒーローセクション](./herosection.md) - ヒーローコンポーネント
- [ブログカード](./blogcard.md) - カードコンポーネント

---

## 📞 サポート

質問や不明点がある場合は、詳細仕様書を参照してください。
すべての情報が網羅されています。

---

**最終更新**: 2025-11-10
**バージョン**: 1.0.0 (レスポンシブ対応版)

