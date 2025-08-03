# BONO ヘディング説明ブロック - スタイル仕様書

## デザインシステム変数

```json
{
  "Theme/Primary": "#0d221d",
  "Text/Black": "#0f172a",
  "p-6(24)": "24",
  "Spacing/0": "0",
  "Spacing/8": "32"
}
```

---

## メインコンテナ (heading-explain-block)

### ボックスモデル

- **幅**: `size-full` (100%)
- **パディング**: `0px` (左右) × `32px` (上下)
- **マージン**: なし

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **配置**: `align-items: flex-start`, `justify-content: center`

---

## コンテナ部分

### ボックスモデル

- **幅**: `100%`
- **パディング**: `0px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **ギャップ**: `24px` (タイトル部分と説明部分の間)
- **配置**: `align-items: center`, `justify-content: flex-start`

---

## ブロックテキスト部分

### ボックスモデル

- **幅**: `100%`
- **パディング**: `0px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **ギャップ**: `8px` (タイトルコンテナと説明文の間)
- **配置**: `align-items: flex-start`, `justify-content: flex-start`

---

## タイトルコンテナ

### ボックスモデル

- **幅**: `100%`
- **パディング**: `0px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: row`
- **ギャップ**: `10px` (アイコンとテキストの間)
- **配置**: `align-items: center`, `justify-content: flex-start`

---

## アイコン部分

### サイズ・形状

- **幅**: `10px`
- **高さ**: `10px`
- **形状**: 正方形
- **角丸**: なし

### スタイル

- **背景色**: `#0d221d` (ダークグリーン)
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## タイトルテキスト

### フォント仕様

- **フォントファミリー**: `Noto Sans JP`
- **フォントウェイト**: `Bold` (700)
- **フォントサイズ**: `18px`
- **行高**: `1.6` (28.8px)
- **文字間隔**: `0.75px`

### 色彩

- **テキスト色**: `#ffffff` (白)

### 配置・レイアウト

- **テキスト配置**: `text-align: left`
- **改行**: `white-space: nowrap` (改行なし)
- **Display**: `flex`
- **方向**: `flex-direction: column`
- **配置**: `justify-content: center`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## 説明文部分

### フォント仕様

- **フォントファミリー**: `Inter`, `Noto Sans JP`
- **フォントウェイト**: `Medium` (500)
- **フォントサイズ**: `16px`
- **行高**: `1.68` (26.88px)

### 色彩・透明度

- **テキスト色**: `#0f172a` (ダークグレー)
- **透明度**: `opacity: 0.72`

### 配置・レイアウト

- **幅**: `100%`
- **テキスト配置**: `text-align: left`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## リスト部分

### リストスタイル

- **リストタイプ**: `list-style-type: disc` (黒丸)
- **マージン左**: `24px` (ms-6 相当)

### リスト項目

- **行高**: `1.68` (26.88px)
- **マージン下**: `0px` (最初の項目)

---

## リンクスタイル

### フォント仕様

- **フォントファミリー**: `Inter`, `Noto Sans JP`
- **フォントウェイト**: `Bold` (700)

### 色彩・装飾

- **テキスト色**: `#0e5ff7` (ブルー)
- **テキスト装飾**: `underline`
- **アンダーライン種類**: `solid`
- **アンダーライン位置**: `from-font`
- **アンダーライン飛び越し**: `none`

---

## 色彩仕様

### プライマリーカラー

- **ダークグリーン**: `#0d221d` (アイコン背景)
- **白**: `#ffffff` (タイトルテキスト)

### セカンダリーカラー

- **ダークグレー**: `#0f172a` (説明文、透明度 0.72 適用)
- **ブルー**: `#0e5ff7` (リンクテキスト)

---

## フォント仕様

### フォントファミリー階層

```css
/* タイトル用 */
font-family: "Noto Sans JP", sans-serif;

/* 説明文・リンク用 */
font-family: "Inter", "Noto Sans JP", sans-serif;
```

### フォントサイズ・行高

- **タイトル**: `18px` / `28.8px` (line-height: 1.6)
- **説明文**: `16px` / `26.88px` (line-height: 1.68)

### フォントウェイト

- **タイトル**: `700` (Bold)
- **説明文**: `500` (Medium)
- **リンク**: `700` (Bold)

### 文字間隔

- **タイトル**: `0.75px` (letter-spacing)
- **説明文**: デフォルト

---

## スペーシング仕様

### パディング

- **メインコンテナ**: `0px 32px` (左右 0px、上下 32px)
- **その他要素**: `0px` (全方向)

### ギャップ

- **コンテナ内**: `24px` (タイトルと説明の間)
- **ブロックテキスト内**: `8px` (タイトルコンテナと説明文の間)
- **タイトルコンテナ内**: `10px` (アイコンとテキストの間)

### マージン

- **リスト**: `24px` (左側インデント)
- **リスト項目**: `0px` (下マージン)

---

## CSS 実装例

```css
.heading-explain-block {
  width: 100%;
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.container {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  justify-content: flex-start;
}

.block-text {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  justify-content: flex-start;
}

.title-container {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
}

.icon {
  width: 10px;
  height: 10px;
  background-color: #0d221d;
  flex-shrink: 0;
}

.title-text {
  font-family: "Noto Sans JP", sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.6;
  letter-spacing: 0.75px;
  color: #ffffff;
  text-align: left;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-shrink: 0;
}

.description {
  font-family: "Inter", "Noto Sans JP", sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.68;
  color: #0f172a;
  opacity: 0.72;
  text-align: left;
  width: 100%;
  flex-shrink: 0;
}

.description ul {
  list-style-type: disc;
  margin-left: 24px;
}

.description li {
  line-height: 1.68;
  margin-bottom: 0;
}

.description a {
  font-family: "Inter", "Noto Sans JP", sans-serif;
  font-weight: 700;
  color: #0e5ff7;
  text-decoration: underline;
  text-decoration-style: solid;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
}
```

---

## 特記事項

### 重要なスタイル特性

1. **透明度適用**: 説明文全体に `opacity: 0.72`
2. **改行制御**: タイトルテキストは `white-space: nowrap`
3. **Flex アイテム**: アイコンとタイトルは `flex-shrink: 0`
4. **アンダーライン**: リンクに `text-underline-position: from-font`

### Tailwind CSS クラス参照

- `size-2.5` = `width: 10px; height: 10px`
- `gap-2.5` = `gap: 10px`
- `gap-6` = `gap: 24px`
- `py-8` = `padding: 32px 0`
- `ms-6` = `margin-left: 24px`
