import { useEffect } from "react";
import { X } from "lucide-react";
import ArticleSideNav from "./sidebar/ArticleSideNav";
import type { ArticleWithContext } from "@/types/sanity";

interface MobileSideNavProps {
  isOpen: boolean;
  onClose: () => void;
  article: ArticleWithContext;
  currentArticleId: string;
  progressUpdateTrigger?: number;
}

/**
 * MobileSideNav コンポーネント
 * スマホ用のスライドインサイドナビ
 *
 * 仕様:
 * - 画面左からスライドイン
 * - オーバーレイ背景（クリックで閉じる）
 * - 閉じるボタン
 * - ArticleSideNavをそのまま使用
 */
const MobileSideNav = ({
  isOpen,
  onClose,
  article,
  currentArticleId,
  progressUpdateTrigger,
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

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* サイドナビパネル */}
      <div
        className={`fixed top-0 left-0 h-full w-[300px] max-w-[85vw] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition z-10"
          aria-label="メニューを閉じる"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* サイドナビコンテンツ */}
        <div className="h-full overflow-y-auto">
          <ArticleSideNav
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
