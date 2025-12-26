import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import PremiumVideoLock from '@/components/premium/PremiumVideoLock';
import { CustomVimeoPlayer } from '@/components/video';

interface VideoSectionProps {
  videoUrl?: string | null | { url?: string; metadata?: any };
  thumbnail?: any;
  thumbnailUrl?: string;
  isPremium?: boolean;
}

/**
 * VideoSection コンポーネント
 * YouTube/Vimeo動画を16:9のレスポンシブで表示
 * 動画がない場合はサムネイル画像を表示
 *
 * 仕様:
 * - YouTubeとVimeoの両方に対応
 * - width に従って縦も16:9に従って伸びる
 * - URLから自動判定して適切な埋め込みを表示
 * - 動画がない場合、サムネイル画像があれば表示
 * - プレミアムコンテンツのアクセス制御
 */
const VideoSection = ({ videoUrl, thumbnail, thumbnailUrl, isPremium = false }: VideoSectionProps) => {
  const { canAccessContent } = useSubscriptionContext();

  // プレミアムコンテンツで未契約の場合、ロック表示
  if (isPremium && !canAccessContent(isPremium)) {
    return <PremiumVideoLock />;
  }

  // URLからプラットフォームとIDを判定
  const getVideoInfo = (url: string | null | undefined | { url?: string }) => {
    if (!url) return null;

    // オブジェクトの場合はURLを抽出
    const urlString = typeof url === 'string' ? url : url?.url;

    if (!urlString || typeof urlString !== 'string') return null;

    // YouTube判定: youtu.be/xxx or youtube.com/watch?v=xxx
    const youtubeMatch = urlString.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return { platform: 'youtube', id: youtubeMatch[1] };
    }

    // Vimeo判定: vimeo.com/xxx
    const vimeoMatch = urlString.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return { platform: 'vimeo', id: vimeoMatch[1] };
    }

    return null;
  };

  // videoUrlからプラットフォームとIDを抽出
  const videoInfo = videoUrl ? getVideoInfo(videoUrl) : null;

  // サムネイル画像のURLを取得（URL優先、なければSanity画像オブジェクト）
  const getThumbnailUrl = () => {
    if (thumbnailUrl) {
      return thumbnailUrl;
    }
    if (thumbnail?.asset?._ref) {
      // urlForをインポートする必要がある
      return null; // 後で実装
    }
    return null;
  };

  const thumbnailSrc = getThumbnailUrl();

  // 動画がない場合、サムネイルがあれば表示
  if (!videoInfo) {
    if (thumbnailSrc) {
      return (
        <div className="w-full">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <img
              src={thumbnailSrc}
              alt="記事サムネイル"
              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      );
    }
    // 動画もサムネイルもない場合は非表示
    return null;
  }

  // Vimeoの場合はカスタムプレーヤーを使用
  if (videoInfo.platform === 'vimeo') {
    return (
      <div className="w-full">
        <CustomVimeoPlayer vimeoId={videoInfo.id} />
      </div>
    );
  }

  // YouTubeの場合は従来のiframe埋め込み
  return (
    <div className="w-full">
      {/* 16:9 レスポンシブコンテナ */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {/* 56.25% = 9/16 * 100 (16:9のアスペクト比) */}
        <iframe
          src={`https://www.youtube.com/embed/${videoInfo.id}`}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        />
      </div>
    </div>
  );
};

export default VideoSection;
