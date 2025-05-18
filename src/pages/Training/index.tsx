
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TrainingHero from '@/components/training/TrainingHero';
import TrainingGrid from '@/components/training/TrainingGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Training } from '@/types/training';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TrainingHome: React.FC = () => {
  const { data: trainings, isLoading } = useQuery({
    queryKey: ['trainings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training')
        .select('*');

      if (error) throw error;
      return data as Training[];
    }
  });

  if (isLoading) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-pulse">読み込み中...</div>
        </div>
      </TrainingLayout>
    );
  }

  return (
    <TrainingLayout>
      <TrainingHeader />
      <TrainingHero />
      <div className="px-6 py-12">
        <div className="flex flex-col gap-8 max-w-[1200px] mx-auto">
          {/* セクションタイトル */}
          <div className="mt-4">
            <h2 className="text-3xl font-bold font-['Rounded_Mplus_1c'] text-training-text">
              トレーニング一覧
            </h2>
            <p className="mt-2 text-gray-600">
              デザインスキルを磨くための実践的なトレーニングコンテンツです。
            </p>
          </div>

          {/* トレーニングリスト */}
          <div className="mt-6">
            {trainings && trainings.length > 0 ? (
              <TrainingGrid trainings={trainings} />
            ) : (
              <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg text-gray-500">
                    トレーニングコンテンツが見つかりません
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TrainingHome;
