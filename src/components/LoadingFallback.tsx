
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingFallbackProps {
  height?: string;
  message?: string;
  className?: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  height = '200px',
  message = '読み込み中...',
  className
}) => {
  return (
    <div 
      className={cn(
        "flex justify-center items-center", 
        className
      )}
      style={{ height }}
    >
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin mb-2" />
        <div className="animate-pulse text-gray-600 dark:text-gray-400">{message}</div>
      </div>
    </div>
  );
};

export default LoadingFallback;
