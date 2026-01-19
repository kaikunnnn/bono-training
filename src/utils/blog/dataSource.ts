// src/utils/blog/dataSource.ts
// ブログのデータソース判定を一箇所に集約する

export const isSanityEnabled = (): boolean => {
  const hasSanityConfig = Boolean(
    import.meta.env.VITE_SANITY_PROJECT_ID && import.meta.env.VITE_SANITY_DATASET
  )
  const source = import.meta.env.VITE_BLOG_DATA_SOURCE

  // VITE_BLOG_DATA_SOURCE が未指定の場合は「Sanity設定が入っていればSanity優先」で動かす
  if (!source) return hasSanityConfig

  return source === 'sanity' && hasSanityConfig
}

export const isGhostEnabled = (): boolean => {
  const hasGhostConfig = Boolean(
    import.meta.env.VITE_GHOST_URL && import.meta.env.VITE_GHOST_KEY
  )
  const source = import.meta.env.VITE_BLOG_DATA_SOURCE

  if (!source) return hasGhostConfig

  return source === 'ghost' && hasGhostConfig
}

