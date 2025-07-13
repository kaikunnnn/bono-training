
import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';
import { Task } from '@/types/training';

interface TaskListProps {
  tasks: Task[];
  trainingSlug: string;
  className?: string;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  trainingSlug,
  className 
}) => {
  const { isSubscribed } = useSubscriptionContext();
  
  // trainingSlugが空の場合はエラーログを出す
  if (!trainingSlug) {
    console.error('TaskList: trainingSlugが指定されていません');
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">エラー: トレーニングスラッグが指定されていません</p>
      </div>
    );
  }

  console.log('TaskList - trainingSlug:', trainingSlug, 'tasks:', tasks);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid gap-4">
        {tasks.map((task) => {
          return (
            <Link
              key={task.id}
              to={`/training/${trainingSlug}/${task.slug}`}
              className={cn(
                "block p-6 bg-white rounded-xl border-2 border-[#374151] transition-colors",
                task.is_premium && !isSubscribed 
                  ? "opacity-80 hover:opacity-100" 
                  : "hover:bg-gray-50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    {task.is_premium && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <Lock className="w-3 h-3" />
                        <span>プレミアム</span>
                      </div>
                    )}
                  </div>
                  {task.is_premium && !isSubscribed && (
                    <div className="mt-2 text-sm text-gray-500">
                      プレビュー可能 - {task.preview_sec}秒
                    </div>
                  )}
                </div>
                <div className="text-gray-400">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 6L15 12L9 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;
