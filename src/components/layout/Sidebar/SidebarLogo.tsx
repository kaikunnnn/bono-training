import Link from "next/link";
import Logo from "@/components/common/Logo";
import { cn } from "@/lib/utils";

interface SidebarLogoProps {
  className?: string;
}

/**
 * BONOロゴコンポーネント
 * サイドバーの上部に表示されるロゴ
 * 仕様: px-[28px] py-[33px]
 * mainと同様、常に / にリンク（ログイン済みの場合は / が /mypage にリダイレクト）
 */
export function SidebarLogo({ className }: SidebarLogoProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="w-full px-[28px] py-[33px]">
        <Link href="/" className="flex items-center">
          <Logo width={81} height={24} />
        </Link>
      </div>
    </div>
  );
}
