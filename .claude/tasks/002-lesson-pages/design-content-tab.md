# コンテンツタブ：クエスト＋記事一覧 - デザイン仕様

## 全体構成

# コンテンツタブ：クエスト＋コンテンツ一覧 - デザインスペック

---

# セクション 1️⃣: 見出し部分

**フレーム ID:** `933:5208` (heading)

## 📐 全体仕様

| 項目     | 値                |
| -------- | ----------------- |
| 幅       | 100% (ストレッチ) |
| 高さ     | 自動 (Hug)        |
| 方向     | 行 (Row)          |
| 配置     | 左揃え            |
| ギャップ | 10px              |

---

## 📝 見出しテキスト

**テキスト内容:**

```
デザインの旅を進めよう
```

### スタイル

```css
Font Family: Noto Sans JP
Font Weight: 700 (Bold)
Font Size: 20px
Line Height: 1.6em
Text Alignment: LEFT
Text Vertical: CENTER
Color: #151834 (ダークネイビー)
```

### 配置

```css
Align Items: Center
Align Self: Stretch
```

---

---

# セクション 2️⃣: クエスト 1 つ分のデザイン

**コンポーネント ID:** `866:14023` (quest component)

## 📐 全体仕様

| 項目     | 値                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------- |
| 幅       | 768px (固定 → デスクトップ表示のみ) ※768 はタブとクエスト、概要・目的エリアのデスクトップ時の固定幅 |
| 高さ     | 自動 (Hug)                                                                                          |
| 方向     | 列 (Column)                                                                                         |
| ギャップ | 11px                                                                                                |

---

## 🏗️ 構造

```
quest component (幅768px)
├─ numberoftraining (クエスト番号ブロック)
│  ├─ check_quest_is_all_done_or_not (✅アイコン)
│  └─ quest_number_block
│     ├─ ラベル: "クエスト"
│     └─ 番号: "01"
│
└─ training-detail (クエストメインカード)
   ├─ line_block (左側の区切り線)
   └─ task-training-card (カードコンテンツ)
      ├─ heading (ヘッダー部分)
      │  ├─ left (左側：タイトルと詳細)
      │  └─ arrow (右側：矢印アイコン)
      │
      └─ wrap_content (コンテンツ一覧)
         ├─ item-content (記事アイテム 01)
         ├─ item-content (記事アイテム 02)
         └─ item-content (記事アイテム 03)
```

---

## 🎯 クエスト番号ブロック

**レイアウト:** Row, alignItems: center, gap: 20px

### ✅ チェックアイコン (check_quest_is_all_done_or_not)

```css
Size: 16 × 16px
Background: #F3F3F3 (ライトグレー)
Border: 1px rgba(0, 0, 0, 0.04)
Border Radius: 40px (完全丸形)

/* 内部構造 */
Layout: Row, justify-content: center, align-items: center
Gap: 10px
```

**用途:** クエスト全体の完了状況を表示

### クエスト番号ブロック (quest_number_block)

**レイアウト:** Row, alignItems: center, gap: 4px

**ラベル部分:**

```css
Text: "クエスト"
Font Family: Noto Sans JP
Font Weight: 400
Font Size: 12px
Line Height: 1em
Text Align: CENTER
Color: #0D221D (ダークグリーン)
Border: 0.1px #000000
```

**番号部分:**

```css
Text: "01" (例)
Font Family: Luckiest Guy
Font Weight: 400
Font Size: 13px
Line Height: 1em
Text Align: CENTER
Color: #0D221D
Width: 14px, Height: 10px
```

---

## 🎴 メインカード (task-training-card)

**レイアウト:** Column, justify-content: center, align-items: center

**仕様:**

```css
Width: 743px (固定)
Height: Auto (Hug)
Background: #FFFFFF (白)
Border: 1px rgba(0, 0, 0, 0.06)
Border Radius: 24px
Box Shadow: 1px 1px 4px 0px rgba(0, 0, 0, 0.08)
```

---

## 📌 ヘッダー部分 (heading)

**レイアウト:** Row, alignItems: center, gap: 8px

**仕様:**

```css
Width: 100% (Fill)
Height: Auto (Hug)
Padding: 20px 32px
Border Bottom: 1px #EEEEEE
```

### 左側コンテンツ (left)

**レイアウト:** Column, gap: 3px

#### タイトル (quest_title)

