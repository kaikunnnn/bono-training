import { cn } from "@/lib/utils";
import SectionBadgeHeading from "@/components/top/home/SectionBadgeHeading";
import DarkArticleItem from "@/components/top/home/DarkArticleItem";
import { getOgImageUrl } from "@/lib/og-image-fetch";

/**
 * 「デザインとキャリアを考える」ダーク背景セクション（新トップ 2026 / ブロックD）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-39684
 *
 * ダーク背景(#050423 = bg-dark-section トークン)に、白系のバッジ見出しと
 * 3つの記事アイテムを配置する。左に large アイテム1つ（約50%幅）、
 * 右に default アイテム2つを縦積み（gap-24）。左右のカラム間は gap-48。
 *
 * サムネイルは各リンク先ページの OGP 画像を使う（getOgImageUrl でHTMLから
 * og:image を抽出）。取得失敗時は DarkArticleItem 側で bg-muted-custom に
 * フォールバックする。async Server Component として await して取得する。
 */

export interface DesignCareerItem {
  title: string;
  description: string;
  href: string;
  ctaLabel?: string;
  external?: boolean;
}

export interface DesignCareerSectionProps {
  /** ヘッダーのピルバッジ文言 */
  badgeLabel?: string;
  /** セクション見出し */
  heading?: string;
  /** 左の large アイテム */
  largeItem: DesignCareerItem;
  /** 右の default アイテム（2つ想定・縦積み） */
  smallItems: DesignCareerItem[];
  className?: string;
}

export default async function DesignCareerSection({
  badgeLabel = "GUIDE CONTENTS",
  heading = "デザインとキャリアを考える",
  largeItem,
  smallItems,
  className,
}: DesignCareerSectionProps) {
  // 各アイテムのリンク先から OGP 画像を並行取得
  const [largeOg, ...smallOgs] = await Promise.all([
    getOgImageUrl(largeItem.href),
    ...smallItems.map((item) => getOgImageUrl(item.href)),
  ]);

  return (
    <section
      className={cn(
        // 内側パディングを打ち消して背景を全幅に広げる（親の max-w-[1200px] px-4/6 内）
        "-mx-4 border-t border-white/10 bg-dark-section px-4 pb-16 pt-16 sm:-mx-6 sm:px-6 sm:pb-24 sm:pt-24",
        className
      )}
    >
      {/* ヘッダー: バッジ + 見出し（ダーク背景用に反転） */}
      <SectionBadgeHeading badgeLabel={badgeLabel} heading={heading} inverse />

      {/* コンテンツ: 左 large 1つ + 右 default 2つ縦積み */}
      <div className="flex flex-col gap-6 pt-16 md:flex-row md:gap-12">
        {/* 左: large アイテム（Figma実測 716px : 右カラム606px ≈ 1370-48(gap)-716） */}
        <div className="md:flex-[716_0_0]">
          <DarkArticleItem
            size="large"
            title={largeItem.title}
            description={largeItem.description}
            thumbnailSrc={largeOg}
            href={largeItem.href}
            ctaLabel={largeItem.ctaLabel}
            external={largeItem.external}
          />
        </div>

        {/* 右: default アイテム 2つを縦積み（gap-24 = gap-6） */}
        <div className="flex flex-col gap-6 md:flex-[606_0_0]">
          {smallItems.map((item, i) => (
            <DarkArticleItem
              key={i}
              size="default"
              title={item.title}
              description={item.description}
              thumbnailSrc={smallOgs[i]}
              href={item.href}
              ctaLabel={item.ctaLabel}
              external={item.external}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
