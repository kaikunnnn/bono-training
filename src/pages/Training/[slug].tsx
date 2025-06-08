
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TaskList from '@/components/training/TaskList';
import { Progress } from "@/components/ui/progress";
import { getTrainingDetail, getUserTaskProgress } from '@/services/training';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import TrainingProgress from '@/components/training/TrainingProgress';

const TrainingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trainingData, setTrainingData] = useState<any>(null);
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchTrainingData = async () => {
      setLoading(true);
      try {
        if (!slug) return;

        // トレーニング詳細データを取得
        const trainingDetailData = await getTrainingDetail(slug);
        setTrainingData(trainingDetailData);
        
        // ユーザーがログインしている場合は進捗状況を取得
        if (user && trainingDetailData) {
          try {
            const progressData = await getUserTaskProgress(user.id, trainingDetailData.id);
            if (progressData && !progressData.error && progressData.progressMap) {
              setProgressMap(progressData.progressMap);
            }
          } catch (progressError) {
            console.error('進捗状況の取得に失敗しました:', progressError);
          }
        }
      } catch (error) {
        console.error('トレーニングデータの取得に失敗しました:', error);
        toast({
          title: 'エラーが発生しました',
          description: 'トレーニングデータの取得に失敗しました。もう一度お試しください。',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingData();
  }, [slug, toast, user]);

  if (loading) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-pulse">読み込み中...</div>
        </div>
      </TrainingLayout>
    );
  }

  if (!trainingData) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="flex justify-center items-center h-[400px]">
          <div>トレーニングが見つかりませんでした</div>
        </div>
      </TrainingLayout>
    );
  }

  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="px-6 py-8">
        {/* トレーニング情報 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{trainingData.title}</h1>
          <p className="text-gray-600 mb-4">{trainingData.description}</p>
          <div className="flex gap-2">
            {trainingData.tags?.map((tag) => (
              <span 
                key={tag}
                className="px-2 py-1 bg-gray-100 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 進捗バー */}
        {user && trainingData.tasks?.length > 0 && (
          <TrainingProgress
            tasks={trainingData.tasks}
            progressMap={progressMap}
            trainingSlug={slug || ''}
            className="mb-8"
          />
        )}

        {/* タスク一覧 */}
        {trainingData.tasks && <TaskList tasks={trainingData.tasks} trainingSlug={slug} />}
      </div>
    </TrainingLayout>
  );
};

export default TrainingDetail;
