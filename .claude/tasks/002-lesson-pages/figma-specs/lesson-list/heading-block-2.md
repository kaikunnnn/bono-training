# 2️⃣ セクション見出し（Heading-block_2）

## 📋 Figma 情報

- **URL**: https://www.figma.com/design/v4tNiQnPCjzSFFDmdcEYSh/%F0%9F%97%BA%EF%B8%8F-guide_2025?node-id=913-4566
- **ノード ID**: 913:4566
- **コンポーネント名**: Heading-block_2

---

## 🏗️ 構造

```
Heading-block_2 (1088px)
└── テキスト: "レッスン一覧"
```

---

## 📐 レイアウト仕様

### ルートコンテナ

```css
display: flex;
flex-direction: row;
align-items: center;
gap: 10px;
width: 1088px; /* 固定 */
height: auto; /* コンテンツに応じて */
```

**注意**:

- gap は 10px ですが、現在は単一のテキスト要素のみ
- 将来的にアイコンやボタンを追加する可能性を考慮した設計

---

## 📝 テキスト: "レッスン一覧"

```css
font-family: "Noto Sans JP", sans-serif;
font-size: 20px;
font-weight: 700; /* Bold */
line-height: 1.6em; /* 32px */
letter-spacing: 0.07px; /* 0.352% */
color: #101828;
text-align: left;
vertical-align: top;
margin: 0;
width: auto; /* コンテンツに応じて */
```

**詳細計算**:

- line-height: 20px × 1.6 = **32px**
- letter-spacing: 20px × 0.00352 ≈ **0.07px**

---

## 🎨 カラーパレット

```css
--heading-section: #101828; /* 濃いグレー（ほぼ黒） */
```

**RGB 値**: `rgb(16, 24, 40)`
**HSL 値**: `hsl(220, 43%, 11%)`

---

## 📏 スペーシング仕様

```css
width: 1088px;
gap: 10px; /* 将来的な要素追加用 */
font-size: 20px;
line-height: 32px;
```

---

## 💻 実装例

### HTML 構造

```html
<div class="heading-block-2">
  <h2>レッスン一覧</h2>
</div>
```

**将来的な拡張**:

```html
<div class="heading-block-2">
  <h2>レッスン一覧</h2>
  <button class="filter-button">フィルター</button>
</div>
```

---

### React + TypeScript

```typescript
interface SectionHeadingProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  children,
  action,
  className = "",
}) => {
  return (
    <div className={`heading-block-2 ${className}`}>
      <h2>{children}</h2>
      {action && <div className="action">{action}</div>}
    </div>
  );
};

export default SectionHeading;
```

**使用例**:

```typescript
// シンプルな見出し
<SectionHeading>レッスン一覧</SectionHeading>

// アクション付き見出し
<SectionHeading
  action={<button>フィルター</button>}
>
  レッスン一覧
</SectionHeading>
```

---

### CSS（完全版）

```css
.heading-block-2 {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  width: 1088px;
  box-sizing: border-box;
}

.heading-block-2 h2 {
  font-family: "Noto Sans JP", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.6em;
  letter-spacing: 0.07px;
  color: #101828;
  text-align: left;
  margin: 0;
  padding: 0;
}

/* 将来的なアクション要素用 */
.heading-block-2 .action {
  margin-left: auto;
}
```

---

### Tailwind CSS

```html
<div class="flex flex-row items-center gap-2.5 w-[1088px]">
  <h2
    class="font-noto-sans-jp text-xl font-bold leading-[1.6em] tracking-[0.07px] text-[#101828] m-0"
  >
    レッスン一覧
  </h2>
</div>
```

**アクション付き**:

```html
<div class="flex flex-row items-center gap-2.5 w-[1088px]">
  <h2
    class="font-noto-sans-jp text-xl font-bold leading-[1.6em] tracking-[0.07px] text-[#101828] m-0"
  >
    レッスン一覧
  </h2>
  <button class="ml-auto">フィルター</button>
</div>
```

---

## 📱 レスポンシブ対応

### デスクトップ（1024px 以上）

```css
.heading-block-2 {
  width: 1088px;
}

.heading-block-2 h2 {
  font-size: 20px;
}
```

### タブレット（768px〜1024px）

```css
.heading-block-2 {
  width: 100%;
  max-width: 976px;
  padding: 0 24px;
}

.heading-block-2 h2 {
  font-size: 18px;
}
```

### モバイル（768px 未満）

```css
.heading-block-2 {
  width: 100%;
  padding: 0 16px;
}

.heading-block-2 h2 {
  font-size: 18px;
  line-height: 1.4em;
}
```

---

