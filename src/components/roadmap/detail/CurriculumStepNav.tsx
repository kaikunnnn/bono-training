/**
 * カリキュラム - ステップナビゲーション
 *
 * カリキュラム内の各ステップへジャンプするためのナビゲーション
 * Figma: PRD🏠_Roadmap_2026 node-id 187-18624
 */

import { ChevronRight } from "lucide-react";
import type { SanityRoadmapStep } from "@/types/sanity-roadmap";

// ============================================
// 型定義
// ============================================

interface CurriculumStepNavProps {
  /** ステップ配列 */
  steps: SanityRoadmapStep[];
}

interface StepNavItemProps {
  /** ステップ番号（1始まり） */
  stepNumber: number;
  /** ステップタイトル */
  title: string;
  /** クリック時のコールバック */
  onClick: () => void;
}

// ============================================
// サブコンポーネント
// ============================================

/**
 * ステップナビゲーションアイテム
 * Figma: node-id 187-18627
 */
function StepNavItem({ stepNumber, title, onClick }: StepNavItemProps) {
  const formattedNumber = stepNumber.toString().padStart(2, "0");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`ステップ${stepNumber}「${title}」へ移動`}
      className="flex items-center gap-2 px-3 py-1 border border-black/[0.12] rounded-[50px] hover:bg-gray-50 hover:border-black/20 transition-colors text-left group w-full"
    >
      {/* ステップ番号 */}
      <span className="text-[12px] font-bold text-[#0f172a] font-['Unbounded',sans-serif] leading-[33px] shrink-0">
        {formattedNumber}
      </span>

      {/* ステップタイトル */}
      <span className="flex-1 text-[14px] font-medium text-[#0f172a] leading-[33px] truncate">
        {title}
      </span>

      {/* 矢印アイコン（下向き = 90度回転） */}
      <span className="shrink-0 w-3 h-3 flex items-center justify-center">
        <ChevronRight className="w-3 h-3 text-gray-400 rotate-90 group-hover:text-gray-600 transition-colors" />
      </span>
    </button>
  );
}

// ============================================
// メインコンポーネント
// ============================================

export default function CurriculumStepNav({ steps }: CurriculumStepNavProps) {
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
    <nav aria-label="カリキュラムステップナビゲーション" className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step, index) => (
          <StepNavItem
            key={step._key}
            stepNumber={index + 1}
            title={step.title}
            onClick={() => scrollToStep(index + 1)}
          />
        ))}
      </div>
    </nav>
  );
}
