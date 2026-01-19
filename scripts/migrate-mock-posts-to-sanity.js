/**
 * mockPosts → Sanity(blogPost) 移行スクリプト
 *
 * 目的:
 * - 現行フロント（/blog）を変えずに、Sanityをブログの正本データとして使えるようにする
 *
 * 実行例:
 *   SANITY_PROJECT_ID=xxx SANITY_DATASET=development SANITY_TOKEN=xxx node scripts/migrate-mock-posts-to-sanity.js
 *
 * 注意:
 * - SANITY_TOKEN は書き込み権限が必要です
 * - 既存データを壊したくないので、同一slugが存在する場合はスキップします
 */

import { createClient } from '@sanity/client'
import { mockPosts } from '../src/data/blog/mockPosts.js'

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET
const token = process.env.SANITY_TOKEN

if (!projectId || !dataset || !token) {
  console.error('❌ 必要な環境変数が不足しています: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

async function main() {
  console.log(`▶ migrate mockPosts → sanity (${projectId}/${dataset})`)

  let created = 0
  let skipped = 0

  for (const post of mockPosts) {
    const slug = post.slug
    const exists = await client.fetch(
      `count(*[_type == "blogPost" && slug.current == $slug])`,
      { slug }
    )

    if (exists > 0) {
      skipped++
      continue
    }

    const doc = {
      _type: 'blogPost',
      title: post.title,
      slug: { _type: 'slug', current: slug },
      publishedAt: post.publishedAt,
      author: post.author,
      description: post.description,
      contentHtml: post.content,
      emoji: post.emoji,
      category: post.category,
      tags: post.tags,
      featured: post.featured,
      thumbnailUrl: post.thumbnail,
    }

    await client.create(doc)
    created++
  }

  console.log(`✅ done: created=${created}, skipped=${skipped}, total=${mockPosts.length}`)
}

main().catch((e) => {
  console.error('❌ migrate failed:', e)
  process.exit(1)
})

