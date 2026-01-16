import React, { useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { SectionHeading } from "@/components/ui/section-heading";
import { TabGroup } from "@/components/ui/tab-group";
import GuideGrid from "@/components/guide/GuideGrid";
import { useGuides } from "@/hooks/useGuides";
import { Skeleton } from "@/components/ui/skeleton";
import { GUIDE_CATEGORIES, getCategoryInfo } from "@/lib/guideCategories";
import type { GuideCategory } from "@/types/guide";

// MyPage仕様に基づくスタイル定数
const styles = {
  colors: {
    titleText: "#020817",
    descriptionText: "rgba(2, 8, 23, 0.64)",
  },
  spacing: {
    containerPaddingTop: "40px",
    containerPaddingBottom: "64px",
    containerPaddingHorizontal: "16px",
    sectionGap: "24px",
    headerTitleTabGap: "16px",
    sectionContentGap: "8px",
  },
  typography: {
    fontFamily: "'Rounded Mplus 1c', sans-serif",
  },
};

type TabId = "all" | GuideCategory;

/**
 * ガイド一覧ページ（MyPageデザイン原則に基づく）
 */
const GuidePage = () => {
  const { data: guides, isLoading, error } = useGuides();
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const filteredGuides = useMemo(() => {
    if (!guides) return [];
    if (activeTab === "all") return guides;
    return guides.filter((guide) => guide.category === activeTab);
  }, [guides, activeTab]);

  // カテゴリ別にグループ化
  const groupedGuides = useMemo(() => {
    if (!filteredGuides) return {};

    const grouped: Record<string, typeof filteredGuides> = {};
    GUIDE_CATEGORIES.forEach((category) => {
      grouped[category.id] = filteredGuides.filter(
        (guide) => guide.category === category.id
      );
    });
    return grouped;
  }, [filteredGuides]);

  // タブ定義
  const tabs = [
    { id: "all", label: "すべて" },
    ...GUIDE_CATEGORIES.map((cat) => ({ id: cat.id, label: cat.label })),
  ];

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: styles.spacing.sectionGap,
          alignItems: "flex-start",
          paddingTop: styles.spacing.containerPaddingTop,
          paddingBottom: styles.spacing.containerPaddingBottom,
          paddingLeft: styles.spacing.containerPaddingHorizontal,
          paddingRight: styles.spacing.containerPaddingHorizontal,
          width: "100%",
          minHeight: "100vh",
        }}
      >
        {/* ヘッダーセクション */}
        <div className="w-full flex flex-col items-start gap-6">
          {/* タイトル */}
          <div className="self-stretch flex flex-col gap-2">
            <h1
              className="text-slate-950 text-2xl font-semibold leading-6"
              style={{ fontFamily: styles.typography.fontFamily }}
            >
              学習ガイド
            </h1>
            <p
              className="text-sm"
              style={{ color: styles.colors.descriptionText }}
            >
              キャリアに役立つ実践的なガイド記事
            </p>
          </div>

          {/* タブ */}
          {!isLoading && !error && guides && (
            <TabGroup
              tabs={tabs}
              activeTabId={activeTab}
              onTabChange={(id) => setActiveTab(id as TabId)}
            />
          )}
        </div>

        {/* ローディング状態 */}
        {isLoading && (
          <div className="w-full space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-64 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="w-full py-8 bg-red-50 rounded-lg border border-red-200">
            <p className="text-center text-red-600">
              ガイド記事の読み込みでエラーが発生しました
            </p>
          </div>
        )}

        {/* メインコンテンツ */}
        {guides && !isLoading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: styles.spacing.sectionContentGap,
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            {GUIDE_CATEGORIES.map((category) => {
              const categoryGuides = groupedGuides[category.id] || [];
              const categoryInfo = getCategoryInfo(category.id);

              // 空のカテゴリは非表示
              if (categoryGuides.length === 0) return null;

              return (
                <section
                  key={category.id}
                  className="w-full pt-8 pb-10 flex flex-col items-start gap-3 border-b border-black/10 last:border-b-0"
                >
                  {/* セクション見出し */}
                  <div className="w-full flex flex-col gap-2">
                    <SectionHeading title={categoryInfo?.label || category.id} />
                    {categoryInfo?.description && (
                      <p
                        className="text-sm"
                        style={{ color: styles.colors.descriptionText }}
                      >
                        {categoryInfo.description}
                      </p>
                    )}
                  </div>

                  {/* ガイドグリッド */}
                  <GuideGrid guides={categoryGuides} />
                </section>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GuidePage;
