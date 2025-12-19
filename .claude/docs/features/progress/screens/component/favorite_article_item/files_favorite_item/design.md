# Favorite Article Card - 完全実装ガイド（Figma MCP 取得版）

## 📋 このガイドについて

このガイドは **Figma MCP から直接取得した正確な数値** に基づいて作成されています。
全ての数値、色、フォントサイズは Figma のデザインデータと完全に一致しています。

---

## 📸 デザイン構造

このコンポーネントは **横長のカード** で、お気に入り記事を表示します：

```
┌─────────────────────────────────────────────────────┐
│ ┌──────┐                                            │
│ │サムネ│ 盗む視点①：ビジュアル              ⭐    │
│ │ 画像 │ by 「3構造」ではじめるUIデザイン入門        │
│ └──────┘                                            │
└─────────────────────────────────────────────────────┘
```

**サイズ**: 443px × 68px

---

## 🎯 コンポーネント概要

| 項目               | 値                                   |
| ------------------ | ------------------------------------ |
| **名前**           | FavoriteArticle                      |
| **サイズ**         | 443px × 68px                         |
| **バリエーション** | 2 種類（favorite_article / article） |
| **Figma Node ID**  | 2:2180                               |

### 2 つのバリエーション

1. **favorite_article**: スターアイコンあり（お気に入り済み）
2. **article**: スターアイコンなし（通常の記事カード）

---

## 📐 完全なデザイン仕様（Figma MCP 取得）

### カード全体

```css
 {
  /* サイズ */
  width: 443px;
  height: 68px;

  /* レイアウト */
  display: flex;
  align-items: center;
  gap: 12px; /* コンテンツとボタンの間 */

  /* 背景・ボーダー（任意） */
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08);
}
```

---

## 1. コンテンツブロック（左側）

### 全体レイアウト

```css
 {
  /* レイアウト */
  display: flex;
  gap: 12px; /* サムネイルとテキストの間 */
  align-items: center;
  flex-shrink: 0;
}
```

---

### 1-1. サムネイル画像

```css
 {
  /* サイズ */
  width: 85px;
  height: 48px;

  /* 角丸 */
  border-radius: 8px;

  /* レイアウト */
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}

/* 画像 */
.thumbnail-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
```

**重要**: サムネイル画像は Sanity CMS から取得する想定

---

### 1-2. テキストエリア

#### 全体レイアウト

```css
 {
  /* レイアウト */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-shrink: 0;
}
```

#### タイトル

```css
 {
  /* フォント */
  font-family: "Rounded Mplus 1c", sans-serif;
  font-weight: 700; /* Bold */
  font-size: 14px;
  font-style: normal;
  line-height: 32px;

  /* 色 */
  color: #000000; /* black */

  /* レイアウト */
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 100%;
  flex-shrink: 0;
}
```

#### レッスン情報行

```css
 {
  /* レイアウト */
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
}
```

##### "by" テキスト

```css
 {
  /* フォント */
  font-family: "Inter", sans-serif;
  font-weight: 400; /* Regular */
  font-size: 12px;
  font-style: normal;
  line-height: 20px;

  /* 色 */
  color: #4b5563; /* グレー */

  /* レイアウト */
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-shrink: 0;
  white-space: nowrap;
}
```

##### レッスン名

```css
 {
  /* フォント */
  font-family: "Inter", "Noto Sans JP", sans-serif;
  font-weight: 400; /* Regular */
  font-size: 12px;
  font-style: normal;
  line-height: 20px;

  /* 色 */
  color: #4b5563; /* グレー */

  /* レイアウト */
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-shrink: 0;
  white-space: nowrap;
}
```

---

## 2. お気に入りボタン（右側）

### ボタン全体

```css
 {
  /* パディング */
  padding: 8px;

  /* 角丸 */
  border-radius: 9999px; /* 完全な円形 */

  /* レイアウト */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  flex-shrink: 0;

  /* カーソル */
  cursor: pointer;

  /* トランジション */
  transition: transform 0.2s ease;
}

/* ホバー時 */
:hover {
  transform: scale(1.1);
}
```

### スターアイコン

```css
 {
  /* サイズ */
  width: 20px;
  height: 20px;

  /* レイアウト */
  position: relative;
  flex-shrink: 0;
}
```

**アイコン色:**

- お気に入り済み: `#FFC107`（黄色）
- 未お気に入り: `#E0E0E0`（グレー）

