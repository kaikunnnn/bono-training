/**
 * ロードマップ詳細 - セクションナビゲーション
 *
 * Heroの下に配置し、各セクションへジャンプするためのナビゲーション
 * Figma: PRD🏠_Roadmap_2026 node-id 102-13781
 */

import { ChevronRight } from "lucide-react";

// ============================================
// 型定義
// ============================================

export interface SectionNavItem {
  /** セクションID（アンカーリンク用） */
  id: string;
  /** 表示ラベル */
  label: string;
}

interface SectionNavProps {
  /** ナビゲーションアイテム */
  items: SectionNavItem[];
}

interface NavItemProps {
  /** セクションID */
  id: string;
  /** 表示ラベル */
  label: string;
  /** クリック時のコールバック */
  onClick: () => void;
}

// ============================================
// サブコンポーネント
// ============================================

/**
 * ナビゲーションアイテム
 * Figma: node-id 97-11635
 */
function NavItem({ label, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-2 px-4 py-1 border border-black/[0.12] rounded-[50px] hover:bg-gray-50 hover:border-black/20 transition-colors text-left group flex-1 min-w-0"
    >
      {/* ラベル */}
      <span className="text-[14px] font-medium text-[#0f172a] leading-[33px] truncate">
        {label}
      </span>

      {/* 矢印アイコン（下向き = 90度回転） */}
      <span className="shrink-0 w-3 h-3 flex items-center justify-center">
        <ChevronRight className="w-3 h-3 text-gray-400 rotate-90 group-hover:text-gray-600 transition-colors" />
      </span>
    </button>
  );
}

// ============================================
// メインコンポーネント
// ============================================

export default function SectionNav({ items }: SectionNavProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav aria-label="ページ内ナビゲーション" className="pt-8 pb-10 px-4 md:px-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-col md:flex-row gap-4 md:gap-5">
          {items.map((item) => (
            <NavItem
              key={item.id}
              id={item.id}
              label={item.label}
              onClick={() => scrollToSection(item.id)}
            />
          ))}
        </div>
        {/* 区切り線 */}
        <div className="mt-10 border-t border-black/[0.08]" />
      </div>
    </nav>
  );
}
