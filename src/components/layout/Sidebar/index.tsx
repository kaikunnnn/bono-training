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
      <SidebarLogo />

      <SidebarMenuGroup>
        {user && (
          <SidebarMenuItem
            href="/mypage"
            icon={<MenuIcons.mypage size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
            isActive={isActive("/mypage")}
          >
            マイページ
          </SidebarMenuItem>
        )}

        <SidebarMenuItem
          href="/top"
          icon={<Home2 size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
          isActive={pathname === "/top" || pathname === "/"}
        >
          トップ
        </SidebarMenuItem>
      </SidebarMenuGroup>

      {/* コース・レッスン・トレーニング */}
      <SidebarMenuGroup>
        <SidebarMenuItem
          href="/topics"
          icon={<MenuIcons.course size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
          isActive={isActive("/topics")}
        >
          コース
        </SidebarMenuItem>

        <SidebarMenuItem
          href="/lessons"
          icon={<MenuIcons.lesson size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
          isActive={isActive("/lessons")}
        >
          レッスン
        </SidebarMenuItem>

        <SidebarMenuItem
          href="/training"
          icon={<MenuIcons.training size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
          isActive={isActive("/training")}
        >
          トレーニング
        </SidebarMenuItem>
      </SidebarMenuGroup>

      {/* ロードマップ・プロセス・ガイド */}
      <SidebarMenuGroup label="探す">
        <SidebarMenuItem
          href="/roadmap"
          icon={<MenuIcons.roadmap size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
          isActive={isActive("/roadmap")}
        >
          ロードマップ
        </SidebarMenuItem>

        <SidebarMenuItem
          href="/process"
          icon={<MenuIcons.process size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
          isActive={isActive("/process")}
        >
          プロセス
        </SidebarMenuItem>

        <SidebarMenuItem
          href="/guides"
          icon={<MenuIcons.guide size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
          isActive={isActive("/guides")}
        >
          ガイド
        </SidebarMenuItem>
      </SidebarMenuGroup>

      {/* コミュニティ */}
      <SidebarMenuGroup label="コミュニティ" itemGap>
        <SidebarMenuItem
          href="/community/questions"
          icon={<MenuIcons.question size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
          isActive={isActive("/community/questions")}
        >
          みんなの掲示板
        </SidebarMenuItem>

        <SidebarMenuItem
          href="/feedbacks"
          icon={<MenuIcons.feedback size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
          isActive={isActive("/feedbacks")}
        >
          フィードバック
        </SidebarMenuItem>

        <SidebarMenuItem
          href="/members"
          icon={<MenuIcons.community size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
          isActive={isActive("/members")}
        >
          受講者
        </SidebarMenuItem>
      </SidebarMenuGroup>

      <SidebarMenuGroup label="その他" itemGap>
        {!user && (
          <SidebarMenuItem
            href="/login"
            icon={<MenuIcons.login size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
            isActive={isActive("/login")}
          >
            ログイン
          </SidebarMenuItem>
        )}
        {user && (
          <SidebarMenuItem
            href="/account"
            icon={<MenuIcons.settings size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
            isActive={isActive("/account")}
          >
            設定
          </SidebarMenuItem>
        )}
        {user && (
          <SidebarMenuItem
            href="#"
            icon={<MenuIcons.logout size={ICON_SIZE} color="var(--text-primary)" variant="Outline" />}
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