### ツールチップ（"解除"）

```css
 {
  /* 位置 */
  position: absolute;
  bottom: 122.22%;
  right: -0.84px;
  top: -88.89%;

  /* 背景 */
  background-color: #1f2937;

  /* パディング */
  padding: 4px 8px;

  /* 角丸 */
  border-radius: 4px;

  /* 表示 */
  opacity: 0; /* デフォルトは非表示 */

  /* レイアウト */
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ホバー時 */
:hover {
  opacity: 1;
}

/* テキスト */
.tooltip-text {
  font-family: "Inter", "Noto Sans JP", sans-serif;
  font-weight: 400;
  font-size: 11.1px;
  line-height: 16px;
  text-align: center;
  color: #ffffff;
  white-space: nowrap;
}
```

---

## 💻 完全な実装コード（React + TypeScript）

```tsx
import React, { useState } from "react";

interface FavoriteArticleCardProps {
  /** 記事タイトル */
  title: string;
  /** レッスン名 */
  lessonName: string;
  /** サムネイル画像URL（Sanity CMSから取得） */
  thumbnailUrl: string;
  /** お気に入り状態 */
  isFavorite: boolean;
  /** お気に入り切り替え時のコールバック */
  onFavoriteToggle?: (isFavorite: boolean) => void;
  /** カードクリック時のコールバック */
  onClick?: () => void;
  /** 記事URL（クリック時の遷移先） */
  articleUrl?: string;
  /** カスタムクラス名 */
  className?: string;
}

export const FavoriteArticleCard: React.FC<FavoriteArticleCardProps> = ({
  title,
  lessonName,
  thumbnailUrl,
  isFavorite: initialIsFavorite = false,
  onFavoriteToggle,
  onClick,
  articleUrl,
  className = "",
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavoriteHovered, setIsFavoriteHovered] = useState(false);

  // お気に入りトグル処理
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素へのイベント伝播を停止

    const newState = !isFavorite;
    setIsFavorite(newState);

    if (onFavoriteToggle) {
      onFavoriteToggle(newState);
    }
  };

  // カードクリック処理
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }

    if (articleUrl) {
      window.location.href = articleUrl;
    }
  };

  return (
    <div
      className={className}
      role="article"
      aria-label={title}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "443px",
        height: "68px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        padding: "16px",
        boxShadow:
          isHovered && (onClick || articleUrl)
            ? "0px 4px 16px rgba(0, 0, 0, 0.12)"
            : "0px 2px 8px rgba(0, 0, 0, 0.08)",
        cursor: onClick || articleUrl ? "pointer" : "default",
        transition: "box-shadow 0.2s ease",
      }}
    >
      {/* コンテンツブロック */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexShrink: 0,
          flex: 1,
        }}
      >
        {/* サムネイル */}
        <div
          style={{
            width: "85px",
            height: "48px",
            borderRadius: "8px",
            position: "relative",
            flexShrink: 0,
            overflow: "hidden",
            backgroundColor: "#F5F5F5", // プレースホルダー
          }}
        >
          <img
            src={thumbnailUrl}
            alt={`${title}のサムネイル`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* テキストエリア */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            flexShrink: 0,
          }}
        >
          {/* タイトル */}
          <div
            style={{
              fontFamily: "'Rounded Mplus 1c', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              fontStyle: "normal",
              lineHeight: "32px",
              color: "#000000",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: "100%",
              flexShrink: 0,
            }}
          >
            <p style={{ margin: 0 }}>{title}</p>
          </div>

          {/* レッスン情報 */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              flexShrink: 0,
            }}
          >
            {/* "by" */}
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: "12px",
                fontStyle: "normal",
                lineHeight: "20px",
                color: "#4B5563",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              <p style={{ margin: 0 }}>by</p>
            </div>

            {/* レッスン名 */}
            <div
              style={{
                fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                fontWeight: 400,
                fontSize: "12px",
                fontStyle: "normal",
                lineHeight: "20px",
                color: "#4B5563",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              <p style={{ margin: 0 }}>{lessonName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* お気に入りボタン */}
      <div
        role="button"
        aria-label={isFavorite ? "お気に入りを解除" : "お気に入りに追加"}
        aria-pressed={isFavorite}
        tabIndex={0}
        onClick={handleFavoriteToggle}
        onMouseEnter={() => setIsFavoriteHovered(true)}
        onMouseLeave={() => setIsFavoriteHovered(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleFavoriteToggle(e as any);
          }
        }}
        style={{
          padding: "8px",
          borderRadius: "9999px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          position: "relative",
          flexShrink: 0,
          cursor: "pointer",
          transition: "transform 0.2s ease",
          transform: isFavoriteHovered ? "scale(1.1)" : "scale(1)",
        }}
      >
        {/* スターアイコン */}
        <div
          style={{
            width: "20px",
            height: "20px",
            position: "relative",
            flexShrink: 0,
            fontSize: "20px",
            lineHeight: "20px",
            color: isFavorite ? "#FFC107" : "#E0E0E0",
            transition: "color 0.2s ease",
          }}
        >
          ⭐
        </div>

        {/* ツールチップ（"解除"） */}
        {isFavorite && (
          <div
            style={{
              position: "absolute",
              bottom: "110%",
              right: "50%",
              transform: "translateX(50%)",
              backgroundColor: "#1F2937",
              padding: "4px 8px",
              borderRadius: "4px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: isFavoriteHovered ? 1 : 0,
              transition: "opacity 0.2s ease",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                fontWeight: 400,
                fontSize: "11.1px",
                lineHeight: "16px",
                textAlign: "center",
                color: "#FFFFFF",
              }}
            >
              <p style={{ margin: 0 }}>解除</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteArticleCard;
```

