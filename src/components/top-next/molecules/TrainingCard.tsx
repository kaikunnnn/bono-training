import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * 16:9サムネイル画像カード（新トップページ Figma Make HANDOFF由来 / TrainingSection用）
 */
export interface TrainingCardProps {
  /** 16:9サムネイル画像URL（無ければグレープレースホルダー） */
  image?: string;
  topLabel: string;
  topSubLabel: string;
  title: string;
  description: string;
  href: string;
  ctaLabel?: string;
}

export function TrainingCard({
  image,
  topLabel,
  topSubLabel,
  title,
  description,
  href,
  ctaLabel = "詳しく見る",
}: TrainingCardProps) {
  return (
    <Link href={href} className="group flex flex-1 flex-col gap-4">
      {/* 説明文の行数が変わっても2枚並びのカードの高さ・ボタン位置が揃うよう、
          サムネイルは固定アスペクト比ではなく flex-1 で残り高さを埋める */}
      <div className="relative min-h-[200px] w-full flex-1 overflow-hidden rounded-[4px] bg-muted-custom">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute left-5 top-4">
          <p className="font-noto-sans-jp text-sm font-bold leading-[1.52] text-white">
            {topLabel}
          </p>
        </div>
        <div className="absolute right-5 top-4">
          <p className="text-right font-noto-sans-jp text-xs font-bold leading-[1.52] text-white/60">
            {topSubLabel}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-rounded-mplus text-xl font-medium leading-[1.76] tracking-[0.22px] text-text-primary transition-opacity duration-300 group-hover:opacity-70">
          {title}
        </h3>
        <p className="font-noto-sans-jp text-base font-normal leading-[1.8] tracking-[0.8px] text-text-primary">
          {description}
        </p>
        <Button variant="outline" size="top-card" asChild>
          <span>{ctaLabel}</span>
        </Button>
      </div>
    </Link>
  );
}
