# ナビゲーション メニューアイテム - 完全実装仕様書

## 📋 Figma 情報

### 通常状態

- **URL**: https://www.figma.com/design/v4tNiQnPCjzSFFDmdcEYSh/%F0%9F%97%BA%EF%B8%8F-guide_2025?node-id=898-4101
- **ノード ID**: 898:4101
- **コンポーネント名**: SidebarMenuItem_normal

### アクティブ状態（ページ表示中）

- **URL**: https://www.figma.com/design/v4tNiQnPCjzSFFDmdcEYSh/%F0%9F%97%BA%EF%B8%8F-guide_2025?node-id=898-4121
- **ノード ID**: 898:4121
- **コンポーネント名**: SidebarMenuItem_focus

---

## 🏗️ 構造概要

```
SidebarMenuItem (FRAME)
└── Link (FRAME)
    ├── Icon (IMAGE-SVG)
    └── AppSidebar (FRAME)
        └── ロードマップ (TEXT)
```

---

## 📐 完全レイアウト仕様

### 状態 A: 通常状態（Normal）

#### 外側コンテナ（SidebarMenuItem）

```css
display: flex;
flex-direction: column;
gap: 10px;
width: 224px; /* 固定 */
height: auto; /* コンテンツに応じて */
background: transparent; /* 背景なし */
```

#### リンクコンテナ（Link）

```css
display: flex;
flex-direction: row;
align-items: center;
gap: 8px; /* アイコンとテキストの間隔 */
padding: 0px 0px 0px 8px; /* 左のみ8px */
width: 224px; /* 固定 */
height: 32px; /* 固定 */
border-radius: 8px;
background: transparent; /* 通常時は背景なし */
cursor: pointer;
transition: background-color 150ms ease;
box-sizing: border-box;
```

---

### 状態 B: アクティブ状態（Focus/Active）

#### 外側コンテナ（SidebarMenuItem）

```css
display: flex;
flex-direction: column;
align-items: center;
gap: 8px;
padding: 0px 0px 0px 8px;
width: 224px; /* 固定 */
height: 32px; /* 固定 */
background: #f5f5f5; /* 薄いグレー背景 ⭐ */
border-radius: 8px;
```

#### リンクコンテナ（Link）

```css
display: flex;
flex-direction: row;
align-items: center;
gap: 8px;
padding: 0px 0px 0px 8px;
width: 224px; /* 固定 */
height: 32px; /* 固定 */
border-radius: 8px;
background: transparent; /* 外側コンテナが背景を持つ */
cursor: pointer;
box-sizing: border-box;
```

**重要**: アクティブ状態では**外側コンテナ（SidebarMenuItem）に背景色を設定**

---

## 🎨 アイコン仕様

### 共通スタイル

```css
width: 16px; /* 固定 */
height: 16px; /* 固定 */
flex-shrink: 0; /* 縮小しない */
```

### 通常状態

```css
color: #0a0a0a;
stroke: #0a0a0a;
stroke-width: 1.33px;
```

### アクティブ状態

```css
color: #0a0a0a; /* 変化なし */
stroke: #0a0a0a;
stroke-width: 1.33px;
```

**SVG 詳細**:

- サイズ: 16×16px
- ストローク幅: 1.33px
- viewBox: "0 0 16 16"

---

## ✍️ テキスト完全仕様

### 通常状態

#### フォント

```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
font-size: 14px;
font-weight: 400; /* Regular */
line-height: 20px; /* 1.4285714em = 14px × 1.4286 */
letter-spacing: -0.15px; /* -1.074% */
text-align: left;
text-decoration: none;
color: #0a0a0a;
```

#### サイズ

```css
width: 84px; /* テキスト幅（"ロードマップ"の場合） */
height: 20px;
```

---

### アクティブ状態

#### フォント

```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
font-size: 14px;
font-weight: 400; /* Regular - 変化なし ⚠️ */
line-height: 20px;
letter-spacing: -0.15px;
text-align: left;
text-decoration: none;
color: #0a0a0a; /* 変化なし */
```

**重要な注意**:

- Figma のデータでは、アクティブ状態でも font-weight: 400 のまま
- 以前のグローバルナビゲーション分析では 500 でしたが、このコンポーネント単体では 400
- **実装時は統一性のため 500 を推奨**（デザイナーに確認推奨）

---

## 🎨 完全カラー仕様

### 背景色

#### 通常状態

```css
--menu-bg-normal: transparent;
```

#### アクティブ状態

```css
--menu-bg-active: #f5f5f5;
```

