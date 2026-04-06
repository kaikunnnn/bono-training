import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TextVariant } from './types';

interface ArrowButtonProps {
  variant: TextVariant;
}

/**
 * 矢印ボタンコンポーネント
 * RoadmapCardV2で使用される右矢印アイコン
 */
export const ArrowButton: React.FC<ArrowButtonProps> = ({ variant }) => (
  <div
    className={cn(
      'flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border',
      variant === 'light'
        ? 'border-white/30 text-white'
        : 'border-[#293525]/30 text-[#293525]'
    )}
  >
    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
  </div>
);
