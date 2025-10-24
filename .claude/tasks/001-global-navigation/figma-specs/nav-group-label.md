# ナビゲーション グループラベル - 完全実装仕様書

## 📋 Figma 情報

- **URL**: https://www.figma.com/design/v4tNiQnPCjzSFFDmdcEYSh/%F0%9F%97%BA%EF%B8%8F-guide_2025?node-id=898-4127
- **ノード ID**: 898:4127
- **コンポーネント名**: SidebarGroupLabel

---

## 🏗️ 構造概要

```
SidebarGroupLabel (FRAME)
└── メイン (TEXT)
```

---

## 📐 完全レイアウト仕様

### コンテナ（SidebarGroupLabel）

#### 基本スタイル

```css
display: flex;
flex-direction: row;
align-items: center;
padding: 0px 8px;
width: 224px; /* 固定 */
height: 32px; /* 固定 */
border-radius: 8px;
background: transparent;
box-sizing: border-box;
```

#### 詳細情報

- **レイアウトモード**: Flexbox（横並び）
- **配置**: 中央揃え（vertical）
- **サイズ**: 固定（horizontal & vertical）
- **内部 padding**: 左右 8px、上下 0px

---

## ✍️ テキスト完全仕様

### テキスト要素（"メイン"）

#### フォント仕様

```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
font-size: 12px;
font-weight: 500; /* Medium */
line-height: 16px; /* 1.33em = 12px × 1.33 */
letter-spacing: 0;
text-align: left;
text-transform: none;
text-decoration: none;
white-space: nowrap;
```

#### カラー

```css
color: rgba(10, 10, 10, 0.7); /* 黒の70%透明度 */
```

**16 進数表記での近似値**: `#666666`（参考）

#### サイズ

```css
width: auto; /* コンテンツに応じて */
height: auto; /* コンテンツに応じて */
```

---

## 🎨 完全カラー仕様

### テキストカラー

```css
/* RGBA形式（推奨） */
--label-text-color: rgba(10, 10, 10, 0.7);

/* 16進数近似値 */
--label-text-color-hex: #666666;

/* HSL形式 */
--label-text-color-hsl: hsl(0, 0%, 40%);
```

### 背景カラー

```css
--label-background: transparent;
```

**ホバー時（オプション）**:

```css
--label-background-hover: rgba(0, 0, 0, 0.03);
```

---

## 📏 完全スペーシング仕様

### 外部スペーシング

```
margin: 0; /* マージンなし */
```

### 内部スペーシング

```
padding-top: 0px;
padding-right: 8px;
padding-bottom: 0px;
padding-left: 8px;
```

### 寸法

```
width: 224px; /* 固定 */
height: 32px; /* 固定 */
min-width: 224px;
max-width: 224px;
min-height: 32px;
max-height: 32px;
```

### 角丸

```
border-radius: 8px;
```

---

## 🎯 使用例

### 実際のテキスト内容

- "メイン" (メインメニューグループ)
- "その他" (その他メニューグループ)
- "設定" (設定関連グループ)

### 配置場所

- メニューグループの最初の要素として配置
- メニュー項目リストの直前
- サイドバー内で複数使用可能

---

## 💻 実装例

### HTML 構造

```html
<div class="sidebar-group-label">メイン</div>
```

### CSS（標準）

```css
.sidebar-group-label {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 8px;
  width: 224px;
  height: 32px;
  border-radius: 8px;
  background: transparent;

  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: rgba(10, 10, 10, 0.7);

  box-sizing: border-box;
  user-select: none;
}
```

### React + TypeScript

```typescript
interface SidebarGroupLabelProps {
  children: React.ReactNode;
  className?: string;
}

const SidebarGroupLabel: React.FC<SidebarGroupLabelProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={`sidebar-group-label ${className || ""}`}
      role="heading"
      aria-level={2}
    >
      {children}
    </div>
  );
};

export default SidebarGroupLabel;
```

### Tailwind CSS

