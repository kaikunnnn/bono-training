
import React from 'react';
import ContentSection from './ContentSection';

interface LearningGoalsProps {
  description?: string;
  goals: string[];
  variant?: 'default' | 'premium';
  className?: string;
}

/**
 * 学習ゴールセクションコンポーネント
 * 説明文とゴールリストを表示
 */
const LearningGoals: React.FC<LearningGoalsProps> = ({
  description,
  goals,
  variant = 'default',
  className
}) => {
  const isPremium = variant === 'premium';

  return (
    <ContentSection 
      title="学習ゴール" 
      variant={variant}
      className={className}
    >
      <div className="space-y-6">
        {/* 説明文 */}
        {description && (
          <p className={`font-noto-sans text-base leading-relaxed ${
            isPremium ? 'text-training-dark' : 'text-black'
          }`}>
            {description}
          </p>
        )}

        {/* ゴールリスト */}
        <ul className="space-y-2">
          {goals.map((goal, index) => (
            <li key={index} className="flex items-center space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                isPremium ? 'bg-training-dark' : 'bg-black'
              }`} />
              <span className={`font-noto-sans text-base leading-relaxed ${
                isPremium ? 'text-training-dark' : 'text-black'
              }`}>
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
