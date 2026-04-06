# Layout

**最終更新**: 2026-04-06
**実装ファイル**: `src/components/layout/Layout.tsx`
**Figma**: [PRD🏠_topUI_newBONO2026](https://www.figma.com/design/43rIPBQ9lm2b4DO2gElXCO/)

---

## 概要

全ページで使用される基本レイアウトコンポーネント。
Sidebar、Header、Footer、背景グラデーションを統一管理。

**WHY（なぜ）**: ページ全体の構造とナビゲーションを一貫性を持って提供する

**WHEN（いつ使う）**:
- ✅ 全てのページ（トップページ、一覧、詳細、ダッシュボード等）
- ✅ Sidebar + ヘッダーグラデーション + Footerが必要なページ
- ❌ ランディングページ（完全カスタムデザインの場合）
- ❌ 認証画面（シンプルレイアウトの場合）

---

## デザイン仕様

### レイアウト構造

**デスクトップ（1280px以上）**:
```
┌─────────┬──────────────────────────┐
│ Sidebar │   Header Gradient        │
│ (200px) │   ┌───────────────────┐  │
│  固定   │   │  メインコンテンツ │  │
│         │   │                   │  │
│         │   └───────────────────┘  │
│         │   Footer                 │
└─────────┴──────────────────────────┘
```

**モバイル・タブレット（1280px未満）**:
```
┌──────────────────────────────┐
│  ☰ Hamburger   BONO Logo     │ ← ヘッダーバー（56px）
├──────────────────────────────┤
│   Header Gradient            │
│   ┌───────────────────────┐  │
│   │  メインコンテンツ     │  │
│   │                       │  │
│   └───────────────────────┘  │
│   Footer                     │
└──────────────────────────────┘
```

### サイズ

- Sidebar幅: 200px（デスクトップのみ）
- モバイルヘッダー高さ: 56px
- Sidebarシート幅（モバイル）: 280px

### ヘッダーグラデーション

**default（通常ページ）**:
- 高さ: 148px
- グラデーション: `rgb(230,230,239) → rgb(250,242,237) → rgb(249,248,246) → 透明`
- 方向: 上から下（180deg）
- フェードイン: 1秒（50ms遅延後）

**top（トップページ専用）**:
- 高さ: 600px (mobile), 700px (tablet), 800px (desktop)
- グラデーション: `rgba(226,232,228,0.6) → rgba(242,243,240,0.3) → 透明`
- 方向: 上から下（180deg）
- フェードイン: 1秒（50ms遅延後）

**none**:
- グラデーションなし

### インタラクション

**モバイル・タブレット**:
- スクロール前: ヘッダー背景透明
- スクロール後: `backdrop-blur-sm bg-white/50`（ガラスモーフィズム）
- トランジション: `0.2s`

**ハンバーガーメニュー**:
- サイズ: 40×40px
- 背景: 白色、影付き
- アイコン: Menu（lucide-react）
- 開閉: Sheet（Shadcn/ui）

---

## 使用方法

### 基本

```tsx
import Layout from '@/components/layout/Layout';

function MyPage() {
  return (
    <Layout>
      {/* ページコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        <h1>ページタイトル</h1>
        <p>コンテンツ...</p>
      </div>
    </Layout>
  );
}
```

### Props

```typescript
interface LayoutProps {
  /** ページコンテンツ */
  children: React.ReactNode;

  /** 追加のクラス名 */
  className?: string;

  /** ヘッダーグラデーションの種類 */
  headerGradient?: 'default' | 'top' | 'none';
}
```

---

## 実装パターン

### パターン1: 通常ページ（デフォルトグラデーション）

```tsx
import Layout from '@/components/layout/Layout';

function RoadmapsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">ロードマップ一覧</h1>
        {/* コンテンツ */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: ロードマップ一覧、記事一覧、ダッシュボード等の通常ページ

### パターン2: トップページ（専用グラデーション）

```tsx
import Layout from '@/components/layout/Layout';

function TopPage() {
  return (
    <Layout headerGradient="top">
      {/* ヒーローセクション */}
      <section className="relative min-h-screen">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold">Welcome to BONO</h1>
        </div>
      </section>
      {/* その他のセクション */}
    </Layout>
  );
}
```

**使用シーン**: トップページのみ

### パターン3: グラデーションなし

```tsx
import Layout from '@/components/layout/Layout';

function SettingsPage() {
  return (
    <Layout headerGradient="none">
      <div className="container mx-auto px-4 py-8">
        <h1>設定</h1>
        {/* シンプルなコンテンツ */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: 設定ページ、フォーム等のシンプルなページ

### パターン4: カスタムクラス追加

```tsx
import Layout from '@/components/layout/Layout';

function CustomPage() {
  return (
    <Layout className="bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <h1>カスタムページ</h1>
      </div>
    </Layout>
  );
}
```

**使用シーン**: 独自の背景デザインが必要なページ

---

## レスポンシブ対応

Layoutは自動的にレスポンシブ対応します：

- **モバイル・タブレット（〜1279px）**: ハンバーガーメニュー + 上部固定ヘッダー
- **デスクトップ（1280px〜）**: 左固定Sidebar（200px）

メインコンテンツエリアの幅：
- モバイル・タブレット: `width: 100%`
- デスクトップ: `width: calc(100% - 200px)`, `margin-left: 200px`

---

## デザイントークン

### 使用している色トークン

- 背景: `bg-base`（カスタムカラー `#F9F9F7`）
- ヘッダー（スクロール後）: `bg-white/50` + `backdrop-blur-sm`
- ハンバーガーボタン: `bg-white`, `shadow-md`

### 使用しているサイズトークン

- Sidebar幅: `200px`
- モバイルヘッダー高さ: `56px` (`h-14`)
- ハンバーガーボタン: `40px` (`w-10 h-10`)
- Sidebarシート幅: `280px`

### Z-indexレイヤー

- ヘッダーグラデーション: `z-0`（最背面）
- Sidebar（デスクトップ）: `z-10`
- モバイルヘッダーバー: `z-50`
- メインコンテンツ: `z-[1]`

---

## 内包コンポーネント

Layoutは以下のコンポーネントを内包します：

### Sidebar
- 場所: `src/components/layout/Sidebar.tsx`
- 役割: ナビゲーションメニュー
- デスクトップ: 固定表示（200px）
- モバイル: Sheet内で開閉

### Footer
- 場所: `src/components/layout/Footer.tsx`
- 役割: フッター情報
- 配置: コンテンツ最下部

### Logo
- 場所: `src/components/common/Logo.tsx`
- 役割: BONOロゴ表示
- サイズ: 68×20px
- 配置: モバイルヘッダー中央

---

## AIへの指示例

### ✅ 良い例

```
「新しいロードマップ一覧ページを作って。
Layout（.claude/design-system/components/Layout.md参照）で
ラップして、headerGradientはデフォルトで。
コンテナは container mx-auto px-4 py-8 で。」
```

→ AIが正確に理解・実装できる

### ❌ 悪い例

```
「ページ作って、ヘッダーとサイドバー付けて」
```

→ どのレイアウト？どのコンポーネント？AIが推測してしまう

---

## 関連コンポーネント

- **Sidebar**: ナビゲーションメニュー
- **Footer**: フッター
- **Logo**: BONOロゴ
- **Sheet**: Sidebarの開閉UI（Shadcn/ui）
- **Button**: ハンバーガーボタン（Shadcn/ui）

---

## 注意事項

- ⚠️ `headerGradient="top"` はトップページ専用（高さ800pxまで）
- ⚠️ デスクトップ切り替えは `xl:` ブレークポイント（1280px）
- ⚠️ メインコンテンツには `pt-14 xl:pt-0` が自動適用される（ヘッダー分の余白）
- ⚠️ グラデーションは `fixed` 配置なのでスクロールしても固定表示
- ⚠️ `min-w-0` が適用されているため、子要素の幅が親を超えない

---

## アクセシビリティ

- ハンバーガーボタンに `aria-label` と `aria-expanded` 設定済み
- キーボード操作対応（Sheet自動対応）
- フォーカス可能な要素の視覚的フィードバック

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-04-06 | 初版作成（Layoutの仕様を文書化） |
