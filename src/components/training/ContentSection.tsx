
import React from 'react';
import { cn } from '@/lib/utils';

interface ContentSectionProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'premium';
  className?: string;
}

/**
 * 再利用可能なコンテンツセクションコンポーネント
 * JSONデザインを基にTailwindクラスでスタイリング
 */
const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  children,
  variant = 'default',
  className
}) => {
  const isPremium = variant === 'premium';

  return (
    <div className={cn(
      'bg-white rounded-3xl border border-gray-300 mx-auto',
      'px-16 py-12 md:px-12 md:py-10 sm:px-8 sm:py-8',
      'max-w-4xl lg:max-w-3xl',
      isPremium && 'border-training bg-training-background',
      className
    )}>
      <div className="max-w-3xl mx-auto space-y-10 md:space-y-8">
        {/* セクションタイトル */}
        <div className="text-center space-y-8 md:space-y-6">
          <h2 className={cn(
            'font-rounded font-bold text-3xl md:text-2xl sm:text-xl',
            'text-slate-900 leading-tight',
            isPremium && 'text-training-dark'
          )}>
            {title}
          </h2>
        </div>

        {/* セクションコンテンツ */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ContentSection;
