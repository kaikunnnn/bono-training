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

export const getBlogPostBySlug = (slug: string): BlogPost | null => {
  return mockPosts.find(post => post.slug === slug) || null;
};

export const getPrevPost = (currentId: string): BlogPost | null => {
  const currentIndex = mockPosts.findIndex(post => post.id === currentId);
  if (currentIndex > 0) {
    return mockPosts[currentIndex - 1];
  }
  return null;
};

export const getNextPost = (currentId: string): BlogPost | null => {
  const currentIndex = mockPosts.findIndex(post => post.id === currentId);
  if (currentIndex !== -1 && currentIndex < mockPosts.length - 1) {
    return mockPosts[currentIndex + 1];
  }
  return null;
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