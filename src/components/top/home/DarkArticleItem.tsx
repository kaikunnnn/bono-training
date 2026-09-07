import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * ダーク背景セクションの記事アイテム（新トップ 2026 / ブロックD）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-39684
 *   「デザインとキャリアを考える」セクションの各アイテム。
 *
 * サムネイル(16:9) + タイトル(20px M PLUS) + 説明(16px Noto Sans JP) + CTAボタン。
 * 全体を <Link> で包み、ダーク背景に合わせて hover/active を白の低透明度
 * オーバーレイで表現する。CTA は視覚的なボタン（buttonVariants の
 * "dark-outline"）で、ネストした <a> を作らないため <span> で描画する。
 *
 * size:
 * - "large": 親レイアウトの約50%幅で1つ表示する想定
 * - "default": 残りスペースで縦に2つスタックする想定
 * どちらもサムネイルは aspect-video 固定（Figmaの実測px値は無視して16:9に統一）。
 */

export interface DarkArticleItemProps {
  title: string;
  description: string;
  /** サムネイル画像URL。null の場合は bg-muted-custom のフォールバック表示 */
  thumbnailSrc?: string | null;
  href: string;
  /** CTA ラベル（デフォルト "相談する"） */
  ctaLabel?: string;
  /** レイアウトサイズ（デフォルト "default"） */
  size?: "large" | "default";
  /** 外部リンク（別タブで開く） */
  external?: boolean;
  className?: string;
}

export default function DarkArticleItem({
  title,
  description,
  thumbnailSrc,
  href,
  ctaLabel = "相談する",
  size = "default",
  external = false,
  className,
}: DarkArticleItemProps) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group flex flex-col rounded-lg p-3 transition-colors hover:bg-white/[0.06] active:bg-white/[0.1]",
        className
      )}
    >
      {/* サムネイル: 16:9 固定（Figma実測: large=角丸8px, default=角丸4px） */}
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden",
          size === "large" ? "rounded-lg" : "rounded"
        )}
      >
        {thumbnailSrc ? (
          <Image
            src={thumbnailSrc}
            alt=""
            fill
            sizes={
              size === "large"
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 768px) 100vw, 25vw"
            }
            className="object-cover"
          />
        ) : (
          <div className="size-full bg-muted-custom" />
        )}
      </div>

      {/* 本文: タイトル + 説明 + CTA */}
      <div className="flex flex-col gap-3 pt-4">
        <h3 className="font-rounded-mplus text-xl font-normal leading-[1.76] tracking-[0.22px] text-text-inverse">
          {title}
        </h3>
        <p className="font-noto-sans-jp text-base leading-[1.8] text-text-inverse">
          {description}
        </p>
        <span
          className={cn(
            buttonVariants({ variant: "dark-outline", size: "sm" }),
            // size="sm" の rounded-[10px] が twMerge で dark-outline の
            // rounded-full を上書きしてしまうため、pill形状とFigma実測の
            // px-21px/py-1px/tracking-0.6px、旧 size="small" が持っていた
            // text-xs を明示的に後勝ちさせる
            "w-fit rounded-full px-[21px] py-px tracking-[0.6px] text-xs"
          )}
        >
          {ctaLabel}
        </span>
      </div>
    </Link>
  );
}
