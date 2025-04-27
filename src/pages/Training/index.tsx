
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TrainingHero from '@/components/training/TrainingHero';
import TrainingGrid from '@/components/training/TrainingGrid';
import { Training } from '@/types/training';

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
      <div className="px-6 py-8">
        <div className="flex flex-col gap-8 max-w-[1200px] mx-auto">
          <div className="mt-8">
            {trainings && <TrainingGrid trainings={trainings} />}
          </div>
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TrainingHome;
