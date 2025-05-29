
import React from 'react';
import ContentSection from './ContentSection';
import { Crown } from 'lucide-react';

interface PremiumContentProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * プレミアム限定コンテンツセクションコンポーネント
 * 特別なスタイリングでプレミアムコンテンツを表示
 */
const PremiumContent: React.FC<PremiumContentProps> = ({
  title = 'プレミアム限定',
  description,
  children,
  className
}) => {
  return (
    <ContentSection 
      title={
        <div className="flex items-center justify-center space-x-2">
          <Crown className="w-6 h-6 text-training" />
          <span>{title}</span>
        </div>
      }
      variant="premium"
      className={className}
    >
      <div className="space-y-6">
        {/* 説明文 */}
        {description && (
          <p className="font-noto-sans text-base text-training-dark leading-relaxed">
            {description}
          </p>
        )}

        {/* プレミアムコンテンツ */}
        <div className="text-training-dark">
          {children}
        </div>
      </div>
    </ContentSection>
  );
};

export default PremiumContent;
