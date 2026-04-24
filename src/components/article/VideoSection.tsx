import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import PremiumVideoLock from '@/components/premium/PremiumVideoLock';
import { CustomVimeoPlayer } from '@/components/video';
import { urlFor } from '@/lib/sanity';
import { getVideoInfo } from '@/lib/videoUtils';

interface VideoSectionProps {
  videoUrl?: string | null | { url?: string; metadata?: any };
  thumbnail?: any;
  thumbnailUrl?: string;
  isPremium?: boolean;
  /**
   * 自動再生（ブラウザ制約によりミュートでの再生を前提とする）
   * 既定は false
   */
  autoPlay?: boolean;
  /** 再生開始時のコールバック（初回のみ発火） */
  onPlay?: () => void;
  /** 動画終了時のコールバック */
  onEnded?: () => void;
  /** 動画進捗コールバック（25%/50%/75%到達時） */
  onProgress?: (percent: number) => void;
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
const VideoSection = ({
  videoUrl,
  thumbnail,
  thumbnailUrl,
  isPremium = false,
  autoPlay = false,
  onPlay,
  onEnded,
  onProgress,
}: VideoSectionProps) => {
  const { canAccessContent } = useSubscriptionContext();

  // プレミアムコンテンツで未契約の場合、ロック表示
  if (isPremium && !canAccessContent(isPremium)) {
    return <PremiumVideoLock />;
  }

  // videoUrlからプラットフォームとIDを抽出
  const videoInfo = getVideoInfo(videoUrl);

  // サムネイル画像のURLを取得（URL優先、なければSanity画像オブジェクト）
  const getThumbnailUrl = () => {
    if (thumbnailUrl) {
      return thumbnailUrl;
    }
    if (thumbnail?.asset?._ref) {
      // 16:9の表示枠に合わせて大きめに取得（CDNで最適化）
      return urlFor(thumbnail).width(1320).height(743).url();
    }
    return null;
  };

  const thumbnailSrc = getThumbnailUrl();

  // 動画がない場合、サムネイルがあれば表示
  if (!videoInfo) {
    if (thumbnailSrc) {
      return (
        <div className="w-full">
          <div className="w-full bg-black rounded-2xl shadow-[0px_1px_24px_0px_rgba(0,0,0,0.17)] overflow-hidden">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <img
                src={thumbnailSrc}
                alt="記事サムネイル"
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>
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
        <div className="w-full bg-black rounded-2xl shadow-[0px_1px_24px_0px_rgba(0,0,0,0.17)] overflow-hidden">
          <CustomVimeoPlayer
            vimeoId={videoInfo.id}
            autoPlay={autoPlay}
            muted={false}
            onPlay={onPlay}
            onEnded={onEnded}
            onProgress={onProgress}
          />
        </div>
      </div>
    );
  }

  // YouTubeの場合は従来のiframe埋め込み
  const youtubeParams = autoPlay ? "?autoplay=1&playsinline=1" : "";
  return (
    <div className="w-full">
      <div className="w-full bg-black rounded-2xl shadow-[0px_1px_24px_0px_rgba(0,0,0,0.17)] overflow-hidden">
        {/* 16:9 レスポンシブコンテナ */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          {/* 56.25% = 9/16 * 100 (16:9のアスペクト比) */}
          <iframe
            src={`https://www.youtube.com/embed/${videoInfo.id}${youtubeParams}`}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video player"
          />
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
