# BONO ステップカード - スタイル仕様書

- 対象：data-lov-id="src/components/training/StepBlock.tsx:19:4" のブロックです
- data-lov-id="src/components/training/StepBlock.tsx:28:10" は境界線だと思います。この部分は. data-lov-id="src/components/common/DottedSeparator.tsx:28:4"と同じです。使いまわしましょう
- data-lov-id="src/components/training/StepBlock.tsx:19:4" はコンポーネントになっていますか？"進め方ガイド”のセクションブロックの”進め方”の中で使うステップコンポーネントです。
- マークダウンの中のスタイルは変更しなくていいよ。ここは別で調整します。

## デザインシステム変数

```json
{
  "Text/Black": "#0f172a",
  "p-6(24)": "24",
  "Slate/700": "#334155",
  "Spacing/5": "20",
  "Spacing/0": "0",
  "Spacing/12": "48",
  "Border Radius/rounded-3xl": "24",
  "BackGround/light-base": "#f4f4f5",
  "Border/light": "#d4d4d8"
}
```

---

## メインコンテナ (step)

### ボックスモデル

- **幅**: `size-full` (100%)
- **高さ**: `size-full` (100%)
- **パディング**: `48px` (全方向)
- **ポジション**: `relative`

### 背景・ボーダー

- **背景色**: 透明 (指定なし)
- **角丸**: `24px` (rounded-3xl)
- **ボーダー**: `1px solid #d4d4d8` (ライトグレー、絶対配置)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **ギャップ**: `20px` (ヘディングとリスト間)
- **配置**: `align-items: center`, `justify-content: flex-start`

---

## ヘディング説明ブロック (Heading-explainBlock)

### ボックスモデル

- **幅**: `100%`
- **パディング**: `0px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **ギャップ**: `20px` (タイトルと点線の間)
- **配置**: `align-items: flex-start`, `justify-content: center`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## コンテナ部分

### ボックスモデル

- **幅**: `100%`
- **パディング**: `0px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **ギャップ**: `24px`
- **配置**: `align-items: center`, `justify-content: flex-start`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## ブロックテキスト部分

### ボックスモデル

- **幅**: `100%`
- **パディング**: `0px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **ギャップ**: `8px`
- **配置**: `align-items: flex-start`, `justify-content: flex-start`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## 番号付きタイトル

### フォント仕様

- **フォントファミリー**: `Noto Sans JP`
- **フォントウェイト**: `Bold` (700)
- **フォントサイズ**: `18px`
- **行高**: `1.6` (28.8px)
- **文字間隔**: `0.75px`

### 色彩・配置

- **テキスト色**: `#ffffff` (白)
- **テキスト配置**: `text-align: left`
- **幅**: `100%`

### リストスタイル

- **リストタイプ**: `list-style-type: decimal` (数字)
- **開始番号**: `start="1"`
- **マージン左**: `27px` (ms-[27px])

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **配置**: `justify-content: center`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## 点線区切り

### ボックスモデル

- **幅**: `100%`
- **高さ**: `0px`
- **ポジション**: `relative`

### SVG 仕様

- **ポジション**: `absolute`
- **座標**: `top: -2px`, `bottom: 0`, `left: 0`, `right: 0`
- **ストローク色**: `#334155` (スレートグレー)
- **ストローク幅**: `2px`
- **破線パターン**: `strokeDasharray="1 12"` (1px 線、12px 間隔)
- **線端**: `strokeLinecap="round"` (丸い端点)
- **ViewBox**: `0 0 672 2`

### レイアウト

- **Flex**: `flex-shrink: 0` (縮小しない)

---

## リストセクション (lists)

### ボックスモデル

- **幅**: `100%`
- **パディング**: `0px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **配置**: `align-items: flex-start`, `justify-content: flex-start`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## ボトムセクション (bottom)

### ボックスモデル

- **幅**: `100%`
- **パディング**: `0px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **ギャップ**: `20px`
- **配置**: `align-items: flex-start`, `justify-content: center`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## 内部コンテナ

### ボックスモデル

- **幅**: `100%`
- **パディング**: `0px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **ギャップ**: `16px`
- **配置**: `align-items: flex-start`, `justify-content: flex-start`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## 説明文ボトム部分

### ボックスモデル

- **幅**: `100%`
- **パディング**: `0px` (全方向)

### レイアウト

- **Display**: `flex`
- **方向**: `flex-direction: column`
- **ギャップ**: `10px`
- **配置**: `align-items: flex-start`, `justify-content: center`
- **Flex**: `flex-shrink: 0` (縮小しない)

---

## 説明文テキスト

### フォント仕様

- **フォントファミリー**: `Inter`, `Noto Sans JP`
- **フォントウェイト**: `Medium` (500)
- **フォントサイズ**: `16px`
- **行高**: `1.68` (26.88px)

### 色彩・配置

- **テキスト色**: `#0f172a` (ダークグレー)
- **テキスト配置**: `text-align: left`
- **幅**: `100%`

