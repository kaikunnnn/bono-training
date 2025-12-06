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
  emoji?: string;           // 記事の絵文字（Fluent Emoji 3D表示用）
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