import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconCheckProps {
  /** 状態: empty(未完了) / on(完了) */
  status: "empty" | "on";
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
 * @example
 * <IconCheck status="empty" />  // 未完了
 * <IconCheck status="on" />     // 完了
 */
export function IconCheck({ status, className }: IconCheckProps) {
  const isCompleted = status === "on";

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
