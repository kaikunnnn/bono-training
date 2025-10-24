# グローバルナビゲーション全体仕様

## 📋 Figma 情報

- **URL**: https://www.figma.com/design/v4tNiQnPCjzSFFDmdcEYSh/%F0%9F%97%BA%EF%B8%8F-guide_2025?node-id=895-3936
- **ノード ID**: 895:3936
- **コンポーネント名**: global_navigation

---

## 🏗️ 構造概要

### コンテナ

```
global_navigation (FRAME)
├── top (上部セクション)
│   ├── Link (ロゴエリア)
│   ├── Container (検索ボックス)
│   └── SidebarGroup (ユーザーメニュー)
├── SidebarGroup (メインメニュー)
│   ├── SidebarGroupLabel
│   └── SidebarMenu
└── SidebarGroup (その他メニュー)
    ├── SidebarGroupLabel
    └── SidebarMenu
```

---

## 📐 詳細レイアウト仕様

### ルートコンテナ（global_navigation）

```css
display: flex;
flex-direction: column;
align-items: center;
width: 240px; /* 固定 */
height: auto; /* コンテンツに応じて */
background: #ffffff;
```

---

## 🎨 セクション 1: トップエリア（top）

### コンテナスタイル

```css
display: flex;
flex-direction: column;
align-self: stretch;
gap: 16px;
padding: 8px 0px 0px 0px;
width: 100%; /* 親要素いっぱい */
```

---

### 1-1. ロゴエリア（Link）

#### コンテナ

```css
display: flex;
flex-direction: column;
align-self: stretch;
padding: 10px 12px;
width: 100%;
```

#### ロゴ要素

```css
width: 67.51px;
height: 20px;
```

**実装メモ**:

- SVG 画像またはロゴコンポーネント
- 色: #151834（濃紺）
- クリックで「/」へ遷移

---

### 1-2. 検索ボックス（Container > Text Input）

#### 外側コンテナ（Container）

```css
display: flex;
flex-direction: row;
justify-content: stretch;
align-items: stretch;
align-self: stretch;
gap: 10px;
padding: 10px 12px;
width: 100%;
```

#### 検索入力フィールド（Text Input）

```css
display: flex;
flex-direction: row;
align-items: center;
gap: 4px;
padding: 8px 12px;
width: 100%; /* 親要素いっぱい */
height: 36px; /* 固定 */
background: #f3f4f6;
border-radius: 10px;
border: none;
```

#### 検索アイコン

```css
width: 16px;
height: 16px;
flex-shrink: 0;
```

**SVG パス情報**:

- 円: 中心(6px, 6px), 半径 4.67px
- 線: 始点(9.78px, 9.78px), 終点(12.67px, 12.67px)
- ストローク色: #99A1AF
- ストローク幅: 1.33px

#### プレースホルダーテキスト

```css
font-family: "Inter", sans-serif;
font-size: 14px;
font-weight: 400;
line-height: 1.21em; /* 16.94px */
letter-spacing: -0.15px; /* -1.07% */
color: #99a1af;
text-align: left;
```

**テキスト内容**: "検索"

---

### 1-3. ユーザーメニュー（SidebarGroup）

#### グループコンテナ

```css
display: flex;
flex-direction: column;
align-self: stretch;
padding: 8px;
width: 100%;
```

#### メニューリスト（SidebarMenu）

```css
display: flex;
flex-direction: column;
align-self: stretch;
gap: 4px;
width: 100%;
```

#### メニュー項目（SidebarMenuItem）

```css
display: flex;
flex-direction: column;
align-self: stretch;
gap: 10px;
width: 100%;
```

#### リンクボタン（Link）

```css
display: flex;
flex-direction: row;
align-items: center;
gap: 8px;
padding: 0px 0px 0px 8px;
width: 224px; /* 固定 */
height: 32px; /* 固定 */
border-radius: 8px;
background: transparent; /* 通常状態 */
cursor: pointer;
transition: background-color 150ms ease;
```

##### ホバー時

```css
background: #f9fafb;
```

##### アイコン

```css
width: 16px;
height: 16px;
flex-shrink: 0;
color: #0a0a0a;
```

##### テキスト（マイページ）

```css
font-family: "Inter", sans-serif;
font-size: 14px;
font-weight: 400;
line-height: 1.43em; /* 20px */
letter-spacing: -0.15px;
color: #0a0a0a;
```

---

