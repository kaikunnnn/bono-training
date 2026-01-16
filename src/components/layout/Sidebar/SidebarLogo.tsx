import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";

interface SidebarLogoProps {
  className?: string;
}

/**
 * BONOロゴコンポーネント
 * サイドバーの上部に表示されるロゴ
 * 仕様: px-6 pt-7 pb-8
 */
const SidebarLogo: React.FC<SidebarLogoProps> = ({ className }) => {
  return (
    <div className={`flex flex-col pt-2 ${className || ""}`}>
      <div className="px-6 pt-7 pb-8">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="w-[67.51px] h-5" />
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
            工事中
          </span>
        </Link>
      </div>
    </div>
  );
};

export default SidebarLogo;
