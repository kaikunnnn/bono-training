
import React from 'react';
import { Badge } from '@/components/ui/badge';
import VimeoPlayer from '@/components/content/VimeoPlayer';
import PremiumContentBanner from './PremiumContentBanner';
import { useNavigate } from 'react-router-dom';

interface TaskVideoProps {
  videoUrl?: string;
  previewVideoUrl?: string;
  isPremium: boolean;
  hasPremiumAccess: boolean;
  title: string;
  previewSeconds?: number;
  className?: string;
}

/**
 * タスク詳細の動画プレーヤーコンポーネント
 */
const TaskVideo: React.FC<TaskVideoProps> = ({
  videoUrl,
  previewVideoUrl,
  isPremium,
  hasPremiumAccess,
  title,
  previewSeconds = 30,
  className
}) => {
  const navigate = useNavigate();
  
  // 表示する動画URLを決定
  const displayVideoUrl = hasPremiumAccess ? videoUrl : previewVideoUrl || videoUrl;
  
  const handleSubscribe = () => {
    navigate('/subscription', { state: { returnUrl: window.location.pathname } });
  };

  if (!displayVideoUrl) {
    return null;
  }

  return (
    <div className={className}>
      <div className="relative">
        <VimeoPlayer
          vimeoId={displayVideoUrl}
          title={title}
          className="rounded-lg overflow-hidden shadow-lg"
        />
        {isPremium && !hasPremiumAccess && (
          <div className="absolute bottom-4 right-4">
            <Badge className="bg-amber-500">プレビュー {previewSeconds}秒</Badge>
          </div>
        )}
      </div>
      
      {isPremium && !hasPremiumAccess && (
        <PremiumContentBanner className="mt-4" onSubscribe={handleSubscribe} />
      )}
    </div>
  );
};

export default TaskVideo;
