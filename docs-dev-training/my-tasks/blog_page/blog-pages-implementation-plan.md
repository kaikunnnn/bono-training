# BONO Blog 実装計画書（99frontend デザイン完全再現版）

## 📋 プロジェクト概要

**目的**: 99frontend ディレクトリのデザイン仕様を完全に再現した BONO ブログの実装
**技術スタック**: React 18 + TypeScript + Vite + TailwindCSS
**実装範囲**: `/blog` 以下のみ（既存ページには影響なし）
**デザイン基準**: `.claude/docs/blog/99frontend/` の仕様書

---

## 🎯 実装進捗状況

**最終更新**: 2025年11月10日

| Phase | 内容 | 状態 |
|-------|------|------|
| Phase 1 | デザイントークンとフォント設定 | ✅ **完了** |
| Phase 2 | 共通コンポーネント実装（7つ） | ✅ **完了** |
| Phase 3 | メインページ（/blog）実装 | ✅ **完了** |
| Phase 4 | 詳細ページ（/blog/:slug）実装 | 🔄 **未実装** |
| Phase 5 | カテゴリページ実装 | 🔄 **未実装** |
| Phase 6 | スタイリングと最適化 | 🔄 **未実装** |
| Phase 7 | テストと品質保証 | 🔄 **未実装** |
| Phase 8 | デプロイ前最終確認 | 🔄 **未実装** |

**進捗率**: 37.5% (3/8 Phase 完了)

### ✅ 完了した実装

#### Phase 1: デザイントークンとフォント設定
- ✅ `src/styles/design-tokens/colors.ts` 作成
- ✅ `src/styles/design-tokens/typography.ts` 作成
- ✅ `src/styles/design-tokens/spacing.ts` 作成
- ✅ `src/styles/blog.css` 作成
- ✅ `index.html` に Google Fonts 追加（Noto Sans JP, Hind）
- ✅ `tailwind.config.ts` にフォント設定追加

#### Phase 2: 共通コンポーネント実装
- ✅ `BackgroundGradation.tsx` 作成
- ✅ `BlogHeader.tsx` 作成
- ✅ `HeroSection.tsx` 作成
- ✅ `BlogItem.tsx` 作成（99frontend仕様完全準拠）
- ✅ `BlogList.tsx` 調整（1列レイアウト）
- ✅ `CategoryFilter.tsx` 調整（Hindフォント、ボーダースタイル）
- ✅ `Pagination.tsx` 調整（40px×40px、ページ省略機能）

#### Phase 3: メインページ実装
- ✅ `src/pages/blog/index.tsx` を99frontend仕様で完全実装
- ✅ 全コンポーネントの統合
- ✅ TypeScriptコンパイルエラー: 0件
- ✅ 状態管理（カテゴリフィルター、ページネーション）実装
- ✅ ローディング状態の実装

### 🔄 次に実装するべきタスク

**優先度: P1（高）**
1. Phase 4: 詳細ページ（/blog/:slug）の実装
2. Phase 5: カテゴリページ（/blog/category/:category）の実装

**優先度: P2（中）**
3. Phase 6: スタイリングと最適化

**優先度: P3（低）**
4. Phase 7-8: テストと品質保証

---

## 🎯 デザイン仕様の確認

### 参照ドキュメント

1. **blogcard.md** - ブログアイテムコンポーネント
   - 横並びレイアウト（1120px × 159px）
   - サムネイル（240px × 135px、16:9）
   - タイトル（Noto Sans JP, 24px, Bold）
   - メタ情報（Hind, 12px, Medium）
   - カテゴリー・日付表示

2. **herosection.md** - ヒーローセクション
   - 大きな "HOPE." タイトル（96px, Bold）
   - サブタイトル（14px, Medium, 文字間隔 0.7px）
   - 背景色：#E8E6EA（薄紫/ラベンダー）
   - 高さ：381px

3. **navigation-blog.md** - ヘッダー
   - BONO ロゴ（88px × 26.07px）
   - 高さ：74.07px
   - パディング：24px
   - シャドウ：0 2px 8px rgba(0,0,0,0.1)

4. **background-gradation-implementation.md** - 背景グラデーション
   - SVG ファイル使用
   - パス：`/assets/f1a2bfc49a149107a751573296609b867ed6b43e.svg`
   - サイズ：1920px × 1625.397px

---

## 📐 デザイントークン定義

### カラーパレット

