import { cn } from "@/lib/utils";

/**
 * バッジ + 見出し（新トップ 2026 / 汎用）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-39727（"Section (Monochrome)"）の
 * ヘッダー部分。同テンプレートの別カラーバリエーション（Section (Color) 等）でも
 * 見出し部分は同じ形なので、独立した共通コンポーネントとして切り出している。
 */

export interface SectionBadgeHeadingProps {
  /** ピルバッジ文言 */
  badgeLabel: string;
  /** 見出し */
  heading: string;
  className?: string;
}

export default function SectionBadgeHeading({
  badgeLabel,
  heading,
  className,
}: SectionBadgeHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="inline-flex w-fit items-center justify-center rounded-full border border-black/20 px-3 py-2 font-rounded-mplus text-xs tracking-[1.6px] text-text-primary">
        {badgeLabel}
      </span>
      <h2 className="font-rounded-mplus text-[32px] font-medium leading-[1.4] tracking-[1.6px] text-text-primary">
        {heading}
      </h2>
    </div>
  );
}
