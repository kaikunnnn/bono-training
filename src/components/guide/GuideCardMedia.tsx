import React from "react";
import { cn } from "@/lib/utils";
import { getVideoInfo } from "@/lib/videoUtils";

interface GuideCardMediaProps {
  title: string;
  videoUrl?: string;
  thumbnail?: string;
  className?: string;
}

/**
 * ガイドカード用メディアブロック
 *
 * 優先順位:
 * 1. videoUrl あり → YouTube/Vimeo 埋め込み
 * 2. thumbnail あり → サムネ画像
 * 3. どちらもなし → グラデーションプレースホルダー
 */
const GuideCardMedia = ({ title, videoUrl, thumbnail, className }: GuideCardMediaProps) => {
  const videoInfo = videoUrl ? getVideoInfo(videoUrl) : null;

  return (
    <div className={cn("w-full aspect-video rounded-3xl overflow-hidden bg-muted", className)}>
      {videoInfo ? (
        <iframe
          src={videoInfo.embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
      ) : thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#e6e6ef] via-[#ede9f5] to-[#faf2ed]">
          <span className="text-[10px] font-bold tracking-[0.2em] text-foreground/30 uppercase">
            Guide Article
          </span>
          <p className="text-[13px] font-bold text-foreground/50 text-center px-6 line-clamp-2 leading-snug">
            {title}
          </p>
        </div>
      )}
    </div>
  );
};

export default GuideCardMedia;
