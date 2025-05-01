
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import TrainingLayout from '@/components/training/TrainingLayout';
import TaskList from '@/components/training/TaskList';
import { Tables } from '@/integrations/supabase/types';
import { getTrainingDetail } from '@/services/training';
import { supabase } from '@/integrations/supabase/client';

const TrainingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [training, setTraining] = useState<Tables<'training'> | null>(null);
  const [tasks, setTasks] = useState<Tables<'task'>[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, { status: string, completed_at: string | null }>>({});
  
  useEffect(() => {
    const fetchTrainingDetail = async () => {
      if (!slug) {
        setError(new Error('トレーニングIDが指定されていません'));
        return;
      }
      
      try {
        setIsLoading(true);
        const { training, tasks } = await getTrainingDetail(slug);
        setTraining(training);
        setTasks(tasks);
        
        // ユーザーがログインしている場合、進捗情報を取得
        if (user) {
          const taskIds = tasks.map(task => task.id);
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('task_id', taskIds);
            
          if (progressError) {
            console.error('進捗情報取得エラー:', progressError);
          } else if (progressData) {
            // タスクIDごとの進捗情報をマップ化
            const newProgressMap: Record<string, { status: string, completed_at: string | null }> = {};
            progressData.forEach(progress => {
              newProgressMap[progress.task_id] = {
                status: progress.status || 'todo',
                completed_at: progress.completed_at
              };
            });
            setProgressMap(newProgressMap);
          }
        }
      } catch (err) {
        console.error('トレーニング詳細取得エラー:', err);
        const error = err instanceof Error ? err : new Error('不明なエラーが発生しました');
        setError(error);
        toast({
          title: 'エラーが発生しました',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrainingDetail();
  }, [slug, user, toast]);
  
  if (isLoading) {
    return (
      <TrainingLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">読み込み中...</span>
        </div>
      </TrainingLayout>
    );
  }
  
  if (error || !training) {
    return (
      <TrainingLayout>
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">トレーニングが見つかりません</h2>
          <p className="mb-6">指定されたトレーニングは存在しないか、アクセスできない可能性があります。</p>
          <button 
            className="text-primary hover:underline"
            onClick={() => navigate('/training')}
          >
            トレーニング一覧に戻る
          </button>
        </div>
      </TrainingLayout>
    );
  }
  
  // 完了タスク数の計算
  const completedTaskCount = Object.values(progressMap).filter(progress => progress.status === 'done').length;
  const totalTaskCount = tasks.length;
  const completionRate = totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;
  
  return (
    <TrainingLayout>
      <div className="container py-8">
        {/* トレーニングヘッダー */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">{training.title}</h1>
          <p className="text-gray-600 mb-4">{training.description}</p>
          
          {/* 進捗バー */}
          {user && tasks.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between mb-2 text-sm">
                <span>進捗状況</span>
                <span>{completedTaskCount}/{totalTaskCount} タスク完了 ({completionRate}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {/* タスク一覧 */}
        {tasks.length > 0 ? (
          <TaskList tasks={tasks} progressMap={progressMap} />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">タスクがありません</h3>
            <p className="text-gray-600">このトレーニングにはまだタスクが登録されていません。</p>
          </div>
        )}
      </div>
    </TrainingLayout>
  );
};

export default TrainingDetail;
