import Link from "next/link";

/**
 * 課題解決セクションのカード（新トップ 2026 / top2・top3 再構築版 / ブロックC）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 671-6642（Component 1 / Component 2 実測）
 *
 * スタイル抽出チェックリスト（Figma実測値。このインスタンスは
 * タイトル20px・font-normalで、既存の22px・boldの他カードとは異なる。
 * 今回はこのFigma実測をそのまま優先する）:
 *
 * | 要素 | font-family | weight | size | line-height | tracking | 色 |
 * |---|---|---|---|---|---|---|
 * | サムネ内カテゴリ | Noto Sans JP | Bold(700) | 16px | 1.52 | - | #5e6871 |
 * | サムネ内タイプ | Noto Sans JP | Bold(700) | 14px | 1.52 | - | #5e6871/60 |
 * | サムネ内メタ | Noto Sans JP | Bold(700) | 11px | 1.52 | - | #5e6871 |
 * | タイトル | M PLUS 1 | Regular(400) | 20px（compact時18px） | 1.76 | 0.22px | #141419→text-text-primary |
 * | 説明文 | Noto Sans JP | Regular(400) | 16px（compact時14px） | 1.8 | - | #141419→text-text-primary |
 * | ボタン文言 | Noto Sans JP | Medium(500) | 12px | 1.8 | 0.6px | #000→text-text-primary |
 *
 * 構造: サムネイル(674x432, 角丸32px) → Card.Body(gap-8: タイトル+説明文+ボタン)。
 * サムネ→Body gap-[16px]。カード全体は<Link>で包み、ホバー/アクティブ状態あり。
 * サムネイルは画像未確定のためグレー背景プレースホルダー
 * （カテゴリ/タイプ/メタのラベルのみ再現し、コラージュ写真・背景イラストは省略）。
 */

export interface CourseHighlightCardProps {
  categoryLabel: string;
  typeLabel: string;
  metaLine1: string;
  metaLine2: string;
  title: string;
  description: string;
  ctaLabel?: string;
  href: string;
  /** 外部リンク（別タブで開く） */
  external?: boolean;
  /** フォントサイズを2px落とした試験用バリアント（/dev/top3 での比較用） */
  compact?: boolean;
  className?: string;
}

export default function CourseHighlightCard({
  categoryLabel,
  typeLabel,
  metaLine1,
  metaLine2,
  title,
  description,
  ctaLabel = "詳しく見る",
  href,
  external = false,
  compact = false,
  className,
}: CourseHighlightCardProps) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group flex flex-col gap-4 ${className ?? ""}`}
    >
      {/* サムネイル: グレープレースホルダー + カテゴリ/タイプ/メタラベル */}
      <div className="relative aspect-[674/432] w-full overflow-hidden rounded-[16px]">
        <div className="absolute inset-0 bg-muted-custom transition-transform duration-500 ease-out group-hover:scale-105" />
        <span className="absolute left-6 top-5 text-base font-bold text-[#5e6871]">
          {categoryLabel}
        </span>
        <span className="absolute right-6 top-5 text-sm font-bold text-[#5e6871]/60">
          {typeLabel}
        </span>
        <span className="absolute bottom-6 left-6 text-[11px] font-bold leading-[1.52] text-[#5e6871]">
          <span className="block">{metaLine1}</span>
          <span className="block">{metaLine2}</span>
        </span>
      </div>

      <div className="flex flex-col items-start gap-2">
        <h3
          className={`font-rounded-mplus font-medium leading-[1.76] tracking-[0.22px] text-text-primary underline-offset-4 group-hover:underline ${
            compact ? "text-[18px]" : "text-xl"
          }`}
        >
          {title}
        </h3>
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
    </Link>
  );
}
