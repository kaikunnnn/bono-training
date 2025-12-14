import { Menu, X } from "lucide-react";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

/**
 * MobileMenuButton コンポーネント
 * スマホ表示時のハンバーガーメニューボタン
 *
 * 仕様:
 * - アイコン + 「一覧」テキスト
 * - 開閉状態でアイコン切り替え（Menu ↔ X）
 */
const MobileMenuButton = ({ isOpen, onClick }: MobileMenuButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
      aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
    >
      {isOpen ? (
        <X className="w-5 h-5 text-gray-600" />
      ) : (
        <Menu className="w-5 h-5 text-gray-600" />
      )}
      <span className="text-sm font-medium text-gray-700">一覧</span>
    </button>
  );
};

export default MobileMenuButton;
