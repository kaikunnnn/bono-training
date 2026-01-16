
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

/**
 * 共通ローディングスピナーコンポーネント
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text = '読み込み中...'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-gray-600',
        sizeClasses[size]
      )} />
      <div className={cn(
        'font-medium text-gray-700',
        textSizeClasses[size]
      )}>
        {text}
      </div>
    </div>
  );
};

export default LoadingSpinner;
