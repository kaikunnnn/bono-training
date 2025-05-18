
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import PremiumContentBanner from './PremiumContentBanner';
import { cn } from '@/lib/utils';

interface MdxPreviewProps {
  content: string;
  isPremium?: boolean;
  isSubscribed?: boolean;
  previewLength?: number;
  className?: string;
}

const MdxPreview: React.FC<MdxPreviewProps> = ({
  content,
  isPremium = false,
  isSubscribed = false, 
  previewLength = 500,
  className
}) => {
  const navigate = useNavigate();
  const [showingPreview, setShowingPreview] = useState(isPremium && !isSubscribed);
  
  // プレミアムコンテンツかつサブスクリプションがない場合、プレビューのみ表示
  const displayContent = showingPreview 
    ? content.substring(0, previewLength) + '...' 
    : content;
  
  const handleSubscribe = () => {
    navigate('/training/plan');
  };
  
  return (
    <div className={cn('prose max-w-none dark:prose-invert', className)}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeHighlight]}
        components={{
          // カスタムコンポーネントをここで定義
          a: ({node, ...props}) => (
            <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
          ),
          code: ({node, inline, className, children, ...props}) => {
            if (inline) {
              return (
                <code className="bg-gray-100 text-red-500 px-1 py-0.5 rounded" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="bg-gray-100 rounded-md overflow-x-auto">
                <code className={`${className || ''} block p-4`} {...props}>
                  {children}
                </code>
              </div>
            );
          }
        }}
      >
        {displayContent}
      </ReactMarkdown>
      
      {isPremium && !isSubscribed && (
        <div className="mt-8">
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
              <Lock className="text-amber-500 mt-1" />
              <div>
                <h3 className="font-medium text-amber-800">続きはメンバー限定です</h3>
                <p className="text-sm text-amber-700 mt-1">
                  このコンテンツの続きはメンバーシップに登録することで閲覧できます。
                  BONOトレーニングのすべてのコンテンツにアクセスして、実践的なスキルを身につけましょう。
                </p>
                <div className="mt-4">
                  <Button 
                    onClick={handleSubscribe}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    メンバーシップに登録する
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MdxPreview;
