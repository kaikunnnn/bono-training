/**
 * TrainingDetailV2 - 新しいマークダウン構造対応のトレーニング詳細コンポーネント
 * Phase 5: TrainingDetailV2コンポーネントの作成
 * 
 * SimpleMarkdownRenderer と YamlMetaDisplay を統合し、
 * Figmaデザインに基づく完全なページリニューアルを実現
 */

import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import TrainingLayout from '@/components/training/TrainingLayout';
import TaskList from '@/components/training/TaskList';
import TrainingProgress from '@/components/training/TrainingProgress';
import SimpleMarkdownRenderer from '@/components/training/SimpleMarkdownRenderer';
import YamlMetaDisplay from '@/components/training/YamlMetaDisplay';
import { getTrainingDetailV2 } from '@/services/training/training-detail-v2';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorDisplay from '@/components/common/ErrorBoundary';
import { TrainingError } from '@/utils/errors';
import { useAuth } from '@/contexts/AuthContext';

/**
 * トレーニング詳細ページ（V2 - 新マークダウン構造対応版）
 */
const TrainingDetailV2: React.FC = () => {
  const { trainingSlug } = useParams<{ trainingSlug: string }>();
  const { user } = useAuth();
  
  if (!trainingSlug) {
    return <Navigate to="/training" replace />;
  }

  const { data: trainingData, isLoading, error } = useQuery({
    queryKey: ['training-v2', trainingSlug],
    queryFn: () => getTrainingDetailV2(trainingSlug),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // ローディング状態
  if (isLoading) {
    return (
      <TrainingLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            {/* YAMLメタデータ部分のスケルトン */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-4 mb-6">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <Skeleton className="h-48 w-full rounded-lg mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            </div>
            
            {/* コンテンツ部分のスケルトン */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  // エラー状態
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

  // データなし状態
  if (!trainingData) {
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

  // ユーザーのアクセス権限を判定
  const hasMemberAccess = user?.hasMemberAccess || false;

  return (
    <TrainingLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* デザインシステム切替ボタン（テスト用） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-900">デザインシステム（V2 - Figmaベース）</h3>
                <p className="text-sm text-green-700">現在は新システムを使用中です</p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('trainingDesignV2');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                旧デザインに戻す
              </button>
            </div>
          </div>
        )}

        {/* YAMLメタデータ表示 */}
        <YamlMetaDisplay frontmatter={trainingData.frontmatter} />

        {/* 進捗バー（既存機能との互換性維持） */}
        {trainingData.tasks && trainingData.tasks.length > 0 && (
          <div className="mb-8">
            <TrainingProgress 
              tasks={trainingData.tasks}
              progressMap={{}}
              trainingSlug={trainingSlug}
              className="mb-6" 
            />
          </div>
        )}

        {/* マークダウンコンテンツ表示 */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <SimpleMarkdownRenderer 
            content={trainingData.content}
            className="prose prose-lg max-w-none"
            isPremium={trainingData.isPremium}
            hasMemberAccess={hasMemberAccess}
          />
        </div>

        {/* タスク一覧（既存機能との互換性維持） */}
        {trainingData.tasks && trainingData.tasks.length > 0 && (
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">実践タスク</h2>
              <p className="text-gray-600">
                以下のタスクを順番に進めることで、このトレーニングの目標を達成できます。
              </p>
            </div>
            <TaskList 
              tasks={trainingData.tasks} 
              trainingSlug={trainingSlug}
            />
          </div>
        )}

        {/* デバッグ情報（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">デバッグ情報</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Slug: {trainingSlug}</div>
              <div>Type: {trainingData.frontmatter.type}</div>
              <div>Has Tasks: {trainingData.tasks ? 'Yes' : 'No'}</div>
              <div>Task Count: {trainingData.tasks?.length || 0}</div>
              <div>Is Premium: {trainingData.isPremium ? 'Yes' : 'No'}</div>
              <div>Has Access: {hasMemberAccess ? 'Yes' : 'No'}</div>
              <div>Content Length: {trainingData.content.length} chars</div>
            </div>
          </div>
        )}
      </div>
    </TrainingLayout>
  );
};

export default TrainingDetailV2;