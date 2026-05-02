"use client";

/**
 * ロードマップの道筋セクション
 *
 * 白いカード内にステップリスト、ステップ間にドット区切り線を配置
 * ヒーローの直後に配置して、ロードマップ全体の流れを提示
 */

import { ArrowDown2 } from "iconsax-react";
import type { SanityRoadmapStep } from "@/types/sanity-roadmap";
import DottedDivider from "@/components/common/DottedDivider";

interface RoadmapPathwayProps {
  /** ロードマップの説明文（description） */
  description: string;
  /** ステップ配列 */
  steps: SanityRoadmapStep[];
}

export default function RoadmapPathway({ description, steps }: RoadmapPathwayProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  const scrollToStep = (stepNumber: number) => {
    const element = document.getElementById(`curriculum-step-${stepNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="py-12 md:py-8 px-4 md:px-8">
      <div className="max-w-[1100px] mx-auto">
        {/* ヘッダー */}
        <div className="mb-9">
          <div className="inline-flex items-center justify-center border border-[#52674e] rounded-full px-[8px] py-[2px] mb-4">
            <span className="text-[12px] font-bold text-[#52674e] uppercase">
              道のり
            </span>
          </div>
          <h2 className="text-[24px] font-extrabold text-[#293525] leading-[36px] mb-4">
            ロードマップの流れ
          </h2>
          <p className="text-[20px] text-[rgba(41,53,37,0.8)] leading-[27px] max-w-3xl">
            {description}
          </p>
        </div>

        {/* 白いカード */}
        <div className="bg-white rounded-[20px] border border-[#e5e7eb] p-2">
          <nav aria-label="ステップナビゲーション">
            {steps.map((step, index) => {
              const stepNumber = (index + 1).toString().padStart(2, "0");
              const isLast = index === steps.length - 1;

              return (
                <div key={step._key}>
                  {/* ステップアイテム */}
                  <button
                    type="button"
                    onClick={() => scrollToStep(index + 1)}
                    aria-label={`ステップ${index + 1}「${step.title}」へ移動`}
                    className="flex items-center gap-4 w-full text-left group p-5 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    {/* ステップ番号バッジ */}
                    <div className="flex-shrink-0 w-[50px] h-[43px] bg-white rounded-xl shadow-[0_1px_5px_rgba(0,0,0,0.08)] overflow-hidden">
                      {/* 薄いグレーヘッダー（ホバー時グラデーション） */}
                      <div className="bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-[#b2b3d9] group-hover:via-[#e2ccd1] group-hover:to-[#f1e8dc] px-1.5 py-1.5 rounded-t-xl transition-all">
                        <p className="text-[6px] font-bold text-text-primary text-center leading-[9px]">
                          ステップ
                        </p>
                      </div>
                      {/* 番号 */}
                      <div className="flex items-center justify-center h-[26px]">
                        <p className="text-[14px] font-bold text-text-primary text-center font-['Unbounded',sans-serif] leading-[18px]">
                          {stepNumber}
                        </p>
                      </div>
                    </div>

                    {/* テキスト */}
                    <div className="flex-1 min-w-0">
                      {/* タイトル */}
                      <h3 className="text-[16px] font-bold text-text-primary leading-[24px] group-hover:text-gray-700 transition-colors">
                        {step.title}
                      </h3>
                    </div>

                    {/* 下矢印アイコン */}
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#f3f4f6]">
                      <div className="transition-transform duration-500 group-hover:rotate-[360deg]">
                        <ArrowDown2 size={16} color="#9ca3af" variant="Linear" />
                      </div>
                    </div>
                  </button>

                  {/* ステップ間のドット区切り線 */}
                  {!isLast && (
                    <div className="px-5">
                      <DottedDivider />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </section>
  );
}
