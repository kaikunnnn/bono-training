"use client";

import { usePathname } from "next/navigation";
import { SidebarProps } from "./types";
import { cn } from "@/lib/utils";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarMenuGroup } from "./SidebarMenuGroup";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { MenuIcons } from "./icons";
import { ICON_SIZE } from "./icon-utils";
import { DirectInbox } from "iconsax-react";
import { Button } from "@/components/ui/button";

const FEEDBACK_URL = "https://forms.gle/Y5LorStnPm4jzFv77";

/**
 * サイドバーコンポーネント
 * 仕様:
 * - 幅: 200px（固定）
 * - 背景: 透過（ページ背景と同化）
 * - 高さ: 100%（デスクトップ時）
 * - レイアウト: flexbox（縦並び）
 */
export function Sidebar({ className, user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Server Action でサインアウト
    const { signOut } = await import("@/app/(auth)/actions");
    await signOut();
  };

  return (
    <nav
      className={cn(
        "w-[200px] h-full inline-flex flex-col justify-start items-start gap-4",
        className
      )}
      role="navigation"
      aria-label="メインナビゲーション"
    >
      <SidebarLogo />

      <SidebarMenuGroup>
        {user && (
          <SidebarMenuItem
            href="/mypage"
            icon={<MenuIcons.mypage size={ICON_SIZE} color="#2F3037" variant="Outline" />}
            isActive={isActive("/mypage")}
          >
            マイページ
          </SidebarMenuItem>
        )}

        <SidebarMenuItem
          href="/roadmap"
          icon={<MenuIcons.roadmap size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={isActive("/roadmap")}
        >
          ロードマップ
        </SidebarMenuItem>

        <SidebarMenuItem
          href="/lessons"
          icon={<MenuIcons.lesson size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={isActive("/lessons")}
        >
          レッスン
        </SidebarMenuItem>

        <SidebarMenuItem
          href="/training"
          icon={<MenuIcons.training size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={isActive("/training")}
        >
          トレーニング
        </SidebarMenuItem>
      </SidebarMenuGroup>

      <SidebarMenuGroup label="その他" itemGap>
        {!user && (
          <SidebarMenuItem
            href="/login"
            icon={<MenuIcons.login size={ICON_SIZE} color="#2F3037" variant="Outline" />}
            isActive={isActive("/login")}
          >
            ログイン
          </SidebarMenuItem>
        )}
        {user && (
          <SidebarMenuItem
            href="/account"
            icon={<MenuIcons.settings size={ICON_SIZE} color="#2F3037" variant="Outline" />}
            isActive={isActive("/account")}
          >
            設定
          </SidebarMenuItem>
        )}
        {user && (
          <SidebarMenuItem
            href="#"
            icon={<MenuIcons.logout size={ICON_SIZE} color="#2F3037" variant="Outline" />}
            isActive={false}
            onClick={handleSignOut}
          >
            ログアウト
          </SidebarMenuItem>
        )}
      </SidebarMenuGroup>

      <div className="mt-auto pt-4 px-[15px] w-full">
        <Button variant="outline" size="sm" className="w-full gap-1 text-xs" asChild>
          <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">
            <DirectInbox size={14} />
            意見箱
          </a>
        </Button>
      </div>
    </nav>
  );
}

export default Sidebar;
