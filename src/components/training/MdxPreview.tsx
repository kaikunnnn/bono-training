
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
  previewMarker = '<!--PREMIUM-->'
}: MdxPreviewProps) {
  const { isSubscribed, hasMemberAccess } = useSubscriptionContext();

  // プレミアムアクセス権があるかどうかを判定
  const hasPremiumAccess = isSubscribed && hasMemberAccess;
  
  // プレミアムコンテンツへのアクセス制限が必要かどうかを判定
  const shouldLimitContent = isPremium && !hasPremiumAccess;

  // フロントエンド側でのマーカー処理
  // (通常はサーバー側で処理済みだが、フォールバックとして実装)
  let displayContent = content;
  let showPremiumBanner = false;
  
  // サーバー側からisFreePreviewフラグが来ている場合は
  // 既にコンテンツが制限されているため、バナーのみ表示
  if (isFreePreview) {
    showPremiumBanner = true;
  } 
  // サーバー側での処理がされていない場合のフォールバック
  else if (shouldLimitContent && content.includes(previewMarker)) {
    displayContent = content.split(previewMarker)[0];
    showPremiumBanner = true;
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
