
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TaskList from '@/components/training/TaskList';
import { Progress } from "@/components/ui/progress";
import TrainingProgress from '@/components/training/TrainingProgress';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTaskProgress } from '@/services/training';
import AchievementCard from '@/components/training/AchievementCard';

const TrainingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any>(null);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [isAllCompleted, setIsAllCompleted] = useState<boolean>(false);

  const { data: training, isLoading: isTrainingLoading } = useQuery({
    queryKey: ['training', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', training?.id],
    enabled: !!training?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task')
        .select('*')
        .eq('training_id', training.id)
        .order('order_index');

      if (error) throw error;
      return data;
    },
  });

  // ユーザーの進捗データを取得
  useEffect(() => {
    if (!user || !training?.id) return;

    const fetchProgress = async () => {
      try {
        const data = await getUserTaskProgress(user.id, training.id);
        if (!data.error) {
          setProgressData(data);
        }
      } catch (error) {
        console.error('進捗データの取得に失敗しました:', error);
      }
    };

    fetchProgress();
  }, [user, training]);

  // 進捗率の計算
  useEffect(() => {
    if (!tasks || !progressData?.progressMap) return;

    const total = tasks.length;
    const completed = tasks.filter(task => 
      progressData.progressMap[task.id]?.status === 'done'
    ).length;

    setTotalTasks(total);
    setCompletedTasks(completed);
    
    // すべてのタスクが完了しているかどうかの判定
    setIsAllCompleted(total > 0 && completed === total);
  }, [tasks, progressData]);
  
  // トレーニングの難易度に基づいてバッジタイプを決定
  const getBadgeType = () => {
    if (!training?.difficulty) return 'intermediate';
    
    switch (training.difficulty.toLowerCase()) {
      case 'easy': return 'beginner';
      case 'normal': return 'intermediate';
      case 'hard': return 'advanced';
      case 'expert': return 'expert';
      default: return 'intermediate';
    }
  };

  if (isTrainingLoading || isTasksLoading) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-pulse">読み込み中...</div>
        </div>
      </TrainingLayout>
    );
  }

  if (!training) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="flex justify-center items-center h-[400px]">
          <div>トレーニングが見つかりませんでした</div>
        </div>
      </TrainingLayout>
    );
  }

  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container px-6 py-8">
        {/* トレーニング完了時のお祝いカード */}
        {isAllCompleted && (
          <AchievementCard
            title={training.title}
            description={`「${training.title}」のすべてのタスクを完了しました！次のトレーニングに進みましょう。`}
            shareText={`BONOトレーニングで「${training.title}」のすべてのタスクを完了しました！`}
            className="mb-8"
            isTraining={true}
            badgeType={getBadgeType()}
          />
        )}

        {/* トレーニング情報 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{training.title}</h1>
          <p className="text-gray-600 mb-4 dark:text-gray-300">{training.description || '詳細説明はありません'}</p>
          <div className="flex gap-2">
            {training.tags?.map((tag: string) => (
              <span 
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 進捗コンポーネント */}
        {tasks && user && progressData?.progressMap && (
          <div className="mb-8">
            <TrainingProgress
              tasks={tasks}
              progressMap={progressData.progressMap}
              trainingSlug={training.slug}
            />
          </div>
        )}

        {/* タスク一覧 */}
        {tasks && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">タスク一覧</h2>
            <TaskList 
              tasks={tasks} 
              progressMap={progressData?.progressMap || {}} 
              trainingSlug={training.slug}
              className="mb-8" 
            />
          </div>
        )}
      </div>
    </TrainingLayout>
  );
};

export default TrainingDetail;