## ♿ アクセシビリティ

```html
<section aria-labelledby="section-title">
  <div class="heading-block-2">
    <h2 id="section-title">レッスン一覧</h2>
  </div>
  <!-- セクションコンテンツ -->
</section>
```

---

## 🎯 実装チェックリスト

### 構造

- [ ] コンテナ (1088px)
- [ ] flex-direction: row
- [ ] align-items: center
- [ ] gap: 10px
- [ ] h2 要素

### タイポグラフィ

- [ ] フォント: Noto Sans JP
- [ ] サイズ: 20px
- [ ] ウェイト: 700
- [ ] 行間: 1.6em (32px)
- [ ] 字間: 0.07px
- [ ] カラー: #101828

### 拡張性

- [ ] アクション要素用のスペース確保
- [ ] 将来的なレイアウト変更に対応

---

# 📊 2 つのヘッディングの比較

| 項目                 | ページトップ          | セクション見出し   |
| -------------------- | --------------------- | ------------------ |
| **コンポーネント名** | heading-block_pagetop | Heading-block_2    |
| **レイアウト**       | column                | row                |
| **幅**               | 1088px                | 1088px             |
| **フォント**         | Noto Sans JP / Inter  | Noto Sans JP       |
| **h1 サイズ**        | 32px, 700             | -                  |
| **h2 サイズ**        | -                     | 20px, 700          |
| **p サイズ**         | 13px, 400             | -                  |
| **メインカラー**     | #000000               | #101828            |
| **サブカラー**       | rgba(0,0,0,0.79)      | -                  |
| **gap**              | 7px                   | 10px               |
| **用途**             | ページの最上部        | セクションの見出し |

---

## 💡 実装の重要ポイント

### 1. フォントの使い分け

**ページトップ**:

```css
h1: Noto Sans JP
p: Inter
```

**セクション見出し**:

```css
h2: Noto Sans JP;
```

### 2. カラーの微妙な違い

```css
/* ページトップのh1 */
color: #000000; /* 純黒 */

/* セクション見出しのh2 */
color: #101828; /* 濃いグレー */

/* サブタイトル */
color: rgba(0, 0, 0, 0.79); /* 79%透明度 */
```

### 3. 階層構造

```
h1 (32px, 最も大きい) - ページタイトル
  └── p (13px, 説明文) - ページの説明

h2 (20px, 中程度) - セクションタイトル
```

### 4. レイアウトの違い

**ページトップ**: 縦積み（column）

```
┌─────────────┐
│ レッスン      │ h1
│ 説明文...    │ p
└─────────────┘
```

**セクション見出し**: 横並び（row）

```
┌─────────────────────┐
│ レッスン一覧  [アクション] │ h2
└─────────────────────┘
```

---

## 🎨 デザイントークン

### CSS Variables

```css
:root {
  /* ページトップヘッダー */
  --heading-pagetop-width: 1088px;
  --heading-pagetop-gap: 7px;
  --heading-pagetop-h1-size: 32px;
  --heading-pagetop-h1-weight: 700;
  --heading-pagetop-h1-color: #000000;
  --heading-pagetop-p-size: 13px;
  --heading-pagetop-p-weight: 400;
  --heading-pagetop-p-color: rgba(0, 0, 0, 0.79);

  /* セクション見出し */
  --heading-section-width: 1088px;
  --heading-section-gap: 10px;
  --heading-section-h2-size: 20px;
  --heading-section-h2-weight: 700;
  --heading-section-h2-color: #101828;
}
```

---

## 📦 コンポーネントライブラリ化

### React + TypeScript（統合版）

```typescript
// Heading.tsx
interface HeadingProps {
  variant: "pagetop" | "section";
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

const Heading: React.FC<HeadingProps> = ({
  variant,
  title,
  subtitle,
  action,
  className = "",
}) => {
  if (variant === "pagetop") {
    return (
      <div className={`heading-block-pagetop ${className}`}>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    );
  }

  return (
    <div className={`heading-block-2 ${className}`}>
      <h2>{title}</h2>
      {action && <div className="action">{action}</div>}
    </div>
  );
};

export default Heading;
```

**使用例**:

```typescript
// ページトップ
<Heading
  variant="pagetop"
  title="レッスン"
  subtitle="あなたに合った学習コンテンツを見つけよう"
/>

// セクション見出し
<Heading
  variant="section"
  title="レッスン一覧"
/>

// アクション付きセクション見出し
<Heading
  variant="section"
  title="レッスン一覧"
  action={<button>フィルター</button>}
/>
```

---

この仕様書に従えば、2 種類のヘッディング要素を完璧に実装できます。
