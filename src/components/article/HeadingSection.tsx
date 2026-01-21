import { ArrowRight, Share2 } from "@/lib/icons";
import { Star as LucideStar } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ArticleTag, TagType } from "@/components/article/sidebar/ArticleTag";
import { ArticleCompleteButton } from "@/components/article/ArticleCompleteButton";
import { Button } from "@/components/ui/button";
import { ShareDropdown } from "@/components/common/ShareDropdown";

interface HeadingSectionProps {
  tagType?: TagType;
  title: string;
  description?: string;
  questInfo?: {
    questNumber: number;
    title: string;
  };
  articleIndex?: number; // クエスト内での記事の順番（1始まり）
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
 * 記事詳細ページのコンテンツヘッダーセクション
 *
 * Figma仕様準拠:
 * - レスポンシブ幅対応（px-6 py-4）
 * - タグ（ArticleTag コンポーネント）
 * - タイトル（text-2xl Noto Sans JP Bold）
 * - 説明文（text-base Hiragino Sans）
 * - ボタングループ（完了・お気に入り・シェア / 次へ）
 */
const HeadingSection = ({
  tagType,
  title,
  description,
  questInfo,
  articleIndex,
  onComplete,
  onFavorite,
  onNext,
  isBookmarked = false,
  bookmarkLoading = false,
  isCompleted = false,
  completionLoading = false,
}: HeadingSectionProps) => {
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

  return (
    <div className="w-full px-6 py-4 bg-white rounded-[20px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] inline-flex flex-col justify-start items-start gap-3">
      {/* Header Section - Tag, Title, Description */}
      <div className="self-stretch pb-4 border-b border-neutral-200 flex flex-col justify-start items-start gap-2">
        {/* Tag Container */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch inline-flex justify-start items-center gap-1">
            <ArticleTag type={tagType} />
          </div>

          {/* Title */}
          <div className="self-stretch justify-center text-gray-900 text-2xl md:text-[28px] font-semibold font-['Noto_Sans_JP'] leading-[148%]">
            {articleIndex ? `${articleIndex}. ` : ''}{title}
          </div>

          {/* Quest Info */}
          {questInfo && (
            <div className="text-slate-500 text-sm font-normal font-['Hiragino_Sans']">
              クエスト{questInfo.questNumber}: {questInfo.title}
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <div className="self-stretch justify-center text-slate-500 text-base font-normal font-['Hiragino_Sans'] leading-6">
            {description}
          </div>
        )}
      </div>

      {/* Action Area */}
      <div className="self-stretch py-2 inline-flex justify-between items-center">
        {/* Left Button Group - Complete, Favorite, Share */}
        <div className="flex justify-start items-center gap-2">
          <div className="self-stretch flex justify-start items-center gap-3">
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
              className="gap-1"
              style={{ fontFamily: "'Hiragino Sans', -apple-system, sans-serif" }}
              aria-label={isBookmarked ? "ブックマークを解除" : "ブックマークに追加"}
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
              <div className="inline-flex flex-col justify-start items-center">
                <div className="text-center justify-center text-gray-600 text-sm font-semibold font-['Hiragino_Sans'] leading-5">
                  お気に入り
                </div>
              </div>
            </Button>

            {/* Share Button with Dropdown */}
            <ShareDropdown title={title}>
              <Button
                variant="secondary"
                size="action"
                className="gap-1"
                style={{ fontFamily: "'Hiragino Sans', -apple-system, sans-serif" }}
                aria-label="シェア"
              >
                {/* Share Icon */}
                <Share2 size={16} className="text-gray-600" />

                {/* Text */}
                <div className="inline-flex flex-col justify-start items-center">
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
            className="gap-1"
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
    </div>
  );
};

export default HeadingSection;
