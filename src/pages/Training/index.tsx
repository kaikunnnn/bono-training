
import React from 'react';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TrainingHero from '@/components/training/TrainingHero';
import TrainingGrid from '@/components/training/TrainingGrid';

// 一時的なモックデータ
const mockTrainings = [
  {
    id: '1',
    slug: 'todo-app',
    title: 'ToDoサービスをつくろう',
    description: 'グラフィックデザインの基礎から学べるトレーニング',
    type: 'challenge',
    difficulty: 'やさしい',
    tags: ['UIビジュアル'],
    backgroundImage: 'https://example.com/todo-bg.jpg',
    thumbnailImage: 'https://example.com/todo-thumb.jpg',
    isFree: true
  },
  // ... 他のトレーニングデータ
] as Training[];

const TrainingHome: React.FC = () => {
  return (
    <TrainingLayout>
      <TrainingHeader />
      <TrainingHero />
      <div className="mt-16">
        <TrainingGrid trainings={mockTrainings} />
      </div>
    </TrainingLayout>
  );
};

export default TrainingHome;
