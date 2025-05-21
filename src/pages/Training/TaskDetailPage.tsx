import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { getTrainingTaskDetail, getTrainingDetail, getUserTaskProgress } from '@/services/training';
import { loadMdxContent } from '@/utils/mdxLoader';
import { TaskDetailData } from '@/types/training';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
          
          // MDXコンテンツを取得
          try {
            const mdxData = await loadMdxContent(slug, taskSlug);
            setMdxContent(mdxData.content);
            
            // タスクデータとMDXデータをマージ
            if (taskDetailData) {
              setTaskData({
                ...taskDetailData,
                is_premium: mdxData.frontmatter.is_premium || taskDetailData.is_premium,
                preview_sec: mdxData.frontmatter.preview_sec || taskDetailData.preview_sec,
                video_full: mdxData.frontmatter.video_full || taskDetailData.video_full,
                video_preview: mdxData.frontmatter.video_preview || taskDetailData.video_preview,
                content: mdxData.content
              });
            } else {
              // タスクデータがない場合はMDXデータから作成
              setTaskData({
                id: `mdx-${taskSlug}`,
                training_id: trainingDetailData?.id || `mdx-${slug}`,
                slug: taskSlug,
                title: mdxData.frontmatter.title,
                order_index: mdxData.frontmatter.order_index || 1,
                is_premium: mdxData.frontmatter.is_premium || false,
                preview_sec: mdxData.frontmatter.preview_sec || 30,
                content: mdxData.content,
                video_full: mdxData.frontmatter.video_full || null,
                video_preview: mdxData.frontmatter.video_preview || null,
                created_at: null,
                next_task: null,
                prev_task: null,
                trainingTitle: trainingDetailData?.title || slug,
                trainingSlug: slug
              });
            }
          } catch (mdxError) {
            console.error('MDXコンテンツの取得に失敗しました:', mdxError);
            
            // MDXの取得に失敗した場合はタスクデータのみを使用
            if (taskDetailData) {
              setTaskData(taskDetailData);
              setMdxContent(taskDetailData.content || '');
            }
          }
          
          // ユーザーがログインしている場合は進捗状況を取得
          if (user && trainingDetailData) {
            try {
              const progressData = await getUserTaskProgress(user.id, trainingDetailData.id);
              if (!progressData?.error) {
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
      if (!progressData?.error) {
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
          mdxContent={mdxContent}
          progress={progress?.progressMap?.[taskData.id]}
          onProgressUpdate={handleProgressUpdate}
          isPremium={taskData.is_premium || false}
          className="mb-8"
        />

        <TaskNavigation 
          trainingSlug={slug || ''} 
          nextTaskSlug={taskData.next_task}
          prevTaskSlug={taskData.prev_task}
        />
      </div>
    </TrainingLayout>
  );
};

export default TaskDetailPage;