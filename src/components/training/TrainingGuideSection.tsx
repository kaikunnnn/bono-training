import React from 'react';
import GuideHeader from './GuideHeader';
import LessonCard from './LessonCard';
import StepBlock from './StepBlock';
import ArrowDown from './ArrowDown';
import { GuideContent } from '@/utils/processSkillSection';

interface Step {
  title: string;
  description: string;
  referenceLink?: {
    text: string;
    url: string;
  };
}

interface TrainingGuideSectionProps {
  guideContent?: GuideContent;
  steps?: Step[];
}

const TrainingGuideSection: React.FC<TrainingGuideSectionProps> = ({ 
  guideContent,
  steps: propSteps
}) => {
  // デフォルトコンテンツ
  const defaultSteps = [
    {
      title: '要件からユーザーが達成するべき目的を整理',
      description: '自分が良いと思うではなく、使う人目線の条件を達成するUI作成能力をトレーニングするお題です。',
      referenceLink: {
        text: 'ユーザー中心設計の基本',
        url: '#'
      }
    },
    {
      title: '情報の優先順位を設計する',
      description: 'ユーザーが必要とする情報を適切な順序で配置し、効率的な体験を提供するための設計手法を学びます。',
    },
    {
      title: 'UIコンポーネントの選定と配置',
      description: '目的に応じた適切なUIコンポーネントを選び、ユーザビリティを考慮した配置を行います。',
    },
    {
      title: 'デザインシステムの活用',
      description: '一貫性のあるデザインを効率的に作成するため、デザインシステムを理解し活用します。',
    },
    {
      title: 'プロトタイプの作成と検証',
      description: '実際に動作するプロトタイプを作成し、ユーザーテストを通じて設計の妥当性を検証します。',
    }
  ];

  const defaultLessonCard = {
    title: 'ゼロからはじめる情報設計',
    emoji: '📚',
    description: '進め方の基礎はBONOで詳細に学習・実践できます',
    link: '/training'
  };

  // 使用するデータを決定（デフォルトのみ使用）
  const title = '進め方ガイド';
  const description = 'デザイン基礎を身につけながらデザインするための\nやり方の流れを説明します。';
  const lessonCard = defaultLessonCard;
  const steps = defaultSteps;
  return (
    <section className="w-full py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <GuideHeader 
            title={title}
            description={description}
          />
        </div>

        {/* Content sections */}
        <div className="space-y-16">
          {/* Lesson section */}
          {lessonCard && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-noto-sans">
                レッスンで身につける
              </h3>
              <LessonCard 
                title={lessonCard.title}
                emoji={lessonCard.emoji}
                description={lessonCard.description}
                link={lessonCard.link}
              />
            </div>
          )}

          {/* Steps section */}
          {steps.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-noto-sans">
                進め方
              </h3>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index}>
                    <StepBlock
                      title={step.title}
                      description={step.description}
                      referenceLink={step.referenceLink}
                    />
                    {index < steps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrainingGuideSection;