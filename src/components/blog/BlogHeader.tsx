/**
 * BONO Blog - Header Component
 *
 * 99frontend 仕様に基づくヘッダーコンポーネント
 * 参照: .claude/docs/blog/99frontend/navigation-blog.md
 *
 * @component BlogHeader
 * @description ブログページ専用のヘッダー。BONOロゴSVGを表示し、ホームページへのリンクを提供します。
 */

import React from 'react';
import { Link } from 'react-router-dom';

// BONOロゴSVGのパス
const imgLogoSvg = '/assets/blog/d6495cc76015bd725cb662d469f2c31129d53e32.svg';

interface BlogHeaderProps {
  /** 追加のカスタムクラス名 */
  className?: string;
}

/**
 * BlogHeader Component
 *
 * ブログページのヘッダー。99frontend仕様に完全準拠した実装。
 *
 * 仕様:
 * - サイズ: 1920×74.07px
 * - パディング: 24px (デスクトップ/タブレット), 16px (モバイル)
 * - 背景: 透明（グラデーション上に直接表示）
 * - レイアウト: flex, justify-between
 * - BONOロゴ: SVG 88×26.074px、色#151834
 * - 右側スペース: 112px（将来の拡張用）
 *
 * @example
 * ```tsx
 * <BlogHeader />
 * ```
 */
export const BlogHeader: React.FC<BlogHeaderProps> = ({ className = '' }) => {
  return (
    <header
      className={`box-border content-stretch flex items-center justify-between p-6 relative w-full ${className}`}
      style={{
        height: '74.07px',
      }}
      data-name="header"
      data-node-id="3:207"
      role="banner"
      aria-label="サイトヘッダー"
    >
      {/* 左側: ロゴ */}
      <div
        className="content-stretch flex flex-col items-start relative shrink-0 w-[112px]"
        data-name="left"
        data-node-id="3:208"
      >
        <Link
          to="/"
          className="content-stretch flex items-start relative shrink-0 w-full no-underline transition-opacity duration-200 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#151834] focus-visible:outline-offset-2 rounded"
          aria-label="BONO ホームページへ"
          data-name="Link"
          data-node-id="3:209"
        >
          <div
            className="content-stretch flex flex-col items-start max-w-[112px] overflow-clip relative shrink-0 w-[88px]"
            data-name="BONO"
            data-node-id="3:210"
          >
            <div
              className="content-stretch flex flex-col h-[26.07px] items-center justify-center overflow-clip relative shrink-0 w-[88px]"
              data-name="logo.svg fill"
              data-node-id="3:211"
            >
              <div
                className="h-[26.074px] opacity-100 relative shrink-0 w-[88px]"
                data-name="logo.svg"
                data-node-id="3:212"
              >
                <img
                  alt="BONO"
                  className="block max-w-none size-full"
                  src={imgLogoSvg}
                />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* 右側: 将来の拡張用スペース */}
      <div
        className="h-[26.07px] shrink-0 w-[112px]"
        data-name="right"
        data-node-id="27:139"
      />

      {/* レスポンシブ用のスタイル */}
      <style>{`
        @media (max-width: 375px) {
          header[data-name="header"] {
            padding: 16px !important;
          }
        }
      `}</style>
    </header>
  );
};

/**
 * BlogHeaderWithNav Component (拡張版)
 *
 * ナビゲーションリンクを含むヘッダーバージョン。
 * 将来的にメニューが必要な場合に使用。
 *
 * @example
 * ```tsx
 * <BlogHeaderWithNav />
 * ```
 */
export const BlogHeaderWithNav: React.FC<BlogHeaderProps> = ({
  className = '',
}) => {
  return (
    <header
      className={`w-full bg-white shadow-md sticky top-0 z-[100] ${className}`}
      style={{
        height: BLOG_SPACING.header.height,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
      role="banner"
    >
      <div
        className="flex items-center justify-between h-full px-6 md:px-4 lg:px-6"
        style={{
          paddingLeft: BLOG_SPACING.header.padding,
          paddingRight: BLOG_SPACING.header.padding,
        }}
      >
        {/* ロゴ */}
        <Link
          to="/"
          aria-label="BONO Home"
          className="flex items-center transition-opacity duration-300 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#151834] focus-visible:outline-offset-2"
          style={{
            width: BLOG_SPACING.header.logoWidth,
            height: BLOG_SPACING.header.logoHeight,
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: BLOG_SPACING.header.logoImageWidth,
              height: BLOG_SPACING.header.logoImageHeight,
            }}
          >
            <span
              className="font-noto font-bold text-[#151834]"
              style={{
                fontSize: '20px',
                letterSpacing: '0.05em',
              }}
            >
              BONO
            </span>
          </div>
        </Link>

        {/* ナビゲーション（オプション） */}
        <nav className="hidden md:flex items-center gap-8" role="navigation">
          <Link
            to="/blog"
            className="font-hind text-sm font-medium text-[#9CA3AF] hover:text-[#0F172A] transition-colors duration-200"
          >
            Blog
          </Link>
          <Link
            to="/training"
            className="font-hind text-sm font-medium text-[#9CA3AF] hover:text-[#0F172A] transition-colors duration-200"
          >
            Training
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default BlogHeader;
