# レッスンアイテム（item_lesson）- 完全実装仕様書

## 📋 Figma 情報

- **URL**: https://www.figma.com/design/v4tNiQnPCjzSFFDmdcEYSh/%F0%9F%97%BA%EF%B8%8F-guide_2025?node-id=915-4584
- **ノード ID**: 915:4584
- **コンポーネント名**: item_lesson
- **バリアント**: Property 1=Default

---

## 🏗️ コンポーネント構造

```
item_lesson (320px × auto)
└── Overlay
    ├── upper (画像エリア 160px高さ)
    │   └── wrap
    │       └── item/lesson_cover/01 (カバー画像)
    └── Container (情報エリア)
        ├── Frame 3467363
        │   ├── category (カテゴリー)
        │   └── title (タイトル)
        └── description (説明文エリア)
            └── テキスト
```

---

## 📐 完全レイアウト仕様

### ルートコンテナ（item_lesson）

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
overflow: hidden;
cursor: pointer;
transition: all 200ms ease;
```

---

## 🎨 内部構造: Overlay

### コンテナ

```css
display: flex;
flex-direction: column;
width: 100%; /* 親要素いっぱい */
height: auto;
background: rgba(0, 0, 0, 0.04);
```

---

## 🖼️ セクション 1: 画像エリア（upper）

### コンテナ

```css
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
align-self: stretch;
padding: 10.33px; /* 全方向 */
width: 100%;
height: 160px; /* 固定高さ */
background: #ffffff;
border-radius: 12px 12px 0px 0px; /* 上部のみ角丸 */
box-sizing: border-box;
```

**詳細**:

- padding: **10.33px** (すべての辺)
- 高さ: **160px** (固定)
- 背景: **#FFFFFF** (白)
- 角丸: 上部のみ **12px**

---

### 画像ラッパー（wrap）

```css
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
gap: 10px;
width: auto; /* コンテンツに応じて */
height: auto;
border-radius: 0px 8.77px 8.77px 0px; /* 右側のみ角丸 */
box-shadow: 1px 1px 12px 0px rgba(0, 0, 0, 0.24);
```

**シャドウ詳細**:

- offset-x: **1px**
- offset-y: **1px**
- blur: **12px**
- spread: **0px**
- color: **rgba(0, 0, 0, 0.24)**

---

### カバー画像（item/lesson_cover/01）

```css
width: 85.55px; /* 固定 */
height: 128px; /* 固定 */
object-fit: cover;
display: block;
```

**画像情報**:

- imageRef: `7b8dc44738c50aa02d8c263849aff9e7d8691bf5`
- クロップあり
- アスペクト比: 約 **0.67:1** (縦長)

**実装時の注意**:

- 画像は必ずクロップまたは object-fit で処理
- 縦長の書籍カバー風デザイン

---

## 📝 セクション 2: 情報エリア（Container）

### コンテナ

```css
display: flex;
flex-direction: column;
align-self: stretch;
gap: 4px; /* カテゴリー・タイトルと説明文の間隔 */
padding: 16px 20px; /* 上下16px、左右20px */
width: 100%;
background: #f3f3f4; /* 薄いグレー */
box-sizing: border-box;
```

**詳細**:

- padding-top: **16px**
- padding-right: **20px**
- padding-bottom: **16px**
- padding-left: **20px**
- gap: **4px** (カテゴリー・タイトル部分と説明文の間)
- 背景: **#F3F3F4**

---

## 📋 サブセクション: タイトルグループ（Frame 3467363）

### コンテナ

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
width: auto; /* コンテンツに応じて */
height: auto;
margin: 0;
```

**テキスト例**: "情報設計"

**詳細計算**:

- line-height: 13px × 1.938 ≈ **25.2px**
- letter-spacing: 13px × 0.07692 ≈ **1px**

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
height: auto;
margin: 0;
white-space: normal; /* 複数行可能 */
overflow-wrap: break-word;
```

**テキスト例**: "ゼロからはじめる UI 情報設計"

**詳細計算**:

- line-height: 16px × 1.48 ≈ **23.68px**
- letter-spacing: 16px × 0.04688 ≈ **0.75px**

---

## 📝 サブセクション: 説明文エリア（description）

### コンテナ

```css
display: flex;
flex-direction: column;
align-self: stretch;
width: 100%;
```

---

### 説明文テキスト

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
height: auto;
margin: 0;
white-space: normal; /* 複数行 */
overflow-wrap: break-word;
word-break: break-word;
```

