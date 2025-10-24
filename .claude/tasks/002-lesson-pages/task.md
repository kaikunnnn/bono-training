# レッスン一覧ページ実装タスク

## 📋 実装概要

- **対象**: レッスン一覧ページ（初期バージョン）
- **URL**: `/lessons`（現在の `/courses` から変更）
- **データ管理**: 静的データファイル (`src/data/lessons.ts`)
- **背景色**: `#FFFFFF`（統一）
- **レスポンシブ**: デスクトップ（3列）/ タブレット（2列）/ モバイル（1列）

---

## 🎯 実装ステップ

### ステップ1: ルーティング変更

#### 1-1. サイドバーのリンクを変更

**ファイル**: `src/components/layout/Sidebar/index.tsx`

**変更箇所**: 72-77行目

```typescript
// 変更前
<SidebarMenuItem
  href="/courses"
  icon={<MenuIcons.lesson size={ICON_SIZE} />}
  isActive={isActive("/courses")}
>
  レッスン
</SidebarMenuItem>

// 変更後
<SidebarMenuItem
  href="/lessons"
  icon={<MenuIcons.lesson size={ICON_SIZE} />}
  isActive={isActive("/lessons")}
>
  レッスン
</SidebarMenuItem>
```

**やるべきこと**:
- [ ] href を `/courses` → `/lessons` に変更
- [ ] isActive の引数を `/courses` → `/lessons` に変更

---

#### 1-2. App.tsx にルートを追加

**ファイル**: `src/App.tsx`

**追加箇所**: 84行目あたり（`/content` の前）

```typescript
import Lessons from "./pages/Lessons";

// Routes内に追加
<Route path="/lessons" element={<Lessons />} />
```

**やるべきこと**:
- [ ] Lessonsコンポーネントをインポート
- [ ] `/lessons` ルートを追加

---

### ステップ2: 静的データ構造の定義

#### 2-1. 型定義ファイルを作成

**新規ファイル**: `src/types/lesson.ts`

**内容**:
```typescript
/**
 * レッスンの型定義
 */
export interface Lesson {
  id: string;              // 一意のID
  category: string;        // カテゴリー（例: "情報設計", "UIデザイン"）
  title: string;           // レッスンタイトル
  description: string;     // 説明文（2-3行程度）
  coverImage: string;      // カバー画像のパス
  slug: string;            // URL用のスラッグ（将来の詳細ページ用）
}
```

**やるべきこと**:
- [ ] `src/types/lesson.ts` を作成
- [ ] Lesson インターフェースを定義
- [ ] JSDoc コメントを追加

---

#### 2-2. レッスンデータファイルを作成

**新規ファイル**: `src/data/lessons.ts`

**内容**:
```typescript
import { Lesson } from '@/types/lesson';

/**
 * レッスン一覧（静的データ）
 *
 * 将来的にマークダウンまたはCMSから取得する予定
 */
export const lessons: Lesson[] = [
  {
    id: '1',
    category: '情報設計',
    title: 'ゼロからはじめるUI情報設計',
    description: '「どこに何をなぜ置くべきか？」の情報設計基礎をトレースしながら身につけられます。必須!',
    coverImage: '/assets/lesson-covers/lesson-01.jpg',
    slug: 'ui-information-architecture',
  },
  {
    id: '2',
    category: 'UIデザイン',
    title: 'UIデザインの基本原則',
    description: 'デザインの4大原則を実践的に学び、美しく使いやすいUIを作るスキルを習得できます。',
    coverImage: '/assets/lesson-covers/lesson-02.jpg',
    slug: 'ui-design-principles',
  },
  {
    id: '3',
    category: '情報設計',
    title: 'ナビゲーション設計入門',
    description: 'ユーザーが迷わないナビゲーション設計の考え方と実装方法を学びます。',
    coverImage: '/assets/lesson-covers/lesson-03.jpg',
    slug: 'navigation-design',
  },
  // 初期は3件、後で追加可能
];

/**
 * IDでレッスンを取得
 */
export const getLessonById = (id: string): Lesson | undefined => {
  return lessons.find(lesson => lesson.id === id);
};

/**
 * スラッグでレッスンを取得
 */
export const getLessonBySlug = (slug: string): Lesson | undefined => {
  return lessons.find(lesson => lesson.slug === slug);
};

/**
 * カテゴリーでレッスンを絞り込み
 */
export const getLessonsByCategory = (category: string): Lesson[] => {
  return lessons.filter(lesson => lesson.category === category);
};
```

