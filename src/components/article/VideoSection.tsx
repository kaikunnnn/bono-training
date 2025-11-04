import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import PremiumVideoLock from '@/components/premium/PremiumVideoLock';

interface VideoSectionProps {
  videoUrl?: string;
  isPremium?: boolean;
}

/**
 * VideoSection コンポーネント
 * Vimeo動画を16:9のレスポンシブで表示
 *
 * 仕様:
 * - Vimeoの埋め込み
 * - width に従って縦も16:9に従って伸びる
 * - テスト用固定URL: https://vimeo.com/76979871
 * - 後でSanityのvideoUrlと連携
 * - プレミアムコンテンツのアクセス制御
 */
const VideoSection = ({ videoUrl, isPremium = false }: VideoSectionProps) => {
  const { canAccessContent } = useSubscriptionContext();

  // プレミアムコンテンツで未契約の場合、ロック表示
  if (isPremium && !canAccessContent(isPremium)) {
    return <PremiumVideoLock />;
  }
  // VimeoのURLからビデオIDを抽出
  const getVimeoId = (url: string): string | null => {
    // https://vimeo.com/76979871 → 76979871
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  // デフォルトのテスト用動画ID
  const defaultVideoId = "76979871";

  // videoUrlがあれば抽出、なければデフォルト
  const vimeoId = videoUrl ? getVimeoId(videoUrl) : defaultVideoId;

  if (!vimeoId) {
    return (
      <div className="w-full bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">動画URLが無効です</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 16:9 レスポンシブコンテナ */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {/* 56.25% = 9/16 * 100 (16:9のアスペクト比) */}
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo video player"
        />
      </div>
    </div>
  );
};

export default VideoSection;
