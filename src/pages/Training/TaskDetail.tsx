
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TaskDetail from '@/components/training/TaskDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getTrainingTaskDetail, getTrainingDetail, getUserTaskProgress } from '@/services/training';
import { TaskDetailData } from '@/types/training';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const TaskDetailPage = () => {
  const { slug, taskSlug } = useParams<{ slug: string; taskSlug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState<TaskDetailData | null>(null);
  const [trainingData, setTrainingData] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug && taskSlug) {
          // タスク詳細データを取得
          const taskDetailData = await getTrainingTaskDetail(slug, taskSlug);
          setTaskData(taskDetailData);
          
          // トレーニング詳細データを取得
          const trainingDetailData = await getTrainingDetail(slug);
          setTrainingData(trainingDetailData);
          
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
  }, [slug, taskSlug, user]);
  
  const handleBack = () => {
    if (slug) {
      navigate(`/training/${slug}`);
    } else {
      navigate('/training');
    }
  };
  
  const handleNext = () => {
    if (slug && taskData?.next_task) {
      navigate(`/training/${slug}/${taskData.next_task}`);
    }
  };
  
  // タスク進捗が更新されたときに進捗データを再取得
  const handleProgressUpdate = async () => {
    if (!user || !trainingData?.id) return;
    
    try {
      const progressData = await getUserTaskProgress(user.id, trainingData.id);
      if (!progressData.error) {
        setProgress(progressData);
      }
    } catch (error) {
      console.error('進捗状況の更新に失敗しました:', error);
    }
  };
  
  if (loading) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="container py-8">
          <div className="space-y-8">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-[300px] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
      </TrainingLayout>
    );
  }
  
  if (!taskData || !trainingData) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="container py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">タスクが見つかりませんでした</h2>
            <p className="text-muted-foreground mb-8">
              指定されたタスクは存在しないか、アクセスできません。
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
          </div>
        </div>
      </TrainingLayout>
    );
  }
  
  // タスクの完了状態を取得
  const taskProgress = progress?.progressMap?.[taskData.id];
  
  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container py-8">
        <TaskDetail
          task={taskData}
          training={trainingData}
          mdxContent={taskData.content}
          progress={taskProgress}
          onProgressUpdate={handleProgressUpdate}
          isPremium={taskData.is_premium}
        />
        
        <div className="mt-12 flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            トレーニング一覧へ戻る
          </Button>
          
          {taskData.next_task && (
            <Button 
              onClick={handleNext}
            >
              次のタスクへ進む
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TaskDetailPage;
