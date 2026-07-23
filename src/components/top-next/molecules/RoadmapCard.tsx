import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * 16:9サムネイル画像カード（新トップページ Figma Make HANDOFF由来 / CareerSection用）
 */
export interface RoadmapCardProps {
  image?: string;
  topLabel: string;
  topSubLabel: string;
  title: string;
  href: string;
  /** 角丸（デフォルト "4px"、大カードは "16px"） */
  rounded?: string;
  ctaLabel?: string;
  /** 外部リンク（別タブで開く） */
  external?: boolean;
}

export function RoadmapCard({
  image,
  topLabel,
  topSubLabel,
  title,
  href,
  rounded = "4px",
  ctaLabel = "詳しく見る",
  external = false,
}: RoadmapCardProps) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex flex-1 flex-col gap-4"
    >
      <div
        className="relative aspect-video w-full overflow-hidden bg-muted-custom"
        style={{ borderRadius: rounded }}
      >
        {image && (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute left-5 top-4 z-10">
          <p className="font-noto-sans-jp text-sm font-bold leading-[1.52] text-white">
            {topLabel}
          </p>
        </div>
        <div className="absolute right-5 top-4 z-10">
          <p className="text-right font-noto-sans-jp text-xs font-bold leading-[1.52] text-white/60">
            {topSubLabel}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-rounded-mplus text-xl font-normal leading-[1.76] tracking-[0.22px] text-text-primary transition-opacity duration-300 group-hover:opacity-70">
          {title}
        </h3>
        <Button variant="outline" size="top-card" asChild>
          <span>{ctaLabel}</span>
        </Button>
      </div>
    </Link>
  );
}
