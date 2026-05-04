import { Metadata } from "next";
import { getAllLessonsWithArticleIds } from "@/lib/sanity";
// TODO: LessonCardに進捗表示を追加する際に使用
// import { getMultipleLessonProgress } from "@/lib/services/progress";
import PageHeader from "@/components/common/PageHeader";
import SectionHeading from "@/components/common/SectionHeading";
import DottedDivider from "@/components/common/DottedDivider";
import CategoryNav, { type CategoryNavItem } from "@/components/common/CategoryNav";
import { SECTIONS, RECOMMENDED_SECTIONS } from "./sections";
import { groupLessonsNested, groupRecommendedLessons, getSectionCounts } from "./grouping";
import { LessonCardRenderer } from "./LessonCardRenderer";

export const metadata: Metadata = {
  title: "レッスン一覧",
  description:
    "UIUXデザインを体系的に学べるレッスン一覧。初心者から実践レベルまで、段階的にスキルアップできるコンテンツを提供しています。",
  openGraph: {
    title: "レッスン一覧 | BONO",
    description:
      "UIUXデザインを体系的に学べるレッスン一覧。初心者から実践レベルまで、段階的にスキルアップできるコンテンツを提供しています。",
  },
  twitter: {
    title: "レッスン一覧 | BONO",
    description:
      "UIUXデザインを体系的に学べるレッスン一覧。初心者から実践レベルまで、段階的にスキルアップできるコンテンツを提供しています。",
  },
  alternates: { canonical: "/lessons" },
};

export default async function LessonsPage() {
  const lessons = await getAllLessonsWithArticleIds();

  // セクション・サブセクションごとにグルーピング（main の groupedLessons に対応）
  const groupedLessons = groupLessonsNested(lessons);

  // おすすめタブ用のグルーピング（main の recommendedLessons に対応）
  const recommendedLessons = groupRecommendedLessons(lessons);

  // セクションごとの総レッスン数
  const sectionCounts = getSectionCounts(groupedLessons);

  // 表示すべきセクション（レッスンがあるものだけ）
  const activeSections = SECTIONS.filter(section => sectionCounts[section.id] > 0);

  // CategoryNav用のナビゲーションアイテム（main の navItems に対応）
  const navItems: CategoryNavItem[] = [
    { label: "おすすめ", href: "/lessons" },
    ...activeSections.map((section) => ({
      label: section.label,
      href: `/lessons/category/${section.id}`,
    })),
  ];

  // TODO: LessonCardに進捗表示を追加する際に使用
  // const lessonsForProgress = lessons.map((lesson) => ({
  //   lessonId: lesson._id,
  //   articleIds: lesson.articleIds,
  // }));
  // const progressMap = await getMultipleLessonProgress(lessonsForProgress);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        <PageHeader
          label="テーマ別に鍛えよう"
          title="レッスン一覧"
          description="ワクワクするものづくりのために必要なコンテンツを選んでトレーニングしよう。"
        />

        {/* タブナビゲーション（sticky: スクロールで固定）- CategoryNavコンポーネント使用 */}
        {activeSections.length > 0 && (
          <div className="sticky top-14 xl:top-0 z-10 mb-8 -mx-4 sm:-mx-6 px-2 sm:px-4 md:px-6">
            <CategoryNav
              items={navItems}
              showArrows
              className="border-gray-200/50"
            />
          </div>
        )}

        {lessons.length === 0 ? (
          <p className="text-zinc-500">レッスンがありません。</p>
        ) : (
          /* おすすめタブ: 4つのキュレーションセクション（main lines 567-600） */
          <div className="space-y-8">
            {RECOMMENDED_SECTIONS.map((section, index) => {
              const sectionLessons = recommendedLessons[section.id] || [];
              if (sectionLessons.length === 0) return null;

              return (
                <section key={section.id}>
                  {/* セクション間のドット区切り線 */}
                  {index > 0 && (
                    <DottedDivider className="mb-8" />
                  )}

                  {/* セクション見出し */}
                  <div className="mb-6">
                    <SectionHeading
                      label={section.label}
                      title={section.title}
                      showUnderline={false}
                    />
                  </div>

                  {/* レッスンカードグリッド（main lines 588-596 から、motion.div → 静的div） */}
                  <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6 sm:pb-0 sm:overflow-visible">
                    {sectionLessons.map((lesson, i) => (
                      <LessonCardRenderer key={lesson._id} lesson={{ ...lesson, index: i }} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
