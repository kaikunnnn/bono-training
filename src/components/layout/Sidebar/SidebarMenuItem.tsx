import React from "react";
import { Link } from "react-router-dom";
import { SidebarMenuItemProps } from "./types";
import { cn } from "@/lib/utils";

/**
 * サイドバーメニュー項目コンポーネント
 *
 * 3つの状態:
 * - Default: 背景なし、text-gray-500 (#666E7B)、font-medium
 * - Hover: bg-white + shadow、text-gray-500
 * - Active: bg-white、text-gray-800 (#2F3038)、font-extrabold
 *
 * 仕様:
 * - padding: px-4 py-2.5
 * - gap: 6px (gap-1.5)
 * - フォント: M PLUS Rounded 1c, 12px
 * - アイコン: 16x16px
 */
const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  href,
  icon,
  children,
  isActive = false,
  onClick,
}) => {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        // 共通スタイル
        "self-stretch px-4 py-2.5 rounded-2xl",
        "inline-flex justify-start items-center gap-1.5",
        "no-underline transition-all duration-150 ease-in-out",
        "focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2",
        // 状態別スタイル
        isActive
          ? "bg-white"
          : "hover:bg-white hover:shadow-[0px_1px_1px_0px_rgba(0,0,0,0.04)]"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {/* アイコン */}
      <span
        className={cn(
          "w-4 h-4 flex-shrink-0 inline-flex flex-col justify-center items-center overflow-hidden",
          "transition-colors duration-150",
          isActive ? "text-gray-800" : "text-gray-500"
        )}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* テキスト */}
      <span
        className={cn(
          "text-xs leading-5 whitespace-nowrap overflow-hidden text-ellipsis",
          isActive
            ? "text-gray-800 font-extrabold"
            : "text-gray-500 font-medium"
        )}
      >
        {children}
      </span>
    </Link>
  );
};

export default SidebarMenuItem;
