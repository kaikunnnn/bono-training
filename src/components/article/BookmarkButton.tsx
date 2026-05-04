"use client";

import { useState, useTransition, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toggleBookmark } from "@/lib/services/bookmarks";
import { trackBookmark } from "@/lib/analytics";
import { useArticleBookmarkOptional } from "@/contexts/ArticleBookmarkContext";

interface BookmarkButtonProps {
  articleId: string;
  initialIsBookmarked: boolean;
  isPremium?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon" | "action";
  showLabel?: boolean;
  labelClassName?: string;
  className?: string;
}

export function BookmarkButton({
  articleId,
  initialIsBookmarked,
  isPremium = false,
  variant = "secondary",
  size = "action",
  showLabel = true,
  labelClassName = "",
  className = "gap-1",
}: BookmarkButtonProps) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, startTransition] = useTransition();
  const bookmarkCtx = useArticleBookmarkOptional();

  // Context の sharedIsBookmarked で他のボタンと同期
  useEffect(() => {
    if (bookmarkCtx?.sharedIsBookmarked !== null && bookmarkCtx?.sharedIsBookmarked !== undefined) {
      setIsBookmarked(bookmarkCtx.sharedIsBookmarked);
    }
  }, [bookmarkCtx?.sharedIsBookmarked]);

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleBookmark(articleId, isPremium);

      if (result.success) {
        setIsBookmarked(result.isBookmarked);
        // Context経由で他のBookmarkButtonと同期
        bookmarkCtx?.onBookmarkChange(result.isBookmarked);
        if (result.isBookmarked) {
          trackBookmark(articleId, "article");
        }
        toast({
          title: result.message,
          description: result.isBookmarked
            ? "マイページから確認できます"
            : undefined,
        });
      } else {
        toast({
          title: result.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isPending}
      className={className}
      style={{ fontFamily: "'Hiragino Sans', -apple-system, sans-serif" }}
      aria-label={isBookmarked ? "ブックマークを解除" : "ブックマークに追加"}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Star
          size={16}
          className="transition-all duration-200"
          color={isBookmarked ? "#FFC107" : "#6B7280"}
          fill={isBookmarked ? "#FFC107" : "transparent"}
          strokeWidth={1.5}
        />
      )}
      {showLabel && (
        <span className={`text-center text-gray-600 text-sm font-semibold font-['Hiragino_Sans'] leading-5 ${labelClassName}`}>
          お気に入り
        </span>
      )}
    </Button>
  );
}
