
import React from 'react';
import { cn } from '@/lib/utils';
import MdxPreview from './MdxPreview';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock } from 'lucide-react';

interface TaskContentProps {
  content: string;
  isPremium?: boolean;
  isFreePreview?: boolean;
  hasPremiumAccess?: boolean;
  className?: string;
  taskId?: string;
  userId?: string;
  isCompleted?: boolean;
  onProgressUpdate?: () => void;
}

/**
 * タスクコンテンツ表示コンポーネント
 */
const TaskContent: React.FC<TaskContentProps> = ({
  content,
  isPremium = false,
  isFreePreview = false,
  hasPremiumAccess = false,
  className,
  taskId,
  userId,
  isCompleted = false,
  onProgressUpdate,
}) => {
  const handleMarkCompleted = () => {
    if (onProgressUpdate) {
      onProgressUpdate();
    }
  };

  return (
    <div className={cn('task-content space-y-8', className)}>
      <div className="space-y-6">
        <MdxPreview 
          content={content} 
          isPremium={isPremium}
          isFreePreview={isFreePreview}
        />
        
        {/* タスク完了ボタン（最下部に表示） */}
        {userId && taskId && (
          <>
            <Separator className="my-8" />
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                <span>学習を記録しましょう</span>
              </div>
              {isCompleted ? (
                <Button 
                  variant="outline" 
                  onClick={handleMarkCompleted} 
                  className="flex items-center gap-2"
                  disabled
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>完了済み</span>
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  onClick={handleMarkCompleted} 
                  className="flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>完了にする</span>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskContent;
