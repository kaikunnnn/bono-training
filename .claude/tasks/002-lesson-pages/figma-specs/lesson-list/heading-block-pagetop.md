# 1️⃣ ページトップヘッダー（heading-block_pagetop）

## 📋 Figma 情報

- **URL**: https://www.figma.com/design/v4tNiQnPCjzSFFDmdcEYSh/%F0%9F%97%BA%EF%B8%8F-guide_2025?node-id=913-4565
- **ノード ID**: 913:4565
- **コンポーネント名**: heading-block_pagetop

---

## 🏗️ 構造

```
heading-block_pagetop (1088px)
├── Heading 1 (メインタイトル)
│   └── テキスト: "レッスン"
└── Paragraph (サブタイトル)
    └── テキスト: "あなたに合った学習コンテンツを見つけよう"
```

---

## 📐 レイアウト仕様

### ルートコンテナ

```css
display: flex;
flex-direction: column;
gap: 7px; /* 見出しと説明文の間隔 */
width: 1088px; /* 固定 */
height: auto; /* コンテンツに応じて */
```

---

## 📝 要素 1: メインタイトル（Heading 1）

### コンテナ

```css
width: 44.33px;
height: 37.91px;
```

### テキスト: "レッスン"

```css
font-family: "Noto Sans JP", sans-serif;
font-size: 32px;
font-weight: 700; /* Bold */
line-height: 1em; /* 32px */
letter-spacing: 0.07px; /* 0.22% */
color: #000000;
text-align: left;
vertical-align: top;
margin: 0;
```

**詳細**:

- 実際の幅: **129px** (テキストコンテンツ)
- 実際の高さ: **32px**
- 位置: 親要素内で **(0, -0.5)**

**計算**:

- line-height: 32px × 1 = **32px**
- letter-spacing: 32px × 0.0022 ≈ **0.07px**

---

## 📝 要素 2: サブタイトル（Paragraph）

### コンテナ

```css
width: 240.08px;
height: 21px;
```

### テキスト: "あなたに合った学習コンテンツを見つけよう"

```css
font-family: "Inter", sans-serif;
font-size: 13px;
font-weight: 400; /* Regular */
line-height: 1.615em; /* 21px */
letter-spacing: -0.076px; /* -0.586% */
color: rgba(0, 0, 0, 0.79); /* 79%の不透明度 */
text-align: left;
vertical-align: top;
margin: 0;
```

**詳細**:

- 実際の幅: **259px** (テキストコンテンツ)
- 実際の高さ: **21px**
- 位置: 親要素内で **(0, 1)**

**計算**:

- line-height: 13px × 1.615 ≈ **21px**
- letter-spacing: 13px × -0.00586 ≈ **-0.076px**

---

## 🎨 カラーパレット

```css
/* メインタイトル */
--heading-main: #000000; /* 純黒 */

/* サブタイトル */
--heading-sub: rgba(0, 0, 0, 0.79); /* 79%透明度 */
```

**RGB 値**:

- メイン: `rgb(0, 0, 0)`
- サブ: `rgba(0, 0, 0, 0.79)` = `rgb(53.55, 53.55, 53.55)`

---

## 📏 スペーシング仕様

```css
/* コンテナ */
width: 1088px;
gap: 7px; /* メインとサブの間隔 */

/* メインタイトル */
font-size: 32px;
line-height: 32px;

/* サブタイトル */
font-size: 13px;
line-height: 21px;
```

---

## 💻 実装例

### HTML 構造

```html
<div class="heading-block-pagetop">
  <h1>レッスン</h1>
  <p>あなたに合った学習コンテンツを見つけよう</p>
</div>
```

---

### React + TypeScript

```typescript
interface PageTopHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const PageTopHeading: React.FC<PageTopHeadingProps> = ({
  title,
  subtitle,
  className = "",
}) => {
  return (
    <div className={`heading-block-pagetop ${className}`}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
};

export default PageTopHeading;
```

**使用例**:

```typescript
<PageTopHeading
  title="レッスン"
  subtitle="あなたに合った学習コンテンツを見つけよう"
/>
```

---

### CSS（完全版）

```css
.heading-block-pagetop {
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 1088px;
  box-sizing: border-box;
}

.heading-block-pagetop h1 {
  font-family: "Noto Sans JP", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 1em;
  letter-spacing: 0.07px;
  color: #000000;
  text-align: left;
  margin: 0;
  padding: 0;
}

.heading-block-pagetop p {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.615em;
  letter-spacing: -0.076px;
  color: rgba(0, 0, 0, 0.79);
  text-align: left;
  margin: 0;
  padding: 0;
}
```

---

### Tailwind CSS

```html
<div class="flex flex-col gap-[7px] w-[1088px]">
  <h1
    class="font-noto-sans-jp text-[32px] font-bold leading-none tracking-[0.07px] text-black m-0"
  >
    レッスン
  </h1>
  <p
    class="font-inter text-[13px] font-normal leading-[1.615em] tracking-tight text-black/79 m-0"
  >
    あなたに合った学習コンテンツを見つけよう
  </p>
</div>
```

---

## 📱 レスポンシブ対応

### デスクトップ（1024px 以上）

```css
.heading-block-pagetop {
  width: 1088px;
}

.heading-block-pagetop h1 {
  font-size: 32px;
}

.heading-block-pagetop p {
  font-size: 13px;
}
```

### タブレット（768px〜1024px）

```css
.heading-block-pagetop {
  width: 100%;
  max-width: 976px;
  padding: 0 24px;
}

.heading-block-pagetop h1 {
  font-size: 28px;
}

.heading-block-pagetop p {
  font-size: 14px;
}
```

### モバイル（768px 未満）

```css
.heading-block-pagetop {
  width: 100%;
  padding: 0 16px;
  gap: 8px;
}

.heading-block-pagetop h1 {
  font-size: 24px;
  line-height: 1.2em;
}

.heading-block-pagetop p {
  font-size: 14px;
  line-height: 1.5em;
}
```

---

## ♿ アクセシビリティ

```html
<header class="heading-block-pagetop" role="banner">
  <h1 id="page-title">レッスン</h1>
  <p id="page-subtitle" aria-describedby="page-title">
    あなたに合った学習コンテンツを見つけよう
  </p>
</header>
```

---

## 🎯 実装チェックリスト

### 構造

- [ ] コンテナ (1088px)
- [ ] gap: 7px
- [ ] h1 要素
- [ ] p 要素

### タイポグラフィ - h1

- [ ] フォント: Noto Sans JP
- [ ] サイズ: 32px
- [ ] ウェイト: 700
- [ ] 行間: 1em
- [ ] 字間: 0.07px
- [ ] カラー: #000000

### タイポグラフィ - p

- [ ] フォント: Inter
- [ ] サイズ: 13px
- [ ] ウェイト: 400
- [ ] 行間: 1.615em
- [ ] 字間: -0.076px
- [ ] カラー: rgba(0,0,0,0.79)

### レスポンシブ

- [ ] デスクトップ対応
- [ ] タブレット対応
- [ ] モバイル対応

---
