# /blogページ 見た目実装手順書

## 重要な実装ルール
- **/blog以下のURLのみの実装**
- **既存ページに影響を与えない**
- **静的データで見た目を優先**
- **bonoSite-mainの既存コンポーネントを最大限活用**

## 実装順序（Phase 1: 見た目実装）

### Step 1: プロジェクト構造の確認と準備

#### 1-1. 既存プロジェクトの依存関係確認
```bash
# 必要なパッケージがインストールされているか確認
npm list react react-dom react-router-dom
npm list @types/react @types/react-dom
npm list tailwindcss @tailwindcss/typography
npm list framer-motion
npm list class-variance-authority
npm list date-fns
```

#### 1-2. ShadCN UIコンポーネントの確認
```bash
# 既存のShadCN UIコンポーネントを確認
ls src/components/ui/
# 必要: card.tsx, button.tsx, badge.tsx
```

### Step 2: ブログ専用型定義の作成

#### 2-1. ブログ型定義ファイル作成
**ファイル**: `src/types/blog.ts`

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

// データ取得結果の型
export interface BlogPostsResponse {
  posts: BlogPost[];
  pagination: BlogPagination;
}
```

### Step 3: 静的データの作成

#### 3-1. サンプル画像の準備
**ディレクトリ作成**: `public/blog/images/`

```bash
mkdir -p public/blog/images
# サンプル画像を配置（placeholder画像でも可）
```

#### 3-2. カテゴリデータ作成
**ファイル**: `src/data/blog/categories.ts`

```typescript
// src/data/blog/categories.ts
import { BlogCategory } from '@/types/blog';

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
  {
    id: '3',
    name: 'ビジネス',
    slug: 'business',
    description: 'ビジネスに役立つ情報',
    color: 'bg-green-500',
  },
  {
    id: '4',
    name: 'ライフスタイル',
    slug: 'lifestyle',
    description: '豊かな生活のためのヒント',
    color: 'bg-pink-500',
  },
];

export const getCategoryBySlug = (slug: string) => {
  return categories.find(category => category.slug === slug) || null;
};

export const getCategoryById = (id: string) => {
  return categories.find(category => category.id === id) || null;
};
```

#### 3-3. ブログ記事データ作成
**ファイル**: `src/data/blog/mockPosts.ts`

```typescript
// src/data/blog/mockPosts.ts
import { BlogPost } from '@/types/blog';

