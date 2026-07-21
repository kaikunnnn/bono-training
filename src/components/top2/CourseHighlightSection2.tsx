import CourseHighlightCard, {
  type CourseHighlightCardProps,
} from "@/components/top2/CourseHighlightCard";
import TopSectionHeading from "@/components/top2/TopSectionHeading";

/**
 * 課題解決セクション（新トップ 2026 / top2・top3 再構築版 / ブロックC）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 671-6642
 *
 * スタイル抽出チェックリスト（見出し部分、Figma実測値）:
 *
 * | 要素 | font-family | weight | size | tracking | 色 |
 * |---|---|---|---|---|---|
 * | バッジ | M PLUS 1 | Regular(400) | 12px | 1.6px | #141419→text-text-primary |
 * | 見出し | M PLUS 1 | Medium(500) | 28px（compact時26px） | 1.6px | #141419→text-text-primary |
 *
 * 構造: border-b border-black/10, pt-[64px] pb-[65px]。バッジ+見出し(gap-2) →
 * pt-[64px] → カード2枚(gap-[24px])。
 */

export interface CourseHighlightSection2Props {
  badgeLabel?: string;
  heading: string;
  cards: CourseHighlightCardProps[];
  /** フォントサイズを2px落とした試験用バリアント（/dev/top3 での比較用） */
  compact?: boolean;
  className?: string;
}

export default function CourseHighlightSection2({
  badgeLabel = "DESIGN WITH USER",
  heading,
  cards,
  compact = false,
  className,
}: CourseHighlightSection2Props) {
  return (
    <section
      className={`border-b border-black/10 pt-16 pb-[65px] ${className ?? ""}`}
    >
      <TopSectionHeading badgeLabel={badgeLabel} heading={heading} />

      <div className="grid grid-cols-1 gap-6 pt-16 sm:grid-cols-2">
        {cards.map((card, i) => (
          <CourseHighlightCard key={i} {...card} compact={compact} />
        ))}
      </div>
    </section>
  );
}
