
import React from 'react';
import Markdown, { Components } from 'react-markdown';
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

// マークダウンコンポーネントの定義
const markdownComponents: Components = {
  // 箇条書きスタイリング
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside space-y-2 mb-4 ml-4" {...props}>
      {children}
    </ul>
  ),
  li: ({ children, ...props }) => (
    <li className="text-gray-700 leading-relaxed" {...props}>
      {children}
    </li>
  ),
  
  // リンクスタイリング
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 underline transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),

  // 見出しスタイリング
  h2: ({ children, ...props }) => (
    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-lg font-medium text-gray-800 mt-4 mb-2" {...props}>
      {children}
    </h4>
  ),

  // 段落スタイリング
  p: ({ children, ...props }) => (
    <p className="text-gray-700 leading-relaxed mb-4" {...props}>
      {children}
    </p>
  ),

  // インラインコードスタイリング
  code: ({ children, ...props }) => (
    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  ),
};

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
      <Markdown components={markdownComponents}>
        {displayContent}
      </Markdown>
      
      {showBanner && (
        <PremiumContentBanner className="mt-6" />
      )}
    </div>
  );
}

export default MdxPreview;
