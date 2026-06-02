/**
 * UsedRoadmapCard — ストーリー詳細ページで「使ったロードマップ」を表示するカード
 *
 * 既存 roadmap への reference を解決した StoryRelatedRoadmap を受ける。
 */

import Link from "next/link";
import Image from "next/image";
import type { StoryRelatedRoadmap } from "@/types/sanity";

interface UsedRoadmapCardProps {
  roadmap: StoryRelatedRoadmap;
  personName: string;
}

export default function UsedRoadmapCard({ roadmap, personName }: UsedRoadmapCardProps) {
  return (
    <div>
      <p className="text-[11px] tracking-[1.68px] uppercase text-[#677470] mb-3 font-noto-sans-jp">
        Used Content
      </p>
      <Link
        href={`/roadmap/${roadmap.slug.current}`}
        className="group block bg-white rounded-[12px] border border-[#e8e9e2] p-6 hover:border-text-primary/30 transition-colors"
      >
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {roadmap.thumbnailUrl && (
            <div className="relative w-full sm:w-32 aspect-[16/10] sm:aspect-square flex-shrink-0 rounded-[8px] overflow-hidden bg-[#e8e9e2]">
              <Image
                src={roadmap.thumbnailUrl}
                alt={roadmap.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] tracking-[1.2px] uppercase text-[#677470] font-noto-sans-jp">
              {personName} さんが使ったロードマップ
            </p>
            <h3 className="text-[18px] font-bold text-text-primary mt-1 group-hover:underline font-noto-sans-jp">
              {roadmap.shortTitle || roadmap.title}
            </h3>
            {roadmap.description && (
              <p className="text-[14px] text-text-primary/75 mt-2 leading-[1.7] font-noto-sans-jp">
                {roadmap.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
