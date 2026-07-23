import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * ダーク背景（#050423）用サムネイルカード（新トップページ Figma Make HANDOFF由来 / GuideSection用）
 */
export interface GuideCardProps {
  image?: string;
  title: string;
  description: string;
  href: string;
  ctaLabel?: string;
}

export function GuideCard({
  image,
  title,
  description,
  href,
  ctaLabel = "詳細を見る",
}: GuideCardProps) {
  return (
    <Link href={href} className="group flex flex-col">
      <div className="relative aspect-video overflow-hidden rounded-[4px] bg-white/10">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
      </div>
      <div className="flex flex-col gap-3 pt-4">
        <h3 className="font-rounded-mplus text-xl font-normal leading-[1.76] tracking-[0.22px] text-text-inverse transition-opacity duration-300 group-hover:opacity-70">
          {title}
        </h3>
        <p className="font-noto-sans-jp text-base font-normal leading-[1.8] tracking-[0.8px] text-text-inverse">
          {description}
        </p>
        <Button variant="outline-dark" size="top-card" asChild>
          <span>{ctaLabel}</span>
        </Button>
      </div>
    </Link>
  );
}
