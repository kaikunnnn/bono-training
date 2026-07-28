import { cn } from "@/lib/utils";
import CoursePromoCard, {
  type CoursePromoCardProps,
} from "@/components/top/home/CoursePromoCard";
import SectionBadgeHeading from "@/components/top/home/SectionBadgeHeading";

/**
 * 課題解決のデザインをはじめる セクション（新トップ 2026 / ブロック5）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-39727（"Section (Monochrome)"）
 *
 * 上ボーダーで区切ったモノクロ調のセクション。ピルバッジ + 見出しのヘッダーと、
 * CoursePromoCard を2枚横並び（モバイル縦積み / sm 以上で2カラム）で見せる。
 * どちらのカードも layout="default"（サムネ → タイトル → 説明 → CTA）。
 */

export interface CourseHighlightSectionProps {
  /** ヘッダーのピルバッジ文言 */
  badgeLabel?: string;
  /** セクション見出し */
  heading: string;
  /**
   * 見出しサイズ。ブロック5(662-39727)は 32px("lg")、
   * ブロックC(671-6642「UIUXデザイナーに転職する」)は Figma実データで 28px("md")。
   */
  headingSize?: "lg" | "md";
  /** 表示するカード（2枚想定） */
  cards: CoursePromoCardProps[];
  className?: string;
}

export default function CourseHighlightSection({
  badgeLabel = "DESIGN WITH USER",
  heading,
  headingSize = "lg",
  cards,
  className,
}: CourseHighlightSectionProps) {
  if (!cards?.length) return null;

  return (
    <section className={cn("border-t border-black/10 pt-16 sm:pt-24", className)}>
      {/* ヘッダー: ピルバッジ + 見出し */}
      <SectionBadgeHeading
        badgeLabel={badgeLabel}
        heading={heading}
        size={headingSize}
      />

      {/* カード 2枚 */}
      <div className="grid grid-cols-1 gap-6 pt-16 sm:grid-cols-2 sm:gap-6">
        {cards.map((card, i) => (
          <CoursePromoCard key={i} {...card} />
        ))}
      </div>
    </section>
  );
}
