
import React from 'react';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TrainingHero from '@/components/training/TrainingHero';
import TrainingGrid from '@/components/training/TrainingGrid';
import { Training } from '@/types/training';

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
  {
    id: '2',
    slug: 'weather-app',
    title: '天気アプリUIをデザイン',
    description: 'データビジュアライゼーションとレイアウトの実践',
    type: 'challenge',
    difficulty: '中級',
    tags: ['データビジュアライゼーション'],
    backgroundImage: 'https://example.com/weather-bg.jpg',
    thumbnailImage: 'https://example.com/weather-thumb.jpg',
    isFree: false
  },
  {
    id: '3',
    slug: 'dashboard-design',
    title: 'ダッシュボードを作ろう',
    description: '複雑なインターフェースの設計と配置を学ぶ',
    type: 'challenge',
    difficulty: '難しい',
    tags: ['複合UI'],
    backgroundImage: 'https://example.com/dashboard-bg.jpg',
    thumbnailImage: 'https://example.com/dashboard-thumb.jpg',
    isFree: false
  }
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
