import Link from "next/link";
import Image from "next/image";

/**
 * 最新コンテンツ訴求カード（新トップ 2026 / top2 再構築版 / ブロックB-1）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-40053
 *
 * スタイル抽出チェックリスト（Figma実測値）:
 *
 * | 要素 | font-family | weight | size | line-height | tracking | 色 |
 * |---|---|---|---|---|---|---|
 * | タイトル | M PLUS 1 | Medium(500) | 20px | 35.2px(=1.76) | 0.22px | #141419→text-text-primary |
 * | 説明文 | Noto Sans JP | Regular(400) | 16px | 28.8px(=1.8) | 0px | #141419→text-text-primary |
 * | ボタン文言 | Noto Sans JP | Medium(500) | 12px | 21.6px(=1.8) | 0.6px | #000→text-text-primary |
 *
 * 構造: タイトル → サムネイル(674x431, 角丸4px) → 説明文 → ボタン。
 * タイトル→サムネ間 gap-[20px](gap/focus)。サムネ→説明文 pt-[16px]。説明文→ボタン gap-[12px]。
 * カード間 gap-[24px]。
 *
 * サムネイル: 実画像URLがあれば表示、無ければグレー背景プレースホルダー。
 */

export interface SpotlightPromoCardProps {
  title: string;
  description: string;
  ctaLabel?: string;
  href: string;
  /** サムネイル画像URL（無ければグレープレースホルダー） */
  thumbnail?: string;
  /**
   * フォントサイズを2px落とした試験用バリアント（/dev/top3 での比較用）。
   * title: 20px→18px、description: 16px→14px。
   */
  compact?: boolean;
  className?: string;
}

export default function SpotlightPromoCard({
  title,
  description,
  ctaLabel = "詳しく見る",
  href,
  thumbnail,
  compact = false,
  className,
}: SpotlightPromoCardProps) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-5 ${className ?? ""}`}
    >
      <h3
        className={`font-rounded-mplus font-medium leading-[1.76] tracking-[0.22px] text-text-primary underline-offset-4 group-hover:underline ${
          compact ? "text-[18px]" : "text-xl"
        }`}
      >
        {title}
      </h3>

      <div className="flex flex-col">
        {/* サムネイル(674x431, 角丸16px) */}
        <div className="relative aspect-[674/431] w-full overflow-hidden rounded-[16px] bg-muted-custom">
          {thumbnail && (
            <Image
              src={thumbnail}
              alt=""
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              unoptimized
            />
          )}
        </div>

        <div className="flex flex-col items-start gap-3 pt-4">
          <p
            className={`font-noto-sans-jp font-normal leading-[1.8] text-text-primary ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            {description}
          </p>
          <span className="inline-flex h-8 w-fit items-center justify-center rounded-[6px] border border-black/[0.06] bg-surface px-6 font-noto-sans-jp text-xs font-medium tracking-[0.6px] text-text-primary shadow-[0px_0px_3px_0px_rgba(0,0,0,0.04)] transition-shadow group-hover:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
            {ctaLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
