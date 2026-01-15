# レッスン詳細ページ リデザイン

**最終更新**: 2025-01-15
**ステータス**: 準備中（新デザイン確認待ち）

---

## 現在の構成

### ページ
- `src/pages/LessonDetail.tsx`

### コンポーネント（7個）

| コンポーネント | ファイルパス | 用途 |
|---------------|-------------|------|
| LessonHero | `src/components/lesson/LessonHero.tsx` | ヒーローセクション（タイトル、説明、スタートボタン） |
| LessonTabs | `src/components/lesson/LessonTabs.tsx` | タブ切り替え（コンテンツ/概要） |
| QuestList | `src/components/lesson/QuestList.tsx` | クエスト一覧コンテナ |
| QuestCard | `src/components/lesson/QuestCard.tsx` | 個別クエストカード |
| ContentItem | `src/components/lesson/ContentItem.tsx` | 記事アイテム（クエスト内） |
| OverviewTab | `src/components/lesson/OverviewTab.tsx` | 概要・目的タブ |
| InfoBlock | `src/components/lesson/InfoBlock.tsx` | カテゴリ/プランなどの情報表示 |

---

## 現在のレイアウト構造

```
LessonDetail.tsx
├── Layout (共通レイアウト)
│   └── div.min-h-screen.bg-base
│       ├── LessonHero
│       │   ├── グラデーション背景 (180-216px)
│       │   ├── 楕円弧要素 (arc-wrapper)
│       │   ├── 戻るボタン (←レッスン一覧)
│       │   ├── アイコン画像 (絶対配置)
│       │   ├── タイトル (h1)
│       │   ├── 説明文
│       │   ├── InfoBlock[] (カテゴリ、プラン)
│       │   └── スタートボタン
│       │
│       └── LessonTabs
│           ├── TabsList (コンテンツ | 概要・目的)
│           ├── TabContent[content]
│           │   └── QuestList
│           │       ├── contentHeading (h2)
│           │       └── QuestCard[]
│           │           ├── クエスト番号 + チェック
│           │           ├── 縦ボーダー
│           │           └── カード本体
│           │               ├── ヘッダー (タイトル、ゴール、メタ)
│           │               └── ContentItem[]
│           │
│           └── TabContent[overview]
│               └── OverviewTab
│                   ├── レッスンの目的 (箇条書き)
│                   └── 概要 (リッチテキスト)
```

---

## コンポーネント詳細

### 1. LessonHero

**Props:**
```tsx
interface LessonHeroProps {
  title: string;
  description?: string;
  iconImage?: any;
  iconImageUrl?: string;
  category?: string;
  isPremium?: boolean;
  onStartClick?: () => void;
  canStart?: boolean;
}
```

**現在のスタイル:**
- ヒーロー背景: `bg-hero-gradient` (180-216px)
- 楕円弧: CSS `.arc-wrapper` + `.ellipse`
- アイコン: 絶対配置、top:-100px
- タイトル: `text-2xl md:text-4xl font-bold`
- 中央揃えレイアウト

---

### 2. LessonTabs

**Props:**
```tsx
interface LessonTabsProps {
  contentTab: React.ReactNode;
  overviewTab: React.ReactNode;
}
```

**現在のスタイル:**
- radix-ui/react-tabs 使用
- タブ: `コンテンツ` / `概要・目的`
- アクティブ時: 下線ボーダー

---

### 3. QuestCard

**Props:**
```tsx
interface QuestCardProps {
  questNumber: number;
  title: string;
  description?: string;
  goal?: string;
  estTimeMins?: number;
  articles: Article[];
  completedCount?: number;
  completedArticleIds?: string[];
}
```

**現在のスタイル:**
- 左側: クエスト番号 + 縦点線ボーダー
- カード: `bg-lesson-quest-card-bg rounded-[16px] md:rounded-[24px]`
- 完了時: 緑チェックマーク + 緑点線

---

### 4. ContentItem

**Props:**
```tsx
interface ContentItemProps {
  articleNumber: number;
  title: string;
  slug: string;
  thumbnail?: any;
  thumbnailUrl?: string;
  videoDuration?: number;
  isCompleted?: boolean;
  isPremium?: boolean;
}
```

**現在のスタイル:**
- 横並び: 番号 | サムネ | タイトル+時間 | 矢印
- 完了時: 緑チェック表示
- ロック時: ロックアイコン表示

---

## 新デザインとの比較（スクショ待ち）

### 変更予想箇所

| 領域 | 現在 | 変更可能性 |
|------|------|-----------|
| ヒーロー | グラデ+楕円弧 | レイアウト変更? |
| タブ | 2タブ構成 | 削除/変更? |
| クエストカード | 縦線+カード | スタイル変更? |
| 記事アイテム | 横並び | スタイル変更? |

---

## 次のアクション

- [ ] 新デザインスクショを確認
- [ ] 変更箇所を特定
- [ ] コンポーネントごとに仕様を整理
- [ ] 実装計画を作成
