import { Metadata } from "next";
import { Suspense } from "react";
import { getTrainings } from "@/lib/services/training";
import TrainingHero from "@/components/training/TrainingHero";
import TrainingGrid from "@/components/training/TrainingGrid";
import SectionHeading from "@/components/training/SectionHeading";
import ContentWrapper from "@/components/training/ContentWrapper";
import TrainingCardSkeleton from "@/components/training/TrainingCardSkeleton";
import { Separator } from "@/components/ui/separator";
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
const SkeletonGrid = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12 justify-items-start">
    {Array.from({ length: count }).map((_, i) => (
      <TrainingCardSkeleton key={`skeleton-${i}`} />
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

  // データが取得できなかった場合の空状態表示
  if (!trainings || trainings.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500">
        <p className="text-lg">トレーニングコンテンツを読み込み中です。しばらくしてからもう一度お試しください。</p>
      </div>
    );
  }

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
    <ContentWrapper>
      {/* Hero は即時表示 */}
      <TrainingHero />

      <Suspense
        fallback={
          <div>
            <div className="py-12">
              <div className="mb-8">
                <SectionHeading
                  title="情報設計のお題"
                  description="コースの基礎を使って、要件からユーザーに必要な情報を整理してデザインしよう！"
                />
              </div>
              <SkeletonGrid count={3} />
            </div>
            <Separator />
            <div className="py-12">
              <div className="mb-8">
                <SectionHeading
                  title="UXデザイントレーニング"
                  description="コースの基礎を使って、ユーザー心理の背景に感情を把握して課題解決しよう"
                />
              </div>
              <SkeletonGrid count={2} />
            </div>
          </div>
        }
      >
        <TrainingContent />
      </Suspense>
    </ContentWrapper>
  );
}
