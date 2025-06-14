
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

  // TaskDetailData を TaskFrontmatter 型に変換（Storage front-matterデータを含む）
  const frontmatter: TaskFrontmatter = {
    title: task.title,
    slug: task.slug,
    order_index: task.order_index,
    is_premium: task.is_premium || false,
    video_preview: task.video_preview || undefined,
    video_full: task.video_full || undefined,
    preview_sec: task.preview_sec || undefined,
    next_task: task.next_task || undefined,
    prev_task: task.prev_task || undefined,
    // Storage front-matterから取得したフィールドを追加
    estimated_time: task.estimated_time || undefined,
    difficulty: task.difficulty || undefined,
    description: task.description || undefined,
  };

  // 動画URLがある場合のみ動画プレーヤーを表示
  const hasValidVideo = (frontmatter.video_preview && frontmatter.video_preview.trim()) || 
                        (frontmatter.video_full && frontmatter.video_full.trim());

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
              isPremium={frontmatter.is_premium || false}
              hasPremiumAccess={hasPremiumAccess}
              title={frontmatter.title}
              previewSeconds={frontmatter.preview_sec || 30}
              className="w-full"
            />
          </div>
        )}

        {/* Markdownコンテンツ表示 */}
        <MarkdownRenderer 
          content={task.content}
          isPremium={frontmatter.is_premium || false}
          hasMemberAccess={hasPremiumAccess}
          className="mb-8"
        />

        {/* ナビゲーション */}
        <TaskNavigation 
          training={{ title: task.trainingTitle }}
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
