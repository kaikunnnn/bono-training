
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TrainingHero from '@/components/training/TrainingHero';
import TrainingGrid from '@/components/training/TrainingGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Training } from '@/types/training';

const TrainingHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'challenge' | 'skill'>('challenge');

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

  // フィルタリングされたトレーニングを取得
  const filteredTrainings = trainings?.filter(
    (training) => training.type === activeTab
  ) || [];

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
          {/* タブ切り替え */}
          <div className="flex gap-4 border-b border-gray-200">
            <button
              className={`px-4 py-2 font-bold transition-colors ${
                activeTab === 'challenge'
                  ? 'text-training-dark border-b-2 border-training'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('challenge')}
            >
              チャレンジ
            </button>
            <button
              className={`px-4 py-2 font-bold transition-colors ${
                activeTab === 'skill'
                  ? 'text-training-dark border-b-2 border-training'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('skill')}
            >
              スキル
            </button>
          </div>

          {/* セクションタイトル */}
          <div className="mt-4">
            <h2 className="text-3xl font-bold font-['Rounded_Mplus_1c'] text-training-text">
              {activeTab === 'challenge' ? 'チャレンジ一覧' : 'スキル一覧'}
            </h2>
            <p className="mt-2 text-gray-600">
              {activeTab === 'challenge' 
                ? '実践的なプロジェクトで学ぶUI/UXデザイン。あなたのポートフォリオに追加しましょう。' 
                : '基本スキルを身につけるための練習課題。デザインの基礎を固めましょう。'
              }
            </p>
          </div>

          {/* トレーニングリスト */}
          <div className="mt-6">
            {filteredTrainings.length > 0 ? (
              <TrainingGrid trainings={filteredTrainings} />
            ) : (
              <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg text-gray-500">
                    {activeTab === 'challenge' 
                      ? 'チャレンジが見つかりません' 
                      : 'スキルトレーニングが見つかりません'
                    }
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
