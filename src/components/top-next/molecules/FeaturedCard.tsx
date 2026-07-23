import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * 縦型カード＋サムネイル＋説明（新トップページ Figma Make HANDOFF由来 / FeaturedSeries用）
 */
export interface FeaturedCardProps {
  image?: string;
  title: string;
  desc: string;
  href: string;
  ctaLabel?: string;
}

export function FeaturedCard({ title, desc, image, href, ctaLabel = "詳しく見る" }: FeaturedCardProps) {
  return (
    <Link href={href} className="group flex flex-1 flex-col gap-5">
      <h3 className="font-rounded-mplus text-xl font-medium leading-[1.76] tracking-[0.22px] text-text-primary transition-opacity duration-300 group-hover:opacity-70">
        {title}
      </h3>
      <div className="relative aspect-[674/431] w-full overflow-hidden rounded-[4px] bg-muted-custom">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
      </div>
      <div className="flex flex-col gap-3">
        <p className="font-noto-sans-jp text-base font-normal leading-[1.8] tracking-[0.8px] text-text-primary">
          {desc}
        </p>
        <Button variant="outline" size="top-card" asChild>
          <span>{ctaLabel}</span>
        </Button>
      </div>
    </Link>
  );
}
