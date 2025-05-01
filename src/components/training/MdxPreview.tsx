
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import PremiumContentBanner from './PremiumContentBanner';

interface MdxPreviewProps {
  content: string;
  isPremium?: boolean;
  isSubscribed?: boolean;
  className?: string;
  previewLength?: number;
}

/**
 * MDXコンテンツを表示するコンポーネント
 * プレミアムコンテンツの場合、サブスクリプション状態に応じて表示を制限
 */
const MdxPreview: React.FC<MdxPreviewProps> = ({
  content,
  isPremium = false,
  isSubscribed = false,
  className = '',
  previewLength = 500
}) => {
  const [displayContent, setDisplayContent] = useState(content);
  
  // コンソールログでプロップを確認
  console.log('MdxPreview - isPremium:', isPremium);
  console.log('MdxPreview - isSubscribed:', isSubscribed);
  
  useEffect(() => {
    // プレミアムコンテンツかつメンバーシップ登録していない場合はプレビュー表示
    if (isPremium && !isSubscribed && content.length > previewLength) {
      setDisplayContent(content.substring(0, previewLength) + '...');
    } else {
      setDisplayContent(content);
    }
  }, [content, isPremium, isSubscribed, previewLength]);

  return (
    <div className={cn('mdx-preview prose dark:prose-invert max-w-none', className)}>
      <ReactMarkdown>{displayContent}</ReactMarkdown>
      
      {isPremium && !isSubscribed && (
        <PremiumContentBanner className="mt-6" />
      )}
    </div>
  );
};

export default MdxPreview;
