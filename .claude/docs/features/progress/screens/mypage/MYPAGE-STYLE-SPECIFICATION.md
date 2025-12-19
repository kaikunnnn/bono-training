# マイページ スタイル・Empty State 仕様書

**作成日**: 2025-12-18
**ステータス**: 📝 仕様策定中

---

## スタイル概要

以下の内容を細かく分割して実装してほしいです。

# MyPage Layout - レイアウト実装ガイド（Figma MCP 取得版）

## 📋 このガイドについて

このガイドは **Figma MCP から直接取得したレイアウト情報** に基づいて作成されています。
**既存のコンポーネント**（ProgressLesson、FavoriteArticleCard、TabNavigation）を使用し、
それらの**配置、間隔、グリッド構造**のみを定義します。

---

## 📸 ページ構造

マイページは **3 つのメインセクション** で構成されています：

```
┌─────────────────────────────────────────────────┐
│ マイページ              [アカウント情報] [プロフィール] │
│ [すべて] 進捗 お気に入り 閲覧履歴              │
├─────────────────────────────────────────────────┤
│ 進行中                              すべてみる │
│ レッスン                                        │
│ [ProgressLesson] [ProgressLesson]               │
├─────────────────────────────────────────────────┤
│ お気に入り                          すべてみる │
│ [FavoriteArticle]                               │
│ [FavoriteArticle]                               │
│ [FavoriteArticle]                               │
│ [FavoriteArticle]                               │
├─────────────────────────────────────────────────┤
│ 閲覧履歴                            すべてみる │
│ [FavoriteArticle]                               │
│ [FavoriteArticle]                               │
│ すべてみる                                      │
└─────────────────────────────────────────────────┘
```

---

## 🎯 レイアウト概要

| 項目              | 値                           |
| ----------------- | ---------------------------- |
| **Figma Node ID** | 50:1287                      |
| **コンテナ幅**    | 100%                         |
| **最大幅**        | 制限なし（レスポンシブ対応） |

---

## 📐 完全なレイアウト仕様（Figma MCP 取得）

### 全体コンテナ（Main_Container）

```css
 {
  /* レイアウト */
  display: flex;
  flex-direction: column;
  gap: 24px; /* セクション間のギャップ */
  align-items: flex-start;

  /* パディング */
  padding-top: 40px;
  padding-bottom: 64px;
  padding-left: 16px;
  padding-right: 16px;

  /* サイズ */
  width: 100%;
  height: 100%;

  /* ポジション */
  position: relative;
}
```

---

## 1. ヘッダーセクション

### 全体レイアウト

```css
 {
  /* レイアウト */
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* サイズ */
  width: 100%;
  flex-shrink: 0;
}
```

---

### 左側：タイトル + タブ

#### 全体コンテナ

```css
 {
  /* レイアウト */
  display: flex;
  flex-direction: column;
  gap: 16px; /* タイトルとタブの間 */
  align-items: flex-start;
  justify-content: center;

  /* サイズ */
  flex-shrink: 0;
}
```

#### タイトル「マイページ」

```css
 {
  /* フォント */
  font-family: "Rounded Mplus 1c", sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: normal;
  color: #020817;

  /* サイズ */
  width: 100px;
}
```

#### タブナビゲーション

**既存コンポーネント**: `<TabNavigation />`

---

### 右側：アカウント情報 + プロフィール

#### 全体コンテナ

```css
 {
  /* レイアウト */
  display: flex;
  gap: 12px; /* ボタン間のギャップ */
  align-items: center;

  /* サイズ */
  flex-shrink: 0;
}
```

#### アカウント情報ボタン

```css
 {
  /* 背景 */
  background-color: #dbeafe; /* 青背景 */

  /* レイアウト */
  display: flex;
  gap: 4px; /* アイコンとテキストの間 */
  align-items: center;

  /* パディング */
  padding: 5px 10px;

  /* 角丸 */
  border-radius: 8px;

  /* サイズ */
  flex-shrink: 0;

  /* カーソル */
  cursor: pointer;
}

/* アイコン */
.icon {
  width: 20px;
  height: 20px;
}

/* テキスト */
.text {
  font-family: "Inter", "Noto Sans JP", sans-serif;
  font-weight: 700;
  font-size: 13px;
  line-height: 24px;
  color: #020817;
  white-space: nowrap;
}
```

#### プロフィールボタン

```css
 {
  /* 背景 */
  background-color: #f3f4f6; /* グレー背景 */

  /* その他は「アカウント情報」と同じ */
}
```

---

