// src/utils/blog/dataSource.ts
// ブログのデータソース判定を一箇所に集約する

export const isSanityEnabled = (): boolean => {
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
  const dataset = import.meta.env.VITE_SANITY_DATASET
  const hasSanityConfig = Boolean(projectId && dataset)
  const source = import.meta.env.VITE_BLOG_DATA_SOURCE

  // デバッグログ
  console.log('[dataSource] Sanity check:', { projectId, dataset, hasSanityConfig, source })

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

