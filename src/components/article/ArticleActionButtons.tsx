import { ArrowRight, Share2 } from "@/lib/icons";
import { Star as LucideStar } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ArticleCompleteButton } from "@/components/article/ArticleCompleteButton";
import { Button } from "@/components/ui/button";
import { ShareDropdown } from "@/components/common/ShareDropdown";

export interface ArticleActionButtonsProps {
  title: string;
  onComplete?: () => void;
  onFavorite?: () => void;
  onNext?: () => void;
  isBookmarked?: boolean;
  bookmarkLoading?: boolean;
  isCompleted?: boolean;
  completionLoading?: boolean;
  /** お気に入りボタンのラベル表示（下部カードなどでアイコンのみ表示したい場合） */
  favoriteLabelMode?: "iconAndText" | "iconOnlyOnMobile" | "iconOnly";
}

/**
 * ArticleActionButtons コンポーネント
 * 記事のアクションボタン群（完了・お気に入り・シェア・次へ）
 */
export const ArticleActionButtons = ({
  title,
  onComplete,
  onFavorite,
  onNext,
  isBookmarked = false,
  bookmarkLoading = false,
  isCompleted = false,
  completionLoading = false,
  favoriteLabelMode = "iconAndText",
}: ArticleActionButtonsProps) => {
  const [completeBurstKey, setCompleteBurstKey] = useState(0);
  const prevIsCompletedRef = useRef(isCompleted);

  // 完了状態が false -> true に切り替わった瞬間だけ burst を発火
  useEffect(() => {
    const prev = prevIsCompletedRef.current;
    prevIsCompletedRef.current = isCompleted;

    if (!prev && isCompleted) {
      setCompleteBurstKey((k) => k + 1);
    }
  }, [isCompleted]);

  const isFavoriteIconOnly = favoriteLabelMode === "iconOnly";
  const isFavoriteIconOnlyOnMobile = favoriteLabelMode === "iconOnlyOnMobile";

  return (
    <div className="w-full py-2 flex flex-col gap-3 items-start text-center md:flex-row md:gap-0 md:justify-between md:items-start">
      {/* Left Button Group - Complete, Favorite, Share */}
      <div className="w-full md:w-auto min-w-0">
        <div className="flex flex-nowrap justify-start items-center gap-2 min-w-0 md:flex-wrap md:gap-3">
          <ArticleCompleteButton
            isCompleted={isCompleted}
            onClick={onComplete}
            burstKey={completeBurstKey}
          />

          {/* Favorite Button */}
          <Button
            onClick={onFavorite}
            disabled={bookmarkLoading}
            variant="secondary"
            size="action"
            className={
              isFavoriteIconOnly
                ? "gap-0 px-[10px]"
                : isFavoriteIconOnlyOnMobile
                ? "gap-0 sm:gap-1 px-[10px] sm:px-[12px]"
                : "gap-1"
            }
            style={{
              fontFamily: "'Hiragino Sans', -apple-system, sans-serif",
            }}
            aria-label={
              isBookmarked ? "ブックマークを解除" : "ブックマークに追加"
            }
          >
            {/* Star Icon */}
            <LucideStar
              size={16}
              className="transition-all duration-200"
              color={isBookmarked ? "#FFC107" : "#6B7280"}
              fill={isBookmarked ? "#FFC107" : "transparent"}
              strokeWidth={1.5}
            />

            {/* Text */}
            {!isFavoriteIconOnly && (
              <div
                className={
                  isFavoriteIconOnlyOnMobile
                    ? "hidden sm:inline-flex flex-col justify-start items-center"
                    : "inline-flex flex-col justify-start items-center"
                }
              >
                <div className="text-center justify-center text-gray-600 text-sm font-semibold font-['Hiragino_Sans'] leading-5">
                  お気に入り
                </div>
              </div>
            )}
          </Button>

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
              {/* Share Icon */}
              <Share2 size={16} className="text-gray-600" />

              {/* Text */}
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
          {/* Text */}
          <div className="inline-flex flex-col justify-start items-center">
            <div className="text-center justify-center text-gray-500 text-sm font-semibold font-['Hiragino_Sans'] leading-5">
              次の動画
            </div>
          </div>

          {/* Arrow Icon */}
          <ArrowRight size={16} className="text-gray-500" />
        </Button>
      )}
    </div>
  );
};

export default ArticleActionButtons;
