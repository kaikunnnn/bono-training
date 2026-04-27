import React from 'react';
import { cn } from '@/lib/utils';
import type { TextVariant } from './types';

interface StepCountDisplayProps {
  count: number;
  variant: TextVariant;
}

/**
 * ステップ数表示コンポーネント
 * RoadmapCardV2で使用されるステップ数の表示
 */
export const StepCountDisplay: React.FC<StepCountDisplayProps> = ({ count, variant }) => (
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
      ステップ
    </span>
    <div className="flex items-center gap-[5px]">
      <span className="text-base font-bold leading-none">{count}</span>
      <span className="text-[13px] font-normal leading-[1.5]">つ</span>
    </div>
  </div>
);
