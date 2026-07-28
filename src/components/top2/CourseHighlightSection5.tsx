import Link from "next/link";
import TopSectionHeading from "@/components/top2/TopSectionHeading";

/**
 * 課題解決セクション「課題解決のデザインをはじめる」（top2・top3 再構築版）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-39727
 *
 * ブロックC（671-6642, 見出し「UIUXデザイナーに転職する」）と同じ位置づけの
 * セクションだが、これは Figma 上で C の「1つ前」に存在する別セクション。
 * 実装漏れが見つかったため追加。
 *
 * スタイル抽出チェックリスト（Figma実測値）:
 *
 * | 要素 | font-family | weight | size | 色 |
 * |---|---|---|---|---|
 * | 見出し（バッジなし） | M PLUS 1 | Medium(500) | 28px（compact時26px） | #141419→text-text-primary |
 * | カテゴリラベル | Noto Sans JP | Bold(700) | 16px | #d9d9d9（ダーク系サムネ内） |
 * | タイプラベル | Noto Sans JP | Bold(700) | 14px | #d9d9d9/60 |
 * | タイトル | M PLUS 1 | Medium(500) | 20px（compact時18px） | #141419→text-text-primary |
 * | 説明文 | Noto Sans JP | Regular(400) | 16px（compact時14px） | #141419→text-text-primary |
 *
 * 構造: border-b, pt-[64px] pb-[65px]。見出しにバッジなし（671-6642とは異なる）。
 * カード2枚（ダーク系サムネ、カテゴリ/タイプラベルのみ・メタキャプションなし）。
 * 実データのサムネイル画像は未確定のためグレープレースホルダー。
 * `paddingY`（number）を渡すと外側sectionの上下パディングをinline styleで上書きする
 * （見出し→カード間の内側 pt-16 はそのまま。ページ単位の余白統一実験用 / 例: /dev/top4）。
 */

export interface CourseHighlightSection5CardProps {
  categoryLabel: string;
  typeLabel: string;
  title: string;
  description: string;
  ctaLabel?: string;
  href: string;
  compact?: boolean;
}

function Card({
  categoryLabel,
  typeLabel,
  title,
  description,
  ctaLabel = "詳しく見る",
  href,
  compact = false,
}: CourseHighlightSection5CardProps) {
  return (
    <Link href={href} className="group flex flex-col gap-4">
      <div className="relative aspect-[674/432] w-full overflow-hidden rounded-[16px]">
        <div className="absolute inset-0 bg-muted-custom/80 transition-transform duration-500 ease-out group-hover:scale-105" />
        <span className="absolute left-6 top-5 text-base font-bold text-text-primary/70">
          {categoryLabel}
        </span>
        <span className="absolute right-6 top-5 text-sm font-bold text-text-primary/50">
          {typeLabel}
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

export interface CourseHighlightSection5Props {
  heading?: string;
  cards: CourseHighlightSection5CardProps[];
  compact?: boolean;
  /** 外側sectionの上下パディングをinline styleで上書き（px。内側 pt-16 は不変） */
  paddingY?: number;
  className?: string;
}

export default function CourseHighlightSection5({
  heading = "課題解決のデザインをはじめる",
  cards,
  compact = false,
  paddingY,
  className,
}: CourseHighlightSection5Props) {
  return (
    <section
      className={`border-b border-black/10 pt-16 pb-[65px] ${className ?? ""}`}
      style={
        paddingY !== undefined
          ? { paddingTop: paddingY, paddingBottom: paddingY }
          : undefined
      }
    >
      <TopSectionHeading badgeLabel="コーストレーニング" heading={heading} />

      <div className="grid grid-cols-1 gap-6 pt-16 sm:grid-cols-2">
        {cards.map((card, i) => (
          <Card key={i} {...card} compact={compact} />
        ))}
      </div>
    </section>
  );
}