```css
Text: "社内本貸し出しシステムをデザインしよう"
Font Family: Noto Sans JP
Font Weight: 700
Font Size: 16px
Line Height: 1.4em
Text Alignment: LEFT
Color: #151834 (ダークネイビー)
Width: 100% (Fill)
```

#### 説明文 (quest_detail)

```css
Text: "ユーザーインタビューでリアルな課題を発見して、解決するプロトタイプをデザインするお題です"
Font Family: Inter
Font Weight: 500
Font Size: 14px
Line Height: 1.85em
Text Alignment: LEFT
Color: #6F7178 (グレー)
Width: 100% (Fill)
```

#### メタ情報ブロック (Frame 625843)

**レイアウト:** Row, gap: 12px

##### 目安ブロック (quest_done_time)

```css
Layout: Row, align-items: center, gap: 4px
Background: #FFFFFF (白)
Border Radius: 30px
Padding: (デフォルト)

ラベル: "目安"
内容: "1日"
Font Style: JP/Body/Caption
  - Font Family: Noto Sans
  - Font Weight: 400
  - Font Size: 12px
  - Line Height: 1.6em
  - Letter Spacing: 8.33%
  - Color: #7D8691 (ダークグレー)
```

##### 完了数ブロック (estimate duration)

```css
Layout: Row, align-items: center, gap: 4px
Background: #FFFFFF (白)
Border Radius: 30px

ラベル: "完了数"
内容: "1/4"
Font Style: JP/Body/Caption
  - Color: #7D8691
```

### 右側：矢印アイコン (arrow)

**コンポーネント参照:** `772:19635` (arrow component)

```css
Variant: direction=right, Level=secondary
Layout: Row, gap: 6.67px, padding: 8px
Width: Auto (Hug)
Height: Auto (Hug)
Border: 2px #0D221D
Border Radius: 666.67px (ほぼ完全丸形)

内部 Union (ブール演算):
  - Size: 10 × 10px
  - Fill: #0D221D
```

---

## 📚 コンテンツ一覧 (wrap_content)

**レイアウト:** Column, alignSelf: stretch

**仕様:**

```css
Width: 100% (Fill)
Height: Auto (Hug)
Gap: 5px
Padding: 12px 32px
```

### コンテンツアイテム (item-content インスタンス)

**コンポーネント:** `866:14103` (item-content)

**内容:**

- 記事番号 (content_number): "01", "02", "03"
- サムネイル: 57 × 32px
- タイトル: "学ぶものとつくるものを把握しよう"
- 動画時間: "20 分"

※ 詳細は下記「セクション 3️⃣」を参照

---

---

# セクション 3️⃣: 記事アイテムコンポーネント

**コンポーネント ID:** `866:14103` (item-content)

**コンポーネントセット ID:** `879:3129` (item-content)

## 📐 全体仕様

| 項目         | 値                      |
| ------------ | ----------------------- |
| 幅           | 679px (固定)            |
| 高さ         | 自動 (Hug)              |
| 方向         | 行 (Row)                |
| 配置         | アイテム中央            |
| ギャップ     | 16px                    |
| パディング   | 6px (上下) × 0px (左右) |
| ボーダー半径 | 8px                     |

---

## 🏗️ 構造

```
item-content (記事アイテムコンポーネント)
├─ content_number
│  └─ テキスト: "01"
│
└─ Container
   ├─ img_thumbnail (サムネイル画像)
   │  └─ 57 × 32px
   │
   └─ Container_content_title (テキスト情報)
      ├─ title (記事タイトル)
      └─ content_video_durariton (動画時間)
```

---

## 📍 左側：記事番号 (content_number)

**テキスト:** "01" (順序番号)

### スタイル

```css
Font Family: Inter
Font Weight: 700 (Bold)
Font Size: 10px
Line Height: 1.4em
Text Alignment: LEFT
Text Vertical: CENTER
Color: #414141 (ダークグレー)
```

---

## 🖼️ 中央部分 (Container)

**レイアウト:** Row, alignItems: center, gap: 13px

### サムネイル画像 (img_thumbnail)

```css
Width: 57px (固定)
Height: 32px (固定)
Background: #E0DFDF (ライトグレー、プレースホルダー)
Border Radius: 3.17px (微かに丸い角)
```

### テキスト情報 (Container_content_title)

**レイアウト:** Row, justifyContent: space-between, alignItems: center

```css
Width: 100% (Fill)
Height: 20px (固定)
```

#### タイトル (title)

**テキスト:** "学ぶものとつくるものを把握しよう"

