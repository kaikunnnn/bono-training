import React from "react";
import { useLocation } from "react-router-dom";
import { SidebarProps } from "./types";
import { cn } from "@/lib/utils";
import SidebarLogo from "./SidebarLogo";
import SidebarSearch from "./SidebarSearch";
import SidebarMenuGroup from "./SidebarMenuGroup";
import SidebarMenuItem from "./SidebarMenuItem";
import { MenuIcons } from "./icons";
import { ICON_SIZE } from "./icon-utils";
import { useAuth } from "@/contexts/AuthContext";

/**
 * サイドバーコンポーネント
 * Figma仕様:
 * - 幅: 240px（固定）
 * - 背景: #ffffff
 * - レイアウト: flexbox（縦並び）
 */
const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const { user } = useAuth();

  // 現在のパスがメニュー項目のhrefと一致するかチェック
  const isActive = (href: string) => location.pathname === href;

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    // TODO: 検索機能の実装
  };

  return (
    <nav
      className={cn(
        "flex flex-col items-center w-60 h-screen bg-white",
        className
      )}
      role="navigation"
      aria-label="メインナビゲーション"
    >
      {/* 上部コンテンツグループ */}
      <div className="flex flex-col w-full">
        {/* トップセクション */}
        <div className="flex flex-col w-full gap-4 pt-2">
          {/* ロゴ */}
          <SidebarLogo />

          {/* 検索 */}
          <SidebarSearch onSearch={handleSearch} />

          {/* ユーザーメニュー */}
          <SidebarMenuGroup>
            <SidebarMenuItem
              href={user ? "/profile" : "/auth"}
              icon={
                user ? (
                  <MenuIcons.mypage size={ICON_SIZE} />
                ) : (
                  <MenuIcons.login size={ICON_SIZE} />
                )
              }
              isActive={isActive(user ? "/profile" : "/auth")}
            >
              {user ? "マイページ" : "ログイン"}
            </SidebarMenuItem>
          </SidebarMenuGroup>
        </div>

        {/* メインメニュー */}
        <SidebarMenuGroup label="メイン">
          <SidebarMenuItem
            href="/roadmap"
            icon={<MenuIcons.roadmap size={ICON_SIZE} />}
            isActive={isActive("/roadmap")}
          >
            ロードマップ
          </SidebarMenuItem>
          <SidebarMenuItem
            href="/lessons"
            icon={<MenuIcons.lesson size={ICON_SIZE} />}
            isActive={isActive("/lessons")}
          >
            レッスン
          </SidebarMenuItem>
          <SidebarMenuItem
            href="/guide"
            icon={<MenuIcons.guide size={ICON_SIZE} />}
            isActive={isActive("/guide")}
          >
            ガイド
          </SidebarMenuItem>
          <SidebarMenuItem
            href="/training"
            icon={<MenuIcons.training size={ICON_SIZE} />}
            isActive={isActive("/training")}
          >
            トレーニング
          </SidebarMenuItem>
        </SidebarMenuGroup>
      </div>

      {/* その他メニュー（下部固定） */}
      <div className="mt-auto w-full">
        <SidebarMenuGroup label="その他">
          <SidebarMenuItem
            href="/settings"
            icon={<MenuIcons.settings size={ICON_SIZE} />}
            isActive={isActive("/settings")}
          >
            設定
          </SidebarMenuItem>
        </SidebarMenuGroup>
      </div>
    </nav>
  );
};

export default Sidebar;
