"use client";

import { ArticleTag, TagType } from "@/components/article/ArticleTag";
import { ArticleActionButtons } from "@/components/article/ArticleActionButtons";
import type { ReactNode } from "react";

interface HeadingSectionProps {
  tagType?: TagType;
  title: string;
  description?: string;
  questInfo?: {
    questNumber: number;
    title: string;
  };
  articleIndex?: number;
  articleId: string;
  lessonId: string;
  isBookmarked?: boolean;
  isCompleted?: boolean;
  isPremium?: boolean;
  onNext?: () => void;
  /** Server Component からアクション領域だけをストリーミングする場合の差し替え */
  actions?: ReactNode;
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
  articleId,
  lessonId,
  isBookmarked = false,
  isCompleted = false,
  isPremium = false,
  onNext,
  actions,
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
          <h1 className="self-stretch justify-center text-gray-900 text-2xl md:text-[28px] font-semibold font-noto-sans-jp leading-[148%]">
            {articleIndex ? `${articleIndex}. ` : ""}
            {title}
          </h1>

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

      {/* Action Area — ArticleActionButtonsに委譲（main準拠） */}
      <div className="w-full min-h-[100px] md:min-h-[54px]">
        {actions !== undefined ? (
          actions
        ) : (
          <ArticleActionButtons
            articleId={articleId}
            lessonId={lessonId}
            title={title}
            isBookmarked={isBookmarked}
            isCompleted={isCompleted}
            isPremium={isPremium}
            onNext={onNext}
          />
        )}
      </div>
    </div>
  );
};

export default HeadingSection;
