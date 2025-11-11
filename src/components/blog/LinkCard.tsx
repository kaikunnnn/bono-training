/**
 * BONO Blog - Link Card Component
 *
 * リンクカード（Bookmark Card）コンポーネント
 * Ghost CMS の Bookmark カードデータを表示
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';

export interface LinkCardProps {
  /** リンク先URL */
  href: string;
  /** タイトル */
  title: string;
  /** 説明文 */
  description?: string;
  /** サムネイル画像URL */
  thumbnail?: string;
  /** サイトアイコンURL */
  icon?: string;
  /** サイト名または著者名 */
  publisher?: string;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * LinkCard Component
 *
 * OGPデータを取得してカード形式で表示するコンポーネント。
 * Inkdrop風のモダンでシンプルなデザイン。
 *
 * @example
 * ```tsx
 * <LinkCard
 *   href="https://www.inkdrop.app/"
 *   title="Inkdrop - Note-taking App"
 *   description="The Note-Taking App with Robust Markdown Editor"
 *   thumbnail="https://www.inkdrop.app/og-image.png"
 *   icon="https://www.inkdrop.app/favicon.ico"
 *   publisher="inkdrop.app"
 * />
 * ```
 */
export const LinkCard: React.FC<LinkCardProps> = ({
  href,
  title,
  description,
  thumbnail,
  icon,
  publisher,
  className = '',
}) => {
  return (
    <figure className={`kg-card kg-bookmark-card ${className}`}>
      <a
        className="kg-bookmark-container"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* コンテンツセクション */}
        <div className="kg-bookmark-content">
          {/* タイトル */}
          <div className="kg-bookmark-title">{title}</div>

          {/* 説明文 */}
          {description && (
            <div className="kg-bookmark-description">{description}</div>
          )}

          {/* メタ情報 */}
          <div className="kg-bookmark-metadata">
            {icon && (
              <img
                className="kg-bookmark-icon"
                src={icon}
                alt="Site icon"
                onError={(e) => {
                  // アイコン読み込み失敗時は非表示
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {publisher && (
              <span className="kg-bookmark-publisher">{publisher}</span>
            )}
            <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
          </div>
        </div>

        {/* サムネイルセクション */}
        {thumbnail && (
          <div className="kg-bookmark-thumbnail">
            <img
              src={thumbnail}
              alt={title}
              onError={(e) => {
                // サムネイル読み込み失敗時は親要素を非表示
                e.currentTarget.parentElement!.style.display = 'none';
              }}
            />
          </div>
        )}
      </a>
    </figure>
  );
};

/**
 * Ghost HTMLからBookmarkカードデータを抽出する関数
 *
 * @param html - Ghost CMSから取得したHTML
 * @returns Bookmark カードデータの配列
 */
export const extractBookmarkCards = (html: string): LinkCardProps[] => {
  if (!html) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const bookmarkCards = doc.querySelectorAll('.kg-bookmark-card');

  return Array.from(bookmarkCards).map((card) => {
    const container = card.querySelector('.kg-bookmark-container') as HTMLAnchorElement;
    const title = card.querySelector('.kg-bookmark-title')?.textContent || '';
    const description = card.querySelector('.kg-bookmark-description')?.textContent || '';
    const thumbnail = (card.querySelector('.kg-bookmark-thumbnail img') as HTMLImageElement)?.src;
    const icon = (card.querySelector('.kg-bookmark-icon') as HTMLImageElement)?.src;
    const publisher =
      card.querySelector('.kg-bookmark-publisher')?.textContent ||
      card.querySelector('.kg-bookmark-author')?.textContent ||
      '';

    return {
      href: container?.href || '',
      title,
      description,
      thumbnail,
      icon,
      publisher,
    };
  });
};

export default LinkCard;
