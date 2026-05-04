"use client";

/**
 * ロードマップ詳細ページ - ヒーローセクション
 *
 * Figma: PRD🏠_Roadmap_2026 node-id 35-12022
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BackButton } from "@/components/common/BackButton";
import type { GradientPreset } from "@/types/sanity-roadmap";
import { getGradientStyle } from "@/types/sanity-roadmap";
import { formatTitleWithLineBreaks, stripLineBreakMarker } from "@/utils/textFormat";

// SVGマスクパス
const MASK_DESKTOP = "/shapes/roadmap-hero-shape-flexible.svg"; // 振幅2.1%
const MASK_MOBILE = "/shapes/roadmap-hero-mobile.svg"; // 振幅0.5% + 角丸強め
const MOBILE_BREAKPOINT = 640;

interface RoadmapHeroProps {
  /** ロードマップタイトル */
  title: string;
  /** 短縮タイトル（バッジ表示用） */
  shortTitle?: string;
  /** キャッチコピー */
  tagline?: string;
  /** ステップ数 */
  stepCount: number;
  /** 目安期間（例: "1-2"） */
  estimatedDuration: string;
  /** グラデーションプリセット */
  gradientPreset?: GradientPreset;
  /** ヒーロー用画像URL（優先） */
  heroImageUrl?: string;
  /** サムネイル画像URL（フォールバック） */
  thumbnailUrl?: string;
  /** ユーザーがプラン加入済みか */
  isSubscribed?: boolean;
}

const PrimaryCTAButton: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <Link
    href={href}
    className="w-full sm:flex-1 flex items-center justify-center h-12 bg-white border border-white/90 rounded-[14px] text-[14px] font-bold text-[#081c17] tracking-[0.35px] shadow-[0_4px_8px_rgba(0,0,0,0.25)] hover:bg-gray-50 transition-colors"
  >
    {children}
  </Link>
);

const SecondaryCTAButton: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="flex items-center justify-center w-full sm:w-[170px] h-12 rounded-[14px] text-[14px] font-bold text-white tracking-[0.35px] hover:bg-white/10 transition-colors"
      style={{
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,1)",
      }}
    >
      {children}
    </a>
  );
};

