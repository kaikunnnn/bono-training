
import { QueryClient } from '@tanstack/react-query';

/**
 * トレーニング関連のクエリキーを管理するユーティリティ
 */
export const QueryKeys = {
  // トレーニング関連
  trainings: 'trainings',
  trainingDetail: (slug: string) => ['training', slug],
  tasks: (trainingId: string) => ['tasks', trainingId],
  taskDetail: (trainingSlug: string, taskSlug: string) => ['task', trainingSlug, taskSlug],
  userProgress: (userId: string, trainingId: string) => ['progress', userId, trainingId],
  
  // その他
  subscription: 'subscription',
  user: 'user'
};

/**
 * クエリクライアントを使って特定のクエリを無効化する
 * @param queryClient - React QueryのQueryClientインスタンス
 * @param keys - 無効化するクエリキー
 */
export const invalidateQueries = async (queryClient: QueryClient, keys: any) => {
  await queryClient.invalidateQueries({ queryKey: keys });
};

/**
 * クエリクライアントを使ってデータをプリフェッチする
 * @param queryClient - React QueryのQueryClientインスタンス
 * @param queryKey - プリフェッチするクエリキー
 * @param queryFn - データを取得する関数
 */
export const prefetchQuery = async (
  queryClient: QueryClient,
  queryKey: any,
  queryFn: () => Promise<any>
) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
};

/**
 * エラーハンドリング用のカスタムフックのエラーメッセージを取得
 * @param error - エラーオブジェクト
 * @returns エラーメッセージ
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'エラーが発生しました。もう一度お試しください。';
};
