"use client";

import Link from "next/link";
import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRight } from "lucide-react";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  /**
   * デスクトップで「サイドバーを復活」させる用途など、
   * 閉じている時（isOpen=false）に BONO ロゴを表示したい場合に使用
   */
  showLogoWhenClosed?: boolean;
}

/**
 * MobileMenuButton コンポーネント
 * スマホ表示時のハンバーガーメニューボタン
 */
const MobileMenuButton = ({ isOpen, onClick, showLogoWhenClosed = false }: MobileMenuButtonProps) => {
  const showLogo = !isOpen && showLogoWhenClosed;

  if (showLogo) {
    return (
      <div className="flex w-fit items-center gap-3 pl-4 pr-2 py-2 bg-white border border-gray-200 rounded-[20px] shadow-sm">
        <Link href="/" aria-label="トップへ" className="flex items-center">
          <Logo className="w-[67.51px] h-5" />
        </Link>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClick}
            aria-label="メニューを開く"
            className="h-9 w-9 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-black/5"
          >
            <PanelLeft size={20} />
          </Button>
        </div>
      </div>
    );
  }

  // 開いている状態（=閉じる導線）は「アイコンだけ」を確実に出す
  if (isOpen) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        aria-label="メニューを閉じる"
        className="h-10 w-10 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-black/5"
      >
        <PanelRight size={20} />
      </Button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={
        "flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
      }
      aria-label="メニューを開く"
    >
      <PanelLeft size={20} className="text-gray-600" />
      <span className="text-sm font-medium text-gray-700">一覧</span>
    </button>
  );
};

export default MobileMenuButton;