```css
Font Family: Noto Sans JP
Font Weight: 500 (Medium)
Font Size: 13px
Line Height: 1.538em
Text Alignment: LEFT
Text Vertical: CENTER
Color: #5A5A5A (ミディアムグレー)
```

#### 動画時間 (content_video_durariton)

**テキスト:** "20 分"

```css
Font Family: Inter
Font Weight: 500 (Medium)
Font Size: 11px
Line Height: 1.818em
Text Alignment: LEFT
Text Vertical: CENTER
Color: #8C8C8C (ライトグレー)
```

---

## 💾 CSS Variables (推奨)

### 見出し

```css
--heading-font-size: 20px;
--heading-font-weight: 700;
--heading-color: #151834;
```

### クエスト番号

```css
--quest-number-label-font-size: 12px;
--quest-number-label-color: #0d221d;
--quest-number-font-family: "Luckiest Guy";
--quest-number-size: 13px;
--quest-check-icon-size: 16px;
--quest-check-bg: #f3f3f3;
```

### メインカード

```css
--card-width: 743px;
--card-bg: #ffffff;
--card-border: rgba(0, 0, 0, 0.06);
--card-border-radius: 24px;
--card-box-shadow: 1px 1px 4px 0px rgba(0, 0, 0, 0.08);
--card-padding-horizontal: 32px;
--card-padding-vertical: 20px;
--card-header-border: #eeeeee;
```

### タイトル・説明

```css
--quest-title-font-size: 16px;
--quest-title-weight: 700;
--quest-title-color: #151834;
--quest-detail-font-size: 14px;
--quest-detail-weight: 500;
--quest-detail-color: #6f7178;
```

### メタ情報

```css
--meta-label-font-size: 12px;
--meta-label-color: #7d8691;
--meta-bg: #ffffff;
--meta-border-radius: 30px;
--meta-gap: 12px;
```

### 矢印ボタン

```css
--arrow-icon-size: 10px;
--arrow-icon-color: #0d221d;
--arrow-border: 2px #0d221d;
--arrow-border-radius: 666px;
--arrow-padding: 8px;
```

### コンテンツアイテム

```css
--item-width: 679px;
--item-gap: 16px;
--item-padding: 6px 0px;
--item-border-radius: 8px;
--item-number-font-size: 10px;
--item-number-color: #414141;
--thumbnail-width: 57px;
--thumbnail-height: 32px;
--thumbnail-bg: #e0dfdf;
--thumbnail-border-radius: 3.17px;
--item-title-font-size: 13px;
--item-title-weight: 500;
--item-title-color: #5a5a5a;
--item-duration-font-size: 11px;
--item-duration-color: #8c8c8c;
```

---

## 🔗 コンポーネント参照

| コンポーネント  | ID          | 説明                 |
| --------------- | ----------- | -------------------- |
| Quest Component | `866:14023` | クエスト 1 つ分      |
| Item Content    | `866:14103` | 記事アイテム         |
| Arrow Button    | `772:19635` | 矢印ボタン           |
| Icon Check      | `779:20811` | クエスト完了チェック |

---

## 🎯 関連する設計パターン

### クエストの繰り返し

- 同じクエストコンポーネント (`866:14023`) を複数回使用
- ギャップ: 11px で区切られる
- 番号が自動的にインクリメント（01 → 02 → 03...）

### コンテンツアイテムの繰り返し

- 同じアイテムコンポーネント (`866:14103`) を複数回使用
- ギャップ: 5px で区切られる
- 記事番号が順序通り表示される

### インタラクション

- 矢印ボタン: クリックで詳細ページに遷移
- 記事アイテム: クリックで動画再生ページに遷移
- チェックアイコン: クエスト完了時にチェック表示

---

## ✨ デザイン特性

### ビジュアルヒエラルキー

1. **見出し**: 大きく、ダークネイビー色で強調
2. **クエスト番号**: 番号で認識しやすく
3. **カード**: 白背景で内容を明確に
4. **記事タイトル**: 重要情報として中央
5. **メタ情報**: グレーで控えめに

### スペースの活用

- 外側パディング: 余裕を持たせる
- 内側ギャップ: 要素を明確に区切る
- 揃え: 左揃えで自然な流れ

### インタラクティビティ

- 矢印アイコン: クリック可能性を示唆
- ホバー状態: (要実装) カード全体のハイライト
- チェックアイコン: 完了状態を視覚的に表現
