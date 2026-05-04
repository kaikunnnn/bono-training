import Link from "next/link";
import Logo from "@/components/common/Logo";
import { cn } from "@/lib/utils";

interface SidebarLogoProps {
  className?: string;
  isLoggedIn?: boolean;
}

/**
 * BONOロゴコンポーネント
 * サイドバーの上部に表示されるロゴ
 * 仕様: px-[28px] py-[33px]
 * ログイン中は /mypage、未ログインは / にリンク
 */
export function SidebarLogo({ className, isLoggedIn }: SidebarLogoProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="w-full px-[28px] py-[33px]">
        <Link href={isLoggedIn ? "/mypage" : "/"} className="flex items-center">
          <Logo width={81} height={24} />
        </Link>
      </div>
    </div>
  );
}
