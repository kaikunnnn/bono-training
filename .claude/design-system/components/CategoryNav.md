# CategoryNav

**最終更新**: 2026-04-06
**実装ファイル**: `src/components/common/CategoryNav.tsx`
**Figma**: [PRD🏠_topUI_newBONO2026](https://www.figma.com/design/43rIPBQ9lm2b4DO2gElXCO/)

---

## 概要

ページ内のカテゴリ切り替えナビゲーションコンポーネント。
アンダーライン型タブ、アイコン表示、カウント表示に対応。

**WHY（なぜ）**: ユーザーがカテゴリ間を簡単に移動でき、現在位置を視覚的に把握できる

**WHEN（いつ使う）**:
- ✅ 一覧ページのカテゴリフィルター（ロードマップ、レッスン等）
- ✅ ページ内タブナビゲーション
- ✅ URL遷移が必要なタブ切り替え
- ❌ ページ内スクロール（代わりに InPageNav を使用）
- ❌ モーダル内のタブ（代わりに Tabs コンポーネントを使用）

---

## デザイン仕様

### サイズ

- タブ高さ: 64px（padding上下16px含む）
- アンダーライン高さ: 2px（`h-0.5`）
- タブ内gap: 16px（`gap-4`）
- アイコン: 16×16px

### レイアウト

**left揃え（デフォルト）**:
```
┌─────────────────────────────┐
│ すべて  転職  UX  UI         │
│ ━━━━━                        │
└─────────────────────────────┘
```

**center揃え**:
```
┌─────────────────────────────┐
│      すべて  転職  UX  UI    │
│      ━━━━━                   │
└─────────────────────────────┘
```

### タイポグラフィ

**タブラベル**:
- サイズ: 14px（`text-sm`）
- ウェイト: Bold
- アクティブ: `text-black`
- 非アクティブ: `text-gray-500`
- ホバー: `text-gray-800`

**カウントバッジ**:
- サイズ: 12px（`text-xs`）
- ウェイト: Normal
- padding: 6px × 2px（`px-1.5 py-0.5`）
- 角丸: `rounded-full`
- アクティブ: `bg-black text-white`
- 非アクティブ: `bg-gray-100 text-gray-500`

### インタラクション

**アンダーラインアニメーション**:
- トランジション: 0.3s ease-out
- 動き: スライド（現在位置→新しい位置）

**スクロール矢印（showArrows=true時）**:
- サイズ: 32×32px（`w-8 h-8`）
- 背景: `bg-white/90` + shadow
- アイコン: ChevronLeft / ChevronRight（lucide-react）
- 表示条件: デスクトップ（md以上）+ スクロール可能な時のみ

---

## 使用方法

### 基本

```tsx
import CategoryNav from '@/components/common/CategoryNav';

function RoadmapsPage() {
  const navItems = [
    { label: 'すべて', href: '/roadmaps' },
    { label: '転職・キャリアチェンジしたい', href: '/roadmaps/category/career' },
    { label: 'UXを学ぶ', href: '/roadmaps/category/ux' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          label="ロードマップ"
          title="学習の地図"
          description="目的別に体系的に学べるロードマップ"
        />
        <CategoryNav items={navItems} />
        {/* コンテンツ */}
      </div>
    </Layout>
  );
}
```

### Props

```typescript
interface CategoryNavItem {
  /** リンクラベル */
  label: string;

  /** リンク先URL */
  href: string;

  /** アイコン（Lucide React）*/
  icon?: LucideIcon;

  /** アイテム数（任意） */
  count?: number;
}

interface CategoryNavProps {
  /** ナビゲーションアイテム */
  items: CategoryNavItem[];

  /** 追加のクラス名 */
  className?: string;

  /** sticky配置にするか（デフォルト: false） */
  sticky?: boolean;

  /** 配置: 左揃え or 中央揃え（デフォルト: left） */
  align?: 'left' | 'center';

  /** 矢印ボタンを表示するか（デフォルト: false） */
  showArrows?: boolean;
}
```

---

## 実装パターン

### パターン1: シンプルなカテゴリナビ

```tsx
import CategoryNav from '@/components/common/CategoryNav';

function LessonsPage() {
  const items = [
    { label: 'すべて', href: '/lessons' },
    { label: '初級', href: '/lessons/beginner' },
    { label: '中級', href: '/lessons/intermediate' },
    { label: '上級', href: '/lessons/advanced' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          label="レッスン"
          title="学習コンテンツ"
          description="実践的なUIUXデザインを学ぼう"
        />
        <CategoryNav items={items} />
        {/* レッスン一覧 */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: 基本的なカテゴリ切り替え

### パターン2: アイコン付きナビ

```tsx
import CategoryNav from '@/components/common/CategoryNav';
import { Rocket, Target, BookOpen, Palette } from 'lucide-react';

function RoadmapsPage() {
  const items = [
    { label: 'すべて', href: '/roadmaps' },
    { label: '転職したい', href: '/roadmaps/career', icon: Rocket },
    { label: 'UXを学ぶ', href: '/roadmaps/ux', icon: Target },
    { label: '基礎を固める', href: '/roadmaps/basics', icon: BookOpen },
    { label: 'UIスキル', href: '/roadmaps/ui', icon: Palette },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          label="ロードマップ"
          title="学習の地図"
          description="目的別に体系的に学べるロードマップ"
        />
        <CategoryNav items={items} />
        {/* ロードマップ一覧 */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: カテゴリを視覚的に区別したい場合

### パターン3: カウント付きナビ

```tsx
import CategoryNav from '@/components/common/CategoryNav';

function QuestionsPage() {
  const items = [
    { label: 'すべて', href: '/questions', count: 145 },
    { label: '未解決', href: '/questions/unsolved', count: 23 },
    { label: '解決済み', href: '/questions/solved', count: 122 },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          label="Q&A"
          title="みんなの質問"
          description="UIUXデザインに関する質問をみんなで解決しよう"
        />
        <CategoryNav items={items} />
        {/* 質問一覧 */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: 各カテゴリの件数を表示したい場合

### パターン4: Sticky配置 + 中央揃え

```tsx
import CategoryNav from '@/components/common/CategoryNav';

function GalleryPage() {
  const items = [
    { label: 'すべて', href: '/gallery' },
    { label: 'Webデザイン', href: '/gallery/web' },
    { label: 'モバイルアプリ', href: '/gallery/mobile' },
    { label: 'アイコン', href: '/gallery/icons' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          label="ギャラリー"
          title="デザイン集"
          description="参考になるデザインを集めました"
        />
        <CategoryNav
          items={items}
          sticky={true}
          align="center"
        />
        {/* ギャラリーコンテンツ */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: スクロール時もナビを表示し続けたい場合

### パターン5: スクロール矢印付き（多数のタブ）

```tsx
import CategoryNav from '@/components/common/CategoryNav';

function ArticlesPage() {
  const items = [
    { label: 'すべて', href: '/articles' },
    { label: 'UX調査', href: '/articles/ux-research' },
    { label: 'UIデザイン', href: '/articles/ui-design' },
    { label: 'プロトタイピング', href: '/articles/prototyping' },
    { label: 'アクセシビリティ', href: '/articles/a11y' },
    { label: 'デザインシステム', href: '/articles/design-system' },
    { label: 'ユーザビリティ', href: '/articles/usability' },
    { label: 'デザイン戦略', href: '/articles/strategy' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          label="記事"
          title="ナレッジ"
          description="デザインの知識をまとめています"
        />
        <CategoryNav
          items={items}
          showArrows={true}
        />
        {/* 記事一覧 */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: タブが多くて横スクロールが必要な場合

---

## レスポンシブ対応

CategoryNavは自動的にレスポンシブ対応します：

- **モバイル・タブレット**: 横スクロール可能（scrollbar非表示）
- **デスクトップ（md以上）**: 矢印ボタン表示（showArrows=true時）

---

## デザイントークン

### 使用している色トークン

- アクティブタブ: `text-black`
- 非アクティブタブ: `text-gray-500`
- ホバー: `text-gray-800`
- アンダーライン: `bg-black`
- ボーダー: `border-gray-200`

**カウントバッジ**:
- アクティブ: `bg-black text-white`
- 非アクティブ: `bg-gray-100 text-gray-500`

**矢印ボタン**:
- 背景: `bg-white/90`
- アイコン: `text-gray-600`

### 使用しているフォント

- タブラベル: Noto Sans JP, Bold, 14px
- カウントバッジ: Noto Sans JP, Normal, 12px

### 余白・間隔

- タブpadding: 16px（上下）、12px（左右）
- タブ間gap: 16px（`gap-4`）
- アイコンとラベルgap: 6px（`gap-1.5`）

---

## アクティブ判定ロジック

```typescript
// 完全一致
if (location.pathname === href) return true;

// "すべて"以外は前方一致でも判定（サブページ対応）
if (href !== items[0]?.href && location.pathname.startsWith(href + "/")) {
  return true;
}
```

**例**:
- 現在のパス: `/roadmaps/category/career/detail`
- `/roadmaps` → 非アクティブ（"すべて"なので前方一致しない）
- `/roadmaps/category/career` → **アクティブ**（前方一致）

---

## AIへの指示例

### ✅ 良い例

```
「ロードマップ一覧ページを作って。
CategoryNav（.claude/design-system/components/CategoryNav.md参照）を使って、
アイコン付き（Rocket, Target等）で4つのカテゴリを表示。
カウントは不要。align="left"で。」
```

→ AIが正確に理解・実装できる

### ❌ 悪い例

```
「カテゴリタブ作って」
```

→ どのコンポーネント？どのスタイル？AIが推測してしまう

---

## 関連コンポーネント

- **PageHeader**: CategoryNavの直前に配置されることが多い
- **SectionHeading**: ページ内のセクション見出し
- **InPageNav**: ページ内スクロール用ナビゲーション

---

## 注意事項

- ⚠️ アクティブ判定は React Router の `useLocation` に依存
- ⚠️ アイコンは Lucide React のみ対応（他のアイコンライブラリは不可）
- ⚠️ sticky配置時は `top-16`（モバイルヘッダーの下）
- ⚠️ スクロール矢印はデスクトップ（md以上）のみ表示
- ⚠️ アンダーラインアニメーションは CSS transitions（JavaScript計算）

---

## アクセシビリティ

- `<nav>` タグで適切なランドマーク
- 矢印ボタンに `aria-label` 設定済み
- キーボード操作対応（標準の `<Link>` 使用）
- フォーカス可能な要素の視覚的フィードバック

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-04-06 | 初版作成（CategoryNavの仕様を文書化） |
