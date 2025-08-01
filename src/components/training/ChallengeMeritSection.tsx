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

  return (
    <div className={cn('w-full max-w-3xl mx-auto py-6 pb-8', className)}>
      <div className="challenge-merit">
        <h2 className="text-xl font-bold text-foreground mb-6">
          チャレンジで身につくこと
        </h2>
        
        <div className="space-y-0">
          {skillTitles.map((title, index) => (
            <div 
              key={index}
              className="flex items-center justify-between py-3"
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
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <svg 
                  className="w-2.5 h-2.5 text-primary-foreground" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 9l7 7 7-7" 
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChallengeMeritSection;