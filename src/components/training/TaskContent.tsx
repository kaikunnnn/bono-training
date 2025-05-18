
import React from 'react';
import MdxPreview from './MdxPreview';
import { cn } from '@/lib/utils';

interface TaskContentProps {
  content: string;
  isPremium: boolean;
  hasPremiumAccess: boolean;
  previewMarker?: string;
  className?: string;
}

/**
 * タスク詳細のコンテンツ部分コンポーネント
 */
const TaskContent: React.FC<TaskContentProps> = ({
  content,
  isPremium,
  hasPremiumAccess,
  previewMarker,
  className
}) => {
  // コンテンツが空の場合のフォールバック
  if (!content) {
    return (
      <div className={cn("prose prose-lg prose-slate max-w-none", className)}>
        <div className="bg-muted/30 p-6 rounded-md text-center">
          <h3 className="text-lg font-medium">コンテンツがありません</h3>
          <p className="text-muted-foreground">このタスクにはまだコンテンツが追加されていません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="prose prose-lg prose-slate max-w-none">
        <MdxPreview
          content={content}
          isPremium={isPremium}
          isSubscribed={hasPremiumAccess}
          previewMarker={previewMarker}
          previewLength={1000}
        />
      </div>
    </div>
  );
};

export default TaskContent;