## 🎨 セクション 2: メインメニュー（SidebarGroup）

### グループコンテナ

```css
display: flex;
flex-direction: column;
padding: 8px;
width: 240px; /* 固定 */
```

---

### 2-1. グループラベル（SidebarGroupLabel）

```css
display: flex;
flex-direction: row;
align-items: center;
padding: 0px 8px;
width: 224px; /* 固定 */
height: 32px; /* 固定 */
border-radius: 8px;
```

#### テキスト（"メイン"）

```css
font-family: "Inter", sans-serif;
font-size: 12px;
font-weight: 500; /* Medium */
line-height: 1.33em; /* 16px */
color: rgba(10, 10, 10, 0.7); /* 70%透明度 */
text-transform: none;
```

---

### 2-2. メニューリスト（SidebarMenu）

#### コンテナ

```css
display: flex;
flex-direction: column;
align-self: stretch;
gap: 4px; /* 項目間の間隔 */
width: 100%;
```

---

### 2-3. メニュー項目

#### 共通スタイル（SidebarMenuItem > Link）

```css
display: flex;
flex-direction: row;
align-items: center;
gap: 8px; /* アイコンとテキストの間隔 */
padding: 0px 0px 0px 8px;
width: 224px;
height: 32px;
border-radius: 8px;
cursor: pointer;
transition: all 150ms ease;
```

---

#### 状態 A: 通常（ロードマップ、ガイド）

```css
background: transparent;
```

**テキスト**:

```css
font-family: "Inter", sans-serif;
font-size: 14px;
font-weight: 400; /* Regular */
line-height: 1.43em;
letter-spacing: -0.15px;
color: #0a0a0a;
```

**アイコン**:

```css
width: 16px;
height: 16px;
color: #0a0a0a;
```

---

#### 状態 B: アクティブ（トレーニング）★

```css
background: #f5f5f5; /* 薄いグレー背景 */
```

**テキスト**:

```css
font-family: "Inter", sans-serif;
font-size: 14px;
font-weight: 500; /* Medium - ここが重要！ */
line-height: 1.43em;
letter-spacing: -0.15px;
color: #171717; /* より濃い黒 */
```

**アイコン**:

```css
width: 16px;
height: 16px;
color: #171717; /* テキストと同じ色 */
```

---

#### 状態 C: ホバー

```css
background: #f9fafb; /* さらに薄いグレー */
```

---

#### メニュー項目の内容

##### ロードマップ

- アイコン: 16×16px
- テキスト: "ロードマップ"
- 幅: 84px（テキスト）
- 状態: 通常

##### トレーニング（アクティブ）

- アイコン: 16×16px
- テキスト: "トレーニング"
- 幅: 84px（テキスト）
- 状態: アクティブ
- **背景**: #F5F5F5
- **フォント**: 500（Medium）

##### ガイド

- アイコン: 16×16px
- テキスト: "ガイド"
- 幅: 42px（テキスト）
- 状態: 通常

---

## 🎨 セクション 3: その他メニュー（SidebarGroup）

### グループコンテナ

```css
display: flex;
flex-direction: column;
padding: 8px;
width: 240px;
```

---

### 3-1. グループラベル（SidebarGroupLabel）

```css
display: flex;
flex-direction: row;
align-items: center;
align-self: stretch; /* 親要素いっぱい */
padding: 0px 8px;
height: 32px;
border-radius: 8px;
```

#### テキスト（"その他"）

```css
font-family: "Inter", sans-serif;
font-size: 12px;
font-weight: 500;
line-height: 1.33em;
color: rgba(10, 10, 10, 0.7);
```

---

### 3-2. メニュー項目（設定）

#### コンテナ

```css
display: flex;
flex-direction: column;
gap: 10px;
```

#### リンク

```css
display: flex;
flex-direction: row;
align-items: center;
gap: 8px;
padding: 0px 0px 0px 8px;
width: 224px;
height: 32px;
border-radius: 8px;
background: transparent;
cursor: pointer;
transition: background-color 150ms ease;
```

**ホバー時**:

```css
background: #f9fafb;
```

#### アイコン

```css
width: 16px;
height: 16px;
color: #0a0a0a;
```

#### テキスト（"設定"）

```css
font-family: "Inter", sans-serif;
font-size: 14px;
font-weight: 400;
line-height: 1.43em;
letter-spacing: -0.15px;
color: #0a0a0a;
width: 28px; /* テキスト幅 */
```

