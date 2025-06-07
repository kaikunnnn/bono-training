
import React from 'react';
import { Badge } from '@/components/ui/badge';
import VimeoPlayer from '@/components/content/VimeoPlayer';
import PremiumContentBanner from './PremiumContentBanner';
import { useNavigate } from 'react-router-dom';

interface TaskVideoProps {
  videoUrl?: string | null;
  previewVideoUrl?: string | null;
  isPremium: boolean;
  hasPremiumAccess: boolean;
  title: string;
  previewSeconds?: number | null;
  className?: string;
}

/**
 * 動画URLが有効かどうかをチェック
 */
function isValidVideoUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== 'string') return false;
  // 空文字列や空白のみの場合は無効
  return url.trim().length > 0;
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
  let displayVideoUrl: string | null = null;
  let isShowingPreview = false;

  if (hasPremiumAccess) {
    // 有料会員：フル動画優先、なければプレビュー動画
    displayVideoUrl = isValidVideoUrl(videoUrl) ? videoUrl : 
                     isValidVideoUrl(previewVideoUrl) ? previewVideoUrl : null;
  } else {
    // 無料会員：プレビュー動画優先、なければフル動画
    if (isValidVideoUrl(previewVideoUrl)) {
      displayVideoUrl = previewVideoUrl;
      isShowingPreview = true;
    } else if (isValidVideoUrl(videoUrl)) {
      displayVideoUrl = videoUrl;
      isShowingPreview = isPremium; // 有料コンテンツの場合のみプレビュー扱い
    }
  }
  
  const handleSubscribe = () => {
    navigate('/training/plan', { state: { returnUrl: window.location.pathname } });
  };

  // 動画がない場合は何も表示しない
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
        {isPremium && isShowingPreview && (
          <div className="absolute bottom-4 right-4">
            <Badge className="bg-amber-500">
              プレビュー {previewSeconds}秒
            </Badge>
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