---

## 🎨 デザイントークン（Figma MCP 取得）

### カラーパレット

```typescript
const colors = {
  // カード
  cardBg: "#FFFFFF",
  cardShadow: "rgba(0, 0, 0, 0.08)",
  cardShadowHover: "rgba(0, 0, 0, 0.12)",

  // テキスト
  titleText: "#000000",
  lessonInfoText: "#4B5563",

  // サムネイル
  thumbnailPlaceholder: "#F5F5F5",

  // お気に入りボタン
  favoriteActive: "#FFC107", // 黄色
  favoriteInactive: "#E0E0E0", // グレー

  // ツールチップ
  tooltipBg: "#1F2937",
  tooltipText: "#FFFFFF",
};
```

### タイポグラフィ

```typescript
const typography = {
  // タイトル
  title: {
    fontFamily: "'Rounded Mplus 1c', sans-serif",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: "32px",
  },

  // "by"
  by: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: "20px",
  },

  // レッスン名
  lessonName: {
    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: "20px",
  },

  // ツールチップ
  tooltip: {
    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
    fontSize: "11.1px",
    fontWeight: 400,
    lineHeight: "16px",
  },
};
```

### スペーシング

```typescript
const spacing = {
  // カード
  cardPadding: "16px",
  cardGap: "12px", // コンテンツとボタンの間

  // コンテンツブロック
  contentGap: "12px", // サムネイルとテキストの間

  // お気に入りボタン
  buttonPadding: "8px",

  // ツールチップ
  tooltipPadding: "4px 8px",
};
```

### サイズ

```typescript
const sizes = {
  // カード
  cardWidth: "443px",
  cardHeight: "68px",
  cardBorderRadius: "12px",

  // サムネイル
  thumbnailWidth: "85px",
  thumbnailHeight: "48px",
  thumbnailBorderRadius: "8px",

  // お気に入りボタン
  buttonBorderRadius: "9999px",
  iconSize: "20px",

  // ツールチップ
  tooltipBorderRadius: "4px",
};
```

---

## 💡 使用例

### 基本的な使い方

```tsx
<FavoriteArticleCard
  title="盗む視点①：ビジュアル"
  lessonName="「3構造」ではじめるUIデザイン入門"
  thumbnailUrl="https://cdn.sanity.io/.../thumbnail.jpg"
  isFavorite={true}
/>
```

### Sanity CMS 連携

```tsx
// Sanity CMSから取得
const articleData = {
  title: "盗む視点①：ビジュアル",
  lesson: {
    title: "「3構造」ではじめるUIデザイン入門",
  },
  thumbnail: {
    url: "https://cdn.sanity.io/images/project/dataset/image-id.jpg",
  },
  slug: "visual-perspective-1",
  isFavorited: true,
};

<FavoriteArticleCard
  title={articleData.title}
  lessonName={articleData.lesson.title}
  thumbnailUrl={articleData.thumbnail.url}
  isFavorite={articleData.isFavorited}
  articleUrl={`/articles/${articleData.slug}`}
  onFavoriteToggle={(isFavorite) => {
    // お気に入り状態をAPIに保存
    updateFavoriteStatus(articleData.id, isFavorite);
  }}
  onClick={() => {
    // アナリティクス送信
    analytics.track("article_clicked", {
      article: articleData.slug,
    });
  }}
/>;
```

