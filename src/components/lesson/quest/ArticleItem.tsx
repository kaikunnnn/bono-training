"use client";

import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import { ChevronRight, Check, Play, FileText } from "lucide-react";
import { GradientLockIcon } from "@/components/ui/icon-lock-gradient";
import { ArticleTag, type TagType } from "@/components/article/sidebar/ArticleTag";

interface ArticleItemProps {
  articleNumber: number;
  title: string;
  slug: string;
  thumbnail?: {
    asset?: {
      _ref?: string;
    };
  };
  thumbnailUrl?: string;
  articleType?: TagType;
  isCompleted: boolean;
  videoUrl?: string;
  videoDuration?: string | number;
  isPremium?: boolean;
  /** 課金済みユーザーにはロックを非表示にするためのフラグ */
  isLocked?: boolean;
}

function formatVideoDuration(duration?: string | number): string | null {
  if (!duration) return null;
  
  if (typeof duration === "string") {
    if (/^\d+:\d{2}(:\d{2})?$/.test(duration)) {
      return duration;
    }
    const num = parseInt(duration, 10);
    if (isNaN(num)) return null;
    duration = num;
  }
  
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return minutes + ":" + String(seconds).padStart(2, "0");
}

export function ArticleItem({
  articleNumber,
  title,
  slug,
  thumbnail,
  thumbnailUrl,
  articleType,
  isCompleted,
  videoUrl,
  videoDuration,
  isPremium = false,
  isLocked,
}: ArticleItemProps) {
  // isLocked が明示的に渡されない場合は isPremium をフォールバック
  const showLock = isLocked ?? isPremium;
  const formattedDuration = formatVideoDuration(videoDuration);
  const hasValidDuration = formattedDuration !== null;
  const isVideo =
    (typeof videoUrl === "string" && videoUrl.trim().length > 0) || hasValidDuration;

  const getThumbnailUrl = () => {
    if (thumbnailUrl) return thumbnailUrl;
    if (thumbnail?.asset?._ref) {
      return urlFor(thumbnail).width(160).height(90).url();
    }
    return null;
  };

  const imageUrl = getThumbnailUrl();

  return (
    <Link
      href={"/articles/" + slug}
      className="flex items-center gap-4 px-8 py-4 border-b border-black/[0.08] cursor-pointer hover:bg-gray-50 transition w-full"
    >
      {isCompleted ? (
        <div className="size-4 rounded-full bg-gradient-to-b from-[rgba(255,75,111,0.68)] to-[rgba(38,119,143,0.68)] backdrop-blur-[2px] flex items-center justify-center flex-shrink-0">
          <Check className="size-2.5 text-white" strokeWidth={2.5} />
        </div>
      ) : (
        <div className="size-4 flex items-center justify-center flex-shrink-0">
          <span className="font-rounded-mplus font-bold text-[13px] text-[#414141] text-center leading-none">
            {articleNumber}
          </span>
        </div>
      )}

      <div className="relative w-20 h-[45px] rounded-[6px] overflow-hidden bg-[#e0dfdf] flex-shrink-0">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          {isVideo ? (
            <div className="size-4 bg-white rounded-full flex items-center justify-center">
              <Play className="w-3 h-3 text-[#17102d]" fill="#17102d" />
            </div>
          ) : (
            <div className="bg-white/[0.72] rounded-[3px] box-border h-4 w-4 p-px flex items-center justify-center">
              <FileText className="w-3 h-3 text-[#111827]" />
            </div>
          )}
        </div>

        {hasValidDuration && (
          <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 pt-1 pb-[5px] rounded-[3px] h-fit w-fit overflow-visible leading-[100%] flex flex-wrap">
            <span className="text-[8px] text-white font-noto-sans-jp leading-none h-fit w-fit">
              {formattedDuration}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-between overflow-hidden">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            {articleType && <ArticleTag type={articleType} />}
            {showLock && (
              <GradientLockIcon size={12} />
            )}
          </div>
          <span className="font-noto-sans-jp font-medium text-[14px] text-[#1e1b1b] leading-[20px]">
            {title}
          </span>
        </div>

        <div className="size-5 border border-black/[0.32] rounded-full backdrop-blur-[2.5px] flex items-center justify-center flex-shrink-0">
          <ChevronRight className="size-[15px] text-black/50" />
        </div>
      </div>
    </Link>
  );
}
