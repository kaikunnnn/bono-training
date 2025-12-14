import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";

interface SidebarLogoProps {
  className?: string;
}

/**
 * BONOロゴコンポーネント
 * サイドバーの上部に表示されるロゴ
 */
const SidebarLogo: React.FC<SidebarLogoProps> = ({ className }) => {
  return (
    <div className={`flex flex-col p-[10px_12px] ${className || ""}`}>
      <Link to="/" className="flex items-center gap-2">
        <Logo className="w-[67.51px] h-5" />
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
          α版
        </span>
      </Link>
    </div>
  );
};

export default SidebarLogo;
