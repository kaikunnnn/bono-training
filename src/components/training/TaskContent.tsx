
import React from 'react';
import MdxPreview from './MdxPreview';

interface TaskContentProps {
  content: string;
  isPremium: boolean;
  hasPremiumAccess: boolean;
  className?: string;
}

/**
 * タスク詳細のコンテンツ部分コンポーネント
 */
const TaskContent: React.FC<TaskContentProps> = ({
  content,
  isPremium,
  hasPremiumAccess,
  className
}) => {
  return (
    <div className={className}>
      <div className="prose prose-lg prose-slate max-w-none">
        <MdxPreview
          content={content}
          isPremium={isPremium}
          isSubscribed={hasPremiumAccess}
          previewLength={1000}
        />
      </div>
    </div>
  );
};

export default TaskContent;
