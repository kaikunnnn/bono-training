import React from "react";
import { SidebarMenuGroupProps } from "./types";
import SidebarGroupLabel from "./SidebarGroupLabel";
import { cn } from "@/lib/utils";

/**
 * サイドバーメニューグループコンポーネント
 *
 * 仕様:
 * - セクションコンテナ: self-stretch
 * - NavItemリストラッパー: px-2
 * - itemGap: trueの場合、NavItem間にgap-1を追加（「その他」セクション用）
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
        "self-stretch flex flex-col justify-start items-start",
        className
      )}
    >
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <div
        className={cn(
          "self-stretch px-2 flex flex-col justify-start items-start",
          itemGap && "gap-1"
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default SidebarMenuGroup;
