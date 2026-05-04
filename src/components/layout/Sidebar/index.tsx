"use client";

import { usePathname } from "next/navigation";
import { SidebarProps } from "./types";
import { cn } from "@/lib/utils";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarMenuGroup } from "./SidebarMenuGroup";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { MenuIcons } from "./icons";
import { ICON_SIZE } from "./icon-utils";
import { DirectInbox, Home2 } from "iconsax-react";
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

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

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
      <SidebarLogo isLoggedIn={!!user} />

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
          href="/"
          icon={<Home2 size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={pathname === "/" || pathname === "/top"}
        >
          トップ
        </SidebarMenuItem>

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

        {/* BON-116で別ブランチ開発中のため一時非表示 */}
        {/* <SidebarMenuItem
          href="/guide"
          icon={<MenuIcons.guide size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={isActive("/guide")}
        >
          学習ガイド
        </SidebarMenuItem> */}
      </SidebarMenuGroup>

      {/* コミュニティ - 一時的に非表示（mainと同じ） */}
      <SidebarMenuGroup label="コミュニティ" itemGap className="hidden">
        <SidebarMenuItem
          href="/feedbacks"
          icon={<MenuIcons.feedback size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={isActive("/feedbacks")}
        >
          フィードバック
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
            <DirectInbox size={14} color="currentColor" />
            意見箱
          </a>
        </Button>
      </div>
    </nav>
  );
}

export default Sidebar;
