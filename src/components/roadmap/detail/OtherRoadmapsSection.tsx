/**
 * ロードマップ詳細ページ - 他のロードマップセクション
 *
 * クリアブロックの下に表示される、他のロードマップへの誘導セクション
 * UIUX転職ロードマップでは表示しない
 */

import RoadmapCardV2, { type GradientPreset } from "@/components/roadmap/RoadmapCardV2";
import { useRoadmaps } from "@/hooks/useRoadmaps";

interface OtherRoadmapsSectionProps {
  /** 現在のロードマップslug（除外するため） */
  currentRoadmapSlug?: string;
}

export default function OtherRoadmapsSection({ currentRoadmapSlug }: OtherRoadmapsSectionProps) {
  const { data: roadmaps, isLoading } = useRoadmaps();

  // ローディング中は表示しない
  if (isLoading || !roadmaps) {
    return null;
  }

  // フィルタリング:
  // 1. 公開済みのみ
  // 2. UIUX転職（uiux-career-change）を除外
  // 3. 現在のロードマップを除外
  const filteredRoadmaps = roadmaps.filter((roadmap) => {
    if (!roadmap.isPublished) return false;
    if (roadmap.slug.current === "uiux-career-change") return false;
    if (roadmap.slug.current === currentRoadmapSlug) return false;
    return true;
  });

  // 表示するロードマップがない場合は表示しない
  if (filteredRoadmaps.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-[1100px] mx-auto">
        {/* セクションヘッダー */}
        <div className="mb-8">
          <h2 className="text-[24px] font-extrabold text-[#293525] leading-[36px] text-center">
            他のロードマップを見る
          </h2>
        </div>

        {/* ロードマップカードグリッド（2列） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
          {filteredRoadmaps.map((roadmap) => (
            <RoadmapCardV2
              key={roadmap.slug.current}
              slug={roadmap.slug.current}
              title={roadmap.title}
              description={roadmap.description}
              thumbnailUrl={roadmap.thumbnailUrl}
              stepCount={roadmap.stepCount}
              estimatedDuration={roadmap.estimatedDuration}
              shortTitle={roadmap.shortTitle}
              gradientPreset={roadmap.gradientPreset as GradientPreset}
              variant="gradient"
              orientation="vertical"
              thumbnailStyle="wave"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
