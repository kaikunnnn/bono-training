/**
 * ロードマップ詳細ページ - ヒーローセクション
 *
 * Figma: PRD🏠_Roadmap_2026 node-id 35-12022
 */

import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { GradientPreset } from "@/types/sanity-roadmap";
import { getGradientClass } from "@/types/sanity-roadmap";

interface RoadmapHeroProps {
  /** ロードマップタイトル */
  title: string;
  /** キャッチコピー */
  tagline?: string;
  /** ステップ数 */
  stepCount: number;
  /** 目安期間（例: "1-2"） */
  estimatedDuration: string;
  /** グラデーションプリセット */
  gradientPreset?: GradientPreset;
  /** サムネイル画像URL */
  thumbnailUrl?: string;
}

export default function RoadmapHero({
  title,
  tagline,
  stepCount,
  estimatedDuration,
  gradientPreset,
  thumbnailUrl,
}: RoadmapHeroProps) {
  const navigate = useNavigate();
  const gradientClass = getGradientClass(gradientPreset);

  const handleBack = () => {
    // 履歴がある場合は戻る、なければロードマップ一覧へ
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/roadmaps");
    }
  };

  return (
    <section className="relative">
      {/* 背景エリア */}
      <div
        className={`relative bg-gradient-to-b ${gradientClass} rounded-[32px] border-4 border-white shadow-[0_1px_24px_rgba(0,0,0,0.16)] mx-4 md:mx-8 overflow-hidden`}
      >
        {/* ドット模様（装飾） */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div className="grid grid-cols-10 gap-[45px] p-8">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-white"
              />
            ))}
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="relative flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-8">
            {/* 戻るボタン */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 bg-white border border-[#ebebeb] rounded-xl px-3 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.08),0_0_3px_rgba(0,0,0,0.04)] hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-[12px] font-bold">戻る</span>
            </button>

            {/* パンくずリスト */}
            <nav className="text-[12px] font-bold text-white/60">
              <Link
                to="/roadmaps"
                className="hover:text-white/80 transition-colors"
              >
                ロードマップ
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white/80">{title}</span>
            </nav>
          </div>
        </div>

        {/* タイトル周り */}
        <div className="relative flex flex-col items-center gap-6 px-8 pt-4 pb-8">
          {/* バッジ */}
          <div className="border border-white rounded-full px-4 py-1.5">
            <span className="text-[13px] text-white">ロードマップ</span>
          </div>

          {/* タイトル */}
          <h1 className="text-[32px] md:text-[40px] font-bold text-white text-center leading-[1.6]">
            {title}
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
            <div className="backdrop-blur-[4px] bg-white/[0.04] border border-white/[0.06] rounded-3xl px-8 md:px-12 py-5 pb-6">
              {/* 料金表示 */}
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

              {/* CTAボタン */}
              <div className="flex gap-4">
                <Link
                  to="/subscription"
                  className="flex-1 flex items-center justify-center h-12 bg-[#081c17] border border-white/[0.02] rounded-[14px] text-[14px] font-bold text-white tracking-[0.35px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] hover:opacity-90 transition-opacity"
                >
                  メンバーになってはじめる
                </Link>
                <a
                  href="#curriculum"
                  className="flex items-center justify-center w-[170px] h-12 border border-white rounded-[14px] text-[14px] font-bold text-white tracking-[0.35px] hover:bg-white/10 transition-colors"
                >
                  カリキュラムへ
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 下部画像セクション */}
        {thumbnailUrl && (
          <div className="relative mx-8 mb-8 h-[200px] md:h-[308px] rounded-[40px] overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        )}
      </div>
    </section>
  );
}
