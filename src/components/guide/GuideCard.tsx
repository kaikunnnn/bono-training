import Link from "next/link";
import { getCategoryInfo } from "@/lib/guideCategories";
import type { Guide } from "@/types/guide";
import { GuideCardImage } from "./GuideCardImage";
import { getVideoInfo } from "@/lib/videoUtils";

interface GuideCardProps {
  guide: Guide;
}

/**
 * ガイドカードメディア部分
 * 優先順位: サムネイル画像 > 動画サムネイル > プレースホルダー
 */
function GuideCardMedia({ title, thumbnail, videoUrl }: { title: string; thumbnail?: string; videoUrl?: string }) {
  const videoInfo = videoUrl ? getVideoInfo(videoUrl) : null;
  const displayImage = thumbnail || videoInfo?.thumbnailUrl;

  return (
    <div className="w-full aspect-video rounded-[19px] overflow-hidden bg-muted">
      {displayImage ? (
        <GuideCardImage src={displayImage} alt={title} />
      ) : (
        <GuideCardPlaceholder title={title} />
      )}
    </div>
  );
}

/**
 * サムネイルがない場合のプレースホルダー
 */
export function GuideCardPlaceholder({ title }: { title: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#e6e6ef] via-[#ede9f5] to-[#faf2ed]">
      <span className="text-[10px] font-bold tracking-[0.2em] text-foreground/30 uppercase">
        Guide Article
      </span>
      <p className="text-[13px] font-bold text-foreground/50 text-center px-6 line-clamp-2 leading-snug">
        {title}
      </p>
    </div>
  );
}

export function GuideCard({ guide }: GuideCardProps) {
  const categoryInfo = getCategoryInfo(guide.category);
  const publishedDate = guide.publishedAt
    ? new Date(guide.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={`/guide/${guide.slug}`}
      className="group flex flex-col gap-5 bg-white rounded-[22px] pt-4 pb-6 px-4 shadow-[0px_1px_7px_rgba(0,0,0,0.04)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200"
    >
      <GuideCardMedia title={guide.title} thumbnail={guide.thumbnailUrl} videoUrl={guide.videoUrl} />

      <div className="flex flex-col gap-5 px-3">
        <div className="flex flex-col gap-2">
          {/* カテゴリラベル */}
          <p className="text-xs font-bold text-gray-500">
            {categoryInfo?.label ?? guide.category}
          </p>

          {/* タイトル */}
          <h3 className="text-lg font-bold text-[#1a1a1a] leading-snug line-clamp-2 text-balance">
            {guide.title}
          </h3>

          {/* 説明文 */}
          <p className="text-sm text-[#666] leading-[1.6] line-clamp-3">
            {guide.description}
          </p>
        </div>

        {/* 著者 + 日付 */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-white overflow-hidden flex items-center justify-center">
              <span className="text-[8px] font-bold text-muted-foreground">
                {guide.author.charAt(0)}
              </span>
            </div>
            <span className="text-[13px] font-medium text-[#151619]">
              {guide.author}
            </span>
          </div>
          {publishedDate && (
            <span className="text-sm text-gray-500">
              {publishedDate}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default GuideCard;