**やるべきこと**:
- [ ] `src/data/lessons.ts` を作成
- [ ] 初期データ3件を定義
- [ ] ヘルパー関数を実装（getLessonById, getLessonBySlug, getLessonsByCategory）
- [ ] JSDoc コメントを追加

**注意**:
- カバー画像は仮のパスで実装（実際の画像は後で配置）
- 将来的にCMS化する際の拡張性を考慮した構造

---

### ステップ3: 共通コンポーネント作成

#### 3-1. PageTopHeading コンポーネント

**新規ファイル**: `src/components/common/PageTopHeading.tsx`

**仕様**:
- ページトップのタイトル・サブタイトル表示
- Figma仕様: `heading-block_pagetop`
- 幅: 1088px（デスクトップ）→ レスポンシブ対応

**Props**:
```typescript
interface PageTopHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}
```

**スタイル**:
- タイトル: 32px, Noto Sans JP, font-weight 700, color #000000
- サブタイトル: 13px, Inter, font-weight 400, color rgba(0,0,0,0.79)
- gap: 7px

**やるべきこと**:
- [ ] コンポーネントファイル作成
- [ ] Props型定義
- [ ] Tailwind CSSでスタイリング
- [ ] レスポンシブ対応（モバイル: 24px, タブレット: 28px）
- [ ] cn() ユーティリティで className をマージ

