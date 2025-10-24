# レッスン一覧ページ - 完全実装仕様書

## 📋 Figma 情報

### ページ全体

- **URL**: https://www.figma.com/design/v4tNiQnPCjzSFFDmdcEYSh/%F0%9F%97%BA%EF%B8%8F-guide_2025?node-id=913-4134
- **ノード ID**: 913:4134
- **コンポーネント名**: AppLayout > SearchPage

### レッスンカード

- **ノード ID**: 913:4475
- **コンポーネント名**: item_lesson

---

## 🏗️ ページ構造概要

```
AppLayout
└── SearchPage
    ├── heading-block_pagetop (ページヘッダー)
    │   ├── Heading 1: "レッスン"
    │   └── Paragraph: "あなたに合った学習コンテンツを見つけよう"
    └── Primitive.div (メインコンテンツ)
        ├── Heading-block_2: "レッスン一覧"
        └── List (レッスンカードのグリッド)
            ├── item_lesson (カード1)
            ├── item_lesson (カード2)
            └── item_lesson (カード3)
```

---

## 📐 ページレイアウト仕様

### ルートコンテナ（AppLayout）

```css
display: flex;
flex-direction: column;
align-items: center;
padding: 48px 0px;
width: 1324px; /* 固定幅 */
height: auto; /* コンテンツに応じて */
background: rgba(255, 255, 255, 0.2);
```

### ページコンテナ（SearchPage）

```css
display: flex;
flex-direction: column;
justify-content: center;
gap: 40px; /* セクション間の間隔 */
width: auto; /* コンテンツに応じて */
background: rgba(249, 250, 251, 0.3);
```

---

## 🎨 セクション 1: ページヘッダー（heading-block_pagetop）

### コンテナ

```css
display: flex;
flex-direction: column;
gap: 7px; /* 見出しと説明文の間隔 */
width: 1088px; /* 固定 */
```

---

### 1-1. メインタイトル（Heading 1）

#### コンテナ

```css
width: 44.33px;
height: 37.91px;
```

#### テキスト: "レッスン"

```css
font-family: "Noto Sans JP", sans-serif;
font-size: 32px;
font-weight: 700; /* Bold */
line-height: 1em; /* 32px */
letter-spacing: 0.07px; /* 0.22% */
color: #000000;
text-align: left;
width: 129px;
height: 32px;
```

**位置**: 親要素内で (0, -0.5)

---

### 1-2. サブタイトル（Paragraph）

#### コンテナ

```css
width: 240.08px;
height: 21px;
```

#### テキスト: "あなたに合った学習コンテンツを見つけよう"

```css
font-family: "Inter", sans-serif;
font-size: 13px;
font-weight: 400; /* Regular */
line-height: 1.615em; /* 21px */
letter-spacing: -0.076px; /* -0.586% */
color: rgba(0, 0, 0, 0.79); /* 79%透明度 */
text-align: left;
width: 259px;
height: 21px;
```

**位置**: 親要素内で (0, 1)

---

## 🎨 セクション 2: メインコンテンツエリア（Primitive.div）

### コンテナ

```css
display: flex;
flex-direction: column;
gap: 24px; /* 見出しとリストの間隔 */
width: 1088px; /* 固定 */
height: auto;
```

---

### 2-1. セクション見出し（Heading-block_2）

#### コンテナ

```css
display: flex;
flex-direction: row;
align-items: center;
align-self: stretch;
gap: 10px;
width: 100%; /* 親要素いっぱい */
```

#### テキスト: "レッスン一覧"

```css
font-family: "Noto Sans JP", sans-serif;
font-size: 20px;
font-weight: 700; /* Bold */
line-height: 1.6em; /* 32px */
letter-spacing: 0.07px; /* 0.352% */
color: #101828;
text-align: left;
width: auto; /* コンテンツに応じて */
```

---

### 2-2. レッスンカードリスト（List）

#### コンテナ

```css
display: flex;
flex-direction: row;
justify-content: stretch;
align-items: stretch;
flex-wrap: wrap; /* 折り返し */
gap: 20px; /* カード間の間隔 */
width: 1088px; /* 固定 */
height: auto;
```

**計算**:

- カード幅: 320px
- gap: 20px
- 1 行に 3 枚: (320px × 3) + (20px × 2) = 1000px < 1088px ✅

---

## 🎨 レッスンカード（item_lesson）詳細仕様

