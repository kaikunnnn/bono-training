
import React from 'react';
import Markdown from 'react-markdown';
import { cn } from '@/lib/utils';
import PremiumContentBanner from './PremiumContentBanner';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { getDisplayContent } from '@/lib/content-splitter';

interface MdxPreviewProps {
  content: string;
  className?: string;
  isPremium?: boolean;
  isFreePreview?: boolean;
  previewMarker?: string;
}

/**
 * MDXコンテンツをプレビュー表示するコンポーネント
 * プレミアムコンテンツの場合は制限表示を行う
 */
export function MdxPreview({ 
  content,
  className,
  isPremium = false,
  isFreePreview = false,
  previewMarker = '<!-- PREMIUM_ONLY -->'
}: MdxPreviewProps) {
  const { isSubscribed, hasMemberAccess } = useSubscriptionContext();

  // プレミアムアクセス権があるかどうかを判定
  const hasPremiumAccess = isSubscribed && hasMemberAccess;
  
  // 表示コンテンツとバナー表示の判定
  const { content: displayContent, showBanner } = getDisplayContent(
    content,
    isPremium,
    hasPremiumAccess,
    previewMarker
  );

  return (
    <div className={cn("mdx-preview space-y-4", className)}>
      <Markdown>
        {displayContent}
      </Markdown>
      
      {showBanner && (
        <PremiumContentBanner className="mt-6" />
      )}
    </div>
  );
}

export default MdxPreview;
