# BONO レッスンカード - スタイル仕様書

## デザインシステム変数

```json
{
  "Text/LightBlack": "#475569",
  "Border Radius/rounded-2xl": "16",
  "Text/Black": "#0d0f18",
  "Spacing/5": "20",
  "Spacing/0": "0",
  "Text/bk-100": "#171923",
  "Spacing/1": "4",
  "text-xs/font-bold": "Font(family: \"Noto Sans JP\", style: Bold, size: 12, weight: 700, lineHeight: 16)",
  "Spacing/2": "8",
  "Spacing/8": "32",
  "Spacing/4": "16",
  "Border/light": "#d4d4d8"
}
```

---

## メインコンテナ (lesson)

### ボックスモデル

- **幅**: `size-full` (100%)
- **高さ**: `size-full` (100%)
- **ポジション**: `relative`

### 背景・ボーダー

- **背景色**: `#f4eae3` (ベージュ系)
- **角丸**: `24px` (rounded-3xl)
- **ボーダー**: `1px solid #d4d4d8` (ライトグレー、絶対配置)
- **シャドウ**: `1px 1px 14px 0px rgba(0,0,0,0.04)` (軽いドロップシャドウ)

---

## インナーコンテナ

### ボックスモデル

- **幅**: `size-full` (100%)
- **高さ**: `size-full` (100%)
- **パディング**: `16px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: row`
- **ギャップ**: `32px` (左右ブロック間)
- **配置**: `align-items: center`, `justify-content: flex-start`
- **オーバーフロー**: `overflow: hidden`

---

## 左ブロック (leftblock)

### ボックスモデル

- **幅**: `220px` (固定)
- **高さ**: `125px` (固定)
- **パディング**: `0px` (全方向)

### レイアウト・スタイル

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **ギャップ**: `10px`
- **配置**: `align-items: center`, `justify-content: center`
- **角丸**: `16px` (rounded-2xl)
- **オーバーフロー**: `overflow: hidden`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## 画像サムネイル (image-lesson-thumbnail)

### ボックスモデル

- **幅**: `100%`
- **アスペクト比**: `220/125` (1.76:1)
- **パディング**: `10px` (全方向)

### スタイル

- **背景色**: `#475569` (スレートグレー)
- **Display**: `flex`
- **方向**: `flex-direction: row`
- **ギャップ**: `10px`
- **配置**: `align-items: center`, `justify-content: center`
- **オーバーフロー**: `overflow: hidden`
- **Flex**: `flex-shrink: 0` (縮小しない)

### 内部画像

- **幅**: `220px`
- **高さ**: `124px`
- **背景**: `background-size: cover`, `background-position: center`, `background-repeat: no-repeat`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## 右ブロック (rightblock)

### ボックスモデル

- **パディング**: `0px` (全方向)
- **最小幅**: `1px`
- **最小高**: `1px`

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **ギャップ**: `4px` (詳細ブロックとボタンの間)
- **配置**: `align-items: flex-start`, `justify-content: flex-start`
- **Flex**: `flex: 1 1 0%` (伸縮可能)

---

## 詳細ブロック (detail block)

### ボックスモデル

- **幅**: `100%`
- **高さ**: `61px` (固定)
- **パディング**: `0px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **ギャップ**: `4px` (タイトルと説明の間)
- **配置**: `align-items: flex-start`, `justify-content: flex-start`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## ヘディング説明ブロック (Heading-explainBlock)

### ボックスモデル

- **幅**: `100%`
- **パディング**: `0px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: row`
- **ギャップ**: `20px`
- **配置**: `align-items: center`, `justify-content: flex-start`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## レッスンタイトル (lessontitle)

### ボックスモデル

- **パディング**: `0px` (全方向)
- **最小幅**: `1px`
- **最小高**: `1px`

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: row`
- **ギャップ**: `8px`
- **配置**: `align-items: flex-start`, `justify-content: flex-start`
- **Flex**: `flex: 1 1 0%` (伸縮可能)

---

## タイトルテキスト

### フォント仕様

- **フォントファミリー**: `Noto Sans JP`
- **フォントウェイト**: `Bold` (700)
- **フォントサイズ**: `18px`
- **行高**: `1.6` (28.8px)
- **文字間隔**: `0.75px`

### 色彩・配置

- **テキスト色**: `#ffffff` (白)
- **テキスト配置**: `text-align: left`
- **改行**: `white-space: nowrap` (改行なし)
- **Display**: `flex`
- **方向**: `flex-direction: column`
- **配置**: `justify-content: center`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## 説明テキスト

### フォント仕様

- **フォントファミリー**: `Inter`, `Noto Sans JP`
- **フォントウェイト**: `Medium` (500)
- **フォントサイズ**: `16px`
- **行高**: `1.68` (26.88px)

### 色彩・配置

- **テキスト色**: `#171923` (ダークグレー)
- **テキスト配置**: `text-align: left`
- **幅**: `100%`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## ボタンデザイン (button のようなデザイン)

### ボックスモデル

- **パディング**: `0px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: row`
- **配置**: `align-items: center`, `justify-content: flex-start`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## アプライボタン (Apply Button)

### ボックスモデル

- **パディング**: `0px` (左右) × `4px` (上下)

### レイアウト・スタイル

