
import React from 'react';
import ContentSection from './ContentSection';

interface CompletionImageProps {
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * 完成イメージセクションコンポーネント
 * 説明文と完成イメージを表示
 */
const CompletionImage: React.FC<CompletionImageProps> = ({
  description,
  imageUrl,
  imageAlt = '完成イメージ',
  children,
  className
}) => {
  return (
    <ContentSection 
      title="完成イメージ" 
      className={className}
    >
      <div className="space-y-6">
        {/* 説明文 */}
        {description && (
          <p className="font-noto-sans text-base text-black leading-relaxed">
            {description}
          </p>
        )}

        {/* 画像 */}
        {imageUrl && (
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={imageUrl} 
              alt={imageAlt}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* カスタムコンテンツ */}
        {children}
      </div>
    </ContentSection>
  );
};

export default CompletionImage;
