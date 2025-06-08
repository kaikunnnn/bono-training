
import React from 'react';
import SectionCard from './SectionCard';

interface LearningGoalsProps {
  description?: string;
  goals: string[];
  className?: string;
}

/**
 * 学習ゴールを表示するコンポーネント
 * SectionCardを使用してスタイルを統一
 */
const LearningGoals: React.FC<LearningGoalsProps> = ({
  description,
  goals,
  className
}) => {
  return (
    <SectionCard
      title="学習のゴール"
      description={description}
      items={goals}
      isNumbered={false}
      className={className}
    />
  );
};

export default LearningGoals;
