
import React from 'react';
import { cn } from '@/lib/utils';
interface LearningGoalsProps {
  description?: string;
  goals: string[];
  className?: string;
}

/**
 * 学習ゴールを表示するコンポーネント
 * Figmaデザインに基づいてスタイリング
 */
const LearningGoals: React.FC<LearningGoalsProps> = ({
  description,
  goals,
  className
}) => {
  return <div className="bg-transparent">
      {/* 内側のラッパー */}
      <div className="rounded-[48px] px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto bg-white lg:py-[48px] lg:px-[64px]">
        {/* コンテンツエリア */}
        <div className="max-w-3xl mx-auto space-y-10">
          {/* ヘッダー */}
          <div className="text-center space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-black text-left border-b-2 border-dotted border-gray-300 pb-2">
              学習のゴール
            </h2>
          </div>

          {/* テキストエリア */}
          <div className="space-y-6">
            {/* 説明文 */}
            {description && <p className="text-base text-black leading-[1.66] tracking-[1px] font-normal">
                {description}
              </p>}

            {/* 目標リスト */}
            <ul className="space-y-2 text-left">
              {goals.map((goal, index) => <li key={index} className="flex items-center gap-2.5 h-[27px] text-base text-black leading-[1.66] tracking-[1px] font-normal">
                  <span className="text-black">•</span>
                  <span>{goal}</span>
                </li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>;
};
export default LearningGoals;
