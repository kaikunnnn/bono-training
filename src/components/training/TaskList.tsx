
import React from 'react';
import { Link } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface TaskListProps {
  tasks: Tables<'task'>[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">タスク一覧</h2>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Link
            key={task.id}
            to={`/training/${slug}/${task.slug}`}
            className="block p-6 bg-white rounded-xl border-2 border-[#374151] hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  {task.is_premium && (
                    <Lock className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-500">
                    完了
                  </span>
                </div>
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
