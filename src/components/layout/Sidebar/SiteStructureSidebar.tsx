"use client";

/**
 * 新しいトップの試作用サイドバー（#267・使い捨て）
 *
 * /dev/site-structure/top 配下だけで、本番の Sidebar の代わりに描く。
 * 並びは 267-L 7章のグローバルナビ案。本番のメニューは変えない。
 * - ログイン中だけ: マイページ（続きから）
 * - 主: トップ／ロードマップ／悩みから探す／コース／掲示板
 * - 人と学ぶ: フィードバック／イベント／みんなの実績
 * - サブ: 勉強法・キャリア／使い方
 * - その他: 料金プラン（未ログインだけ）／ログイン または 設定
 * - 本番から外したもの: レッスン／トレーニング／旧サイト
 *
 * 未ログイン／会員は本当のログイン状態ではなく URL の ?state=member で決める（試作の見比べ用）。
 * useSearchParams はルートのレイアウトから呼ばれるので Suspense で包み、読めない間は未ログインの並びを出す。
 * 片付けるときは、このファイルと index.tsx の分岐を消す。
 */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Book1,
  Calendar2,
  DocumentText,
  EmptyWallet,
  Home2,
  Lamp,
  Login,
  Map,
  Medal,
  MessageQuestion,
  Messages1,
  Setting2,
  Teacher,
  User,
} from "iconsax-react";
import { cn } from "@/lib/utils";
import { SidebarLogo } from "./SidebarLogo";
import SidebarSearchBox from "./SidebarSearchBox";
import { SidebarMenuGroup } from "./SidebarMenuGroup";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { ICON_SIZE } from "./icon-utils";
import type { SidebarProps } from "./types";

export const SITE_STRUCTURE_TOP_PREFIX = "/dev/site-structure/top";

const COMING = `${SITE_STRUCTURE_TOP_PREFIX}/coming`;

/** 試作の中のリンクには会員の見え方を引き継ぐ（本番ページへのリンクはそのまま） */
function protoHref(href: string, member: boolean) {
  if (!member) return href;
  return href.includes("?") ? `${href}&state=member` : `${href}?state=member`;
}

/** ラベルの下に役割を小さく書く（PrototypeSidebar と同じ形） */
function Label({ main, sub }: { main: string; sub: string }) {
  return (
    <span className="flex flex-col gap-1">
      <span>{main}</span>
      <span className="text-[10px] font-medium text-text-muted">{sub}</span>
    </span>
  );
}

type NavProps = Omit<SidebarProps, "user"> & { pathname: string };

function SiteStructureNav({
  className,
  notificationSlot,
  boardDotSlot,
  pathname,
  member,
  troublesActive,
}: NavProps & { member: boolean; troublesActive: boolean }) {
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  // 色は SidebarMenuItem のアイコン枠（text-text-primary）から受け継ぐ
  const icon = { size: ICON_SIZE, color: "currentColor", variant: "Outline" as const };

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

      {member && (
        <SidebarMenuGroup>
          <SidebarMenuItem href="/mypage" icon={<User {...icon} />} isActive={isActive("/mypage")}>
            <Label main="マイページ" sub="続きから" />
          </SidebarMenuItem>
        </SidebarMenuGroup>
      )}

      <SidebarMenuGroup>
        <SidebarMenuItem
          href={protoHref(SITE_STRUCTURE_TOP_PREFIX, member)}
          icon={<Home2 {...icon} />}
          isActive={pathname === SITE_STRUCTURE_TOP_PREFIX}
        >
          トップ
        </SidebarMenuItem>
        <SidebarMenuItem href="/roadmap" icon={<Map {...icon} />} isActive={isActive("/roadmap")}>
          ロードマップ
        </SidebarMenuItem>
        <SidebarMenuItem
          href={protoHref(`${COMING}?what=troubles`, member)}
          icon={<Lamp {...icon} />}
          isActive={troublesActive}
        >
          悩みから探す
        </SidebarMenuItem>
        <SidebarMenuItem href="/dev/course-pages" icon={<Book1 {...icon} />} isActive={false}>
          コース
        </SidebarMenuItem>
        <SidebarMenuItem
          href="/questions"
          icon={<MessageQuestion {...icon} />}
          isActive={isActive("/questions")}
          dot={boardDotSlot}
        >
          掲示板
        </SidebarMenuItem>
      </SidebarMenuGroup>

      <SidebarMenuGroup label="人と学ぶ">
        <SidebarMenuItem href="/how-to/feedback" icon={<Messages1 {...icon} />} isActive={false}>
          フィードバック
        </SidebarMenuItem>
        <SidebarMenuItem href="/events" icon={<Calendar2 {...icon} />} isActive={isActive("/events")}>
          イベント
        </SidebarMenuItem>
        <SidebarMenuItem href="/achievements" icon={<Medal {...icon} />} isActive={isActive("/achievements")}>
          みんなの実績
        </SidebarMenuItem>
      </SidebarMenuGroup>

      <SidebarMenuGroup label="サブ">
        <SidebarMenuItem href="/guide" icon={<DocumentText {...icon} />} isActive={isActive("/guide")}>
          勉強法・キャリア
        </SidebarMenuItem>
        <SidebarMenuItem href="/how-to" icon={<Teacher {...icon} />} isActive={false}>
          使い方
        </SidebarMenuItem>
      </SidebarMenuGroup>

      <SidebarMenuGroup label="その他" className="lg:mt-auto lg:pb-6">
        {!member && (
          <SidebarMenuItem href="/subscription" icon={<EmptyWallet {...icon} />} isActive={false}>
            料金プラン
          </SidebarMenuItem>
        )}
        {member ? (
          <SidebarMenuItem href="/account" icon={<Setting2 {...icon} />} isActive={false}>
            設定
          </SidebarMenuItem>
        ) : (
          <SidebarMenuItem href="/login" icon={<Login {...icon} />} isActive={false}>
            ログイン
          </SidebarMenuItem>
        )}
      </SidebarMenuGroup>
    </nav>
  );
}

function SiteStructureNavFromUrl(props: NavProps) {
  const searchParams = useSearchParams();
  return (
    <SiteStructureNav
      {...props}
      member={searchParams?.get("state") === "member"}
      troublesActive={props.pathname === COMING && searchParams?.get("what") === "troubles"}
    />
  );
}

export function SiteStructureSidebar({ user: _user, ...props }: SidebarProps & { pathname: string }) {
  void _user; // 試作では本当のログイン状態を使わず、URL で見え方を決める
  return (
    <Suspense fallback={<SiteStructureNav {...props} member={false} troublesActive={false} />}>
      <SiteStructureNavFromUrl {...props} />
    </Suspense>
  );
}
