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

// ---- SSRF対策（F-1） -------------------------------------------------------
// 内部/メタデータ/loopback へのアクセスを遮断する。ホスト名は Deno.resolveDns で
// 実IPを解決してから判定し、IPリテラルは正規化した上で直接判定する。
// 設計の手本: src/app/api/feedback-apply/submit/route.ts の safeFetch/isPrivateIP*。
// Deno ランタイムのため node:dns は使えず Deno.resolveDns(host, 'A'|'AAAA') を使う。

function isIPv4Literal(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10))
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true // パースできない値は安全側でブロック
  }
  const [a, b] = parts
  if (a === 0) return true // 0.0.0.0/8（0.0.0.0 含む）
  if (a === 10) return true // 10.0.0.0/8
  if (a === 127) return true // 127.0.0.0/8 (loopback)
  if (a === 169 && b === 254) return true // 169.254.0.0/16 (link-local / cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12
  if (a === 192 && b === 168) return true // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true // 100.64.0.0/10 (CGNAT)
  return false
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase()
  if (lower === '::1' || lower === '::') return true // loopback / unspecified
  // IPv4-mapped (::ffff:a.b.c.d) は埋め込みIPv4として再判定。
  // WHATWG URL は ::ffff:127.0.0.1 を ::ffff:7f00:1 のような16進形に正規化するため両対応。
  const mapped = lower.match(/^::ffff:(.+)$/)
  if (mapped) {
    const rest = mapped[1]
    const dotted = rest.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/)
    if (dotted) return isPrivateIPv4(dotted[1])
    const hex = rest.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
    if (hex) {
      const hi = parseInt(hex[1], 16)
      const lo = parseInt(hex[2], 16)
      const v4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`
      return isPrivateIPv4(v4)
    }
    return true // 解釈不能な ::ffff: 形式は安全側でブロック
  }
  if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) {
    return true // fe80::/10 (link-local)
  }
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true // fc00::/7 (unique local)
  return false
}

function isBlockedIp(ip: string): boolean {
  if (ip.includes(':')) return isPrivateIPv6(ip)
  if (isIPv4Literal(ip)) return isPrivateIPv4(ip)
  return true // 判定不能は安全側でブロック
}

// URLが安全に取得可能か検証する（scheme + 解決IP）。安全なら true。
async function isSafeFetchTarget(rawUrl: string): Promise<boolean> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return false
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false

  // IPv6リテラルはブラケット付き（[::1]）で返るため除去してから判定。
  // WHATWG URL は 0x7f.0.0.1 / 2130706433 等の別表記を正規化済みのため、
  // ここでは正規化後の hostname をそのまま判定できる。
  const hostname = url.hostname.replace(/^\[|\]$/g, '')

  // ホスト名がIPリテラルならそのまま判定
  if (isIPv4Literal(hostname) || hostname.includes(':')) {
    return !isBlockedIp(hostname)
  }

  // ホスト名は A / AAAA を解決して全レコードを検査（1つでもプライベートならブロック）
  try {
    const [aRes, aaaaRes] = await Promise.allSettled([
      Deno.resolveDns(hostname, 'A'),
      Deno.resolveDns(hostname, 'AAAA'),
    ])
    const addresses: string[] = []
    if (aRes.status === 'fulfilled') addresses.push(...aRes.value)
    if (aaaaRes.status === 'fulfilled') addresses.push(...aaaaRes.value)
    if (addresses.length === 0) return false // 解決不能はブロック
    return addresses.every((ip) => !isBlockedIp(ip))
  } catch {
    return false // 解決不能はブロック
  }
}

// レスポンスボディをサイズ上限付きで読み取る（巨大レスポンス対策）。
async function readLimited(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return await res.text()
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      chunks.push(value)
      total += value.length
      if (total >= maxBytes) {
        await reader.cancel()
        break
      }
    }
  }
  const merged = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    merged.set(c, offset)
    offset += c.length
  }
  return new TextDecoder().decode(merged)
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

// リダイレクトを手動追従しつつ各ホップを再検証して取得する（SSRF + タイムアウト + サイズ上限）。
async function fetchHtml(url: string): Promise<{ finalUrl: string; html: string } | null> {
  const MAX_HOPS = 3
  const TIMEOUT_MS = 5000
  const MAX_BYTES = 2 * 1024 * 1024 // 2MB
  let currentUrl = url

  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    // 各ホップの URL を毎回検証（host解決→private遮断）してから fetch
    if (!(await isSafeFetchTarget(currentUrl))) return null

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    let res: Response
    try {
      res = await fetch(currentUrl, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          // ブロックされにくい程度にブラウザっぽいUAを付与
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
          accept: 'text/html,application/xhtml+xml',
        },
      })
    } catch {
      clearTimeout(timer)
      return null // タイムアウト・接続エラー等
    }

    // リダイレクトは Location を再検証してから次ホップへ
    if (res.status >= 300 && res.status < 400) {
      clearTimeout(timer)
      await res.body?.cancel()
      const location = res.headers.get('location')
      if (!location) return null
      try {
        currentUrl = new URL(location, currentUrl).toString()
      } catch {
        return null
      }
      continue // 次ループ冒頭で isSafeFetchTarget により再検証される
    }

    if (!res.ok) {
      clearTimeout(timer)
      await res.body?.cancel()
      return null
    }

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      // HTML以外は対象外
      clearTimeout(timer)
      await res.body?.cancel()
      return null
    }

    try {
      const html = await readLimited(res, MAX_BYTES)
      return { finalUrl: currentUrl, html }
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }
  return null // リダイレクト上限超過
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

