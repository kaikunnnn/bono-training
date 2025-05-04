
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TaskContent from '@/components/training/TaskContent';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getTrainingTaskDetail } from '@/services/training';
import { TaskDetailData } from '@/types/training';

const TaskDetail = () => {
  const { slug, taskSlug } = useParams<{ slug: string; taskSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState<TaskDetailData | null>(null);
  
  useEffect(() => {
    const fetchTaskData = async () => {
      setLoading(true);
      try {
        if (slug && taskSlug) {
          // ダミーデータで応答するように設定されたモックサービス
          const data = await getTrainingTaskDetail(slug, taskSlug);
          setTaskData(data);
        }
      } catch (error) {
        console.error("タスクデータの取得中にエラーが発生しました:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskData();
  }, [slug, taskSlug]);
  
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
  
  if (!taskData) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="container py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">タスクが見つかりませんでした</h2>
            <p className="text-muted-foreground mb-8">
              指定されたタスクは存在しないか、アクセスできません。
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
          </div>
        </div>
      </TrainingLayout>
    );
  }
  
  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container py-8">
        <TaskContent
          title={taskData.title}
          content={taskData.content}
          isPremium={taskData.is_premium}
          videoUrl={taskData.video_url}
          previewVideoUrl={taskData.preview_video_url}
        />
        
        <div className="mt-12 flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            トレーニング一覧へ戻る
          </Button>
          
          {taskData.next_task && (
            <Button 
              onClick={() => window.location.href = `/training/${slug}/${taskData.next_task}`}
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

export default TaskDetail;
