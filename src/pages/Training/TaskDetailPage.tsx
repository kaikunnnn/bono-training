
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { getTrainingTaskDetail, getTrainingDetail, getUserTaskProgress } from '@/services/training';
import { TaskDetailData } from '@/types/training';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { loadMdxContent } from '@/utils/mdxLoader';
import TaskDetail from '@/components/training/TaskDetail';
import TaskDetailSkeleton from './TaskDetailSkeleton';
import TaskDetailError from './TaskDetailError';
import TaskNavigation from './TaskNavigation';

const TaskDetailPage = () => {
  const { slug, taskSlug } = useParams<{ slug: string; taskSlug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState<TaskDetailData | null>(null);
  const [trainingData, setTrainingData] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [mdxContent, setMdxContent] = useState<string>('');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug && taskSlug) {
          // トレーニング詳細データを取得
          const trainingDetailData = await getTrainingDetail(slug);
          setTrainingData(trainingDetailData);
          
          // タスク詳細データを取得
          const taskDetailData = await getTrainingTaskDetail(slug, taskSlug);
          
          // タスクデータをTaskDetailData型に適合させる
          const fullTaskData: TaskDetailData = {
            ...taskDetailData,
            // すべての必須プロパティを確実に初期化
            content: taskDetailData.content || '', 
            created_at: taskDetailData.created_at || null,
            video_full: taskDetailData.video_full || null,
            video_preview: taskDetailData.video_preview || null,
            preview_sec: taskDetailData.preview_sec || 30,
            training_id: taskDetailData.training_id || '',
            // 型定義に従って他のプロパティも初期化
            id: taskDetailData.id || '',
            slug: taskDetailData.slug || '',
            title: taskDetailData.title || '',
            order_index: taskDetailData.order_index || 0,
            is_premium: taskDetailData.is_premium || false,
            trainingTitle: taskDetailData.trainingTitle || '',
            trainingSlug: taskDetailData.trainingSlug || slug,
            next_task: taskDetailData.next_task || null,
            prev_task: taskDetailData.prev_task || null
          };
          
          setTaskData(fullTaskData);
          
          // MDXコンテンツを取得
          try {
            const { content } = await loadMdxContent(slug, taskSlug);
            setMdxContent(content);
            
            // MDX取得成功したらtaskDataのcontentも更新
            if (fullTaskData) {
              setTaskData(prev => prev ? { ...prev, content } : null);
            }
          } catch (mdxError) {
            console.warn('MDXコンテンツの取得に失敗しました。通常のコンテンツを使用します:', mdxError);
            // taskDetailData.contentがあれば使用
            setMdxContent(fullTaskData.content || '');
          }
          
          // ユーザーがログインしている場合は進捗状況を取得
          if (user) {
            try {
              // 現在のタスクの進捗状況を取得
              const progressData = await getUserTaskProgress(user.id, trainingDetailData.id);
              if (!progressData.error) {
                setProgress(progressData);
              }
            } catch (progressError) {
              console.error('進捗状況の取得に失敗しました:', progressError);
              // プログレスエラーでページ全体が失敗するわけではないので続行
            }
          }
        }
      } catch (error) {
        console.error("データの取得中にエラーが発生しました:", error);
        toast({
          title: "エラーが発生しました",
          description: "コンテンツの取得に失敗しました。もう一度お試しください。",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [slug, taskSlug, user, toast]);
  
  // タスク進捗が更新されたときに進捗データを再取得
  const handleProgressUpdate = async () => {
    if (!user || !trainingData?.id) return;
    
    try {
      const progressData = await getUserTaskProgress(user.id, trainingData.id);
      if (!progressData.error) {
        setProgress(progressData);
        toast({
          title: "進捗を更新しました",
          description: "タスクの進捗状態が正常に更新されました。",
        });
      }
    } catch (error) {
      console.error('進捗状況の更新に失敗しました:', error);
      toast({
        title: "エラーが発生しました",
        description: "進捗状況の更新に失敗しました。",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return <TaskDetailSkeleton />;
  }
  
  if (!taskData || !trainingData) {
    return <TaskDetailError />;
  }
  
  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container py-8">
        <TaskDetail
          task={taskData}
          training={trainingData}
          mdxContent={mdxContent || taskData.content}
          progress={progress?.progressMap?.[taskData.id]}
          onProgressUpdate={handleProgressUpdate}
          isPremium={taskData.is_premium || false}
          className="mb-8"
        />

        <TaskNavigation 
          trainingSlug={slug || ''} 
          nextTaskSlug={taskData.next_task}
        />
      </div>
    </TrainingLayout>
  );
};

export default TaskDetailPage;
