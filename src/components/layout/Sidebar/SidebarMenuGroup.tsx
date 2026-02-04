import React from "react";
import { SidebarMenuGroupProps } from "./types";
import SidebarGroupLabel from "./SidebarGroupLabel";
import { cn } from "@/lib/utils";

/**
 * サイドバーメニューグループコンポーネント
 *
 * 仕様:
 * - セクションコンテナ: w-full
 * - NavItemリストラッパー: px-[15px]
 * - NavItem間: gap-[8px]
 */
const SidebarMenuGroup: React.FC<SidebarMenuGroupProps> = ({
  label,
  children,
  className,
  itemGap = false,
}) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-start px-[15px]",
        className
      )}
    >
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <div
        className={cn(
          "w-full flex flex-col items-start gap-[8px]",
          itemGap && "gap-[8px]"
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default SidebarMenuGroup;