#### ホバー状態（推奨追加）

```css
--menu-bg-hover: #f9fafb;
```

### テキスト色

#### 通常状態

```css
--menu-text-normal: #0a0a0a;
```

#### アクティブ状態

```css
--menu-text-active: #0a0a0a; /* 変化なし */
/* 推奨: #171717 で少し濃く */
```

### アイコン色

#### 通常状態

```css
--menu-icon-normal: #0a0a0a;
```

#### アクティブ状態

```css
--menu-icon-active: #0a0a0a; /* 変化なし */
/* 推奨: #171717 で少し濃く */
```

---

## 📏 完全スペーシング仕様

### 外寸

```css
width: 224px; /* 固定 */
height: 32px; /* 固定 */
```

### 内部スペーシング

```css
/* リンクコンテナ */
padding-left: 8px;
padding-right: 0px;
padding-top: 0px;
padding-bottom: 0px;

/* 要素間の間隔 */
gap: 8px; /* アイコンとテキスト */
```

### アイコン

```css
width: 16px;
height: 16px;
```

### テキストエリア

```css
width: auto; /* コンテンツに応じて */
max-width: 200px; /* 224px - 8px(padding) - 16px(icon) */
height: 20px;
```

### 角丸

```css
border-radius: 8px;
```

---

## 🎭 状態別スタイル完全版

### 1. デフォルト（通常）

```css
.sidebar-menu-item {
  display: flex;
  flex-direction: column;
  width: 224px;
  background: transparent;
}

.sidebar-menu-item .link {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 0 0 0 8px;
  width: 224px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 150ms ease;
}

.sidebar-menu-item .icon {
  width: 16px;
  height: 16px;
  color: #0a0a0a;
}

.sidebar-menu-item .text {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.15px;
  color: #0a0a0a;
}
```

---

### 2. ホバー

```css
.sidebar-menu-item:hover .link {
  background: #f9fafb;
}
```

---

### 3. アクティブ（現在のページ）

```css
.sidebar-menu-item.active {
  background: #f5f5f5; /* 外側に背景 */
  border-radius: 8px;
}

.sidebar-menu-item.active .link {
  background: transparent; /* 内側は透明 */
}

.sidebar-menu-item.active .text {
  font-weight: 500; /* 推奨: 太字に */
  color: #171717; /* 推奨: 少し濃く */
}

.sidebar-menu-item.active .icon {
  color: #171717; /* 推奨: 少し濃く */
}
```

---

### 4. クリック時

```css
.sidebar-menu-item .link:active {
  transform: scale(0.98);
  transition: transform 100ms ease;
}
```

---

### 5. フォーカス（キーボード操作）

```css
.sidebar-menu-item .link:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

---

## 💻 実装例

### HTML 構造

```html
<div class="sidebar-menu-item">
  <a href="/roadmap" class="link">
    <svg class="icon" width="16" height="16">
      <!-- アイコンのSVGパス -->
    </svg>
    <span class="text">ロードマップ</span>
  </a>
</div>

<!-- アクティブ状態 -->
<div class="sidebar-menu-item active">
  <a href="/training" class="link" aria-current="page">
    <svg class="icon" width="16" height="16">
      <!-- アイコンのSVGパス -->
    </svg>
    <span class="text">トレーニング</span>
  </a>
</div>
```

---

### React + TypeScript

```typescript
interface SidebarMenuItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  href,
  icon,
  children,
  isActive = false,
  onClick,
}) => {
  return (
    <div className={`sidebar-menu-item ${isActive ? "active" : ""}`}>
      <a
        href={href}
        className="link"
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="icon">{icon}</span>
        <span className="text">{children}</span>
      </a>
    </div>
  );
};

export default SidebarMenuItem;
```

---

### 使用例

```typescript
import { Map, BookOpen, Compass } from 'lucide-react';

<SidebarMenuItem
  href="/roadmap"
  icon={<Map size={16} />}
>
  ロードマップ
</SidebarMenuItem>

<SidebarMenuItem
  href="/training"
  icon={<BookOpen size={16} />}
  isActive={true}
>
  トレーニング
</SidebarMenuItem>

<SidebarMenuItem
  href="/guide"
  icon={<Compass size={16} />}
>
  ガイド
</SidebarMenuItem>
```

---

### CSS（完全版）

```css
.sidebar-menu-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 224px;
  background: transparent;
  box-sizing: border-box;
}

.sidebar-menu-item .link {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 0 0 0 8px;
  width: 224px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 150ms ease, transform 100ms ease;
  box-sizing: border-box;
}

