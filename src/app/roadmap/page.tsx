/**
 * ロードマップ一覧ページ（SSR）
 *
 * カテゴリ別にロードマップを一覧表示する
 * データはSanityから取得（Server Component）
 * カテゴリフィルタはsearchParamsで対応
 */

import { Metadata } from "next";
import { getAllRoadmaps } from "@/lib/sanity";

// ISR: 1時間キャッシュ
export const revalidate = 3600;
import RoadmapCardV2 from "@/components/roadmap/RoadmapCardV2";
import CategoryNav from "@/components/common/CategoryNav";
import SectionHeading from "@/components/common/SectionHeading";
import DottedDivider from "@/components/common/DottedDivider";
import PageHeader from "@/components/common/PageHeader";
import type { SanityRoadmapListItem } from "@/types/sanity-roadmap";
import type { GradientPreset } from "@/styles/gradients";

export const metadata: Metadata = {
  title: "ロードマップ",
  description:
    "目標に合ったロードマップを選んで、デザインの探求をはじめよう！転職・スキルアップ・UXデザインなど目的別に学習パスを提供します。",
  openGraph: {
    title: "ロードマップ | BONO",
    description:
      "目標に合ったロードマップを選んで、デザインの探求をはじめよう！",
  },
  twitter: {
    title: "ロードマップ | BONO",
    description:
      "目標に合ったロードマップを選んで、デザインの探求をはじめよう！",
  },
  alternates: { canonical: "/roadmap" },
};

// ============================================
// カテゴリ定義
// ============================================

interface CategoryDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  roadmapSlugs: string[];
}

const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: "career",
    title: "転職・キャリアチェンジしたい",
    description: "未経験からデザイナーへ、キャリアアップを目指したい方向けの地図",
    emoji: "🚀",
    roadmapSlugs: ["uiux-career-change"],
  },
  {
    id: "user-centered",
    title: "ユーザー中心デザインを体系的に身につけたい",
    description: "サービス価値とユーザーをつなげるデザインを学ぶ",
    emoji: "🎯",
    roadmapSlugs: ["ux-design-basic", "information-architecture"],
  },
  {
    id: "skill",
    title: "基礎スキルを体系的に身につけたい",
    description: "デザインの基礎を固めたい方向け",
    emoji: "📚",
    roadmapSlugs: ["ui-visual", "ui-design-beginner"],
  },
];

const NAV_ITEMS = [
  { label: "すべて", href: "/roadmap" },
  ...CATEGORY_DEFINITIONS.map((cat) => ({
    label: cat.title,
    href: `/roadmap?category=${cat.id}`,
  })),
];

// ============================================
// ユーティリティ
// ============================================

function groupRoadmapsByCategory(
  roadmaps: SanityRoadmapListItem[],
  categories: CategoryDefinition[]
): Array<CategoryDefinition & { roadmaps: SanityRoadmapListItem[] }> {
  const roadmapMap = new Map<string, SanityRoadmapListItem>();
  roadmaps
    .filter((rm) => rm.isPublished)
    .forEach((rm) => {
      if (rm.slug?.current) {
        roadmapMap.set(rm.slug.current, rm);
      }
    });

  return categories.map((cat) => ({
    ...cat,
    roadmaps: cat.roadmapSlugs
      .map((slug) => roadmapMap.get(slug))
      .filter((rm): rm is SanityRoadmapListItem => rm !== undefined),
  }));
}

// ============================================
// ページコンポーネント
// ============================================

interface RoadmapPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function RoadmapPage({ searchParams }: RoadmapPageProps) {
  const { category: categoryId } = await searchParams;

  const roadmaps = await getAllRoadmaps();

  const categoriesWithRoadmaps = groupRoadmapsByCategory(
    roadmaps,
    CATEGORY_DEFINITIONS
  );

  const displayCategories = categoryId
    ? categoriesWithRoadmaps.filter((cat) => cat.id === categoryId)
    : categoriesWithRoadmaps;

  return (
    <div className="min-h-screen">
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
        {/* ページヘッダー */}
        <PageHeader
          label="変化への地図"
          title="ロードマップ"
          description="目標に合ったロードマップを選んで、デザインの探求をはじめよう！"
        />

        {/* カテゴリナビゲーション */}
        <div className="sticky top-14 xl:top-0 z-10 mb-8 -mx-4 sm:-mx-6 px-2 sm:px-4 md:px-6">
          <CategoryNav
            items={NAV_ITEMS}
            align="center"
            className="border-gray-200/50"
          />
        </div>

        {/* カテゴリ別セクション */}
        <div className="space-y-16">
          {displayCategories.map((category, index) => (
            <div key={category.id}>
              {index > 0 && <DottedDivider className="mb-12" />}

              <section>
                <div className="mb-6">
                  <SectionHeading
                    title={category.title}
                    description={category.description}
                    descriptionStyle="text"
                    showUnderline={false}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                  {category.roadmaps.map((roadmap, i) => (
                    <div key={roadmap.slug.current} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <RoadmapCardV2
                      slug={roadmap.slug.current}
                      title={roadmap.title}
                      description={roadmap.description}
                      thumbnailUrl={roadmap.thumbnailUrl}
                      stepCount={roadmap.stepCount}
                      estimatedDuration={roadmap.estimatedDuration}
                      shortTitle={roadmap.shortTitle}
                      gradientPreset={roadmap.gradientPreset as GradientPreset}
                      basePath="/roadmap/"
                      variant="gradient"
                      orientation="vertical"
                      thumbnailStyle="wave"
                    />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
