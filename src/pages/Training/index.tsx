
import React from 'react';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHero from '@/components/training/TrainingHero';
import TrainingGrid from '@/components/training/TrainingGrid';

const TrainingHome = () => {
  return (
    <TrainingLayout>
      <TrainingHero />
      <div className="container py-8">
        <TrainingGrid />
      </div>
    </TrainingLayout>
  );
};

export default TrainingHome;
