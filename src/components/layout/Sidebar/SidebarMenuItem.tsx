import React from "react";
import { Link } from "react-router-dom";
import { SidebarMenuItemProps } from "./types";
import { cn } from "@/lib/utils";

/**
 * サイドバーメニュー項目コンポーネント
 * Figma仕様:
 * - サイズ: 224px × 32px
 * - フォント: Inter, 14px, 400（通常）/ 500（アクティブ）
 * - カラー: #0a0a0a（通常）/ #171717（アクティブ）
 * - 背景: transparent（通常）/ #f5f5f5（アクティブ）/ #f9fafb（ホバー）
 * - padding-left: 8px
 * - gap: 8px（アイコンとテキスト）
 * - 角丸: 8px
 */
const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  href,
  icon,
  children,
  isActive = false,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col w-56",
        isActive && "bg-[#f5f5f5] rounded-lg items-center pl-2 h-8"
      )}
    >
      <Link
        to={href}
        onClick={onClick}
        className={cn(
          "flex flex-row items-center gap-2 w-56 h-8 rounded-lg",
          "text-sm font-normal leading-5 tracking-tight",
          "text-[#0a0a0a] no-underline transition-all duration-150 ease-in-out",
          !isActive && "pl-2 hover:bg-[#f9fafb]",
          isActive && "font-medium text-[#171717] p-0",
          "focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
        )}
        aria-current={isActive ? "page" : undefined}
        role="link"
      >
        <span
          className={cn(
            "w-4 h-4 flex-shrink-0 transition-colors duration-150",
            isActive ? "text-[#171717]" : "text-[#0a0a0a]"
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
          {children}
        </span>
      </Link>
    </div>
  );
};

export default SidebarMenuItem;