**テキスト例**:

```
「どこに何をなぜ置くべきか？」の情報設計基礎
をトレースしながら身につけられます。必須!
```

**詳細計算**:

- line-height: 13px × 1.6 = **20.8px**
- letter-spacing: 13px × 0.07692 ≈ **1px**

**改行処理**:

- 自然な改行（white-space: normal）
- 長い単語は適切に折り返し

---

## 🎨 完全カラーパレット

### 背景色

```css
/* カード */
--card-border: rgba(0, 0, 0, 0.05);
--card-overlay-bg: rgba(0, 0, 0, 0.04);

/* 画像エリア */
--card-image-bg: #ffffff;

/* 情報エリア */
--card-content-bg: #f3f3f4;
```

### テキスト色

```css
/* すべてのテキスト */
--card-text: #151834; /* 濃い青みがかった黒 */
```

**RGB 値**: rgb(21, 24, 52)
**HSL 値**: hsl(234, 42%, 14%)

### シャドウ

```css
--card-image-shadow: 1px 1px 12px 0px rgba(0, 0, 0, 0.24);
--card-hover-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
```

---

## 📏 完全スペーシング仕様

### カード全体

```css
width: 320px; /* 固定 */
border: 1px solid;
border-radius: 12px;
```

### 画像エリア

```css
height: 160px; /* 固定 */
padding: 10.33px; /* 全方向 */
border-radius: 12px 12px 0 0; /* 上部のみ */
```

### カバー画像

```css
width: 85.55px;
height: 128px;
border-radius: 0 8.77px 8.77px 0; /* 右側のみ */
```

### 情報エリア

```css
padding: 16px 20px;
gap: 4px; /* グループ間 */
```

### タイトルグループ

```css
gap: 2px; /* カテゴリーとタイトル間 */
```

---

## 📊 タイポグラフィ完全まとめ

### カテゴリー

```
フォント: Noto Sans JP
サイズ: 13px
ウェイト: 350 (Light)
行間: 25.2px (1.938em)
字間: 1px (7.692%)
色: #151834
```

### タイトル

```
フォント: Noto Sans JP
サイズ: 16px
ウェイト: 700 (Bold)
行間: 23.68px (1.48em)
字間: 0.75px (4.688%)
色: #151834
```

### 説明文

```
フォント: Noto Sans JP
サイズ: 13px
ウェイト: 350 (Light)
行間: 20.8px (1.6em)
字間: 1px (7.692%)
色: #151834
```

---

## 🎭 インタラクション仕様

### デフォルト状態

```css
.item-lesson {
  border: 1px solid rgba(0, 0, 0, 0.05);
  transform: translateY(0);
  box-shadow: none;
  transition: all 200ms ease;
}
```

---

### ホバー状態

```css
.item-lesson:hover {
  transform: translateY(-4px); /* 上に4px浮く */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: rgba(0, 0, 0, 0.1); /* ボーダーを少し濃く */
}

/* 画像も少し拡大（オプション） */
.item-lesson:hover .cover-image {
  transform: scale(1.02);
  transition: transform 300ms ease;
}
```

---

### アクティブ（クリック）状態

```css
.item-lesson:active {
  transform: translateY(-2px); /* ホバーより小さく */
  transition: transform 100ms ease;
}
```

---

### フォーカス状態

```css
.item-lesson:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 12px;
}
```

---

### ローディング状態（オプション）

```css
.item-lesson.loading {
  opacity: 0.6;
  pointer-events: none;
}

.item-lesson.loading .cover-image {
  filter: blur(4px);
}
```

---

## 💻 実装例

### HTML 構造

