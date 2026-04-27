import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleSearchResult } from "@/types/search";

interface SearchArticleCardProps {
  result: ArticleSearchResult;
  className?: string;
}

export function SearchArticleCard({ result, className }: SearchArticleCardProps) {
  const link = result.parentLessonSlug
    ? `/lessons/${result.parentLessonSlug}/${result.slug}`
    : `/articles/${result.slug}`;

  return (
    <Link
      to={link}
      className={cn(
        "group bg-white flex flex-col rounded-[20px] sm:rounded-[24px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.08)] overflow-hidden",
        "cursor-pointer transform transition-all duration-200",
        "hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0px_4px_18px_0px_rgba(0,0,0,0.16)]",
        className
      )}
    >
      {/* サムネイル */}
      <div className="relative w-full aspect-video bg-[#e0dfdf]">
        {result.thumbnail ? (
          <img
            src={result.thumbnail}
            alt={result.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="flex flex-col gap-1.5 p-3 sm:p-4">
        {result.parentLessonTitle && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
            <BookOpen className="w-3 h-3 flex-shrink-0" />
            {result.parentLessonTitle}
          </span>
        )}
        <h3 className="font-rounded-mplus-bold text-[13px] sm:text-sm font-bold text-[#0d221d] leading-[1.4] line-clamp-2">
          {result.title}
        </h3>
        {result.description && (
          <p className="text-[11px] sm:text-[12px] text-[var(--text-muted)] leading-[1.6] line-clamp-2">
            {result.description}
          </p>
        )}
      </div>
    </Link>
  );
}
