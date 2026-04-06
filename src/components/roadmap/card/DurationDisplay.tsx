import React from 'react';
import { cn } from '@/lib/utils';
import type { TextVariant } from './types';

interface DurationDisplayProps {
  duration: string;
  variant: TextVariant;
}

/**
 * 期間表示コンポーネント
 * RoadmapCardV2で使用される目安期間の表示
 */
export const DurationDisplay: React.FC<DurationDisplayProps> = ({ duration, variant }) => (
  <div
    className={cn(
      'flex flex-col gap-0.5',
      variant === 'light' ? 'text-white' : 'text-[#293525]'
    )}
  >
    <span
      className={cn(
        'text-[10px] font-bold opacity-72 leading-[1.3]',
        variant === 'dark' ? 'text-[color:var(--text-disabled)]' : undefined
      )}
    >
      目安
    </span>
    <div className="flex items-center gap-[5px]">
      <span className="text-base font-bold leading-none">{duration}</span>
      <span className="text-[13px] font-normal leading-[1.5]">ヶ月</span>
    </div>
  </div>
);
