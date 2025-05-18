
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, CircleDashed, Award, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [completedTasks, setCompletedTasks] = useState(0);
  const [milestoneReached, setMilestoneReached] = useState<string | null>(null);

  useEffect(() => {
    if (tasks.length === 0) return;
    
    // 完了タスク数を計算
    const completed = tasks.filter(task => 
      progressMap[task.id]?.status === 'done'
    ).length;
    
    // 進捗率を計算（パーセント）
    const percentage = Math.round((completed / tasks.length) * 100);
    setProgressPercentage(percentage);
    setCompletedTasks(completed);
    
    // マイルストーンの計算
    if (percentage === 100) {
      setMilestoneReached('complete');
    } else if (percentage >= 75) {
      setMilestoneReached('advanced');
    } else if (percentage >= 50) {
      setMilestoneReached('halfway');
    } else if (percentage >= 25) {
      setMilestoneReached('started');
    } else if (percentage > 0) {
      setMilestoneReached('beginner');
    }
  }, [tasks, progressMap]);

  const getStatusIcon = (taskId: string) => {
    const status = progressMap[taskId]?.status;
    
    if (status === 'done') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status === 'in-progress') {
      return <Clock className="w-5 h-5 text-blue-500" />;
    } else {
      return <CircleDashed className="w-5 h-5 text-gray-300" />;
    }
  };
  
  // マイルストーンに対応するアイコンとメッセージを取得
  const getMilestoneInfo = () => {
    switch (milestoneReached) {
      case 'complete':
        return {
          icon: <Trophy className="w-5 h-5 text-amber-500" />,
          message: "完全制覇！おめでとうございます！",
          color: "text-amber-600 dark:text-amber-400"
        };
      case 'advanced':
        return {
          icon: <Award className="w-5 h-5 text-purple-500" />,
          message: "もう少し！あと一息です！",
          color: "text-purple-600 dark:text-purple-400"
        };
      case 'halfway':
        return {
          icon: <Award className="w-5 h-5 text-blue-500" />,
          message: "中間地点達成！頑張っています！",
          color: "text-blue-600 dark:text-blue-400"
        };
      case 'started':
        return {
          icon: <Award className="w-5 h-5 text-green-500" />,
          message: "良いスタートです！続けましょう！",
          color: "text-green-600 dark:text-green-400"
        };
      case 'beginner':
        return {
          icon: <Award className="w-5 h-5 text-gray-500" />,
          message: "トレーニングを開始しました！",
          color: "text-gray-600 dark:text-gray-400"
        };
      default:
        return null;
    }
  };
  
  const milestoneInfo = getMilestoneInfo();

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">進捗状況</h3>
          <span className="text-sm font-medium">
            {completedTasks}/{tasks.length} タスク ({progressPercentage}%)
          </span>
        </div>
        
        <div className="relative">
          <Progress 
            value={progressPercentage} 
            className={cn(
              "h-2.5 rounded-full",
              progressPercentage === 100 ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-800"
            )}
          />
          
          {/* マイルストーンマーカー */}
          <div className="flex justify-between mt-1 px-0.5">
            {[25, 50, 75, 100].map(milestone => (
              <TooltipProvider key={milestone}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "h-3 w-3 rounded-full border-2 -mt-2.5",
                      progressPercentage >= milestone 
                        ? "bg-green-500 border-green-300 dark:border-green-700" 
                        : "bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    )} style={{ marginLeft: `${milestone}%`, transform: 'translateX(-50%)' }}></div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{milestone}% 完了</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
        
        {/* マイルストーン達成メッセージ */}
        {milestoneInfo && (
          <div className={cn(
            "flex items-center gap-2 mt-2 p-2 rounded-md bg-opacity-10",
            progressPercentage === 100 ? "bg-amber-50 dark:bg-amber-900/20" : "bg-blue-50 dark:bg-blue-900/20"
          )}>
            {milestoneInfo.icon}
            <span className={cn("text-sm font-medium", milestoneInfo.color)}>
              {milestoneInfo.message}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <Link
            key={task.id}
            to={`/training/${trainingSlug}/${task.slug}`}
            className={cn(
              "flex items-center p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
              progressMap[task.id]?.status === 'done' 
                ? "bg-green-50 dark:bg-green-900/10" 
                : ""
            )}
          >
            <span className="mr-2.5">{getStatusIcon(task.id)}</span>
            <span className={cn(
              "flex-1 text-sm",
              progressMap[task.id]?.status === 'done' ? 'text-green-700 dark:text-green-400' : ''
            )}>
              {task.title}
            </span>
            {task.is_premium && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px]">
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
