
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TaskNavigationProps {
  training: any;
  currentTaskSlug: string;
  trainingSlug?: string;
  nextTaskSlug?: string | null;
  prevTaskSlug?: string | null;
}

const TaskNavigation: React.FC<TaskNavigationProps> = ({ 
  training,
  currentTaskSlug,
  trainingSlug,
  nextTaskSlug: propNextTaskSlug,
  prevTaskSlug: propPrevTaskSlug
}) => {
  const navigate = useNavigate();

  // training.slugまたはtrainingSlugを使用
  const actualTrainingSlug = trainingSlug || training?.slug;

  // タスクリストから現在のタスクのインデックスを見つける
  const tasks = training?.tasks || [];
  const currentTaskIndex = tasks.findIndex((task: any) => task.slug === currentTaskSlug);
  
  // 前後のタスクを決定（propsで指定されていればそれを使用）
  const nextTaskSlug = propNextTaskSlug !== undefined 
    ? propNextTaskSlug 
    : (currentTaskIndex >= 0 && currentTaskIndex < tasks.length - 1)
      ? tasks[currentTaskIndex + 1].slug
      : null;
  
  const prevTaskSlug = propPrevTaskSlug !== undefined
    ? propPrevTaskSlug
    : (currentTaskIndex > 0)
      ? tasks[currentTaskIndex - 1].slug
      : null;

  const handleBack = () => {
    if (prevTaskSlug) {
      navigate(`/training/${actualTrainingSlug}/${prevTaskSlug}`);
    } else {
      navigate(`/training/${actualTrainingSlug}`);
    }
  };

  const handleNext = () => {
    if (nextTaskSlug) {
      navigate(`/training/${actualTrainingSlug}/${nextTaskSlug}`);
    }
  };

  return (
    <div className="mt-12 flex justify-between">
      <Button 
        variant="outline" 
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {prevTaskSlug ? '前のタスク' : 'トレーニング一覧へ戻る'}
      </Button>
      
      {nextTaskSlug && (
        <Button onClick={handleNext}>
          次のタスクへ進む
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default TaskNavigation;