```html
<article class="item-lesson" data-lesson-id="1">
  <a href="/lessons/1" class="lesson-link">
    <div class="overlay">
      <!-- 画像エリア -->
      <div class="upper">
        <div class="wrap">
          <img
            src="/images/lesson-cover-01.jpg"
            alt="ゼロからはじめるUI情報設計のカバー画像"
            class="cover-image"
            width="85.55"
            height="128"
            loading="lazy"
          />
        </div>
      </div>

      <!-- 情報エリア -->
      <div class="container">
        <div class="title-group">
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
  </a>
</article>
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

interface LessonItemProps {
  lesson: Lesson;
  onClick?: (lessonId: string) => void;
  className?: string;
}

const LessonItem: React.FC<LessonItemProps> = ({
  lesson,
  onClick,
  className = "",
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(lesson.id);
    }
  };

  return (
    <article className={`item-lesson ${className}`} data-lesson-id={lesson.id}>
      <a
        href={`/lessons/${lesson.id}`}
        className="lesson-link"
        onClick={handleClick}
      >
        <div className="overlay">
          {/* 画像エリア */}
          <div className="upper">
            <div className="wrap">
              <img
                src={lesson.coverImage}
                alt={`${lesson.title}のカバー画像`}
                className="cover-image"
                width="85.55"
                height="128"
                loading="lazy"
              />
            </div>
          </div>

          {/* 情報エリア */}
          <div className="container">
            <div className="title-group">
              <p className="category">{lesson.category}</p>
              <h3 className="title">{lesson.title}</h3>
            </div>
            <div className="description">
              <p>{lesson.description}</p>
            </div>
          </div>
        </div>
      </a>
    </article>
  );
};

export default LessonItem;
```

---

### CSS（完全版）

```css
/* カード全体 */
.item-lesson {
  display: flex;
  width: 320px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
  transition: all 200ms ease;
}

.item-lesson .lesson-link {
  display: block;
  width: 100%;
  text-decoration: none;
  color: inherit;
}

.item-lesson:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: rgba(0, 0, 0, 0.1);
}

.item-lesson:active {
  transform: translateY(-2px);
  transition: transform 100ms ease;
}

.item-lesson:focus-within {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Overlay */
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
  overflow: hidden;
}

.item-lesson .cover-image {
  width: 85.55px;
  height: 128px;
  object-fit: cover;
  display: block;
  transition: transform 300ms ease;
}

.item-lesson:hover .cover-image {
  transform: scale(1.02);
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

.item-lesson .title-group {
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
  white-space: normal;
  overflow-wrap: break-word;
}

.item-lesson .description {
  width: 100%;
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
  overflow-wrap: break-word;
  word-break: break-word;
}
```

---

### CSS Modules

```css
/* LessonItem.module.css */
.itemLesson {
  display: flex;
  width: 320px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
  transition: all 200ms ease;
}

.itemLesson:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: rgba(0, 0, 0, 0.1);
}

.lessonLink {
  display: block;
  width: 100%;
  text-decoration: none;
  color: inherit;
}

/* 以下同様... */
```

```typescript
import styles from "./LessonItem.module.css";

<article className={styles.itemLesson}>
  <a href={`/lessons/${lesson.id}`} className={styles.lessonLink}>
    {/* ... */}
  </a>
</article>;
```

---

### Tailwind CSS 版

```html
<article
  class="flex w-80 border border-black/5 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-black/10"
>
  <a href="/lessons/1" class="block w-full no-underline">
    <div class="flex flex-col w-full bg-black/4">
      <!-- 画像エリア -->
      <div
        class="flex justify-center items-center p-[10.33px] w-full h-40 bg-white rounded-t-xl"
      >
        <div
          class="rounded-r-[8.77px] shadow-[1px_1px_12px_0_rgba(0,0,0,0.24)] overflow-hidden"
        >
          <img
            src="/images/cover.jpg"
            alt="カバー画像"
            class="w-[85.55px] h-32 object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>

      <!-- 情報エリア -->
      <div class="flex flex-col gap-1 px-5 py-4 bg-[#F3F3F4]">
        <div class="flex flex-col gap-0.5">
          <p
            class="font-noto-sans-jp text-[13px] font-light leading-[1.938em] tracking-[1px] text-[#151834] m-0"
          >
            情報設計
          </p>
          <h3
            class="font-noto-sans-jp text-base font-bold leading-[1.48em] tracking-[0.75px] text-[#151834] m-0"
          >
            ゼロからはじめるUI情報設計
          </h3>
        </div>
        <div>
          <p
            class="font-noto-sans-jp text-[13px] font-light leading-[1.6em] tracking-[1px] text-[#151834] m-0"
          >
            「どこに何をなぜ置くべきか？」の情報設計基礎をトレースしながら身につけられます。必須!
          </p>
        </div>
      </div>
    </div>
  </a>
</article>
```

---

## ♿ アクセシビリティ仕様

### セマンティック HTML

