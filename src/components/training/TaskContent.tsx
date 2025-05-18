
import React from 'react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import MdxPreview from './MdxPreview';
import TrainingGuard from './TrainingGuard';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import VimeoPlayer from '@/components/content/VimeoPlayer';

interface TaskContentProps {
  title: string;
  content: string;
  isPremium: boolean;
  videoUrl?: string;
  previewVideoUrl?: string;
}

/**
 * トレーニングタスクの内容を表示するコンポーネント
 * 有料コンテンツの場合、メンバーシップに応じて表示を切り替える
 */
const TaskContent: React.FC<TaskContentProps> = ({
  title,
  content,
  isPremium,
  videoUrl,
  previewVideoUrl
}) => {
  const { isSubscribed, planMembers } = useSubscriptionContext();
  
  // プレミアムコンテンツへのアクセス権があるか確認
  const hasPremiumAccess = !isPremium || (isSubscribed && planMembers);
  
  // 表示する動画URLを決定
  const displayVideoUrl = hasPremiumAccess ? videoUrl : previewVideoUrl || videoUrl;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        
        {isPremium && (
          <Badge 
            variant="outline" 
            className={hasPremiumAccess 
              ? "bg-green-50 text-green-700 border-green-300" 
              : "bg-amber-50 text-amber-700 border-amber-300"
            }
          >
            {hasPremiumAccess ? (
              <>メンバー特典</>
            ) : (
              <>
                <Lock className="w-3 h-3 mr-1" />
                メンバー限定
              </>
            )}
          </Badge>
        )}
      </div>
      
      {displayVideoUrl && (
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          <VimeoPlayer
            vimeoId={displayVideoUrl}
            title={title}
            className="w-full h-full"
          />
          
          {isPremium && !hasPremiumAccess && (
            <div className="mt-2 text-sm text-amber-600 flex items-center">
              <Lock className="w-4 h-4 mr-1" />
              プレビュー版（限定公開）
            </div>
          )}
        </div>
      )}
      
      <MdxPreview
        content={content}
        isPremium={isPremium}
        isSubscribed={hasPremiumAccess}
        className="mt-6"
      />
    </div>
  );
};

export default TaskContent;
