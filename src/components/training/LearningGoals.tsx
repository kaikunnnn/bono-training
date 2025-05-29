
import React from 'react';
import ContentSection from './ContentSection';

interface LearningGoalsProps {
  description?: string;
  goals: string[];
  className?: string;
}

/**
 * 学習ゴールセクションコンポーネント
 * 説明文とゴールリストを表示
 */
const LearningGoals: React.FC<LearningGoalsProps> = ({
  description,
  goals,
  className
}) => {
  return (
    <ContentSection 
      title="学習ゴール" 
      className={className}
    >
      <div className="space-y-6">
        {/* 説明文 */}
        {description && (
          <p className="font-noto-sans text-base text-black leading-relaxed">
            {description}
          </p>
        )}

        {/* ゴールリスト */}
        <ul className="space-y-2">
          {goals.map((goal, index) => (
            <li key={index} className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0" />
              <span className="font-noto-sans text-base text-black leading-relaxed">
                {goal}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ContentSection>
  );
};

export default LearningGoals;
