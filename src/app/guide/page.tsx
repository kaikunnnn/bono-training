import { Metadata } from "next";
import { Suspense } from "react";
import { getAllGuides, getGuidesByCategory } from "@/lib/guideLoader";
import { GUIDE_CATEGORIES } from "@/lib/guideCategories";
import { GuideCard } from "@/components/guide/GuideCard";
import { GuideCategoryFilter } from "@/components/guide/GuideCategoryFilter";
import PageHeader from "@/components/common/PageHeader";
import type { GuideCategory } from "@/types/guide";

export const metadata: Metadata = {
  title: "ガイド",
  description: "UIUXデザイナーのためのキャリア、学習方法、業界動向、ツールに関するガイド記事。",
  openGraph: {
    title: "ガイド | BONO",
    description: "UIUXデザイナーのためのキャリア、学習方法、業界動向、ツールに関するガイド記事。",
  },
  alternates: { canonical: "/guide" },
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

function GuideList({ category }: { category?: GuideCategory }) {
  const guides = category ? getGuidesByCategory(category) : getAllGuides();

  if (guides.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">ガイド記事がありません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {guides.map((guide) => (
        <GuideCard key={guide.slug} guide={guide} />
      ))}
    </div>
  );
}

function CategoryFilterWrapper() {
  const allGuides = getAllGuides();

  // カテゴリごとのカウントを計算
  const categoryCounts: Record<string, number> = {};
  GUIDE_CATEGORIES.forEach((cat) => {
    categoryCounts[cat.id] = allGuides.filter(
      (g) => g.category === cat.id
    ).length;
  });

  return (
    <GuideCategoryFilter
      categoryCounts={categoryCounts}
      totalCount={allGuides.length}
    />
  );
}

export default async function GuidePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category as GuideCategory | undefined;

  // カテゴリが有効かチェック
  const validCategory =
    category && GUIDE_CATEGORIES.some((c) => c.id === category)
      ? category
      : undefined;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダー */}
        <PageHeader
          label="Guide"
          title="ガイド"
          description="UIUXデザイナーとして成長するためのガイド記事。キャリア、学習方法、業界動向などを解説します。"
        />

        {/* カテゴリフィルター */}
        <div className="mb-8">
          <Suspense
            fallback={
              <div className="flex gap-2">
                <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse" />
              </div>
            }
          >
            <CategoryFilterWrapper />
          </Suspense>
        </div>

        {/* ガイド一覧 */}
        <GuideList category={validCategory} />
      </div>
    </div>
  );
}
