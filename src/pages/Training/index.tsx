
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TrainingHero from '@/components/training/TrainingHero';
import TrainingGrid from '@/components/training/TrainingGrid';
import TrainingTabs from '@/components/training/TrainingTabs';
import TrainingSearch from '@/components/training/TrainingSearch';
import TrainingTagFilter from '@/components/training/TrainingTagFilter';
import { Training } from '@/types/training';

const TrainingHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'challenge' | 'skill'>('challenge');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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

  // 全タグのリストを取得
  const allTags = useMemo(() => {
    if (!trainings) return [];
    const tagSet = new Set<string>();
    trainings.forEach(training => {
      training.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [trainings]);

  // トレーニングをフィルタリング
  const filteredTrainings = useMemo(() => {
    if (!trainings) return [];
    
    return trainings.filter(training => {
      // タブによるフィルタリング
      if (training.type !== activeTab) return false;
      
      // 検索クエリによるフィルタリング
      if (searchQuery && !training.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // タグによるフィルタリング
      if (selectedTag && (!training.tags || !training.tags.includes(selectedTag))) {
        return false;
      }
      
      return true;
    });
  }, [trainings, activeTab, searchQuery, selectedTag]);

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
      <div className="px-6 py-8">
        <div className="flex flex-col gap-8 max-w-[1200px] mx-auto">
          {/* フィルターコントロール */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <TrainingTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <TrainingSearch
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          
          {/* タグフィルター */}
          <TrainingTagFilter
            tags={allTags}
            selectedTag={selectedTag}
            onTagSelect={setSelectedTag}
          />

          {/* トレーニンググリッド */}
          <div className="mt-8">
            {filteredTrainings && <TrainingGrid trainings={filteredTrainings} />}
          </div>
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TrainingHome;
