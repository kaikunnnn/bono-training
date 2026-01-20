/**
 * BONO Blog - Header Component
 *
 * ダンシング・マージン | BONOブログ のヘッダー
 *
 * @component BlogHeader
 * @description ブログページ専用のヘッダー。タイトルとBONOロゴを表示し、本サイトへのリンクを提供。
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'iconsax-react';

// BONOロゴSVGのパス
const BONO_LOGO = '/assets/blog/d6495cc76015bd725cb662d469f2c31129d53e32.svg';
const BONO_MAIN_SITE = 'https://bo-no.design';

interface BlogHeaderProps {
  /** 追加のカスタムクラス名 */
  className?: string;
}

/**
 * BlogHeader Component
 *
 * ブログページのヘッダー。C2パターン: Zen Maru Gothic + 通常カラー
 *
 * 仕様:
 * - 左側: タイトル「ダンシング・マージン」+ 区切り「|」+ BONOロゴ + ブログ
 * - 右側: BONOへ（外部リンク）
 * - フォント: Zen Maru Gothic
 * - 背景: 白、下線あり
 *
 * @example
 * ```tsx
 * <BlogHeader />
 * ```
 */
export const BlogHeader: React.FC<BlogHeaderProps> = ({ className = '' }) => {
  return (
    <header
      className={`w-full px-3 py-3 ${className}`}
      role="banner"
      aria-label="サイトヘッダー"
    >
      {/* Google Fonts読み込み */}
      <link
        href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      <div className="w-full mx-auto flex items-center justify-between">
        {/* 左側: タイトル + 区切り + サブタイトル */}
        <Link to="/blog" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
          <h1
            className="text-lg font-semibold tracking-[-1px] text-gray-900"
            style={{ fontFamily: '"Zen Maru Gothic", sans-serif' }}
          >
            ダンシング・マージン
          </h1>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-[3px] mt-[2px]">
            <img src={BONO_LOGO} alt="BONO" className="w-[48px] h-[14px]" />
            <span className="text-xs text-gray-600 font-semibold leading-3">ブログ</span>
          </div>
        </Link>

        {/* 右側: 本サイトリンク */}
        <a
          href={BONO_MAIN_SITE}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>BONOへ</span>
          <span className="[&_path]:[stroke-width:2.5] rotate-45">
            <ArrowUp size={14} />
          </span>
        </a>
      </div>
    </header>
  );
};

export default BlogHeader;
