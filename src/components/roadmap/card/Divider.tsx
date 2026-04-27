import React from 'react';
import { cn } from '@/lib/utils';
import type { TextVariant } from './types';

interface DividerProps {
  variant: TextVariant;
}

/**
 * 区切り線コンポーネント
 * RoadmapCardV2で使用される垂直区切り線
 */
export const Divider: React.FC<DividerProps> = ({ variant }) => (
  <div
    className={cn(
      'w-px h-[43px]',
      variant === 'light' ? 'bg-white/10' : 'bg-[#293525]/10'
    )}
  />
);
