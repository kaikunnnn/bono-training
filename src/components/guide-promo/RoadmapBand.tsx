/**
 * /achievements のページ下の細い帯（#280・決定版）。
 * 帯全体がロードマップへのリンク＋小サムネ。料金は右下に小さな文字リンク。課金中の人には呼び出し側で出さない。
 */
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingCtaLink } from "@/components/analytics/PricingCtaLink";
import { buildGradientCSS } from "@/components/roadmap/card";
import { GRADIENTS } from "@/styles/gradients";
import { PROMO_PRICE_LINE, type PromoRoadmap } from "@/lib/guide-roadmap-map";
import { PromoClickArea } from "./PromoClickArea";
import type { PromoTracking } from "./types";

export function RoadmapBand({
  roadmap,
  tracking,
  className,
}: {
  roadmap: PromoRoadmap;
  tracking: Omit<PromoTracking, "placement" | "roadmapSlug">;
  className?: string;
}) {
  const gradient = GRADIENTS[roadmap.gradientPreset ?? "career-change"] ?? GRADIENTS["career-change"];
  return (
    <PromoClickArea
      tracking={{ ...tracking, placement: "band", roadmapSlug: roadmap.slug }}
      className={className}
    >
      <div className="space-y-2">
        <Link
          href={`/roadmap/${roadmap.slug}`}
          className="group flex items-center gap-3 rounded-xl border border-border-light bg-surface p-2 pr-4 transition-colors hover:border-border-default"
        >
          <span
            className="relative aspect-[16/9] w-24 shrink-0 overflow-hidden rounded-lg"
            style={{ background: buildGradientCSS(gradient, "horizontal") }}
          >
            {roadmap.thumbnailUrl && (
              <Image src={roadmap.thumbnailUrl} alt="" fill sizes="96px" className="object-cover" />
            )}
          </span>
          <span className="min-w-0 flex-1 text-sm font-bold leading-[1.6] text-text-primary">
            この人たちと同じロードマップから始める
          </span>
          <ChevronRight className="size-5 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
        <p className="text-right text-xs text-text-secondary">
          <span className="font-bold text-text-primary">{PROMO_PRICE_LINE}</span>
          <Button asChild variant="link" className="ml-2 h-auto p-0 align-baseline text-xs text-text-link">
            <PricingCtaLink group="other">
              料金を見る
              <ChevronRight />
            </PricingCtaLink>
          </Button>
        </p>
      </div>
    </PromoClickArea>
  );
}
