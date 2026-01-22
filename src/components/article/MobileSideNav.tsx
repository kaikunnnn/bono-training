import { useEffect } from "react";
import ArticleSideNavNew from "./sidebar/ArticleSideNavNew";
import type { ArticleWithContext } from "@/types/sanity";
import { ICON_SIZES, SidebarRight } from "@/lib/icons";

type SideNavDisplay = "mobile" | "desktop";

interface MobileSideNavProps {
  isOpen: boolean;
  onClose: () => void;
  article: ArticleWithContext;
  currentArticleId: string;
  progressUpdateTrigger?: number;
  /** 表示対象: mobile(〜md) / desktop(md〜) */
  display?: SideNavDisplay;
  /**
   * デスクトップ用: 「サイドバー表示に戻す」などの導線
   * 指定された場合、メニュー内に復帰ボタンを表示する
   */
  onRestoreSidebar?: () => void;
}

/**
 * MobileSideNav コンポーネント
 * スマホ用のスライドインサイドナビ
 *
 * 仕様:
 * - 画面左からスライドイン
 * - オーバーレイ背景（クリックで閉じる）
 * - 閉じるボタン
 * - ArticleSideNavNewを使用（PC版と統一）
 */
const MobileSideNav = ({
  isOpen,
  onClose,
  article,
  currentArticleId,
  progressUpdateTrigger,
  display = "mobile",
  onRestoreSidebar,
}: MobileSideNavProps) => {
  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ESCキーで閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const visibilityClass = display === "mobile" ? "md:hidden" : "hidden md:block";

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${visibilityClass} ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* サイドナビパネル */}
      <div
        className={`fixed top-0 left-0 h-full w-[300px] max-w-[85vw] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-out ${visibilityClass} ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition z-10"
          aria-label="メニューを閉じる"
        >
          <SidebarRight size={ICON_SIZES.lg} variant="Linear" className="text-gray-600" color="currentColor" />
        </button>

        {/* サイドナビコンテンツ */}
        <div className="h-full overflow-y-auto">
          {onRestoreSidebar && (
            <div className="px-4 pt-4">
              <button
                onClick={onRestoreSidebar}
                className="w-full flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition text-sm font-medium text-gray-700"
              >
                サイドバー表示に戻す
              </button>
            </div>
          )}
          <ArticleSideNavNew
            article={article}
            currentArticleId={currentArticleId}
            progressUpdateTrigger={progressUpdateTrigger}
          />
        </div>
      </div>
    </>
  );
};

export default MobileSideNav;
