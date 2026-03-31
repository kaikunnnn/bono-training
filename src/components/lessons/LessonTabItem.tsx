import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LessonTabItemProps {
  to: string;
  label: string;
  active?: boolean;
  count?: number;
}

const LessonTabItem: React.FC<LessonTabItemProps> = ({
  to,
  label,
  active = false,
  count,
}) => {
  return (
    <Link
      to={to}
      className={cn(
        // 高さ34px相当: text-sm(14px) + py-[9px](18px) + leading-none
        "inline-flex items-center gap-1.5 py-[9px] px-3 text-sm font-bold leading-none whitespace-nowrap border-b-2 flex-shrink-0 transition-colors",
        active
          ? "border-black text-black"
          : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
      )}
    >
      <span className="leading-none">{label}</span>
      {typeof count === "number" && (
        <span className="text-xs font-medium text-gray-500">{count}</span>
      )}
    </Link>
  );
};

export default LessonTabItem;

