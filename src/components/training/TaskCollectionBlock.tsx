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
              <div className="w-0.5 h-[153px] bg-[#94A3B8]"></div>
              
              {/* task-training-card */}
              <div className="flex-1 bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm">
                <Link
                  to={`/training/${trainingSlug}/${task.slug}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* カテゴリタグ */}
                      <div className="mb-2">
                        <span className="inline-flex items-center px-[6px] py-[2px] rounded text-xs font-medium bg-[rgba(184,163,4,0.12)] text-[#5E4700]">
                          説明
                        </span>
                      </div>
                      
                      {/* タイトル */}
                      <h3 className="text-lg font-bold text-[#0D0F18] mb-2 group-hover:text-blue-600 transition-colors leading-[160%] tracking-[0.75px]">
                        {task.title}
                      </h3>
                      
                      {/* 説明 */}
                      <p className="text-sm text-[#0F1742] mb-2 line-clamp-2 font-normal leading-[185%]">
                        ユーザーインタビューでリアルな課題を発見して、解決するプロトタイプをデザインするお題です
                      </p>
                      
                      {/* タグエリア */}
                      <div className="flex items-start gap-2">
                        <span className="text-[#94A3B8] text-xs font-bold leading-[160%] tracking-[1px]">
                          課題解決
                        </span>
                        <span className="text-[#94A3B8] text-xs font-bold leading-[160%] tracking-[1px]">
                          ポートフォリオ
                        </span>
                        {task.is_premium && (
                          <span className="text-[#94A3B8] text-xs font-bold leading-[160%] tracking-[1px]">
                            プレミアム
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* 右矢印アイコン */}
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-8 h-8 bg-[#238CF0] border-2 border-[#0D221D] rounded-full flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors p-2">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="transform rotate-[135deg]"
                        >
                          <path
                            d="M11.1968 7.0979L8.27098 10.0237L7.53487 9.28758L9.20527 7.61718L3.04986 7.61718L3.04916 7.48391L3.04916 6.71189L3.04986 6.57862L9.20527 6.57862L7.53487 4.90822L8.27098 4.17211L11.1968 7.0979Z"
                            fill="white"
                            stroke="white"
                            strokeWidth="0.266667"
                          />
                        </svg>
                      </div>
                    </div>
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