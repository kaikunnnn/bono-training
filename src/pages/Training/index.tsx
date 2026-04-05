import React, { useMemo } from "react";
import Layout from "@/components/layout/Layout";
import TrainingHero from "@/components/training/TrainingHero";
import TrainingGrid from "@/components/training/TrainingGrid";
import SectionHeading from "@/components/training/SectionHeading";
import { useTrainings } from "@/hooks/useTrainingCache";
import { Separator } from "@/components/ui/separator";
import { Training } from "@/types/training";

// カテゴリ定数
const CATEGORIES = {
  INFO_DESIGN: "情報設計",
  UX_DESIGN: "UXデザイン",
} as const;

// カテゴリセクション表示コンポーネント
const CategorySection = ({
  category,
  title,
  description,
  trainings: categoryTrainings,
  linkText,
  linkHref,
  isLoading = false,
  skeletonCount = 3,
}: {
  category: string;
  title: string;
  description: string;
  trainings?: Training[];
  linkText?: string;
  linkHref?: string;
  isLoading?: boolean;
  skeletonCount?: number;
}) => {
  // ローディング中でなく、かつ空のカテゴリは非表示
  if (!isLoading && (!categoryTrainings || categoryTrainings.length === 0)) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <SectionHeading
          category={category}
          title={title}
          description={description}
          linkText={linkText}
          linkHref={linkHref}
        />
      </div>
      <TrainingGrid
        trainings={categoryTrainings}
        isLoading={isLoading}
        skeletonCount={skeletonCount}
      />
    </div>
  );
};

/**
 * トレーニングホームページ（React Query対応版）
 * 段階的読み込み: Hero・セクション見出しは即表示、コンテンツはスケルトン→実データ
 */
const TrainingHome = () => {
  const { data: trainings, isLoading, error } = useTrainings();

  // カテゴリ別グループ化（パフォーマンス最適化）
  const groupedTrainings = useMemo(() => {
    if (!trainings) return {};

    return {
      [CATEGORIES.INFO_DESIGN]: trainings.filter(
        (t) => t.category === CATEGORIES.INFO_DESIGN
      ),
      [CATEGORIES.UX_DESIGN]: trainings.filter(
        (t) => t.category === CATEGORIES.UX_DESIGN
      ),
    };
  }, [trainings]);

  return (
    <Layout>
      <div className="max-w-[1120px] mx-auto w-[88%] sm:w-[85%] lg:w-[88%]">
        {/* Hero は即時表示 */}
        <TrainingHero />

        {/* エラー表示（エラー時のみ） */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">
              トレーニング一覧の読み込みでエラーが発生しました
            </p>
          </div>
        )}

        {/* カテゴリ別セクション表示 - ローディング中はスケルトン */}
        {!error && (
          <div>
            <CategorySection
              category={CATEGORIES.INFO_DESIGN}
              title="情報設計のお題"
              description="コースの基礎を使って、要件からユーザーに必要な情報を整理してデザインしよう！"
              trainings={groupedTrainings[CATEGORIES.INFO_DESIGN]}
              linkText="情報設計基礎コースを見る"
              linkHref="https://www.bo-no.design/rdm/infomationarchitect-beginner"
              isLoading={isLoading}
              skeletonCount={3}
            />

            <Separator />

            <CategorySection
              category={CATEGORIES.UX_DESIGN}
              title="UXデザイントレーニング"
              description="コースの基礎を使って、ユーザー心理の背景に感情を把握して課題解決しよう"
              trainings={groupedTrainings[CATEGORIES.UX_DESIGN]}
              linkText="UXデザイン基礎コースを見る"
              linkHref="https://www.bo-no.design/rdm/ux-beginner"
              isLoading={isLoading}
              skeletonCount={2}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrainingHome;
