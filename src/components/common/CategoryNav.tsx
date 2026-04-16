import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  /** 配置: 左揃え or 中央揃え（デフォルト: left） */
  align?: "left" | "center";
  /** 矢印ボタンを表示するか（デフォルト: false） */
  showArrows?: boolean;
  /**
   * クエリパラメータ名を指定すると、pathname ではなくクエリパラメータでアクティブ判定する
   * 例: searchParamKey="category" → href="/guide?category=career" のとき ?category=career で判定
   */
  searchParamKey?: string;
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
  align = "left",
  showArrows = false,
  searchParamKey,
}: CategoryNavProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // 矢印ボタン用のスクロール状態
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // スクロール可能かチェック
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  // スクロールイベント監視
  useEffect(() => {
    if (!showArrows) return;
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      }
    };
  }, [checkScroll, showArrows, items]);

  // スクロール実行
  const scrollNav = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 200;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // アクティブ判定（完全一致 or パス先頭一致 or クエリパラメータ）
  const isActive = (href: string) => {
    if (searchParamKey) {
      const url = new URL(href, window.location.origin);
      const hrefParamValue = url.searchParams.get(searchParamKey);
      const currentParamValue = searchParams.get(searchParamKey);
      // "すべて"はパラメータなし
      if (!hrefParamValue) return !currentParamValue;
      return hrefParamValue === currentParamValue;
    }
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
  }, [location.pathname, location.search, items]);

  return (
    <nav
      className={cn(
        "border-b border-gray-200 relative h-full",
        sticky && "sticky top-16 z-10 bg-inherit pt-4 -mx-4 px-4 sm:mx-0 sm:px-0",
        className
      )}
    >
      <div className="relative flex items-center w-full">
        {/* 左矢印ボタン */}
        {showArrows && canScrollLeft && (
          <button
            onClick={() => scrollNav("left")}
            className="hidden md:flex absolute left-0 z-10 w-8 h-8 items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition-all"
            aria-label="左にスクロール"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* タブコンテナ */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex gap-4 overflow-x-auto scrollbar-hide w-full",
            showArrows && "px-2 md:px-10",
            align === "center" && "justify-center"
          )}
        >
          <div ref={navRef} className="relative flex gap-4 min-w-max">
            {items.map((item, index) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  ref={(el) => (itemRefs.current[index] = el)}
                  className={cn(
                    // 高さ調整: 上下16pxの余白
                    "inline-flex items-center gap-1.5 py-4 px-3 text-sm font-bold leading-none whitespace-nowrap transition-colors",
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
                        "text-xs font-normal px-1.5 py-0.5 rounded-full",
                        active ? "bg-black text-white" : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
            {/* スライドするインジケーター（タブコンテナ内） */}
            <div
              className="absolute bottom-0 h-0.5 bg-black rounded-full transition-all duration-300 ease-out"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
            />
          </div>
        </div>

        {/* 右矢印ボタン */}
        {showArrows && canScrollRight && (
          <button
            onClick={() => scrollNav("right")}
            className="hidden md:flex absolute right-0 z-10 w-8 h-8 items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition-all"
            aria-label="右にスクロール"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    </nav>
  );
}
