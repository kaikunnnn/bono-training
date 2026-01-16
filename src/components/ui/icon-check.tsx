import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconCheckProps {
  /** 状態: empty(未完了) / on(完了) */
  status?: "empty" | "on";
  /** 完了状態（statusの代替。CheckIconとの互換性のため） */
  isCompleted?: boolean;
  /** カスタムクラス */
  className?: string;
}

/**
 * チェックアイコン（共通コンポーネント）
 *
 * 使用箇所:
 * - QuestHeader（クエスト番号行）
 * - 記事詳細サイドナビの記事一覧
 *
 * Note: Iconsaxには単体のチェックマークアイコンがないため、
 * このコンポーネントのみ lucide-react の Check を使用しています。
 *
 * @example
 * <IconCheck status="empty" />  // 未完了
 * <IconCheck status="on" />     // 完了
 */
export function IconCheck({ status, isCompleted: isCompletedProp, className }: IconCheckProps) {
  // isCompleted または status のどちらかで完了状態を判定
  const isCompleted = isCompletedProp ?? status === "on";

  return (
    <div
      className={cn(
        "size-4 rounded-full backdrop-blur-[2px] flex items-center justify-center flex-shrink-0",
        isCompleted
          ? "bg-gradient-to-b from-[rgba(255,75,111,0.68)] to-[rgba(38,119,143,0.68)]"
          : "border border-black/5",
        className
      )}
    >
      <Check
        className={cn(
          "size-2.5",
          isCompleted ? "text-white" : "text-[#d5d5d5]"
        )}
        strokeWidth={2.5}
      />
    </div>
  );
}
