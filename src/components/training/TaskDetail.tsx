
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import MdxPreview from './MdxPreview';
import PremiumContentBanner from './PremiumContentBanner';
import VimeoPlayer from '@/components/content/VimeoPlayer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { updateTaskProgress } from '@/services/training';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TaskDetailProps {
  task: Tables<'task'>;
  training: Tables<'training'>;
  mdxContent: string;
  progress?: { status?: string; completed_at?: string | null } | null;
  className?: string;
  onProgressUpdate?: () => void;
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
  onProgressUpdate
}) => {
  const { user } = useAuth();
  const { isSubscribed } = useSubscriptionContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  const isCompleted = progress?.status === 'done';

  const handleComplete = async () => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "タスクの完了状態を保存するには、ログインが必要です。",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCompleting(true);
      const newStatus = isCompleted ? 'todo' : 'done';
      
      // 進捗状態を更新
      const { error } = await updateTaskProgress(user.id, task.id, newStatus);
      
      if (error) {
        throw error;
      }
      
      // 完了ステータスを更新
      toast({
        title: newStatus === 'done' ? "タスク完了！" : "タスクを未完了に戻しました",
        description: newStatus === 'done' 
          ? "おめでとうございます！タスクを完了しました。" 
          : "タスクのステータスを未完了に戻しました。",
        variant: "default"
      });
      
      // 親コンポーネントに通知
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (error) {
      console.error('タスク完了状態の更新に失敗しました:', error);
      toast({
        title: "エラーが発生しました",
        description: "タスクの完了状態を更新できませんでした。もう一度お試しください。",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleBack = () => {
    navigate(`/training/${training.slug}`);
  };

  const handleSubscribe = () => {
    navigate('/subscription', { state: { returnUrl: window.location.pathname } });
  };

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* ナビゲーションヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 px-3 py-2"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{training.title}に戻る</span>
        </Button>
        
        {user && (
          <Button
            variant={isCompleted ? "outline" : "default"}
            className={cn(
              "flex items-center gap-2",
              isCompleted && "border-green-500 text-green-600"
            )}
            onClick={handleComplete}
            disabled={isCompleting}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isCompleted ? "完了済み" : "完了にする"}
          </Button>
        )}
      </div>

      {/* ヘッダー情報 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{task.title}</h1>
        
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
          <Badge variant="secondary" className="text-xs">
            {training.difficulty || '初級'}
          </Badge>
          
          {task.is_premium && (
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-600 text-xs">
              プレミアム
            </Badge>
          )}
        </div>
      </div>

      {/* 動画プレーヤー */}
      <div className="mb-10">
        {task.is_premium && !isSubscribed ? (
          <>
            <div className="relative">
              <VimeoPlayer
                vimeoId={task.video_preview || ""}
                title={task.title}
                className="rounded-lg overflow-hidden shadow-lg"
              />
              <div className="absolute bottom-4 right-4">
                <Badge className="bg-amber-500">プレビュー {task.preview_sec}秒</Badge>
              </div>
            </div>
            <PremiumContentBanner className="mt-4" onSubscribe={handleSubscribe} />
          </>
        ) : (
          <VimeoPlayer
            vimeoId={task.video_full || task.video_preview || ""}
            title={task.title}
            className="rounded-lg overflow-hidden shadow-lg"
          />
        )}
      </div>

      {/* コンテンツ本文 */}
      <div className="prose prose-lg prose-slate max-w-none">
        <MdxPreview
          content={mdxContent}
          isPremium={task.is_premium}
          isSubscribed={isSubscribed}
          previewLength={1000}
        />
      </div>
    </div>
  );
};

export default TaskDetail;
