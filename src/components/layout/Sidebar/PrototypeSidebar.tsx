"use client";

/**
 * コース／ロードマップのプロト用サイドバー（#243・使い捨て）
 *
 * /dev/course-pages 配下だけで、本番の Sidebar の代わりに描く。
 * placement の「01 サイドナビの並び」を実物の部品（SidebarLogo / SidebarSearchBox /
 * SidebarMenuGroup / SidebarMenuItem）で組んだもの。本番のメニューは変えない。
 * - 一番上: トップ（続きから）→ コース → ロードマップ（目的から選ぶ）
 * - 次: レッスン → 掲示板 → イベント → マイページ（記録・お気に入り・設定）
 *   （#243 トピック2: 会員のトップを「続きから」にし、マイページは記録の場所へ下げる）
 * - サブ・その他: 本番と同じ（イベントは上へ移したので除く）
 * 行き先はプロトのページ（会員のトップ・マイページ・コース一覧・ロードマップ一覧）。
 * 本番バンドルに course-pages のデータを持ち込まないよう、パスは文字列で持つ。
 * プロトを片付けるときは、このファイルと index.tsx の分岐を消す。
 */

import { Book1, Home2 } from "iconsax-react";
import { withPricingFrom } from "@/lib/activity-utils";
import { trackPricingCtaClick } from "@/lib/activity-client";
import { cn } from "@/lib/utils";
import { SidebarLogo } from "./SidebarLogo";
import SidebarSearchBox from "./SidebarSearchBox";
import { SidebarMenuGroup } from "./SidebarMenuGroup";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { MenuIcons } from "./icons";
import { ICON_SIZE } from "./icon-utils";
import type { SidebarProps } from "./types";

export const COURSE_PROTO_PREFIX = "/dev/course-pages";

const ROADMAP = `${COURSE_PROTO_PREFIX}/prototyping/roadmap`;
const APPLIED = `${ROADMAP}/applied`;
const OLD_BONO_URL = "https://legacy.bo-no.design";

const HREF = {
  mypage: `${APPLIED}/mypage`,
  course: COURSE_PROTO_PREFIX,
  roadmap: `${ROADMAP}/list`,
  top: `${APPLIED}/home`,
} as const;

type ProtoKey = "mypage" | "course" | "roadmap" | "top" | null;

/** 現在地。ロードマップ → マイページ → トップ → コース の順に判定する（コースが全部で光らないように） */
function protoActiveKey(pathname: string): ProtoKey {
  if (pathname.startsWith(`${APPLIED}/mypage`) || pathname === `${COURSE_PROTO_PREFIX}/v2/mypage`) return "mypage";
  if (pathname.startsWith(`${APPLIED}/home`) || pathname.startsWith(`${APPLIED}/top`)) return "top";
  // 修了画面はコースの一部として扱う
  if (pathname.startsWith(`${APPLIED}/course-complete`)) return "course";
  // ロードマップの一覧・詳細（ハブ・placement・applied は「見せ方の検討ページ」なので光らせない）
  if (pathname.startsWith(`${ROADMAP}/`)) {
    const rest = pathname.slice(ROADMAP.length + 1);
    if (rest.startsWith("placement") || rest.startsWith("applied") || rest.startsWith("flow")) return null;
    return "roadmap";
  }
  if (pathname.startsWith(`${COURSE_PROTO_PREFIX}/prototyping`)) return null;
  // コース一覧（/dev/course-pages）・v1/v2 のコース詳細
  return "course";
}

/** ラベルの下に役割を小さく書く（モック 01 の sub） */
function Label({ main, sub }: { main: string; sub: string }) {
  return (
    <span className="flex flex-col gap-1">
      <span>{main}</span>
      <span className="text-[10px] font-medium text-text-muted">{sub}</span>
    </span>
  );
}