- **Display**: `flex`
- **方向**: `flex-direction: row`
- **ギャップ**: `8px` (テキストとアロー間)
- **配置**: `align-items: center`, `justify-content: center`
- **角丸**: `9999px` (完全な丸角)
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## ボタンテキスト

### フォント仕様

- **フォントファミリー**: `Noto Sans JP`
- **フォントウェイト**: `Bold` (700)
- **フォントサイズ**: `12px`
- **行高**: `16px` (1.33)

### 色彩・配置

- **テキスト色**: `#171923` (ダークグレー)
- **テキスト配置**: `text-align: left`
- **改行**: `white-space: nowrap` (改行なし)
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## アロー部分

### ボックスモデル・スタイル

- **角丸**: `416.667px` (円形)
- **Flex**: `flex-shrink: 0` (縮小しない)

### 内部コンテナ

- **Display**: `flex`
- **方向**: `flex-direction: row`
- **ギャップ**: `4.167px`
- **配置**: `align-items: flex-start`, `justify-content: flex-start`
- **パディング**: `5px` (全方向)
- **オーバーフロー**: `overflow: hidden`

### SVG アイコン

- **サイズ**: `6.25px × 6.25px`
- **色**: `#0d221d` (ダークグリーン)
- **Flex**: `flex-shrink: 0` (縮小しない)

### アローボーダー

- **ボーダー**: `1.25px solid #0d221d`
- **角丸**: `416.667px` (円形)
- **ポジション**: `absolute` (全体に重なる)
- **インタラクション**: `pointer-events: none`

---

## 色彩仕様

### プライマリーカラー

- **ベージュ**: `#f4eae3` (メイン背景)
- **白**: `#ffffff` (タイトルテキスト)
- **ダークグリーン**: `#0d221d` (アロー)

### セカンダリーカラー

- **スレートグレー**: `#475569` (画像背景)
- **ダークグレー**: `#171923` (説明文、ボタンテキスト)
- **ライトグレー**: `#d4d4d8` (ボーダー)

### シャドウ

- **ドロップシャドウ**: `rgba(0,0,0,0.04)` (1px 1px 14px 0px)

---

## フォント仕様

### フォントファミリー階層

```css
/* タイトル・ボタンテキスト用 */
font-family: "Noto Sans JP", sans-serif;

/* 説明文用 */
font-family: "Inter", "Noto Sans JP", sans-serif;
```

### フォントサイズ・行高

- **タイトル**: `18px` / `28.8px` (line-height: 1.6)
- **説明文**: `16px` / `26.88px` (line-height: 1.68)
- **ボタンテキスト**: `12px` / `16px` (line-height: 1.33)

### フォントウェイト

- **タイトル**: `700` (Bold)
- **説明文**: `500` (Medium)
- **ボタンテキスト**: `700` (Bold)

### 文字間隔

- **タイトル**: `0.75px` (letter-spacing)
- **その他**: デフォルト

---

## スペーシング仕様

### パディング

- **メインコンテナ**: `16px` (全方向)
- **画像サムネイル**: `10px` (全方向)
- **アプライボタン**: `0px 4px` (左右 0px、上下 4px)
- **アロー内部**: `5px` (全方向)

### ギャップ

- **インナーコンテナ**: `32px` (左右ブロック間)
- **左ブロック内**: `10px`
- **右ブロック内**: `4px` (詳細とボタン間)
- **詳細ブロック内**: `4px` (タイトルと説明間)
- **ヘディング内**: `20px`
- **レッスンタイトル内**: `8px`
- **アプライボタン内**: `8px` (テキストとアロー間)
- **アロー内**: `4.167px`

### 固定サイズ

- **左ブロック**: `220px × 125px`
- **内部画像**: `220px × 124px`
- **詳細ブロック高**: `61px`
- **アローサイズ**: `6.25px × 6.25px`

---

## CSS 実装例

```css
.lesson-card {
  width: 100%;
  height: 100%;
  background-color: #f4eae3;
  border-radius: 24px;
  position: relative;
  border: 1px solid #d4d4d8;
  box-shadow: 1px 1px 14px 0px rgba(0, 0, 0, 0.04);
}

.lesson-inner {
  width: 100%;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: row;
  gap: 32px;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
}

.left-block {
  width: 220px;
  height: 125px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
}

.image-thumbnail {
  width: 100%;
  aspect-ratio: 220/125;
  background-color: #475569;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumbnail-image {
  width: 220px;
  height: 124px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
}

.right-block {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  justify-content: flex-start;
  min-height: 1px;
  min-width: 1px;
}

.detail-block {
  width: 100%;
  height: 61px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  justify-content: flex-start;
}

.lesson-title {
  font-family: "Noto Sans JP", sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.6;
  letter-spacing: 0.75px;
  color: #ffffff;
  text-align: left;
  white-space: nowrap;
  flex-shrink: 0;
}

.lesson-description {
  font-family: "Inter", "Noto Sans JP", sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.68;
  color: #171923;
  text-align: left;
  width: 100%;
}

.apply-button {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
  border-radius: 9999px;
}

.button-text {
  font-family: "Noto Sans JP", sans-serif;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  color: #171923;
  text-align: left;
  white-space: nowrap;
}

.arrow-container {
  border-radius: 416.667px;
  padding: 5px;
  border: 1.25px solid #0d221d;
}

.arrow-icon {
  width: 6.25px;
  height: 6.25px;
  fill: #0d221d;
}
```
