
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getTrainingDetail, updateTaskProgress } from '@/services/training';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import TrainingLayout from '@/components/training/TrainingLayout';
import TaskDetail from '@/components/training/TaskDetail';
import TaskNavigation from './TaskNavigation';
import { getUserTaskProgress } from '@/services/training';

const TaskDetailPage = () => {
  const { trainingSlug, taskSlug } = useParams<{ trainingSlug: string; taskSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trainingData, setTrainingData] = useState<any>(null);
  const [taskData, setTaskData] = useState<any>(null);
  const [mdxContent, setMdxContent] = useState<string>('');
  const [progress, setProgress] = useState<any>(null);
  const [isFreePreview, setIsFreePreview] = useState(false);

  // タスクIDが変更されたときにコンテンツを再取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!trainingSlug || !taskSlug) {
          throw new Error('トレーニングまたはタスクが指定されていません');
        }

        // トレーニングデータを取得
        const trainingDetailData = await getTrainingDetail(trainingSlug);
        if (!trainingDetailData) {
          throw new Error('トレーニングが見つかりませんでした');
        }
        setTrainingData(trainingDetailData);

        // タスクデータを取得
        const taskItem = trainingDetailData.tasks?.find((task: any) => task.slug === taskSlug);
        if (!taskItem) {
          throw new Error('タスクが見つかりませんでした');
        }
        setTaskData(taskItem);

        // MDXコンテンツを取得
        const { data, error } = await supabase.functions.invoke('get-mdx-content', {
          body: { trainingSlug, taskSlug }
        });

        if (error) {
          throw new Error(`MDXコンテンツの取得に失敗しました: ${error.message}`);
        }
        
        if (data.error) {
          console.warn('MDXコンテンツ警告:', data.error);
        }
        
        setMdxContent(data.content || '');
        setIsFreePreview(data.isFreePreview || false);

        // ユーザーの進捗情報を取得
        if (user && taskItem.id) {
          try {
            const userProgress = await getUserTaskProgress(user.id, taskItem.id);
            setProgress(userProgress);
          } catch (progressError) {
            console.error('進捗状況の取得に失敗しました:', progressError);
          }
        }

      } catch (err) {
        console.error('データ取得エラー:', err);
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
        toast({
          title: 'エラーが発生しました',
          description: err instanceof Error ? err.message : '不明なエラーが発生しました',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trainingSlug, taskSlug, user, toast]);

  // タスク完了状態の更新ハンドラ
  const handleProgressUpdate = async (status: string = 'done') => {
    if (!user || !taskData?.id) return;

    try {
      const updatedProgress = await updateTaskProgress(user.id, taskData.id, status as 'done' | 'todo' | 'in-progress');
      if (updatedProgress) {
        setProgress(updatedProgress);
        toast({
          title: '進捗を更新しました',
          description: status === 'done' ? 'タスクを完了としてマークしました' : '進捗状態を更新しました',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('進捗の更新中にエラーが発生しました:', error);
      toast({
        title: 'エラーが発生しました',
        description: '進捗の更新に失敗しました。もう一度お試しください。',
        variant: 'destructive',
      });
    }
  };

  // エラー表示
  if (error) {
    navigate(`/training/${trainingSlug}/error`, {
      state: { error, trainingSlug, taskSlug, returnPath: `/training/${trainingSlug}` }
    });
    return null;
  }

  return (
    <TrainingLayout>
      <div className="mb-6">
        {trainingData && taskData && (
          <TaskNavigation 
            training={trainingData} 
            currentTaskSlug={taskSlug || ''}
          />
        )}
      </div>
      
      <div className="px-6 py-2">
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-pulse">読み込み中...</div>
          </div>
        ) : (
          trainingData && taskData && (
            <TaskDetail
              task={taskData}
              training={trainingData}
              mdxContent={mdxContent}
              progress={progress}
              onProgressUpdate={handleProgressUpdate}
              isPremium={taskData.is_premium}
              isFreePreview={isFreePreview}
            />
          )
        )}
      </div>
    </TrainingLayout>
  );
};

export default TaskDetailPage;
