import type { BlogPost, BlogPostsResponse } from '@/types/blog'
import { client } from '@/lib/sanity'
import { urlFor } from '@/lib/sanity'
import { extractEmojiFromText } from '@/utils/blog/emojiUtils'
import type { PortableTextBlock } from '@portabletext/types'

type SanityBlogPost = {
  _id: string
  title: string
  slug?: { current?: string }
  publishedAt?: string
  author?: string
  description?: string
  content?: PortableTextBlock[]
  contentHtml?: string
  emoji?: string
  category?: string
  tags?: string[]
  featured?: boolean
  thumbnail?: unknown
  thumbnailUrl?: string
}

const DEFAULT_THUMBNAIL = '/placeholder-thumbnail.svg'

function estimateReadingTimeFromHtml(html: string): number {
  // 超簡易: タグ除去して文字数から概算（日本語前提で 600文字/分 を目安）
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const chars = text.length
  return Math.max(1, Math.round(chars / 600))
}

function estimateReadingTimeFromPortableText(blocks: PortableTextBlock[]): number {
  const text = blocks
    .map((b) => {
      if ((b as any)?._type !== 'block') return ''
      const children = ((b as any).children ?? []) as Array<{ text?: string }>
      return children.map((c) => c.text ?? '').join(' ')
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  const chars = text.length
  return Math.max(1, Math.round(chars / 600))
}

function toBlogPost(doc: SanityBlogPost): BlogPost & { imageUrl?: string; excerpt?: string } {
  const slug = doc.slug?.current ?? ''
  const publishedAt = doc.publishedAt ?? new Date().toISOString()
  const category = doc.category ?? 'uncategorized'

  const extractedEmoji = extractEmojiFromText(doc.title)
  const emoji = doc.emoji || extractedEmoji

  // Sanityアップロード画像を優先、なければ外部URL、それもなければデフォルト
  const uploadedThumbnail =
    doc.thumbnail ? urlFor(doc.thumbnail).width(1200).height(675).fit('crop').url() : null
  const thumbnail = uploadedThumbnail || doc.thumbnailUrl || DEFAULT_THUMBNAIL
  const content = doc.content ?? doc.contentHtml ?? ''

  return {
    id: doc._id,
    slug,
    title: doc.title,
    description: doc.description ?? '',
    content,
    author: doc.author ?? 'BONO',
    publishedAt,
    category,
    tags: doc.tags ?? [],
    thumbnail,
    featured: !!doc.featured,
    readingTime: Array.isArray(content)
      ? estimateReadingTimeFromPortableText(content)
      : estimateReadingTimeFromHtml(content),
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
      content[] {
        ...,
        _type == "image" => {
          ...,
          "asset": asset->{
            _id,
            url
          }
        }
      },
      contentHtml,
      emoji,
      category,
      tags,
      featured,
      thumbnail {
        ...,
        asset->
      },
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
    content[] {
      ...,
      _type == "image" => {
        ...,
        "asset": asset->{
          _id,
          url
        }
      }
    },
    contentHtml,
    emoji,
    category,
    tags,
    featured,
    thumbnail {
      ...,
      asset->
    },
    thumbnailUrl
  }`

  const doc = await client.fetch<SanityBlogPost | null>(query, { slug })
  if (!doc?._id) return null
  return toBlogPost(doc)
}

export async function fetchSanityFeaturedPosts(limit = 3): Promise<(BlogPost & { imageUrl?: string; excerpt?: string })[]> {
  const query = `*[_type == "blogPost" && featured == true] | order(publishedAt desc) [0...$limit]{
    _id,
    title,
    slug,
    publishedAt,
    author,
    description,
    content[] {
      ...,
      _type == "image" => {
        ...,
        "asset": asset->{
          _id,
          url
        }
      }
    },
    contentHtml,
    emoji,
    category,
    tags,
    featured,
    thumbnail {
      ...,
      asset->
    },
    thumbnailUrl
  }`
  const docs = await client.fetch<SanityBlogPost[]>(query, { limit })
  return (docs ?? []).map(toBlogPost)
}

export async function fetchSanityLatestPosts(excludeId: string, limit = 4): Promise<(BlogPost & { imageUrl?: string; excerpt?: string })[]> {
  const query = `*[_type == "blogPost" && _id != $excludeId] | order(publishedAt desc) [0...$limit]{
    _id,
    title,
    slug,
    publishedAt,
    author,
    description,
    content[] {
      ...,
      _type == "image" => {
        ...,
        "asset": asset->{
          _id,
          url
        }
      }
    },
    contentHtml,
    emoji,
    category,
    tags,
    featured,
    thumbnail {
      ...,
      asset->
    },
    thumbnailUrl
  }`
  const docs = await client.fetch<SanityBlogPost[]>(query, { excludeId, limit })
  return (docs ?? []).map(toBlogPost)
}

export async function fetchSanityPrevPost(currentId: string): Promise<(BlogPost & { imageUrl?: string; excerpt?: string }) | null> {
  const current = await client.fetch<{ publishedAt?: string } | null>(
    `*[_type == "blogPost" && _id == $id][0]{ publishedAt }`,
    { id: currentId }
  )
  const currentPublishedAt = current?.publishedAt
  if (!currentPublishedAt) return null

  const prev = await client.fetch<SanityBlogPost | null>(
    `*[_type == "blogPost" && publishedAt < $publishedAt] | order(publishedAt desc)[0]{
      _id,title,slug,publishedAt,author,description,contentHtml,emoji,category,tags,featured,thumbnail,thumbnailUrl
    }`,
    { publishedAt: currentPublishedAt }
  )
  return prev?._id ? toBlogPost(prev) : null
}

export async function fetchSanityNextPost(currentId: string): Promise<(BlogPost & { imageUrl?: string; excerpt?: string }) | null> {
  const current = await client.fetch<{ publishedAt?: string } | null>(
    `*[_type == "blogPost" && _id == $id][0]{ publishedAt }`,
    { id: currentId }
  )
  const currentPublishedAt = current?.publishedAt
  if (!currentPublishedAt) return null

  const next = await client.fetch<SanityBlogPost | null>(
    `*[_type == "blogPost" && publishedAt > $publishedAt] | order(publishedAt asc)[0]{
      _id,title,slug,publishedAt,author,description,contentHtml,emoji,category,tags,featured,thumbnail,thumbnailUrl
    }`,
    { publishedAt: currentPublishedAt }
  )
  return next?._id ? toBlogPost(next) : null
}

export async function fetchSanityRelatedPosts(
  current: BlogPost,
  limit = 3
): Promise<(BlogPost & { imageUrl?: string; excerpt?: string })[]> {
  const tags = current.tags ?? []
  const category = current.category

  // 同カテゴリ or タグが1つでも一致する記事を取得（自分は除外）
  const query = `*[_type == "blogPost" && _id != $excludeId && (
      category == $category ||
      count(tags[@ in $tags]) > 0
    )] | order(publishedAt desc) [0...$limit]{
      _id,title,slug,publishedAt,author,description,contentHtml,emoji,category,tags,featured,thumbnail,thumbnailUrl
    }`

  const docs = await client.fetch<SanityBlogPost[]>(query, {
    excludeId: current.id,
    category,
    tags,
    limit,
  })
  return (docs ?? []).map(toBlogPost)
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

