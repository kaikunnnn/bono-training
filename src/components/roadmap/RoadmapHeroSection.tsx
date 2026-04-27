import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoadmapHeroSectionProps {
  /** ロードマップタイトル */
  title: string;
  /** サブタイトル */
  subtitle?: string;
  /** 説明文 */
  description: string;
  /** 英語タイトル（上部に表示） */
  englishTitle?: string;
  /** ステップ数 */
  stepsCount: number;
  /** レッスン数 */
  lessonsCount: number | string;
  /** 目安期間（例: "6-9ヶ月"） */
  duration: string;
  /** 料金表示テキスト */
  priceText?: string;
  /** CTAリンク先 */
  ctaHref?: string;
  /** CTAテキスト */
  ctaText?: string;
  /** ローディング状態 */
  loading?: boolean;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * ロードマップ詳細ページ用ヒーローセクション
 *
 * - 英語サブタイトル
 * - メインタイトル（大きめ）
 * - サブタイトル・説明文
 * - CTAボタン
 * - Stats（ステップ数・レッスン数・目安期間）
 *
 * Figma: PRD🏠_Roadmap_2026 node-id: 1-5362
 */
export default function RoadmapHeroSection({
  title,
  subtitle,
  description,
  englishTitle,
  stepsCount,
  lessonsCount,
  duration,
  priceText = "月額5,980円〜",
  ctaHref = "/subscription",
  ctaText = "このロードマップをはじめる",
  loading = false,
  className,
}: RoadmapHeroSectionProps) {
  // 期間表示を整形（"6-9ヶ月" → "6-9" と "ヶ月" に分離）
  const durationNumber = duration.replace(/ヶ月|〜/g, "").replace("〜", "-");

  return (
    <section
      className={cn(
        "px-8 md:px-16 pt-16 pb-20 border-b border-[#eee]",
        className
      )}
    >
      <div className="max-w-[1100px] mx-auto">
        {/* サブタイトルライン */}
        <div className="flex items-center gap-6 mb-10">
          <span className="text-[11px] font-medium tracking-[0.3em] text-[#999] uppercase">
            {englishTitle || title.toUpperCase()}
          </span>
          <div className="flex-1 h-px bg-[#eee]" />
          <span className="text-[11px] text-[#999]">ロードマップ</span>
        </div>

        {/* メインコンテンツ: 2カラム */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* 左: タイトル + 説明 */}
          <div className="lg:col-span-7">
            <h1 className="text-[56px] md:text-[72px] font-bold text-[#1a1a1a] leading-[1.05] tracking-tight mb-8">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[20px] text-[#666] mb-4">{subtitle}</p>
            )}
            <p className="text-[17px] leading-[1.9] text-[#444] mb-10 max-w-[540px]">
              {description}
            </p>
            {/* CTA */}
            <div className="flex items-center gap-6">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#333] text-white font-semibold text-[15px] px-8 py-4 rounded-full transition-all hover:-translate-y-0.5"
              >
                {ctaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-[13px] text-[#999]">{priceText}</span>
            </div>
          </div>

          {/* 右: Stats */}
          <div className="lg:col-span-5">
            <div className="bg-[#fafafa] rounded-2xl p-8">
              <span className="text-[11px] font-medium tracking-[0.2em] text-[#999] uppercase block mb-6">
                Overview
              </span>
              <div className="space-y-6">
                {/* ステップ数 */}
                <div className="flex items-center justify-between py-4 border-b border-[#eee]">
                  <div>
                    <div className="text-[13px] text-[#666] mb-1">ステップ</div>
                    <div className="text-[11px] text-[#999]">段階的に習得</div>
                  </div>
                  <div
                    className="text-[40px] font-bold text-[#1a1a1a]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {stepsCount}
                  </div>
                </div>

                {/* レッスン数 */}
                <div className="flex items-center justify-between py-4 border-b border-[#eee]">
                  <div>
                    <div className="text-[13px] text-[#666] mb-1">レッスン</div>
                    <div className="text-[11px] text-[#999]">実践的な内容</div>
                  </div>
                  <div
                    className="text-[40px] font-bold text-[#1a1a1a]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {loading ? "-" : lessonsCount}
                  </div>
                </div>

                {/* 目安期間 */}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="text-[13px] text-[#666] mb-1">目安期間</div>
                    <div className="text-[11px] text-[#999]">自分のペースで</div>
                  </div>
                  <div
                    className="text-[40px] font-bold text-[#1a1a1a]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {durationNumber}
                    <span className="text-[16px] font-normal ml-1">ヶ月</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
