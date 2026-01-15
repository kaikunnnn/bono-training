import { ChevronRight } from "lucide-react";
import { ArticleTag, TagType } from "@/components/article/sidebar/ArticleTag";
import { CheckIcon } from "@/components/article/sidebar/CheckIcon";
import { IconButton } from "@/components/ui/button/IconButton";

interface HeadingSectionProps {
  tagType: TagType;
  title: string;
  description?: string;
  onComplete?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
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
  onComplete,
  onFavorite,
  onShare,
  onNext,
  isBookmarked = false,
  bookmarkLoading = false,
  isCompleted = false,
  completionLoading = false,
}: HeadingSectionProps) => {
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
          <div className="self-stretch justify-center text-gray-900 text-2xl font-bold font-['Noto_Sans_JP'] leading-8">
            {title}
          </div>
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
            {/* Complete Button - IconButton コンポーネント使用 */}
            <IconButton
              icon={<CheckIcon isCompleted={isCompleted} />}
              label={isCompleted ? "完了済み" : "完了にする"}
              onClick={onComplete}
            />

            {/* Favorite Button */}
            <button
              onClick={onFavorite}
              disabled={bookmarkLoading}
              className="px-3 py-2 bg-gray-200 rounded-xl flex justify-start items-center gap-1"
              style={{ fontFamily: "'Hiragino Sans', -apple-system, sans-serif" }}
              aria-label={isBookmarked ? "ブックマークを解除" : "ブックマークに追加"}
            >
              {/* Star Icon */}
              <div className="w-4 h-4 relative flex-shrink-0">
                <div className="w-3.5 h-3.5 left-[1.50px] top-[1.50px] absolute outline outline-1 outline-offset-[-0.56px] outline-gray-500" />
              </div>

              {/* Text */}
              <div className="inline-flex flex-col justify-start items-center">
                <div className="text-center justify-center text-gray-600 text-sm font-semibold font-['Hiragino_Sans'] leading-5">
                  お気に入り
                </div>
              </div>
            </button>

            {/* Share Button */}
            <button
              onClick={onShare}
              className="px-3 py-2 bg-gray-200 rounded-xl flex justify-start items-center gap-1"
              style={{ fontFamily: "'Hiragino Sans', -apple-system, sans-serif" }}
              aria-label="シェア"
            >
              {/* Share Icon - 3 dots with lines */}
              <div className="w-4 h-4 relative flex-shrink-0">
                <div className="w-1 h-1 left-[11.25px] top-[1.50px] absolute outline outline-1 outline-offset-[-0.56px] outline-slate-950" />
                <div className="w-1 h-1 left-[2.25px] top-[6.75px] absolute outline outline-1 outline-offset-[-0.56px] outline-slate-950" />
                <div className="w-1 h-1 left-[11.25px] top-[12px] absolute outline outline-1 outline-offset-[-0.56px] outline-slate-950" />
                <div className="w-[5.12px] h-[2.98px] left-[6.44px] top-[10.13px] absolute outline outline-1 outline-offset-[-0.56px] outline-slate-950" />
                <div className="w-[5.11px] h-[2.98px] left-[6.44px] top-[4.88px] absolute outline outline-1 outline-offset-[-0.56px] outline-slate-950" />
              </div>

              {/* Text */}
              <div className="inline-flex flex-col justify-start items-center">
                <div className="text-center justify-center text-gray-600 text-sm font-semibold font-['Hiragino_Sans'] leading-5">
                  シェア
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Right Button - Next Video */}
        {onNext && (
          <button
            onClick={onNext}
            className="px-3 py-2 bg-gray-200 rounded-xl flex justify-start items-center gap-1"
            style={{ fontFamily: "'Hiragino Sans', -apple-system, sans-serif" }}
            aria-label="次の動画へ"
          >
            {/* Text */}
            <div className="inline-flex flex-col justify-start items-center">
              <div className="text-center justify-center text-gray-500 text-sm font-semibold font-['Hiragino_Sans'] leading-5">
                次の動画
              </div>
            </div>

            {/* Chevron Icon */}
            <div className="w-4 h-4 relative flex-shrink-0">
              <div className="w-1 h-2 left-[6px] top-[4px] absolute outline outline-[1.33px] outline-offset-[-0.67px] outline-gray-500" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default HeadingSection;