export const mockPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'getting-started-with-react',
    title: 'Reactを始めよう - 初心者向けガイド',
    description: 'Reactの基本から学ぶ初心者向けガイドです。コンポーネントの作り方から状態管理まで、わかりやすく解説します。',
    content: `
      <h2>Reactとは</h2>
      <p>Reactはユーザーインターフェースを構築するためのJavaScriptライブラリです。</p>
      <h2>コンポーネントの基本</h2>
      <p>Reactではコンポーネントという単位でUIを構築します。</p>
      <pre><code>function Hello() {
  return <h1>Hello, World!</h1>;
}</code></pre>
      <h2>まとめ</h2>
      <p>Reactを使うことで、再利用可能なUIコンポーネントを作成できます。</p>
    `,
    author: '山田太郎',
    publishedAt: '2024-01-15T00:00:00Z',
    category: 'tech',
    tags: ['React', 'JavaScript', 'Web開発'],
    thumbnail: '/blog/images/sample-1.jpg',
    featured: true,
    readingTime: 5,
  },
  {
    id: '2',
    slug: 'modern-web-design-trends',
    title: 'モダンWebデザインのトレンド2024',
    description: '2024年のWebデザインで注目すべきトレンドを紹介。ミニマリズムからグラフィックデザインまで幅広く解説します。',
    content: `
      <h2>2024年のデザイントレンド</h2>
      <p>今年のWebデザインは、シンプルさと機能性を重視したトレンドが主流です。</p>
      <h2>カラーパレットの選び方</h2>
      <p>適切なカラーパレットの選択がデザインの成功を左右します。</p>
      <h2>タイポグラフィの重要性</h2>
      <p>読みやすさを重視したタイポグラフィが求められています。</p>
    `,
    author: '佐藤花子',
    publishedAt: '2024-01-12T00:00:00Z',
    category: 'design',
    tags: ['Webデザイン', 'UI/UX', 'トレンド'],
    thumbnail: '/blog/images/sample-2.jpg',
    featured: true,
    readingTime: 7,
  },
  {
    id: '3',
    slug: 'productivity-tools-2024',
    title: '生産性を高める2024年のおすすめツール',
    description: 'リモートワークが定着した今、生産性を高めるために必要なツールを厳選してご紹介します。',
    content: `
      <h2>タスク管理ツール</h2>
      <p>効率的なタスク管理のためのおすすめツールを紹介します。</p>
      <h2>コミュニケーションツール</h2>
      <p>チームでの円滑なコミュニケーションをサポートするツールです。</p>
      <h2>自動化ツール</h2>
      <p>繰り返し作業を自動化して時間を節約しましょう。</p>
    `,
    author: '田中次郎',
    publishedAt: '2024-01-10T00:00:00Z',
    category: 'business',
    tags: ['生産性', 'ツール', 'リモートワーク'],
    thumbnail: '/blog/images/sample-3.jpg',
    featured: false,
    readingTime: 4,
  },
  {
    id: '4',
    slug: 'healthy-work-life-balance',
    title: 'ワークライフバランスを保つ秘訣',
    description: '仕事とプライベートの両立は現代人の大きな課題。健康的なバランスを保つための実践的なアドバイスをお届けします。',
    content: `
      <h2>時間管理の基本</h2>
      <p>効果的な時間管理の方法について解説します。</p>
      <h2>ストレス管理</h2>
      <p>日々のストレスをコントロールする方法を学びましょう。</p>
      <h2>健康的な習慣</h2>
      <p>長期的に続けられる健康習慣を身に着けることが重要です。</p>
    `,
    author: '鈴木美咲',
    publishedAt: '2024-01-08T00:00:00Z',
    category: 'lifestyle',
    tags: ['ワークライフバランス', '健康', 'ライフスタイル'],
    thumbnail: '/blog/images/sample-1.jpg',
    featured: false,
    readingTime: 6,
  },
  {
    id: '5',
    slug: 'typescript-best-practices',
    title: 'TypeScript ベストプラクティス集',
    description: 'TypeScriptを使った開発で知っておきたいベストプラクティスを実例とともに解説します。',
    content: `
      <h2>型定義の書き方</h2>
      <p>効果的な型定義の方法について説明します。</p>
      <h2>エラーハンドリング</h2>
      <p>TypeScriptでの適切なエラーハンドリング手法です。</p>
      <h2>パフォーマンス最適化</h2>
      <p>TypeScriptアプリケーションのパフォーマンスを向上させる方法です。</p>
    `,
    author: '山田太郎',
    publishedAt: '2024-01-05T00:00:00Z',
    category: 'tech',
    tags: ['TypeScript', 'JavaScript', 'ベストプラクティス'],
    thumbnail: '/blog/images/sample-2.jpg',
    featured: false,
    readingTime: 8,
  },
  {
    id: '6',
    slug: 'ux-design-principles',
    title: 'UXデザインの基本原則',
    description: '良いユーザーエクスペリエンスを提供するためのデザイン原則を、具体例とともに詳しく解説します。',
    content: `
      <h2>ユーザビリティの原則</h2>
      <p>使いやすいインターフェースを作るための基本原則です。</p>
      <h2>アクセシビリティ</h2>
      <p>すべてのユーザーが利用できるデザインを心がけましょう。</p>
      <h2>情報設計</h2>
      <p>情報を整理し、わかりやすく伝える方法について解説します。</p>
    `,
    author: '佐藤花子',
    publishedAt: '2024-01-03T00:00:00Z',
    category: 'design',
    tags: ['UX', 'デザイン', 'ユーザビリティ'],
    thumbnail: '/blog/images/sample-3.jpg',
    featured: false,
    readingTime: 9,
  },
];
```

#### 3-4. データ取得ユーティリティ作成
**ファイル**: `src/utils/blog/blogUtils.ts`

```typescript
// src/utils/blog/blogUtils.ts
import { BlogPost, BlogPostsResponse } from '@/types/blog';
import { mockPosts } from '@/data/blog/mockPosts';

