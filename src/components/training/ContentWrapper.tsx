import React from 'react';
import { cn } from '@/lib/utils';

interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * トレーニングページ用のコンテンツ幅制御ラッパー
 * fullWidth=false（デフォルト）: レスポンシブな幅制限を適用
 * fullWidth=true: 全幅表示
 */
const ContentWrapper: React.FC<ContentWrapperProps> = ({ 
  children, 
  className,
  fullWidth = false 
}) => {
  if (fullWidth) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn(
      "mx-auto w-[88%] sm:w-[85%] lg:w-[88%] max-w-[1120px]",
      className
    )}>
      {children}
    </div>
  );
};

export default ContentWrapper;