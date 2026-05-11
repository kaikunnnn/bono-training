"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { toggleBookmark } from "@/lib/services/bookmarks";
import { useToast } from "@/hooks/use-toast";
import { MySection } from "../_shared/MySection";
import { EmptyState } from "../_shared/EmptyState";

export interface BookmarkedArticle {
  _id: string;
  title: string;
  slug: { current: string };
  resolvedThumbnailUrl?: string;
  questInfo?: {
    lessonInfo?: { title: string };
  };
  isPremium?: boolean;
}

export function BookmarksPreview({
  bookmarks,
}: {
  bookmarks: BookmarkedArticle[];
}) {
  const { unbookmarkedIds, handleRemoveBookmark } = useBookmarkActions();

  return (
    <MySection
      title="お気に入り"
      viewAllTab="favorite"
      isEmpty={bookmarks.length === 0}
      emptyMessage="記事をお気に入りするとこちらに表示されます"
    >
      {bookmarks.slice(0, 4).map((article) => (
        <BookmarkItem
          key={article._id}
          article={article}
          onRemove={handleRemoveBookmark}
          isUnbookmarked={unbookmarkedIds.has(article._id)}
        />
      ))}
    </MySection>
  );
}

export function BookmarksFull({
  bookmarks,
}: {
  bookmarks: BookmarkedArticle[];
}) {
  const { unbookmarkedIds, handleRemoveBookmark } = useBookmarkActions();

  if (bookmarks.length === 0) {
    return <EmptyState message="記事をお気に入りするとこちらに表示されます" />;
  }

  return (
    <div className="flex w-full flex-col gap-0 rounded-2xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)]">
      {bookmarks.map((article) => (
        <BookmarkItem
          key={article._id}
          article={article}
          onRemove={handleRemoveBookmark}
          isUnbookmarked={unbookmarkedIds.has(article._id)}
        />
      ))}
    </div>
  );
}

function useBookmarkActions() {
  const [unbookmarkedIds, setUnbookmarkedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleRemoveBookmark = async (articleId: string, isPremium?: boolean) => {
    const isCurrentlyUnbookmarked = unbookmarkedIds.has(articleId);
    const result = await toggleBookmark(articleId, isPremium || false);
    if (result.success) {
      setUnbookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyUnbookmarked) {
          next.delete(articleId);
        } else {
          next.add(articleId);
        }
        return next;
      });
      toast({
        title: isCurrentlyUnbookmarked
          ? "ブックマークに追加しました"
          : "ブックマークを解除しました",
      });
    }
  };

  return { unbookmarkedIds, handleRemoveBookmark };
}

function BookmarkItem({
  article,
  onRemove,
  isUnbookmarked,
}: {
  article: BookmarkedArticle;
  onRemove: (id: string, isPremium?: boolean) => void;
  isUnbookmarked?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const thumbnailUrl = article.resolvedThumbnailUrl || "/placeholder-thumbnail.svg";
  const lessonTitle = article.questInfo?.lessonInfo?.title || "";

  return (
    <div
      className="w-full flex items-center gap-3 bg-white cursor-pointer"
      style={{ minHeight: "68px", padding: "16px" }}
    >
      <Link
        href={`/articles/${article.slug.current}`}
        className="flex items-center gap-3 flex-1 min-w-0 no-underline"
      >
        {/* サムネイル */}
        <div
          className="flex-shrink-0 overflow-hidden bg-muted-custom"
          style={{ width: 85, minWidth: 85, height: 48, borderRadius: 8 }}
        >
          <Image
            src={thumbnailUrl}
            alt=""
            width={85}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>

        {/* テキスト */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <p
            className="m-0 w-full overflow-hidden text-ellipsis whitespace-nowrap text-black"
            style={{
              fontFamily: "'Rounded Mplus 1c', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              lineHeight: "32px",
            }}
          >
            {article.title}
          </p>
          {lessonTitle && (
            <div className="flex items-center w-full overflow-hidden">
              <span
                className="text-gray-500 whitespace-nowrap flex-shrink-0"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, lineHeight: "20px" }}
              >
                by&nbsp;
              </span>
              <span
                className="text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif", fontSize: 12, lineHeight: "20px" }}
              >
                {lessonTitle}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* お気に入りボタン */}
      <div
        role="button"
        tabIndex={0}
        aria-label={isUnbookmarked ? "お気に入りに追加" : "お気に入りを解除"}
        onClick={() => onRemove(article._id, article.isPremium)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer relative"
        style={{
          padding: 8,
          transition: "transform 0.2s ease",
          transform: isHovered ? "scale(1.1)" : "scale(1)",
        }}
      >
        <Star
          style={{ width: 20, height: 20, transition: "all 0.2s ease" }}
          fill={isUnbookmarked ? "none" : "#FFC107"}
          stroke={isUnbookmarked ? "#9CA3AF" : "#FFC107"}
          strokeWidth={1.5}
        />
        {/* ツールチップ */}
        <div
          className="absolute bottom-full right-1/2 translate-x-1/2 bg-gray-800 px-2 py-1 rounded pointer-events-none whitespace-nowrap"
          style={{
            fontSize: 11,
            lineHeight: "16px",
            color: "#fff",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        >
          {isUnbookmarked ? "追加" : "解除"}
        </div>
      </div>
    </div>
  );
}
