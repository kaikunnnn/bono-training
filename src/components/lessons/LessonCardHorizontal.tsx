import React from "react";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/types/lesson";

interface LessonCardHorizontalProps {
  lesson: Lesson;
  onClick?: () => void;
  className?: string;
}

const LessonCardHorizontal: React.FC<LessonCardHorizontalProps> = ({
  lesson,
  onClick,
  className,
}) => {
  return (
    <article
      className={cn(
        "bg-white flex items-center gap-4 p-3 sm:p-4 rounded-[16px] sm:rounded-[20px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.08)]",
        "cursor-pointer transform transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0px_4px_18px_0px_rgba(0,0,0,0.16)]",
        "w-full text-[#0d221d]",
        className
      )}
      onClick={onClick}
    >
      {/* サムネイル */}
      <div className="flex-shrink-0">
        {lesson.thumbnail ? (
          <div className="w-[56px] sm:w-[68px] aspect-[2/3] rounded-[4px] shadow-[0px_0px_16px_0px_rgba(0,0,0,0.12)] overflow-hidden">
            <img
              src={lesson.thumbnail}
              alt={`${lesson.title}のサムネイル`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-[56px] sm:w-[68px] aspect-[2/3] rounded-[4px] bg-gray-200" />
        )}
      </div>

      {/* テキスト */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {lesson.category && (
          <span className="inline-flex items-center self-start px-2 py-0.5 border border-black rounded-[30px]">
            <span className="font-noto-sans-jp text-[10px] sm:text-[11px] font-medium text-[#0d221d] leading-[10px]">
              {lesson.category}
            </span>
          </span>
        )}
        <h3 className="font-rounded-mplus-bold text-[13px] sm:text-sm font-bold text-[#0d221d] leading-[1.4] line-clamp-2">
          {lesson.title}
        </h3>
        {lesson.description && (
          <p className="font-noto-sans-jp text-[10px] sm:text-[11px] font-medium text-[var(--text-muted)] leading-[1.5] line-clamp-2">
            {lesson.description}
          </p>
        )}
      </div>
    </article>
  );
};

export default LessonCardHorizontal;
