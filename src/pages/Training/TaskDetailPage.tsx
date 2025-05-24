
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

  // パラメータが存在しない場合のエラーハンドリング
  if (!trainingSlug || !taskSlug) {
    return (
      <TrainingLayout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">エラー</h1>
            <p className="mt-2">トレーニングまたはタスクが指定されていません</p>
            <p className="mt-2 text-sm text-gray-500">
              trainingSlug: {trainingSlug || '未指定'}, taskSlug: {taskSlug || '未指定'}
            </p>
            <button 
              onClick={() => navigate('/training')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              トレーニング一覧に戻る
            </button>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  // タスクIDが変更されたときにコンテンツを再取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('TaskDetailPage - trainingSlug:', trainingSlug, 'taskSlug:', taskSlug);

        // トレーニングデータを取得
        const trainingDetailData = await getTrainingDetail(trainingSlug);
        if (!trainingDetailData) {
          throw new Error(`トレーニング「${trainingSlug}」が見つかりませんでした`);
        }
        setTrainingData(trainingDetailData);
        console.log('TaskDetailPage - trainingDetailData:', trainingDetailData);

        // タスクデータを取得
        const taskItem = trainingDetailData.tasks?.find((task: any) => task.slug === taskSlug);
        if (!taskItem) {
          throw new Error(`タスク「${taskSlug}」が見つかりませんでした。利用可能なタスク: ${trainingDetailData.tasks?.map((t: any) => t.slug).join(', ')}`);
        }
        setTaskData(taskItem);
        console.log('TaskDetailPage - taskItem:', taskItem);

        // MDXコンテンツを取得
        const { data, error } = await supabase.functions.invoke('get-mdx-content', {
          body: { trainingSlug, taskSlug }
        });

        if (error) {
          console.error('MDXコンテンツ取得エラー:', error);
          throw new Error(`MDXコンテンツの取得に失敗しました: ${error.message}`);
        }
        
        if (data.error) {
          console.warn('MDXコンテンツ警告:', data.error);
        }
        
        setMdxContent(data.content || '');
        setIsFreePreview(data.isFreePreview || false);
        console.log('TaskDetailPage - MDXコンテンツ取得成功:', { 
          contentLength: data.content?.length, 
          isFreePreview: data.isFreePreview 
        });

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
        const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
        setError(errorMessage);
        toast({
          title: 'エラーが発生しました',
          description: errorMessage,
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
    return (
      <TrainingLayout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">エラーが発生しました</h1>
            <p className="mt-2 text-gray-600">{error}</p>
            <p className="mt-2 text-sm text-gray-500">
              パラメータ: trainingSlug={trainingSlug}, taskSlug={taskSlug}
            </p>
            <div className="mt-4 space-x-2">
              <button 
                onClick={() => navigate(`/training/${trainingSlug}`)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                トレーニングページに戻る
              </button>
              <button 
                onClick={() => navigate('/training')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                トレーニング一覧に戻る
              </button>
            </div>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  return (
    <TrainingLayout>
      <div className="mb-6">
        {trainingData && taskData && (
          <TaskNavigation 
            training={trainingData} 
            currentTaskSlug={taskSlug}
            trainingSlug={trainingSlug}
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
