"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Clock, Map } from "lucide-react";
import { GradientLockIcon } from "@/components/ui/icon-lock-gradient";
import { GuideCardMedia } from "@/components/guide/GuideCardMedia";

export type HorizontalCardVariant = "lesson" | "article" | "guide";

export interface HorizontalContentCardProps {
  variant: HorizontalCardVariant;
  href: string;
  title: string;
  thumbnailUrl?: string;
  description?: string;

  // variant 別メタ情報
  lessonCount?: number; // lesson
  category?: string; // lesson / guide
  parentLessonTitle?: string; // article
  readingTime?: number; // article（分）
  author?: { name: string; avatarUrl?: string }; // guide
  publishedDate?: string; // guide
  videoUrl?: string; // guide（あれば iframe 優先）
  linkedRoadmaps?: { slug: string; title: string; shortTitle?: string }[]; // lesson

  isPremium?: boolean;
  className?: string;
}

/** `2026/5/8` 形式で整形（ISO or 既に整形済の文字列を許容） */
const formatPublishedDate = (date?: string): string => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
};

// ============================================================
// Lesson 横版：main の LessonCardHorizontal をベース + ロードマップタグ
// ============================================================
const LessonRow: React.FC<HorizontalContentCardProps & { showLock: boolean }> = ({
  href,
  title,
  thumbnailUrl,
  description,
  category,
  linkedRoadmaps,
  showLock,
  className,
}) => {
  const hasRoadmap = !!linkedRoadmaps && linkedRoadmaps.length > 0;

  return (
    <Link
      href={href}
      className={cn(
        "group bg-white flex items-stretch gap-4 p-3 sm:p-4 rounded-[16px] sm:rounded-[20px]",
        "shadow-[0px_1px_8px_0px_rgba(0,0,0,0.08)]",
        "transform transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0px_4px_18px_0px_rgba(0,0,0,0.16)]",
        "w-full text-[#0d221d]",
        className
      )}
    >
      {/* サムネイル（縦長 2:3、本表紙風） */}
      <div className="flex-shrink-0 w-[180px] sm:w-[240px] aspect-video p-3 rounded-xl bg-[#F5F5F5] flex items-center justify-center">
        {thumbnailUrl ? (
          <div className="h-full aspect-[2/3] rounded-[4px] shadow-[0px_0px_16px_0px_rgba(0,0,0,0.12)] overflow-hidden bg-white">
            <img
              src={thumbnailUrl}
              alt={`${title}のサムネイル`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="h-full aspect-[2/3] rounded-[4px] bg-gray-200" />
        )}
      </div>

      {/* テキストエリア */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 justify-center">
        {category && (
          <span className="inline-flex items-center self-start px-2 py-0.5 border border-black rounded-[30px]">
            <span className="font-noto-sans-jp text-[10px] sm:text-[11px] font-medium text-[#0d221d] leading-[10px]">
              {category}
            </span>
          </span>
        )}
        <h3 className="font-rounded-mplus-bold text-base font-bold text-[#0d221d] leading-[1.4] line-clamp-2">
          {showLock && (
            <GradientLockIcon
              size={14}
              className="inline-block align-middle mr-1 -mt-0.5"
            />
          )}
          {title}
        </h3>
        {description && (
          <p className="font-noto-sans-jp text-[10px] sm:text-[11px] font-medium text-[var(--text-muted)] leading-[1.5] line-clamp-2">
            {description}
          </p>
        )}
        {hasRoadmap && (
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {linkedRoadmaps!.map((roadmap) => (
              <span
                key={roadmap.slug}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[rgba(13,34,29,0.06)] rounded-md text-[9px] sm:text-[10px] font-medium text-[rgba(13,34,29,0.56)]"
              >
                <Map className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                {roadmap.shortTitle || roadmap.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

// ============================================================
// Guide 横版：本番 GuideCard と同じ要素（カテゴリ上、日付下） + 横レイアウト
// ============================================================
const GuideRow: React.FC<HorizontalContentCardProps & { showLock: boolean }> = ({
  href,
  title,
  thumbnailUrl,
  videoUrl,
  description,
  category,
  author,
  publishedDate,
  showLock,
  className,
}) => {
  const formattedDate = formatPublishedDate(publishedDate);

  return (
    <Link
      href={href}
      className={cn(
        "group bg-white flex items-stretch gap-4 sm:gap-5 p-3 sm:p-4 rounded-2xl",
        "shadow-[0px_1px_8px_0px_rgba(0,0,0,0.06)]",
        "hover:-translate-y-0.5 hover:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.10)]",
        "transition-all duration-200",
        className
      )}
    >
      {/* メディア（GuideCardMedia と同じ。レッスン・記事と同じサムネ幅で統一） */}
      <div className="flex-shrink-0 w-[180px] sm:w-[240px]">
        <GuideCardMedia title={title} videoUrl={videoUrl} thumbnail={thumbnailUrl} />
      </div>

      {/* テキストエリア */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 justify-center py-1">
        {/* カテゴリラベル（タイトル上のサブテキスト） */}
        {category && (
          <span className="text-[13px] text-text-muted">{category}</span>
        )}

        <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 text-balance group-hover:opacity-70 transition-opacity duration-200">
          {showLock && (
            <GradientLockIcon
              size={14}
              className="inline-block align-middle mr-1 -mt-0.5"
            />
          )}
          {title}
        </h3>

        {description && (
          <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          {author && (
            <div className="flex items-center gap-1.5">
              {author.avatarUrl ? (
                <img
                  src={author.avatarUrl}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-[8px] font-bold text-muted-foreground">
                    {author.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-[13px] font-medium text-foreground">
                {author.name}
              </span>
            </div>
          )}
          {formattedDate && (
            <span className="text-[13px] text-text-muted">{formattedDate}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

// ============================================================
// Article 横版：BookmarkListItem の流れを汲んだコンパクト横長
// ============================================================
const ArticleRow: React.FC<HorizontalContentCardProps & { showLock: boolean }> = ({
  href,
  title,
  thumbnailUrl,
  description,
  parentLessonTitle,
  readingTime,
  showLock,
  className,
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "group bg-white flex items-stretch gap-4 p-3 sm:p-4 rounded-2xl",
        "shadow-[0px_1px_8px_0px_rgba(0,0,0,0.06)]",
        "hover:-translate-y-0.5 hover:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.10)]",
        "transition-all duration-200",
        className
      )}
    >
      {/* サムネ（横長コンパクト） */}
      <div className="flex-shrink-0 w-[180px] sm:w-[240px] aspect-video rounded-xl overflow-hidden bg-[#F5F5F5]">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>

      {/* テキスト */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 justify-center">
        <h3 className="font-rounded-mplus text-base font-bold text-black leading-snug line-clamp-2">
          {showLock && (
            <GradientLockIcon
              size={14}
              className="inline-block align-middle mr-1 -mt-0.5"
            />
          )}
          {title}
        </h3>
        {parentLessonTitle && (
          <p className="text-xs text-[#4B5563] truncate">
            by {parentLessonTitle}
            {typeof readingTime === "number" && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readingTime}分
              </span>
            )}
          </p>
        )}
        {description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
};

// ============================================================
// ディスパッチャー
// ============================================================
const HorizontalContentCard: React.FC<HorizontalContentCardProps> = (props) => {
  // TODO: サブスクリプション判定を Next.js 版の SubscriptionContext / canAccessContent に接続
  //       現状は一律 ロック非表示（後でフェーズ 11 で対応）
  const isLocked = false;
  const showLock = isLocked && props.variant !== "lesson";

  switch (props.variant) {
    case "lesson":
      return <LessonRow {...props} showLock={showLock} />;
    case "guide":
      return <GuideRow {...props} showLock={showLock} />;
    case "article":
    default:
      return <ArticleRow {...props} showLock={showLock} />;
  }
};

export default HorizontalContentCard;
