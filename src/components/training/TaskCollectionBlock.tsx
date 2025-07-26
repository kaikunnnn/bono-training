import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Task } from '@/types/training';

interface TaskCollectionBlockProps {
  tasks: Task[];
  trainingSlug: string;
  className?: string;
}

const TaskCollectionBlock: React.FC<TaskCollectionBlockProps> = ({ 
  tasks, 
  trainingSlug,
  className 
}) => {
  // タスクをorder_indexでソート
  const sortedTasks = [...tasks].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className={cn('w-full', className)}>
      {/* セクションタイトル */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">トレーニング内容</h2>
      </div>

      {/* タスクリスト */}
      <div className="relative">
        {/* 縦線（左側） */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-4">
          {sortedTasks.map((task, index) => (
            <div key={task.id} className="relative">
              {/* タスクカード */}
              <div className="relative ml-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {/* 左側の円（縦線との接続点） */}
                <div className="absolute -left-12 top-6 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                
                <Link
                  to={`/training/${trainingSlug}/${task.slug}`}
                  className="block group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* カテゴリタグ */}
                      <div className="mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {task.training_id ? 'CHALLENGE' : 'SKILL'}
                        </span>
                      </div>
                      
                      {/* タイトル */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </h3>
                      
                      {/* 説明（もしあれば） */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        このタスクでは、実践的なスキルを身につけることができます。
                      </p>
                      
                      {/* タグエリア */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                          ステップ {index + 1}
                        </span>
                        {task.is_premium && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-amber-100 text-amber-700">
                            プレミアム
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* 右矢印アイコン */}
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 18L15 12L9 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskCollectionBlock;