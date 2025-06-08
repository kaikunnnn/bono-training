
import React, { useState, useEffect } from 'react';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHero from '@/components/training/TrainingHero';
import TrainingGrid from '@/components/training/TrainingGrid';
import ErrorDisplay from '@/components/common/ErrorBoundary';
import { getTrainings } from '@/services/training';
import { Training } from '@/types/training';
import { TrainingError } from '@/utils/errors';

const TrainingHome = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TrainingError | null>(null);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      setError(null);
      const trainingData = await getTrainings();
      setTrainings(trainingData);
    } catch (err) {
      console.error('トレーニング一覧の取得に失敗しました:', err);
      if (err instanceof TrainingError) {
        setError(err);
      } else {
        setError(new TrainingError('トレーニング一覧の取得に失敗しました', 'UNKNOWN_ERROR'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  if (error) {
    return (
      <TrainingLayout>
        <TrainingHero />
        <div className="container py-8">
          <ErrorDisplay 
            error={error} 
            onRetry={fetchTrainings}
            onReset={() => setError(null)}
          />
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
