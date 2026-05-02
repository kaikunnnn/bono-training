import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllLessonsWithArticleIds } from "@/lib/sanity";
import PageHeader from "@/components/common/PageHeader";
import SectionHeading from "@/components/common/SectionHeading";
import DottedDivider from "@/components/common/DottedDivider";
import CategoryNav, { type CategoryNavItem } from "@/components/common/CategoryNav";
import { SECTIONS } from "../../sections";
import { groupLessonsNested, getSectionCounts } from "../../grouping";
import { LessonCardRenderer } from "../../LessonCardRenderer";

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

// メタデータ生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const section = SECTIONS.find(s => s.id === categoryId);

  if (!section) {
    return {
      title: "カテゴリが見つかりません",
    };
  }

  return {
    title: `${section.label} - レッスン一覧`,
    description: `${section.label}カテゴリのレッスン一覧。`,
    openGraph: {
      title: `${section.label} - レッスン一覧 | BONO`,
      description: `${section.label}カテゴリのレッスン一覧。`,
    },
    twitter: {
      title: `${section.label} - レッスン一覧 | BONO`,
      description: `${section.label}カテゴリのレッスン一覧。`,
    },
    alternates: { canonical: `/lessons/category/${categoryId}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { categoryId } = await params;
  const section = SECTIONS.find(s => s.id === categoryId);

  if (!section) {
    notFound();
  }

  const lessons = await getAllLessonsWithArticleIds();

  // セクション・サブセクションごとにグルーピング（共通ロジック使用）
  const groupedLessons = groupLessonsNested(lessons);

  // セクションごとの総レッスン数
  const sectionCounts = getSectionCounts(groupedLessons);

  // 表示すべきセクション（レッスンがあるものだけ）
  const activeSections = SECTIONS.filter(s => sectionCounts[s.id] > 0);

  // CategoryNav用のナビゲーションアイテム
  const navItems: CategoryNavItem[] = [
    { label: "おすすめ", href: "/lessons" },
    ...activeSections.map((s) => ({
      label: s.label,
      href: `/lessons/category/${s.id}`,
    })),
  ];

  // 「その他」に含まれるカテゴリ名のリストを作成（デバッグ・確認用）
  const otherCategories: string[] = [];
  if (section.id === 'others') {
    const others = groupedLessons['others']?.['_default'] || [];
    const categories = new Set(others.map(l => l.tags?.[0] || "未設定"));
    otherCategories.push(...Array.from(categories));
  }

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

        {/* カテゴリ別: 該当セクションのみ（main lines 602-683 からコピー） */}
        <div className="space-y-20">
          <section id={`section-${section.id}`}>
            {/* カテゴリ見出し（sp:22px / md+:28pxデザインシステム） */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-[22px] md:text-[24px] font-extrabold text-gray-900 tracking-tight font-rounded-mplus">
                  {section.label}
                </h2>
                {/* その他の場合のみ、含まれるカテゴリを表示（デバッグ用） */}
                {section.id === 'others' && otherCategories.length > 0 && (
                  <div className="text-xs text-gray-400 font-mono overflow-x-auto max-w-full min-w-0">
                    [{otherCategories.join(', ')}]
                  </div>
                )}
              </div>

              {/* サブセクションごとにレッスンを表示 */}
              <div className="space-y-12">
                {section.subSections.length > 0 ? (
                  section.subSections
                    .filter(sub => (groupedLessons[section.id]?.[sub.id] || []).length > 0)
                    .map((sub, subIndex) => {
                      const subLessons = groupedLessons[section.id]?.[sub.id] || [];

                      return (
                        <div key={sub.id}>
                          {/* サブセクション間のドット区切り線 */}
                          {subIndex > 0 && (
                            <DottedDivider className="mb-8" />
                          )}
                          {/* セクション見出し（SectionHeading使用） - label/titleがある場合のみ */}
                          {(sub.label || sub.title) && (
                            <div className="mb-6">
                              <SectionHeading
                                label={sub.label}
                                title={sub.title}
                                showUnderline={false}
                              />
                            </div>
                          )}

                          {/* レッスンカードグリッド（main lines 651-656 から、motion.div → 静的div） */}
                          <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6 sm:pb-0 sm:overflow-visible">
                            {/* カテゴリ別: 全件表示（8件制限なし） */}
                            {subLessons.map((lesson) => (
                              <LessonCardRenderer key={lesson._id} lesson={lesson} />
                            ))}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  // サブセクションがない場合（その他など）
                  <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6 sm:pb-0 sm:overflow-visible">
                    {(groupedLessons[section.id]?.['_default'] || []).map((lesson) => (
                      <LessonCardRenderer key={lesson._id} lesson={lesson} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
