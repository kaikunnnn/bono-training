import TopSectionHeading from "@/components/top2/TopSectionHeading";
import { TestimonialCard } from "@/components/top-next/molecules/TestimonialCard";
import { OutputCard } from "@/components/top-next/molecules/OutputCard";
import type { AchievementItem } from "@/lib/sanity";

/**
 * みんなの実績（新トップページ Figma Make HANDOFF / CommunitySection）
 *
 * 体験談グループ（TestimonialCard ×3）とアウトプットグループ（OutputCard ×3）。
 * データは page.tsx 側で getAchievementGroups から取得して props で渡す。
 * 見出しは top4 で統一した共通コンポーネント TopSectionHeading、グループ小見出しは
 * top4 の AchievementHighlightSection と同じクラス指定に揃える。
 */
export interface CommunitySectionProps {
  stories: AchievementItem[];
  outputs: AchievementItem[];
}

const SUBHEADING_CLASS =
  "font-rounded-mplus text-[20px] font-medium leading-[1.4] tracking-[1.6px] text-text-primary";

export function CommunitySection({ stories, outputs }: CommunitySectionProps) {
  return (
    <section className="px-6 py-[80px] lg:px-12 lg:py-[120px]">
      <TopSectionHeading
        badgeLabel="MEMBER'S VOICE"
        heading="みんなの実績"
        className="mb-[64px]"
      />

      {stories.length > 0 && (
        <div className="mb-[64px]">
          <h3 className={`mb-12 ${SUBHEADING_CLASS}`}>デザイナー転職の体験談</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <TestimonialCard
                key={story.href}
                image={story.thumbnailUrl}
                category="転職インタビュー"
                title={story.title}
                authorImage={story.authorAvatarUrl}
                authorName={story.authorName ?? ""}
                authorRole={story.authorRole ?? ""}
                href={story.href}
              />
            ))}
          </div>
        </div>
      )}

      {outputs.length > 0 && (
        <div>
          <h3 className={`mb-12 ${SUBHEADING_CLASS}`}>メンバーのアウトプット</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {outputs.map((output) => (
              <OutputCard
                key={output.href}
                image={output.thumbnailUrl}
                title={output.title}
                href={output.href}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
