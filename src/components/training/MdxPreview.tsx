
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

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
  
  useEffect(() => {
    // プレミアムコンテンツかつサブスクライブしていない場合はプレビュー表示
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
        <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-amber-800">ここから先はプレミアムコンテンツです</h3>
          <p className="text-amber-700 mt-2">
            続きを閲覧するには、プレミアムプランへのアップグレードが必要です。
          </p>
          <button 
            className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition-colors"
            onClick={() => window.location.href = '/subscription'}
          >
            プレミアムプランに登録する
          </button>
        </div>
      )}
    </div>
  );
};

export default MdxPreview;
