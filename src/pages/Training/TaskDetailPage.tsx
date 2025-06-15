
import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import TrainingLayout from '@/components/training/TrainingLayout';
import TaskNavigation from './TaskNavigation';
import TaskVideo from '@/components/training/TaskVideo';
import LessonHeader from '@/components/training/LessonHeader';
import MarkdownRenderer from '@/components/training/MarkdownRenderer';
import ErrorDisplay from '@/components/common/ErrorBoundary';
import { useTaskDetail } from '@/hooks/useTrainingCache';
import { TaskFrontmatter } from '@/types/training';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * 安全にbooleanを変換するヘルパー関数
 */
const safeBooleanConvert = (value: any, defaultValue: boolean = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 1) return true;
  if (value === 0) return false;
  return defaultValue;
};

/**
 * 安全に文字列を変換するヘルパー関数
 */
const safeStringConvert = (value: any): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return undefined;
};

/**
 * 安全に数値を変換するヘルパー関数
 */
const safeNumberConvert = (value: any): number | undefined => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return undefined;
};

/**
 * タスク詳細ページ（React Query対応版）
 */
const TaskDetailPage = () => {
  const { trainingSlug, taskSlug } = useParams<{ trainingSlug: string; taskSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed, hasMemberAccess } = useSubscriptionContext();
  
  if (!trainingSlug || !taskSlug) {
    return <Navigate to="/training" replace />;
  }

  const { data: task, isLoading, error } = useTaskDetail(trainingSlug, taskSlug);
  const hasPremiumAccess = isSubscribed && hasMemberAccess;

  // デバッグログを強化
  console.log('TaskDetailPage - アクセス権情報:', { 
    isSubscribed,
    hasMemberAccess,
    hasPremiumAccess,
    taskIsPremium: task?.is_premium,
    trainingSlug,
    taskSlug,
    userAuthenticated: !!user
  });

  // フェーズ2: 有料コンテンツテスト用ログ追加
  if (task?.is_premium) {
    console.log('TaskDetailPage - 有料コンテンツ検出:', {
      taskTitle: task.title,
      userCanAccess: hasPremiumAccess,
      needsUpgrade: !hasPremiumAccess
    });
  }

  if (isLoading) {
    return (
      <TrainingLayout>
        <div className="container max-w-4xl mx-auto py-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  if (error) {
    return (
      <TrainingLayout>
        <div className="container py-8">
          <ErrorDisplay 
            error={error}
            onRetry={() => window.location.reload()}
            onReset={() => navigate(`/training/${trainingSlug}`)}
          />
        </div>
      </TrainingLayout>
    );
  }

  if (!task) {
    return (
      <TrainingLayout>
        <div className="container py-8">
          <ErrorDisplay 
            error={new Error('タスクが見つかりませんでした')}
            onReset={() => navigate(`/training/${trainingSlug}`)}
          />
        </div>
      </TrainingLayout>
    );
  }

  // TaskDetailData を TaskFrontmatter 型に変換（エラーハンドリング強化版）
  let frontmatter: TaskFrontmatter;
  
  try {
    frontmatter = {
      title: task.title || 'タイトル未設定',
      slug: task.slug || taskSlug,
      order_index: safeNumberConvert(task.order_index) || 1,
      is_premium: safeBooleanConvert(task.is_premium, false),
      video_preview: safeStringConvert(task.video_preview),
      video_full: safeStringConvert(task.video_full),
      preview_sec: safeNumberConvert(task.preview_sec),
      next_task: safeStringConvert(task.next_task),
      prev_task: safeStringConvert(task.prev_task),
      // Storage front-matterから取得したフィールドを追加（安全な変換）
      estimated_time: safeStringConvert(task.estimated_time),
      difficulty: safeStringConvert(task.difficulty),
      description: safeStringConvert(task.description),
    };

    console.log('TaskDetailPage - フロントマター変換完了:', {
      originalData: {
        is_premium: task.is_premium,
        order_index: task.order_index,
        preview_sec: task.preview_sec
      },
      convertedData: {
        is_premium: frontmatter.is_premium,
        order_index: frontmatter.order_index,
        preview_sec: frontmatter.preview_sec
      }
    });
  } catch (conversionError) {
    console.error('TaskDetailPage - フロントマター変換エラー:', conversionError);
    // エラー時のフォールバック値
    frontmatter = {
      title: task.title || 'タイトル未設定',
      slug: task.slug || taskSlug,
      order_index: 1,
      is_premium: false,
      video_preview: undefined,
      video_full: undefined,
      preview_sec: undefined,
      next_task: undefined,
      prev_task: undefined,
      estimated_time: undefined,
      difficulty: undefined,
      description: undefined,
    };
  }

  // 動画URLがある場合のみ動画プレーヤーを表示
  const hasValidVideo = (frontmatter.video_preview && frontmatter.video_preview.trim()) || 
                        (frontmatter.video_full && frontmatter.video_full.trim());

  // フェーズ2: 動画とコンテンツアクセスログ
  console.log('TaskDetailPage - コンテンツアクセス詳細:', {
    hasValidVideo,
    videoFull: !!frontmatter.video_full,
    videoPreview: !!frontmatter.video_preview,
    contentLength: task.content?.length || 0,
    renderMarkdown: true
  });

  return (
    <TrainingLayout>
      <div className="container max-w-4xl mx-auto py-8">
        {/* LessonHeader */}
        <div className="mb-10">
          <LessonHeader frontmatter={frontmatter} />
        </div>

        {/* 動画プレーヤー */}
        {hasValidVideo && (
          <div className="mb-8">
            <TaskVideo
              videoUrl={frontmatter.video_full}
              previewVideoUrl={frontmatter.video_preview}
              isPremium={frontmatter.is_premium}
              hasPremiumAccess={hasPremiumAccess}
              title={frontmatter.title}
              previewSeconds={frontmatter.preview_sec || 30}
              className="w-full"
            />
          </div>
        )}

        {/* Markdownコンテンツ表示 - プロパティ名を統一 */}
        <MarkdownRenderer 
          content={task.content || ''}
          isPremium={frontmatter.is_premium}
          hasMemberAccess={hasPremiumAccess}
          className="mb-8"
        />

        {/* ナビゲーション */}
        <TaskNavigation 
          training={{ title: task.trainingTitle || 'トレーニング' }}
          currentTaskSlug={taskSlug}
          trainingSlug={trainingSlug}
          nextTaskSlug={frontmatter.next_task}
          prevTaskSlug={frontmatter.prev_task}
        />
      </div>
    </TrainingLayout>
  );
};

export default TaskDetailPage;