```typescript
// src/styles/design-tokens/colors.ts
export const BLOG_COLORS = {
  // 背景色
  heroBg: '#E8E6EA',        // ヒーローセクション背景（薄紫）
  white: '#FFFFFF',          // 白背景
  thumbnailBg: '#D6E3FF',    // サムネイル背景（薄青）

  // テキスト色
  darkBlue: '#0F172A',       // タイトルテキスト（Ebony）
  ebony: '#151834',          // ロゴ・メインタイトル
  gray: '#9CA3AF',           // メタ情報（Gray Chateau）

  // ボーダー
  border: '#E5E7EB',         // カードボーダー
} as const;
```

### タイポグラフィ

```typescript
// src/styles/design-tokens/typography.ts
export const BLOG_FONTS = {
  // フォントファミリー
  title: "'Noto Sans JP', sans-serif",
  meta: "'Hind', sans-serif",

  // ヒーローセクション
  hero: {
    title: {
      family: "'Noto Sans JP', sans-serif",
      size: { desktop: '96px', tablet: '56px', mobile: '48px' },
      weight: 700,
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
    },
    subtitle: {
      family: "'Noto Sans JP', sans-serif",
      size: '14px',
      weight: 500,
      lineHeight: '20px',
      letterSpacing: '0.7px',
    },
  },

  // ブログカード
  card: {
    title: {
      family: "'Noto Sans JP', sans-serif",
      size: '24px',
      weight: 700,
      lineHeight: '24px',
    },
    meta: {
      family: "'Hind', sans-serif",
      size: '12px',
      weight: 500,
      lineHeight: '16px',
    },
  },
} as const;
```

### スペーシング

```typescript
// src/styles/design-tokens/spacing.ts
export const BLOG_SPACING = {
  // ヘッダー
  header: {
    height: '74.07px',
    padding: '24px',
    logoWidth: '112px',
    logoHeight: '26.07px',
  },

  // ヒーローセクション
  hero: {
    height: { desktop: '381px', tablet: '340px', mobile: '280px' },
    paddingTop: '16px',
    paddingBottom: '164px',
    titleWidth: '344px',
    titleHeight: '89px',
    subtitleWidth: '325px',
  },

  // ブログカード
  card: {
    width: '1120px',
    height: '159px',
    padding: '12px',
    gap: '32px',
    thumbnailWidth: '240px',
    thumbnailHeight: '135px',
    emojiSize: '64px',
    borderRadius: '8px',
  },
} as const;
```

---

## 🗂️ ディレクトリ構造

```
src/
├── components/
│   ├── blog/
│   │   ├── BackgroundGradation.tsx      # 新規作成 ⭐
│   │   ├── BlogHeader.tsx               # 新規作成 ⭐
│   │   ├── HeroSection.tsx              # 新規作成 ⭐
│   │   ├── BlogItem.tsx                 # 既存 BlogCard.tsx を改修 ⭐
│   │   ├── BlogList.tsx                 # 既存（レイアウト調整）
│   │   ├── CategoryFilter.tsx           # 既存（スタイル調整）
│   │   ├── Pagination.tsx               # 既存（スタイル調整）
│   │   ├── BlogPostHeader.tsx           # 既存（詳細ページ用）
│   │   ├── Breadcrumb.tsx               # 既存
│   │   ├── TableOfContents.tsx          # 既存
│   │   └── ShareButtons.tsx             # 既存
│   └── common/
│       └── (既存の共通コンポーネント)
├── pages/
│   └── blog/
│       ├── index.tsx                    # メインページ（大幅改修） ⭐
│       ├── detail.tsx                   # 詳細ページ（改修）
│       └── category.tsx                 # カテゴリページ（改修）
├── styles/
│   ├── design-tokens/
│   │   ├── colors.ts                    # 新規作成 ⭐
│   │   ├── typography.ts                # 新規作成 ⭐
│   │   └── spacing.ts                   # 新規作成 ⭐
│   └── blog.css                         # 新規作成 ⭐
├── data/
│   └── blog/
│       ├── mockPosts.ts                 # 既存
│       └── categories.ts                # 既存
├── types/
│   └── blog.ts                          # 既存
└── public/
    └── assets/
        ├── logo.svg                     # 新規追加 ⭐
        └── f1a2bfc49a149107a751573296609b867ed6b43e.svg  # 既存
```

---

## 📝 詳細実装タスク

