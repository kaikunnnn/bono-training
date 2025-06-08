
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTrainings, getTrainingDetail, getTrainingTaskDetail } from '@/services/training';
import type { Training, TrainingDetailData, TaskDetailData } from '@/types/training';

/**
 * トレーニング一覧の取得とキャッシュ
 */
export const useTrainings = () => {
  return useQuery({
    queryKey: ['trainings'],
    queryFn: getTrainings,
    staleTime: 5 * 60 * 1000, // 5分
    cacheTime: 10 * 60 * 1000, // 10分
    retry: 2,
    refetchOnWindowFocus: false
  });
};

/**
 * トレーニング詳細の取得とキャッシュ
 */
export const useTrainingDetail = (slug: string) => {
  return useQuery({
    queryKey: ['training-detail', slug],
    queryFn: () => getTrainingDetail(slug),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    enabled: !!slug,
    refetchOnWindowFocus: false
  });
};

/**
 * タスク詳細の取得とキャッシュ
 */
export const useTaskDetail = (trainingSlug: string, taskSlug: string) => {
  return useQuery({
    queryKey: ['task-detail', trainingSlug, taskSlug],
    queryFn: () => getTrainingTaskDetail(trainingSlug, taskSlug),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    enabled: !!(trainingSlug && taskSlug),
    refetchOnWindowFocus: false
  });
};

/**
 * キャッシュ無効化ユーティリティ
 */
export const useTrainingCacheUtils = () => {
  const queryClient = useQueryClient();

  const invalidateTrainings = () => {
    queryClient.invalidateQueries({ queryKey: ['trainings'] });
  };

  const invalidateTrainingDetail = (slug: string) => {
    queryClient.invalidateQueries({ queryKey: ['training-detail', slug] });
  };

  const invalidateTaskDetail = (trainingSlug: string, taskSlug: string) => {
    queryClient.invalidateQueries({ queryKey: ['task-detail', trainingSlug, taskSlug] });
  };

  const prefetchTrainingDetail = (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: ['training-detail', slug],
      queryFn: () => getTrainingDetail(slug),
      staleTime: 5 * 60 * 1000
    });
  };

  return {
    invalidateTrainings,
    invalidateTrainingDetail,
    invalidateTaskDetail,
    prefetchTrainingDetail
  };
};
