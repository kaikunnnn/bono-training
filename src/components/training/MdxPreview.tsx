
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import PremiumContentBanner from './PremiumContentBanner';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

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
  
  // デバッグ用ログ
  console.log('MdxPreview - アクセス状態:', { 
    isPremium, 
    isSubscribed,
    contentLength: content.length,
    previewLength
  });
  
  useEffect(() => {
    // プレミアムコンテンツかつメンバーシップ登録していない場合はプレビュー表示
    if (isPremium && !isSubscribed && content.length > previewLength) {
      let previewContent = content.substring(0, previewLength);
      
      // 段落の終わりで切れるようにする
      const lastParagraphEnd = previewContent.lastIndexOf('\n\n');
      if (lastParagraphEnd > previewLength * 0.7) { // 少なくともプレビューの70%は表示する
        previewContent = content.substring(0, lastParagraphEnd);
      }
      
      setDisplayContent(previewContent);
    } else {
      setDisplayContent(content);
    }
  }, [content, isPremium, isSubscribed, previewLength]);

  return (
    <div className={cn('mdx-preview', className)}>
      {/* プレミアムコンテンツの場合、バッジを表示 */}
      {isPremium && (
        <div className="mb-4">
          <Badge 
            variant="outline" 
            className={cn(
              "inline-flex items-center gap-1 py-1 px-2",
              isSubscribed 
                ? "bg-green-50 text-green-700 border-green-300" 
                : "bg-amber-50 text-amber-700 border-amber-300"
            )}
          >
            {isSubscribed ? (
              <>メンバー特典</>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                メンバー限定
              </>
            )}
          </Badge>
        </div>
      )}
      
      <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
        <ReactMarkdown>{displayContent}</ReactMarkdown>
      </div>
      
      {/* プレミアムコンテンツかつサブスクリプションがない場合に登録バナーを表示 */}
      {isPremium && !isSubscribed && (
        <div className="relative mt-6">
          {/* コンテンツが切れたことを視覚的に示す装飾 */}
          <div className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          <PremiumContentBanner />
        </div>
      )}
    </div>
  );
};

export default MdxPreview;
