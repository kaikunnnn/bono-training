/**
 * BONO Blog - Blog Content Component
 *
 * Ghost CMSから取得したHTMLコンテンツを表示するコンポーネント
 * Bookmark カード（リンクカード）を自動的に検出してReactコンポーネント化
 */

import React, { useMemo } from 'react';
import { LinkCard, extractBookmarkCards } from './LinkCard';

interface BlogContentProps {
  /** Ghost CMSから取得したHTML */
  html: string;
  /** カスタムクラス名 */
  className?: string;
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
  // Bookmark カードデータを抽出
  const bookmarkCards = useMemo(() => extractBookmarkCards(html), [html]);

  // Bookmark カードを除去したHTML
  const contentWithoutBookmarks = useMemo(() => {
    if (!html) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // すべての .kg-bookmark-card を除去
    const bookmarks = doc.querySelectorAll('.kg-bookmark-card');
    bookmarks.forEach((bookmark) => {
      // 置き換えマーカーを挿入
      const marker = doc.createElement('div');
      marker.setAttribute('data-bookmark-placeholder', 'true');
      bookmark.replaceWith(marker);
    });

    return doc.body.innerHTML;
  }, [html]);

  // HTMLを分割してBookmarkカードを挿入
  const renderContent = useMemo(() => {
    if (bookmarkCards.length === 0) {
      // Bookmark カードがない場合はそのまま表示
      return (
        <div
          className={className}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // HTMLをプレースホルダーで分割
    const parts = contentWithoutBookmarks.split(/<div data-bookmark-placeholder="true"><\/div>/);
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

      // Bookmark カード
      if (index < bookmarkCards.length) {
        const card = bookmarkCards[index];
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
      }
    });

    return <div className={className}>{elements}</div>;
  }, [html, contentWithoutBookmarks, bookmarkCards, className]);

  return <>{renderContent}</>;
};

export default BlogContent;
