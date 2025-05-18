
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ShareButton from '@/components/training/ShareButton';

interface TaskNavigationProps {
  trainingSlug: string;
  nextTaskSlug?: string | null;
  taskTitle?: string;
}

const TaskNavigation: React.FC<TaskNavigationProps> = ({ 
  trainingSlug,
  nextTaskSlug,
  taskTitle
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/training/${trainingSlug}`);
  };

  const handleNext = () => {
    if (nextTaskSlug) {
      navigate(`/training/${trainingSlug}/${nextTaskSlug}`);
    }
  };

  return (
    <div className="mt-12 flex justify-between items-center">
      <Button 
        variant="outline" 
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        トレーニング一覧へ戻る
      </Button>
      
      <div className="flex gap-2">
        {taskTitle && (
          <ShareButton 
            title={`BONOトレーニング「${taskTitle}」`}
            text={`今BONOトレーニングで「${taskTitle}」に取り組んでいます！`}
          />
        )}
        
        {nextTaskSlug && (
          <Button onClick={handleNext}>
            次のタスクへ進む
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskNavigation;
