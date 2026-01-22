import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { ICON_SIZES, SidebarLeft, SidebarRight } from "@/lib/icons";

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
 *
 * 仕様:
 * - アイコン + 「一覧」テキスト
 * - 開閉状態でアイコン切り替え（Menu ↔ X）
 */
const MobileMenuButton = ({ isOpen, onClick, showLogoWhenClosed = false }: MobileMenuButtonProps) => {
  const showLogo = !isOpen && showLogoWhenClosed;

  if (showLogo) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
        <Link to="/" aria-label="トップへ" className="flex items-center">
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
            <SidebarLeft size={ICON_SIZES.lg} variant="Linear" color="currentColor" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={
        isOpen
          ? "flex items-center justify-center p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
          : "flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
      }
      aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
    >
      {isOpen ? (
        <SidebarRight size={ICON_SIZES.lg} variant="Linear" className="text-gray-600" color="currentColor" />
      ) : (
        <SidebarLeft size={ICON_SIZES.lg} variant="Linear" className="text-gray-600" color="currentColor" />
      )}
      {!isOpen && <span className="text-sm font-medium text-gray-700">一覧</span>}
    </button>
  );
};

export default MobileMenuButton;
