import React from "react";
import { Link } from "react-router-dom";
import { SidebarMenuItemProps } from "./types";
import { cn } from "@/lib/utils";

/**
 * サイドバーメニュー項目コンポーネント
 *
 * 仕様（Figma）:
 * - padding: px-[14px] py-[9px]
 * - gap: 10px
 * - フォント: Noto Sans JP, 13px, Medium
 * - アイコン: 20x20px
 */
const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  href,
  icon,
  children,
  isActive = false,
  onClick,
}) => {
  const baseClasses =
    "w-full rounded-[20px] px-[14px] py-[9px] inline-flex items-center gap-[10px]" +
    " font-noto-sans-jp text-[13px] font-medium leading-none text-[#2F3037]" +
    " transition-colors duration-150 border border-transparent";
  const stateClasses = isActive
    ? "border border-[rgba(47,48,55,0.08)] bg-[linear-gradient(111.3507deg,rgba(47,48,55,0.08)_9.1965%,rgba(47,48,55,0.03)_79.127%)]"
    : "bg-transparent hover:bg-[rgba(47,48,55,0.04)] active:bg-[rgba(47,48,55,0.08)]";
  const isExternal = /^https?:\/\//.test(href);

  const content = (
    <>
      {/* アイコン */}
      <span
        className={cn(
          "w-5 h-5 flex-shrink-0 inline-flex flex-col justify-center items-center",
          "text-[#2F3037]"
        )}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* テキスト */}
      <span className="pb-[2px] whitespace-nowrap overflow-hidden text-ellipsis">
        {children}
      </span>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={cn(
          baseClasses,
          stateClasses,
          "no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        )}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        baseClasses,
        stateClasses,
        "no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {content}
    </Link>
  );
};

export default SidebarMenuItem;
