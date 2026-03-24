/**
 * カリキュラム - セクションブロックコンポーネント
 *
 * Figma: PRD🏠_Roadmap_2026 node-id 1-5598
 */

import type {
  SanityRoadmapSection,
  SanityReferenceContent,
  SanityExternalLink,
} from "@/types/sanity-roadmap";
import LessonContentItem from "./LessonContentItem";
import ExternalLinkCard from "./ExternalLinkCard";
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
            // 外部リンクの場合
            if (content._type === "externalLink") {
              return (
                <ExternalLinkCard
                  key={content._key}
                  link={content as SanityExternalLink}
                />
              );
            }

            // 参照型の場合（lesson, roadmap）
            const refContent = content as SanityReferenceContent;

            if (refContent._type === "roadmap") {
              return (
                <RoadmapCardV2
                  key={refContent._id}
                  slug={refContent.slug.current}
                  title={refContent.title}
                  description={refContent.description || ""}
                  thumbnailUrl={refContent.thumbnailUrl}
                  estimatedDuration={refContent.estimatedDuration || "1-2"}
                  gradientPreset={(refContent.gradientPreset as GradientPreset) || "teal"}
                  orientation="horizontal"
                />
              );
            }

            // レッスンの場合
            return (
              <LessonContentItem
                key={refContent._id}
                content={refContent}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
