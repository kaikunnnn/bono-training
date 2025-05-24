
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import TaskHeader from './TaskHeader';
import TaskVideo from './TaskVideo';
import TaskContent from './TaskContent';

interface TaskDetailProps {
  task: Tables<'task'>;
  training: Tables<'training'>;
  mdxContent: string;
  progress?: { status?: string; completed_at?: string | null } | null;
  className?: string;
  onProgressUpdate?: () => void;
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
  progress,
  className,
  onProgressUpdate,
  isPremium = false,
  isSubscribed = false,
  isFreePreview = false
}) => {
  const { user } = useAuth();
  const { isSubscribed: contextIsSubscribed, planMembers } = useSubscriptionContext();
  const navigate = useNavigate();
  const isCompleted = progress?.status === 'done';

  // プレミアムコンテンツへのアクセス権があるかどうかを判定
  // plan_members=true の場合にのみプレミアムコンテンツにアクセス可能
  const hasPremiumAccess = contextIsSubscribed && planMembers;

  // デバッグ用ログ
  console.log('TaskDetail - コンテンツアクセス状態:', { 
    isPremium, 
    isSubscribed: contextIsSubscribed,
    planMembers,
    hasPremiumAccess,
    isFreePreview,
    taskTitle: task.title,
    isCompleted
  });

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      <TaskHeader 
        title={task.title}
        trainingTitle={training.title}
        trainingSlug={training.slug}
        userId={user?.id}
        taskId={task.id}
        difficulty={training.difficulty}
        isPremium={isPremium}
        hasPremiumAccess={hasPremiumAccess}
        isCompleted={isCompleted}
        onProgressUpdate={onProgressUpdate}
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
        taskId={task.id}
        userId={user?.id}
        isCompleted={isCompleted}
        onProgressUpdate={onProgressUpdate}
      />
    </div>
  );
};

export default TaskDetail;
