import { supabase } from '@/integrations/supabase/client'

export type OgpData = {
  title?: string
  description?: string
  image?: string
  icon?: string
  siteName?: string
}

export async function fetchOgpForUrl(url: string): Promise<OgpData> {
  const { data, error } = await supabase.functions.invoke('fetch-ogp', {
    body: { url },
  })

  if (error) throw error
  return (data ?? {}) as OgpData
}