---

## 🎨 完全カラーパレット

### 背景色

```css
--bg-sidebar: #ffffff;
--bg-search: #f3f4f6;
--bg-menu-active: #f5f5f5;
--bg-menu-hover: #f9fafb;
--bg-transparent: transparent;
```

### テキスト色

```css
--text-primary: #0a0a0a;
--text-active: #171717;
--text-label: rgba(10, 10, 10, 0.7);
--text-placeholder: #99a1af;
```

### アイコン色

```css
--icon-primary: #0a0a0a;
--icon-active: #171717;
--icon-search: #99a1af;
```

### ロゴ色

```css
--logo-color: #151834;
```

### ボーダー/ストローク

```css
--stroke-search-icon: #99a1af;
```

---

## ✍️ タイポグラフィ完全仕様

### 1. グループラベル（"メイン", "その他"）

```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
font-size: 12px;
font-weight: 500;
line-height: 16px; /* 1.33em */
letter-spacing: 0;
color: rgba(10, 10, 10, 0.7);
text-align: left;
text-decoration: none;
text-transform: none;
```

### 2. メニュー項目（通常状態）

```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
font-size: 14px;
font-weight: 400;
line-height: 20px; /* 1.43em */
letter-spacing: -0.15px; /* -1.07% */
color: #0a0a0a;
text-align: left;
text-decoration: none;
```

### 3. メニュー項目（アクティブ状態）

```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
font-size: 14px;
font-weight: 500; /* Medium - 重要な違い */
line-height: 20px;
letter-spacing: -0.15px;
color: #171717; /* より濃い */
text-align: left;
text-decoration: none;
```

### 4. 検索プレースホルダー

```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
font-size: 14px;
font-weight: 400;
line-height: 16.94px; /* 1.21em */
letter-spacing: -0.15px;
color: #99a1af;
text-align: left;
```

---

## 📏 スペーシング完全仕様

### 基本単位

```
基本単位: 4px
推奨倍数: 4px, 8px, 12px, 16px, 32px
```

### 詳細スペーシング

```css
/* ルートコンテナ */
--sidebar-width: 240px;

/* トップセクション */
--top-padding: 8px 0px 0px 0px;
--top-gap: 16px;

/* ロゴエリア */
--logo-padding: 10px 12px;

/* 検索ボックス */
--search-container-padding: 10px 12px;
--search-input-padding: 8px 12px;
--search-input-height: 36px;
--search-icon-gap: 4px;

/* グループセクション */
--group-padding: 8px;

/* グループラベル */
--label-padding: 0px 8px;
--label-height: 32px;

/* メニューリスト */
--menu-gap: 4px; /* 項目間 */

/* メニュー項目 */
--menu-item-width: 224px;
--menu-item-height: 32px;
--menu-item-padding: 0px 0px 0px 8px;
--menu-item-gap: 8px; /* アイコンとテキスト */

/* アイコン */
--icon-size: 16px;

/* 角丸 */
--border-radius-search: 10px;
--border-radius-menu: 8px;
```

---

## 🎭 インタラクション仕様

### メニュー項目

#### デフォルト

```css
background: transparent;
cursor: pointer;
transform: scale(1);
transition: all 150ms ease;
```

#### ホバー

```css
background: #f9fafb;
transform: scale(1);
```

#### アクティブ（クリック時）

```css
background: #f5f5f5;
transform: scale(0.98);
transition: transform 100ms ease;
```

#### アクティブ（現在のページ）

```css
background: #f5f5f5;
font-weight: 500;
color: #171717;
```

### 検索ボックス

#### デフォルト

```css
background: #f3f4f6;
border: none;
outline: none;
```

#### フォーカス

```css
background: #ffffff;
outline: 2px solid #3b82f6;
outline-offset: -2px;
```

---

## 📱 レスポンシブ仕様

### デスクトップ（1024px 以上）

```css
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 240px;
  height: 100vh;
  display: flex;
}
```

### タブレット（768px〜1024px）

```css
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 240px;
  height: 100vh;
  transform: translateX(0);
  transition: transform 300ms ease-in-out;
  z-index: 1000;
}

.sidebar.closed {
  transform: translateX(-240px);
}

/* ハンバーガーメニューボタン追加 */
.menu-toggle {
  display: block;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1001;
}
```

### モバイル（768px 未満）

