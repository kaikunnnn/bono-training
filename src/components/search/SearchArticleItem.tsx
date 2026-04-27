import { Link } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";
import type { ArticleSearchResult } from "@/types/search";

interface SearchArticleItemProps {
  result: ArticleSearchResult;
}

/**
 * 検索結果用の記事アイテム
 * ArticleItem のスタイルをベースにした検索コンテキスト向けバリアント
 */
export function SearchArticleItem({ result }: SearchArticleItemProps) {
  const link = result.parentLessonSlug
    ? `/lessons/${result.parentLessonSlug}/${result.slug}`
    : `/articles/${result.slug}`;

  return (
    <Link
      to={link}
      className="flex items-center gap-4 px-4 sm:px-8 py-4 border-b border-black/[0.08] cursor-pointer hover:bg-gray-50 transition w-full"
    >
      {/* サムネイル */}
      <div className="relative w-20 h-[45px] rounded-[6px] overflow-hidden bg-[#e0dfdf] flex-shrink-0">
        {result.thumbnail && (
          <img
            src={result.thumbnail}
            alt={result.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {/* タイトルエリア */}
      <div className="flex-1 flex items-center justify-between overflow-hidden">
        <div className="flex flex-col gap-1 min-w-0">
          {/* 親レッスン名 */}
          {result.parentLessonTitle && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
              <BookOpen className="w-3 h-3 flex-shrink-0" />
              {result.parentLessonTitle}
            </span>
          )}
          {/* タイトル */}
          <span className="font-noto-sans-jp font-medium text-[14px] text-[#1e1b1b] leading-[20px] line-clamp-1">
            {result.title}
          </span>
        </div>

        {/* 右矢印 */}
        <div className="size-5 border border-black/[0.32] rounded-full backdrop-blur-[2.5px] flex items-center justify-center flex-shrink-0 ml-2">
          <ChevronRight className="size-[15px] text-black/50" />
        </div>
      </div>
    </Link>
  );
}