## 2. 進行中セクション

### セクション全体

```css
 {
  /* レイアウト */
  display: flex;
  flex-direction: column;
  gap: 20px; /* 見出しとコンテンツの間 */
  align-items: flex-start;

  /* サイズ */
  width: 100%;
  flex-shrink: 0;
}
```

### セクション見出し

#### 全体レイアウト

```css
 {
  /* レイアウト */
  display: flex;
  flex-direction: column;
  gap: 16px; /* タイトルとサブタイトルの間 */
  align-items: flex-start;

  /* サイズ */
  width: 100%;
  flex-shrink: 0;
}
```

#### タイトル行（「進行中」+「すべてみる」）

```css
 {
  /* レイアウト */
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  /* サイズ */
  width: 100%;

  /* フォント */
  font-family: "Rounded Mplus 1c", sans-serif;
  font-weight: 700;
  line-height: normal;
  white-space: nowrap;
}

/* 左側：「進行中」 */
.section-title {
  font-size: 16px;
  line-height: 32px;
  color: #020817;
}

/* 右側：「すべてみる」 */
.see-all {
  font-size: 13px;
  line-height: 32px;
  color: rgba(2, 8, 23, 0.64);
  text-align: center;
  cursor: pointer;
}
```

#### サブタイトル（「レッスン」）

```css
 {
  /* フォント */
  font-family: "Rounded Mplus 1c", sans-serif;
  font-weight: 700;
  font-size: 13px;
  line-height: 32px;
  color: #020817;
  white-space: nowrap;
}
```

### レッスングリッド

```css
 {
  /* レイアウト */
  display: flex;
  gap: 10px; /* カード間のギャップ */
  align-items: flex-start;

  /* サイズ */
  width: 100%;
  flex-shrink: 0;
}

/* 各カード */
.lesson-card {
  flex: 1;
  min-width: 0; /* 均等に配分 */
}
```

**使用コンポーネント**: `<ProgressLesson />` × 2

---

## 3. お気に入りセクション

### セクション全体

```css
 {
  /* レイアウト */
  display: flex;
  flex-direction: column;
  gap: 16px; /* 見出しとリストの間 */
  align-items: flex-start;

  /* サイズ */
  width: 100%;
  flex-shrink: 0;
}
```

### セクション見出し

**構造**: 進行中セクションと同じ（「お気に入り」+「すべてみる」）

### お気に入りリスト

```css
 {
  /* レイアウト */
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  /* サイズ */
  width: 100%;
  flex-shrink: 0;
}

/* 各カード */
.favorite-card {
  /* 背景 */
  background-color: #ffffff;

  /* レイアウト */
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* パディング */
  padding: 8px 12px;

  /* 角丸 */
  border-radius: 8px;

  /* サイズ */
  width: 100%;
  flex-shrink: 0;
}
```

**使用コンポーネント**: `<FavoriteArticleCard />` × 4

---

## 4. 閲覧履歴セクション

### セクション全体

```css
 {
  /* レイアウト */
  display: flex;
  flex-direction: column;
  gap: 16px; /* 見出しとリストの間 */
  align-items: flex-start;

  /* サイズ */
  width: 100%;
  flex-shrink: 0;
}
```

### セクション見出し

**構造**: お気に入りセクションと同じ（「閲覧履歴」+「すべてみる」）

### 閲覧履歴リスト

**構造**: お気に入りリストと同じ

**使用コンポーネント**: `<FavoriteArticleCard property1="article" />` × 4（お気に入りボタンなし）

### 「もっと見る」ボタン

```css
 {
  /* レイアウト */
  display: flex;
  align-items: center;
  justify-content: center;

  /* パディング */
  padding: 12px 0;

  /* サイズ */
  width: 100%;
  flex-shrink: 0;

  /* フォント */
  font-family: "Rounded Mplus 1c", sans-serif;
  font-weight: 700;
  font-size: 13px;
  line-height: 32px;
  color: rgba(2, 8, 23, 0.64);
  text-align: center;

  /* カーソル */
  cursor: pointer;
}
```

---

## 💻 完全な実装コード（React + TypeScript）