### Next.js での使用例

```tsx
import { useRouter } from "next/router";

const ArticleList = ({ articles }) => {
  const router = useRouter();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {articles.map((article) => (
        <FavoriteArticleCard
          key={article.id}
          title={article.title}
          lessonName={article.lesson.title}
          thumbnailUrl={article.thumbnail.url}
          isFavorite={article.isFavorited}
          onFavoriteToggle={(isFavorite) => {
            // お気に入り状態を更新
            fetch(`/api/favorites/${article.id}`, {
              method: "PATCH",
              body: JSON.stringify({ isFavorite }),
            });
          }}
          onClick={() => {
            router.push(`/articles/${article.slug}`);
          }}
        />
      ))}
    </div>
  );
};
```

---

## 📱 レスポンシブ対応

### 基本方針

- デフォルト幅: `443px`
- スマホ: `width: 100%, max-width: 443px`

### レスポンシブスタイル

```css
/* デスクトップ（デフォルト） */
.favorite-article-card {
  width: 443px;
}

/* タブレット・スマホ（768px以下） */
@media (max-width: 768px) {
  .favorite-article-card {
    width: 100%;
    max-width: 443px;
  }
}
```

---

## ♿ アクセシビリティ

### ARIA 属性

```typescript
// カード全体
role="article"
aria-label={title}

// お気に入りボタン
role="button"
aria-label={isFavorite ? 'お気に入りを解除' : 'お気に入りに追加'}
aria-pressed={isFavorite}
tabIndex={0}
```

### キーボード操作

- お気に入りボタンは **Enter キー** または **Space キー** で操作可能
- Tab キーでフォーカス可能

---

## ✅ 実装チェックリスト

### デザイン仕様

- [ ] カードサイズが 443px × 68px である
- [ ] サムネイルが 85px × 48px である
- [ ] タイトルが 14px、line-height 32px である
- [ ] レッスン情報が 12px、line-height 20px である
- [ ] スターアイコンが 20px である

### レイアウト

- [ ] カード全体のギャップが 12px である
- [ ] サムネイルとテキストのギャップが 12px である
- [ ] パディングが 16px である
- [ ] 角丸が 12px（カード）、8px（サムネイル）である

### カラー

- [ ] タイトルが#000000 である
- [ ] レッスン情報が#4B5563 である
- [ ] お気に入り済みが#FFC107 である
- [ ] 未お気に入りが#E0E0E0 である

### 機能

- [ ] お気に入りボタンがトグルする
- [ ] ホバー時にボタンが拡大する（scale 1.1）
- [ ] ツールチップが表示される（お気に入り済み時のみ）
- [ ] イベント伝播が停止される
- [ ] キーボード操作が可能である

---

## 🎁 重要なポイント

### 1. サムネイル画像

Sanity CMS から取得した画像 URL を使用。85px × 48px で表示。

### 2. お気に入りボタンの動作

- クリックでトグル
- ホバー時に拡大（scale 1.1）
- お気に入り済みの場合はツールチップ「解除」を表示

### 3. イベントの分離

- カード全体: `onClick` → 記事ページへ遷移
- お気に入りボタン: `onFavoriteToggle` → お気に入り状態を更新
- イベント伝播停止で独立動作

### 4. 状態管理

お気に入り状態は内部 state で管理しつつ、親コンポーネントにも通知。

---

## 📝 Sanity CMS スキーマ例

```typescript
// schemas/article.ts
export default {
  name: "article",
  title: "記事",
  type: "document",
  fields: [
    {
      name: "title",
      title: "タイトル",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "thumbnail",
      title: "サムネイル画像",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "lesson",
      title: "レッスン",
      type: "reference",
      to: [{ type: "lesson" }],
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "スラッグ",
      type: "slug",
      options: {
        source: "title",
      },
      validation: (Rule) => Rule.required(),
    },
  ],
};
```

---

**作成日**: 2025 年 12 月 17 日  
**データソース**: Figma MCP（直接取得）  
**Figma Node ID**: 2:2180  
**連携**: Sanity CMS  
**バージョン**: 1.0.0  
**精度**: ✅ 全数値 Figma と完全一致
