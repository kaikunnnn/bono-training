import React from "react";
import { SidebarGroupLabelProps } from "./types";
import { cn } from "@/lib/utils";

/**
 * サイドバーグループラベルコンポーネント
 *
 * 仕様:
 * - padding: px-4
 * - height: 32px (h-8)
 * - フォント: Inter, 12px, Medium
 * - カラー: text-black/70
 * - 角丸: rounded-lg
 */
const SidebarGroupLabel: React.FC<SidebarGroupLabelProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "self-stretch h-8 px-4 rounded-lg",
        "inline-flex justify-start items-center",
        "text-black/70 text-xs font-medium leading-4",
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