### カードコンテナ

```css
display: flex;
flex-direction: row;
justify-content: stretch;
align-items: stretch;
gap: 10px;
width: 320px; /* 固定 */
height: auto; /* コンテンツに応じて */
border: 1px solid rgba(0, 0, 0, 0.05);
border-radius: 12px;
box-sizing: border-box;
transition: all 200ms ease;
cursor: pointer;
```

---

### カード構造

```
item_lesson (320px)
└── Overlay
    ├── upper (画像エリア)
    │   └── wrap
    │       └── item/lesson_cover/01 (カバー画像)
    └── Container (情報エリア)
        ├── Frame 3467363
        │   ├── category (カテゴリー)
        │   └── title (タイトル)
        └── description (説明文)
```

---

### カード内部: Overlay

```css
display: flex;
flex-direction: column;
width: 100%;
height: auto;
background: rgba(0, 0, 0, 0.04);
```

---

### 上部エリア（upper）- 画像エリア

#### コンテナ

```css
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
align-self: stretch;
padding: 10.33px;
width: 100%;
height: 160px; /* 固定 */
background: #ffffff;
border-radius: 12px 12px 0px 0px;
```

#### 画像ラッパー（wrap）

```css
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
gap: 10px;
width: auto;
height: auto;
border-radius: 0px 8.77px 8.77px 0px;
box-shadow: 1px 1px 12px 0px rgba(0, 0, 0, 0.24);
```

#### カバー画像（item/lesson_cover/01）

```css
width: 85.55px;
height: 128px;
object-fit: cover;
```

**画像参照**: imageRef: 7b8dc44738c50aa02d8c263849aff9e7d8691bf5

---

### 下部エリア（Container）- 情報エリア

#### コンテナ

```css
display: flex;
flex-direction: column;
align-self: stretch;
gap: 4px; /* カテゴリー・タイトルと説明文の間隔 */
padding: 16px 20px;
width: 100%;
background: #f3f3f4;
```

---

### 情報グループ（Frame 3467363）

#### コンテナ

```css
display: flex;
flex-direction: column;
align-self: stretch;
gap: 2px; /* カテゴリーとタイトルの間隔 */
width: 100%;
```

---

### カテゴリー（category）

```css
font-family: "Noto Sans JP", sans-serif;
font-size: 13px;
font-weight: 350; /* Light */
line-height: 1.938em; /* 25.2px */
letter-spacing: 1px; /* 7.692% */
color: #151834;
text-align: left;
vertical-align: center;
width: auto;
text-transform: none;
```

**テキスト例**: "情報設計"

---

### タイトル（title）

```css
font-family: "Noto Sans JP", sans-serif;
font-size: 16px;
font-weight: 700; /* Bold */
line-height: 1.48em; /* 23.68px */
letter-spacing: 0.75px; /* 4.688% */
color: #151834;
text-align: left;
vertical-align: center;
width: 100%; /* 親要素いっぱい */
```

**テキスト例**: "ゼロからはじめる UI 情報設計"

---

### 説明文エリア（description）

#### コンテナ

```css
display: flex;
flex-direction: column;
align-self: stretch;
width: 100%;
```

#### テキスト

```css
font-family: "Noto Sans JP", sans-serif;
font-size: 13px;
font-weight: 350; /* Light */
line-height: 1.6em; /* 20.8px */
letter-spacing: 1px; /* 7.692% */
color: #151834;
text-align: left;
vertical-align: center;
width: 100%;
white-space: normal; /* 複数行 */
```

**テキスト例**:

```
「どこに何をなぜ置くべきか？」の情報設計基礎
をトレースしながら身につけられます。必須!
```

---

## 🎨 完全カラーパレット

### 背景色

```css
/* ページ */
--page-bg: rgba(255, 255, 255, 0.2);
--section-bg: rgba(249, 250, 251, 0.3);

/* カード */
--card-border: rgba(0, 0, 0, 0.05);
--card-overlay-bg: rgba(0, 0, 0, 0.04);
--card-image-bg: #ffffff;
--card-content-bg: #f3f3f4;
```

### テキスト色

```css
/* ページヘッダー */
--heading-main: #000000;
--heading-sub: rgba(0, 0, 0, 0.79);

/* セクション見出し */
--heading-section: #101828;

/* カード内 */
--card-text: #151834;
```

### シャドウ

```css
--card-image-shadow: 1px 1px 12px 0px rgba(0, 0, 0, 0.24);
```

