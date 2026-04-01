/**
 * ロードマップ詳細ページ - カリキュラムセクション
 *
 * Figma: PRD🏠_Roadmap_2026 node-id 1-5565
 */

import type { SanityRoadmapStep } from "@/types/sanity-roadmap";
import CurriculumStep from "./CurriculumStep";
import CurriculumStepNav from "./CurriculumStepNav";

interface CurriculumSectionProps {
  /** ステップ配列 */
  steps: SanityRoadmapStep[];
}

export default function CurriculumSection({ steps }: CurriculumSectionProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section id="curriculum" className="py-16 px-4 md:px-8">
      <div className="max-w-[1100px] mx-auto">
        {/* セクションヘッダー - 他セクションと同じUI */}
        <div className="mb-9">
          {/* バッジ */}
          <div className="inline-flex items-center justify-center border border-[#52674e] rounded-full px-2.5 py-1.5 mb-4">
            <span className="text-[12px] font-bold text-[#52674e] uppercase">
              学習内容
            </span>
          </div>

          {/* タイトル */}
          <h2 className="text-[24px] font-extrabold text-[#293525] leading-[1.5] mb-4">
            カリキュラム
          </h2>

          {/* 説明文 */}
          <p className="text-[20px] text-[#293525]/80 leading-[1.35]">
            ステップに沿って、順番にスキル習得を目指しましょう
          </p>
        </div>

        {/* ステップナビゲーション */}
        <CurriculumStepNav steps={steps} />

        {/* ステップ一覧 */}
        <div className="relative">
          {steps.map((step, index) => (
            <CurriculumStep
              key={step._key}
              step={step}
              stepNumber={index + 1}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
