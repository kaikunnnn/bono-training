import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ArticleRowVariant = "plain" | "updates";

/**
 * 横並び小サムネイル＋タイトル（新トップページ Figma Make HANDOFF由来 / NewContentSection用）
 *
 * -mx / px / w-[calc] の組み合わせで、ホバー背景を広げつつコンテンツ左端は
 * 親の左端に揃える（HANDOFFの「Hoverパターン（行アイテム）」に準拠）。
 */
export interface ArticleRowProps {
  image?: string;
  category: string;
  title: string;
  href: string;
  /** 一覧固有の日付表示。未指定なら既存画面には表示しない。 */
  date?: string;
  /** time要素の機械可読値。 */
  dateTime?: string;
  /**
   * タイトルの見出しレベル。既定は h3（/top の NewContentSection＝h2 見出し配下で
   * 使うため）。h1 直下で使う一覧ページ（/updates）などでは "h2" を渡して階層の
   * 飛び（h1→h3）を防ぐ。既存の呼び出しは指定不要＝h3 のまま。
   */
  titleAs?: "h2" | "h3";
  /** updates は新着一覧用。plain はトップページで使う既存表示。 */
  variant?: ArticleRowVariant;
}

export function ArticleRow({
  image,
  category,
  title,
  href,
  date,
  dateTime,
  titleAs = "h3",
  variant = "plain",
}: ArticleRowProps) {
  const TitleTag = titleAs;
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 text-left outline-none transition duration-200",
        variant === "plain" &&
          "-mx-3 w-[calc(100%+24px)] rounded-[8px] px-3 py-3 hover:bg-black/[0.03]",
        variant === "updates" &&
          "w-full rounded-[8px] border-b border-black/[0.1] px-1 py-3 hover:bg-black/[0.035] active:scale-[0.995] active:bg-black/[0.06] focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
      )}
    >
      <div
        className={cn(
          "relative aspect-video w-[101px] shrink-0 overflow-hidden bg-muted-custom lg:w-[115px]",
          variant === "plain" ? "rounded-[2px]" : "rounded-[8px]"
        )}
      >
        {image && (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 115px, 101px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 font-noto-sans-jp text-xs font-medium leading-[24px] text-text-primary/[0.56]">
          <span>{category}</span>
          {date && (
            <>
              <span aria-hidden="true">・</span>
              <time dateTime={dateTime}>{date} 更新</time>
            </>
          )}
        </div>
        <TitleTag className="font-rounded-mplus text-sm font-medium leading-[24px] text-text-primary group-hover:underline">
          {title}
        </TitleTag>
      </div>
      {variant === "updates" && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-black/[0.14] text-text-primary/[0.52] transition-colors duration-200 group-hover:border-black/[0.3] group-hover:text-text-primary">
          <ArrowRight
            className="size-4.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-active:translate-x-1"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </span>
      )}
    </Link>
  );
}
