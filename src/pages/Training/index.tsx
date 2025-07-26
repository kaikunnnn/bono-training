
import React from 'react';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHero from '@/components/training/TrainingHero';
import TrainingGrid from '@/components/training/TrainingGrid';
import { useTrainings } from '@/hooks/useTrainingCache';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * トレーニングホームページ（React Query対応版）
 */
const TrainingHome = () => {
  const { data: trainings, isLoading, error } = useTrainings();

  return (
    <TrainingLayout>
      <TrainingHero />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              利用可能なトレーニング
            </h2>
          </div>
          
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">
                トレーニング一覧の読み込みでエラーが発生しました
              </p>
            </div>
          )}

          {trainings && <TrainingGrid trainings={trainings} />}
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TrainingHome;