**実装例**:
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface PageTopHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const PageTopHeading: React.FC<PageTopHeadingProps> = ({
  title,
  subtitle,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-[7px] w-full max-w-[1088px]', className)}>
      <h1 className="font-noto-sans-jp text-[32px] md:text-[28px] sm:text-[24px] font-bold leading-none tracking-[0.07px] text-black m-0">
        {title}
      </h1>
      {subtitle && (
        <p className="font-inter text-[13px] md:text-[14px] font-normal leading-[1.615em] tracking-tight text-black/79 m-0">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageTopHeading;
```

---

#### 3-2. HeadingBlock2 コンポーネント

**新規ファイル**: `src/components/common/HeadingBlock2.tsx`

**仕様**:
- セクション見出し表示
- Figma仕様: `heading-block_2`
- 幅: 100%（親要素に合わせる）

**Props**:
```typescript
interface HeadingBlock2Props {
  children: React.ReactNode;
  className?: string;
}
```

**スタイル**:
- フォント: 20px, Noto Sans JP, font-weight 700, color #101828
- line-height: 1.6em
- letter-spacing: 0.07px

**やるべきこと**:
- [ ] コンポーネントファイル作成
- [ ] Props型定義
- [ ] Tailwind CSSでスタイリング
- [ ] cn() ユーティリティで className をマージ

**実装例**:
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface HeadingBlock2Props {
  children: React.ReactNode;
  className?: string;
}

const HeadingBlock2: React.FC<HeadingBlock2Props> = ({
  children,
  className,
}) => {
  return (
    <h2 className={cn(
      'font-noto-sans-jp text-xl font-bold leading-[1.6em] tracking-[0.07px] text-[#101828] m-0',
      className
    )}>
      {children}
    </h2>
  );
};

export default HeadingBlock2;
```

---

#### 3-3. LessonCard コンポーネント

**新規ファイル**: `src/components/lessons/LessonCard.tsx`

**仕様**:
- レッスンカード表示
- Figma仕様: `item_lesson`
- 幅: 320px（デスクトップ）→ レスポンシブ対応
- ホバー効果: 上に4pxスライド + シャドウ

**Props**:
```typescript
interface LessonCardProps {
  lesson: Lesson;
  onClick?: () => void;
  className?: string;
}
```

**構造**:
```
.item-lesson (320px)
└── .overlay
    ├── .upper (画像エリア: 160px高さ)
    │   └── .wrap
    │       └── img (カバー画像: 85.55x128px)
    └── .container (情報エリア)
        ├── .info-group
        │   ├── .category
        │   └── .title
        └── .description
```

**スタイル詳細**:
- カード: border 1px rgba(0,0,0,0.05), border-radius 12px
- 画像エリア背景: #ffffff
- 情報エリア背景: #f3f3f4
- カテゴリー: 13px, font-weight 350, letter-spacing 1px
- タイトル: 16px, font-weight 700, letter-spacing 0.75px
- 説明文: 13px, font-weight 350, letter-spacing 1px
- ホバー: `transform: translateY(-4px)`, `box-shadow: 0 8px 24px rgba(0,0,0,0.12)`

**やるべきこと**:
- [ ] コンポーネントファイル作成
- [ ] Props型定義
- [ ] Lessonをインポート
- [ ] Tailwind CSSでスタイリング
- [ ] ホバー・アクティブ効果を実装
- [ ] レスポンシブ対応（モバイル: 100%幅）
- [ ] カバー画像の alt 属性を適切に設定
- [ ] クリック時のonClick処理

**実装例**:
```typescript
import React from 'react';
import { Lesson } from '@/types/lesson';
import { cn } from '@/lib/utils';

interface LessonCardProps {
  lesson: Lesson;
  onClick?: () => void;
  className?: string;
}

const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onClick,
  className,
}) => {
  return (
    <article
      className={cn(
        'flex w-80 md:w-full border border-black/5 rounded-xl overflow-hidden cursor-pointer',
        'transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]',
        'hover:border-black/10 active:translate-y-[-2px]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col w-full bg-black/[0.04]">
        {/* 画像エリア */}
        <div className="flex justify-center items-center p-[10.33px] w-full h-40 bg-white rounded-t-xl">
          <div className="rounded-r-[8.77px] shadow-[1px_1px_12px_0_rgba(0,0,0,0.24)]">
            <img
              src={lesson.coverImage}
              alt={`${lesson.title}のカバー画像`}
              className="w-[85.55px] h-32 object-cover block"
            />
          </div>
        </div>

        {/* 情報エリア */}
        <div className="flex flex-col gap-1 px-5 py-4 bg-[#F3F3F4]">
          <div className="flex flex-col gap-0.5">
            <p className="font-noto-sans-jp text-[13px] font-light leading-[1.938em] tracking-[1px] text-[#151834] m-0">
              {lesson.category}
            </p>
            <h3 className="font-noto-sans-jp text-base font-bold leading-[1.48em] tracking-[0.75px] text-[#151834] m-0">
              {lesson.title}
            </h3>
          </div>
          <p className="font-noto-sans-jp text-[13px] font-light leading-[1.6em] tracking-[1px] text-[#151834] m-0">
            {lesson.description}
          </p>
        </div>
      </div>
    </article>
  );
};

export default LessonCard;
```

---

### ステップ4: レッスン一覧ページ作成

#### 4-1. ページコンポーネント作成

**新規ファイル**: `src/pages/Lessons/index.tsx`

**仕様**:
- Layout コンポーネントでラップ
- PageTopHeading で "レッスン" タイトル表示
- HeadingBlock2 で "レッスン一覧" セクション見出し
- LessonCard をグリッド表示

**構造**:
```
<Layout>
  <div className="app-layout">
    <div className="search-page">
      <PageTopHeading />
      <div className="content-section">
        <HeadingBlock2 />
        <div className="list">
          {lessons.map(lesson => <LessonCard />)}
        </div>
      </div>
    </div>
  </div>
</Layout>
```

**スタイル**:
- app-layout: padding 48px 0, 背景 #ffffff（統一）
- search-page: gap 40px
- content-section: gap 24px, 最大幅 1088px
- list: flexbox, flex-wrap, gap 20px
  - デスクトップ: 3列
  - タブレット: 2列
  - モバイル: 1列

**やるべきこと**:
- [ ] `src/pages/Lessons/index.tsx` を作成
- [ ] 必要なコンポーネント・データをインポート
- [ ] Layout でラップ
- [ ] レスポンシブグリッドを実装
- [ ] カードクリック時の処理（将来的に詳細ページへ遷移）
- [ ] useNavigate でルーティング準備

**実装例**:
```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageTopHeading from '@/components/common/PageTopHeading';
import HeadingBlock2 from '@/components/common/HeadingBlock2';
import LessonCard from '@/components/lessons/LessonCard';
import { lessons } from '@/data/lessons';

const Lessons: React.FC = () => {
  const navigate = useNavigate();

  const handleLessonClick = (slug: string) => {
    // 将来的に詳細ページへ遷移
    console.log('Navigate to:', `/lessons/${slug}`);
    // navigate(`/lessons/${slug}`);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center py-12 px-4 md:px-6 lg:px-0 bg-white">
        <div className="flex flex-col justify-center gap-10 w-full max-w-[1088px]">
          {/* ページヘッダー */}
          <PageTopHeading
            title="レッスン"
            subtitle="あなたに合った学習コンテンツを見つけよう"
          />

          {/* メインコンテンツ */}
          <div className="flex flex-col gap-6 w-full">
            <HeadingBlock2>レッスン一覧</HeadingBlock2>

            {/* レッスンリスト */}
            <div className="flex flex-row flex-wrap gap-5 w-full justify-start">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onClick={() => handleLessonClick(lesson.slug)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Lessons;
```

---

### ステップ5: レスポンシブ対応

#### 5-1. ブレークポイント定義

**Tailwind設定**: `tailwind.config.ts` で既に定義済み
```
sm: 640px   (モバイル)
md: 768px   (タブレット)
lg: 1024px  (デスクトップ)
xl: 1280px
2xl: 1400px
```

#### 5-2. 各コンポーネントのレスポンシブ対応

**PageTopHeading**:
- デスクトップ: h1 32px
- タブレット: h1 28px
- モバイル: h1 24px

**LessonCard**:
- デスクトップ: 320px固定
- タブレット以下: 100%幅

**Lessons ページ（グリッド）**:
- デスクトップ: 3列（320px × 3 + gap 20px × 2 = 1000px < 1088px）
- タブレット: 2列（50% - gap）
- モバイル: 1列（100%）

**やるべきこと**:
- [ ] PageTopHeading にレスポンシブクラス追加
- [ ] LessonCard の幅をレスポンシブ対応
- [ ] Lessons ページのグリッドをレスポンシブ対応
- [ ] モバイルで padding を調整（px-4）

---

### ステップ6: 動作確認とテスト

#### 6-1. ローカル環境での確認

**確認項目**:
- [ ] `/lessons` にアクセスできる
- [ ] サイドバーの「レッスン」をクリックして遷移
- [ ] ページタイトルとサブタイトルが正しく表示
- [ ] レッスンカードが3件表示
- [ ] カードのホバー効果が動作
- [ ] カードクリックでコンソールログが出力

**コマンド**:
```bash
npm run dev
```

#### 6-2. レスポンシブ確認

**確認項目**:
- [ ] デスクトップ（1024px以上）: 3列グリッド
- [ ] タブレット（768px-1023px）: 2列グリッド
- [ ] モバイル（767px以下）: 1列グリッド
- [ ] タイトルサイズの変化
- [ ] カード幅の変化

**ツール**:
- Chrome DevTools のデバイスモード
- Firefox のレスポンシブデザインモード

#### 6-3. ビルド確認

**確認項目**:
- [ ] ビルドエラーがない
- [ ] 型エラーがない
- [ ] Lintエラーがない

**コマンド**:
```bash
npm run build
npm run lint
npx tsc --noEmit
```

---

## 📂 作成・変更するファイル一覧

### 新規作成（7ファイル）

1. `src/types/lesson.ts` - Lesson型定義
2. `src/data/lessons.ts` - 静的レッスンデータ
3. `src/components/common/PageTopHeading.tsx` - ページトップ見出し
4. `src/components/common/HeadingBlock2.tsx` - セクション見出し
5. `src/components/lessons/LessonCard.tsx` - レッスンカード
6. `src/pages/Lessons/index.tsx` - レッスン一覧ページ
7. `.claude/tasks/002-lesson-pages/task.md` - このファイル

### 変更（2ファイル）

1. `src/components/layout/Sidebar/index.tsx` - `/courses` → `/lessons`
2. `src/App.tsx` - ルート追加

---

## 🎨 デザイン仕様の調整

### Figma仕様からの変更点

1. **背景色**:
   - Figma: `rgba(255, 255, 255, 0.2)`
   - 実装: `#FFFFFF`（ユーザー要望により統一）

2. **レスポンシブ対応**:
   - Figma仕様に加えて、タブレット・モバイル対応を追加

3. **カバー画像**:
   - 初期は仮画像パスを使用
   - 実際の画像は `/public/assets/lesson-covers/` に配置予定

---

## ⚠️ 注意事項

### カバー画像について

現時点では仮のパスを指定していますが、実際の画像ファイルは存在しません。

**対応方法**:
1. 仮画像パスのまま実装
2. 画像が存在しない場合はブラウザのデフォルト表示（broken image）
3. 後で実際の画像を `/public/assets/lesson-covers/` に配置

**または**:
- プレースホルダー画像を使用
- 画像がない場合のフォールバック表示を実装

### 将来の拡張性

このタスクで実装する静的データ構造は、将来以下のように拡張可能です:

1. **マークダウンファイル管理**:
   ```
   content/lessons/
   ├── ui-information-architecture.md
   ├── ui-design-principles.md
   └── navigation-design.md
   ```

2. **CMS連携**:
   - Supabase
   - Contentful
   - Strapi など

3. **カテゴリー・タグフィルタリング**:
   - カテゴリー別表示
   - タグ検索機能

4. **ページネーション**:
   - 無限スクロール
   - ページ番号

---

## ✅ 完了チェックリスト

### コード実装

- [ ] 型定義ファイル作成
- [ ] 静的データファイル作成
- [ ] PageTopHeading コンポーネント作成
- [ ] HeadingBlock2 コンポーネント作成
- [ ] LessonCard コンポーネント作成
- [ ] Lessons ページ作成
- [ ] ルーティング変更（Sidebar）
- [ ] ルーティング追加（App.tsx）

### スタイリング

- [ ] Figma仕様通りのスタイル実装
- [ ] 背景色を #FFFFFF に統一
- [ ] ホバー効果実装
- [ ] レスポンシブ対応

### テスト・確認

- [ ] ローカル環境で動作確認
- [ ] デスクトップ表示確認（3列）
- [ ] タブレット表示確認（2列）
- [ ] モバイル表示確認（1列）
- [ ] ホバー効果確認
- [ ] クリック動作確認
- [ ] ビルド成功確認
- [ ] Lint通過確認
- [ ] 型チェック通過確認

---

## 📝 実装後のタスク

このタスク完了後、以下のタスクに進む予定:

1. **レッスン詳細ページ** (`/lessons/:slug`)
2. **レッスン内コンテンツページ** (`/lessons/:slug/:contentId`)
3. **カテゴリーフィルター機能**
4. **検索機能**

---

## 🚀 実装開始

この task.md を基に、ステップ1から順番に実装を進めます。
