
import React from 'react';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TrainingHero from '@/components/training/TrainingHero';

const TrainingHome: React.FC = () => {
  return (
    <TrainingLayout>
      <TrainingHeader />
      <TrainingHero />
    </TrainingLayout>
  );
};

export default TrainingHome;
