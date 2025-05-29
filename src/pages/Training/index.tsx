
import React, { useState, useEffect } from 'react';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHero from '@/components/training/TrainingHero';
import TrainingGrid from '@/components/training/TrainingGrid';
import { getTrainings } from '@/services/training';
import { Training } from '@/types/training';

const TrainingHome = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const trainingData = getTrainings();
        setTrainings(trainingData);
      } catch (error) {
        console.error('トレーニング一覧の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  if (loading) {
    return (
      <TrainingLayout>
        <TrainingHero />
        <div className="container py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  return (
    <TrainingLayout>
      <TrainingHero />
      <div className="container py-8">
        <TrainingGrid trainings={trainings} />
      </div>
    </TrainingLayout>
  );
};

export default TrainingHome;