export function PrototypeSidebar({
  className,
  user,
  notificationSlot,
  boardDotSlot,
  pathname,
}: SidebarProps & { pathname: string }) {
  const active = protoActiveKey(pathname);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const icon = { size: ICON_SIZE, color: "#2F3037", variant: "Outline" as const };

  return (
    <nav
      className={cn("w-[200px] h-full inline-flex flex-col justify-start items-start gap-4", className)}
      role="navigation"
      aria-label="メインナビゲーション"
    >
      <div className="w-full flex flex-col items-start">
        <div className="relative w-full">
          <SidebarLogo />
          {notificationSlot && (
            <div className="absolute right-[15px] top-1/2 -translate-y-1/2">{notificationSlot}</div>
          )}
        </div>
        <SidebarSearchBox />
      </div>

      {/* プロトでは未ログインでも会員のトップ（モック）を見られるようにする */}
      <SidebarMenuGroup>
        <SidebarMenuItem href={HREF.top} icon={<Home2 {...icon} />} isActive={active === "top"}>
          <Label main="トップ" sub="続きから" />
        </SidebarMenuItem>
        <SidebarMenuItem href={HREF.course} icon={<Book1 {...icon} />} isActive={active === "course"}>
          コース
        </SidebarMenuItem>
        <SidebarMenuItem href={HREF.roadmap} icon={<MenuIcons.roadmap {...icon} />} isActive={active === "roadmap"}>
          <Label main="ロードマップ" sub="目的から選ぶ" />
        </SidebarMenuItem>
      </SidebarMenuGroup>

      <SidebarMenuGroup>
        <SidebarMenuItem href="/lessons" icon={<MenuIcons.lesson {...icon} />} isActive={isActive("/lessons")}>
          レッスン
        </SidebarMenuItem>
        <SidebarMenuItem
          href="/questions"
          icon={<MenuIcons.question {...icon} />}
          isActive={isActive("/questions")}
          dot={boardDotSlot}
        >
          掲示板
        </SidebarMenuItem>
        <SidebarMenuItem href="/events" icon={<MenuIcons.events {...icon} />} isActive={isActive("/events")}>
          イベント
        </SidebarMenuItem>
        <SidebarMenuItem href={HREF.mypage} icon={<MenuIcons.mypage {...icon} />} isActive={active === "mypage"}>
          <Label main="マイページ" sub="記録・お気に入り・設定" />
        </SidebarMenuItem>
      </SidebarMenuGroup>

      <SidebarMenuGroup label="サブ">
        <SidebarMenuItem href="/guide" icon={<MenuIcons.guide {...icon} />} isActive={isActive("/guide")}>
          読みもの
        </SidebarMenuItem>
        <SidebarMenuItem
          href="/achievements"
          icon={<MenuIcons.achievements {...icon} />}
          isActive={isActive("/achievements")}
        >
          みんなの実績
        </SidebarMenuItem>
        <SidebarMenuItem href="/how-to" icon={<MenuIcons.howto {...icon} />} isActive={isActive("/how-to")}>
          使い方
        </SidebarMenuItem>
      </SidebarMenuGroup>

      <SidebarMenuGroup label="その他" className="lg:mt-auto lg:pb-6">
        <SidebarMenuItem
          href={withPricingFrom("/subscription", "nav")}
          onClick={() => trackPricingCtaClick("nav")}
          icon={<MenuIcons.pricing {...icon} />}
          isActive={isActive("/subscription")}
        >
          料金プラン
        </SidebarMenuItem>
        <SidebarMenuItem href="/training" icon={<MenuIcons.training {...icon} />} isActive={isActive("/training")}>
          トレーニング
        </SidebarMenuItem>
        {!user && (
          <SidebarMenuItem href="/login" icon={<MenuIcons.login {...icon} />} isActive={isActive("/login")}>
            ログイン
          </SidebarMenuItem>
        )}
        {user && (
          <SidebarMenuItem href="/account" icon={<MenuIcons.settings {...icon} />} isActive={isActive("/account")}>
            設定
          </SidebarMenuItem>
        )}
        <SidebarMenuItem href={OLD_BONO_URL} icon={<MenuIcons.share {...icon} />} isActive={false}>
          旧サイト
        </SidebarMenuItem>
      </SidebarMenuGroup>
    </nav>
  );
}
