// src/services/ghostService.ts
import { getGhostApi } from '@/lib/ghost';
import { BlogPost, BlogPostsResponse } from '@/types/blog';
import { GhostPost, GhostPostsResponse } from '@/types/ghost';
import { extractEmojiFromText } from '@/utils/blog/emojiUtils';

// GhostPostをBlogPostに変換するアダプター
export const convertGhostToBlogPost = (ghostPost: GhostPost): BlogPost => {
  // タイトルから絵文字を抽出（カスタムフィールドがあればそちらを優先）
  const extractedEmoji = extractEmojiFromText(ghostPost.title);
  const emoji = ghostPost.emoji || extractedEmoji || undefined;

  return {
    id: ghostPost.id,
    slug: ghostPost.slug,
    title: ghostPost.title,
    description: ghostPost.excerpt || ghostPost.custom_excerpt || '',
    content: ghostPost.html || '',
    author: ghostPost.primary_author?.name || 'Unknown',
    publishedAt: ghostPost.published_at,
    category: ghostPost.primary_tag?.slug || 'uncategorized',
    tags: ghostPost.tags?.map(tag => tag.name) || [],
    thumbnail: ghostPost.feature_image || '/blog/images/default.jpg',
    featured: ghostPost.featured || false,
    readingTime: ghostPost.reading_time || 5,
    emoji: emoji, // タイトルから自動抽出 or カスタムフィールド
    // 追加フィールド（既存のBlogPost型に合わせて）
    imageUrl: ghostPost.feature_image,
    excerpt: ghostPost.excerpt || ghostPost.custom_excerpt || '',
    categorySlug: ghostPost.primary_tag?.slug || 'uncategorized',
    readTime: ghostPost.reading_time || 5,
  };
};

// Ghost APIから記事一覧を取得
export const fetchGhostPosts = async (options?: {
  page?: number;
  limit?: number;
  filter?: string;
}): Promise<BlogPostsResponse> => {
  const ghostApi = getGhostApi();
  if (!ghostApi) {
    throw new Error('Ghost API is not configured');
  }

  try {
    const response = await ghostApi.posts.browse({
      page: options?.page || 1,
      limit: options?.limit || 9,
      include: ['tags', 'authors'],
      filter: options?.filter,
      order: 'published_at DESC',
    });

    // Check if response is array (posts directly) or object with posts property
    const posts = Array.isArray(response) ? response : (response as any)?.posts || [];
    const meta = Array.isArray(response) ? null : (response as any)?.meta;

    return {
      posts: posts.map(convertGhostToBlogPost),
      pagination: meta?.pagination ? {
        currentPage: meta.pagination.page,
        totalPages: meta.pagination.pages,
        totalPosts: meta.pagination.total,
        postsPerPage: meta.pagination.limit,
        hasNextPage: !!meta.pagination.next,
        hasPrevPage: !!meta.pagination.prev,
      } : {
        currentPage: 1,
        totalPages: 1,
        totalPosts: posts.length,
        postsPerPage: posts.length,
        hasNextPage: false,
        hasPrevPage: false,
      }
    };
  } catch (error) {
    console.error('Failed to fetch Ghost posts:', error);
    throw error;
  }
};

// スラッグで単一記事を取得
export const fetchGhostPostBySlug = async (slug: string): Promise<BlogPost> => {
  const ghostApi = getGhostApi();
  if (!ghostApi) {
    throw new Error('Ghost API is not configured');
  }

  try {
    const ghostPost = await ghostApi.posts.read(
      { slug },
      { include: ['tags', 'authors'] }
    ) as GhostPost;

    return convertGhostToBlogPost(ghostPost);
  } catch (error) {
    console.error(`Failed to fetch Ghost post with slug ${slug}:`, error);
    throw error;
  }
};

// カテゴリ（タグ）別の記事を取得
export const fetchGhostPostsByCategory = async (
  categorySlug: string,
  options?: {
    page?: number;
    limit?: number;
  }
): Promise<BlogPostsResponse> => {
  return fetchGhostPosts({
    ...options,
    filter: `tag:${categorySlug}`,
  });
};

// 注目記事を取得
export const fetchFeaturedGhostPosts = async (limit = 3): Promise<BlogPost[]> => {
  const ghostApi = getGhostApi();
  if (!ghostApi) {
    throw new Error('Ghost API is not configured');
  }

  try {
    const response = await ghostApi.posts.browse({
      limit,
      filter: 'featured:true',
      include: ['tags', 'authors'],
      order: 'published_at DESC',
    });

    const posts = Array.isArray(response) ? response : (response as any)?.posts || [];
    return posts.map(convertGhostToBlogPost);
  } catch (error) {
    console.error('Failed to fetch featured Ghost posts:', error);
    throw error;
  }
};

// 関連記事を取得（同じタグまたはカテゴリ）
export const fetchRelatedGhostPosts = async (
  currentPost: BlogPost,
  limit = 3
): Promise<BlogPost[]> => {
  const ghostApi = getGhostApi();
  if (!ghostApi) {
    return [];
  }

  try {
    if (!currentPost.category) {
      return [];
    }

    const response = await ghostApi.posts.browse({
      limit: limit + 1, // 現在の記事を除外するため+1
      filter: `tag:${currentPost.category}`,
      include: ['tags', 'authors'],
      order: 'published_at DESC',
    });

    const posts = Array.isArray(response) ? response : (response as any)?.posts || [];
    return posts
      .map(convertGhostToBlogPost)
      .filter(post => post.id !== currentPost.id)
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch related Ghost posts:', error);
    return [];
  }
};

// Ghost APIの接続状態を確認
export const checkGhostConnection = async (): Promise<boolean> => {
  const ghostApi = getGhostApi();
  if (!ghostApi) {
    return false;
  }

  try {
    await ghostApi.posts.browse({ limit: 1 });
    return true;
  } catch (error) {
    console.warn('Ghost API connection failed:', error);
    return false;
  }
};