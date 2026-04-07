/**
 * トップ ヒーローセクション
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 77-16766
 *
 * 構成:
 * 1. NEWバッジ（最新リリース情報）
 * 2. メインキャッチコピー
 * 3. サブキャッチコピー
 * 4. CTAボタン（はじめ方を見る / ロードマップを見る）
 * 5. ロードマップカード×3（扇形配置）
 */

import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { type GradientPreset, getGradientCSS } from "@/styles/gradients";

// ============================================
// 型定義
// ============================================

interface TopHeroRoadmapItem {
  /** ロードマップのスラッグ */
  slug: string;
  /** タイトル */
  title: string;
  /** サムネイル画像URL */
  thumbnailUrl?: string;
  /** グラデーションプリセット */
  gradientPreset: GradientPreset;
}

interface TopHeroSectionProps {
  /** NEWバッジのテキスト */
  newBadgeText?: string;
  /** 表示するロードマップ（3つ） */
  roadmaps: TopHeroRoadmapItem[];
  /** 追加のクラス名 */
  className?: string;
}

// グラデーション定義は src/styles/gradients.ts に統一管理されています

// ============================================
// サブコンポーネント
// ============================================

/** NEWバッジ */
function NewBadge({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-1.5 border border-[#0f172a] rounded-full">
      <span className="text-[10px] sm:text-xs font-bold text-[#0f172a]">NEW!</span>
      <span className="text-[11px] sm:text-[13px] font-bold text-[#0f172a]">{text}</span>
    </div>
  );
}

/** CTAボタン */
function CTAButton({
  children,
  href,
  variant = "primary",
  external = false,
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  external?: boolean;
}) {
  const baseStyles = cn(
    "inline-flex items-center justify-center h-11 sm:h-12 px-5 sm:px-6 rounded-[14px] text-sm font-bold tracking-wide transition-all",
    variant === "primary"
      ? "bg-[#081c17] text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-[#0d2a22]"
      : "bg-transparent border border-[#0f172a] text-[#0f172a] hover:bg-[#f5f5f5]"
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseStyles}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={baseStyles}>
      {children}
    </Link>
  );
}

/** ロードマップカード（トップ用・シンプル版） */
function TopRoadmapCard({
  slug,
  title,
  thumbnailUrl,
  gradientPreset,
  rotation = 0,
  className,
}: TopHeroRoadmapItem & { rotation?: number; className?: string }) {
  const gradientCSS = getGradientCSS(gradientPreset);

  return (
    <Link
      to={`/roadmaps/${slug}`}
      className={cn("block group", className)}
      style={{ transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined }}
    >
      <div
        className={cn(
          "relative w-full sm:w-[300px] lg:w-[377px] h-[320px] sm:h-[380px] lg:h-[441px] rounded-[24px] sm:rounded-[32px] overflow-hidden",
          "shadow-[0px_1px_12px_0px_rgba(0,0,0,0.08)]",
          "transition-all duration-300",
          "group-hover:shadow-lg group-hover:scale-[1.02]"
        )}
        style={{ background: gradientCSS }}
      >
        {/* アイコン（左上） */}
        <div className="absolute left-5 sm:left-8 top-5 sm:top-8">
          <div className="flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-white rounded-full">
            <Briefcase className="w-5 sm:w-7 h-5 sm:h-7 text-[#1a1a1a]" />
          </div>
        </div>

        {/* サムネイル画像（中央下部） */}
        {thumbnailUrl && (
          <div className="absolute inset-x-4 sm:inset-x-6 top-20 sm:top-28 bottom-28 sm:bottom-36">
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
            />
          </div>
        )}

        {/* コンテンツ（下部） */}
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 py-4 sm:py-6">
          {/* ロードマップバッジ */}
          <div className="inline-flex items-center justify-center px-2.5 sm:px-3 py-1 sm:py-1.5 mb-2 sm:mb-2.5 border border-white rounded-full">
            <span className="text-[10px] sm:text-[11px] font-bold text-white whitespace-nowrap">
              ロードマップ
            </span>
          </div>

          {/* タイトル */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-[1.375]">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

// ============================================
// メインコンポーネント
// ============================================

export default function TopHeroSection({
  newBadgeText = "AIプロトタイピングコースがリリース",
  roadmaps,
  className,
}: TopHeroSectionProps) {
  // 扇形配置の回転角度（デスクトップのみ）
  const rotations = [-1.83, 0, 1.83];

  return (
    <section
      className={cn(
        "flex flex-col items-center gap-8 sm:gap-12 py-10 sm:py-16",
        className
      )}
    >
      {/* ============================================
          ヘディング部分
      ============================================ */}
      <div className="flex flex-col items-center gap-4 sm:gap-5 max-w-[1148px] px-4">
        {/* NEWバッジ */}
        <NewBadge text={newBadgeText} />

        {/* メインキャッチコピー */}
        <h1 className="text-center text-[#0f172a] text-2xl sm:text-4xl lg:text-5xl font-bold leading-[1.42] font-['Rounded_Mplus_1c',sans-serif]">
          ワクワクするものつくるために
          <br />
          体系的にスキルフルになろう
        </h1>

        {/* サブキャッチコピー */}
        <p className="text-center text-[#0f172a] text-base sm:text-lg lg:text-xl leading-[1.6] max-w-[533px]">
          ユーザー価値から考えてデザインするスキルを身につける人のためのトレーニングサービスです
        </p>

        {/* CTAボタン */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <CTAButton href="https://www.bo-no.design/plan" external>
            はじめ方を見る
          </CTAButton>
          <CTAButton href="/roadmaps" variant="secondary">
            ロードマップを見る
          </CTAButton>
        </div>
      </div>

      {/* ============================================
          ロードマップカードセクション
      ============================================ */}
      <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
        {/* ラベルテキスト */}
        <p className="text-center text-[#293525] text-sm sm:text-base font-extrabold leading-[2.25] font-['Rounded_Mplus_1c',sans-serif] px-4">
          目的に合わせたロードマップでデザインの楽しさを探究しよう
        </p>

        {/* カード（モバイル: 横スクロール / デスクトップ: 扇形配置） */}
        {/* モバイル: 横スクロール */}
        <div className="flex lg:hidden gap-4 overflow-x-auto pb-4 px-4 w-full snap-x snap-mandatory scrollbar-hide">
          {roadmaps.slice(0, 3).map((roadmap) => (
            <TopRoadmapCard
              key={roadmap.slug}
              {...roadmap}
              className="flex-shrink-0 w-[280px] snap-center"
            />
          ))}
        </div>

        {/* デスクトップ: 扇形配置 */}
        <div className="hidden lg:flex relative items-center justify-center gap-6 w-full max-w-[1200px] h-[500px]">
          {roadmaps.slice(0, 3).map((roadmap, index) => (
            <TopRoadmapCard
              key={roadmap.slug}
              {...roadmap}
              rotation={rotations[index] || 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
