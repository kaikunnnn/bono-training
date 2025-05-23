
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TaskActionButton from './TaskActionButton';

interface TaskHeaderProps {
  title: string;
  trainingTitle: string;
  trainingSlug: string;
  userId?: string;
  taskId: string;
  difficulty?: string;
  isPremium: boolean;
  hasPremiumAccess: boolean;
  isCompleted?: boolean;
  onProgressUpdate?: () => void;
}

/**
 * タスク詳細のヘッダー部分コンポーネント
 */
const TaskHeader: React.FC<TaskHeaderProps> = ({
  title,
  trainingTitle,
  trainingSlug,
  userId,
  taskId,
  difficulty,
  isPremium,
  hasPremiumAccess,
  isCompleted = false,
  onProgressUpdate
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/training/${trainingSlug}`);
  };

  return (
    <>
      {/* ナビゲーションヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 px-3 py-2"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{trainingTitle}に戻る</span>
        </Button>
        
        {userId && (
          <TaskActionButton
            userId={userId}
            taskId={taskId}
            isCompleted={isCompleted}
            onProgressUpdate={onProgressUpdate}
          />
        )}
      </div>

      {/* ヘッダー情報 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
          <Badge variant="secondary" className="text-xs">
            {difficulty || '初級'}
          </Badge>
          
          {isPremium && (
            <Badge variant={hasPremiumAccess ? "outline" : "outline"} className={
              hasPremiumAccess 
                ? "border-green-300 bg-green-50 text-green-600" 
                : "border-amber-300 bg-amber-50 text-amber-600"
            }>
              {hasPremiumAccess ? "メンバー特典" : "メンバー限定"}
            </Badge>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskHeader;