### Phase 1: デザイントークンとフォント設定（基盤）✅ **完了**

#### タスク 1.1: デザイントークンファイルの作成
- [x] `src/styles/design-tokens/colors.ts` を作成
  - BLOG_COLORS オブジェクトを定義
  - 全色コードを 99frontend 仕様通りに設定

- [x] `src/styles/design-tokens/typography.ts` を作成
  - BLOG_FONTS オブジェクトを定義
  - Noto Sans JP と Hind の設定
  - フォントサイズ、ウェイト、行高を仕様通りに設定

- [x] `src/styles/design-tokens/spacing.ts` を作成
  - BLOG_SPACING オブジェクトを定義
  - ヘッダー、ヒーロー、カードの寸法を設定

#### タスク 1.2: フォントのインポート設定
- [x] `index.html` に Google Fonts のリンクを追加
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Hind:wght@400;500;600&display=swap" rel="stylesheet">
  ```

- [x] Tailwind 設定に Noto Sans JP と Hind を追加
  ```typescript
  // tailwind.config.ts
  fontFamily: {
    sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
    'noto': ['Noto Sans JP', 'sans-serif'],
    'hind': ['Hind', 'sans-serif'],
  }
  ```

#### タスク 1.3: ブログ専用 CSS ファイルの作成
- [x] `src/styles/blog.css` を作成
  - カスタムプロパティ（CSS 変数）として Design Tokens を定義
  - グローバルスタイルの定義
  - ホバー効果やアニメーションの定義

---

### Phase 2: 共通コンポーネントの実装（デザイン準拠）✅ **完了**

#### タスク 2.1: BackgroundGradation コンポーネント
**ファイル**: `src/components/blog/BackgroundGradation.tsx`

- [x] コンポーネント基本構造を作成
  ```typescript
  interface BackgroundGradationProps {
    className?: string;
  }
  ```

- [x] SVG 背景の実装
  - `/assets/f1a2bfc49a149107a751573296609b867ed6b43e.svg` を読み込み
  - `loading="lazy"` で遅延読み込み
  - `object-fit: cover` でフルスクリーン対応

- [x] レスポンシブ対応
  - デスクトップ：1920px × 1625.397px
  - タブレット：スケール調整
  - モバイル：スケール調整

- [x] アクセシビリティ対応
  - `aria-hidden="true"` を設定
  - 装飾的な画像として alt="" 設定

#### タスク 2.2: BlogHeader コンポーネント（ヘッダー）
**ファイル**: `src/components/blog/BlogHeader.tsx`

- [x] コンポーネント基本構造を作成
  - 高さ：74.07px
  - パディング：24px
  - シャドウ：0 2px 8px rgba(0,0,0,0.1)

- [x] BONO ロゴの実装
  - ロゴサイズ：88px × 26.07px
  - ホバー時の opacity: 0.8
  - フォーカス可視化（outline）

- [x] ナビゲーションリンク
  - `/` へのリンク（ホームへ戻る）
  - `aria-label="BONO Home"` 設定

- [x] レスポンシブ対応
  - デスクトップ：パディング 24px
  - タブレット：パディング 16px
  - モバイル：パディング 12px

#### タスク 2.3: HeroSection コンポーネント
**ファイル**: `src/components/blog/HeroSection.tsx`

- [x] セクション構造の作成
  - 背景色：#E8E6EA
  - 高さ：381px（デスクトップ）
  - レイアウト：縦並び（Column）、中央寄せ

- [x] メインタイトル "HOPE." の実装
  - フォント：Noto Sans JP, 96px, Bold
  - 色：#151834（Ebony）
  - 文字間隔：-0.02em
  - 行高：1.1

- [x] サブタイトルの実装
  - テキスト：「BONO をつくる 30 代在宅独身男性のクラフト日誌」
  - フォント：Noto Sans JP, 14px, Medium
  - 色：#9CA3AF（Gray）
  - 文字間隔：0.7px
  - 幅：325px（中央寄せ）

- [x] レスポンシブ対応
  - タブレット：タイトル 56px、高さ 340px
  - モバイル：タイトル 48px、高さ 280px

- [x] Props 設定（カスタマイズ可能に）
  ```typescript
  interface HeroSectionProps {
    title?: string;
    subtitle?: string;
    className?: string;
  }
  ```

#### タスク 2.4: BlogItem コンポーネント（カード）
**ファイル**: `src/components/blog/BlogItem.tsx`
**元ファイル**: `src/components/blog/BlogCard.tsx`（リファクタリング）

- [x] カードコンテナの実装
  - 幅：1120px
  - 高さ：159px
  - 背景色：#FFFFFF
  - ボーダー：1px solid #E5E7EB
  - ボーダーラディウス：8px
  - シャドウ：0px 1px 3px rgba(0,0,0,0.1)

- [x] メインコンテナ（内部）
  - レイアウト：Row（横並び）
  - ギャップ：32px
  - パディング：12px

- [x] サムネイル部分の実装
  - サイズ：240px × 135px（16:9）
  - 背景色：#D6E3FF（薄青）
  - ボーダーラディウス：8px
  - 絵文字/アイコン：64px × 64px（中央配置）

- [x] テキストエリアの実装
  - レイアウト：Column（縦並び）
  - ギャップ：8px
  - 縦方向中央寄せ

- [x] タイトルの実装
  - フォント：Noto Sans JP, 24px, Bold
  - 色：#0F172A（Ebony）
  - 行高：24px
  - オーバーフロー：2 行で切り詰め（`-webkit-line-clamp: 2`）

- [x] メタ情報コンテナ
  - レイアウト：Row（横並び）
  - ギャップ：12px

- [x] カテゴリバッジ
  - フォント：Hind, 12px, Medium
  - 色：#9CA3AF
  - 行高：16px

- [x] 投稿日時
  - フォント：Hind, 12px, Medium
  - 色：#9CA3AF
  - 行高：16px
  - フォーマット：「2023 年 08 月 25 日」

- [x] ホバー効果
  - シャドウ：0px 4px 12px rgba(0,0,0,0.15)
  - トランスフォーム：translateY(-2px)
  - トランジション：all 0.3s ease

- [x] アクセシビリティ
  - `role="article"` 設定
  - キーボードフォーカス可視化
  - `aria-label` 設定

- [x] レスポンシブ対応
  - タブレット：幅 calc(100% - 32px)、サムネイル 180px
  - モバイル：幅 calc(100% - 16px)、サムネイル 120px

#### タスク 2.5: BlogList コンポーネントの調整
**ファイル**: `src/components/blog/BlogList.tsx`（既存の改修）

- [x] グリッドレイアウトの調整
  - コンテナ幅：最大 1920px
  - 中央寄せ
  - パディング：左右 0px（コンテナ外で管理）

- [x] カード配置
  - 1 列表示（カード幅が 1120px のため）
  - ギャップ：24px（垂直方向）

- [x] 空状態の表示
  - 「記事が見つかりません」メッセージ
  - 中央寄せ表示

- [x] ローディング状態
  - スケルトンローダーの表示（オプション）

#### タスク 2.6: CategoryFilter コンポーネントの調整
**ファイル**: `src/components/blog/CategoryFilter.tsx`（既存の改修）

- [x] フィルターコンテナのスタイル調整
  - 背景：透明
  - レイアウト：Row（横並び）
  - ギャップ：16px
  - 中央寄せ

- [x] カテゴリボタンのスタイル
  - フォント：Hind, 14px, Medium
  - 色（非選択）：#9CA3AF
  - 色（選択）：#0F172A
  - パディング：8px 16px
  - ボーダー：1px solid #E5E7EB
  - ボーダーラディウス：8px
  - ホバー：背景色変化

- [x] アクティブ状態
  - 背景色：#0F172A
  - テキスト色：#FFFFFF

#### タスク 2.7: Pagination コンポーネントの調整
**ファイル**: `src/components/blog/Pagination.tsx`（既存の改修）

- [x] ページネーションコンテナ
  - レイアウト：Row（横並び）
  - 中央寄せ
  - ギャップ：8px

- [x] ページボタンのスタイル
  - サイズ：40px × 40px
  - フォント：Hind, 14px, Medium
  - ボーダー：1px solid #E5E7EB
  - ボーダーラディウス：8px
  - ホバー効果

- [x] アクティブページ
  - 背景色：#0F172A
  - テキスト色：#FFFFFF

- [x] 前後ボタン（Prev/Next）
  - アイコン使用（← / →）
  - 無効状態のスタイル

---

### Phase 3: メインページの実装（/blog）✅ **完了**

#### タスク 3.1: ページレイアウトの構築
**ファイル**: `src/pages/blog/index.tsx`（大幅改修）

- [x] 基本構造の実装
  ```tsx
  <div className="relative min-h-screen">
    {/* 背景グラデーション */}
    <BackgroundGradation />

    {/* ヘッダー */}
    <BlogHeader />

    {/* ヒーローセクション */}
    <HeroSection />

    {/* メインコンテンツ */}
    <main>
      <CategoryFilter />
      <BlogList />
      <Pagination />
    </main>

    {/* フッター（既存） */}
    <Footer />
  </div>
  ```

- [x] 背景グラデーションの配置
  - `position: fixed`
  - `z-index: -10`
  - フルスクリーンで表示

- [x] ヘッダーの固定配置
  - `position: sticky` または `fixed`
  - `top: 0`
  - `z-index: 100`

#### タスク 3.2: 状態管理の実装

- [x] フィルター状態の管理
  ```typescript
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  ```

- [x] ページネーション状態の管理
  ```typescript
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 9; // 1ページあたり9件
  ```

- [x] フィルター済み記事の計算
  ```typescript
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') return mockPosts;
    return mockPosts.filter(post => post.category === selectedCategory);
  }, [selectedCategory]);
  ```

- [x] ページネーション計算
  ```typescript
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );
  ```

#### タスク 3.3: イベントハンドラーの実装

- [x] カテゴリ変更ハンドラー
  ```typescript
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // ページをリセット
  };
  ```

- [x] ページ変更ハンドラー
  ```typescript
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  ```

#### タスク 3.4: レスポンシブ対応

- [x] デスクトップ（1920px 以上）
  - カード幅：1120px
  - 1 列表示

- [x] タブレット（768px）
  - カード幅：calc(100% - 32px)
  - 1 列表示

- [x] モバイル（375px）
  - カード幅：calc(100% - 16px)
  - 1 列表示

#### タスク 3.5: SEO 対応

- [x] ページタイトルの設定
  ```typescript
  useEffect(() => {
    document.title = 'BONO Blog - HOPE.';
  }, []);
  ```

- [x] メタタグの設定
  - description
  - keywords
  - og:image

---

### Phase 4: 詳細ページの実装（/blog/:slug）

#### タスク 4.1: ページレイアウトの構築
**ファイル**: `src/pages/blog/detail.tsx`（改修）

- [ ] 基本構造の実装
  ```tsx
  <div className="relative min-h-screen">
    <BackgroundGradation />
    <BlogHeader />

    <main className="container mx-auto px-4 py-8">
      <Breadcrumb />
      <BlogPostHeader post={post} />
      <div className="grid grid-cols-12 gap-8">
        <article className="col-span-12 lg:col-span-8">
          <BlogContent content={post.content} />
        </article>
        <aside className="col-span-12 lg:col-span-4">
          <TableOfContents />
        </aside>
      </div>
      <ShareButtons />
      <RelatedPosts />
    </main>

    <Footer />
  </div>
  ```

#### タスク 4.2: BlogPostHeader コンポーネントの調整
**ファイル**: `src/components/blog/BlogPostHeader.tsx`（既存の改修）

- [ ] アイキャッチ画像
  - 幅：100%
  - 高さ：auto（アスペクト比維持）
  - ボーダーラディウス：8px

- [ ] タイトル
  - フォント：Noto Sans JP, 48px, Bold
  - 色：#0F172A
  - マージン：上下 24px

- [ ] メタ情報
  - カテゴリ、日付、著者
  - レイアウト：Row（横並び）
  - ギャップ：16px

#### タスク 4.3: Breadcrumb コンポーネントの調整
**ファイル**: `src/components/blog/Breadcrumb.tsx`（既存の改修）

- [ ] パンくずリストの実装
  ```
  ホーム > ブログ > カテゴリ名 > 記事タイトル
  ```

- [ ] スタイル調整
  - フォント：Hind, 14px, Medium
  - 色：#9CA3AF
  - セパレーター：「>」または「/」

#### タスク 4.4: 記事本文のスタイリング

- [ ] マークダウンスタイルの適用
  - 見出し（h1-h6）のスタイル
  - 段落のスタイル
  - リストのスタイル
  - コードブロックのスタイル
  - 画像のスタイル

- [ ] タイポグラフィ調整
  - フォント：Noto Sans JP
  - 行高：1.8
  - 段落間隔：1.5em

#### タスク 4.5: 関連記事セクション

- [ ] セクションタイトル
  - 「関連記事」
  - フォント：Noto Sans JP, 32px, Bold

- [ ] 関連記事の表示
  - BlogItem コンポーネントを再利用
  - 3 件表示
  - グリッドレイアウト（3 列）

---

### Phase 5: カテゴリページの実装（/blog/category/:category）

#### タスク 5.1: ページレイアウトの構築
**ファイル**: `src/pages/blog/category.tsx`（改修）

- [ ] 基本構造の実装
  ```tsx
  <div className="relative min-h-screen">
    <BackgroundGradation />
    <BlogHeader />

    <main className="container mx-auto px-4 py-8">
      <CategoryHeader category={category} />
      <BlogList posts={filteredPosts} />
      <Pagination />
    </main>

    <Footer />
  </div>
  ```

#### タスク 5.2: CategoryHeader の実装

- [ ] カテゴリ名の表示
  - フォント：Noto Sans JP, 48px, Bold
  - 色：#0F172A

- [ ] カテゴリ説明の表示
  - フォント：Noto Sans JP, 16px, Regular
  - 色：#9CA3AF

- [ ] 記事数の表示
  - 「全 X 件の記事」

#### タスク 5.3: カテゴリ別フィルター処理

- [ ] URL パラメータからカテゴリ取得
  ```typescript
  const { category } = useParams<{ category: string }>();
  ```

- [ ] カテゴリに基づく記事フィルター
  ```typescript
  const filteredPosts = mockPosts.filter(
    post => post.category === category
  );
  ```

- [ ] カテゴリが存在しない場合のエラーハンドリング

---

### Phase 6: スタイリングと最適化

#### タスク 6.1: CSS の整理と統一

- [ ] デザイントークンを CSS 変数として定義
  ```css
  :root {
    --blog-color-hero-bg: #E8E6EA;
    --blog-color-white: #FFFFFF;
    --blog-color-dark-blue: #0F172A;
    --blog-color-gray: #9CA3AF;
    --blog-font-title: 'Noto Sans JP', sans-serif;
    --blog-font-meta: 'Hind', sans-serif;
  }
  ```

- [ ] グローバルスタイルの定義
  - フォントのスムージング
  - デフォルトのマージン・パディング
  - リンクのスタイル

#### タスク 6.2: アニメーション効果の実装

- [ ] カードホバー効果
  - transform: translateY(-2px)
  - box-shadow: 0px 4px 12px rgba(0,0,0,0.15)
  - transition: all 0.3s ease

- [ ] ページ遷移のフェードイン
  - Framer Motion を使用（既存の依存関係）
  - フェード + スライドアニメーション

#### タスク 6.3: レスポンシブデザインの最終調整

- [ ] ブレークポイントの統一
  ```typescript
  const breakpoints = {
    mobile: '375px',
    tablet: '768px',
    desktop: '1920px',
  };
  ```

- [ ] 各コンポーネントのレスポンシブテスト
  - デスクトップ（1920px）
  - タブレット（768px）
  - モバイル（375px）

#### タスク 6.4: アクセシビリティ対応

- [ ] キーボードナビゲーション
  - Tab キーでのフォーカス移動
  - Enter キーでのアクション実行

- [ ] スクリーンリーダー対応
  - `aria-label` の設定
  - `role` 属性の設定

- [ ] カラーコントラスト確認
  - WCAG AA 準拠の確認
  - タイトル：#0F172A on #FFFFFF（✅ AAA）
  - メタ情報：#9CA3AF on #FFFFFF（✅ AA）

#### タスク 6.5: パフォーマンス最適化

- [ ] 画像の遅延読み込み
  - `loading="lazy"` 属性
  - Intersection Observer API の活用

- [ ] コンポーネントの動的インポート
  ```typescript
  const TableOfContents = lazy(() => import('@/components/blog/TableOfContents'));
  ```

- [ ] コードスプリッティング
  - React.lazy と Suspense の活用

- [ ] フォントの最適化
  - `font-display: swap` の設定
  - プリロード設定

---

### Phase 7: テストと品質保証

#### タスク 7.1: コンポーネントのユニットテスト

- [ ] BackgroundGradation.test.tsx
  - SVG の読み込みテスト
  - className の適用テスト

- [ ] BlogItem.test.tsx
  - レンダリングテスト
  - Props の表示確認
  - ホバー効果のテスト

- [ ] HeroSection.test.tsx
  - タイトル・サブタイトルの表示確認
  - レスポンシブ対応のテスト

#### タスク 7.2: 統合テスト

- [ ] ページ遷移テスト
  - /blog → /blog/:slug
  - /blog → /blog/category/:category

- [ ] フィルター機能のテスト
  - カテゴリ変更
  - ページネーション

#### タスク 7.3: ブラウザテスト

- [ ] クロスブラウザテスト
  - Chrome
  - Firefox
  - Safari
  - Edge

- [ ] デバイステスト
  - Desktop（1920px）
  - Tablet（768px）
  - Mobile（375px、iPhone SE）

#### タスク 7.4: Lighthouse 監査

- [ ] パフォーマンス（目標: 90 以上）
- [ ] アクセシビリティ（目標: 100）
- [ ] ベストプラクティス（目標: 100）
- [ ] SEO（目標: 100）

---

### Phase 8: デプロイ前の最終確認

#### タスク 8.1: デザイン仕様との照合

- [ ] 99frontend/blogcard.md との照合
  - カードサイズ：1120px × 159px ✅
  - サムネイル：240px × 135px ✅
  - タイトルフォント：Noto Sans JP, 24px, Bold ✅
  - メタフォント：Hind, 12px, Medium ✅

- [ ] 99frontend/herosection.md との照合
  - 背景色：#E8E6EA ✅
  - タイトルサイズ：96px（デスクトップ） ✅
  - サブタイトル：14px、文字間隔 0.7px ✅

- [ ] 99frontend/navigation-blog.md との照合
  - ヘッダー高さ：74.07px ✅
  - ロゴサイズ：88px × 26.07px ✅
  - パディング：24px ✅

- [ ] 99frontend/background-gradation-implementation.md との照合
  - SVG パス：正しく設定 ✅
  - レイアウト：フルスクリーン ✅

#### タスク 8.2: コードレビュー

- [ ] TypeScript 型定義の確認
- [ ] Props の型安全性
- [ ] エラーハンドリング
- [ ] コメントとドキュメント

#### タスク 8.3: ドキュメント作成

- [ ] README の更新
  - ブログページの説明
  - 使用方法
  - デザイン仕様へのリンク

- [ ] コンポーネントドキュメント
  - Props の説明
  - 使用例
  - デザイントークンの説明

---

## 📊 進捗管理

### 優先度の定義

- **P0 (最優先)**: Phase 1, 2, 3（デザイントークン、共通コンポーネント、メインページ）
- **P1 (高)**: Phase 4, 5（詳細ページ、カテゴリページ）
- **P2 (中)**: Phase 6（スタイリング、最適化）
- **P3 (低)**: Phase 7, 8（テスト、品質保証）

### 実装順序

1. **Week 1**: Phase 1 + Phase 2（デザイントークン + 共通コンポーネント）
2. **Week 2**: Phase 3（メインページ実装）
3. **Week 3**: Phase 4 + Phase 5（詳細ページ + カテゴリページ）
4. **Week 4**: Phase 6 + Phase 7 + Phase 8（最適化 + テスト + 最終確認）

---

## 🎨 デザイン参照リンク

- **blogcard.md**: `.claude/docs/blog/99frontend/blogcard.md`
- **herosection.md**: `.claude/docs/blog/99frontend/herosection.md`
- **navigation-blog.md**: `.claude/docs/blog/99frontend/navigation-blog.md`
- **background-gradation-implementation.md**: `.claude/docs/blog/99frontend/background-gradation-implementation.md`

---

## 📝 備考

### 技術的考慮事項

1. **既存コンポーネントとの共存**
   - `/blog` 以下のみに影響
   - 既存の Header/Footer は使用しない（ブログ専用を作成）

2. **デザインシステムの一貫性**
   - 99frontend の仕様を厳密に再現
   - デザイントークンで管理

3. **パフォーマンス**
   - 画像の遅延読み込み
   - コードスプリッティング
   - フォント最適化

4. **保守性**
   - コンポーネントの再利用性
   - 型定義の充実
   - ドキュメント整備

### 将来の拡張予定

- CMS 連携（Sanity など）
- MDX 対応
- 検索機能
- タグ機能
- コメント機能
- いいね機能
- RSS フィード

---

**作成日**: 2025 年 11 月 10 日
**最終更新**: 2025 年 11 月 10 日
**作成者**: Claude Code
**バージョン**: 1.0.0
