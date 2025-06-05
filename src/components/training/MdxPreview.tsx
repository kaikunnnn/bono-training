
import React from 'react';
import Markdown from 'react-markdown';
import { cn } from '@/lib/utils';
import PremiumContentBanner from './PremiumContentBanner';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

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
  
  console.log('MdxPreview Debug:', {
    isPremium,
    hasPremiumAccess,
    isSubscribed,
    hasMemberAccess,
    hasMarker: content.includes(previewMarker)
  });

  let displayContent = content;
  let showPremiumBanner = false;
  
  // 無料コンテンツ (is_premium: false) の場合
  if (!isPremium) {
    // 無料コンテンツは常に全文表示、プレミアムバナーなし
    displayContent = content;
    showPremiumBanner = false;
    console.log('Free content: showing full content, no banner');
  }
  // 有料コンテンツ (is_premium: true) の場合
  else {
    // プレミアムアクセスがある場合：全文表示
    if (hasPremiumAccess) {
      displayContent = content;
      showPremiumBanner = false;
      console.log('Premium content + premium access: showing full content');
    }
    // プレミアムアクセスがない場合：マーカーで切り分け
    else {
      if (content.includes(previewMarker)) {
        displayContent = content.split(previewMarker)[0];
        showPremiumBanner = true;
        console.log('Premium content + no access: showing preview only with banner');
      } else {
        // マーカーがない場合は全文表示してバナー表示
        displayContent = content;
        showPremiumBanner = true;
        console.log('Premium content + no access + no marker: showing full content with banner');
      }
    }
  }

  return (
    <div className={cn("mdx-preview space-y-4", className)}>
      <Markdown>
        {displayContent}
      </Markdown>
      
      {showPremiumBanner && (
        <PremiumContentBanner className="mt-6" />
      )}
    </div>
  );
}

export default MdxPreview;
