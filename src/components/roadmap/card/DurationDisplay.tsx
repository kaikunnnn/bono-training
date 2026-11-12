import React from 'react';
import { cn } from '@/lib/utils';
import type { TextVariant } from './types';
import { splitDuration } from '@/lib/roadmap-duration';

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
      variant === 'light' ? 'text-white' : 'text-text-secondary'
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
    <DurationValue duration={duration} />
  </div>
);

function DurationValue({ duration }: { duration: string }) {
  const { value, unit } = splitDuration(duration);
  return (
    <div className="flex items-center gap-[5px]">
      <span className="text-base font-bold leading-none">{value}</span>
      {unit && <span className="text-[13px] font-normal leading-[1.5]">{unit}</span>}
    </div>
  );
}
