
import React from 'react';

interface VimeoPlayerProps {
  vimeoId: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  responsive?: boolean;
  className?: string;
}

/**
 * Vimeo動画プレーヤーコンポーネント
 */
const VimeoPlayer: React.FC<VimeoPlayerProps> = ({
  vimeoId,
  title,
  width = '100%',
  height = 'auto',
  autoplay = false,
  responsive = true,
  className = '',
}) => {
  // Vimeo URLからIDを抽出（完全なURLが渡された場合）
  const extractVimeoId = (url: string): string => {
    // 既にIDのみの場合はそのまま返す（数字のみの場合）
    if (/^\d+$/.test(url)) {
      return url;
    }
    
    // Vimeo URLからIDを抽出（例：https://player.vimeo.com/video/76979871）
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    return match ? match[1] : url;
  };

  const cleanId = extractVimeoId(vimeoId);
  const embedUrl = `https://player.vimeo.com/video/${cleanId}`;
  const queryParams = [];
  
  if (autoplay) {
    queryParams.push('autoplay=1');
  }
  
  const finalUrl = queryParams.length > 0 ? `${embedUrl}?${queryParams.join('&')}` : embedUrl;
  
  return (
    <div className={`vimeo-player ${responsive ? 'aspect-video' : ''} ${className}`}>
      <iframe
        src={finalUrl}
        width={width}
        height={responsive ? '100%' : height}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title || 'Vimeo動画'}
        className={responsive ? 'w-full h-full' : ''}
      />
    </div>
  );
};

export default VimeoPlayer;
