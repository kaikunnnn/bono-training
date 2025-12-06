import React from "react";
import { SidebarGroupLabelProps } from "./types";
import { cn } from "@/lib/utils";

/**
 * サイドバーグループラベルコンポーネント
 * Figma仕様:
 * - サイズ: 224px × 32px
 * - フォント: Inter, 12px, 500
 * - カラー: rgba(10, 10, 10, 0.7)
 * - padding: 0px 8px
 * - 角丸: 8px
 */
const SidebarGroupLabel: React.FC<SidebarGroupLabelProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-row items-center px-2 w-56 h-8 rounded-lg",
        "text-xs font-medium leading-4 text-black/70",
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