```html
<div
  class="
  flex 
  flex-row 
  items-center 
  px-2 
  w-56 
  h-8 
  rounded-lg
  text-xs
  font-medium
  leading-4
  text-black/70
  select-none
"
>
  メイン
</div>
```

### CSS Modules

```css
/* SidebarGroupLabel.module.css */
.label {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 8px;
  width: 224px;
  height: 32px;
  border-radius: 8px;
  background: transparent;

  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: rgba(10, 10, 10, 0.7);

  box-sizing: border-box;
  user-select: none;
}
```

```typescript
import styles from "./SidebarGroupLabel.module.css";

<div className={styles.label}>メイン</div>;
```

---

## 🎭 インタラクション仕様

### デフォルト状態

```css
background: transparent;
cursor: default;
pointer-events: none; /* クリック不可 */
```

### ホバー時（オプション：実装しない場合もある）

```css
/* グループラベルは通常インタラクティブではない */
/* ホバー効果は不要 */
```

### その他

- **選択不可**: `user-select: none;`
- **クリック不可**: ラベルは視覚的な区切りのみ
- **アニメーション**: なし

---

## ♿ アクセシビリティ仕様

### ARIA 属性

```html
<div class="sidebar-group-label" role="heading" aria-level="2">メイン</div>
```

### セマンティック HTML（代替案）

```html
<h2 class="sidebar-group-label">メイン</h2>
```

### スクリーンリーダー対応

- ラベルは見出しとして認識される
- メニューグループの開始を示す
- aria-level="2" で階層を明示

---

## 📱 レスポンシブ仕様

### デスクトップ（1024px 以上）

```css
.sidebar-group-label {
  width: 224px;
  height: 32px;
  font-size: 12px;
}
```

### タブレット（768px〜1024px）

```css
.sidebar-group-label {
  width: 224px; /* 変更なし */
  height: 32px;
  font-size: 12px;
}
```

### モバイル（768px 未満）

```css
.sidebar-group-label {
  width: 100%; /* 可変に */
  max-width: 224px;
  height: 32px;
  font-size: 12px;
}
```

---

## 🔤 タイポグラフィ詳細

### フォントスタック

```css
font-family: "Inter", /* メインフォント */ -apple-system, /* macOS/iOS */
    BlinkMacSystemFont, /* macOS Chrome */ "Segoe UI", /* Windows */ "Roboto",
  /* Android */ "Helvetica Neue", /* macOS fallback */ Arial,
  /* 汎用 */ sans-serif; /* 最終フォールバック */
```

### 計算式

```
line-height: 1.3333333333333333em
           = 12px × 1.333...
           = 16px
```

### OpenType 機能（オプション）

```css
font-feature-settings: "kern" 1, /* カーニング有効 */ "liga" 1; /* 合字有効 */
```

---

## 🎨 ダークモード対応（オプション）

### ライトモード

```css
.sidebar-group-label {
  color: rgba(10, 10, 10, 0.7);
}
```

### ダークモード

```css
@media (prefers-color-scheme: dark) {
  .sidebar-group-label {
    color: rgba(255, 255, 255, 0.6);
  }
}
```

または

```css
[data-theme="dark"] .sidebar-group-label {
  color: rgba(255, 255, 255, 0.6);
}
```

---

## 🔍 デザイントークン

### CSS Variables

```css
:root {
  /* グループラベル専用 */
  --sidebar-label-width: 224px;
  --sidebar-label-height: 32px;
  --sidebar-label-padding-x: 8px;
  --sidebar-label-padding-y: 0px;
  --sidebar-label-radius: 8px;

  /* タイポグラフィ */
  --sidebar-label-font-size: 12px;
  --sidebar-label-font-weight: 500;
  --sidebar-label-line-height: 16px;
  --sidebar-label-color: rgba(10, 10, 10, 0.7);
}
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        "sidebar-label": "rgba(10, 10, 10, 0.7)",
      },
      fontSize: {
        "sidebar-label": ["12px", { lineHeight: "16px" }],
      },
      spacing: {
        "sidebar-label": "224px",
      },
      borderRadius: {
        sidebar: "8px",
      },
    },
  },
};
```