```tsx
import React from "react";
import { TabNavigation } from "./TabNavigation";
import { ProgressLesson } from "./ProgressLesson";
import { FavoriteArticleCard } from "./FavoriteArticleCard";

interface MyPageProps {
  /** ユーザー情報 */
  user?: {
    name: string;
  };
}

export const MyPage: React.FC<MyPageProps> = ({ user }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        alignItems: "flex-start",
        paddingTop: "40px",
        paddingBottom: "64px",
        paddingLeft: "16px",
        paddingRight: "16px",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {/* ヘッダーセクション */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          flexShrink: 0,
        }}
      >
        {/* 左側：タイトル + タブ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "flex-start",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {/* タイトル */}
          <h1
            style={{
              fontFamily: "'Rounded Mplus 1c', sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: "normal",
              color: "#020817",
              margin: 0,
            }}
          >
            マイページ
          </h1>

          {/* タブナビゲーション */}
          <TabNavigation />
        </div>

        {/* 右側：アカウント情報 + プロフィール */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {/* アカウント情報ボタン */}
          <button
            style={{
              backgroundColor: "#DBEAFE",
              display: "flex",
              gap: "4px",
              alignItems: "center",
              padding: "5px 10px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "20px" }}>⚙️</span>
            <span
              style={{
                fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                lineHeight: "24px",
                color: "#020817",
              }}
            >
              アカウント情報
            </span>
          </button>

          {/* プロフィールボタン */}
          <button
            style={{
              backgroundColor: "#F3F4F6",
              display: "flex",
              gap: "4px",
              alignItems: "center",
              padding: "5px 10px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "20px" }}>👤</span>
            <span
              style={{
                fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                lineHeight: "24px",
                color: "#020817",
              }}
            >
              プロフィール
            </span>
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          alignItems: "flex-start",
          width: "100%",
          flexShrink: 0,
        }}
      >
        {/* 進行中セクション */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "flex-start",
            width: "100%",
            flexShrink: 0,
          }}
        >
          {/* セクション見出し */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              width: "100%",
              fontFamily: "'Rounded Mplus 1c', sans-serif",
              fontWeight: 700,
              lineHeight: "normal",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                lineHeight: "32px",
                color: "#020817",
                margin: 0,
              }}
            >
              進行中
            </h2>
            <button
              style={{
                fontSize: "13px",
                lineHeight: "32px",
                color: "rgba(2, 8, 23, 0.64)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              すべてみる
            </button>
          </div>

          {/* サブタイトル */}
          <h3
            style={{
              fontFamily: "'Rounded Mplus 1c', sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              lineHeight: "32px",
              color: "#020817",
              margin: 0,
            }}
          >
            レッスン
          </h3>

          {/* レッスングリッド */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <ProgressLesson
                title="センスを盗む技術"
                progress={25}
                currentStep="盗む視点①：ビジュアル"
                iconImageUrl="https://example.com/icon1.jpg"
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ProgressLesson
                title="センスを盗む技術"
                progress={25}
                currentStep="盗む視点①：ビジュアル"
                iconImageUrl="https://example.com/icon2.jpg"
              />
            </div>
          </div>
        </section>

        {/* お気に入りセクション */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "flex-start",
            width: "100%",
            flexShrink: 0,
          }}
        >
          {/* セクション見出し */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              width: "100%",
              fontFamily: "'Rounded Mplus 1c', sans-serif",
              fontWeight: 700,
              lineHeight: "normal",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                lineHeight: "32px",
                color: "#020817",
                margin: 0,
              }}
            >
              お気に入り
            </h2>
            <button
              style={{
                fontSize: "13px",
                lineHeight: "32px",
                color: "rgba(2, 8, 23, 0.64)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              すべてみる
            </button>
          </div>

          {/* お気に入りリスト */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "8px 12px",
                borderRadius: "8px",
                width: "100%",
              }}
            >
              <FavoriteArticleCard
                title="盗む視点①：ビジュアル"
                lessonName="「3構造」ではじめるUIデザイン入門"
                thumbnailUrl="https://example.com/thumb1.jpg"
                isFavorite={true}
              />
            </div>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "8px 12px",
                borderRadius: "8px",
                width: "100%",
              }}
            >
              <FavoriteArticleCard
                title="盗む視点①：ビジュアル"
                lessonName="「3構造」ではじめるUIデザイン入門"
                thumbnailUrl="https://example.com/thumb2.jpg"
                isFavorite={true}
              />
            </div>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "8px 12px",
                borderRadius: "8px",
                width: "100%",
              }}
            >
              <FavoriteArticleCard
                title="盗む視点①：ビジュアル"
                lessonName="「3構造」ではじめるUIデザイン入門"
                thumbnailUrl="https://example.com/thumb3.jpg"
                isFavorite={true}
              />
            </div>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "8px 12px",
                borderRadius: "8px",
                width: "100%",
              }}
            >
              <FavoriteArticleCard
                title="盗む視点①：ビジュアル"
                lessonName="「3構造」ではじめるUIデザイン入門"
                thumbnailUrl="https://example.com/thumb4.jpg"
                isFavorite={true}
              />
            </div>
          </div>
        </section>

        {/* 閲覧履歴セクション */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "flex-start",
            width: "100%",
            flexShrink: 0,
          }}
        >
          {/* セクション見出し */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              width: "100%",
              fontFamily: "'Rounded Mplus 1c', sans-serif",
              fontWeight: 700,
              lineHeight: "normal",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                lineHeight: "32px",
                color: "#020817",
                margin: 0,
              }}
            >
              閲覧履歴
            </h2>
            <button
              style={{
                fontSize: "13px",
                lineHeight: "32px",
                color: "rgba(2, 8, 23, 0.64)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              すべてみる
            </button>
          </div>

          {/* 閲覧履歴リスト */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "8px 12px",
                borderRadius: "8px",
                width: "100%",
              }}
            >
              <FavoriteArticleCard
                title="盗む視点①：ビジュアル"
                lessonName="「3構造」ではじめるUIデザイン入門"
                thumbnailUrl="https://example.com/history1.jpg"
                isFavorite={false}
              />
            </div>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "8px 12px",
                borderRadius: "8px",
                width: "100%",
              }}
            >
              <FavoriteArticleCard
                title="盗む視点①：ビジュアル"
                lessonName="「3構造」ではじめるUIデザイン入門"
                thumbnailUrl="https://example.com/history2.jpg"
                isFavorite={false}
              />
            </div>

            {/* もっと見るボタン */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 0",
                width: "100%",
                fontFamily: "'Rounded Mplus 1c', sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                lineHeight: "32px",
                color: "rgba(2, 8, 23, 0.64)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              すべてみる
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyPage;
```

