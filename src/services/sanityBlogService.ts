import type { BlogPost, BlogPostsResponse } from '@/types/blog'
import { client } from '@/lib/sanity'
import { extractEmojiFromText } from '@/utils/blog/emojiUtils'

type SanityBlogPost = {
  _id: string
  title: string
  slug?: { current?: string }
  publishedAt?: string
  author?: string
  description?: string
  contentHtml?: string
  emoji?: string
  category?: string
  tags?: string[]
  featured?: boolean
  thumbnailUrl?: string
}

const DEFAULT_THUMBNAIL = '/blog/images/default.jpg'

function toBlogPost(doc: SanityBlogPost): BlogPost & { imageUrl?: string; excerpt?: string } {
  const slug = doc.slug?.current ?? ''
  const publishedAt = doc.publishedAt ?? new Date().toISOString()
  const category = doc.category ?? 'uncategorized'

  const extractedEmoji = extractEmojiFromText(doc.title)
  const emoji = doc.emoji || extractedEmoji

  const thumbnail = doc.thumbnailUrl || DEFAULT_THUMBNAIL

  return {
    id: doc._id,
    slug,
    title: doc.title,
    description: doc.description ?? '',
    content: doc.contentHtml ?? '',
    author: doc.author ?? 'BONO',
    publishedAt,
    category,
    tags: doc.tags ?? [],
    thumbnail,
    featured: !!doc.featured,
    readingTime: 5,
    emoji,
    // UI側で参照されることがあるため互換用に付与（types/blog.ts には無いが既存実装が参照）
    imageUrl: thumbnail,
    excerpt: doc.description ?? '',
  }
}

export async function fetchSanityBlogPosts(params?: {
  page?: number
  limit?: number
  category?: string
}): Promise<BlogPostsResponse> {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 9
  const start = (page - 1) * limit
  const end = start + limit

  const categoryFilter = params?.category ? ' && category == $category' : ''

  const query = `{
    "total": count(*[_type == "blogPost"${categoryFilter}]),
    "posts": *[_type == "blogPost"${categoryFilter}] | order(publishedAt desc) [$start...$end]{
      _id,
      title,
      slug,
      publishedAt,
      author,
      description,
      contentHtml,
      emoji,
      category,
      tags,
      featured,
      thumbnailUrl
    }
  }`

  const data = await client.fetch<{ total: number; posts: SanityBlogPost[] }>(query, {
    start,
    end,
    category: params?.category,
  })

  const posts = (data?.posts ?? []).map(toBlogPost)
  const total = data?.total ?? posts.length
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return {
    posts,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts: total,
      postsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}

export async function fetchSanityBlogPostBySlug(slug: string): Promise<(BlogPost & { imageUrl?: string; excerpt?: string }) | null> {
  const query = `*[_type == "blogPost" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    publishedAt,
    author,
    description,
    contentHtml,
    emoji,
    category,
    tags,
    featured,
    thumbnailUrl
  }`

  const doc = await client.fetch<SanityBlogPost | null>(query, { slug })
  if (!doc?._id) return null
  return toBlogPost(doc)
}

/**
 * /blog/tags のための “タグ（=カテゴリslug）” 一覧を返す
 * - 既存UIは GhostTag 形状を期待しているため、呼び出し側で整形する
 */
export async function fetchSanityCategoryCounts(): Promise<Record<string, number>> {
  const query = `{
    "counts": *[_type == "blogPost" && defined(category)]{
      "category": category
    }
  }`

  const data = await client.fetch<{ counts: { category?: string }[] }>(query)
  const out: Record<string, number> = {}
  for (const item of data?.counts ?? []) {
    const c = item.category
    if (!c) continue
    out[c] = (out[c] ?? 0) + 1
  }
  return out
}

