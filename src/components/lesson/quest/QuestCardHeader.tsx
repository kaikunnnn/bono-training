interface QuestCardHeaderProps {
  title: string;
  goal?: string;
}

export function QuestCardHeader({ title, goal }: QuestCardHeaderProps) {
  return (
    <div className="flex flex-col items-start pt-5 pb-[15px] px-8 w-full">
      <div className="flex flex-col gap-2 items-start w-full">
        <h3 className="font-noto-sans-jp font-bold text-[18px] leading-[28px] text-[#151834] w-full whitespace-pre-wrap">
          {title}
        </h3>

        {goal && (
          <p className="font-noto-sans-jp font-medium text-[14px] leading-[20px] text-[#6f7178] w-full whitespace-pre-wrap">
            {goal}
          </p>
        )}
      </div>
    </div>
  );
}