.sidebar-menu-item .link:hover {
  background: #f9fafb;
}

.sidebar-menu-item .link:active {
  transform: scale(0.98);
}

.sidebar-menu-item .link:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.sidebar-menu-item .icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #0a0a0a;
  transition: color 150ms ease;
}

.sidebar-menu-item .text {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.15px;
  color: #0a0a0a;
  transition: color 150ms ease, font-weight 150ms ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* アクティブ状態 */
.sidebar-menu-item.active {
  background: #f5f5f5;
  border-radius: 8px;
  align-items: center;
  padding: 0 0 0 8px;
  height: 32px;
}

.sidebar-menu-item.active .link {
  background: transparent;
  padding: 0;
}

.sidebar-menu-item.active .text {
  font-weight: 500; /* 推奨 */
  color: #171717; /* 推奨 */
}

.sidebar-menu-item.active .icon {
  color: #171717; /* 推奨 */
}

/* アクティブ時はホバー効果を無効化（オプション） */
.sidebar-menu-item.active .link:hover {
  background: transparent;
}
```

---

### Tailwind CSS

```html
<!-- 通常状態 -->
<div class="flex flex-col gap-2.5 w-56">
  <a
    href="/roadmap"
    class="flex flex-row items-center gap-2 pl-2 w-56 h-8 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer no-underline"
  >
    <svg class="w-4 h-4 text-black flex-shrink-0">
      <!-- icon -->
    </svg>
    <span class="text-sm font-normal leading-5 tracking-tight text-black">
      ロードマップ
    </span>
  </a>
</div>

<!-- アクティブ状態 -->
<div
  class="flex flex-col items-center gap-2 pl-2 w-56 h-8 bg-gray-100 rounded-lg"
>
  <a
    href="/training"
    class="flex flex-row items-center gap-2 w-56 h-8 rounded-lg"
    aria-current="page"
  >
    <svg class="w-4 h-4 text-gray-900 flex-shrink-0">
      <!-- icon -->
    </svg>
    <span class="text-sm font-medium leading-5 tracking-tight text-gray-900">
      トレーニング
    </span>
  </a>
</div>
```

---

## ♿ アクセシビリティ仕様

### 必須 ARIA 属性

```html
<!-- 通常リンク -->
<a href="/roadmap" class="link" role="link"> ロードマップ </a>

<!-- アクティブ（現在のページ） -->
<a href="/training" class="link" aria-current="page" role="link">
  トレーニング
</a>
```

### キーボード操作

```
Tab: 次のメニュー項目へ
Shift + Tab: 前のメニュー項目へ
Enter / Space: リンクを開く
```

### フォーカス表示

```css
.link:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 8px;
}
```

### スクリーンリーダー対応

```html
<a href="/roadmap" aria-label="ロードマップページへ移動">
  <svg aria-hidden="true"><!-- icon --></svg>
  ロードマップ
</a>
```

---

## 📱 レスポンシブ仕様

### デスクトップ（1024px 以上）

```css
.sidebar-menu-item {
  width: 224px;
  height: 32px;
}

.sidebar-menu-item .text {
  display: block;
}
```

### タブレット（768px〜1024px）

```css
.sidebar-menu-item {
  width: 224px; /* 変更なし */
  height: 32px;
}
```

### モバイル（768px 未満）

```css
.sidebar-menu-item {
  width: 100%;
  max-width: 280px;
  height: 40px; /* 少し大きく、タップしやすく */
}

.sidebar-menu-item .link {
  height: 40px;
  padding: 0 0 0 12px; /* 少し広く */
  gap: 12px; /* 間隔を広く */
}

.sidebar-menu-item .icon {
  width: 20px; /* 少し大きく */
  height: 20px;
}

.sidebar-menu-item .text {
  font-size: 16px; /* 読みやすく */
  line-height: 24px;
}
```

---

## 🎨 ダークモード対応（オプション）

### ライトモード

```css
.sidebar-menu-item .link {
  background: transparent;
}

.sidebar-menu-item .link:hover {
  background: #f9fafb;
}

.sidebar-menu-item.active {
  background: #f5f5f5;
}

.sidebar-menu-item .text,
.sidebar-menu-item .icon {
  color: #0a0a0a;
}

