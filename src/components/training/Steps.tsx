
import React from 'react';
import ContentSection from './ContentSection';

interface Step {
  title: string;
  description?: string;
}

interface StepsProps {
  description?: string;
  steps: Step[];
  className?: string;
}

/**
 * 手順セクションコンポーネント
 * 番号付きの手順リストを表示
 */
const Steps: React.FC<StepsProps> = ({
  description,
  steps,
  className
}) => {
  return (
    <ContentSection 
      title="手順" 
      className={className}
    >
      <div className="space-y-6">
        {/* 説明文 */}
        {description && (
          <p className="font-noto-sans text-base text-black leading-relaxed">
            {description}
          </p>
        )}

        {/* 手順リスト */}
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-6 h-6 bg-training text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-noto-sans font-medium text-base text-black">
                  {step.title}
                </h4>
                {step.description && (
                  <p className="font-noto-sans text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </ContentSection>
  );
};

export default Steps;
