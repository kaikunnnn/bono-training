import React from "react";
import { SidebarMenuGroupProps } from "./types";
import SidebarGroupLabel from "./SidebarGroupLabel";
import { cn } from "@/lib/utils";

/**
 * サイドバーメニューグループコンポーネント
 * Figma仕様:
 * - padding: 8px
 * - width: 240px
 * - gap: 4px（メニュー項目間）
 */
const SidebarMenuGroup: React.FC<SidebarMenuGroupProps> = ({
  label,
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-col p-2 w-60", className)}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
};

export default SidebarMenuGroup;
