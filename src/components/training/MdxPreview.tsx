
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import TaskActionButton from './TaskActionButton';

interface MdxPreviewProps {
  content: string;
  isPremium?: boolean;
  isSubscribed?: boolean;
  previewLength?: number;
  previewMarker?: string;
  className?: string;
  taskId?: string;
  userId?: string;
  isCompleted?: boolean;
  onProgressUpdate?: () => void;
}

/**
 * MDXコンテンツプレビューコンポーネント
 * プレミアム（有料）コンテンツの場合は、未登録ユーザーにはプレビュー部分のみ表示
 */
const MdxPreview: React.FC<MdxPreviewProps> = ({
  content,
  isPremium = false,
  isSubscribed = false, 
  previewLength = 1000,
  previewMarker = '<!--PREMIUM-->',
  className,
  taskId,
  userId,
  isCompleted = false,
  onProgressUpdate
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showStatusInfo, setShowStatusInfo] = useState(false);
  
  // プレミアムコンテンツの場合の表示処理
  let displayContent = content;

  if (isPremium && !isSubscribed) {
    // マーカーでコンテンツを分割
    const contentParts = content.split(previewMarker);
    
    if (contentParts.length > 1) {
      // マーカーが存在する場合は、マーカー前のコンテンツのみ表示
      displayContent = contentParts[0];
    } else {
      // マーカーがない場合は、previewLength文字数で制限
      displayContent = content.substring(0, previewLength) + '...';
    }
  }
  
  const handleSubscribe = () => {
    toast({
      title: "メンバーシップ登録",
      description: "メンバーシップページに移動します",
    });
    navigate('/training/plan');
  };

  const handleStatusInfo = () => {
    setShowStatusInfo(!showStatusInfo);
  };
  
  return (
    <div className={cn('prose prose-slate max-w-none dark:prose-invert', className)}>
      {taskId && userId && (
        <div className="mb-8 flex justify-end">
          <TaskActionButton
            taskId={taskId}
            userId={userId}
            isCompleted={isCompleted}
            onProgressUpdate={onProgressUpdate}
          />
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={handleStatusInfo}
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            ヘルプ
          </Button>
        </div>
      )}
      
      {showStatusInfo && (
        <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
          <h4 className="text-blue-800 dark:text-blue-300 font-medium mb-2 mt-0">タスクの進捗状態について</h4>
          <p className="text-blue-700 dark:text-blue-400 text-sm mb-0">
            「完了にする」ボタンをクリックして、タスクの完了状態を記録できます。
            完了済みのタスクは自動的に進捗状況に反映され、トレーニング全体の達成率が表示されます。
          </p>
        </div>
      )}

      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeHighlight]}
        components={{
          // カスタムコンポーネントをここで定義
          a: ({node, ...props}) => (
            <a className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          code: ({node, className, children, ...props}: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && props.inline;
            
            if (isInline) {
              return (
                <code className="bg-gray-100 text-red-500 px-1 py-0.5 rounded" {...props}>
                  {children}
                </code>
              );
            }
            
            return (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto">
                <code className={`${className || ''} block p-4`} {...props}>
                  {children}
                </code>
              </div>
            );
          },
          h1: ({node, ...props}) => (
            <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
          ),
          h2: ({node, ...props}) => (
            <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />
          ),
          h3: ({node, ...props}) => (
            <h3 className="text-xl font-medium mt-4 mb-2" {...props} />
          ),
          ul: ({node, ...props}) => (
            <ul className="list-disc pl-6 my-4 space-y-2" {...props} />
          ),
          ol: ({node, ...props}) => (
            <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />
          )
        }}
      >
        {displayContent}
      </ReactMarkdown>
      
      {isPremium && !isSubscribed && (
        <div className="mt-8">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start space-x-3">
              <Lock className="text-amber-500 dark:text-amber-400 mt-1" />
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-300">このコンテンツの続きはメンバー限定です</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  このコンテンツの続きはメンバーシップに登録することで閲覧できます。
                  BONOトレーニングのすべてのコンテンツにアクセスして、実践的なスキルを身につけましょう。
                </p>
                <div className="mt-4 flex gap-2">
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

      {isCompleted && (
        <div className="mt-8 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <CheckCircle className="text-green-500 dark:text-green-400 mr-2" />
            <h3 className="text-green-800 dark:text-green-300 font-medium m-0">おめでとうございます！このタスクを完了しました。</h3>
          </div>
          <p className="text-green-700 dark:text-green-400 text-sm mb-0 mt-2">
            このタスクの進捗は保存されました。次のタスクに進むか、トレーニングの進捗状況を確認してください。
          </p>
        </div>
      )}
    </div>
  );
};

export default MdxPreview;
