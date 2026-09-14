import { SidebarMenuGroupProps } from "./types";
import { SidebarGroupLabel } from "./SidebarGroupLabel";
import { cn } from "@/lib/utils";

/**
 * サイドバーメニューグループコンポーネント
 *
 * 仕様:
 * - セクションコンテナ: w-full
 * - NavItemリストラッパー: px-[15px]
 * - NavItem間: gap-0
 */
export function SidebarMenuGroup({
  label,
  children,
  className,
}: SidebarMenuGroupProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-start px-[15px]",
        className
      )}
    >
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <div className="w-full flex flex-col items-start gap-0">
        {children}
      </div>
    </div>
  );
}
