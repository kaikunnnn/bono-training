import Link from "next/link";
import TopSectionHeading from "@/components/top2/TopSectionHeading";
import { LessonCard } from "@/components/lessons/LessonCard";
import type { LessonWithArticleIds } from "@/lib/sanity";

/**
 * 1−2週間でレベルを上げる（新トップページ Figma Make HANDOFF / LessonSection）
 *
 * 2グループ×3枚の LessonCard（variant="cover"）。データは page.tsx 側で取得し、
 * 各グループの LessonWithArticleIds[] を props で渡す。
 *
 * 共有 LessonCard の cover variant は onClick 前提のため、実ナビゲーションのために
 * Next の Link でラップする。見出しは top4 で統一した共通コンポーネント
 * TopSectionHeading、グループ小見出しは top4 の LessonHighlightSection と
 * 同じクラス指定に揃える。
 */
export interface LessonGroup {
  subheading: string;
  lessons: LessonWithArticleIds[];
}

export interface LessonSectionProps {
  groups: LessonGroup[];
}

export function LessonSection({ groups }: LessonSectionProps) {
  return (
    <section className="px-6 lg:px-12">
      <div className="border-b border-black/[0.12] py-[64px]">
        <TopSectionHeading
          badgeLabel="レッスン"
          heading="1−2週間でレベルを上げる"
          className="mb-[64px]"
        />
        <div className="flex flex-col gap-[64px]">
          {groups.map((group) => (
            <div key={group.subheading}>
              <h3 className="mb-12 font-rounded-mplus text-[20px] font-medium leading-[1.4] tracking-[1.6px] text-text-primary">
                {group.subheading}
              </h3>
              <div className="grid grid-cols-1 gap-[27px] md:grid-cols-3">
                {group.lessons.map((lesson) => (
                  <Link key={lesson._id} href={`/lessons/${lesson.slug.current}`}>
                    <LessonCard
                      variant="cover"
                      cat="UIデザイン"
                      lesson={{
                        id: lesson._id,
                        title: lesson.title,
                        description: lesson.description ?? "",
                        category: "UIデザイン",
                        thumbnail: lesson.thumbnailUrl ?? lesson.iconImageUrl ?? "",
                        slug: lesson.slug.current,
                      }}
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
