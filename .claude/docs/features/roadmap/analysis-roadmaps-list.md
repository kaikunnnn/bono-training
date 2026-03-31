# 分析レポート: ロードマップ一覧ページ

**作成日**: 2026-03-19
**ステータス**: ✅ 実装完了

---

## 基本情報

| 項目           | 値                       |
| -------------- | ------------------------ |
| **Figma File** | PRD🏠_Roadmap_2026       |
| **File Key**   | `yv6snygemYYsgqwcWIyirf` |
| **node-id**    | `1-9625`                 |
| **ページ名**   | ロードマップ一覧         |
| **実装パス**   | `/roadmaps`              |

---

## ページ構造

```
/roadmaps
├── Sidebar（左 200px）       ← 既存を使用
├── Header（グラデーション背景）
└── メインコンテンツ（roadmapblock）
    ├── PageHeader             ← ✅ 既存コンポーネント使用
    │   ├── label「変化への地図」
    │   ├── title「ロードマップ」
    │   └── description（2行）
    ├── CategoryNav（カテゴリナビ）← ✅ 実装完了
    │   ├── /roadmaps（すべて）
    │   ├── /roadmaps/category/career（転職・キャリアチェンジしたい）
    │   ├── /roadmaps/category/user-centered（ユーザー中心デザイン）
    │   └── /roadmaps/category/skill（基礎スキル）
    ├── Section × n（カテゴリごと）
    │   ├── SectionHeading     ← ✅ 実装完了
    │   │   ├── タイトル（丸ゴシック太字）
    │   │   ├── DescriptionBadge（グレー背景＋絵文字）← ✅ 実装完了
    │   │   └── 下線
    │   └── CardGrid（2列）
    │       └── RoadmapCard × n ← ✅ 既存コンポーネント使用
    └── Divider（セクション間の区切り線）
```

---

## コンポーネント一覧

| #   | コンポーネント名   | ファイルパス                                  | 状態      |
| --- | ------------------ | --------------------------------------------- | --------- |
| 1   | `Sidebar`          | `components/layout/Layout.tsx`                | ✅ 既存   |
| 2   | `PageHeader`       | `components/common/PageHeader.tsx`            | ✅ 既存   |
| 3   | `CategoryNav`      | `components/common/CategoryNav.tsx`           | ✅ 新規   |
| 4   | `SectionHeading`   | `components/common/SectionHeading.tsx`        | ✅ 新規   |
| 5   | `DescriptionBadge` | `components/common/DescriptionBadge.tsx`      | ✅ 新規   |
| 6   | `RoadmapCard`      | `components/roadmap/RoadmapCard.tsx`          | ✅ 既存   |

---

## 新規コンポーネント仕様

### SectionHeading

**ファイル**: `src/components/common/SectionHeading.tsx`

```tsx
interface SectionHeadingProps {
  title: string;           // "転職・キャリアチェンジしたい"
  badge?: ReactNode;       // DescriptionBadge など
  showUnderline?: boolean; // 下線表示（デフォルト: true）
  className?: string;
}
```

**スタイル**:
- タイトル: `font-rounded-mplus font-extrabold text-[22px]`
- 下線: `h-px bg-gray-300 opacity-35`

### DescriptionBadge

**ファイル**: `src/components/common/DescriptionBadge.tsx`

```tsx
interface DescriptionBadgeProps {
  children: ReactNode;
  emoji?: string;    // "🚀"
  className?: string;
}
```

**スタイル**:
- 背景: `bg-gray-100`
- 角丸: `rounded-full`
- パディング: `px-3 py-1`

### CategoryNav

**ファイル**: `src/components/common/CategoryNav.tsx`

```tsx
interface CategoryNavItem {
  label: string;
  href: string;
  count?: number;
}

interface CategoryNavProps {
  items: CategoryNavItem[];
  className?: string;
  sticky?: boolean;  // デフォルト: false
}
```

**特徴**:
- URL遷移型（`<Link>`使用）
- `useLocation()`でアクティブ状態を自動判定
- カウント表示対応（バッジ）
- スティッキー配置オプション

---

## ルーティング

| パス                          | コンポーネント      | 説明                 |
| ----------------------------- | ------------------- | -------------------- |
| `/roadmaps`                   | `RoadmapListPage`   | 全カテゴリ表示       |
| `/roadmaps/category/:categoryId` | `RoadmapListPage` | カテゴリ絞り込み     |
| `/roadmaps/:slug`             | `RoadmapDetail`     | ロードマップ詳細     |

---

## 検証用Devページ

| パス                       | 内容                      |
| -------------------------- | ------------------------- |
| `/dev/section-heading`     | SectionHeading プレビュー |
| `/dev/category-nav`        | CategoryNav プレビュー    |
| `/dev/category-nav/:category` | カテゴリ切替確認       |
| `/dev/roadmap-card`        | RoadmapCard プレビュー    |

---

## データ構造

```typescript
// カテゴリ
interface CategoryData {
  id: string;          // "career"
  title: string;       // "転職・キャリアチェンジしたい"
  description: string; // "未経験からデザイナーへ..."
  emoji: string;       // "🚀"
  roadmaps: RoadmapData[];
}

// ロードマップ
interface RoadmapData {
  slug: string;              // "career-change"
  title: string;
  description: string;
  thumbnailUrl?: string;
  stepCount: number;
  estimatedDuration: string; // "6-9"
  gradientType: GradientType;
}
```

---

## 更新履歴

| 日付       | 内容                                           |
| ---------- | ---------------------------------------------- |
| 2026-03-19 | ✅ 実装完了（全コンポーネント＋ページ組み立て）|
| 2026-03-19 | 既存コンポーネント調査完了、実装計画確定       |
| 2026-03-19 | 初版作成（分析完了）                           |
