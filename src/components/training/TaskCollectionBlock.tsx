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
      <div className="flex flex-col gap-[11px]">
        {sortedTasks.map((task, index) => (
          <div key={task.id} className="training-content">
            {/* numberoftraining セクション */}
            <div className="flex items-center gap-5 mb-[11px]">
              {/* 小さな黒い円 */}
              <img src="/images/dot/dot-gradation-01.svg" alt="" className="w-3 h-3" />
              
              {/* テキスト部分 */}
              <div className="flex items-center gap-2">
                <span className="text-[#0D221D] text-xs font-normal leading-[100%]">
                  {task.training_id ? 'CHALLENGE' : 'SKILL'}
                </span>
                <span className="text-[#0D221D] text-base font-normal leading-[100%]">
                  {String(task.order_index).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* training-detail セクション */}
            <div className="flex items-center gap-[25px]">
              {/* 縦のドット線 */}
              <svg 
                className="w-px h-[153px] md:ml-[5px]" 
                viewBox="0 0 1 153" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <line 
                  x1="0.5" 
                  y1="0" 
                  x2="0.5" 
                  y2="153" 
                  stroke="#94A3B8" 
                  strokeWidth="1"
                  strokeDasharray="8 8"
                />
              </svg>
              
              {/* task-training-card */}
              <div 
                className="flex-1 bg-white rounded-[24px] p-8 border border-[#0d0f18]"
                style={{ boxShadow: '1px 1px 24px 0 rgb(0 0 0 / 0.075)' }}
              >
                <Link
                  to={`/training/${trainingSlug}/${task.slug}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* カテゴリタグ */}
                      {task.category && (
                        <div className="mb-2">
                          <span className="inline-flex items-center px-[6px] py-[2px] rounded text-xs font-medium bg-[rgba(184,163,4,0.12)] text-[#5E4700]">
                            {task.category}
                          </span>
                        </div>
                      )}
                      
                      {/* タイトル */}
                      <h3 className="text-lg font-bold text-[#0D0F18] group-hover:text-blue-600 transition-colors leading-[160%] tracking-[0.75px]">
                        {task.title}
                      </h3>
                      
                      {/* 説明 */}
                      {task.description && (
                        <p className="text-sm text-[#0F1742] mb-2 line-clamp-2 font-normal leading-[148%]">
                          {task.description}
                        </p>
                      )}
                      
                      {/* タグエリア */}
                      <div className="flex items-start gap-2">
                        {task.tags?.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="text-[#94A3B8] text-xs font-bold leading-[160%] tracking-[1px]"
                          >
                            {tag}
                          </span>
                        ))}
                        {task.is_premium && (
                          <span className="text-[#94A3B8] text-xs font-bold leading-[160%] tracking-[1px]">
                            プレミアム
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* 右矢印アイコン */}
                    <img 
                      src="/images/arrow/arrow/primary/right.svg" 
                      alt=""
                      className="ml-4 flex-shrink-0 w-7 h-7 md:w-8 md:h-8"
                    />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskCollectionBlock;