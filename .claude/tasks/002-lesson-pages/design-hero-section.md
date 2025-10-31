# ヒーローセクション - デザイン仕様

## Figma の URL

https://www.figma.com/design/v4tNiQnPCjzSFFDmdcEYSh/%F0%9F%97%BA%EF%B8%8F-guide_2025?node-id=923-4966&t=8KUlYZGhAZ4geioC-4

## 全体構成 Figma MCP server

# ヒーローセクション - デザインスペック

---

# ブロック 1️⃣: グラデーション＆ナビゲーション領域

**フレーム ID:** `923:4962` (gradation_area)

## 📐 全体仕様

| 項目       | 値                       |
| ---------- | ------------------------ |
| 幅         | 100% (ストレッチ)        |
| 高さ       | 216px (固定)             |
| 方向       | 列 (Column)              |
| ギャップ   | 10px                     |
| パディング | 32px (上下) × 0px (左右) |

---

## 🎨 背景グラデーション

```css
Fill - レイヤー構成:
- レイヤー 1: rgba(0, 0, 0, 0.2)
  → 半透明黒オーバーレイ（全体に適用）

- レイヤー 2: linear-gradient(
    252deg,
    rgba(253, 251, 245, 0.88) 15%,   /* 左上：クリーム色 */
    rgba(244, 232, 223, 1) 55%,      /* 中央：ベージュ */
    rgba(239, 237, 255, 0.08) 94%    /* 右下：薄紫 */
  )
```

**設定:**

- 角度: **252deg** (北西から南東方向)
- ブレンドモード: 通常

---

## 🧭 ナビゲーション層

**フレーム:** navigation (自動 ID: 923:4969)

### レイアウト

```css
Layout Mode: Column
Gap: 10px
Padding: 0px 28px
Width: 1330px (固定)
Height: 44px (固定)
```

### バックナビゲーション (back-nav)

**構造:**

```
back-nav (レイアウト: Row)
├─ arrow-left (ブール演算, 10.16 × 10.16px)
│  ├─ Vector 1: 8.75px × 0.14px (ストローク: #FFF, 1.25px)
│  └─ Vector 2: 4.52px × 8.82px (ストローク: #FFF, 1.25px)
│
└─ test (テキストコンテナ, レイアウト: Row)
   └─ training-type (テキスト)
```

**テキスト: "トレーニング一覧"**

**テキストスタイル:**

```css
Font Family: Rounded Mplus 1c Bold
Font Weight: 700
Font Size: 14px
Line Height: 1em
Letter Spacing: 5.36%
Text Align: LEFT
Color: #909090 (グレー)
```

**矢印スタイル:**

```css
Color: #0D221D (ダークグリーン)
Stroke: #FFFFFF (白)
Stroke Width: 1.25px
```

---

---

# ブロック 2️⃣: レッスン詳細情報領域

**フレーム ID:** `923:4927` (detail_hero)

## 📐 全体仕様

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| 幅         | 100% (ストレッチ)                   |
| 高さ       | 自動 (Hug)                          |
| 方向       | 列 (Column)                         |
| 配置       | 中央 (center)                       |
| ギャップ   | 20px                                |
| パディング | 112px (上) × 0px (左右) × 48px (下) |
| 背景       | #FFFFFF (白)                        |

---

## 📝 タイトル

**テキスト内容:**

```
社内で使う本貸し出しシステムのデザイン
```

**レイアウト:**

```css
Width: 100% (Fill)
Height: Auto (Hug)
```

**スタイル:**

```css
Font Family: Rounded Mplus 1c Bold
Font Weight: 700
Font Size: 32px
Line Height: 1.49em
Letter Spacing: 2.34%
Text Alignment: CENTER
Color: #0D221D (ダークグリーン)
```

---

## 📄 説明文

**テキスト内容:**

```
設定された「社内本貸し出しシステム」の内容をもとにサービスのデザインをゼロから行いましょう。
期限が曖昧だったり、今どこにその本があるのかわからない、という現状を解決するサービスを作ろう。
```

**レイアウト:**

```css
Width: 720px (固定)
Height: Auto (Hug)
```

**スタイル:**

```css
Font Family: Rounded Mplus 1c Regular
Font Weight: 400
Font Size: 16px
Line Height: 1.6em
Letter Spacing: 6.25%
Text Alignment: CENTER
Color: #0D221D (ダークグリーン)
```

---

## 🏷️ 情報ブロックコンテナ

**フレーム:** wrap (ID: 923:4935)

### レイアウト

```css
Layout Mode: Row
Justify Content: Center
Align Items: Center
Wrap: True
Gap: 17px
Height: Auto (Hug)
```

### 個別ブロック仕様

**各ブロック (info-block インスタンス):**

```css
Layout Mode: Row
Align Items: Center
Gap: 6px
Height: Auto (Hug)
Component: 923:4882 (info-block)
```

