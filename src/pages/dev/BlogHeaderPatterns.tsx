/**
 * ブログヘッダーデザインパターン比較ページ
 *
 * パターンCベースのバリエーション比較
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Share2, ArrowRight, ChevronRight } from '@/lib/icons';
import { Export, Send2, ArrowUp } from 'iconsax-react';

// BONOロゴSVGのパス
const BONO_LOGO = '/assets/blog/d6495cc76015bd725cb662d469f2c31129d53e32.svg';
const BONO_MAIN_SITE = 'https://bo-no.design';

/**
 * パターンC1: Kiwi Maru + 通常カラー
 */
const HeaderPatternC1: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-3">
      <div className="w-full mx-auto flex items-center justify-between">
        {/* 左側: タイトル + 区切り + サブタイトル */}
        <Link to="/blog" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
          <h1
            className="text-lg font-semibold tracking-[-1px] text-gray-900"
            style={{ fontFamily: '"Kiwi Maru", serif' }}
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

/**
 * パターンC2: Zen Maru Gothic + 通常カラー
 */
const HeaderPatternC2: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-3">
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

/**
 * パターンC3: Kiwi Maru + BONOブログ薄めカラー
 */
const HeaderPatternC3: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-3">
      <div className="w-full mx-auto flex items-center justify-between">
        {/* 左側: タイトル + 区切り + サブタイトル */}
        <Link to="/blog" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
          <h1
            className="text-lg font-semibold tracking-[-1px] text-gray-900"
            style={{ fontFamily: '"Kiwi Maru", serif' }}
          >
            ダンシング・マージン
          </h1>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-[3px] mt-[2px] opacity-50">
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

/**
 * パターンC4: Zen Maru Gothic + BONOブログ薄めカラー
 */
const HeaderPatternC4: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-3">
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
          <div className="flex items-center gap-[3px] mt-[2px] opacity-50">
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

/**
 * メインページ: Cパターンのバリエーション比較
 */
const BlogHeaderPatterns: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Google Fonts読み込み */}
      <link
        href="https://fonts.googleapis.com/css2?family=Kiwi+Maru:wght@400;500&family=Zen+Maru+Gothic:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Link to="/dev" className="text-blue-600 hover:underline text-sm">← Dev Home</Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">ブログヘッダー パターンC バリエーション</h1>
          <p className="text-gray-600">1行コンパクトスタイルのバリエーション比較</p>
        </div>

        {/* パターンC1 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-sm">C1</span>
            Kiwi Maru + 通常カラー
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <HeaderPatternC1 />
            <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-gray-400 text-sm">
              コンテンツエリア
            </div>
          </div>
        </section>

        {/* パターンC2 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="bg-green-600 text-white px-2 py-0.5 rounded text-sm">C2</span>
            Zen Maru Gothic + 通常カラー
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <HeaderPatternC2 />
            <div className="h-32 bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center text-gray-400 text-sm">
              コンテンツエリア
            </div>
          </div>
        </section>

        {/* パターンC3 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-sm">C3</span>
            Kiwi Maru + BONOブログ薄め（opacity-50）
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <HeaderPatternC3 />
            <div className="h-32 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-gray-400 text-sm">
              コンテンツエリア
            </div>
          </div>
        </section>

        {/* パターンC4 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="bg-orange-600 text-white px-2 py-0.5 rounded text-sm">C4</span>
            Zen Maru Gothic + BONOブログ薄め（opacity-50）
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <HeaderPatternC4 />
            <div className="h-32 bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center text-gray-400 text-sm">
              コンテンツエリア
            </div>
          </div>
        </section>

        {/* フォント比較 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3">フォント比較</h2>
          <div className="grid gap-3">
            {[
              { name: 'Kiwi Maru', family: '"Kiwi Maru", serif', desc: '丸み・ソフト' },
              { name: 'Zen Maru Gothic', family: '"Zen Maru Gothic", sans-serif', desc: '丸ゴシック・柔らかい' },
            ].map((font) => (
              <div key={font.name} className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500 mb-1">{font.name} - {font.desc}</p>
                <p className="text-2xl" style={{ fontFamily: font.family }}>
                  ダンシング・マージン
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* アイコン比較 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3">「BONOへ」アイコン比較</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'ExternalLink', icon: <ExternalLink size={14} />, desc: '外部リンク' },
              { name: 'Export', icon: <Export size={14} />, desc: '右斜め上矢印' },
              { name: 'Share2', icon: <Share2 size={14} />, desc: 'エクスポート曲線' },
              { name: 'Send2', icon: <Send2 size={14} />, desc: '送信' },
              { name: 'ArrowRight', icon: <ArrowRight size={14} />, desc: '右矢印' },
              { name: 'ArrowUp (通常)', icon: <span className="rotate-45"><ArrowUp size={14} /></span>, desc: '上矢印45度回転' },
              { name: 'ArrowUp (太)', icon: <span className="[&_path]:[stroke-width:2.5] rotate-45"><ArrowUp size={14} /></span>, desc: '上矢印45度・太め ★採用' },
              { name: 'ChevronRight', icon: <ChevronRight size={14} />, desc: 'シェブロン' },
            ].map((item) => (
              <div key={item.name} className="bg-white rounded-lg p-4 shadow">
                <p className="text-xs text-gray-500 mb-2">{item.name}</p>
                <a
                  href={BONO_MAIN_SITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>BONOへ</span>
                  {item.icon}
                </a>
                <p className="text-xs text-gray-400 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default BlogHeaderPatterns;
