# /blogページ - フォルダ構造と実装順序

## 重要な制約
- **/blog以下のURLのみの実装**
- **既存ページに影響を与えない**
- **認証・課金機能は実装しない**
- **静的データで見た目を優先**

## フォルダ構造設計（簡略化版）

### 1. コンポーネント構造（シンプル版）
```
src/components/blog/
├── BlogCard.tsx                # 記事カードコンポーネント
├── BlogList.tsx                # 記事一覧表示
├── BlogPostContent.tsx         # 記事詳細表示
├── CategoryFilter.tsx          # カテゴリフィルター
└── Pagination.tsx              # ページネーション
```

### 2. ページ構造
```
src/pages/blog/
├── index.tsx                   # /blog - メインブログページ
├── [slug].tsx                  # /blog/[slug] - 記事詳細
└── category/
    └── [category].tsx          # /blog/category/[category] - カテゴリ別
```

### 3. データ・型定義
```
src/types/blog.ts               # ブログ関連の型定義
src/data/blog/
├── mockPosts.ts               # 静的な記事データ（ハードコード）
└── categories.ts              # カテゴリ定義
```

### 4. アセット構造（サンプル画像）
```
public/blog/
└── images/
    ├── sample-1.jpg            # サンプル画像1
    ├── sample-2.jpg            # サンプル画像2
    └── sample-3.jpg            # サンプル画像3
```


## 実装順序（シンプル版）

### Phase 1: 基本実装（今回のゴール）
1. **型定義の作成** - `src/types/blog.ts`
2. **静的データの作成** - `src/data/blog/mockPosts.ts`
3. **ルーティング追加** - `App.tsx` に/blogルート追加
4. **メインブログページ** - `/blog`
5. **記事カードコンポーネント** - `BlogCard.tsx`
6. **記事一覧表示** - `BlogList.tsx`
7. **記事詳細ページ** - `/blog/[slug]`
8. **カテゴリフィルター** - `CategoryFilter.tsx`
9. **カテゴリ別ページ** - `/blog/category/[category]`
10. **ページネーション** - `Pagination.tsx`

### 将来の拡張（今回は対象外）
- CMS/MDX連携
- SEO最適化
- アナリティクス
- RSSフィード
- 検索機能

## データ構造（静的実装）

### 記事データスキーマ
```typescript
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;         // ハードコードされたHTML/テキスト
  author: string;
  publishedAt: string;      // ISO日付文字列
  category: string;
  tags: string[];
  thumbnail: string;        // public/blog/images/からのパス
  featured: boolean;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;            // Tailwindクラス
}
```

### ページネーション設計
- 9件/ページ（グリッド表示用）
- URLクエリパラメータで管理 (`?page=2`)
- 既存のShadCN Paginationコンポーネントを活用

### ルーティング実装
```typescript
// App.tsx への追加（既存ルートに影響しない）
<Route path="/blog" element={<BlogIndex />} />
<Route path="/blog/category/:category" element={<BlogCategory />} />
<Route path="/blog/:slug" element={<BlogPost />} />
```

## 依存関係

### 既存パッケージを活用
- `react-router-dom` - ルーティング
- `date-fns` - 日付表示
- ShadCN UI コンポーネント
- Tailwind CSS

### 新規パッケージは追加しない
- マークダウン解析は今回不要（静的HTML使用）
- CMS連携は将来実装

## パフォーマンス目標
- 静的データなので高速表示
- React.lazyによるコード分割（必要に応じて）

## 将来の拡張性（今回は実装しない）
- CMS/MDX統合
- 動的データ取得
- SEO最適化
- アナリティクス
- コメント機能
- 検索機能