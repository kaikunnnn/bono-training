
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TaskList from '@/components/training/TaskList';
import { Progress } from "@/components/ui/progress";

const TrainingDetail = () => {
  const { slug } = useParams<{ slug: string }>();

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
      <div className="px-6 py-8">
        {/* トレーニング情報 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{training.title}</h1>
          <p className="text-gray-600 mb-4">{training.description}</p>
          <div className="flex gap-2">
            {training.tags?.map((tag) => (
              <span 
                key={tag}
                className="px-2 py-1 bg-gray-100 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">進捗状況</span>
            <span className="text-sm text-gray-500">2/5 完了</span>
          </div>
          <Progress value={40} className="h-2" />
        </div>

        {/* タスク一覧 */}
        {tasks && <TaskList tasks={tasks} />}
      </div>
    </TrainingLayout>
  );
};

export default TrainingDetail;
