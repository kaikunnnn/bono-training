import { cn } from "@/lib/utils";

interface GoalSectionHeaderProps {
  /** ゴールのタイトル */
  title: string;
  /** 説明文 */
  description: string;
  /** 説明文の後に表示する絵文字（任意） */
  emoji?: string;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * ゴールセクションヘッダー
 *
 * GoalSection の上部に表示するヘッダー部分
 * - 「ゴール」バッジ
 * - タイトル（大きめ）
 * - 説明文 + 絵文字
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 47-13822
 */
export default function GoalSectionHeader({
  title,
  description,
  emoji,
  className,
}: GoalSectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:gap-[17px] px-4 sm:px-8 lg:px-14 py-6 sm:py-10 lg:py-12", className)}>
      {/* ゴールバッジ */}
      <div className="inline-flex self-start items-center justify-center px-2 sm:px-2.5 py-1 sm:py-1.5 border border-[#52674e] rounded-full">
        <span className="text-[10px] sm:text-xs font-bold text-[#52674e] uppercase leading-none">
          ゴール
        </span>
      </div>

      {/* タイトル */}
      <h2 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold text-text-primary leading-[1.29] font-['Rounded_Mplus_1c',sans-serif]">
        {title}
      </h2>

      {/* 説明文 + 絵文字 */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
        <p className="text-base sm:text-lg lg:text-xl font-normal text-text-secondary/80 leading-[1.35]">
          {description}
        </p>
        {emoji && (
          <span className="text-lg sm:text-[22px]" role="img" aria-hidden="true">
            {emoji}
          </span>
        )}
      </div>
    </div>
  );
}
