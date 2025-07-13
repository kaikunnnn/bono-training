
import React from 'react';
import { cn } from '@/lib/utils';
import MdxPreview from './MdxPreview';

interface TaskContentProps {
  content: string;
  isPremium?: boolean;
  isFreePreview?: boolean;
  hasPremiumAccess?: boolean;
  className?: string;
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
}) => {
  return (
    <div className={cn('task-content space-y-8', className)}>
      <div className="space-y-6">
        <MdxPreview 
          content={content} 
          isPremium={isPremium}
          isFreePreview={isFreePreview}
        />
      </div>
    </div>
  );
};

export default TaskContent;
