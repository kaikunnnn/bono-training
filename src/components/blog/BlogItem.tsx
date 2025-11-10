/**
 * BONO Blog - Blog Item Component
 *
 * 99frontend 仕様に基づくブログアイテム（カード）コンポーネント
 * 参照: .claude/docs/blog/99frontend/blogcard.md
 *
 * @component BlogItem
 * @description ブログ一覧で表示される記事カードコンポーネント
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '@/types/blog';
import { BLOG_COLORS, BLOG_FONTS, BLOG_SPACING } from '@/styles/design-tokens';

interface BlogItemProps {
  /** 表示する記事データ */
  post: BlogPost;
  /** 追加のカスタムクラス名 */
  className?: string;
}

/**
 * BlogItem Component
 *
 * ブログ記事のカード表示コンポーネント。99frontend仕様に完全準拠した実装。
 *
 * 仕様:
 * - カードサイズ: 1120px × 最小152px
 * - 角丸: 16px
 * - 影: 0px 1px 2px 0px rgba(0,0,0,0.05)
 * - パディング: 左12px、右24px、上下12px
 * - サムネイル: 240px × 135px (16:9)、背景色 #D8E7EF、角丸12px
 * - タイトル: Noto Sans JP, 16px, Bold, 行高24px, text-justify
 * - メタ情報: Hind, 12px, Medium, ギャップ12.01px
 *
 * @example
 * ```tsx
 * <BlogItem post={blogPost} />
 * ```
 */
