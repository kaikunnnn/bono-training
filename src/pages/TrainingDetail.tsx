
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TaskList from '@/components/training/TaskList';
import TrainingProgress from '@/components/training/TrainingProgress';
import { useTrainingDetail } from '@/hooks/useTrainingCache';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorDisplay from '@/components/common/ErrorBoundary';
import { TrainingError } from '@/utils/errors';

/**
 * トレーニング詳細ページ（React Query対応版）
 */
const TrainingDetail = () => {
  const { trainingSlug } = useParams<{ trainingSlug: string }>();
  
  if (!trainingSlug) {
    return <Navigate to="/training" replace />;
  }

  const { data: training, isLoading, error } = useTrainingDetail(trainingSlug);

  if (isLoading) {
    return (
      <TrainingLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  if (error) {
    return (
      <TrainingLayout>
        <div className="container mx-auto px-4 py-8">
          <ErrorDisplay 
            error={error instanceof Error ? new TrainingError(error.message, 'FETCH_ERROR') : new TrainingError('不明なエラー', 'UNKNOWN_ERROR')}
            onRetry={() => window.location.reload()}
            onReset={() => window.location.href = '/training'}
          />
        </div>
      </TrainingLayout>
    );
  }

  if (!training) {
    return (
      <TrainingLayout>
        <div className="container mx-auto px-4 py-8">
          <ErrorDisplay 
            error={new TrainingError('トレーニングが見つかりませんでした', 'NOT_FOUND', 404)}
            onReset={() => window.location.href = '/training'}
          />
        </div>
      </TrainingLayout>
    );
  }

  return (
    <TrainingLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <TrainingHeader />
        <TrainingProgress 
          tasks={training.tasks || []}
          progressMap={{}}
          trainingSlug={trainingSlug}
          className="my-8" 
        />
        <TaskList 
          tasks={training.tasks || []} 
          trainingSlug={trainingSlug}
          className="mt-8"
        />
      </div>
    </TrainingLayout>
  );
};

export default TrainingDetail;
