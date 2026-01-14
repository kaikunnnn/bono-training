import React from "react";
import { useLocation } from "react-router-dom";
import { SidebarProps } from "./types";
import { cn } from "@/lib/utils";
import SidebarLogo from "./SidebarLogo";
import SidebarMenuGroup from "./SidebarMenuGroup";
import SidebarMenuItem from "./SidebarMenuItem";
import { MenuIcons } from "./icons";
import { ICON_SIZE } from "./icon-utils";
import { useAuth } from "@/contexts/AuthContext";

/**
 * サイドバーコンポーネント
 * 仕様:
 * - 幅: 200px（固定）
 * - 背景: #ffffff
 * - レイアウト: flexbox（縦並び）
 */
const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  // 現在のパスがメニュー項目のhrefと一致するかチェック
  const isActive = (href: string) => location.pathname === href;

  return (
    <nav
      className={cn(
        "w-[200px] inline-flex flex-col justify-start items-start gap-4 bg-white",
        className
      )}
      role="navigation"
      aria-label="メインナビゲーション"
    >
      {/* ロゴセクション */}
      <SidebarLogo />

      {/* メインナビゲーション */}
      <SidebarMenuGroup>
        {/* マイページ / ログイン */}
        <SidebarMenuItem
          href={user ? "/mypage" : "/auth"}
          icon={
            user ? (
              <MenuIcons.mypage size={ICON_SIZE} />
            ) : (
              <MenuIcons.login size={ICON_SIZE} />
            )
          }
          isActive={isActive(user ? "/mypage" : "/auth")}
        >
          {user ? "マイページ" : "ログイン"}
        </SidebarMenuItem>

        {/* ロードマップ */}
        <SidebarMenuItem
          href="/roadmap"
          icon={<MenuIcons.roadmap size={ICON_SIZE} />}
          isActive={isActive("/roadmap")}
        >
          ロードマップ
        </SidebarMenuItem>

        {/* レッスン */}
        <SidebarMenuItem
          href="/lessons"
          icon={<MenuIcons.lesson size={ICON_SIZE} />}
          isActive={isActive("/lessons")}
        >
          レッスン
        </SidebarMenuItem>

        {/* ガイド */}
        <SidebarMenuItem
          href="/guide"
          icon={<MenuIcons.guide size={ICON_SIZE} />}
          isActive={isActive("/guide")}
        >
          ガイド
        </SidebarMenuItem>

        {/* トレーニング */}
        <SidebarMenuItem
          href="/training"
          icon={<MenuIcons.training size={ICON_SIZE} />}
          isActive={isActive("/training")}
        >
          トレーニング
        </SidebarMenuItem>
      </SidebarMenuGroup>

      {/* その他メニュー */}
      <SidebarMenuGroup label="その他" itemGap>
        <SidebarMenuItem
          href="/account"
          icon={<MenuIcons.settings size={ICON_SIZE} />}
          isActive={isActive("/account")}
        >
          設定
        </SidebarMenuItem>
        {user && (
          <SidebarMenuItem
            href="#"
            icon={<MenuIcons.logout size={ICON_SIZE} />}
            isActive={false}
            onClick={(e) => {
              e.preventDefault();
              signOut();
            }}
          >
            ログアウト
          </SidebarMenuItem>
        )}
      </SidebarMenuGroup>
    </nav>
  );
};

export default Sidebar;
