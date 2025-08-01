
import React, { useMemo } from 'react';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHero from '@/components/training/TrainingHero';
import TrainingGrid from '@/components/training/TrainingGrid';
import SectionHeading from '@/components/training/SectionHeading';
import { useTrainings } from '@/hooks/useTrainingCache';
import { Skeleton } from '@/components/ui/skeleton';
import { Training } from '@/types/training';

// カテゴリ定数
const CATEGORIES = {
  INFO_DESIGN: '情報設計',
  UX_DESIGN: 'UXデザイン'
} as const;

/**
 * トレーニングホームページ（React Query対応版）
 */
const TrainingHome = () => {
  const { data: trainings, isLoading, error } = useTrainings();

  // カテゴリ別グループ化（パフォーマンス最適化）
  const groupedTrainings = useMemo(() => {
    if (!trainings) return {};
    
    return {
      [CATEGORIES.INFO_DESIGN]: trainings.filter(t => t.category === CATEGORIES.INFO_DESIGN),
      [CATEGORIES.UX_DESIGN]: trainings.filter(t => t.category === CATEGORIES.UX_DESIGN)
    };
  }, [trainings]);

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
    category, 
    title, 
    description, 
    trainings: categoryTrainings 
  }: { 
    category: string; 
    title: string; 
    description: string; 
    trainings: Training[] 
  }) => {
    // 空のカテゴリは非表示
    if (!categoryTrainings || categoryTrainings.length === 0) {
      return null;
    }

    return (
      <div className="py-8">
        <div className="mb-6">
          <SectionHeading
            category={category}
            title={title}
            description={description}
          />
        </div>
        <TrainingGrid trainings={categoryTrainings} />
      </div>
    );
  };

  return (
    <TrainingLayout>
      <TrainingHero />
      
      <div>
        {/* ローディング状態 */}
        {isLoading && (
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
        )}

        {/* エラー状態 */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">
              トレーニング一覧の読み込みでエラーが発生しました
            </p>
          </div>
        )}

        {/* カテゴリ別セクション表示 */}
        {trainings && (
          <div className="space-y-8">
            <CategorySection
              category={CATEGORIES.INFO_DESIGN}
              title="情報設計トレーニング"
              description="ユーザーが求める情報を整理し、分かりやすく構造化するスキルを身につけよう"
              trainings={groupedTrainings[CATEGORIES.INFO_DESIGN]}
            />
            
            <CategorySection
              category={CATEGORIES.UX_DESIGN}
              title="UXデザイントレーニング"
              description="ユーザー体験を向上させるデザイン思考とプロセスを学ぼう"
              trainings={groupedTrainings[CATEGORIES.UX_DESIGN]}
            />
          </div>
        )}
      </div>
    </TrainingLayout>
  );
};

export default TrainingHome;
