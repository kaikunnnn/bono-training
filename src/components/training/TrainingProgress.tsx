
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TrainingProgressProps {
  tasks: { id: string; title: string; slug: string; is_premium?: boolean }[];
  progressMap: Record<string, { status?: string; completed_at?: string | null }>;
  trainingSlug: string;
  className?: string;
}

const TrainingProgress: React.FC<TrainingProgressProps> = ({
  tasks,
  progressMap,
  trainingSlug,
  className
}) => {
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    if (tasks.length === 0) return;
    
    // 完了タスク数を計算
    const completedTasks = tasks.filter(task => 
      progressMap[task.id]?.status === 'done'
    ).length;
    
    // 進捗率を計算（パーセント）
    const percentage = Math.round((completedTasks / tasks.length) * 100);
    setProgressPercentage(percentage);
  }, [tasks, progressMap]);

  const getStatusIcon = (taskId: string) => {
    const status = progressMap[taskId]?.status;
    
    if (status === 'done') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status === 'in-progress') {
      return <Clock className="w-5 h-5 text-blue-500" />;
    } else {
      return <AlertCircle className="w-5 h-5 text-gray-300" />;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">進捗状況</h3>
          <span className="text-sm font-medium">{progressPercentage}% 完了</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <Link
            key={task.id}
            to={`/training/${trainingSlug}/${task.slug}`}
            className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="mr-3">{getStatusIcon(task.id)}</span>
            <span className={cn(
              "flex-1",
              progressMap[task.id]?.status === 'done' ? 'text-green-700 dark:text-green-400' : ''
            )}>
              {task.title}
            </span>
            {task.is_premium && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                プレミアム
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrainingProgress;
