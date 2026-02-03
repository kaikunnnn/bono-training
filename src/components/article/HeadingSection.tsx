import { ArticleTag, TagType } from "@/components/article/sidebar/ArticleTag";
import { ArticleActionButtons } from "@/components/article/ArticleActionButtons";

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
            {articleIndex ? `${articleIndex}. ` : ""}
            {title}
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
      <ArticleActionButtons
        title={title}
        onComplete={onComplete}
        onFavorite={onFavorite}
        onNext={onNext}
        isBookmarked={isBookmarked}
        bookmarkLoading={bookmarkLoading}
        isCompleted={isCompleted}
        completionLoading={completionLoading}
      />
    </div>
  );
};

export default HeadingSection;