export const getBlogPosts = (params?: {
  page?: number;
  category?: string;
  limit?: number;
}): BlogPostsResponse => {
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

export const getBlogPost = (slug: string): BlogPost | null => {
  return mockPosts.find(post => post.slug === slug) || null;
};

export const getFeaturedPosts = (limit = 3): BlogPost[] => {
  return mockPosts.filter(post => post.featured).slice(0, limit);
};

export const getRelatedPosts = (currentPost: BlogPost, limit = 3): BlogPost[] => {
  return mockPosts
    .filter(post =>
      post.id !== currentPost.id &&
      (post.category === currentPost.category ||
       post.tags.some(tag => currentPost.tags.includes(tag)))
    )
    .slice(0, limit);
};
```

### Step 4: ブログ専用コンポーネントの作成

#### 4-1. BlogCard コンポーネント
**ファイル**: `src/components/blog/BlogCard.tsx`

```tsx
// src/components/blog/BlogCard.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { motion } from "framer-motion";
import { BlogPost } from "@/types/blog";
import { Link } from "react-router-dom";

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured';
  index?: number;
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

const categoryColors: Record<string, string> = {
  tech: 'bg-blue-100 text-blue-800 border-blue-200',
  design: 'bg-purple-100 text-purple-800 border-purple-200',
  business: 'bg-green-100 text-green-800 border-green-200',
  lifestyle: 'bg-pink-100 text-pink-800 border-pink-200',
};

export const BlogCard: React.FC<BlogCardProps> = ({ post, variant = "default", index = 0 }) => {
  const categoryColorClass = categoryColors[post.category] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ delay: index * 0.1 }}
      className="h-full cursor-pointer"
    >
      <Link to={`/blog/${post.slug}`} className="block h-full">
        <Card className="rounded-xl border bg-card text-card-foreground shadow hover:shadow-lg transition-shadow h-full flex flex-col">
          {/* サムネイル画像 */}
          <div className="aspect-[16/9] rounded-t-xl overflow-hidden">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover transition-transform hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x225/f3f4f6/9ca3af?text=No+Image';
              }}
            />
          </div>

          <CardHeader className="pb-3">
            {/* カテゴリバッジ */}
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={`text-xs rounded-full border font-medium ${categoryColorClass}`}>
                {post.category}
              </Badge>
              {post.featured && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs rounded-full border font-medium">
                  ⭐ 注目
                </Badge>
              )}
            </div>

            {/* タイトル */}
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-2 leading-tight">
              {post.title}
            </CardTitle>

            {/* 説明文 */}
            <CardDescription className="text-base text-gray-500 line-clamp-2">
              {post.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0 flex-grow">
            {/* タグ */}
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter className="pt-0 mt-auto">
            {/* メタ情報 */}
            <div className="flex items-center justify-between w-full text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.publishedAt).toLocaleDateString('ja-JP')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime}分</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

export default BlogCard;
```

#### 4-2. BlogList コンポーネント
**ファイル**: `src/components/blog/BlogList.tsx`

```tsx
// src/components/blog/BlogList.tsx
import { motion } from "framer-motion";
import { BlogPost } from "@/types/blog";
import { BlogCard } from "./BlogCard";

interface BlogListProps {
  posts: BlogPost[];
  variant?: 'grid' | 'list';
}

const listContainerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const BlogList: React.FC<BlogListProps> = ({ posts, variant = 'grid' }) => {
  return (
    <motion.div
      variants={listContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {posts.map((post, index) => (
        <BlogCard key={post.id} post={post} index={index} />
      ))}
    </motion.div>
  );
};

export default BlogList;
```

#### 4-3. CategoryFilter コンポーネント
**ファイル**: `src/components/blog/CategoryFilter.tsx`

```tsx
// src/components/blog/CategoryFilter.tsx
import { Button } from "@/components/ui/button";
import { BlogCategory } from "@/types/blog";

interface CategoryFilterProps {
  categories: BlogCategory[];
  selectedCategory?: string | null;
  onCategoryChange: (category: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-white rounded-lg shadow-sm border mb-8">
      {/* すべてのカテゴリボタン */}
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(null)}
        className="rounded-full"
      >
        すべて
      </Button>

      {/* カテゴリボタン */}
      {categories.map((category) => (
        <Button
          key={category.slug}
          variant={selectedCategory === category.slug ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.slug)}
          className="rounded-full"
        >
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${category.color}`}
          />
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
```

#### 4-4. Pagination コンポーネント
**ファイル**: `src/components/blog/Pagination.tsx`

```tsx
// src/components/blog/Pagination.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BlogPagination } from "@/types/blog";

interface PaginationProps {
  pagination: BlogPagination;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2 mt-12">
      {/* 前のページボタン */}
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrevPage}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center space-x-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>前へ</span>
      </Button>

      {/* ページ番号ボタン */}
      <div className="flex space-x-1">
        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="w-10 h-10"
          >
            {page}
          </Button>
        ))}
      </div>

      {/* 次のページボタン */}
      <Button
        variant="outline"
        size="sm"
        disabled={!hasNextPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center space-x-1"
      >
        <span>次へ</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Pagination;
```

#### 4-5. BlogPostHeader コンポーネント
**ファイル**: `src/components/blog/BlogPostHeader.tsx`

```tsx
// src/components/blog/BlogPostHeader.tsx
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { BlogPost } from "@/types/blog";

interface BlogPostHeaderProps {
  post: BlogPost;
}

const categoryColors: Record<string, string> = {
  tech: 'bg-blue-100 text-blue-800 border-blue-200',
  design: 'bg-purple-100 text-purple-800 border-purple-200',
  business: 'bg-green-100 text-green-800 border-green-200',
  lifestyle: 'bg-pink-100 text-pink-800 border-pink-200',
};

export const BlogPostHeader: React.FC<BlogPostHeaderProps> = ({ post }) => {
  const categoryColorClass = categoryColors[post.category] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className="text-center py-12 m-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-6"
      >
        {/* 絵文字アイコン（正方形） */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
          📝
        </div>

        {/* タイトル */}
        <h1 className="text-4xl md:text-5xl font-bold !leading-normal max-w-4xl">
          {post.title}
        </h1>

        {/* 説明文 */}
        <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
          {post.description}
        </p>

        {/* メタ情報 */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(post.publishedAt).toLocaleDateString('ja-JP')}</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime}分で読める</span>
          </div>
        </div>

        {/* カテゴリとタグ */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge className={`text-sm px-4 py-2 rounded-full border font-medium ${categoryColorClass}`}>
            {post.category}
          </Badge>
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-sm px-3 py-1 rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default BlogPostHeader;
```

#### 4-6. BlogContent コンポーネント（マークダウンスタイル対応）
**ファイル**: `src/components/blog/BlogContent.tsx`

```tsx
// src/components/blog/BlogContent.tsx
import styles from './BlogContent.module.css';
import { ReactNode } from 'react';

interface BlogContentProps {
  children: ReactNode;
  className?: string;
}

export function BlogContent({ children, className = '' }: BlogContentProps) {
  return (
    <div className={`${styles.content} ${className}`}>
      {children}
    </div>
  );
}

export default BlogContent;
```

**ファイル**: `src/components/blog/BlogContent.module.css`

```css
/* src/components/blog/BlogContent.module.css */
/* （前回提供したマークダウンスタイルをそのまま使用） */
.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  line-height: 1.7;
  color: #374151;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ヘッディング */
.content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 3rem 0 1.5rem 0;
  color: #1f2937;
  border-bottom: 3px solid #e5e7eb;
  padding-bottom: 0.5rem;
  line-height: 1.2;
}

.content h2 {
  font-size: 2rem;
  font-weight: 600;
  margin: 2.5rem 0 1rem 0;
  color: #1f2937;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 0.25rem;
  line-height: 1.3;
}

.content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 2rem 0 0.75rem 0;
  color: #374151;
  line-height: 1.4;
}

/* その他のスタイルは省略（前回のものをそのまま使用） */
```

### Step 5: ページコンポーネントの作成

#### 5-1. ブログ一覧ページ
**ファイル**: `src/pages/blog/index.tsx`

```tsx
// src/pages/blog/index.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BlogList } from '@/components/blog/BlogList';
import { CategoryFilter } from '@/components/blog/CategoryFilter';
import { Pagination } from '@/components/blog/Pagination';
import { getBlogPosts } from '@/utils/blog/blogUtils';
import { categories } from '@/data/blog/categories';
import { BlogPostsResponse } from '@/types/blog';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

export const BlogIndex: React.FC = () => {
  const [blogData, setBlogData] = useState<BlogPostsResponse>({ posts: [], pagination: { currentPage: 1, totalPages: 1, totalPosts: 0, postsPerPage: 9, hasNextPage: false, hasPrevPage: false } });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // データ取得
  useEffect(() => {
    const data = getBlogPosts({
      page: currentPage,
      category: selectedCategory || undefined,
      limit: 9
    });
    setBlogData(data);
  }, [currentPage, selectedCategory]);

  // カテゴリ変更ハンドラ
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1); // カテゴリ変更時は1ページ目に戻る
  };

  // ページ変更ハンドラ
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // スムーズスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="min-h-screen bg-Top"
    >
      {/* ヘッダー（既存のHeader.jsを使用） */}
      {/* <Header className="fixed py-6 px-6 z-50" /> */}

      {/* メインコンテンツ */}
      <main className="container pt-24">
        {/* ページタイトルセクション */}
        <div className="text-center py-12">
          <h1 className="text-4xl md:text-5xl font-bold !leading-normal mb-4">
            ブログ
          </h1>
          <p className="text-lg text-gray-600">
            最新の記事をお届けします
          </p>
        </div>

        {/* コンテンツエリア */}
        <div className="w-11/12 md:w-10/12 mx-auto">
          {/* カテゴリフィルター */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          {/* 記事一覧 */}
          {blogData.posts.length > 0 ? (
            <>
              <BlogList posts={blogData.posts} />

              {/* ページネーション */}
              {blogData.pagination.totalPages > 1 && (
                <Pagination
                  pagination={blogData.pagination}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">記事が見つかりませんでした。</p>
            </div>
          )}
        </div>
      </main>

      {/* フッター（既存のFooter.jsを使用） */}
      {/* <Footer /> */}
    </motion.div>
  );
};

export default BlogIndex;
```

#### 5-2. ブログ記事詳細ページ
**ファイル**: `src/pages/blog/[slug].tsx`

```tsx
// src/pages/blog/[slug].tsx
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BlogPostHeader } from '@/components/blog/BlogPostHeader';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogList } from '@/components/blog/BlogList';
import { getBlogPost, getRelatedPosts } from '@/utils/blog/blogUtils';
import { BlogPost } from '@/types/blog';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // 記事データ取得
  const post = slug ? getBlogPost(slug) : null;
  const relatedPosts = post ? getRelatedPosts(post) : [];

  // 記事が見つからない場合は404ページへ
  if (!post) {
    return <Navigate to="/404" replace />;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="min-h-screen bg-Top"
    >
      {/* ヘッダー（既存のHeader.jsを使用） */}
      {/* <Header className="fixed py-6 px-6 z-50" /> */}

      {/* メインコンテンツ */}
      <main className="container pt-24">
        {/* 記事ヘッダーセクション */}
        <BlogPostHeader post={post} />

        {/* 記事本文エリア */}
        <div className="w-11/12 md:w-10/12 mx-auto">
          <article>
            <BlogContent>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </BlogContent>
          </article>

          {/* 関連記事セクション */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-8 border-t">
              <h3 className="text-2xl font-bold mb-6 text-center">関連記事</h3>
              <BlogList posts={relatedPosts} />
            </div>
          )}
        </div>
      </main>

      {/* フッター（既存のFooter.jsを使用） */}
      {/* <Footer /> */}
    </motion.div>
  );
};

export default BlogPostPage;
```

#### 5-3. カテゴリ別一覧ページ
**ファイル**: `src/pages/blog/category/[category].tsx`

```tsx
// src/pages/blog/category/[category].tsx
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BlogList } from '@/components/blog/BlogList';
import { Pagination } from '@/components/blog/Pagination';
import { getBlogPosts } from '@/utils/blog/blogUtils';
import { getCategoryBySlug } from '@/data/blog/categories';
import { BlogPostsResponse } from '@/types/blog';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

export const BlogCategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [blogData, setBlogData] = useState<BlogPostsResponse>({ posts: [], pagination: { currentPage: 1, totalPages: 1, totalPosts: 0, postsPerPage: 9, hasNextPage: false, hasPrevPage: false } });
  const [currentPage, setCurrentPage] = useState(1);

  // カテゴリ情報取得
  const categoryInfo = category ? getCategoryBySlug(category) : null;

  // データ取得
  useEffect(() => {
    if (category) {
      const data = getBlogPosts({
        page: currentPage,
        category: category,
        limit: 9
      });
      setBlogData(data);
    }
  }, [currentPage, category]);

  // ページ変更ハンドラ
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // カテゴリが見つからない場合は404ページへ
  if (!categoryInfo) {
    return <Navigate to="/404" replace />;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="min-h-screen bg-Top"
    >
      {/* ヘッダー（既存のHeader.jsを使用） */}
      {/* <Header className="fixed py-6 px-6 z-50" /> */}

      {/* メインコンテンツ */}
      <main className="container pt-24">
        {/* カテゴリタイトルセクション */}
        <div className="text-center py-12">
          <div className="flex items-center justify-center mb-4">
            <span className={`inline-block w-4 h-4 rounded-full mr-3 ${categoryInfo.color}`} />
            <h1 className="text-4xl md:text-5xl font-bold !leading-normal">
              {categoryInfo.name}
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            {categoryInfo.description}
          </p>
        </div>

        {/* コンテンツエリア */}
        <div className="w-11/12 md:w-10/12 mx-auto">
          {/* 記事一覧 */}
          {blogData.posts.length > 0 ? (
            <>
              <BlogList posts={blogData.posts} />

              {/* ページネーション */}
              {blogData.pagination.totalPages > 1 && (
                <Pagination
                  pagination={blogData.pagination}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">このカテゴリの記事が見つかりませんでした。</p>
            </div>
          )}
        </div>
      </main>

      {/* フッター（既存のFooter.jsを使用） */}
      {/* <Footer /> */}
    </motion.div>
  );
};

export default BlogCategoryPage;
```

### Step 6: ルーティング設定

#### 6-1. App.tsxにルート追加
**ファイル**: `src/App.tsx` (既存ファイルに追加)

```tsx
// src/App.tsx (既存ルートに追加)
import { Routes, Route } from 'react-router-dom';
import BlogIndex from '@/pages/blog/index';
import BlogPostPage from '@/pages/blog/[slug]';
import BlogCategoryPage from '@/pages/blog/category/[category]';

function App() {
  return (
    <Routes>
      {/* 既存ルートはそのまま */}

      {/* /blog以下のルートを追加 */}
      <Route path="/blog" element={<BlogIndex />} />
      <Route path="/blog/category/:category" element={<BlogCategoryPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
    </Routes>
  );
}

export default App;
```

### Step 7: スタイル設定

#### 7-1. globals.cssに追加
**ファイル**: `src/styles/globals.css` (既存ファイルに追加)

```css
/* src/styles/globals.css に追加 */

/* レスポンシブフォントサイズ設定 */
:root {
  /* デスクトップ: 16px ベース */
  font-size: 16px;
}

@media (max-width: 768px) {
  :root {
    /* タブレット: 15px ベース */
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  :root {
    /* スマホ: 14px ベース */
    font-size: 14px;
  }
}

/* ブログ専用ユーティリティクラス */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### Step 8: テスト実行

#### 8-1. 開発サーバー起動
```bash
npm run dev
```

#### 8-2. 動作確認
1. `http://localhost:3000/blog` - ブログ一覧ページ
2. `http://localhost:3000/blog/getting-started-with-react` - 記事詳細ページ
3. `http://localhost:3000/blog/category/tech` - カテゴリ別一覧ページ

### Step 9: エラー対応とデバッグ

#### 9-1. よくあるエラーと対応
1. **Import エラー**: パスエイリアス `@/` の設定確認
2. **Lucide アイコンエラー**: `npm install lucide-react`
3. **Framer Motion エラー**: `npm install framer-motion`
4. **ShadCN UI エラー**: 各コンポーネントのインストール確認

#### 9-2. ビルドテスト
```bash
npm run build
```

### 完成チェックリスト

- [ ] 型定義作成完了
- [ ] 静的データ作成完了
- [ ] ブログ専用コンポーネント作成完了
- [ ] ページコンポーネント作成完了
- [ ] ルーティング設定完了
- [ ] スタイル設定完了
- [ ] 全ページの動作確認完了
- [ ] ビルドテスト完了

この手順書に従って実装すれば、bonoSite-mainの見た目を完全に再現した `/blog` 以下のページが完成します。