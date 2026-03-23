/**
 * カリキュラム - セクションブロックコンポーネント
 *
 * Figma: PRD🏠_Roadmap_2026 node-id 1-5598
 */

import type { SanityRoadmapSection } from "@/types/sanity-roadmap";
import LessonContentItem from "./LessonContentItem";
import RoadmapCardV2, { type GradientPreset } from "@/components/roadmap/RoadmapCardV2";

interface CurriculumSectionBlockProps {
  /** セクションデータ */
  section: SanityRoadmapSection;
}

export default function CurriculumSectionBlock({
  section,
}: CurriculumSectionBlockProps) {
  return (
    <div className="space-y-4">
      {/* セクションヘッダー */}
      <div className="space-y-2">
        {/* セクションバッジ */}
        <div className="inline-flex items-center px-2 py-0.5 border border-text-black rounded-full">
          <span className="text-[10px] font-bold text-text-black">
            {section.title.startsWith("セクション") ? section.title : `セクション`}
          </span>
        </div>

        {/* セクションタイトル */}
        {!section.title.startsWith("セクション") && (
          <h4 className="text-lg font-bold text-text-black leading-[1.4] px-1.5">
            {section.title}
          </h4>
        )}

        {/* セクション説明 */}
        {section.description && (
          <p className="text-base text-text-gray leading-[1.6]">
            {section.description}
          </p>
        )}
      </div>

      {/* コンテンツ一覧 */}
      {section.contents && section.contents.length > 0 && (
        <div className="space-y-4">
          {section.contents.map((content) => {
            if (content._type === "roadmap") {
              return (
                <RoadmapCardV2
                  key={content._id}
                  slug={content.slug.current}
                  title={content.title}
                  description={content.description || ""}
                  thumbnailUrl={content.thumbnailUrl}
                  estimatedDuration={content.estimatedDuration || "1-2"}
                  gradientPreset={(content.gradientPreset as GradientPreset) || "teal"}
                  orientation="horizontal"
                />
              );
            }
            return (
              <LessonContentItem
                key={content._id}
                content={content}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
