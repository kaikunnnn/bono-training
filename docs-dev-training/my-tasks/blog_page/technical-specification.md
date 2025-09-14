# /blogページ - 技術仕様（静的実装版）

## 重要な制約
- **/blog以下のURLのみの実装**
- **既存ページに影響を与えない**
- **認証・課金機能は実装しない**
- **静的データで見た目を優先**
- **CMS/MDXは将来実装（今回は対象外）**

## アーキテクチャ概要

### システム構成（簡略化版）
```
Frontend (React + TypeScript)
├── Pages (/blog/*)
├── Components (blog専用)
├── Static Data (ハードコード)
└── Routing (/blog以下のみ)
```

### データフロー
```
Static Data (TypeScript) → Components → UI
```

## 技術スタック詳細

### Core Technologies
- **React 18**: コンポーネントベースUI
- **TypeScript**: 型安全性
- **Vite**: ビルドツール・開発サーバー
- **React Router DOM v6**: SPA ルーティング

### UI/スタイリング
- **ShadCN UI**: デザインシステム
- **Radix UI**: アクセシブルなUIプリミティブ
- **Tailwind CSS**: ユーティリティファーストCSS
- **Class Variance Authority**: コンポーネントバリアント管理

### データ処理
- **date-fns**: 日付表示のみ
- **マークダウン不要**: 静的HTMLを直接使用

### 状態管理
- **React useState/useEffect**: ローカルステートのみ
- **サーバーステート不要**: 静的データ使用

## データスキーマ設計

### TypeScript型定義

```typescript
// src/types/blog.ts

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;         // 静的HTML文字列
  author: string;           // 単純な名前文字列
  publishedAt: string;      // ISO日付文字列
  category: string;         // カテゴリスラッグ
  tags: string[];
  thumbnail: string;        // /blog/images/からのパス
  featured: boolean;
  readingTime: number;      // 分
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;            // Tailwindクラス (bg-blue-500など)
}

export interface BlogPagination {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  postsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```


## データ管理（静的実装）

### 静的データ定義

```typescript
// src/data/blog/mockPosts.ts

export const mockPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'getting-started-with-react',
    title: 'Reactを始めよう',
    description: 'Reactの基本から学ぶ初心者向けガイド',
    content: '<p>Reactはユーザーインターフェースを構築するための...</p>',
    author: '山田太郎',
    publishedAt: '2024-01-15',
    category: 'tech',
    tags: ['React', 'JavaScript', 'Web開発'],
    thumbnail: '/blog/images/sample-1.jpg',
    featured: true,
    readingTime: 5,
  },
  // ... 他のサンプル記事
];

// src/data/blog/categories.ts

export const categories: BlogCategory[] = [
  {
    id: '1',
    name: 'テクノロジー',
    slug: 'tech',
    description: '最新の技術情報をお届け',
    color: 'bg-blue-500',
  },
  {
    id: '2',
    name: 'デザイン',
    slug: 'design',
    description: 'UI/UXデザインのトレンド',
    color: 'bg-purple-500',
  },
  // ... 他のカテゴリ
];
```

### データ取得関数（静的）

```typescript
// src/utils/blog/blogUtils.ts

export const getBlogPosts = (params?: {
  page?: number;
  category?: string;
  limit?: number;
}) => {
  let posts = [...mockPosts];

  // カテゴリフィルター
  if (params?.category) {
    posts = posts.filter(p => p.category === params.category);
  }

  // ページネーション
  const page = params?.page || 1;
  const limit = params?.limit || 9;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    posts: posts.slice(start, end),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(posts.length / limit),
      totalPosts: posts.length,
      postsPerPage: limit,
      hasNextPage: end < posts.length,
      hasPrevPage: page > 1,
    },
  };
};

export const getBlogPost = (slug: string) => {
  return mockPosts.find(post => post.slug === slug) || null;
};

export const getFeaturedPosts = () => {
  return mockPosts.filter(post => post.featured).slice(0, 3);
};
```

## ルーティング設計

### React Router実装

```typescript
// App.tsx ルート追加（既存ルートに影響しない）
<Routes>
  {/* 既存ルートはそのまま */}

  {/* /blog以下のルートを追加 */}
  <Route path="/blog" element={<BlogIndex />} />
  <Route path="/blog/category/:category" element={<BlogCategory />} />
  <Route path="/blog/:slug" element={<BlogPost />} />
</Routes>
```

### URL設計パターン

```
/blog                           # ブログホーム
/blog?page=2                    # ページ2
/blog/category/tech             # techカテゴリ一覧
/blog/category/tech?page=2      # techカテゴリページ2
/blog/getting-started-with-react # 記事詳細
```

## コンポーネント設計

### コンポーネント階層（シンプル版）

```
BlogIndex
├── CategoryFilter
├── BlogList
│   └── BlogCard[]
└── Pagination

BlogPost
├── BlogPostContent
└── RelatedPosts (オプション)

BlogCategory
├── BlogList
│   └── BlogCard[]
└── Pagination
```

### Props Interface設計

```typescript
// コンポーネントProps型定義

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured';
}

interface BlogListProps {
  posts: BlogPost[];
  variant?: 'grid' | 'list';
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface CategoryFilterProps {
  categories: BlogCategory[];
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
}
```

## SEO・パフォーマンス（基本実装）

### 基本的なSEO実装

```typescript
// シンプルなメタタグ設定のみ
const BlogMeta: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  useEffect(() => {
    document.title = `${title} | Blog`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
};
```

### パフォーマンス

- 静的データなので高速
- 画像はlazy loadingを適用
- 必要に応じてReact.lazyを使用





## 将来拡張性（今回は実装しない）

### 将来的な拡張ポイント
- CMS/MDX統合
- 動的データ取得
- SEO最適化
- アナリティクス
- 検索機能
- コメント機能

### データソースの切り替え
静的データからCMS/APIへの移行が簡単にできるよう、データ取得関数を分離しておく