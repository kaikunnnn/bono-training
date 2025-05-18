
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, CircleDashed, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Badge } from '@/components/ui/badge';

interface TaskListProps {
  tasks: {
    id: string;
    title: string;
    slug: string;
    order_index?: number;
    is_premium?: boolean;
  }[];
  progressMap: Record<string, { status?: string; completed_at?: string | null }>;
  trainingSlug: string;
  className?: string;
}

/**
 * タスク一覧コンポーネント
 * 完了済みタスクを視覚的に分かりやすく表示する改善を実装
 */
const TaskList: React.FC<TaskListProps> = ({
  tasks,
  progressMap = {},
  trainingSlug,
  className
}) => {
  const { isSubscribed, planMembers } = useSubscriptionContext();
  const hasPremiumAccess = isSubscribed && planMembers;
  
  // タスクを順番に並べ替え
  const sortedTasks = [...tasks].sort((a, b) => 
    (a.order_index || 0) - (b.order_index || 0)
  );

  const getTaskStatusIcon = (taskId: string, isPremium: boolean = false) => {
    // 有料タスクで、有料会員でない場合はロックアイコン
    if (isPremium && !hasPremiumAccess) {
      return <Lock className="w-5 h-5 text-amber-500" />;
    }
    
    const status = progressMap[taskId]?.status;
    
    if (status === 'done') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status === 'in-progress') {
      return <Clock className="w-5 h-5 text-blue-500" />;
    } else {
      return <CircleDashed className="w-5 h-5 text-gray-300" />;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {sortedTasks.map((task) => (
        <Link
          key={task.id}
          to={`/training/${trainingSlug}/${task.slug}`}
          className={cn(
            "flex items-center p-3 rounded-lg border transition-all",
            progressMap[task.id]?.status === 'done' 
              ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800" 
              : "border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700",
          )}
        >
          <span className="mr-3">{getTaskStatusIcon(task.id, task.is_premium)}</span>
          <span className={cn(
            "flex-1",
            progressMap[task.id]?.status === 'done' ? 'text-green-700 font-medium dark:text-green-400' : ''
          )}>
            {task.title}
          </span>
          <div className="flex items-center space-x-2">
            {progressMap[task.id]?.status === 'done' && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                完了
              </Badge>
            )}
            {task.is_premium && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                プレミアム
              </Badge>
            )}
          </div>
        </Link>
      ))}
      
      {sortedTasks.length === 0 && (
        <div className="p-4 text-center text-gray-500 border border-dashed rounded-lg">
          タスクがありません
        </div>
      )}
    </div>
  );
};

export default TaskList;
