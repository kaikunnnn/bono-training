"use client";

import { usePathname } from "next/navigation";
import { Activity, Home2, People } from "iconsax-react";
import { cn } from "@/lib/utils";
import { SidebarLogo } from "@/components/layout/Sidebar/SidebarLogo";
import SidebarSearchBox from "@/components/layout/Sidebar/SidebarSearchBox";
import { SidebarMenuGroup } from "@/components/layout/Sidebar/SidebarMenuGroup";
import { SidebarMenuItem } from "@/components/layout/Sidebar/SidebarMenuItem";
import { MenuIcons } from "@/components/layout/Sidebar/icons";
import { ICON_SIZE } from "@/components/layout/Sidebar/icon-utils";
import { DT_FEED, DT_MYPAGE, DT_SQUAD } from "./data";

// 旧BONOサイト（Webflow）。本物の Sidebar と同じ
const OLD_BONO_URL = "https://legacy.bo-no.design";

/**
 * 左サイドナビの複製（src/components/layout/Sidebar/index.tsx をコピーして最小変更・#253）。
 *
 * 中の部品（SidebarLogo / SidebarSearchBox / SidebarMenuGroup / SidebarMenuItem / MenuIcons）は本物をそのまま使う。
 * 本物から変えたのは次だけ:
 * - ログイン中の想定で常に「マイページ」を出し、リンク先をプロトのマイページにした
 * - 「いっしょに」グループ（フィード / 仲間グループ）を足した（リンク先は /dev/design-together 配下）
 * - 通知ベル・掲示板の新着ドット・料金プランの計測を外した
 *
 * 本物の Sidebar は root layout から出ていて触れないため、同じ位置（左上・幅200px）に body 直下で重ねて隠す。
 * 本物は背景が透明でヘッダーのグラデーションが透けているので、同じグラデーションを敷いてから重ねる。
 * PC幅（lg 以上）だけ。モバイルのハンバーガーの中は本物のまま。
 */
export function ProtoSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[200px] z-20 bg-[var(--bg-base)]">
      {/* 本物の Layout のヘッダーグラデーション（Layout.tsx からコピー。h-[148px] は /dev 配下の値） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[148px]"
        style={{
          background:
            "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
        }}
      />
      <nav
        className={cn("relative w-[200px] h-full inline-flex flex-col justify-start items-start gap-4")}
        role="navigation"
        aria-label="メインナビゲーション（プロト用の複製）"
      >
        <div className="w-full flex flex-col items-start">
          <div className="relative w-full">
            <SidebarLogo />
          </div>
          <SidebarSearchBox />
        </div>

        <SidebarMenuGroup>
          <SidebarMenuItem
            href={DT_MYPAGE}
            icon={<MenuIcons.mypage size={ICON_SIZE} color="#2F3037" variant="Outline" />}
            isActive={isActive(DT_MYPAGE)}
          >
            マイページ
          </SidebarMenuItem>

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

        {/* #253: いっしょにデザインで足すグループ */}
        <SidebarMenuGroup label="いっしょに">
          <SidebarMenuItem
            href={DT_FEED}
            icon={<Activity size={ICON_SIZE} color="#2F3037" variant="Outline" />}
            isActive={isActive(DT_FEED)}
          >
            フィード
          </SidebarMenuItem>
          <SidebarMenuItem
            href={DT_SQUAD}
            icon={<People size={ICON_SIZE} color="#2F3037" variant="Outline" />}
            isActive={isActive(DT_SQUAD)}
          >
            仲間グループ
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
            href="/events"
            icon={<MenuIcons.events size={ICON_SIZE} color="#2F3037" variant="Outline" />}
            isActive={isActive("/events")}
          >
            イベント
          </SidebarMenuItem>
          <SidebarMenuItem
            href="/how-to"
            icon={<MenuIcons.howto size={ICON_SIZE} color="#2F3037" variant="Outline" />}
            isActive={isActive("/how-to")}
          >
            使い方
          </SidebarMenuItem>
        </SidebarMenuGroup>

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
          <SidebarMenuItem
            href="/account"
            icon={<MenuIcons.settings size={ICON_SIZE} color="#2F3037" variant="Outline" />}
            isActive={isActive("/account")}
          >
            設定
          </SidebarMenuItem>
          <SidebarMenuItem
            href={OLD_BONO_URL}
            icon={<MenuIcons.share size={ICON_SIZE} color="#2F3037" variant="Outline" />}
            isActive={false}
          >
            旧サイト
          </SidebarMenuItem>
        </SidebarMenuGroup>
      </nav>
    </aside>
  );
}
