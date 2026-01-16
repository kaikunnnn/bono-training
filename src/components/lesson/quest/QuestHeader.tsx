import { IconCheck } from "@/components/ui/icon-check";

interface QuestHeaderProps {
  /** クエスト番号 (1, 2, 3...) */
  questNumber: number;
  /** 完了状態 */
  isCompleted: boolean;
}

/**
 * クエスト番号行（チェックアイコン + 「クエスト 01」ラベル）
 *
 * @example
 * <QuestHeader questNumber={1} isCompleted={false} />
 * <QuestHeader questNumber={2} isCompleted={true} />
 */
export function QuestHeader({ questNumber, isCompleted }: QuestHeaderProps) {
  // 番号を2桁ゼロ埋め
  const formattedNumber = String(questNumber).padStart(2, "0");

  return (
    <div className="flex items-center gap-5">
      {/* チェックアイコン */}
      <IconCheck status={isCompleted ? "on" : "empty"} />

      {/* クエストラベル */}
      <div className="flex items-center gap-0.5 text-[#151834]">
        <span className="font-noto-sans-jp font-bold text-[14px] leading-[14.4px]">
          クエスト
        </span>
        <span className="text-[13px] leading-[100%] text-center align-bottom font-['M_PLUS_Rounded_1c'] font-extrabold">
          {formattedNumber}
        </span>
      </div>
    </div>
  );
}
