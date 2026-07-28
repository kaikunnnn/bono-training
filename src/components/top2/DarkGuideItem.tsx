import Link from "next/link";

/**
 * デザインとキャリアを考える セクションの記事アイテム（top2・top3 再構築版 / ブロックD）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-39684
 *
 * スタイル抽出チェックリスト（Figma実測値）:
 *
 * | 要素 | font-family | weight | size | line-height | tracking | 色 |
 * |---|---|---|---|---|---|---|
 * | タイトル | M PLUS 1 | Regular(400) | 20px（compact時18px） | 1.76 | 0.22px | white→text-text-inverse |
 * | 説明文 | Noto Sans JP | Regular(400) | 16px（compact時14px） | 1.8 | - | white→text-text-inverse |
 * | ボタン文言 | Noto Sans JP | Medium(500) | 12px | 1.8 | 0.6px | white→text-text-inverse |
 *
 * 構造: サムネイル(large: 881/566, default: 441x283角丸4px) → gap-3 → タイトル+説明文+ボタン(pt-4)。
 * ボタン: bg-black border border-white/20 rounded-full px-[21px] py-px。
 * サムネイルは画像未確定のためグレー背景プレースホルダー。
 */

export interface DarkGuideItemProps {
  title: string;
  description: string;
  ctaLabel?: string;
  href: string;
  size?: "large" | "default";
  /** フォントサイズを2px落とした試験用バリアント（/dev/top3 での比較用） */
  compact?: boolean;
  className?: string;
}

export default function DarkGuideItem({
  title,
  description,
  ctaLabel = "相談する",
  href,
  size = "default",
  compact = false,
  className,
}: DarkGuideItemProps) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-lg -m-3 p-3 transition-colors hover:bg-white/[0.06] active:bg-white/[0.1] ${className ?? ""}`}
    >
      <div
        className={`relative w-full overflow-hidden rounded-[16px] bg-white/10 ${
          size === "large" ? "aspect-[881/566]" : "aspect-[441/283]"
        }`}
      />

      <div className="flex flex-col gap-3 pt-4">
        <h3
          className={`font-rounded-mplus font-medium leading-[1.76] tracking-[0.22px] text-text-inverse ${
            compact ? "text-[18px]" : "text-xl"
          }`}
        >
          {title}
        </h3>
        <p
          className={`font-noto-sans-jp font-normal leading-[1.8] text-text-inverse ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          {description}
        </p>
        <span className="inline-flex h-8 w-fit items-center justify-center rounded-full border border-white/20 bg-black px-[21px] py-px font-noto-sans-jp text-xs font-medium tracking-[0.6px] text-text-inverse">
          {ctaLabel}
        </span>
      </div>
    </Link>
  );
}
