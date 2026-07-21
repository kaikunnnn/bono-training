import SpotlightPromoCard from "@/components/top2/SpotlightPromoCard";

/**
 * 最新コンテンツ訴求（新トップ 2026 / top2 再構築版 / ブロックB-1）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-40053
 *
 * カード3枚を横並び（gap-[24px]）。border-b区切り、pt-[64px] pb-[65px]。
 * モバイルは1カラム、sm以上で3カラム（Figmaにモバイル版が無いため段階的に判断）。
 */

export interface LatestContentItem {
  title: string;
  description: string;
  href: string;
  /** サムネイル画像URL（無ければグレープレースホルダー） */
  thumbnail?: string;
}

export interface LatestContentPromoProps {
  items: LatestContentItem[];
  /** フォントサイズを2px落とした試験用バリアント（/dev/top3 での比較用） */
  compact?: boolean;
  className?: string;
}

export default function LatestContentPromo({
  items,
  compact = false,
  className,
}: LatestContentPromoProps) {
  return (
    <div
      className={`border-b border-black/[0.12] pt-16 pb-[65px] ${className ?? ""}`}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-6">
        {items.map((item, i) => (
          <SpotlightPromoCard key={i} {...item} compact={compact} />
        ))}
      </div>
    </div>
  );
}
