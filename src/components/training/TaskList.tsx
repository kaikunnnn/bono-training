
import React from 'react';
import { Link } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { ContentGuard } from '@/components/subscription/ContentGuard';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Tables<'task'>[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const { slug } = useParams<{ slug: string }>();
  const { isSubscribed } = useSubscriptionContext();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">タスク一覧</h2>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Link
            key={task.id}
            to={`/training/${slug}/${task.slug}`}
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
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Lock className="w-4 h-4" />
                      <span>プレミアム</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-500">
                    完了
                  </span>
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
        ))}
      </div>
    </div>
  );
};

export default TaskList;
