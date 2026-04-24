import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Guide } from "@/types/guide";
import { getCategoryInfo } from "@/lib/guideCategories";
import GuideCardMedia from "./GuideCardMedia";

interface GuideCardProps {
  guide: Guide;
  className?: string;
}

const ExternalLinkIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const GuideCard = ({ guide, className }: GuideCardProps) => {
  const categoryInfo = getCategoryInfo(guide.category);
  const isExternal = !!guide.linkUrl;

  const formattedDate = guide.publishedAt
    ? new Date(guide.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    : null;

  const cardContent = (
    <>
      {/* サムネイル */}
      <div className="relative">
        <GuideCardMedia
          title={guide.title}
          videoUrl={guide.videoUrl}
          thumbnail={guide.thumbnailUrl}
          className="aspect-[366/206] !rounded-[19px]"
        />
        {isExternal && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#6b7280] shadow-sm">
            <ExternalLinkIcon />
          </div>
        )}
      </div>

      {/* テキスト情報 */}
      <div className="flex flex-col gap-5 px-3 flex-1">
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-[12px] font-bold text-[#6b7280] leading-5">
            {categoryInfo?.label ?? guide.category}
          </span>
          <h3 className="text-[18px] font-bold leading-[25.2px] text-[#1a1a1a] line-clamp-2 group-hover:opacity-70 transition-opacity duration-200">
            {guide.title}
          </h3>
          <p className="text-[14px] leading-[22.4px] text-[#666] line-clamp-3">
            {guide.description}
          </p>
        </div>

        {/* 著者 + 日付 + 外部リンク */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-white overflow-hidden flex items-center justify-center border border-border">
                <span className="text-[8px] font-bold text-foreground/50">
                  {guide.author.charAt(0)}
                </span>
              </div>
              <span className="text-[13px] font-medium text-[#151619] leading-5">
                {guide.author}
              </span>
            </div>
            {formattedDate && (
              <span className="text-[14px] text-[#6b7280] leading-5">
                {formattedDate}
              </span>
            )}
          </div>
          {isExternal && (
            <span className="text-[10px] text-[#6b7280] bg-[#f3f4f6] rounded px-1.5 py-0.5 leading-none font-medium">
              外部リンク
            </span>
          )}
        </div>
      </div>
    </>
  );

  const cardClassName = cn(
    "group flex flex-col gap-5 bg-white rounded-[22px] shadow-[0px_1px_14px_0px_rgba(0,0,0,0.04)] pt-4 px-4 pb-6",
    "transform transition-all duration-200",
    "hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0px_4px_18px_0px_rgba(0,0,0,0.16)]",
    className
  );

  if (isExternal) {
    return (
      <a
        href={guide.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClassName}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <Link to={`/library/${guide.slug}`} className={cardClassName}>
      {cardContent}
    </Link>
  );
};

export default GuideCard;
