/**
 * /guide 記事の本文中ブロック（#280）。見出し → 説明1文 → ロードマップの小さめのリンクカード。
 * 本文が学ぶ順番・ロードマップの話をしている段落のすぐ後ろにだけ出す（位置と文は GUIDE_INLINE_BLOCKS で記事ごとに決める）。
 * 料金は出さない（料金は記事の最後のブロックだけ）。課金中の人には呼び出し側で出さない。
 */
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildGradientCSS } from "@/components/roadmap/card";
import { GRADIENTS } from "@/styles/gradients";
import type { GuideInlineBlock, PromoRoadmap } from "@/lib/guide-roadmap-map";
import { PromoClickArea } from "./PromoClickArea";
import type { PromoTracking } from "./types";

export function RoadmapInlineBlock({
  block,
  roadmap,
  tracking,
  className,
}: {
  block: GuideInlineBlock;
  roadmap: PromoRoadmap;
  tracking: Omit<PromoTracking, "placement" | "roadmapSlug">;
  className?: string;
}) {
  const gradient = GRADIENTS[roadmap.gradientPreset ?? "career-change"] ?? GRADIENTS["career-change"];
  const Heading = block.headingAs;
  return (
    <PromoClickArea
      tracking={{ ...tracking, placement: "inline", roadmapSlug: roadmap.slug }}
      className={className}
    >
      <section className="space-y-3">
        <Heading className="font-heading text-base font-bold leading-snug text-text-primary sm:text-lg">
          {block.heading}
        </Heading>
        <p className="text-sm leading-[1.8] text-text-secondary">{block.text}</p>
        <div className="flex items-stretch gap-3 rounded-xl border border-border-light bg-surface p-3 sm:items-center sm:gap-4">
          <div
            className="relative w-24 shrink-0 overflow-hidden rounded-lg sm:aspect-[16/9] sm:w-48"
            style={{ background: buildGradientCSS(gradient, "horizontal") }}
          >
            {roadmap.thumbnailUrl && (
              <Image
                src={roadmap.thumbnailUrl}
                alt=""
                fill
                sizes="(min-width: 640px) 192px, 112px"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-[1.6] text-text-primary">
              {roadmap.name}
              <span className="whitespace-nowrap">（{roadmap.stepCount}ステップ）</span>
            </p>
            <Button asChild size="sm" className="mt-2 w-full px-3 sm:w-auto sm:px-4">
              <Link href={`/roadmap/${roadmap.slug}`}>
                ロードマップを見る
                <ChevronRight className="hidden sm:block" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PromoClickArea>
  );
}
