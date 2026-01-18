import { useEffect, useMemo, useState } from 'react'
import type { PortableTextBlock } from '@portabletext/types'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { LinkCard } from '@/components/blog/LinkCard'
import { fetchOgpForUrl, type OgpData } from '@/services/ogp'

type BlogPortableTextImageValue = {
  asset?: { url?: string }
  alt?: string
  caption?: string
}

function isProbablyUrl(text: string): boolean {
  const t = text.trim()
  if (!t) return false
  if (!/^https?:\/\/\S+$/i.test(t)) return false
  try {
    const u = new URL(t)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function plainTextFromBlock(block: PortableTextBlock): string {
  const children = (block.children ?? []) as Array<{ _type?: string; text?: string }>
  return children.map((c) => c.text ?? '').join('')
}

export function BlogRichText({
  content,
  className = '',
}: {
  content: PortableTextBlock[]
  className?: string
}) {
  const standaloneUrls = useMemo(() => {
    const urls: string[] = []
    for (const b of content) {
      if ((b as any)?._type !== 'block') continue
      if ((b as any)?.style && (b as any).style !== 'normal') continue
      const text = plainTextFromBlock(b).trim()
      if (isProbablyUrl(text)) urls.push(text)
    }
    return Array.from(new Set(urls))
  }, [content])

  const [ogpMap, setOgpMap] = useState<Record<string, OgpData>>({})

  useEffect(() => {
    const missing = standaloneUrls.filter((u) => !ogpMap[u])
    if (missing.length === 0) return

    let cancelled = false
    ;(async () => {
      const results = await Promise.all(
        missing.map(async (u) => {
          try {
            const data = await fetchOgpForUrl(u)
            return [u, data] as const
          } catch {
            return [u, null] as const
          }
        })
      )

      if (cancelled) return
      setOgpMap((prev) => {
        const next = { ...prev }
        for (const [u, data] of results) {
          if (!data) continue
          next[u] = data
        }
        return next
      })
    })()

    return () => {
      cancelled = true
    }
  }, [standaloneUrls, ogpMap])

  const components: PortableTextComponents = useMemo(
    () => ({
      block: {
        h2: ({ children }) => <h2>{children}</h2>,
        h3: ({ children }) => <h3>{children}</h3>,
        h4: ({ children }) => <h4>{children}</h4>,
        blockquote: ({ children }) => <blockquote>{children}</blockquote>,
        normal: ({ value, children }) => {
          const text = plainTextFromBlock(value as PortableTextBlock).trim()
          if (isProbablyUrl(text)) {
            const url = text
            const ogp = ogpMap[url]
            const host = (() => {
              try {
                return new URL(url).hostname
              } catch {
                return url
              }
            })()
            return (
              <LinkCard
                href={url}
                title={ogp?.title || host}
                description={ogp?.description}
                thumbnail={ogp?.image}
                icon={ogp?.icon}
                publisher={ogp?.siteName || host}
              />
            )
          }
          return <p>{children}</p>
        },
      },
      list: {
        bullet: ({ children }) => <ul>{children}</ul>,
        number: ({ children }) => <ol>{children}</ol>,
      },
      listItem: {
        bullet: ({ children }) => <li>{children}</li>,
        number: ({ children }) => <li>{children}</li>,
      },
      marks: {
        link: ({ children, value }) => {
          const href = (value as any)?.href
          return (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          )
        },
      },
      types: {
        image: ({ value }) => {
          const v = value as unknown as BlogPortableTextImageValue
          const url = v.asset?.url
          if (!url) return null
          const alt = v.alt || ''
          const caption = v.caption

          if (caption) {
            return (
              <figure>
                <img src={url} alt={alt} loading="lazy" />
                <figcaption>{caption}</figcaption>
              </figure>
            )
          }

          return <img src={url} alt={alt} loading="lazy" />
        },
      },
    }),
    [ogpMap]
  )

  return (
    <div className={className}>
      <PortableText value={content} components={components} />
    </div>
  )
}