### レイアウト

- **Flex**: `flex-shrink: 0` (縮小しない)

---

## リストアイテム

### リストスタイル

- **リストタイプ**: `list-style-type: disc` (黒丸)
- **マージン左**: `24px` (ms-6)
- **マージン下**: `0px` (mb-0、最初の項目)

### テキストスタイル

- **行高**: `1.68` (26.88px)

---

## リンクスタイル

### 色彩・装飾

- **テキスト色**: `#6b9fff` (ライトブルー)
- **テキスト装飾**: `underline`
- **アンダーライン種類**: `solid`
- **アンダーライン位置**: `from-font`

---

## 色彩仕様

### プライマリーカラー

- **白**: `#ffffff` (タイトルテキスト)
- **ライトグレー**: `#d4d4d8` (ボーダー)

### セカンダリーカラー

- **ダークグレー**: `#0f172a` (説明文テキスト)
- **スレートグレー**: `#334155` (点線)
- **ライトブルー**: `#6b9fff` (リンクテキスト)

---

## フォント仕様

### フォントファミリー階層

```css
/* タイトル用 */
font-family: "Noto Sans JP", sans-serif;

/* 説明文用 */
font-family: "Inter", "Noto Sans JP", sans-serif;
```

### フォントサイズ・行高

- **タイトル**: `18px` / `28.8px` (line-height: 1.6)
- **説明文**: `16px` / `26.88px` (line-height: 1.68)

### フォントウェイト

- **タイトル**: `700` (Bold)
- **説明文**: `500` (Medium)

### 文字間隔

- **タイトル**: `0.75px` (letter-spacing)
- **説明文**: デフォルト

---

## スペーシング仕様

### パディング

- **メインコンテナ**: `48px` (全方向)
- **その他要素**: `0px` (全方向)

### ギャップ

- **メインコンテナ**: `20px` (ヘディングとリスト間)
- **ヘディング内**: `20px` (タイトルと点線間)
- **コンテナ内**: `24px`
- **ブロックテキスト内**: `8px`
- **ボトムセクション内**: `20px`
- **内部コンテナ内**: `16px`
- **説明文ボトム内**: `10px`

### マージン

- **番号付きリスト**: `27px` (左マージン)
- **箇条書きリスト**: `24px` (左マージン)
- **リスト項目**: `0px` (下マージン)

---

## CSS 実装例

```css
.step-card {
  width: 100%;
  height: 100%;
  padding: 48px;
  border: 1px solid #d4d4d8;
  border-radius: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: flex-start;
}

.heading-explain-block {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;
  justify-content: center;
  flex-shrink: 0;
}

.container {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
}

.block-text {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  justify-content: flex-start;
  flex-shrink: 0;
}

.numbered-title {
  font-family: "Noto Sans JP", sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.6;
  letter-spacing: 0.75px;
  color: #ffffff;
  text-align: left;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-shrink: 0;
}

.numbered-title ol {
  list-style-type: decimal;
  margin-left: 27px;
}

.numbered-title li {
  line-height: 1.6;
}

.divider {
  width: 100%;
  height: 0;
  position: relative;
  flex-shrink: 0;
}

.divider svg {
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  stroke: #334155;
  stroke-width: 2px;
  stroke-dasharray: 1 12;
  stroke-linecap: round;
}

.description-text {
  font-family: "Inter", "Noto Sans JP", sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.68;
  color: #0f172a;
  text-align: left;
  width: 100%;
  flex-shrink: 0;
}

.description-text ul {
  list-style-type: disc;
  margin-left: 24px;
}

.description-text li {
  line-height: 1.68;
  margin-bottom: 0;
}

.description-text a {
  color: #6b9fff;
  text-decoration: underline;
  text-decoration-style: solid;
  text-underline-position: from-font;
}

.lists {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  flex-shrink: 0;
}

.bottom {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;
  justify-content: center;
  flex-shrink: 0;
}
```

---

## 特記事項

### 重要なスタイル特性

1. **48px 全方向パディング**: 大きめの内側余白
2. **番号付きリスト**: `list-style-type: decimal`、左マージン 27px
3. **点線区切り**: SVG による破線（1px 線、12px 間隔）
4. **入れ子構造**: 複数の Flex コンテナによる階層的レイアウト
5. **リンク色**: 明るいブルー（#6b9fff）

### Tailwind CSS クラス参照

- `gap-5` = `gap: 20px`
- `gap-6` = `gap: 24px`
- `gap-2.5` = `gap: 10px`
- `p-[48px]` = `padding: 48px`
- `ms-[27px]` = `margin-left: 27px`
- `ms-6` = `margin-left: 24px`
