import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import CategoryNav from "@/components/common/CategoryNav";
import { LayoutGrid, Rocket, Target, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CategoryNav プレビューページ
 *
 * 確認用: http://localhost:5173/dev/category-nav
 */

const SAMPLE_ITEMS = [
  { label: "すべて", href: "/dev/category-nav" },
  { label: "転職・キャリアチェンジしたい", href: "/dev/category-nav/career", count: 2 },
  { label: "ユーザー目線でデザインしたい", href: "/dev/category-nav/user-design", count: 3 },
  { label: "基礎スキルを身につけたい", href: "/dev/category-nav/basic", count: 4 },
];

const SAMPLE_ITEMS_NO_COUNT = [
  { label: "すべて", href: "/dev/category-nav" },
  { label: "転職・キャリアチェンジしたい", href: "/dev/category-nav/career" },
  { label: "ユーザー目線でデザインしたい", href: "/dev/category-nav/user-design" },
];

const SAMPLE_ITEMS_WITH_ICONS = [
  { label: "すべて", href: "/dev/category-nav", icon: LayoutGrid },
  { label: "転職・キャリアチェンジしたい", href: "/dev/category-nav/career", icon: Rocket, count: 2 },
  { label: "ユーザー目線でデザインしたい", href: "/dev/category-nav/user-design", icon: Target, count: 3 },
  { label: "基礎スキルを身につけたい", href: "/dev/category-nav/basic", icon: BookOpen, count: 4 },
];

/**
 * 実験: 角丸ボーダー版（::after使用）
 */
function CategoryNavRounded({ items }: { items: typeof SAMPLE_ITEMS }) {
  const location = useLocation();
  const isActive = (href: string) => {
    if (location.pathname === href) return true;
    if (href !== items[0]?.href && location.pathname.startsWith(href + "/")) return true;
    return false;
  };

  return (
    <nav className="border-b border-gray-200">
      <div className="flex gap-4 min-w-max">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "relative pb-3 md:px-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5",
                active
                  ? "text-black font-bold"
                  : "text-gray-500 hover:text-gray-800",
                // ::after で角丸インジケーター
                "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:transition-colors",
                active
                  ? "after:bg-black"
                  : "after:bg-transparent hover:after:bg-gray-300"
              )}
            >
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
    </nav>
  );
}

/**
 * 実験: アニメーション付きスライドインジケーター
 */
function CategoryNavAnimated({ items }: { items: typeof SAMPLE_ITEMS }) {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const isActive = (href: string) => {
    if (location.pathname === href) return true;
    if (href !== items[0]?.href && location.pathname.startsWith(href + "/")) return true;
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
    <nav className="border-b border-gray-200 relative">
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

function CategoryContent() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="mt-8 p-6 bg-gray-100 rounded-lg">
      <p className="text-gray-600">
        現在のパス: <code className="bg-white px-2 py-1 rounded">{currentPath}</code>
      </p>
      <p className="text-gray-500 text-sm mt-2">
        ※ タブをクリックするとURLが変わり、アクティブ状態が切り替わります
      </p>
    </div>
  );
}

export default function CategoryNavPreview() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16 h-fit">
        <div>
          <h1 className="text-3xl font-bold mb-2">CategoryNav Preview</h1>
          <p className="text-gray-600 mb-8">
            URL遷移型カテゴリナビゲーションのプレビュー
          </p>
        </div>

        {/* 実験: 角丸ボーダー */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-green-600">
            🧪 実験A: 角丸ボーダー（::after使用）
          </h3>
          <div className="bg-white rounded-lg border p-6">
            <CategoryNavRounded items={SAMPLE_ITEMS} />
            <CategoryContent />
          </div>
        </section>

        {/* 実験: アニメーション付き */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-600">
            🧪 実験B: アニメーション付きスライド
          </h3>
          <p className="text-sm text-gray-500">タブをクリックするとインジケーターがスライドします（URL変更でも動作）</p>
          <div className="bg-white rounded-lg border p-6">
            <CategoryNavAnimated items={SAMPLE_ITEMS} />
            <CategoryContent />
          </div>
        </section>

        <hr className="border-gray-300" />

        {/* パターン1: カウント付き */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            パターン1: カウント付き（現行）
          </h3>
          <div className="bg-white rounded-lg border p-6">
            <CategoryNav items={SAMPLE_ITEMS} />
            <CategoryContent />
          </div>
        </section>

        {/* パターン2: カウントなし */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            パターン2: カウントなし
          </h3>
          <div className="bg-white rounded-lg border p-6">
            <CategoryNav items={SAMPLE_ITEMS_NO_COUNT} />
          </div>
        </section>

        {/* パターン3: アイコン付き */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            パターン3: アイコン付き（Lucide React）
          </h3>
          <div className="bg-white rounded-lg border p-6">
            <CategoryNav items={SAMPLE_ITEMS_WITH_ICONS} />
            <CategoryContent />
          </div>
        </section>

        {/* パターン4: Sticky */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">
            パターン4: Sticky（スクロールで固定）
          </h3>
          <div className="bg-[#f9f9f7] rounded-lg border p-6">
            <CategoryNav items={SAMPLE_ITEMS} sticky />
            <div className="mt-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500"
                >
                  コンテンツ {i}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 使用例コード */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">使用例</h3>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm">
{`import CategoryNav from "@/components/common/CategoryNav";
import { LayoutGrid, Rocket, Target } from "lucide-react";

// アイコンなし
const items = [
  { label: "すべて", href: "/roadmaps" },
  { label: "転職・キャリアチェンジしたい", href: "/roadmaps/career", count: 2 },
];

// アイコン付き
const itemsWithIcons = [
  { label: "すべて", href: "/roadmaps", icon: LayoutGrid },
  { label: "転職したい", href: "/roadmaps/career", icon: Rocket, count: 2 },
  { label: "UXを学ぶ", href: "/roadmaps/ux", icon: Target },
];

<CategoryNav items={items} />
<CategoryNav items={itemsWithIcons} />`}
            </pre>
          </div>
        </section>
      </div>
    </Layout>
  );
}
