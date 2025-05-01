
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { getTaskDetail, getTaskProgress } from '@/services/training';
import { loadMdxContent } from '@/utils/mdxLoader';
import TrainingLayout from '@/components/training/TrainingLayout';
import TaskDetailComponent from '@/components/training/TaskDetail';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

/**
 * タスク詳細ページ
 */
const TaskDetail: React.FC = () => {
  const { slug, taskSlug } = useParams<{ slug: string; taskSlug: string }>();
  const { user } = useAuth();
  const { isSubscribed } = useSubscriptionContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState<Tables<'task'> | null>(null);
  const [training, setTraining] = useState<Tables<'training'> | null>(null);
  const [mdxContent, setMdxContent] = useState<string>('');
  const [progress, setProgress] = useState<{ status?: string; completed_at?: string | null } | null>(null);
  
  useEffect(() => {
    const loadTaskData = async () => {
      try {
        if (!slug || !taskSlug) {
          toast({
            title: "エラーが発生しました",
            description: "タスク情報が見つかりません。",
            variant: "destructive"
          });
          navigate('/training');
          return;
        }
        
        setIsLoading(true);
        
        // タスク詳細情報を取得
        const { task: taskData, training: trainingData } = await getTaskDetail(slug, taskSlug);
        setTask(taskData);
        setTraining(trainingData);
        
        // MDXコンテンツを読み込む
        const content = await loadMdxContent(slug, taskSlug);
        setMdxContent(content);
        
        // ユーザーがログインしている場合、進捗情報を取得
        if (user) {
          const progressData = await getTaskProgress(user.id, taskData.id);
          setProgress(progressData);
        }
      } catch (error) {
        console.error('タスク詳細の読み込みに失敗しました:', error);
        toast({
          title: "エラーが発生しました",
          description: "タスク情報の読み込みに失敗しました。",
          variant: "destructive"
        });
        navigate(`/training/${slug}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTaskData();
  }, [slug, taskSlug, user, navigate, toast]);
  
  // 進捗情報が更新された場合に再読み込み
  const handleProgressUpdate = async () => {
    if (user && task) {
      const progressData = await getTaskProgress(user.id, task.id);
      setProgress(progressData);
    }
  };
  
  // コンソールログでサブスクリプション状態を確認
  console.log('TaskDetail - サブスクリプション状態:', isSubscribed);
  
  return (
    <TrainingLayout>
      <div className="container py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">読み込み中...</span>
          </div>
        ) : task && training ? (
          <TaskDetailComponent
            task={task}
            training={training}
            mdxContent={mdxContent}
            progress={progress}
            onProgressUpdate={handleProgressUpdate}
            isPremium={task.is_premium || false}
            isSubscribed={isSubscribed}
          />
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-2">タスクが見つかりません</h2>
            <p className="mb-4">指定されたタスクは存在しないか、削除された可能性があります。</p>
            <button 
              className="text-primary hover:underline"
              onClick={() => navigate(`/training/${slug}`)}
            >
              トレーニング一覧に戻る
            </button>
          </div>
        )}
      </div>
    </TrainingLayout>
  );
};

export default TaskDetail;