---

## 📏 完全スペーシング仕様

### ページレベル

```css
--page-padding: 48px 0px;
--section-gap: 40px;
--heading-gap: 7px;
--content-gap: 24px;
```

### カードリスト

```css
--list-width: 1088px;
--list-gap: 20px;
--card-width: 320px;
```

### カード内部

```css
--card-border-radius: 12px;
--card-image-height: 160px;
--card-image-padding: 10.33px;
--card-content-padding: 16px 20px;
--card-content-gap: 4px;
--card-title-gap: 2px;
```

### 画像

```css
--cover-width: 85.55px;
--cover-height: 128px;
--cover-border-radius: 0px 8.77px 8.77px 0px;
```

---

## 📱 レスポンシブ仕様

### デスクトップ（1200px 以上）

```css
.app-layout {
  width: 1324px;
  padding: 48px 0;
}

.search-page {
  width: 1088px;
}

.list {
  grid-template-columns: repeat(3, 320px);
  gap: 20px;
}
```

### タブレット（768px〜1200px）

```css
.app-layout {
  width: 100%;
  max-width: 1024px;
  padding: 40px 24px;
}

.search-page {
  width: 100%;
  max-width: 976px;
}

.list {
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.item-lesson {
  width: 100%;
  max-width: 400px;
}
```

### モバイル（768px 未満）

```css
.app-layout {
  width: 100%;
  padding: 24px 16px;
}

.search-page {
  width: 100%;
  gap: 32px;
}

.heading-block-pagetop {
  width: 100%;
}

.heading-block-pagetop h1 {
  font-size: 24px;
  line-height: 1.2em;
}

.heading-block-pagetop p {
  font-size: 14px;
}

.list {
  grid-template-columns: 1fr;
  gap: 16px;
}

.item-lesson {
  width: 100%;
}
```

---

## 🎭 インタラクション仕様

### カードのホバー

```css
.item-lesson {
  transition: all 200ms ease;
}

.item-lesson:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: rgba(0, 0, 0, 0.1);
}
```

### カードのクリック

```css
.item-lesson:active {
  transform: translateY(-2px);
  transition: transform 100ms ease;
}
```

### カードのフォーカス

```css
.item-lesson:focus-within {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

---

## 💻 実装例

### HTML 構造

```html
<div class="app-layout">
  <div class="search-page">
    <!-- ページヘッダー -->
    <div class="heading-block-pagetop">
      <h1>レッスン</h1>
      <p>あなたに合った学習コンテンツを見つけよう</p>
    </div>

    <!-- メインコンテンツ -->
    <div class="content-section">
      <h2>レッスン一覧</h2>

      <div class="list">
        <!-- レッスンカード -->
        <article class="item-lesson">
          <div class="overlay">
            <div class="upper">
              <div class="wrap">
                <img
                  src="/images/lesson-cover-01.jpg"
                  alt="レッスンカバー画像"
                  class="cover-image"
                />
              </div>
            </div>
            <div class="container">
              <div class="info-group">
                <p class="category">情報設計</p>
                <h3 class="title">ゼロからはじめるUI情報設計</h3>
              </div>
              <div class="description">
                <p>
                  「どこに何をなぜ置くべきか？」の情報設計基礎
                  をトレースしながら身につけられます。必須!
                </p>
              </div>
            </div>
          </div>
        </article>

        <!-- 他のカード... -->
      </div>
    </div>
  </div>
</div>
```

---

### React + TypeScript

```typescript
interface Lesson {
  id: string;
  category: string;
  title: string;
  description: string;
  coverImage: string;
}

interface LessonCardProps {
  lesson: Lesson;
  onClick?: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onClick }) => {
  return (
    <article className="item-lesson" onClick={onClick}>
      <div className="overlay">
        <div className="upper">
          <div className="wrap">
            <img
              src={lesson.coverImage}
              alt={`${lesson.title}のカバー画像`}
              className="cover-image"
            />
          </div>
        </div>
        <div className="container">
          <div className="info-group">
            <p className="category">{lesson.category}</p>
            <h3 className="title">{lesson.title}</h3>
          </div>
          <div className="description">
            <p>{lesson.description}</p>
          </div>
        </div>
      </div>
    </article>
  );
};

interface LessonListPageProps {
  lessons: Lesson[];
}

