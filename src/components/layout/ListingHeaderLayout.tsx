import React from "react";
import { cn } from "@/lib/utils";

/**
 * 余白バリエーション
 * - tight: 16px - 狭い余白
 * - normal: 32px - 標準的な余白
 * - relaxed: 48px - ゆったりした余白
 */
export type ListingSpacing = "tight" | "normal" | "relaxed";

/**
 * コンテナ幅のバリエーション
 * - narrow: max-w-[1100px] (roadmaps等)
 * - wide: max-w-[1200px] (lessons等)
 */
export type ListingVariant = "narrow" | "wide";

export interface ListingHeaderLayoutProps {
  /** ページヘッダー部分（PageHeader などをそのまま渡す） */
  header: React.ReactNode;
  /** カテゴリナビ／タブ部分（CategoryNav など） */
  nav?: React.ReactNode;
  /** ヘッダーとナビの間の余白バリエーション */
  headerNavSpacing?: ListingSpacing;
  /** ナビの下にとる余白バリエーション */
  navSpacing?: ListingSpacing;
  /** 中央のコンテンツ（セクション＋グリッドなど） */
  children: React.ReactNode;
  /** 横幅のプリセット */
  variant?: ListingVariant;
  /** 追加のクラス名 */
  className?: string;
}

// 余白のマッピング
const SPACING_MAP: Record<ListingSpacing, string> = {
  tight: "mb-4",
  normal: "mb-8",
  relaxed: "mb-12",
};

// コンテナ幅のマッピング
const VARIANT_MAP: Record<ListingVariant, string> = {
  narrow: "max-w-[1100px]",
  wide: "max-w-[1200px]",
};

/**
 * 一覧ページ用の共通レイアウトコンポーネント
 *
 * ヘッダー + カテゴリナビ + コンテンツの縦方向レイアウトと余白を管理する。
 * /roadmaps, /lessons などで共通のレイアウト構造を提供。
 *
 * @example
 * ```tsx
 * <ListingHeaderLayout
 *   variant="narrow"
 *   navSpacing="normal"
 *   header={<PageHeader label="変化への地図" title="ロードマップ" />}
 *   nav={<CategoryNav items={NAV_ITEMS} />}
 * >
 *   <div className="flex flex-col gap-12">
 *     {sections}
 *   </div>
 * </ListingHeaderLayout>
 * ```
 */
export function ListingHeaderLayout({
  header,
  nav,
  headerNavSpacing = "normal",
  navSpacing = "normal",
  children,
  variant = "narrow",
  className,
}: ListingHeaderLayoutProps) {
  return (
    <main
      className={cn(
        // 共通のコンテナスタイル
        "w-full mx-auto px-4 sm:px-6 py-8",
        // バリアントに応じた最大幅
        VARIANT_MAP[variant],
        className
      )}
    >
      {/* ページヘッダー */}
      <div className={nav ? SPACING_MAP[headerNavSpacing] : undefined}>
        {header}
      </div>

      {/* カテゴリナビゲーション */}
      {nav && (
        <div className={SPACING_MAP[navSpacing]}>
          {nav}
        </div>
      )}

      {/* メインコンテンツ */}
      {children}
    </main>
  );
}

export default ListingHeaderLayout;