---

## 📊 完全な寸法まとめ

```
外寸:
  width: 224px
  height: 32px

内部padding:
  padding-left: 8px
  padding-right: 8px
  padding-top: 0px
  padding-bottom: 0px

角丸:
  border-radius: 8px

フォント:
  font-size: 12px
  line-height: 16px
  font-weight: 500
```

---

## 🎯 実装チェックリスト

### 構造

- [ ] コンテナ要素（div または h2）
- [ ] テキスト内容

### スタイル

- [ ] 幅: 224px
- [ ] 高さ: 32px
- [ ] padding: 0px 8px
- [ ] 角丸: 8px
- [ ] フォント: Inter
- [ ] フォントサイズ: 12px
- [ ] フォントウェイト: 500
- [ ] 行間: 16px
- [ ] カラー: rgba(10, 10, 10, 0.7)

### 機能

- [ ] クリック不可
- [ ] 選択不可（user-select: none）
- [ ] セマンティック HTML（見出し）

### アクセシビリティ

- [ ] role="heading" または h2 タグ
- [ ] aria-level="2"

---

## 💡 実装のポイント

### 1. セマンティック HTML

```html
<!-- 推奨: h2タグを使用 -->
<h2 class="sidebar-group-label">メイン</h2>

<!-- または: roleで明示 -->
<div class="sidebar-group-label" role="heading" aria-level="2">メイン</div>
```

### 2. テキストの選択不可

```css
user-select: none;
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
```

### 3. フォントの読み込み

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap"
  rel="stylesheet"
/>
```

### 4. 複数言語対応

```css
/* 日本語の場合 */
.sidebar-group-label {
  font-family: "Inter", "Noto Sans JP", sans-serif;
}

/* 英語の場合 */
.sidebar-group-label[lang="en"] {
  font-family: "Inter", sans-serif;
}
```

---

## 🔧 技術的な注意事項

### ブラウザ互換性

- **Flexbox**: IE11+ サポート
- **rgba()**: IE9+ サポート
- **border-radius**: IE9+ サポート
- **フォントウェイト 500**: すべてのモダンブラウザ

### パフォーマンス

- **再描画なし**: 静的な要素
- **メモリ使用**: 最小限
- **レンダリング**: 軽量

### ベストプラクティス

- コンポーネントとして再利用可能に
- CSS 変数で一元管理
- TypeScript で型安全に

---

## 📋 使用コンテキスト

### サイドバー内での配置

```
Sidebar
└── MenuGroup
    ├── SidebarGroupLabel ← このコンポーネント
    └── MenuList
        ├── MenuItem
        ├── MenuItem
        └── MenuItem
```

### 実際の使用例

```typescript
<nav className="sidebar">
  {/* ユーザーメニュー */}
  <div className="menu-group">
    <MenuItem>マイページ</MenuItem>
  </div>

  {/* メインメニュー */}
  <div className="menu-group">
    <SidebarGroupLabel>メイン</SidebarGroupLabel>
    <MenuItem>ロードマップ</MenuItem>
    <MenuItem>トレーニング</MenuItem>
    <MenuItem>ガイド</MenuItem>
  </div>

  {/* その他メニュー */}
  <div className="menu-group">
    <SidebarGroupLabel>その他</SidebarGroupLabel>
    <MenuItem>設定</MenuItem>
  </div>
</nav>
```

---

## 🎨 視覚的な比較

### 他の要素との違い

#### vs メニュー項目

```
グループラベル:
  - フォントサイズ: 12px
  - フォントウェイト: 500
  - カラー: rgba(10, 10, 10, 0.7)
  - クリック不可

メニュー項目:
  - フォントサイズ: 14px
  - フォントウェイト: 400 (500 if active)
  - カラー: #0A0A0A
  - クリック可能
```

---

この仕様書に従えば、グループラベルを完璧に実装できます。
