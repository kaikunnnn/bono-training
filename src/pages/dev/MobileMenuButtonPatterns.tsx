import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import {
  ICON_SIZES,
  type IconVariant,
  SidebarLeft,
  SidebarRight,
} from "@/lib/icons";

type IconVariantId = "sidebar";

type IconsaxComponent = React.ComponentType<{
  size?: number;
  variant?: IconVariant;
  className?: string;
  color?: string;
}>;

interface IconPair {
  /** サイドバーを「開く」＝閉じている状態の導線 */
  open: IconsaxComponent;
  /** サイドバーを「閉じる」＝開いている状態の導線 */
  close: IconsaxComponent;
}

interface VariantSpec {
  id: IconVariantId;
  title: string;
  description: string;
  icons: IconPair;
}

const baseIconClassName = "text-gray-700";

const DevMobileMenuButtonPatterns: React.FC = () => {
  const [iconsaxVariant, setIconsaxVariant] = useState<IconVariant>("Linear");

  const variants = useMemo<VariantSpec[]>(
    () => [
      {
        id: "sidebar",
        title: "パターンA：Sidebar（iconsax風・推し）",
        description:
          "“サイドバーの開閉”をそのまま表現。意味が直感的で、iconsaxの語彙としても自然。",
        icons: { open: SidebarLeft, close: SidebarRight },
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <header className="mb-8">
          <div className="flex items-baseline justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold">MobileMenuButton Patterns</h1>
              <p className="text-gray-600 mt-2">
                「閉＝BONOロゴ +（アイコン＋一覧）」「開＝アイコンのみ（閉じる）」を
                iconsax風に 3パターンで比較します。
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Iconsax variant</span>
                <select
                  className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                  value={iconsaxVariant}
                  onChange={(e) => setIconsaxVariant(e.target.value as IconVariant)}
                >
                  <option value="Linear">Linear</option>
                  <option value="Outline">Outline</option>
                  <option value="TwoTone">TwoTone</option>
                  <option value="Bulk">Bulk</option>
                  <option value="Bold">Bold</option>
                </select>
              </div>
              <Link
                to="/dev"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                ← Dev Home に戻る
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {variants.map((variant) => (
            <VariantCard
              key={variant.id}
              variant={variant}
              iconsaxVariant={iconsaxVariant}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const VariantCard: React.FC<{ variant: VariantSpec; iconsaxVariant: IconVariant }> = ({
  variant,
  iconsaxVariant,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const OpenIcon = variant.icons.open;
  const CloseIcon = variant.icons.close;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{variant.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{variant.description}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="text-sm px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
        >
          {isOpen ? "開いている状態" : "閉じている状態"}
        </button>
      </div>

      <div className="mt-6 space-y-5">
        {/* Closed state: BONOロゴ + （アイコン＋一覧） */}
        {!isOpen && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">閉（復活）</p>
            <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Link to="/" aria-label="トップへ" className="flex items-center">
                <Logo className="w-[67.51px] h-5" />
              </Link>

              <div className="ml-auto flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(true)}
                  aria-label="メニューを開く"
                  className="h-9 w-9 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-black/5"
                >
                  <OpenIcon
                    size={ICON_SIZES.lg}
                    variant={iconsaxVariant}
                    className={baseIconClassName}
                    color="currentColor"
                  />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Open state: icon-only close button (as it appears in the sidebar) */}
        {isOpen && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">開（閉じる）</p>
            <div className="relative border border-gray-200 rounded-xl overflow-hidden">
              <div className="h-40 bg-gradient-to-b from-gray-50 to-white" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 h-10 w-10 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-black/5"
                aria-label="メニューを閉じる"
              >
                <CloseIcon
                  size={ICON_SIZES.lg}
                  variant={iconsaxVariant}
                  className={baseIconClassName}
                  color="currentColor"
                />
              </Button>
              <div className="absolute bottom-3 left-3 right-3 text-xs text-gray-500">
                サイドバー内の右上に置く想定
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevMobileMenuButtonPatterns;

