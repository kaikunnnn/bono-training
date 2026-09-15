"use client";

import { usePathname } from "next/navigation";
import { SidebarProps } from "./types";
import { cn } from "@/lib/utils";
import { SidebarLogo } from "./SidebarLogo";
import SidebarSearchBox from "./SidebarSearchBox";
import { SidebarMenuGroup } from "./SidebarMenuGroup";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { MenuIcons } from "./icons";
import { ICON_SIZE } from "./icon-utils";
import { Home2 } from "iconsax-react";

// 旧BONOサイト（Webflow）。ドメイン切替後は legacy サブドメインから提供する。
const OLD_BONO_URL = "https://legacy.bo-no.design";

/**
 * サイドバーコンポーネント
 * 仕様:
 * - 幅: 200px（固定）
 * - 背景: 透過（ページ背景と同化）
 * - 高さ: 100%（デスクトップ時）
 * - レイアウト: flexbox（縦並び）
 */
export function Sidebar({ className, user, notificationSlot, boardDotSlot }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <nav
      className={cn(
        "w-[200px] h-full inline-flex flex-col justify-start items-start gap-4",
        className
      )}
      role="navigation"
      aria-label="メインナビゲーション"
    >
      {/* ロゴ（左30px）+ 通知ベル（右端を検索バー右端=15px に揃える）→ 直下に検索 */}
      <div className="w-full flex flex-col items-start">
        <div className="relative w-full">
          <SidebarLogo />
          {notificationSlot && (
            <div className="absolute right-[15px] top-1/2 -translate-y-1/2">
              {notificationSlot}
            </div>
          )}
        </div>
        <SidebarSearchBox />
      </div>

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
          href="/top"
          icon={<Home2 size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={pathname === "/top" || pathname === "/"}
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
          href="/questions"
          icon={<MenuIcons.question size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={isActive("/questions")}
          dot={boardDotSlot}
        >
          掲示板
        </SidebarMenuItem>

        <SidebarMenuItem
          href="/lessons"
          icon={<MenuIcons.lesson size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={isActive("/lessons")}
        >
          レッスン
        </SidebarMenuItem>
      </SidebarMenuGroup>

      {/* コミュニティ - 一時的に非表示（mainと同じ） */}
      <SidebarMenuGroup label="コミュニティ" className="hidden">
        <SidebarMenuItem
          href="/feedbacks"
          icon={<MenuIcons.feedback size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={isActive("/feedbacks")}
        >
          フィードバック
        </SidebarMenuItem>
      </SidebarMenuGroup>

      <SidebarMenuGroup label="サブ">
        <SidebarMenuItem
          href="/guide"
          icon={<MenuIcons.guide size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={isActive("/guide")}
        >
          読みもの
        </SidebarMenuItem>
        <SidebarMenuItem
          href="/achievements"
          icon={<MenuIcons.achievements size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={isActive("/achievements")}
        >
          みんなの実績
        </SidebarMenuItem>
        <SidebarMenuItem
          href="/how-to"
          icon={<MenuIcons.howto size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={isActive("/how-to")}
        >
          使い方
        </SidebarMenuItem>
      </SidebarMenuGroup>

      {/* PC(lg以上)では「その他」をサイドバー下端に固定。モバイルSheet内では通常フロー */}
      <SidebarMenuGroup label="その他" className="lg:mt-auto lg:pb-6">
        <SidebarMenuItem
          href="/subscription"
          icon={<MenuIcons.pricing size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={isActive("/subscription")}
        >
          料金プラン
        </SidebarMenuItem>
        <SidebarMenuItem
          href="/training"
          icon={<MenuIcons.training size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={isActive("/training")}
        >
          トレーニング
        </SidebarMenuItem>
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
        <SidebarMenuItem
          href={OLD_BONO_URL}
          icon={<MenuIcons.share size={ICON_SIZE} color="#2F3037" variant="Outline" />}
          isActive={false}
        >
          旧サイト
        </SidebarMenuItem>
      </SidebarMenuGroup>
    </nav>
  );
}

export default Sidebar;
