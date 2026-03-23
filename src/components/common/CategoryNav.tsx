import { Link, useLocation } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface CategoryNavItem {
  /** リンクラベル */
  label: string;
  /** リンク先URL */
  href: string;
  /** アイコン（Lucide React）*/
  icon?: LucideIcon;
  /** アイテム数（任意） */
  count?: number;
}

interface CategoryNavProps {
  /** ナビゲーションアイテム */
  items: CategoryNavItem[];
  /** 追加のクラス名 */
  className?: string;
  /** sticky配置にするか（デフォルト: false） */
  sticky?: boolean;
}

/**
 * カテゴリナビゲーションコンポーネント
 *
 * URL遷移型のタブナビゲーション
 * - アクティブ状態は現在のパスから自動判定
 * - アンダーライン型のスタイル
 * - アイコン表示対応（Lucide React）
 * - カウント表示対応
 *
 * @example
 * ```tsx
 * import { Rocket, Target, BookOpen } from "lucide-react";
 *
 * <CategoryNav
 *   items={[
 *     { label: "すべて", href: "/roadmaps" },
 *     { label: "転職したい", href: "/roadmaps/career", icon: Rocket, count: 2 },
 *     { label: "UXを学ぶ", href: "/roadmaps/ux", icon: Target },
 *   ]}
 * />
 * ```
 */
export default function CategoryNav({
  items,
  className,
  sticky = false,
}: CategoryNavProps) {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // アクティブ判定（完全一致 or パス先頭一致）
  const isActive = (href: string) => {
    // 完全一致
    if (location.pathname === href) return true;
    // "すべて"以外は前方一致でも判定（サブページ対応）
    if (href !== items[0]?.href && location.pathname.startsWith(href + "/")) {
      return true;
    }
    return false;
  };

  // アクティブタブの位置を計算してインジケーターを移動
  useEffect(() => {
    const activeIndex = items.findIndex((item) => isActive(item.href));
    const activeElement = itemRefs.current[activeIndex];
    const navElement = navRef.current;

    if (activeElement && navElement) {
      const navRect = navElement.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();
      setIndicatorStyle({
        left: activeRect.left - navRect.left,
        width: activeRect.width,
      });
    }
  }, [location.pathname, items]);

  return (
    <nav
      className={cn(
        "border-b border-gray-200 overflow-x-auto relative",
        sticky && "sticky top-16 z-10 bg-inherit pt-4 -mx-4 px-4 sm:mx-0 sm:px-0",
        className
      )}
    >
      <div ref={navRef} className="flex gap-4 min-w-max">
        {items.map((item, index) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              ref={(el) => (itemRefs.current[index] = el)}
              className={cn(
                "pb-3 md:px-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5",
                active
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
              {item.count !== undefined && (
                <span
                  className={cn(
                    "ml-1 text-xs font-normal px-2 py-0.5 rounded-full",
                    active ? "bg-black text-white" : "bg-gray-100 text-gray-500"
                  )}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      {/* スライドするインジケーター */}
      <div
        className="absolute bottom-0 h-0.5 bg-black rounded-full transition-all duration-300 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />
    </nav>
  );
}
