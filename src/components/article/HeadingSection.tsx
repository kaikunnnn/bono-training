import { Check, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeadingSectionProps {
  questNumber?: number;
  stepNumber?: number;
  title: string;
  description?: string;
  onComplete?: () => void;
  onFavorite?: () => void;
  onNext?: () => void;
  isBookmarked?: boolean;
  bookmarkLoading?: boolean;
  isCompleted?: boolean;
  completionLoading?: boolean;
}

/**
 * HeadingSection コンポーネント
 * 記事詳細ページのヘッダーセクション
 *
 * 仕様:
 * - クエスト情報表示（Quest N / Step N）
 * - タイトル（28px Noto Sans JP Bold）
 * - 説明文（16px Inter）
 * - アクションボタン（完了・お気に入り・シェア・次へ）
 */
const HeadingSection = ({
  questNumber,
  stepNumber,
  title,
  description,
  onComplete,
  onFavorite,
  onNext,
  isBookmarked = false,
  bookmarkLoading = false,
  isCompleted = false,
  completionLoading = false,
}: HeadingSectionProps) => {
  return (
    <div className="w-full flex flex-col gap-[15px]">
      {/* Quest Info */}
      {(questNumber !== undefined || stepNumber !== undefined) && (
        <div className="flex items-center gap-1 text-[12px] leading-[16px] text-[#747474]" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
          {questNumber !== undefined && (
            <div className="flex">
              <span>クエスト</span>
              <span>{questNumber}</span>
            </div>
          )}
          {questNumber !== undefined && stepNumber !== undefined && (
            <span className="text-[#C0C0C0]">/</span>
          )}
          {stepNumber !== undefined && (
            <div className="flex">
              <span>ステップ</span>
              <span>{stepNumber}</span>
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <h1
        className="text-[28px] font-bold leading-[32px] text-[#102028]"
        style={{
          fontFamily: "'Hiragino Maru Gothic Pro', 'Hiragino Maru Gothic ProN', sans-serif",
          fontWeight: 700,
        }}
      >
        {title}
      </h1>

      {/* Description */}
      {description && (
        <p
          className="text-base leading-6 text-[#4A5565]"
          style={{
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-1.953%",
          }}
        >
          {description}
        </p>
      )}

      {/* Action Area */}
      <div className="flex items-center justify-between gap-3 py-[8px]">
        {/* Left Button Group */}
        <div className="flex items-center gap-2">
          {/* Complete Button - action-secondary */}
          <Button
            variant="action-secondary"
            size="action"
            onClick={onComplete}
            disabled={completionLoading}
            className={isCompleted ? 'bg-green-100 border-green-300 text-green-800' : ''}
            style={{ fontFamily: "'Hiragino Sans', -apple-system, sans-serif" }}
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            <span>{isCompleted ? '完了済み' : '完了にする'}</span>
          </Button>

          {/* Favorite Button - action-tertiary */}
          <Button
            variant="action-tertiary"
            size="action"
            onClick={onFavorite}
            disabled={bookmarkLoading}
            className={isBookmarked ? 'bg-yellow-100 text-yellow-800' : ''}
            style={{ fontFamily: "'Hiragino Sans', -apple-system, sans-serif" }}
            aria-label={isBookmarked ? 'ブックマークを解除' : 'ブックマークに追加'}
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                isBookmarked
                  ? 'fill-yellow-400 stroke-yellow-400'
                  : 'stroke-current'
              }`}
              strokeWidth={1.5}
            />
            <span>お気に入り</span>
          </Button>
        </div>

        {/* Right: Next Content Button - action-tertiary */}
        {onNext && (
          <Button
            variant="action-tertiary"
            size="action"
            onClick={onNext}
            className="bg-[#F3F5F5] text-[#6A7282]"
            style={{ fontFamily: "'Hiragino Sans', -apple-system, sans-serif" }}
          >
            <span>次へ</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default HeadingSection;
