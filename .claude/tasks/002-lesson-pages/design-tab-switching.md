# タブ切り替えセクション - デザイン仕様

# タブ切り替えセクション - デザインスペック

**コンポーネント ID:** `927:5030` (Tablist)

---

## 📐 全体仕様

| 項目         | 値                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------- |
| 幅           | 100% (レスポンシブ)                                                                                 |
| タブエリア幅 | 768px (固定 → デスクトップ表示のみ) ※768 はタブとクエスト、概要・目的エリアのデスクトップ時の固定幅 |
| 高さ         | 自動 (Hug)                                                                                          |
| 方向         | 行 (Row)                                                                                            |
| 配置         | 中央 (Justify Center)                                                                               |
| ギャップ     | 4px                                                                                                 |
| ボーダー     | 下部のみ 1px, rgba(0, 0, 0, 0.1)                                                                    |

---

## 🏗️ 構造

```
Tablist (コンポーネント)
├─ wrap (レイアウトコンテナ)
│  ├─ Tab_focus (アクティブタブ)
│  │  └─ テキスト: "コンテンツ"
│  │
│  └─ Tab_notfocus (非アクティブタブ)
│     └─ テキスト: "概要・目的"
│
└─ ボーダー (下部境界線)
```

---

## 🎨 ボーダースタイル

**下部ボーダー:**

```css
Stroke Weight: 0px 0px 1px (下辺のみ)
Stroke Color: rgba(0, 0, 0, 0.1) (薄いグレー)
```

---

## 📦 Wrap コンテナ

**ID:** 877:3068

### レイアウト

```css
Layout Mode: Row
Align Items: Center
Gap: 4px
Width: 768px (固定)
Height: Auto (Hug)
```

---

## 📑 タブ要素

### 共通スタイル

**各タブ (Tab_focus / Tab_notfocus):**

```css
Layout Mode: Row
Justify Content: Center
Align Items: Center
Padding: 14px 16px
Height: Auto (Hug)
Width: Auto (Hug)
```

---

## ✅ タブ 1: アクティブ状態 (Tab_focus)

**ID:** 779:21358

**テキスト:** "コンテンツ"

### スタイル

```css
/* ボーダー */
Stroke Weight: 0px 0px 2px (下辺のみ)
Stroke Color: #000000 (黒)

/* テキスト */
Font Family: Geist
Font Weight: 500
Font Size: 16px
Line Height: 1.5em
Text Alignment: CENTER
Color: #000000 (黒)
```

### ボーダー詳細

```css
Stroke Position: Bottom
Stroke Weight: 2px (太い下線)
```

---

## ⚪ タブ 2: 非アクティブ状態 (Tab_notfocus)

**ID:** 779:21360

**テキスト:** "概要・目的"

### スタイル

```css
/* ボーダー */
Stroke: なし

/* テキスト */
Font Family: Geist
Font Weight: 500
Font Size: 16px
Line Height: 1.5em
Text Alignment: CENTER
Color: #737373 (グレー)
```

---

## 💡 状態管理

### アクティブ (Focus)

- テキストカラー: **#000000** (黒)
- 下線カラー: **#000000** (黒)
- 下線太さ: **2px**
- ボーダー表示: あり

### 非アクティブ (Not Focus)

- テキストカラー: **#737373** (グレー)
- 下線: **なし**
- ボーダー表示: なし

---

## 🔤 テキストスタイル (共通)

**タイポグラフィ:**

```css
Font Family: Geist
Font Weight: 500 (Medium)
Font Size: 16px
Line Height: 1.5em
Text Alignment: CENTER
Text Vertical: CENTER
```

**フォント特性:**

- Geist は SUI（San Francisco UI）系のモダンフォント
- ウェイト 500 で読みやすく、かつ視認性が高い
- 行高 1.5em で垂直方向のバランスが良い

---

## 📏 サイズと間隔

| 要素              | 値                        |
| ----------------- | ------------------------- |
| タブ幅            | 自動 (コンテンツに応じて) |
| タブ高さ          | 自動                      |
| パディング (左右) | 16px                      |
| パディング (上下) | 14px                      |
| タブ間ギャップ    | 4px                       |
| 全体幅            | 1333px                    |
| ラップ幅          | 768px                     |

---

## 🎯 インタラクション

### ホバー状態 (推奨実装)

```css
/* 非アクティブタブのホバー */
Text Color: #000000 → #333333 (やや濃くなる)
Cursor: pointer
```

### クリック時 (推奨実装)

```css
/* タブ切り替え */
1. クリックされたタブ → Tab_focus 状態に変更
2. 前のアクティブタブ → Tab_notfocus 状態に変更
3. 関連するコンテンツ領域を表示/非表示
```

---

## 💾 CSS Variables (推奨)

```css
/* Tab Styling */
--tab-padding-horizontal: 16px;
--tab-padding-vertical: 14px;
--tab-gap: 4px;

/* Typography */
--tab-font-family: "Geist", sans-serif;
--tab-font-weight: 500;
--tab-font-size: 16px;
--tab-line-height: 1.5em;

/* Colors */
--tab-active-text: #000000;
--tab-active-underline: #000000;
--tab-inactive-text: #737373;
--tab-border-bottom: rgba(0, 0, 0, 0.1);

/* Border */
--tab-active-underline-weight: 2px;
--tab-container-border-weight: 1px;

/* Dimensions */
--tablist-width: 1333px;
--wrap-width: 768px;
```

---

## 🔗 コンポーネント参照

| 要素         | ID          | 説明                          |
| ------------ | ----------- | ----------------------------- |
| Tablist (親) | `927:5030`  | タブコンポーネント全体        |
| Wrap         | `877:3068`  | タブコンテナ                  |
| Tab Active   | `779:21358` | アクティブタブ (コンテンツ)   |
| Tab Inactive | `779:21360` | 非アクティブタブ (概要・目的) |

---

## 🎯 レスポンシブ考慮事項

- **タブリスト幅**: 1333px (固定) → モバイル対応時は要調整
- **ラップ幅**: 768px で中央揃え
- **パディング**: 14px / 16px で外部への流出を防止
- **ボーダー**: 下部のみ (上下左右ではなく下のみ)

---

## ✨ デザイン特性

### ユーザビリティ

- 明確なアクティブ/非アクティブ状態の区別
- 下線で選択状態を直感的に表示
- 充分なタッチターゲット (14px 上下パディング)

### ビジュアルヒエラルキー

- アクティブ: 黒 (強調)
- 非アクティブ: グレー (軽減)
- 下線で視線をガイド

### 設計パターン

- Material Design のタブパターンに準拠
- 下線型タブ（underline tab）
- シンプルで汎用性が高い