#### ブロック構成

**ブロック 1:**

- ラベル: "カテゴリ" → 内容: "情報設計"

**ブロック 2:**

- ラベル: "ロードマップ" → 内容: "UIUX デザイナー転職フェーズ 3"

**ブロック 3:**

- ラベル: "レベル"
  - 内容 1: "未経験"
  - 内容 2: "ジュニア"

### ラベルボックス (label-block)

**レイアウト:**

```css
Layout Mode: Row
Justify Content: Center
Align Items: Center
Gap: 10px
Padding: 2px
Background: #F6F6F6 (ライトグレー)
```

**ラベルテキスト:**

```css
Font Family: Noto Sans JP Regular
Font Weight: 400
Font Size: 10px
Line Height: 1em
Text Align: LEFT
Color: #878787 (グレー)
```

### リンクブロック (link-block)

**レイアウト:**

```css
Layout Mode: Row
Justify Content: Center
Align Items: Center
Gap: 10px
```

**リンクテキスト:**

```css
Font Family: Noto Sans JP Regular
Font Weight: 400
Font Size: 12px
Line Height: 1em
Letter Spacing: 6.25%
Text Align: LEFT
Color: #000000 (黒)
```

---

## 🔘 CTA ボタン

**フレーム:** button/primary (ID: 923:4939)

**コンポーネント参照:** `765:19157` (button/primary)

### ボタン構成

```
button/primary (インスタンス)
├─ Icon (SVG) - Check_Big
│  └─ Component: 765:19206
│  └─ Size: 18px × 18px
│
└─ テキスト: "スタートする"
```

### レイアウト

```css
Layout Mode: Row
Justify Content: Center
Align Items: Center
Gap: 4px
Padding: 8px 12px
Border Radius: 1000px (完全丸形ボタン)
```

### スタイル

```css
Background: #000000 (黒)
Border: なし
```

### テキストスタイル

```css
Font Family: Noto Sans JP
Font Weight: 700
Font Size: 14px
Line Height: 1.428em
Letter Spacing: -1.074%
Text Align: LEFT
Color: #FFFFFF (白)
```

---

## 🎭 デコレーティブアイコン

**フレーム:** icon (ID: 923:4928)

### レイアウト

```css
Position: Absolute
Top: -120px (上にはみ出す)
Left: 603.5px (ほぼ中央)
Width: 123px
Height: 184px
Border Radius: 0px 4px 4px 0px (右側のみ丸)
```

### スタイル

```css
Fill: 画像 (imageRef: 7b8dc44738c50aa02d8c263849aff9e7d8691bf5)
Scale Mode: STRETCH
Object Fit: fill
```

### エフェクト

```css
Box Shadow: 1px 1px 13.56px 0px rgba(0, 0, 0, 0.33)
```

---

## 🎯 重要な設計ポイント

### ブロック 1 (グラデーション領域)

- **役割**: 背景とバックナビゲーションを表示
- **高さ固定**: 216px で必ず維持
- **グラデーション角度**: 252deg（設計者の意図を保持）
- **パディング**: 上下 32px で視覚的な余裕

### ブロック 2 (詳細情報領域)

- **役割**: コンテンツの詳細を中央配置で表示
- **背景**: 純白 (#FFFFFF) で文字が読みやすい
- **中央配置**: すべてのコンテンツが中央に配置される
- **アイコン配置**: 絶対配置で上にはみ出し、デザイン的なアクセント

---

## 💾 CSS Variables (推奨)

```css
/* Gradation Area */
--gradation-height: 216px;
--gradation-padding-vertical: 32px;
--gradation-gradient-angle: 252deg;

/* Detail Hero Area */
--detail-hero-padding-top: 112px;
--detail-hero-padding-bottom: 48px;
--detail-hero-bg: #ffffff;

/* Typography */
--title-size: 32px;
--title-weight: 700;
--desc-size: 16px;
--desc-weight: 400;
--nav-size: 14px;
--label-size: 10px;
--button-text-size: 14px;

/* Colors */
--text-primary: #0d221d;
--text-secondary: #909090;
--label-bg: #f6f6f6;
--label-text: #878787;
--button-bg: #000000;
--button-text: #ffffff;

/* Spacing */
--info-gap: 17px;
--button-gap: 4px;
--button-padding: 8px 12px;

/* Border Radius */
--button-radius: 1000px;
--icon-radius: 0px 4px 4px 0px;

/* Effects */
--icon-shadow: 1px 1px 13.56px 0px rgba(0, 0, 0, 0.33);
```

---

## 🔗 参照コンポーネント

| コンポーネント | ID          | 用途                       |
| -------------- | ----------- | -------------------------- |
| Button Primary | `765:19157` | CTA ボタン本体             |
| Icon Check_Big | `765:19206` | ボタン内のチェックアイコン |
| Info Block     | `923:4882`  | 情報タグコンポーネント     |
