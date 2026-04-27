/**
 * OGP (Open Graph Protocol) データ取得サービス
 *
 * Supabase Edge FunctionsでOGPデータを取得する
 */

import { createClient } from '@/lib/supabase/client'

export type OgpData = {
  title?: string
  description?: string
  image?: string
  icon?: string
  siteName?: string
}

export async function fetchOgpForUrl(url: string): Promise<OgpData> {
  const supabase = createClient()

  const { data, error } = await supabase.functions.invoke('fetch-ogp', {
    body: { url },
  })

  if (error) throw error
  return (data ?? {}) as OgpData
}
