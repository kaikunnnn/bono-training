import React, { useMemo } from "react";
import { GuideLayout, GuideHero, CategorySection } from "@/components/guide";
import ContentWrapper from "@/components/training/ContentWrapper";
import { useGuides } from "@/hooks/useGuides";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { GUIDE_CATEGORIES } from "@/lib/guideCategories";

/**
 * ガイド一覧ページ
 */
const GuidePage = () => {
  const { data: guides, isLoading, error } = useGuides();

  // カテゴリ別にグループ化
  const groupedGuides = useMemo(() => {
    if (!guides) return {};

    const grouped: Record<string, typeof guides> = {};
    GUIDE_CATEGORIES.forEach((category) => {
      grouped[category.id] = guides.filter((guide) => guide.category === category.id);
    });
    return grouped;
  }, [guides]);

  return (
    <GuideLayout>
      <GuideHero />

      <div className="bg-gray-50">
        {/* ローディング状態 */}
        {isLoading && (
          <ContentWrapper className="py-12">
            <div className="space-y-12">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="mb-6">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-80 rounded-lg" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ContentWrapper>
        )}

        {/* エラー状態 */}
        {error && (
          <ContentWrapper className="py-12">
            <div className="text-center py-8 bg-white rounded-lg border border-red-200">
              <p className="text-red-600">
                ガイド記事の読み込みでエラーが発生しました
              </p>
            </div>
          </ContentWrapper>
        )}

        {/* カテゴリ別セクション表示 */}
        {guides && !isLoading && (
          <div>
            {GUIDE_CATEGORIES.map((category, index) => (
              <React.Fragment key={category.id}>
                <CategorySection
                  category={category.id}
                  guides={groupedGuides[category.id] || []}
                />
                {index < GUIDE_CATEGORIES.length - 1 && (
                  <ContentWrapper>
                    <Separator />
                  </ContentWrapper>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </GuideLayout>
  );
};

export default GuidePage;
