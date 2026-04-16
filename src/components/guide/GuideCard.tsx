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

const GuideCard = ({ guide, className }: GuideCardProps) => {
  const categoryInfo = getCategoryInfo(guide.category);

  return (
    <Link
      to={`/guide/${guide.slug}`}
      className={cn("group flex flex-col gap-5", className)}
    >
      <GuideCardMedia
        title={guide.title}
        videoUrl={guide.videoUrl}
        thumbnail={guide.thumbnailUrl}
      />

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2 text-balance group-hover:opacity-70 transition-opacity duration-200">
          {guide.title}
        </h3>

        <p className="text-sm text-text-muted leading-relaxed line-clamp-3">
          {guide.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
              <span className="text-[8px] font-bold text-muted-foreground">
                {guide.author.charAt(0)}
              </span>
            </div>
            <span className="text-[13px] font-medium text-foreground">
              {guide.author}
            </span>
          </div>
          <span className="text-[13px] text-text-muted">
            {categoryInfo?.label ?? guide.category}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GuideCard;