```html
<article class="item-lesson" role="article">
  <a
    href="/lessons/1"
    aria-labelledby="lesson-title-1"
    aria-describedby="lesson-desc-1"
  >
    <div class="overlay">
      <div class="upper">
        <img
          src="cover.jpg"
          alt="ゼロからはじめるUI情報設計のカバー画像"
          role="img"
        />
      </div>
      <div class="container">
        <p class="category" aria-label="カテゴリー">情報設計</p>
        <h3 id="lesson-title-1" class="title">ゼロからはじめるUI情報設計</h3>
        <div class="description">
          <p id="lesson-desc-1">
            「どこに何をなぜ置くべきか？」の情報設計基礎...
          </p>
        </div>
      </div>
    </div>
  </a>
</article>
```

### キーボード操作

```
Tab: カードにフォーカス
Enter / Space: リンクを開く
```

### スクリーンリーダー対応

- 適切な alt 属性
- aria-labelledby でタイトルと関連付け
- aria-describedby で説明文と関連付け

---

## 📱 レスポンシブ対応

### デスクトップ（1024px 以上）

```css
.item-lesson {
  width: 320px;
}
```

### タブレット（768px〜1024px）

```css
.item-lesson {
  width: 100%;
  max-width: 400px;
}
```

### モバイル（768px 未満）

```css
.item-lesson {
  width: 100%;
  max-width: none;
}

.item-lesson .upper {
  height: 180px; /* 少し高く */
}

.item-lesson .container {
  padding: 20px; /* 左右の余白を増やす */
}

.item-lesson .title {
  font-size: 18px; /* 少し大きく */
}

.item-lesson .description p {
  font-size: 14px; /* 読みやすく */
}
```

---

## 🎯 実装チェックリスト

### 構造

- [ ] ルートコンテナ (320px)
- [ ] Overlay (背景色)
- [ ] 画像エリア (160px 高さ)
  - [ ] ラッパー (シャドウ)
  - [ ] カバー画像 (85.55×128px)
- [ ] 情報エリア
  - [ ] タイトルグループ
    - [ ] カテゴリー
    - [ ] タイトル
  - [ ] 説明文

### スタイリング

- [ ] ボーダー: 1px, rgba(0,0,0,0.05)
- [ ] 角丸: 12px
- [ ] 画像シャドウ
- [ ] フォント: Noto Sans JP
- [ ] カラー: #151834

### インタラクション

- [ ] ホバー: translateY(-4px)
- [ ] ホバー: シャドウ
- [ ] クリック: translateY(-2px)
- [ ] フォーカス: outline

### アクセシビリティ

- [ ] セマンティック HTML
- [ ] alt 属性
- [ ] aria-labels
- [ ] キーボード操作

### レスポンシブ

- [ ] デスクトップ (320px 固定)
- [ ] タブレット (可変)
- [ ] モバイル (100%幅)

---

## 📊 完全な寸法まとめ

```
カード全体:
  幅: 320px (固定)
  ボーダー: 1px solid rgba(0,0,0,0.05)
  角丸: 12px

画像エリア:
  高さ: 160px
  padding: 10.33px
  背景: #FFFFFF
  角丸: 12px 12px 0 0

カバー画像:
  サイズ: 85.55px × 128px
  角丸: 0 8.77px 8.77px 0
  シャドウ: 1px 1px 12px 0 rgba(0,0,0,0.24)

情報エリア:
  padding: 16px 20px
  gap: 4px (グループ間)
  背景: #F3F3F4

タイトルグループ:
  gap: 2px (カテゴリーとタイトル間)

カテゴリー:
  13px, 350, 行間 25.2px, 字間 1px

タイトル:
  16px, 700, 行間 23.68px, 字間 0.75px

説明文:
  13px, 350, 行間 20.8px, 字間 1px
```

---

## 💡 実装の重要ポイント

### 1. フォントウェイト 350

```css
/* Noto Sans JP の Light */
font-weight: 350;

/* フォールバック */
@supports not (font-weight: 350) {
  font-weight: 300;
}
```

### 2. letter-spacing の計算

```
カテゴリー・説明文: 7.692% = 1px (13px × 0.07692)
タイトル: 4.688% = 0.75px (16px × 0.04688)
```

### 3. 画像のアスペクト比維持

```css
.cover-image {
  aspect-ratio: 85.55 / 128;
  object-fit: cover;
}
```

### 4. ホバー時のパフォーマンス

```css
/* GPU加速 */
.item-lesson {
  will-change: transform;
}

/* トランジション最適化 */
transition: transform 200ms ease, box-shadow 200ms ease;
```

---

この仕様書に従えば、レッスンアイテムを完璧に実装できます。
