/**
 * カリキュラム - ステップコンポーネント
 *
 * Figma: PRD🏠_Roadmap_2026 node-id 1-5574
 */

import { Target } from "lucide-react";
import type { SanityRoadmapStep } from "@/types/sanity-roadmap";
import CurriculumSectionBlock from "./CurriculumSectionBlock";

interface CurriculumStepProps {
  /** ステップデータ */
  step: SanityRoadmapStep;
  /** ステップ番号（1始まり） */
  stepNumber: number;
  /** 最後のステップかどうか */
  isLast?: boolean;
}

export default function CurriculumStep({
  step,
  stepNumber,
  isLast = false,
}: CurriculumStepProps) {
  const formattedNumber = stepNumber.toString().padStart(2, "0");

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden mb-8 last:mb-0">
      {/* ステップヘッダー */}
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 p-4 md:p-6">
        {/* ステップ番号バッジ */}
        <div className="flex-shrink-0 w-[75px] bg-white rounded-2xl shadow-[0_1px_5px_rgba(0,0,0,0.08)] overflow-hidden self-start">
          {/* グラデーションヘッダー */}
          <div className="bg-gradient-to-r from-[#b2b3d9] via-[#e2ccd1] to-[#f1e8dc] px-2 py-1.5 rounded-t-2xl">
            <p className="text-[8px] font-bold text-text-black text-center">
              ステップ
            </p>
          </div>
          {/* 番号 */}
          <div className="px-2 py-2">
            <p className="text-[27px] font-bold text-text-black text-center font-['Unbounded',sans-serif] leading-none">
              {formattedNumber}
            </p>
          </div>
        </div>

        {/* タイトルとゴール */}
        <div className="flex-1">
          {/* ステップタイトル */}
          <h3 className="text-lg md:text-xl font-bold text-text-black mb-3 leading-[1.6]">
            {step.title}
          </h3>

          {/* ゴール */}
          {step.goals && step.goals.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
              {/* ゴールバッジ */}
              <div className="flex-shrink-0 flex items-center gap-1 bg-[rgba(138,138,138,0.1)] rounded-lg px-3 py-1.5 self-start">
                <Target className="w-3 h-3 text-text-black" />
                <span className="text-xs font-bold text-text-black">
                  ゴール
                </span>
              </div>

              {/* ゴールリスト */}
              <ul className="flex-1 space-y-1">
                {step.goals.map((goal, index) => (
                  <li
                    key={index}
                    className="text-sm md:text-base text-text-black leading-[1.8] list-disc ml-6"
                  >
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 区切り線 */}
      <div className="mx-4 md:mx-6 border-t border-gray-200" />

      {/* セクション一覧 */}
      {step.sections && step.sections.length > 0 && (
        <div className="p-4 md:p-6">
          <div className="flex">
            {/* 左側：タイムラインエリア（デスクトップのみ） - ステップバッジ幅と同じ75px */}
            <div className="hidden md:block relative w-[75px] flex-shrink-0 mr-6">
              {/* 縦線 - セクションエリア全体を貫く */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1 bottom-1 w-[1px] bg-gray-200" />
            </div>

            {/* 右側：セクションコンテンツ */}
            <div className="flex-1 space-y-8">
              {step.sections.map((section, index) => (
                <div key={section._key} className="relative">
                  {/* ドット - デスクトップのみ、タイムラインエリアの中央に配置 */}
                  <div className="hidden md:block absolute -left-[99px] top-1 w-[75px]">
                    <div className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white z-10" />
                  </div>
                  <CurriculumSectionBlock section={section} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
