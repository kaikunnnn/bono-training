// src/utils/blog/blogUtils.ts
import { BlogPost, BlogPostsResponse } from '@/types/blog';
import { mockPosts } from '@/data/blog/mockPosts';
import {
  fetchGhostPosts,
  fetchGhostPostBySlug,
  fetchFeaturedGhostPosts,
  fetchRelatedGhostPosts,
  checkGhostConnection
} from '@/services/ghostService';

// データソースの設定
const isGhostEnabled = () => {
  return import.meta.env.VITE_BLOG_DATA_SOURCE === 'ghost' &&
         import.meta.env.VITE_GHOST_URL &&
         import.meta.env.VITE_GHOST_KEY;
};

export const getBlogPosts = async (params?: {
  page?: number;
  category?: string;
  limit?: number;
}): Promise<BlogPostsResponse> => {
  if (isGhostEnabled()) {
    try {
      const isConnected = await checkGhostConnection();
      if (isConnected) {
        const filter = params?.category ? `tag:${params.category}` : undefined;
        return await fetchGhostPosts({
          page: params?.page,
          limit: params?.limit,
          filter,
        });
      }
    } catch (error) {
      console.warn('Ghost API failed, falling back to mock data:', error);
    }
  }

  // フォールバック: mockPostsを使用
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

// レガシー関数（getBlogPostBySlugを使用することを推奨）
export const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
  return await getBlogPostBySlug(slug);
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  if (isGhostEnabled()) {
    try {
      const isConnected = await checkGhostConnection();
      if (isConnected) {
        return await fetchGhostPostBySlug(slug);
      }
    } catch (error) {
      console.warn(`Ghost API failed for slug ${slug}, falling back to mock data:`, error);
    }
  }

  // フォールバック: mockPostsから取得
  return mockPosts.find(post => post.slug === slug) || null;
};

export const getPrevPost = async (currentId: string): Promise<BlogPost | null> => {
  // Note: Ghost APIでは前後の記事を直接取得する機能がないため、
  // 現在はmockPostsのロジックを使用（将来的に改善予定）
  const currentIndex = mockPosts.findIndex(post => post.id === currentId);
  if (currentIndex > 0) {
    return mockPosts[currentIndex - 1];
  }
  return null;
};

export const getNextPost = async (currentId: string): Promise<BlogPost | null> => {
  // Note: Ghost APIでは前後の記事を直接取得する機能がないため、
  // 現在はmockPostsのロジックを使用（将来的に改善予定）
  const currentIndex = mockPosts.findIndex(post => post.id === currentId);
  if (currentIndex !== -1 && currentIndex < mockPosts.length - 1) {
    return mockPosts[currentIndex + 1];
  }
  return null;
};

// Ghost APIの接続状態を確認
export const testGhostConnection = async (): Promise<boolean> => {
  if (!isGhostEnabled()) {
    return false;
  }
  return await checkGhostConnection();
};

// データソースの表示用関数
export const getCurrentDataSource = (): 'ghost' | 'mock' => {
  return isGhostEnabled() ? 'ghost' : 'mock';
};

export const getFeaturedPosts = async (limit = 3): Promise<BlogPost[]> => {
  if (isGhostEnabled()) {
    try {
      const isConnected = await checkGhostConnection();
      if (isConnected) {
        return await fetchFeaturedGhostPosts(limit);
      }
    } catch (error) {
      console.warn('Ghost API failed for featured posts, falling back to mock data:', error);
    }
  }

  // フォールバック: mockPostsを使用
  return mockPosts.filter(post => post.featured).slice(0, limit);
};

export const getRelatedPosts = async (currentPost: BlogPost, limit = 3): Promise<BlogPost[]> => {
  if (isGhostEnabled()) {
    try {
      const isConnected = await checkGhostConnection();
      if (isConnected) {
        return await fetchRelatedGhostPosts(currentPost, limit);
      }
    } catch (error) {
      console.warn('Ghost API failed for related posts, falling back to mock data:', error);
    }
  }

  // フォールバック: mockPostsを使用
  return mockPosts
    .filter(post =>
      post.id !== currentPost.id &&
      (post.category === currentPost.category ||
       post.tags.some(tag => currentPost.tags.includes(tag)))
    )
    .slice(0, limit);
};

// 最新記事を取得（現在の記事を除外）
export const getLatestPosts = async (excludeId: string, limit = 4): Promise<BlogPost[]> => {
  if (isGhostEnabled()) {
    try {
      const isConnected = await checkGhostConnection();
      if (isConnected) {
        // limit + 1 を取得して、現在の記事を除外した後にlimit件返す
        const response = await fetchGhostPosts({ limit: limit + 1 });
        return response.posts
          .filter(post => post.id !== excludeId)
          .slice(0, limit);
      }
    } catch (error) {
      console.warn('Ghost API failed for latest posts, falling back to mock data:', error);
    }
  }

  // フォールバック: mockPostsを使用
  return mockPosts
    .filter(post => post.id !== excludeId)
    .slice(0, limit);
};