---

## 🎨 デザイントークン（レイアウト）

### スペーシング

```typescript
const spacing = {
  // 全体コンテナ
  containerPaddingTop: "40px",
  containerPaddingBottom: "64px",
  containerPaddingHorizontal: "16px",
  sectionGap: "24px",

  // ヘッダー
  headerTitleTabGap: "16px",
  headerButtonGap: "12px",

  // セクション
  sectionContentGap: "20px",
  sectionHeadingGap: "16px",

  // レッスングリッド
  lessonGridGap: "10px",

  // カード
  cardPaddingVertical: "8px",
  cardPaddingHorizontal: "12px",

  // ボタン
  buttonPaddingVertical: "5px",
  buttonPaddingHorizontal: "10px",
  buttonIconGap: "4px",
};
```

### カラー

```typescript
const colors = {
  // テキスト
  titleText: "#020817",
  seeAllText: "rgba(2, 8, 23, 0.64)",

  // ボタン背景
  accountButtonBg: "#DBEAFE", // 青背景
  profileButtonBg: "#F3F4F6", // グレー背景

  // カード背景
  cardBg: "#FFFFFF",
};
```

### タイポグラフィ

```typescript
const typography = {
  // ページタイトル
  pageTitle: {
    fontFamily: "'Rounded Mplus 1c', sans-serif",
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "normal",
  },

  // セクションタイトル
  sectionTitle: {
    fontFamily: "'Rounded Mplus 1c', sans-serif",
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: "32px",
  },

  // サブタイトル
  subTitle: {
    fontFamily: "'Rounded Mplus 1c', sans-serif",
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: "32px",
  },

  // 「すべてみる」
  seeAll: {
    fontFamily: "'Rounded Mplus 1c', sans-serif",
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: "32px",
  },

  // ボタンテキスト
  buttonText: {
    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: "24px",
  },
};
```

---

## 📱 レスポンシブ対応

### ブレイクポイント

```typescript
const breakpoints = {
  mobile: "768px",
};
```

### モバイル対応

```css
/* タブレット・スマホ（768px以下） */
@media (max-width: 768px) {
  /* レッスングリッド: 1列に変更 */
  .lesson-grid {
    flex-direction: column;
  }

  /* ヘッダー: 縦並びに変更 */
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  /* ボタン: 横幅いっぱい */
  .header-buttons {
    width: 100%;
    justify-content: flex-start;
  }
}
```

---

## 💡 使用例

### 基本的な使い方

```tsx
import { MyPage } from "./MyPage";

function App() {
  return <MyPage />;
}
```

### データ連携