```css
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  max-width: 280px;
  height: 100vh;
  transform: translateX(-100%);
  transition: transform 300ms ease-in-out;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar.open {
  transform: translateX(0);
}

/* オーバーレイ */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease-in-out;
  z-index: 999;
}

.sidebar-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

/* ハンバーガーメニューボタン */
.menu-toggle {
  display: block;
  position: fixed;
  top: 16px;
  left: 16px;
  width: 40px;
  height: 40px;
  z-index: 1001;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

---

## ♿ アクセシビリティ仕様

### 必須 ARIA 属性

#### サイドバー

```html
<nav role="navigation" aria-label="メインナビゲーション" class="sidebar"></nav>
```

#### 検索ボックス

```html
<input
  type="search"
  placeholder="検索"
  aria-label="サイト内検索"
  role="searchbox"
/>
```

#### メニュー項目

```html
<a href="/training" aria-current="page" <!-- アクティブ時のみ -->
  role="link" >
  <span aria-hidden="true">[アイコン]</span>
  トレーニング
</a>
```

#### グループラベル

```html
<div role="heading" aria-level="2">メイン</div>
```

#### ハンバーガーメニュー

```html
<button
  aria-label="メニューを開く"
  aria-expanded="false"
  aria-controls="sidebar"
>
  [アイコン]
</button>
```

### キーボード操作

```
Tab: 次の項目へフォーカス
Shift + Tab: 前の項目へフォーカス
Enter/Space: リンクを開く
Escape: サイドバーを閉じる（モバイル時）
```

### フォーカス表示

```css
a:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

---

## 🎯 実装チェックリスト

### 構造

- [ ] ルートコンテナ（240px 幅）
- [ ] トップセクション
  - [ ] ロゴエリア
  - [ ] 検索ボックス
  - [ ] ユーザーメニュー
- [ ] メインメニューグループ
  - [ ] グループラベル（"メイン"）
  - [ ] ロードマップリンク
  - [ ] トレーニングリンク（アクティブ）
  - [ ] ガイドリンク
- [ ] その他メニューグループ
  - [ ] グループラベル（"その他"）
  - [ ] 設定リンク

### スタイリング

- [ ] カラーパレット適用
- [ ] タイポグラフィ適用
- [ ] スペーシング適用
- [ ] 角丸（10px, 8px）
- [ ] アイコン（16×16px）

### インタラクション

- [ ] ホバー効果
- [ ] アクティブ状態の表示
- [ ] クリックアニメーション
- [ ] 検索ボックスフォーカス

### レスポンシブ

- [ ] デスクトップ表示
- [ ] タブレット対応
- [ ] モバイル対応
- [ ] ハンバーガーメニュー
- [ ] オーバーレイ

### アクセシビリティ

- [ ] ARIA 属性
- [ ] キーボード操作
- [ ] フォーカス表示
- [ ] スクリーンリーダー対応

### 機能

- [ ] 検索機能
- [ ] ページ遷移
- [ ] アクティブ状態の判定
- [ ] モバイルメニュー開閉

---

## 💻 推奨実装パターン（React + TypeScript）

### コンポーネント構造

```
Sidebar/
├── index.tsx          # メインコンポーネント
├── Logo.tsx           # ロゴ
├── SearchBox.tsx      # 検索ボックス
├── MenuGroup.tsx      # メニューグループ
├── MenuItem.tsx       # メニュー項目
├── GroupLabel.tsx     # グループラベル
└── styles.module.css  # スタイル
```

### 型定義

```typescript
interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentPath: string;
}
```

---

## 🔧 技術的な注意事項

### フォント読み込み

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap");
```

### アイコンライブラリ推奨

- Lucide React
- Heroicons
- React Icons

### スタイリング手法

- CSS Modules（推奨）
- Tailwind CSS
- Styled Components

### パフォーマンス

- アイコンは SVG で実装
- メニュー項目は仮想スクロール不要（数が少ない）
- 検索機能はデバウンス処理（300ms 推奨）

---

## 📊 完全な寸法まとめ

```
サイドバー全体: 240px × auto
ロゴエリア: 240px × 40px (padding含む)
検索ボックス: 216px × 36px (親padding考慮)
メニュー項目: 224px × 32px
グループラベル: 224px × 32px
アイコン: 16px × 16px
角丸（検索）: 10px
角丸（メニュー）: 8px
```

---

この仕様書に従えば、Figma デザインを 100%再現できます。
