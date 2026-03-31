import React from "react";
import { cn } from "@/lib/utils";

interface LessonCategoryBadgeProps {
  label: string;
  className?: string;
}

const LessonCategoryBadge: React.FC<LessonCategoryBadgeProps> = ({
  label,
  className,
}) => {
  return (
    <div className="flex items-center">
      <span
        className={cn(
          "inline-flex items-center justify-center px-3 py-[6px] border border-black rounded-[30px] leading-none",
          className
        )}
      >
        <span className="font-noto-sans-jp text-[10px] sm:text-[11px] md:text-[12px] font-medium text-[#0d221d]">
          {label}
        </span>
      </span>
    </div>
  );
};

export default LessonCategoryBadge;

