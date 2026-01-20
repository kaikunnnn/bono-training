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
          <span className="relative group">
            <h1
              className="text-[15px] font-semibold tracking-[-1px] text-gray-900"
              style={{ fontFamily: '"Zen Maru Gothic", sans-serif' }}
              title="狂った世で踊れ!"
            >
              ダンシング・マージン
            </h1>

            {/* hover/focus 時のフキダシ */}
            <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 translate-y-1 opacity-0 scale-[0.98] transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:translate-y-0">
              <span className="relative block whitespace-nowrap rounded-xl bg-white px-3 py-2 text-[12px] font-semibold text-gray-900 shadow-lg ring-1 ring-black/10">
                狂った世で踊れ!
                {/* 矢印（ひし形に見えないよう三角形で描画） */}
                <span className="absolute left-1/2 -top-[9px] -translate-x-1/2 h-0 w-0 border-x-[9px] border-x-transparent border-b-[9px] border-b-black/10" />
                <span className="absolute left-1/2 -top-[8px] -translate-x-1/2 h-0 w-0 border-x-[8px] border-x-transparent border-b-[8px] border-b-white" />
              </span>
            </span>
          </span>
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
