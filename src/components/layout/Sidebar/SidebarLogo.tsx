import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";
import { cn } from "@/lib/utils";

interface SidebarLogoProps {
  className?: string;
}

/**
 * BONOロゴコンポーネント
 * サイドバーの上部に表示されるロゴ
 * 仕様: px-[28px] py-[33px]
 */
const SidebarLogo: React.FC<SidebarLogoProps> = ({ className }) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="w-full px-[28px] py-[33px]">
        <Link to="/" className="flex items-center">
          <Logo width={81} height={24} />
        </Link>
      </div>
    </div>
  );
};

export default SidebarLogo;
