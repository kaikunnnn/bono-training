import { IconCheck } from "@/components/ui/icon-check";

interface QuestHeaderProps {
  questNumber: number;
  isCompleted: boolean;
}

export function QuestHeader({ questNumber, isCompleted }: QuestHeaderProps) {
  const formattedNumber = String(questNumber).padStart(2, "0");

  return (
    <div className="flex items-center gap-5">
      <IconCheck status={isCompleted ? "on" : "empty"} />

      <div className="flex items-center gap-0.5 text-[#151834]">
        <span className="font-noto-sans-jp font-bold text-[14px] leading-[14.4px]">
          クエスト
        </span>
        <span className="text-[13px] leading-[100%] text-center align-bottom font-rounded-mplus font-extrabold">
          {formattedNumber}
        </span>
      </div>
    </div>
  );
}
