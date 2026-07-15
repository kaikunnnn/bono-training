import { cn } from "@/lib/utils";
import { getVideoInfo } from "@/lib/videoUtils";
import { GuideCardImage } from "./GuideCardImage";
import { GuideCardPlaceholder } from "./GuideCard";

interface GuideCardMediaProps {
  title: string;
  thumbnail?: string;
  videoUrl?: string;
  className?: string;
}

/**
 * ガイドカードのメディアブロック（aspect-video）
 * 優先順位: サムネ画像 > ビデオのサムネ > プレースホルダ
 * `/guide` 一覧と検索結果カードで共通利用
 */
export function GuideCardMedia({ title, thumbnail, videoUrl, className }: GuideCardMediaProps) {
  const videoInfo = videoUrl ? getVideoInfo(videoUrl) : null;
  const displayImage = thumbnail || videoInfo?.thumbnailUrl;

  return (
    <div className={cn("w-full aspect-video rounded-[19px] overflow-hidden bg-muted", className)}>
      {displayImage ? (
        <GuideCardImage src={displayImage} alt={title} />
      ) : (
        <GuideCardPlaceholder title={title} />
      )}
    </div>
  );
}

export default GuideCardMedia;
