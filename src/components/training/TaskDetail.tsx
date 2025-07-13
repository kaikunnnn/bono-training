
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

import { cn } from '@/lib/utils';
import TaskHeader from './TaskHeader';
import TaskVideo from './TaskVideo';
import TaskContent from './TaskContent';

interface TaskDetailProps {
  task: Tables<'task'>;
  training: Tables<'training'>;
  mdxContent: string;
  className?: string;
  isPremium?: boolean;
  isSubscribed?: boolean;
  isFreePreview?: boolean;
}

/**
 * タスク詳細コンポーネント
 */
const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  training,
  mdxContent,
  className,
  isPremium = false,
  isSubscribed = false,
  isFreePreview = false
}) => {
  const { isSubscribed: contextIsSubscribed, hasMemberAccess } = useSubscriptionContext();

  // プレミアムコンテンツへのアクセス権があるかどうかを判定
  // hasMemberAccess=true の場合にのみプレミアムコンテンツにアクセス可能
  const hasPremiumAccess = contextIsSubscribed && hasMemberAccess;

  // デバッグ用ログ
  console.log('TaskDetail - コンテンツアクセス状態:', { 
    isPremium, 
    isSubscribed: contextIsSubscribed,
    hasMemberAccess,
    hasPremiumAccess,
    isFreePreview,
    taskTitle: task.title
  });

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      <TaskHeader 
        title={task.title}
        trainingTitle={training.title}
        trainingSlug={training.slug}
        difficulty={training.difficulty}
        isPremium={isPremium}
        hasPremiumAccess={hasPremiumAccess}
      />

      <TaskVideo 
        videoUrl={task.video_full} 
        previewVideoUrl={task.video_preview}
        isPremium={isPremium}
        hasPremiumAccess={hasPremiumAccess}
        title={task.title}
        previewSeconds={task.preview_sec}
        className="mb-10"
      />

      <TaskContent 
        content={mdxContent}
        isPremium={isPremium}
        isFreePreview={isFreePreview}
        hasPremiumAccess={hasPremiumAccess}
        className="mt-6"
      />
    </div>
  );
};

export default TaskDetail;
