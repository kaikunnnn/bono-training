import React from 'react';
import { cn } from '@/lib/utils';

interface ChallengeMeritSectionProps {
  skillTitles: string[];
  className?: string;
}

/**
 * チャレンジで身につくことセクション
 */
const ChallengeMeritSection: React.FC<ChallengeMeritSectionProps> = ({ 
  skillTitles, 
  className 
}) => {
  if (!skillTitles || skillTitles.length === 0) {
    return null;
  }

  // スキルクリック時のスクロール処理
  const handleSkillClick = (index: number) => {
    const element = document.getElementById(`skill-${index}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={cn('w-full max-w-3xl mx-auto', className)}>
      <div className="challenge-merit">
        <h2 className="text-xl font-bold text-foreground mb-3">
          チャレンジで身につくこと
        </h2>
        
        <div className="space-y-0">
          {skillTitles.map((title, index) => (
            <div 
              key={index}
              onClick={() => handleSkillClick(index)}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* 四角いアイコン */}
                <div className="w-2.5 h-2.5 bg-background border-2 border-foreground/20 rounded-sm flex-shrink-0" />
                
                {/* スキルタイトル */}
                <span className="text-foreground font-medium">
                  {title}
                </span>
              </div>
              
              {/* 矢印アイコン */}
              <img 
                src="/images/arrow/arrow/secondary/down.svg" 
                alt=""
                className="w-5 h-5 flex-shrink-0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChallengeMeritSection;