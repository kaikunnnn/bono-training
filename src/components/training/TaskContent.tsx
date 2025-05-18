
import React from 'react';
import MdxPreview from './MdxPreview';
import { cn } from '@/lib/utils';

interface TaskContentProps {
  content: string;
  isPremium?: boolean;
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
  hasPremiumAccess = false,
  className,
  taskId,
  userId,
  isCompleted = false,
  onProgressUpdate
}) => {
  return (
    <div className={cn('', className)}>
      <MdxPreview
        content={content}
        isPremium={isPremium}
        isSubscribed={hasPremiumAccess}
        taskId={taskId}
        userId={userId}
        isCompleted={isCompleted}
        onProgressUpdate={onProgressUpdate}
        previewMarker="<!--PREMIUM-->"
      />
    </div>
  );
};

export default TaskContent;
