"use client";

import { CompletionButton } from "@/components/article/CompletionButton";
import { BookmarkButton } from "@/components/article/BookmarkButton";
import { Button } from "@/components/ui/button";
import { ShareDropdown } from "@/components/common/ShareDropdown";
import { ArrowRight, Share2 } from "lucide-react";

export interface ArticleActionButtonsProps {
  articleId: string;
  lessonId: string;
  title: string;
  isBookmarked?: boolean;
  isCompleted?: boolean;
  isPremium?: boolean;
  favoriteLabelMode?: "iconAndText" | "iconOnlyOnMobile" | "iconOnly";
  onNext?: () => void;
}

/**
 * ArticleActionButtons コンポーネント
 * 記事のアクションボタン群（完了・お気に入り・シェア・次へ）
 */
export const ArticleActionButtons = ({
  articleId,
  lessonId,
  title,
  isBookmarked = false,
  isCompleted = false,
  isPremium = false,
  favoriteLabelMode = "iconAndText",
  onNext,
}: ArticleActionButtonsProps) => {
  const isFavoriteIconOnly = favoriteLabelMode === "iconOnly";
  const isFavoriteIconOnlyOnMobile = favoriteLabelMode === "iconOnlyOnMobile";

  return (
    <div className="w-full py-2 flex flex-col gap-3 items-start text-center md:flex-row md:gap-0 md:justify-between md:items-start">
      {/* Left Button Group - Complete, Favorite, Share */}
      <div className="w-full md:w-auto min-w-0">
        <div className="flex flex-nowrap justify-start items-center gap-2 min-w-0 md:flex-wrap md:gap-3">
          <CompletionButton
            articleId={articleId}
            lessonId={lessonId}
            initialIsCompleted={isCompleted}
          />

          <BookmarkButton
            articleId={articleId}
            initialIsBookmarked={isBookmarked}
            isPremium={isPremium}
            showLabel={!isFavoriteIconOnly}
            labelClassName={isFavoriteIconOnlyOnMobile ? "hidden sm:inline" : ""}
            className={
              isFavoriteIconOnly
                ? "gap-0 px-[10px]"
                : isFavoriteIconOnlyOnMobile
                ? "gap-0 sm:gap-1 px-[10px] sm:px-[12px]"
                : "gap-1"
            }
          />

          {/* Share Button with Dropdown */}
          <ShareDropdown title={title}>
            <Button
              variant="secondary"
              size="action"
              className="gap-0 sm:gap-1 px-[10px] sm:px-[12px]"
              style={{
                fontFamily: "'Hiragino Sans', -apple-system, sans-serif",
              }}
              aria-label="シェア"
            >
              <Share2 size={16} className="text-gray-600" />

              <div className="hidden sm:inline-flex flex-col justify-start items-center">
                <div className="text-center justify-center text-gray-600 text-sm font-semibold font-['Hiragino_Sans'] leading-5">
                  シェア
                </div>
              </div>
            </Button>
          </ShareDropdown>
        </div>
      </div>

      {/* Right Button - Next Video */}
      {onNext && (
        <Button
          onClick={onNext}
          variant="secondary"
          size="action"
          className="gap-1 w-full md:w-auto justify-center md:justify-start"
          style={{ fontFamily: "'Hiragino Sans', -apple-system, sans-serif" }}
          aria-label="次の動画へ"
        >
          <div className="inline-flex flex-col justify-start items-center">
            <div className="text-center justify-center text-gray-500 text-sm font-semibold font-['Hiragino_Sans'] leading-5">
              次の動画
            </div>
          </div>

          <ArrowRight size={16} className="text-gray-500" />
        </Button>
      )}
    </div>
  );
};

export default ArticleActionButtons;
