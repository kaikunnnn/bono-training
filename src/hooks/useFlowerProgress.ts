/**
 * 花の進捗を管理するカスタムフック
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllLessonsProgress,
  calculateLessonProgress,
  markArticleAsComplete,
} from '@/services/flower/flowerProgress';
import { LessonProgress } from '@/types/flower';

/**
 * ユーザーの全レッスン進捗を取得
 */
export function useAllFlowersProgress(userId: string) {
  return useQuery<LessonProgress[]>({
    queryKey: ['flowers', userId],
    queryFn: () => getAllLessonsProgress(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}

/**
 * 特定のレッスンの進捗を取得
 */
export function useLessonProgress(
  lessonId: string,
  lessonTitle: string,
  lessonSlug: string,
  category: string | undefined,
  userId: string
) {
  return useQuery<LessonProgress>({
    queryKey: ['flower', lessonId, userId],
    queryFn: () =>
      calculateLessonProgress(lessonId, lessonTitle, lessonSlug, category, userId),
    enabled: !!lessonId && !!userId,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}

/**
 * 記事完了をマークし、進捗を更新
 */
export function useMarkArticleComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      articleId,
    }: {
      userId: string;
      articleId: string;
    }) => {
      const success = await markArticleAsComplete(userId, articleId);
      if (!success) {
        throw new Error('Failed to mark article as complete');
      }
      return success;
    },
    onSuccess: (_, variables) => {
      // 全花の進捗を再取得
      queryClient.invalidateQueries({ queryKey: ['flowers', variables.userId] });
      // 特定のレッスンの進捗も再取得
      queryClient.invalidateQueries({ queryKey: ['flower'] });
    },
  });
}
