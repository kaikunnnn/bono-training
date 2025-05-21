import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { updateTaskProgress } from '@/services/training';

interface TaskActionButtonProps {
  taskId: string;
  userId: string;
  isCompleted: boolean;
  onProgressUpdate?: () => void;
  className?: string;
}

/**
 * タスクの完了/未完了を切り替えるボタンコンポーネント
 */
const TaskActionButton: React.FC<TaskActionButtonProps> = ({
  taskId,
  userId,
  isCompleted,
  onProgressUpdate,
  className
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!userId) {
      toast({
        title: "ログインが必要です",
        description: "タスクの完了状態を保存するには、ログインが必要です。",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const newStatus = isCompleted ? 'todo' : 'done';
      
      // 進捗状態を更新
      const { error } = await updateTaskProgress(userId, taskId, newStatus);
      
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
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isCompleted ? "outline" : "default"}
      className={cn(
        "flex items-center gap-2",
        isCompleted && "border-green-500 text-green-600",
        className
      )}
      onClick={handleComplete}
      disabled={isLoading}
    >
      <CheckCircle2 className="w-4 h-4" />
      {isCompleted ? "完了済み" : "完了にする"}
    </Button>
  );
};

export default TaskActionButton;