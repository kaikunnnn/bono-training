import { Metadata } from "next";
import { Suspense } from "react";
import { getTrainings } from "@/lib/services/training";
import TrainingLayout from "@/components/training/TrainingLayout";
import TrainingHero from "@/components/training/TrainingHero";
import TrainingGrid from "@/components/training/TrainingGrid";
import SectionHeading from "@/components/training/SectionHeading";
import ContentWrapper from "@/components/training/ContentWrapper";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Training } from "@/types/training";

export const metadata: Metadata = {
  title: "トレーニング | BONO",
  description:
    "各コースで身につけたことをアウトプットするお題を並べています。実践的なデザイントレーニングで力をつけよう。",
  openGraph: {
    title: "トレーニング | BONO",
    description:
      "各コースで身につけたことをアウトプットするお題を並べています。実践的なデザイントレーニングで力をつけよう。",
  },
  twitter: {
    title: "トレーニング | BONO",
    description:
      "各コースで身につけたことをアウトプットするお題を並べています。実践的なデザイントレーニングで力をつけよう。",
  },
  alternates: { canonical: "/training" },
};

// カテゴリ定数
const CATEGORIES = {
  INFO_DESIGN: "情報設計",
  UX_DESIGN: "UXデザイン",
} as const;

// ローディング用スケルトンコンポーネント
const SkeletonGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="space-y-4">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ))}
  </div>
);

// カテゴリセクション表示コンポーネント
const CategorySection = ({
  title,
  description,
  trainings: categoryTrainings,
  linkText,
  linkHref,
}: {
  category: string;
  title: string;
  description: string;
  trainings: Training[];
  linkText?: string;
  linkHref?: string;
}) => {
  // 空のカテゴリは非表示
  if (!categoryTrainings || categoryTrainings.length === 0) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <SectionHeading
          title={title}
          description={description}
          linkText={linkText}
          linkHref={linkHref}
        />
      </div>
      <TrainingGrid trainings={categoryTrainings} />
    </div>
  );
};

async function TrainingContent() {
  const trainings = await getTrainings();

  // カテゴリ別グループ化
  const groupedTrainings = {
    [CATEGORIES.INFO_DESIGN]: trainings.filter(
      (t) => t.category === CATEGORIES.INFO_DESIGN
    ),
    [CATEGORIES.UX_DESIGN]: trainings.filter(
      (t) => t.category === CATEGORIES.UX_DESIGN
    ),
  };

  return (
    <div>
      <CategorySection
        category={CATEGORIES.INFO_DESIGN}
        title="情報設計のお題"
        description="コースの基礎を使って、要件からユーザーに必要な情報を整理してデザインしよう！"
        trainings={groupedTrainings[CATEGORIES.INFO_DESIGN]}
        linkText="情報設計基礎コースを見る"
        linkHref="https://www.bo-no.design/rdm/infomationarchitect-beginner"
      />

      <Separator />

      <CategorySection
        category={CATEGORIES.UX_DESIGN}
        title="UXデザイントレーニング"
        description="コースの基礎を使って、ユーザー心理の背景に感情を把握して課題解決しよう"
        trainings={groupedTrainings[CATEGORIES.UX_DESIGN]}
        linkText="UXデザイン基礎コースを見る"
        linkHref="https://www.bo-no.design/rdm/ux-beginner"
      />
    </div>
  );
}

export default function TrainingPage() {
  return (
    <TrainingLayout>
      <ContentWrapper>
        <TrainingHero />

        <Suspense
          fallback={
            <div className="space-y-12">
              <div>
                <div className="mb-6">
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <SkeletonGrid />
              </div>
              <div>
                <div className="mb-6">
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <SkeletonGrid />
              </div>
            </div>
          }
        >
          <TrainingContent />
        </Suspense>
      </ContentWrapper>
    </TrainingLayout>
  );
}
