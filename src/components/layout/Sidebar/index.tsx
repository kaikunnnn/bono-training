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
import { DirectInbox } from "iconsax-react";
import { Button } from "@/components/ui/button";

// 意見箱のリンク先URL（開発環境のみ）
const FEEDBACK_URL = 'https://forms.gle/Y5LorStnPm4jzFv77';

/**
 * サイドバーコンポーネント
 * 仕様:
 * - 幅: 200px（固定）
 * - 背景: 透過（ページ背景と同化）
 * - 高さ: 100%（デスクトップ時）
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
        "w-[200px] h-full inline-flex flex-col justify-start items-start gap-4",
        className
      )}
      role="navigation"
      aria-label="メインナビゲーション"
    >
      {/* ロゴセクション */}
      <SidebarLogo />

      {/* メインナビゲーション */}
      <SidebarMenuGroup>
        {/* マイページ（ログイン時のみ表示） */}
        {user && (
          <SidebarMenuItem
            href="/mypage"
            icon={<MenuIcons.mypage size={ICON_SIZE} variant="Outline"  />}
            isActive={isActive("/mypage")}
          >
            マイページ
          </SidebarMenuItem>
        )}

        {/* ロードマップ */}
        <SidebarMenuItem
          href="/roadmap"
          icon={<MenuIcons.roadmap size={ICON_SIZE} variant="Outline"  />}
          isActive={isActive("/roadmap")}
        >
          ロードマップ
        </SidebarMenuItem>

        {/* レッスン */}
        <SidebarMenuItem
          href="/lessons"
          icon={<MenuIcons.lesson size={ICON_SIZE} variant="Outline"  />}
          isActive={isActive("/lessons")}
        >
          レッスン
        </SidebarMenuItem>

        {/* ガイド */}
        <SidebarMenuItem
          href="/guide"
          icon={<MenuIcons.guide size={ICON_SIZE} variant="Outline"  />}
          isActive={isActive("/guide")}
        >
          ガイド
        </SidebarMenuItem>

        {/* トレーニング */}
        <SidebarMenuItem
          href="/training"
          icon={<MenuIcons.training size={ICON_SIZE} variant="Outline"  />}
          isActive={isActive("/training")}
        >
          トレーニング
        </SidebarMenuItem>
      </SidebarMenuGroup>

      {/* その他メニュー */}
      <SidebarMenuGroup label="その他" itemGap>
        {/* ログイン（ログオフ時のみ表示） */}
        {!user && (
          <SidebarMenuItem
            href="/login"
            icon={<MenuIcons.login size={ICON_SIZE} variant="Outline"  />}
            isActive={isActive("/login")}
          >
            ログイン
          </SidebarMenuItem>
        )}
        {/* 設定（ログイン時のみ表示） */}
        {user && (
          <SidebarMenuItem
            href="/account"
            icon={<MenuIcons.settings size={ICON_SIZE} variant="Outline"  />}
            isActive={isActive("/account")}
          >
            設定
          </SidebarMenuItem>
        )}
        {/* ログアウト（ログイン時のみ表示） */}
        {user && (
          <SidebarMenuItem
            href="#"
            icon={<MenuIcons.logout size={ICON_SIZE} variant="Outline"  />}
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

      {/* 意見箱（開発環境のみ・モバイル用） */}
      {import.meta.env.DEV && (
        <div className="mt-auto pt-4 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1 text-xs"
            asChild
          >
            <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">
              <DirectInbox size={14} />
              意見箱
            </a>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;
