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
      <Link to="/" className="flex items-center">
        <Logo className="w-[67.51px] h-5" />
      </Link>
    </div>
  );
};

export default SidebarLogo;
