
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { getTrainingTaskDetail, getTrainingDetail, getUserTaskProgress } from '@/services/training';
import { TaskDetailData } from '@/types/training';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import TaskDetail from '@/components/training/TaskDetail';
import TaskDetailSkeleton from './TaskDetailSkeleton';
import TaskDetailError from './TaskDetailError';
import TaskNavigation from './TaskNavigation';
import AchievementCard from '@/components/training/AchievementCard';
import { QueryKeys } from '@/utils/queryUtils';

const TaskDetailPage = () => {
  const { trainingSlug, taskSlug } = useParams<{ trainingSlug: string; taskSlug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAchievement, setShowAchievement] = useState<boolean>(false);
  
  // トレーニング詳細を取得
  const { 
    data: trainingData,
    isLoading: trainingLoading,
    error: trainingError 
  } = useQuery({
    queryKey: QueryKeys.trainingDetail(trainingSlug || ''),
    queryFn: () => getTrainingDetail(trainingSlug || ''),
    enabled: !!trainingSlug,
    staleTime: 1000 * 60 * 5, // 5分間はstaleとみなさない
  });
  
  // タスク詳細を取得
  const { 
    data: taskData,
    isLoading: taskLoading,
    error: taskError 
  } = useQuery({
    queryKey: QueryKeys.taskDetail(trainingSlug || '', taskSlug || ''),
    queryFn: () => getTrainingTaskDetail(trainingSlug || '', taskSlug || ''),
    enabled: !!trainingSlug && !!taskSlug,
    staleTime: 1000 * 60 * 5, // 5分間はstaleとみなさない
  });
  
  // ユーザーの進捗データを取得
  const {
    data: progress,
    isLoading: progressLoading
  } = useQuery({
    queryKey: QueryKeys.userProgress(user?.id || '', trainingData?.id || ''),
    queryFn: () => getUserTaskProgress(user?.id || '', trainingData?.id || ''),
    enabled: !!user && !!trainingData?.id,
    staleTime: 1000 * 30, // 30秒間はstaleとみなさない（進捗は頻繁に更新される可能性があるため）
  });
  
  // タスク難易度に基づいたバッジタイプを決定
  const getBadgeType = useCallback(() => {
    if (!trainingData?.difficulty) return 'beginner';
    
    switch (trainingData.difficulty.toLowerCase()) {
      case 'easy': return 'beginner';
      case 'normal': return 'intermediate';
      case 'hard': return 'advanced';
      default: return 'beginner';
    }
  }, [trainingData?.difficulty]);
  
  // タスクの完了状態を確認してAchievementCardの表示を判断
  useEffect(() => {
    if (taskData && progress?.progressMap) {
      const isCompleted = progress.progressMap[taskData.id]?.status === 'done';
      setShowAchievement(isCompleted);
    }
  }, [taskData, progress]);
  
  // タスク進捗が更新されたときに進捗データを再取得
  const handleProgressUpdate = useCallback(async () => {
    if (!user || !trainingData?.id || !taskData) return;
    
    try {
      // ユーザー進捗を再フェッチ
      await queryClient.invalidateQueries({ 
        queryKey: QueryKeys.userProgress(user.id, trainingData.id) 
      });
      
      // タスクが完了したかチェック (進捗データが更新された後)
      const updatedProgress = queryClient.getQueryData(
        QueryKeys.userProgress(user.id, trainingData.id)
      );
      
      const isCompleted = updatedProgress?.progressMap?.[taskData.id]?.status === 'done';
      setShowAchievement(isCompleted);
      
      toast({
        title: isCompleted ? "タスク完了！" : "タスクの進捗を更新しました",
        description: isCompleted ? "おめでとうございます！タスクを完了しました。" : "タスクの進捗状態が正常に更新されました。",
      });
    } catch (error) {
      console.error('進捗状況の更新に失敗しました:', error);
      toast({
        title: "エラーが発生しました",
        description: "進捗状況の更新に失敗しました。",
        variant: "destructive"
      });
    }
  }, [user, trainingData, taskData, toast, queryClient]);
  
  const isLoading = trainingLoading || taskLoading || progressLoading;
  const error = trainingError || taskError;
  
  if (isLoading) {
    return <TaskDetailSkeleton />;
  }
  
  if (error || !taskData || !trainingData) {
    return <TaskDetailError />;
  }
  
  // バッジタイプを決定
  const badgeType = getBadgeType();
  
  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container py-8">
        {showAchievement && (
          <AchievementCard
            title={taskData.title}
            shareText={`BONOトレーニングで「${taskData.title}」のタスクを完了しました！学習を続けています。`}
            className="mb-8"
            badgeType={badgeType}
          />
        )}
        
        <TaskDetail
          task={taskData}
          training={trainingData}
          mdxContent={taskData.content}
          progress={progress?.progressMap?.[taskData.id]}
          onProgressUpdate={handleProgressUpdate}
          isPremium={taskData.is_premium || false}
          className={showAchievement ? "opacity-75" : ""}
        />

        <TaskNavigation 
          trainingSlug={trainingSlug || ''} 
          nextTaskSlug={taskData.next_task}
          taskTitle={taskData.title}
        />
      </div>
    </TrainingLayout>
  );
};

export default TaskDetailPage;
