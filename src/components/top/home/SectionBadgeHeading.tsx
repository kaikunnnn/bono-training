import { cn } from "@/lib/utils";

/**
 * バッジ + 見出し（新トップ 2026 / 汎用）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-39727（"Section (Monochrome)"）の
 * ヘッダー部分。同テンプレートの別カラーバリエーション（Section (Color) 等）でも
 * 見出し部分は同じ形なので、独立した共通コンポーネントとして切り出している。
 *
 * バリエーション:
 * - size: 見出しサイズ。"lg"=32px（ブロック5 / 662-39727・ブロックD / 662-39684）、
 *   "md"=28px（ブロックC / 671-6642「UIUXデザイナーに転職する」）。Figma実データで
 *   ブロックにより意図的に異なるため prop 化した。
 * - inverse: ダーク背景用。バッジ枠線とテキストを白系（text-inverse）に切り替える
 *   （ブロックD / 662-39684「デザインとキャリアを考える」）。
 */

export interface SectionBadgeHeadingProps {
  /** ピルバッジ文言 */
  badgeLabel: string;
  /** 見出し */
  heading: string;
  /** 見出しサイズ（デフォルト "lg" = 32px） */
  size?: "lg" | "md";
  /** ダーク背景用に白系へ反転（デフォルト false） */
  inverse?: boolean;
  className?: string;
}

export default function SectionBadgeHeading({
  badgeLabel,
  heading,
  size = "lg",
  inverse = false,
  className,
}: SectionBadgeHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span
        className={cn(
          "inline-flex w-fit items-center justify-center rounded-full border px-3 py-2 font-rounded-mplus text-xs tracking-[1.6px]",
          inverse
            ? "border-white/20 text-text-inverse"
            : "border-black/20 text-text-primary"
        )}
      >
        {badgeLabel}
      </span>
      <h2
        className={cn(
          "font-rounded-mplus font-medium leading-[1.4] tracking-[1.6px]",
          size === "md" ? "text-[28px]" : "text-[32px]",
          inverse ? "text-text-inverse" : "text-text-primary"
        )}
      >
        {heading}
      </h2>
    </div>
  );
}
