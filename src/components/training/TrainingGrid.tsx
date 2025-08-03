import React from 'react';
import { Training } from '@/types/training';
import TrainingCard from './TrainingCard';
import PortfolioTrainingCard from './PortfolioTrainingCard';

interface TrainingGridProps {
  trainings: Training[];
}

const TrainingGrid: React.FC<TrainingGridProps> = ({ trainings }) => {
  // デバッグ: トレーニングデータの確認
  console.log('TrainingGrid - 受信したtrainings:', trainings);
  console.log('TrainingGrid - trainings数:', trainings.length);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12 justify-items-start">
      {trainings.map((training) => {
        console.log(`TrainingGrid - rendering ${training.slug}:`, {
          title: training.title,
          type: training.type,
          icon: training.icon,
          thumbnail: training.thumbnailImage
        });
        
        return training.type === 'portfolio' ? (
          <PortfolioTrainingCard key={training.id} training={training} />
        ) : (
          <TrainingCard key={training.id} training={training} />
        )
      })}
    </div>
  );
};

export default TrainingGrid;