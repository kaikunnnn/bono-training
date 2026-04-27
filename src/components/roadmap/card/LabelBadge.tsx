import React from 'react';
import { cn } from '@/lib/utils';
import type { TextVariant } from './types';

interface LabelBadgeProps {
  children: React.ReactNode;
  variant: TextVariant;
}

/**
 * ラベルバッジコンポーネント
 * RoadmapCardV2で使用されるバッジ表示
 */
export const LabelBadge: React.FC<LabelBadgeProps> = ({ children, variant }) => (
  <div
    className={cn(
      'inline-flex items-center justify-center px-[6px] py-1 rounded-[70px] border text-xs font-normal leading-[1] whitespace-nowrap',
      variant === 'light'
        ? 'border-white text-white'
        : 'border-[#293525] text-[#293525]'
    )}
  >
    {children}
  </div>
);
