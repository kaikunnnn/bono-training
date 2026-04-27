"use client";

import { useState, useTransition } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toggleBookmark } from "@/lib/services/bookmarks";

interface BookmarkButtonProps {
  articleId: string;
  initialIsBookmarked: boolean;
  isPremium?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  labelClassName?: string;
}

export function BookmarkButton({
  articleId,
  initialIsBookmarked,
  isPremium = false,
  variant = "secondary",
  size = "sm",
  showLabel = true,
  labelClassName = "",
}: BookmarkButtonProps) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleBookmark(articleId, isPremium);

      if (result.success) {
        setIsBookmarked(result.isBookmarked);
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
      className="gap-1"
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
        <span className={`text-center text-gray-600 text-sm font-semibold leading-5 ${labelClassName}`}>
          お気に入り
        </span>
      )}
    </Button>
  );
}