export default function RoadmapHero({
  title,
  shortTitle,
  tagline,
  stepCount,
  estimatedDuration,
  gradientPreset,
  heroImageUrl,
  thumbnailUrl,
  isSubscribed = false,
}: RoadmapHeroProps) {
  const gradientStyle = getGradientStyle(gradientPreset);

  // モバイル判定（リサイズ対応 + 初回マウント時にも確認）
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // マスクスタイル（モバイルとデスクトップで切り替え）
  const maskSvg = isMobile ? MASK_MOBILE : MASK_DESKTOP;
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: `url('${maskSvg}')`,
    maskImage: `url('${maskSvg}')`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  };

  return (
    // モバイルでは左右の余白を少しだけ（px-1）、上も0にして高さを稼ぐ
    // タブレット以上では従来どおり pt-4 px-4
    <section className="relative pt-0 px-1 sm:pt-4 sm:px-4">
      {/* 背景エリア - 有機的な形状（SVGマスク）、コンテンツに合わせて高さ可変 */}
      <motion.div
        className="relative"
        style={{
          filter: "drop-shadow(0px 12px 24px rgba(0,0,0,0.2))",
        }}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="relative overflow-hidden"
          style={{ ...gradientStyle, ...maskStyle }}
        >
        {/* 背景画像 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url('/images/roadmap/hero-bg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 1.0,
          }}
          aria-hidden="true"
        />

        {/* ノイズオーバーレイ */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url('/textures/noise.svg')`,
            backgroundRepeat: 'repeat',
            opacity: 1,
            mixBlendMode: 'overlay',
          }}
          aria-hidden="true"
        />

        {/* ナビゲーション */}
        <div className="relative flex items-center justify-between px-8 pt-10 pb-5">
          <div className="flex items-center gap-8">
            {/* 戻るボタン（共通コンポーネント） */}
            <BackButton href="/roadmap" />

            {/* パンくずリスト */}
            <nav className="text-[12px] font-bold text-white/60">
              <Link
                href="/roadmap"
                className="hover:text-white/80 transition-colors"
              >
                ロードマップ
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white/80">{stripLineBreakMarker(title)}</span>
            </nav>
          </div>
        </div>

        {/* タイトル周り（ゆっくりふわっと表示） */}
        <motion.div
          className="relative flex flex-col items-center gap-6 px-8 pt-4 pb-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        >
          {/* バッジ */}
          <div className="border border-white rounded-full px-4 py-1.5">
            <span className="text-[13px] text-white">{shortTitle || 'ロードマップ'}</span>
          </div>

          {/* タイトル（|マーカーで改行） */}
          <h1 className="text-[32px] md:text-[40px] font-bold text-white text-center leading-[1.6]">
            {formatTitleWithLineBreaks(title)}
          </h1>

          {/* サブタイトル（tagline） */}
          {tagline && (
            <p className="text-[16px] md:text-[18px] text-white/70 text-center leading-[1.6] max-w-[573px]">
              {tagline}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center">
            {/* ステップ数 */}
            <div className="flex flex-col items-center gap-0.5 px-8 border-r border-white/25">
              <span className="text-[12px] font-bold text-white/70">
                ステップ
              </span>
              <div className="flex items-end gap-1 text-white">
                <span className="text-[20px] font-bold font-['Inter',sans-serif] leading-none">
                  {stepCount}
                </span>
                <span className="text-[13px] leading-[1.5]">つ</span>
              </div>
            </div>

            {/* 目安期間 */}
            <div className="flex flex-col items-center gap-0.5 px-8">
              <span className="text-[12px] font-bold text-white/70">目安</span>
              <div className="flex items-end gap-1 text-white">
                <span className="text-[20px] font-bold font-['Inter',sans-serif] leading-none">
                  {estimatedDuration}
                </span>
                <span className="text-[13px] leading-[1.5]">ヶ月</span>
              </div>
            </div>
          </div>

          {/* CVエリア */}
          <div className="w-full max-w-[538px]">
            {isSubscribed ? (
              /* 加入済み: カード不要、ボタンのみ中央配置 */
              <div className="flex justify-center">
                <SecondaryCTAButton href="#curriculum">
                  カリキュラムへ
                </SecondaryCTAButton>
              </div>
            ) : (
              /* 未加入: カード付きで料金 + CTAボタン */
              <div className="backdrop-blur-[4px] bg-white/[0.04] border border-white/[0.06] rounded-3xl px-8 md:px-12 py-5 pb-6">
                <div className="flex items-center justify-center gap-4 text-white mb-4">
                  <span className="text-[12px] font-bold opacity-70">料金</span>
                  <div className="flex items-end gap-0.5 leading-none">
                    <span className="text-[20px] font-bold font-['Inter',sans-serif]">
                      5,800
                    </span>
                    <span className="text-[13px]">~</span>
                    <span className="text-[13px]">円/月</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <PrimaryCTAButton href="/subscription">
                    メンバーになってはじめる
                  </PrimaryCTAButton>
                  <SecondaryCTAButton href="#curriculum">
                    カリキュラムへ
                  </SecondaryCTAButton>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* 下部画像セクション - heroImageが設定されている場合のみ表示 */}
        {heroImageUrl && (
          <motion.div
            className="relative mx-auto max-w-[1200px] aspect-[5/1] max-h-[240px] overflow-hidden"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <img
              src={heroImageUrl}
              alt={stripLineBreakMarker(title)}
              className="w-full h-full object-cover object-center opacity-90"
            />
          </motion.div>
        )}
        </div>
      </motion.div>
    </section>
  );
}
