
import React from 'react';
import { Training } from '@/types/training';
import TrainingCard from './TrainingCard';
import PortfolioTrainingCard from './PortfolioTrainingCard';
import PortfolioTrainingCardMarkdown from './PortfolioTrainingCardMarkdown';
import PortfolioTrainingCardJSON from './PortfolioTrainingCardJSON';

interface TrainingGridProps {
  trainings: Training[];
  compareMode?: boolean;
}

const TrainingGrid: React.FC<TrainingGridProps> = ({ trainings, compareMode = false }) => {
  // 比較モードの場合、ポートフォリオタイプの最初のアイテムのみ使用
  if (compareMode) {
    const portfolioTraining = trainings.find(t => t.type === 'portfolio');
    if (!portfolioTraining) return <div>ポートフォリオタイプのトレーニングがありません</div>;
    
    return (
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-8">スタイル比較: Markdown仕様 vs JSON仕様</h2>
        </div>
        <div className="flex justify-center gap-12 flex-wrap">
          <PortfolioTrainingCardMarkdown training={portfolioTraining} />
          <PortfolioTrainingCardJSON training={portfolioTraining} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
      {trainings.map((training) => (
        training.type === 'portfolio' ? (
          <PortfolioTrainingCard key={training.id} training={training} />
        ) : (
          <TrainingCard key={training.id} training={training} />
        )
      ))}
    </div>
  );
};

export default TrainingGrid;