export const BlogItem: React.FC<BlogItemProps> = ({ post, className = '' }) => {
  // 日付フォーマット: "2023年08月25日"
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`block no-underline blog-card-hover ${className}`}
      style={{
        width: BLOG_SPACING.card.width,
        maxWidth: '100%',
        minHeight: '152px',
        backgroundColor: BLOG_COLORS.white,
        borderRadius: '16px',
        boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        paddingLeft: '12px',
        paddingRight: '24px',
        paddingTop: '12px',
        paddingBottom: '12px',
      }}
      role="article"
      aria-label={`記事: ${post.title}`}
      data-name="Item-link"
      data-node-id="19:34"
    >
      {/* メインコンテナ */}
      <div
        className="flex items-center h-full"
        style={{
          gap: BLOG_SPACING.card.gap,
        }}
        data-name="Container"
        data-node-id="14:18"
      >
        {/* サムネイル */}
        <div
          className="flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{
            width: BLOG_SPACING.card.thumbnailWidth,
            height: BLOG_SPACING.card.thumbnailHeight,
            backgroundColor: '#D8E7EF',
            borderRadius: '12px',
            paddingTop: '40px',
            paddingBottom: '40px',
          }}
          data-name="thumbanil - 16:9"
          data-node-id="14:19"
        >
          {post.thumbnail || post.imageUrl ? (
            <img
              src={post.thumbnail || post.imageUrl}
              alt=""
              style={{
                width: BLOG_SPACING.card.emojiSize,
                height: BLOG_SPACING.card.emojiSize,
                objectFit: 'contain',
                maxWidth: '350.66px',
              }}
              loading="lazy"
              data-name="emoji Image"
              data-node-id="14:20"
            />
          ) : (
            <div
              style={{
                fontSize: BLOG_SPACING.card.emojiSize,
                lineHeight: 1,
              }}
              data-name="emoji Image"
              data-node-id="14:20"
            >
              📝
            </div>
          )}
        </div>

        {/* テキストエリア */}
        <div
          className="flex-1 flex flex-col justify-center"
          style={{
            gap: BLOG_SPACING.card.textGap,
            width: '701.34px',
          }}
          data-name="Container"
          data-node-id="14:21"
        >
          {/* タイトル */}
          <div
            className="w-full"
            data-name="Heading 4"
            data-node-id="14:22"
          >
            <h3
              className="m-0"
              style={{
                fontFamily: BLOG_FONTS.card.title.family,
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: '24px',
                color: BLOG_COLORS.darkBlue,
                textAlign: 'justify',
              }}
              data-node-id="14:23"
            >
              {post.title}
            </h3>
          </div>

          {/* メタ情報コンテナ */}
          <div
            className="flex items-center w-full"
            style={{
              gap: '12.01px',
            }}
            data-name="Container"
            data-node-id="14:24"
          >
            {/* カテゴリ */}
            <div
              data-name="category"
              data-node-id="14:25"
            >
              <span
                style={{
                  fontFamily: BLOG_FONTS.card.meta.family,
                  fontSize: BLOG_FONTS.card.meta.size,
                  fontWeight: BLOG_FONTS.card.meta.weight,
                  lineHeight: BLOG_FONTS.card.meta.lineHeight,
                  color: BLOG_COLORS.gray,
                  whiteSpace: 'pre',
                }}
                data-node-id="14:26"
              >
                {post.category.toUpperCase()}
              </span>
            </div>

            {/* 投稿日時 */}
            <div
              data-name="updated_date"
              data-node-id="14:27"
            >
              <time
                dateTime={post.publishedAt}
                style={{
                  fontFamily: BLOG_FONTS.card.meta.family,
                  fontSize: BLOG_FONTS.card.meta.size,
                  fontWeight: BLOG_FONTS.card.meta.weight,
                  lineHeight: BLOG_FONTS.card.meta.lineHeight,
                  color: BLOG_COLORS.gray,
                  whiteSpace: 'pre',
                }}
                data-node-id="14:28"
              >
                {formatDate(post.publishedAt)}
              </time>
            </div>
          </div>
        </div>
      </div>

      {/* レスポンシブ用のスタイル */}
      <style>{`
        @media (max-width: 768px) {
          a[role="article"] {
            width: calc(100% - 32px) !important;
            height: 140px !important;
          }

          a[role="article"] > div {
            gap: 12px !important;
          }

          a[role="article"] img,
          a[role="article"] > div > div:first-child {
            width: ${BLOG_SPACING.card.thumbnailWidthTablet} !important;
            height: ${BLOG_SPACING.card.thumbnailHeightTablet} !important;
          }

          a[role="article"] img {
            width: ${BLOG_SPACING.card.emojiSizeTablet} !important;
            height: ${BLOG_SPACING.card.emojiSizeTablet} !important;
          }

          a[role="article"] h3 {
            font-size: 16px !important;
            -webkit-line-clamp: 1 !important;
          }
        }

        @media (max-width: 375px) {
          a[role="article"] {
            width: calc(100% - 16px) !important;
            height: 120px !important;
          }

          a[role="article"] > div > div:first-child {
            width: ${BLOG_SPACING.card.thumbnailWidthMobile} !important;
            height: ${BLOG_SPACING.card.thumbnailHeightMobile} !important;
          }

          a[role="article"] img {
            width: ${BLOG_SPACING.card.emojiSizeMobile} !important;
            height: ${BLOG_SPACING.card.emojiSizeMobile} !important;
          }

          a[role="article"] h3 {
            font-size: 14px !important;
          }
        }
      `}</style>
    </Link>
  );
};

/**
 * BlogItemCompact Component (コンパクト版)
 *
 * より小さなスペースでの表示に適したコンパクト版。
 * サイドバーや関連記事セクションで使用。
 *
 * @example
 * ```tsx
 * <BlogItemCompact post={blogPost} />
 * ```
 */
export const BlogItemCompact: React.FC<BlogItemProps> = ({ post, className = '' }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`block no-underline blog-card-hover ${className}`}
      style={{
        width: '100%',
        backgroundColor: BLOG_COLORS.white,
        border: `1px solid ${BLOG_COLORS.border}`,
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
      }}
      role="article"
    >
      <div className="flex flex-col gap-2">
        <h4
          className="m-0 font-noto text-base font-bold text-[#0F172A] blog-text-truncate-2"
        >
          {post.title}
        </h4>
        <div className="flex items-center gap-2">
          <span className="font-hind text-xs font-medium text-[#9CA3AF]">
            {post.category.toUpperCase()}
          </span>
          <time
            dateTime={post.publishedAt}
            className="font-hind text-xs font-medium text-[#9CA3AF]"
          >
            {formatDate(post.publishedAt)}
          </time>
        </div>
      </div>
    </Link>
  );
};

export default BlogItem;
