import { Metadata } from "next";
import { getAllGuidesFromSanity, getGuidesByCategoryFromSanity } from "@/lib/sanity";
import { GUIDE_CATEGORIES } from "@/lib/guideCategories";
import { GuideCard } from "@/components/guide/GuideCard";
import CategoryNav from "@/components/common/CategoryNav";
import DottedDivider from "@/components/common/DottedDivider";
import { GUIDE_THEMES } from "./data";
import ThemeScroller from "./ThemeScroller";
import type { GuideCategory } from "@/types/guide";

// ISR: 1時間キャッシュ
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ガイド",
  description:
    "自分に必要なスキルを見つけて、体系的に学ぼう。UIUXデザイナー転職、ポートフォリオ、学習法などを攻略。",
  openGraph: {
    title: "ガイド | BONO",
    description: "自分に必要なスキルを見つけて、体系的に学ぼう。",
  },
  alternates: { canonical: "/guide" },
};

const CATEGORY_NAV_ITEMS = [
  { label: "すべて", href: "/guide" },
  ...GUIDE_CATEGORIES.map((cat) => ({
    label: cat.label,
    href: `/guide?category=${cat.id}`,
  })),
];

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function GuidePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category as GuideCategory | undefined;

  const validCategory =
    category && GUIDE_CATEGORIES.some((c) => c.id === category)
      ? category
      : undefined;

  const sanityGuides = validCategory
    ? await getGuidesByCategoryFromSanity(validCategory)
    : await getAllGuidesFromSanity();

  return (
    <div className="min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダー */}
        <section className="pt-8 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-rounded-mplus text-text-primary mb-4">
            ガイド
          </h1>
          <p className="text-base text-text-muted font-noto-sans-jp leading-relaxed max-w-[600px]">
            自分に必要なスキルを見つけて、体系的に学ぼう。気になるテーマから始めてみてください。
          </p>
        </section>

        {/* テーマ横スクロール */}
        <section className="pb-12">
          <ThemeScroller themes={GUIDE_THEMES} />
        </section>

        {/* カテゴリタブ + 記事一覧 */}
        <DottedDivider className="mb-8" />

        <section className="pb-16">
          <h2 className="text-xl font-bold font-rounded-mplus text-text-primary mb-6">
            記事
          </h2>

          {/* カテゴリナビ */}
          <div className="mb-8">
            <CategoryNav items={CATEGORY_NAV_ITEMS} />
          </div>

          {/* 記事グリッド */}
          {sanityGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sanityGuides.slice(0, 16).map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-text-muted">
              該当する記事がありません
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
