
import React, { memo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TrainingHero from '@/components/training/TrainingHero';
import TrainingGrid from '@/components/training/TrainingGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Training } from '@/types/training';
import { loadAllTrainingMeta } from '@/utils/mdxLoader';
import { useToast } from '@/hooks/use-toast';
import { QueryKeys } from '@/utils/queryUtils';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import LoadingFallback from '@/components/LoadingFallback';

// メモ化したトレーニンググリッドコンポーネント
const MemoizedTrainingGrid = memo(TrainingGrid);

const TrainingHome: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: trainings, isLoading, error } = useQuery({
    queryKey: [QueryKeys.trainings],
    queryFn: async () => {
      try {
        // 1. Supabaseからトレーニングデータを取得
        const { data: supabaseData, error } = await supabase
          .from('training')
          .select('*');

        if (error) throw error;

        // 2. content/training/ ディレクトリからMDXメタデータを取得
        let mdxTrainings: Training[] = [];
        try {
          const mdxData = await loadAllTrainingMeta();
          
          // MDXデータをTraining型に変換
          mdxTrainings = mdxData.map(meta => ({
            id: `mdx-${meta.slug}`,
            slug: meta.slug,
            title: meta.title || meta.slug,
            description: meta.description || '',
            type: (meta.type as 'challenge' | 'skill') || 'challenge',
            difficulty: meta.difficulty || '初級',
            tags: meta.tags || [],
            // サムネイル画像を設定
            thumbnailImage: meta.thumbnailImage || 'https://source.unsplash.com/random/200x100'
          }));
        } catch (mdxError) {
          console.error('MDXデータの読み込みエラー:', mdxError);
          // MDXの読み込みに失敗しても処理を続行
        }

        // 3. 両方のソースからのデータを結合
        const combinedData = [
          ...(supabaseData || []),
          ...mdxTrainings
        ];
        
        // スラッグの重複を削除（Supabaseデータを優先）
        const slugMap = new Map();
        combinedData.forEach(item => {
          if (!slugMap.has(item.slug)) {
            slugMap.set(item.slug, item);
          }
        });
        
        return Array.from(slugMap.values()) as Training[];
      } catch (error) {
        console.error('トレーニングデータ取得エラー:', error);
        toast({
          title: "データ取得エラー",
          description: "トレーニングデータの取得中にエラーが発生しました。",
          variant: "destructive"
        });
        throw error; // エラーを投げてErrorBoundaryに捕捉させる
      }
    },
    staleTime: 1000 * 60 * 10, // 10分間はstaleとみなさない（トレーニング一覧はそう頻繁に更新されないため）
  });

  if (error) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="flex justify-center items-center h-[400px]">
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            データの取得中にエラーが発生しました。更新ボタンをクリックして再読み込みしてください。
            <button 
              onClick={() => queryClient.invalidateQueries({ queryKey: [QueryKeys.trainings] })}
              className="mt-2 px-4 py-2 bg-primary text-white rounded-md"
            >
              更新
            </button>
          </div>
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
          <ErrorBoundary fallback={<div>エラーが発生しました。再読み込みしてください。</div>}>
            {isLoading ? (
              <LoadingFallback height="400px" message="トレーニングデータを読み込み中..." />
            ) : trainings && trainings.length > 0 ? (
              <MemoizedTrainingGrid trainings={trainings} />
            ) : (
              <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg text-gray-500">
                    トレーニングコンテンツが見つかりません
                  </p>
                </CardContent>
              </Card>
            )}
          </ErrorBoundary>
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TrainingHome;
