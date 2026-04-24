"use client";

import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import PremiumVideoLock from "@/components/premium/PremiumVideoLock";

interface VideoSectionProps {
  videoUrl?: string | null | { url?: string; metadata?: unknown };
  thumbnail?: { asset?: { _ref?: string } };
  thumbnailUrl?: string;
  isPremium?: boolean;
  hasAccess?: boolean;
  /**
   * 自動再生（ブラウザ制約によりミュートでの再生を前提とする）
   * 既定は false
   */
  autoPlay?: boolean;
  /** 再生開始時のコールバック（初回のみ発火） */
  onPlay?: () => void;
  /** 動画終了時のコールバック */
  onEnded?: () => void;
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
  hasAccess = true,
  autoPlay = false,
}: VideoSectionProps) => {
  // プレミアムコンテンツで未契約の場合、ロック表示
  if (isPremium && !hasAccess) {
    return <PremiumVideoLock />;
  }

  // URLからプラットフォームとIDを判定
  const getVideoInfo = (url: string | null | undefined | { url?: string }) => {
    if (!url) return null;

    // オブジェクトの場合はURLを抽出
    const urlString = typeof url === "string" ? url : url?.url;

    if (!urlString || typeof urlString !== "string") return null;

    // YouTube判定: youtu.be/xxx or youtube.com/watch?v=xxx
    const youtubeMatch = urlString.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return { platform: "youtube", id: youtubeMatch[1] };
    }

    // Vimeo判定: vimeo.com/xxx
    const vimeoMatch = urlString.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return { platform: "vimeo", id: vimeoMatch[1] };
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
              <Image
                src={thumbnailSrc}
                alt="記事サムネイル"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      );
    }
    // 動画もサムネイルもない場合は非表示
    return null;
  }

  // Vimeoの場合
  if (videoInfo.platform === "vimeo") {
    // muted=0 を明示することでデフォルトのミュートを解除する
    const vimeoParams = autoPlay ? "?autoplay=1&muted=1" : "?muted=0";
    return (
      <div className="w-full">
        <div className="w-full bg-black rounded-2xl shadow-[0px_1px_24px_0px_rgba(0,0,0,0.17)] overflow-hidden">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={`https://player.vimeo.com/video/${videoInfo.id}${vimeoParams}`}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Vimeo video player"
            />
          </div>
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
