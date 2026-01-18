import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

type OgpResponse = {
  title?: string
  description?: string
  image?: string
  icon?: string
  siteName?: string
}

function normalizeUrl(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null
  try {
    const u = new URL(raw)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u.toString()
  } catch {
    return null
  }
}

function extractMetaContent(html: string, selector: RegExp): string | undefined {
  const m = html.match(selector)
  if (!m) return undefined
  const value = m[1] ?? ''
  const trimmed = value.trim()
  return trimmed || undefined
}

function extractBetween(html: string, re: RegExp): string | undefined {
  const m = html.match(re)
  if (!m) return undefined
  const value = (m[1] ?? '').trim()
  return value || undefined
}

function toAbsoluteUrl(baseUrl: string, maybeRelative?: string): string | undefined {
  if (!maybeRelative) return undefined
  try {
    return new URL(maybeRelative, baseUrl).toString()
  } catch {
    return undefined
  }
}

function pickFirst<T>(...values: (T | undefined | null | '')[]): T | undefined {
  for (const v of values) {
    if (v) return v as T
  }
  return undefined
}

async function fetchHtml(url: string): Promise<{ finalUrl: string; html: string } | null> {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      // ブロックされにくい程度にブラウザっぽいUAを付与
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      accept: 'text/html,application/xhtml+xml',
    },
  })

  if (!res.ok) return null

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
    // HTML以外は対象外
    return null
  }

  const html = await res.text()
  return { finalUrl: res.url, html }
}

function parseOgp(finalUrl: string, html: string): OgpResponse {
  // meta property="og:..." content="..."
  const ogTitle =
    extractMetaContent(
      html,
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) ??
    extractMetaContent(
      html,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["'][^>]*>/i
    )
  const ogDesc =
    extractMetaContent(
      html,
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) ??
    extractMetaContent(
      html,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["'][^>]*>/i
    )
  const ogImage =
    extractMetaContent(
      html,
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) ??
    extractMetaContent(
      html,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i
    )
  const ogSiteName =
    extractMetaContent(
      html,
      /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) ??
    extractMetaContent(
      html,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["'][^>]*>/i
    )

  // twitter:...
  const twTitle =
    extractMetaContent(
      html,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) ??
    extractMetaContent(
      html,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["'][^>]*>/i
    )
  const twDesc =
    extractMetaContent(
      html,
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) ??
    extractMetaContent(
      html,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:description["'][^>]*>/i
    )
  const twImage =
    extractMetaContent(
      html,
      /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) ??
    extractMetaContent(
      html,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["'][^>]*>/i
    )

  // <title>...</title>
  const titleTag = extractBetween(html, /<title[^>]*>([^<]+)<\/title>/i)

  // meta name="description"
  const metaDesc =
    extractMetaContent(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) ??
    extractMetaContent(
      html,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i
    )

  // favicon
  const iconHref =
    extractMetaContent(
      html,
      /<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]+href=["']([^"']+)["'][^>]*>/i
    ) ??
    extractMetaContent(
      html,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut icon|icon)["'][^>]*>/i
    )

  const title = pickFirst(ogTitle, twTitle, titleTag)
  const description = pickFirst(ogDesc, twDesc, metaDesc)
  const image = toAbsoluteUrl(finalUrl, pickFirst(ogImage, twImage))
  const icon = toAbsoluteUrl(finalUrl, iconHref) ?? toAbsoluteUrl(finalUrl, '/favicon.ico')
  const siteName =
    pickFirst(ogSiteName) ??
    (() => {
      try {
        return new URL(finalUrl).hostname
      } catch {
        return undefined
      }
    })()

  return { title, description, image, icon, siteName }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const body = (await req.json().catch(() => ({}))) as { url?: string }
    const normalized = normalizeUrl(body.url ?? '')
    if (!normalized) {
      return new Response(JSON.stringify({ error: 'Invalid url' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const fetched = await fetchHtml(normalized)
    if (!fetched) {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const ogp = parseOgp(fetched.finalUrl, fetched.html)

    return new Response(JSON.stringify(ogp), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})

