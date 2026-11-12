/**
 * 記事の最後の BONO 紹介ブロック（#280・試作の案C'決定版）。
 * 見出し → 説明1文 → ロードマップのカード（カード全体がリンク）→ 料金の1行（小さな文字リンク）。
 * 見出しは h2、カードタイトルは h3（記事本文の h2 と同じ階層に置く）。課金中の人には呼び出し側で出さない。
 */
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingCtaLink } from "@/components/analytics/PricingCtaLink";
import RoadmapCardV2 from "@/components/roadmap/RoadmapCardV2";
import { PROMO_PRICE_LINE, type PromoRoadmap } from "@/lib/guide-roadmap-map";
import { PromoClickArea } from "./PromoClickArea";
import type { PromoTracking } from "./types";

export function RoadmapEndBlock({
  heading,
  roadmap,
  tracking,
  className,
}: {
  heading: string;
  roadmap: PromoRoadmap;
  tracking: Omit<PromoTracking, "placement" | "roadmapSlug">;
  className?: string;
}) {
  return (
    <PromoClickArea
      tracking={{ ...tracking, placement: "end", roadmapSlug: roadmap.slug }}
      className={className}
    >
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-bold leading-snug text-text-primary sm:text-xl">
          {heading}
        </h2>
        <p className="text-sm leading-[1.8] text-text-secondary">{roadmap.lead}</p>
        <RoadmapCardV2
          slug={roadmap.slug}
          title={roadmap.title}
          description={roadmap.description}
          thumbnailUrl={roadmap.thumbnailUrl}
          stepCount={roadmap.stepCount}
          estimatedDuration={roadmap.estimatedDuration}
          shortTitle={roadmap.shortTitle}
          gradientPreset={roadmap.gradientPreset}
          basePath="/roadmap/"
          variant="gradient"
          orientation="vertical"
          thumbnailStyle="wave"
          titleAs="h3"
          imageSizes="(min-width: 768px) 600px, calc(100vw - 64px)"
        />
        <p className="text-sm leading-[1.8] text-text-secondary">
          BONOのメンバーになると、全部のステップを動画とお題で進められます。
          <span className="font-bold text-text-primary">{PROMO_PRICE_LINE}</span>
          <Button asChild variant="link" className="ml-2 h-auto p-0 align-baseline text-sm text-text-link">
            <PricingCtaLink group="other">
              料金を見る
              <ChevronRight />
            </PricingCtaLink>
          </Button>
        </p>
      </section>
    </PromoClickArea>
  );
}
