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
  // デフォルト文言
  const defaultTitle = '進め方ガイド';
  const defaultDescription = 'デザイン基礎を身につけながらデザインするための\nやり方の流れを説明します。';

  const title = guideContent?.title || defaultTitle;
  const description = guideContent?.description || defaultDescription;
  const lessonCard = guideContent?.lessonCard;
  const steps = propSteps ?? guideContent?.steps ?? [];
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