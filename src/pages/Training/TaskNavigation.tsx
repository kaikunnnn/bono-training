import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TaskNavigationProps {
  trainingSlug: string;
  nextTaskSlug?: string | null;
  prevTaskSlug?: string | null;
}

const TaskNavigation: React.FC<TaskNavigationProps> = ({ 
  trainingSlug,
  nextTaskSlug,
  prevTaskSlug
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (prevTaskSlug) {
      navigate(`/training/${trainingSlug}/${prevTaskSlug}`);
    } else {
      navigate(`/training/${trainingSlug}`);
    }
  };

  const handleNext = () => {
    if (nextTaskSlug) {
      navigate(`/training/${trainingSlug}/${nextTaskSlug}`);
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