const LessonListPage: React.FC<LessonListPageProps> = ({ lessons }) => {
  return (
    <div className="app-layout">
      <div className="search-page">
        <div className="heading-block-pagetop">
          <h1>レッスン</h1>
          <p>あなたに合った学習コンテンツを見つけよう</p>
        </div>

        <div className="content-section">
          <h2>レッスン一覧</h2>

          <div className="list">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onClick={() => console.log(`Navigate to /lessons/${lesson.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonListPage;
```

---

### CSS（完全版）

```css
/* ページレイアウト */
.app-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
  width: 1324px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
}

.search-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 40px;
  width: auto;
  background: rgba(249, 250, 251, 0.3);
}

/* ページヘッダー */
.heading-block-pagetop {
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 1088px;
}

.heading-block-pagetop h1 {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 1em;
  letter-spacing: 0.07px;
  color: #000000;
  margin: 0;
}

.heading-block-pagetop p {
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.615em;
  letter-spacing: -0.076px;
  color: rgba(0, 0, 0, 0.79);
  margin: 0;
}

/* メインコンテンツ */
.content-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 1088px;
}

.content-section h2 {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.6em;
  letter-spacing: 0.07px;
  color: #101828;
  margin: 0;
}

/* レッスンリスト */
.list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: stretch;
  gap: 20px;
  width: 1088px;
}

/* レッスンカード */
.item-lesson {
  display: flex;
  width: 320px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 200ms ease;
  box-sizing: border-box;
}

.item-lesson:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: rgba(0, 0, 0, 0.1);
}

.item-lesson:active {
  transform: translateY(-2px);
}

.item-lesson .overlay {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: rgba(0, 0, 0, 0.04);
}

/* 画像エリア */
.item-lesson .upper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10.33px;
  width: 100%;
  height: 160px;
  background: #ffffff;
  border-radius: 12px 12px 0 0;
  box-sizing: border-box;
}

.item-lesson .wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0 8.77px 8.77px 0;
  box-shadow: 1px 1px 12px 0 rgba(0, 0, 0, 0.24);
}

.item-lesson .cover-image {
  width: 85.55px;
  height: 128px;
  object-fit: cover;
  display: block;
}

/* 情報エリア */
.item-lesson .container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px;
  width: 100%;
  background: #f3f3f4;
  box-sizing: border-box;
}

.item-lesson .info-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.item-lesson .category {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 13px;
  font-weight: 350;
  line-height: 1.938em;
  letter-spacing: 1px;
  color: #151834;
  margin: 0;
}

.item-lesson .title {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.48em;
  letter-spacing: 0.75px;
  color: #151834;
  margin: 0;
}

.item-lesson .description p {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 13px;
  font-weight: 350;
  line-height: 1.6em;
  letter-spacing: 1px;
  color: #151834;
  margin: 0;
  white-space: normal;
}

/* レスポンシブ */
@media (max-width: 1200px) {
  .app-layout {
    width: 100%;
    max-width: 1024px;
    padding: 40px 24px;
  }

  .heading-block-pagetop,
  .content-section,
  .list {
    width: 100%;
  }

  .list {
    gap: 20px;
  }

  .item-lesson {
    width: calc(50% - 10px);
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .app-layout {
    padding: 24px 16px;
  }

  .search-page {
    gap: 32px;
  }

  .heading-block-pagetop h1 {
    font-size: 24px;
  }

  .heading-block-pagetop p {
    font-size: 14px;
  }

  .list {
    gap: 16px;
  }

  .item-lesson {
    width: 100%;
    max-width: none;
  }
}
```

---

### Tailwind CSS 版

```html
<div class="flex flex-col items-center py-12 w-[1324px] mx-auto bg-white/20">
  <div class="flex flex-col justify-center gap-10 bg-gray-50/30">
    <!-- ページヘッダー -->
    <div class="flex flex-col gap-[7px] w-[1088px]">
      <h1
        class="font-noto-sans-jp text-[32px] font-bold leading-none tracking-[0.07px] text-black"
      >
        レッスン
      </h1>
      <p
        class="font-inter text-[13px] font-normal leading-[1.615em] tracking-tight text-black/79"
      >
        あなたに合った学習コンテンツを見つけよう
      </p>
    </div>

    <!-- メインコンテンツ -->
    <div class="flex flex-col gap-6 w-[1088px]">
      <h2
        class="font-noto-sans-jp text-xl font-bold leading-[1.6em] tracking-[0.07px] text-[#101828]"
      >
        レッスン一覧
      </h2>

      <div class="flex flex-row flex-wrap gap-5 w-[1088px]">
        <!-- レッスンカード -->
        <article
          class="flex w-80 border border-black/5 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
        >
          <div class="flex flex-col w-full bg-black/4">
            <!-- 画像エリア -->
            <div
              class="flex justify-center items-center p-[10.33px] w-full h-40 bg-white rounded-t-xl"
            >
              <div
                class="rounded-r-[8.77px] shadow-[1px_1px_12px_0_rgba(0,0,0,0.24)]"
              >
                <img
                  src="/images/cover.jpg"
                  alt="カバー"
                  class="w-[85.55px] h-32 object-cover"
                />
              </div>
            </div>

            <!-- 情報エリア -->
            <div class="flex flex-col gap-1 px-5 py-4 bg-[#F3F3F4]">
              <div class="flex flex-col gap-0.5">
                <p
                  class="font-noto-sans-jp text-[13px] font-light leading-[1.938em] tracking-[1px] text-[#151834]"
                >
                  情報設計
                </p>
                <h3
                  class="font-noto-sans-jp text-base font-bold leading-[1.48em] tracking-[0.75px] text-[#151834]"
                >
                  ゼロからはじめるUI情報設計
                </h3>
              </div>
              <p
                class="font-noto-sans-jp text-[13px] font-light leading-[1.6em] tracking-[1px] text-[#151834]"
              >
                「どこに何をなぜ置くべきか？」の情報設計基礎をトレースしながら身につけられます。必須!
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</div>
```

---

## ♿ アクセシビリティ仕様

### セマンティック HTML

```html
<main class="app-layout">
  <section class="search-page">
    <header class="heading-block-pagetop">
      <h1>レッスン</h1>
      <p>あなたに合った学習コンテンツを見つけよう</p>
    </header>

    <section class="content-section">
      <h2>レッスン一覧</h2>

      <div class="list" role="list">
        <article class="item-lesson" role="listitem">
          <!-- カード内容 -->
        </article>
      </div>
    </section>
  </section>
</main>
```

### ARIA 属性

```html
<article class="item-lesson" role="article" aria-labelledby="lesson-title-1">
  <div class="container">
    <h3 id="lesson-title-1" class="title">ゼロからはじめるUI情報設計</h3>
    <!-- ... -->
  </div>
</article>
```

### キーボード操作

```css
.item-lesson:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

---

## 🎯 実装チェックリスト

### ページ構造

- [ ] AppLayout (1324px)
- [ ] SearchPage
- [ ] ページヘッダー
  - [ ] h1: "レッスン"
  - [ ] p: 説明文
- [ ] メインコンテンツ
  - [ ] h2: "レッスン一覧"
  - [ ] レッスンリスト

### レッスンカード

- [ ] 外枠 (320px, border, 角丸 12px)
- [ ] 画像エリア (160px 高さ)
  - [ ] カバー画像 (85.55×128px)
  - [ ] シャドウ
- [ ] 情報エリア
  - [ ] カテゴリー
  - [ ] タイトル
  - [ ] 説明文

### スタイリング

- [ ] フォント (Noto Sans JP, Inter)
- [ ] カラーパレット
- [ ] スペーシング
- [ ] 角丸

### インタラクション

- [ ] ホバー効果
- [ ] クリック効果
- [ ] フォーカス表示

### レスポンシブ

- [ ] デスクトップ (3 列)
- [ ] タブレット (2 列)
- [ ] モバイル (1 列)

### アクセシビリティ

- [ ] セマンティック HTML
- [ ] ARIA 属性
- [ ] キーボード操作

---

## 📊 完全な寸法まとめ

```
ページ:
  幅: 1324px
  padding: 48px 0

コンテンツ:
  幅: 1088px
  gap: 40px

ページヘッダー:
  h1: 32px, 700
  p: 13px, 400
  gap: 7px

セクション:
  h2: 20px, 700
  gap: 24px

レッスンリスト:
  幅: 1088px
  gap: 20px
  カード: 320px × auto

レッスンカード:
  border: 1px, rgba(0,0,0,0.05)
  角丸: 12px
  画像エリア: 160px高さ
  カバー: 85.55×128px
  情報エリア: padding 16px 20px
```

---

この仕様書に従えば、レッスン一覧ページを完璧に実装できます。
