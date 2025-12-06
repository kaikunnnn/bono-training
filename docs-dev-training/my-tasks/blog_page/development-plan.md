# /blogページ実装 - 開発計画書

## プロジェクト概要
- **プロジェクト名**: ブログページ静的実装
- **実装範囲**: /blog以下のURLのみ（既存ページには一切影響しない）
- **技術スタック**: React 18 + TypeScript + Vite + ShadCN UI + TailwindCSS
- **ルーティング**: React Router DOM v6（/blog以下のみ追加）
- **デザインシステム**: 既存のShadCN UI + Radix UIを活用
- **データ管理**: 静的データ（ハードコード）→ 将来的にCMS/MDX対応

## 重要な実装ルール
1. **/blog以下のURLのみの実装**であり、既存の他ページには一切影響を与えない
2. **認証・課金機能は実装しない**（/blogページには不要）
3. **見た目の実装を優先**し、データはハードコードで対応
4. **既存のコンポーネント・スタイルを最大限活用**
5. **bonoSite-mainのデザインを参考**にUI/UXを統一

## 既存プロジェクトとの関係

### 活用する既存リソース
```
src/
├── components/
│   ├── ui/           # ShadCN UIコンポーネント（活用）
│   ├── common/       # 共通コンポーネント（活用）
│   ├── layout/       # レイアウトコンポーネント（参考）
│   └── blog/         # 新規作成（/blog専用）
├── pages/
│   └── blog/         # 新規作成（/blog専用ページ）
└── types/
    └── blog.ts       # 新規作成（/blog専用型定義）
```

### 新規追加範囲（/blog専用）
- ブログ専用コンポーネント（src/components/blog/）
- ブログページ（src/pages/blog/）
- ブログ型定義（src/types/blog.ts）
- 静的ブログデータ（src/data/blog/）

## 実装要件まとめ

### 1. ルーティング設計（/blog以下のみ）
- `/blog` - ブログトップ（記事一覧）
- `/blog/category/[category]` - カテゴリ別一覧
- `/blog/[slug]` - 記事詳細

### 2. UI/UXデザイン方針
bonoSite-main からのデザイン流用：
- `/blog` → `/` のトップページデザイン
- `/blog/:slug` → `/content/:slug` のページデザイン
- カテゴリページは新規作成

### 3. コンポーネント設計（/blog専用）
- **BlogCard**: 記事カードコンポーネント（既存ShadCN Cardを活用）
- **BlogList**: 記事一覧表示コンポーネント
- **BlogPost**: 記事詳細表示コンポーネント
- **CategoryFilter**: カテゴリフィルター
- **Pagination**: ページネーション（既存UIコンポーネント活用）

### 4. データ管理（静的実装）
- **記事データ**: ハードコードされた静的データ（src/data/blog/mockPosts.ts）
- **カテゴリ管理**: 静的カテゴリデータ（src/data/blog/categories.ts）
- **画像管理**: public/blog/ ディレクトリ（サンプル画像使用）
- **将来対応**: CMS/MDX連携は後から実装

### 5. SEO対応（基本のみ）
- Meta tags (title, description)
- 基本的な構造化データ
- 将来的に拡張予定

### 6. アナリティクス（将来実装）
- 現段階では実装しない
- 必要に応じて後から追加

## 技術的制約・考慮事項

### 既存システムとの分離
- **認証システムは使用しない**（/blogページには不要）
- **既存ページには一切影響を与えない**
- ShadCN UIデザインシステムの活用（既存のコンポーネントを再利用）
- Tailwind設定の活用（container設定、カラーパレット）

### パフォーマンス
- React.lazy による動的インポート
- 画像の最適化
- ページネーション（20件/ページ）

### 保守性
- 既存のフォルダ構造に準拠
- TypeScript型定義の充実
- テスト可能な設計

## デザイン・スタイル指針

### Tailwind設定活用
```typescript
// 既存のTailwind設定を活用
container: {
  center: true,
  padding: '2rem',
  screens: { '2xl': '1400px' }
}
```

### カラーパレット
- 基本: Stone/Gray系統
- アクセント: 既存のtraining色を参考
- カテゴリ色: bg-category.css の補色システム

### タイポグラフィ
- 見出し: `text-4xl md:text-5xl font-bold !leading-normal`
- 本文: `font-family: "Inter", "Noto Sans JP", sans-serif`
- カード: `text-lg font-semibold` (タイトル), `text-base text-gray-500` (説明)

### アニメーション
- Framer Motion (既存の依存関係)
- フェード&スライドエフェクト
- カードホバーアニメーション

## 実装フェーズ

### Phase 1: 静的ページ実装（現在のゴール）
1. /blogページの基本レイアウト実装
2. 静的データで記事一覧表示
3. 記事詳細ページの実装
4. カテゴリフィルター機能
5. bonoSite-mainのデザイン適用

### Phase 2: 将来の拡張（今回は対象外）
- CMS/MDX連携
- 動的データ取得
- SEO最適化
- アナリティクス実装