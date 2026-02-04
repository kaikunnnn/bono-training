import React from "react";
import { SidebarGroupLabelProps } from "./types";
import { cn } from "@/lib/utils";

/**
 * サイドバーグループラベルコンポーネント
 *
 * 仕様:
 * - padding: px-[6px]
 * - height: 32px
 * - フォント: 10px, Bold
 * - カラー: #74798B
 * - 角丸: 8px
 */
const SidebarGroupLabel: React.FC<SidebarGroupLabelProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "w-full h-[32px] px-[6px] rounded-[8px]",
        "inline-flex justify-start items-center",
        "text-[#74798B] text-[10px] font-bold leading-[16px]",
        "select-none",
        className
      )}
      role="heading"
      aria-level={2}
    >
      {children}
    </div>
  );
};

export default SidebarGroupLabel;