.sidebar-menu-item.active .text,
.sidebar-menu-item.active .icon {
  color: #171717;
}
```

### ダークモード

```css
@media (prefers-color-scheme: dark) {
  .sidebar-menu-item .link:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .sidebar-menu-item.active {
    background: rgba(255, 255, 255, 0.15);
  }

  .sidebar-menu-item .text,
  .sidebar-menu-item .icon {
    color: rgba(255, 255, 255, 0.9);
  }

  .sidebar-menu-item.active .text,
  .sidebar-menu-item.active .icon {
    color: #ffffff;
  }
}
```

---

## 🔍 デザイントークン

### CSS Variables

```css
:root {
  /* サイズ */
  --menu-item-width: 224px;
  --menu-item-height: 32px;
  --menu-item-padding-left: 8px;
  --menu-item-gap: 8px;
  --menu-item-radius: 8px;

  /* アイコン */
  --menu-icon-size: 16px;

  /* タイポグラフィ */
  --menu-text-size: 14px;
  --menu-text-weight-normal: 400;
  --menu-text-weight-active: 500;
  --menu-text-line-height: 20px;
  --menu-text-letter-spacing: -0.15px;

  /* カラー - 通常 */
  --menu-bg-normal: transparent;
  --menu-bg-hover: #f9fafb;
  --menu-bg-active: #f5f5f5;
  --menu-text-normal: #0a0a0a;
  --menu-text-active: #171717;
  --menu-icon-normal: #0a0a0a;
  --menu-icon-active: #171717;

  /* トランジション */
  --menu-transition-fast: 100ms ease;
  --menu-transition-normal: 150ms ease;
}
```

---

## 📊 完全な寸法まとめ

```
外寸:
  width: 224px (固定)
  height: 32px (固定)

リンクコンテナ:
  padding-left: 8px
  padding-right: 0px
  gap: 8px (アイコンとテキスト)

アイコン:
  width: 16px
  height: 16px

テキスト:
  font-size: 14px
  line-height: 20px
  letter-spacing: -0.15px

角丸:
  border-radius: 8px

通常状態:
  background: transparent
  font-weight: 400
  color: #0A0A0A

アクティブ状態:
  background: #F5F5F5 (外側コンテナ)
  font-weight: 500 (推奨)
  color: #171717 (推奨)
```

---

## 🎯 実装チェックリスト

### 構造

- [ ] 外側コンテナ（SidebarMenuItem）
- [ ] リンクコンテナ（Link）
- [ ] アイコン（16×16px）
- [ ] テキスト

### スタイル - 通常状態

- [ ] 幅: 224px
- [ ] 高さ: 32px
- [ ] padding-left: 8px
- [ ] gap: 8px
- [ ] 角丸: 8px
- [ ] 背景: 透明
- [ ] フォント: Inter, 14px, 400
- [ ] カラー: #0A0A0A

### スタイル - アクティブ状態

- [ ] 外側に背景: #F5F5F5
- [ ] フォントウェイト: 500
- [ ] カラー: #171717

### インタラクション

- [ ] ホバー: 背景 #F9FAFB
- [ ] クリック: scale(0.98)
- [ ] フォーカス: outline 表示

### アクセシビリティ

- [ ] aria-current="page" (アクティブ時)
- [ ] role="link"
- [ ] キーボード操作対応
- [ ] フォーカス表示

### レスポンシブ

- [ ] デスクトップ対応
- [ ] タブレット対応
- [ ] モバイル対応（タップ領域拡大）

---

## 💡 重要な実装ポイント

### 1. アクティブ状態の背景位置

```
❌ 間違い: リンクコンテナに背景
✅ 正解: 外側コンテナ(SidebarMenuItem)に背景
```

### 2. フォントウェイトの推奨

```
Figmaデータ: 400のまま（変化なし）
推奨実装: 500に変更（視覚的な区別のため）
```

### 3. カラーの推奨

```
Figmaデータ: #0A0A0Aのまま
推奨実装: #171717に変更（少し濃く）
```

### 4. ホバーとアクティブの優先順位

```css
/* アクティブ時はホバー効果を上書き */
.sidebar-menu-item.active .link:hover {
  background: transparent;
}
```

---

## 🔧 技術的な注意事項

### パフォーマンス

- トランジションは 150ms 以内（体感速度）
- アイコンは SVG 推奨（スケーラブル）
- font-weight 変更時のレイアウトシフトに注意

### ブラウザ互換性

- Flexbox: IE11+
- CSS transitions: IE10+
- border-radius: IE9+

### アイコンライブラリ推奨

- **Lucide React** (推奨)
- Heroicons
- React Icons
- Feather Icons

---

この仕様書に従えば、メニューアイテムを完璧に実装できます。
