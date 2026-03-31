/**
 * GoalNavSection - 目的別ナビゲーションセクション
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 47-17453
 *
 * 構成:
 * - 見出し（タイトル + 説明文）
 * - GoalNavPill × 3（クリックで該当セクションへスムーススクロール）
 */

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// 型定義
// ============================================

interface GoalNavItem {
  /** スクロール先のセクションID */
  targetId: string;
  /** ピルに表示するテキスト */
  label: string;
}

interface GoalNavSectionProps {
  /** ナビゲーション項目 */
  items: GoalNavItem[];
  /** 追加のクラス名 */
  className?: string;
}

// ============================================
// サブコンポーネント
// ============================================

/** 目的選択ピルボタン */
function GoalNavPill({
  targetId,
  label,
}: GoalNavItem) {
  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center justify-between w-full sm:w-[400px] lg:w-[480px]",
        "h-[64px] sm:h-[72px] lg:h-[86px]",
        "px-5 sm:px-6 lg:px-8 py-1",
        "bg-white border border-black/45 rounded-full",
        "transition-all duration-200",
        "hover:border-black/60 hover:shadow-md hover:scale-[1.01]",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-primary/20"
      )}
    >
      <span className="text-sm sm:text-base font-medium text-text-primary leading-[1.8]">
        {label}
      </span>
      <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-text-primary/60 flex-shrink-0" />
    </button>
  );
}

// ============================================
// メインコンポーネント
// ============================================

export default function GoalNavSection({
  items,
  className,
}: GoalNavSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 py-12 sm:py-16 lg:py-[72px] px-4",
        className
      )}
    >
      {/* 見出し */}
      <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-[17px] max-w-[800px]">
        <h2 className="text-xl sm:text-2xl lg:text-[24px] font-extrabold text-text-primary leading-[1.5] text-center font-['Rounded_Mplus_1c',sans-serif]">
          目的に合わせたロードマップで
          <br />
          デザインの楽しさを発見する
          <br />
          トレーニングをはじめよう
        </h2>
        <p className="text-base sm:text-lg lg:text-xl font-normal text-text-secondary/80 leading-[1.35] text-center">
          ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ
        </p>
      </div>

      {/* ナビゲーションピル */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-5 lg:gap-6 w-full max-w-[1040px]">
        {items.map((item) => (
          <GoalNavPill key={item.targetId} {...item} />
        ))}
      </div>
    </section>
  );
}

// デフォルトのナビゲーション項目をエクスポート
export const DEFAULT_GOAL_NAV_ITEMS: GoalNavItem[] = [
  {
    targetId: "goal-career",
    label: "UIUX転職・キャリアチェンジしたい",
  },
  {
    targetId: "goal-ui-basics",
    label: "これからUIデザインを始めたい",
  },
  {
    targetId: "goal-ux-basics",
    label: "UXで課題解決をはじめたい",
  },
];
