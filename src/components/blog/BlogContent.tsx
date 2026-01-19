/**
 * BONO Blog - Blog Content Component
 *
 * Ghost CMSから取得したHTMLコンテンツを表示するコンポーネント
 * Bookmark カード（リンクカード）を自動的に検出してReactコンポーネント化
 */

import React, { useEffect, useMemo, useState } from 'react';
import { LinkCard } from './LinkCard';
import { fetchOgpForUrl } from '@/services/ogp';

interface BlogContentProps {
  /** Ghost CMSから取得したHTML */
  html: string;
  /** カスタムクラス名 */
  className?: string;
}

type Embed =
  | { kind: 'bookmark'; card: { href: string; title: string; description?: string; thumbnail?: string; icon?: string; publisher?: string } }
  | { kind: 'ogp'; url: string };

function getImgSrcFromAttribute(el: Element | null): string | undefined {
  if (!el) return undefined;
  const raw = el.getAttribute('src')?.trim();
  if (!raw) return undefined;
  if (raw.startsWith('about:')) return undefined;
  return raw;
}

function extractBookmarkCardFromElement(card: Element): {
  href: string;
  title: string;
  description?: string;
  thumbnail?: string;
  icon?: string;
  publisher?: string;
} {
  const container = card.querySelector('.kg-bookmark-container');
  const title = card.querySelector('.kg-bookmark-title')?.textContent || '';
  const description = card.querySelector('.kg-bookmark-description')?.textContent || undefined;
  const thumbnail = getImgSrcFromAttribute(card.querySelector('.kg-bookmark-thumbnail img'));
  const icon = getImgSrcFromAttribute(card.querySelector('.kg-bookmark-icon'));
  const publisher =
    card.querySelector('.kg-bookmark-publisher')?.textContent ||
    card.querySelector('.kg-bookmark-author')?.textContent ||
    undefined;

  return {
    href: container?.getAttribute('href')?.trim() || '',
    title,
    description,
    thumbnail,
    icon,
    publisher,
  };
}

function isProbablyUrl(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (!/^https?:\/\/\S+$/i.test(t)) return false;
  try {
    const u = new URL(t);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function getStandaloneUrlFromParagraph(p: Element): string | null {
  // <p><a href="...">...</a></p> あるいは <p>https://...</p> を対象にする
  const text = (p.textContent ?? '').trim();

  // 1) anchorのみ
  const onlyOneChild = p.childNodes.length === 1 && p.firstChild?.nodeName?.toLowerCase() === 'a';
  if (onlyOneChild) {
    const a = p.querySelector('a');
    const href = a?.getAttribute('href')?.trim() ?? '';
    if (href && isProbablyUrl(href)) return href;
  }

  // 2) テキストがURLだけ
  if (isProbablyUrl(text)) return text;

  return null;
}

/**
 * BlogContent Component
 *
 * Ghost CMSのHTMLコンテンツを表示するコンポーネント。
 * Bookmark カードを自動検出してReactコンポーネントとして表示します。
 *
 * @example
 * ```tsx
 * <BlogContent html={post.content} className="prose" />
 * ```
 */
export const BlogContent: React.FC<BlogContentProps> = ({ html, className = '' }) => {
  // 埋め込み（Bookmarkカード + URL単体のOGP）を除去したHTMLと、埋め込み配列
  const { contentWithoutEmbeds, embeds } = useMemo(() => {
    if (!html) return { contentWithoutEmbeds: '', embeds: [] as Embed[] };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const nextEmbeds: Embed[] = [];

    // 対象ノードを集めて、DOM順で一括処理する（BookmarkとOGPの順序ズレ防止）
    const bookmarkEls = Array.from(doc.querySelectorAll('.kg-bookmark-card'));
    const urlParagraphEls = Array.from(doc.querySelectorAll('p')).filter((p) => !!getStandaloneUrlFromParagraph(p));

    const candidates: Element[] = [...bookmarkEls, ...urlParagraphEls];
    candidates.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    for (const el of candidates) {
      // 既にDOMから外れている場合（先に置換された等）はスキップ
      if (!el.isConnected) continue;

      if (el.classList.contains('kg-bookmark-card')) {
        const card = extractBookmarkCardFromElement(el);
        if (card.href && card.title) {
          nextEmbeds.push({ kind: 'bookmark', card });
          const marker = doc.createElement('div');
          marker.setAttribute('data-embed-placeholder', 'true');
          el.replaceWith(marker);
        }
        continue;
      }

      if (el.tagName.toLowerCase() === 'p') {
        const url = getStandaloneUrlFromParagraph(el);
        if (url) {
          nextEmbeds.push({ kind: 'ogp', url });
          const marker = doc.createElement('div');
          marker.setAttribute('data-embed-placeholder', 'true');
          el.replaceWith(marker);
        }
      }
    }

    return { contentWithoutEmbeds: doc.body.innerHTML, embeds: nextEmbeds };
  }, [html]);

  const [ogpMap, setOgpMap] = useState<Record<string, { title?: string; description?: string; image?: string; icon?: string; siteName?: string }>>({});

  useEffect(() => {
    const urls = embeds
      .filter((e): e is { kind: 'ogp'; url: string } => e.kind === 'ogp')
      .map((e) => e.url);

    const unique = Array.from(new Set(urls));
    const missing = unique.filter((u) => !ogpMap[u]);
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        missing.map(async (u) => {
          try {
            const data = await fetchOgpForUrl(u);
            return [u, data] as const;
          } catch {
            return [u, null] as const;
          }
        })
      );

      if (cancelled) return;
      setOgpMap((prev) => {
        const next = { ...prev };
        for (const [u, data] of results) {
          if (!data) continue;
          next[u] = data;
        }
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [embeds, ogpMap]);

  // HTMLを分割してBookmarkカードを挿入
  const renderContent = useMemo(() => {
    if (embeds.length === 0) {
      // Bookmark カードがない場合はそのまま表示
      return (
        <div
          className={className}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // HTMLをプレースホルダーで分割
    const parts = contentWithoutEmbeds.split(/<div data-embed-placeholder="true"><\/div>/);
    const elements: React.ReactNode[] = [];

    parts.forEach((part, index) => {
      // HTML部分
      if (part.trim()) {
        elements.push(
          <div
            key={`html-${index}`}
            dangerouslySetInnerHTML={{ __html: part }}
          />
        );
      }

      if (index < embeds.length) {
        const embed = embeds[index];
        if (embed.kind === 'bookmark') {
          const card = embed.card;
          elements.push(
            <LinkCard
              key={`bookmark-${index}`}
              href={card.href}
              title={card.title}
              description={card.description}
              thumbnail={card.thumbnail}
              icon={card.icon}
              publisher={card.publisher}
            />
          );
        } else {
          const url = embed.url;
          const ogp = ogpMap[url];
          const host = (() => {
            try {
              return new URL(url).hostname;
            } catch {
              return url;
            }
          })();

          elements.push(
            <LinkCard
              key={`ogp-${index}`}
              href={url}
              title={ogp?.title || host}
              description={ogp?.description}
              thumbnail={ogp?.image}
              icon={ogp?.icon}
              publisher={ogp?.siteName || host}
            />
          );
        }
      }
    });

    return <div className={className}>{elements}</div>;
  }, [html, contentWithoutEmbeds, embeds, className, ogpMap]);

  return <>{renderContent}</>;
};

export default BlogContent;
