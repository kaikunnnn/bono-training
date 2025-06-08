
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import TrainingLayout from '@/components/training/TrainingLayout';
import TaskNavigation from './TaskNavigation';
import TaskVideo from '@/components/training/TaskVideo';
import LessonHeader from '@/components/training/LessonHeader';
import MarkdownRenderer from '@/components/training/MarkdownRenderer';
import ErrorDisplay from '@/components/common/ErrorBoundary';
import { getTrainingTaskDetail } from '@/services/training';
import { TaskDetailData, TaskFrontmatter } from '@/types/training';
import { TrainingError } from '@/utils/errors';

const TaskDetailPage = () => {
  const { trainingSlug, taskSlug } = useParams<{ trainingSlug: string; taskSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isSubscribed, hasMemberAccess } = useSubscriptionContext();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TrainingError | null>(null);
  const [task, setTask] = useState<TaskDetailData | null>(null);

  const hasPremiumAccess = isSubscribed && hasMemberAccess;

  // デバッグ: URL パラメータの詳細ログ
  console.log('=== TaskDetailPage Debug Start ===');
  console.log('URL params raw:', { trainingSlug, taskSlug });
  console.log('Premium access:', { isSubscribed, hasMemberAccess, hasPremiumAccess });

  // パラメータが存在しない場合のエラーハンドリング
  if (!trainingSlug || !taskSlug) {
    console.error('=== PARAMETER ERROR ===');
    console.error('Missing parameters:', { trainingSlug, taskSlug });
    
    return (
      <TrainingLayout>
        <div className="container py-8">
          <ErrorDisplay 
            error={new TrainingError('URLパラメータが正しく指定されていません', 'INVALID_REQUEST', 400)}
            onReset={() => navigate('/training')}
          />
        </div>
      </TrainingLayout>
    );
  }

  // タスクデータを取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('=== Data Fetching Start ===');
        console.log('Fetching data for:', { trainingSlug, taskSlug });

        // タスクコンテンツを取得（services/training の関数を使用）
        const taskData = await getTrainingTaskDetail(trainingSlug, taskSlug);
        console.log('getTrainingTaskDetail result:', taskData);
        
        setTask(taskData);
        console.log('Task data set successfully:', taskData);

      } catch (err) {
        console.error('=== Data Fetching Error ===');
        console.error('Error details:', err);
        
        if (err instanceof TrainingError) {
          setError(err);
        } else {
          setError(new TrainingError('予期しないエラーが発生しました', 'UNKNOWN_ERROR'));
        }
        
        toast({
          title: 'コンテンツ読み込みエラー',
          description: err instanceof Error ? err.message : '不明なエラーが発生しました',
          variant: 'destructive',
          duration: 5000,
        });
      } finally {
        setLoading(false);
        console.log('=== Data Fetching End ===');
      }
    };

    fetchData();
  }, [trainingSlug, taskSlug, user, toast]);

  // エラー表示
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

  // ローディング表示
  if (loading) {
    return (
      <TrainingLayout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <div className="text-lg font-medium text-gray-700">コンテンツを読み込み中...</div>
                <div className="text-sm text-gray-500 mt-2">{trainingSlug}/{taskSlug}</div>
              </div>
            </div>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  // タスクが見つからない場合
  if (!task) {
    return (
      <TrainingLayout>
        <div className="container py-8">
          <ErrorDisplay 
            error={new TrainingError('タスクが見つかりませんでした', 'NOT_FOUND', 404)}
            onReset={() => navigate(`/training/${trainingSlug}`)}
          />
        </div>
      </TrainingLayout>
    );
  }

  // TaskDetailData を TaskFrontmatter 型に変換
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