```tsx
import { MyPage } from "./MyPage";

function App() {
  const [activeTab, setActiveTab] = useState("all");

  // データ取得
  const progressLessons = useProgressLessons();
  const favoriteArticles = useFavoriteArticles();
  const historyArticles = useHistoryArticles();

  return (
    <MyPage
      activeTab={activeTab}
      onTabChange={setActiveTab}
      progressLessons={progressLessons}
      favoriteArticles={favoriteArticles}
      historyArticles={historyArticles}
    />
  );
}
```

---

## ✅ 実装チェックリスト

### レイアウト

- [ ] 全体パディングが正確（40px / 64px / 16px）
- [ ] セクション間ギャップが 24px である
- [ ] ヘッダー要素間ギャップが正確（16px / 12px）
- [ ] レッスングリッドギャップが 10px である
- [ ] セクション見出しギャップが 16px である

### ヘッダー

- [ ] タイトルが 20px である
- [ ] アカウント情報ボタンが青背景（#DBEAFE）である
- [ ] プロフィールボタンがグレー背景（#F3F4F6）である
- [ ] ボタンパディングが 5px 10px である

### セクション

- [ ] セクションタイトルが 16px である
- [ ] 「すべてみる」が 13px である
- [ ] サブタイトルが 13px である
- [ ] 全てのテキストが Rounded Mplus 1c Bold である

### コンポーネント

- [ ] ProgressLesson が正しく配置されている
- [ ] FavoriteArticleCard が正しく配置されている
- [ ] TabNavigation が正しく配置されている
- [ ] カードパディングが 8px 12px である

---

## 🎁 重要なポイント

### 1. 既存コンポーネントの使用

このレイアウトは既に作成した 3 つのコンポーネントを組み合わせています：

- `ProgressLesson`
- `FavoriteArticleCard`
- `TabNavigation`

### 2. 2 列グリッド

進行中セクションのレッスンは 2 列グリッド（gap: 10px）で表示。

### 3. カード背景

お気に入りと閲覧履歴のカードは白背景（#FFFFFF）でラップされています。

### 4. セクション構造

全てのセクションが同じ構造：

- セクションタイトル + 「すべてみる」
- コンテンツリスト

### 5. レスポンシブ

768px 以下でレッスングリッドが 1 列に変更されるよう実装推奨。

---

**作成日**: 2025 年 12 月 17 日  
**データソース**: Figma MCP（レイアウト情報のみ）  
**Figma Node ID**: 50:1287  
**バージョン**: 1.0.0  
**精度**: ✅ レイアウト数値 Figma と完全一致  
**使用コンポーネント**: ProgressLesson, FavoriteArticleCard, TabNavigation

## 4. Empty State（空状態）

### 4.1 進行中セクション（0 件の場合）

- レッスン一覧のページに誘導する表示にしたいです
- 例：デザインスキルの獲得をはじめよう → 身につけるレッスンを探す
- ※例は例です。日本語などはわかりやすいものにしてほしいです・

### 4.2 お気に入りセクション（0 件の場合）

- 記事をお気に入りするとこちらに記事が表示されます、の表記をする。記事画面で使っているお気に入りボタンの「⭐️ アイコン」を使ってほしいです。
- ※例は例です。日本語などはわかりやすいものにしてほしいです・

### 4.3 閲覧履歴セクション（0 件の場合）

- 記事を閲覧した履歴がこちらに表示されます。といった表記をしてほしいです。

### 4.4 Empty State 共通スタイル

以下 Emptystate のブロックの例です。レスポンシブで考えています。

#### 構造

```<div className="self-stretch py-8 bg-black/5 rounded-2xl inline-flex flex-col justify-center items-center gap-3.5">
    <div className="text-center justify-center text-black text-sm font-bold font-['Rounded_Mplus_1c_Bold'] leading-6">記事をお気に入りすると<br/>こちらに表示されます</div>
    <div className="px-2.5 py-[5px] bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-black/10 inline-flex justify-start items-center gap-1">
        <div className="inline-flex flex-col justify-start items-start">
            <div className="justify-center text-slate-950 text-xs font-bold font-['Inter'] leading-6">ボタンがある場合はボタン</div>
        </div>
    </div>
</div>
```

#### Tailwind Styles

```// 記事をお気に入りすると<br/>こちらに表示されます
text-black
text-sm
font-bold
font-['Rounded_Mplus_1c_Bold']
leading-6
---
// ボタンがある場合はボタン
text-slate-950
text-xs
font-bold
font-['Inter']
leading-6
```

---

## 更新履歴

| 日付       | 内容                     |
| ---------- | ------------------------ |
| 2025-12-18 | 初版作成（テンプレート） |
