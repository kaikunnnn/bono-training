/**
 * BONO Blog - Hero Section Component
 *
 * 99frontend 仕様に基づくヒーローセクションコンポーネント
 * 参照: .claude/docs/blog/99frontend/herosection.md
 *
 * @component HeroSection
 * @description ブログページのヒーローセクション。HOPEロゴ（SVG）とサブタイトルを表示します。
 */

import React from 'react';

// HOPEロゴSVGのパス
const imgHopeLogo = '/assets/blog/bbde0d9860756a76727bcbe17eabccd0d60e09f6.svg';

interface HeroSectionProps {
  /** サブタイトル（デフォルト: "BONOをつくる30代在宅独身男性のクラフト日誌"） */
  subtitle?: string;
  /** 追加のカスタムクラス名 */
  className?: string;
}

/**
 * HeroSection Component
 *
 * 99frontend仕様に完全準拠したヒーローセクション。
 *
 * 仕様:
 * - サイズ: 1920×461px
 * - 背景: なし（グラデーション背景の上に直接表示）
 * - HOPEロゴ: SVG (344×89px)
 * - パディング: 外側上80px、内側上96px、下144px
 * - ギャップ: 32px
 * - サブタイトル: 14px Medium, Noto Sans JP, #9CA3AF, 文字間隔0.7px
 *
 * @example
 * ```tsx
 * <HeroSection />
 * <HeroSection subtitle="カスタムサブタイトル" />
 * ```
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  subtitle = 'BONOをつくる30代在宅独身男性のクラフト日誌',
  className = '',
}) => {
  return (
    <section
      className={`box-border content-stretch flex items-start justify-center pb-0 pt-[80px] px-0 w-full max-w-[1920px] mx-auto ${className}`}
      style={{ height: '461px' }}
      data-name="herosection"
      data-node-id="21:119"
      role="banner"
      aria-label="Hero Section"
    >
      <div className="basis-0 box-border content-stretch flex flex-col gap-[32px] grow items-center justify-center min-h-px min-w-px pb-[144px] pt-[96px] px-0 relative self-stretch shrink-0">
        {/* HOPE. ロゴ */}
        <div className="h-[89px] relative shrink-0 w-[344px]">
          <img
            alt="HOPE. - BONOブログのメインタイトル"
            className="block max-w-none size-full"
            src={imgHopeLogo}
          />
        </div>

        {/* サブタイトル */}
        <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
          <div className="flex flex-col font-['Noto_Sans_JP'] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[#9ca3af] text-center text-nowrap tracking-[0.7px]">
            <p className="leading-[20px] whitespace-pre">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* レスポンシブ用のスタイル */}
      <style>{`
        @media (max-width: 768px) {
          section[data-name="herosection"] {
            padding-top: 60px !important;
            height: 400px !important;
          }

          section[data-name="herosection"] > div {
            padding-top: 80px !important;
            padding-bottom: 120px !important;
            gap: 24px !important;
          }

          section[data-name="herosection"] .h-\\[89px\\] {
            height: 72px !important;
            width: 280px !important;
          }

          section[data-name="herosection"] .text-\\[14px\\] {
            font-size: 13px !important;
          }
        }

        @media (max-width: 375px) {
          section[data-name="herosection"] {
            padding-top: 48px !important;
            height: 320px !important;
          }

          section[data-name="herosection"] > div {
            padding-top: 60px !important;
            padding-bottom: 80px !important;
            gap: 16px !important;
          }

          section[data-name="herosection"] .h-\\[89px\\] {
            height: 52px !important;
            width: 200px !important;
          }

          section[data-name="herosection"] .text-\\[14px\\] {
            font-size: 12px !important;
          }

          section[data-name="herosection"] .text-nowrap {
            white-space: normal !important;
          }
        }
      `}</style>
    </section>
  );
};

/**
 * HeroSectionTailwind Component (Tailwindベースの実装)
 *
 * Tailwind CSSクラスを使用した実装。
 * デザイントークンよりもTailwindを優先する場合に使用。
 *
 * @example
 * ```tsx
 * <HeroSectionTailwind />
 * ```
 */
export const HeroSectionTailwind: React.FC<HeroSectionProps> = ({
  title = 'HOPE.',
  subtitle = 'BONOをつくる30代在宅独身男性のクラフト日誌',
  className = '',
}) => {
  return (
    <section
      className={`w-full h-[381px] md:h-[340px] sm:h-[280px] bg-[#E8E6EA] flex flex-col items-center justify-center pt-4 pb-[164px] md:pb-[100px] sm:pb-[80px] ${className}`}
      role="banner"
      aria-label="Hero Section"
    >
      {/* タイトル */}
      <div className="flex items-center justify-center w-[344px] h-[89px] mb-8 md:mb-6 sm:mb-4">
        <h1 className="font-noto text-[96px] md:text-[56px] sm:text-[48px] font-bold text-[#151834] text-center leading-[1.1] tracking-[-0.02em] m-0">
          {title}
        </h1>
      </div>

      {/* サブタイトル */}
      <div className="w-full flex justify-center items-center">
        <p className="font-noto text-[14px] md:text-[13px] sm:text-[12px] font-medium text-[#9CA3AF] text-center leading-5 tracking-[0.7px] w-[325px] md:w-[280px] h-5 md:h-auto m-0">
          {subtitle}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
