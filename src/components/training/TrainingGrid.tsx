
import React from 'react';
import { Training } from '@/types/training';
import TrainingCard from './TrainingCard';

interface TrainingGridProps {
  trainings: Training[];
}

const TrainingGrid: React.FC<TrainingGridProps> = ({ trainings }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
      {trainings.map((training) => (
        <TrainingCard key={training.id} training={training} />
      ))}
    </div>
  );
};

export default TrainingGrid;
