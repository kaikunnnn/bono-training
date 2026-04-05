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
  const sectionTitle = section.title || "";
  const startsWithSection = sectionTitle.startsWith("セクション");

  return (
    <div className="space-y-4">
      {/* セクションヘッダー */}
      <div className="space-y-2">
        {/* セクションバッジ */}
        <div className="inline-flex items-center px-2 py-0.5 border border-text-black rounded-full">
          <span className="text-[10px] font-bold text-text-black">
            {startsWithSection ? sectionTitle : `セクション`}
          </span>
        </div>

        {/* セクションタイトル */}
        {sectionTitle && !startsWithSection && (
          <h4 className="text-lg font-bold text-text-black leading-[1.4] px-1.5">
            {sectionTitle}
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
          {section.contents.map((content, index) => {
            // 外部リンクの場合
            if (content._type === "externalLink") {
              const extLink = content as SanityExternalLink;
              return (
                <ExternalLinkCard
                  key={extLink._key || `external-${index}`}
                  link={extLink}
                />
              );
            }

            // 参照型の場合（lesson, roadmap）
            const refContent = content as SanityReferenceContent;
            const itemKey = refContent._id || refContent._key || `content-${index}`;

            if (refContent._type === "roadmap") {
              const slugValue = refContent.slug?.current || refContent._id || "";
              return (
                <RoadmapCardV2
                  key={itemKey}
                  slug={slugValue}
                  title={refContent.title || ""}
                  description={refContent.description || ""}
                  thumbnailUrl={refContent.thumbnailUrl}
                  estimatedDuration={refContent.estimatedDuration || "1-2"}
                  stepCount={refContent.stepCount}
                  shortTitle={refContent.shortTitle}
                  gradientPreset={(refContent.gradientPreset as GradientPreset) || "teal"}
                  variant="gradient"
                  orientation="horizontal"
                  thumbnailStyle="wave"
                />
              );
            }

            // レッスンの場合
            return (
              <LessonContentItem
                key={itemKey}
                content={refContent}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
