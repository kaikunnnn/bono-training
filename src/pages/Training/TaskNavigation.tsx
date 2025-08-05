
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TaskNavigationProps {
  training: any;
  currentTaskSlug: string;
  trainingSlug: string;
  nextTaskSlug?: string | null;
  prevTaskSlug?: string | null;
}

const TaskNavigation: React.FC<TaskNavigationProps> = ({ 
  training,
  currentTaskSlug,
  trainingSlug,
  nextTaskSlug,
  prevTaskSlug
}) => {
  const navigate = useNavigate();

  // trainingSlugが空の場合のエラーハンドリング
  if (!trainingSlug) {
    console.error('TaskNavigation: trainingSlugが指定されていません');
    return (
      <div className="mt-12 flex justify-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/training')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          トレーニング一覧へ戻る
        </Button>
      </div>
    );
  }

  console.log('TaskNavigation - フロントマターベース:', { 
    trainingSlug, 
    currentTaskSlug, 
    nextTaskSlug, 
    prevTaskSlug 
  });

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

  return null;
};

export default TaskNavigation;
