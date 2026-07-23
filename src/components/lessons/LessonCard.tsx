"use client";

import React from 'react';
import Image from 'next/image';
import { Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HoverCard } from '@/components/common/HoverCard';

interface LinkedRoadmap {
  slug: string;
  title: string;
  shortTitle?: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  slug: string;
  linkedRoadmaps?: LinkedRoadmap[];
}

interface LessonCardProps {
  lesson: Lesson;
  onClick?: () => void;
  className?: string;
  /**
   * "default": 既存の /lessons 一覧デザイン（変更なし）
   * "cover": 新トップページ用の本の表紙風デザイン（新トップページHANDOFF由来）
   */
  variant?: "default" | "cover";
  /** cover variant のみ: 左上カテゴリ表示（未指定時は lesson.category、それも無ければ "UIデザイン"） */
  cat?: string;
  /** cover variant のみ: 影の強さ */
  shadow?: "normal" | "light";
}

/**
 * レッスンカードコンポーネント
 *
 * レッスン一覧で表示されるカード
 * Figma仕様: lesson-item (30:2293)
 * ※ mainブランチからコピー＋最小変更
 */
const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onClick,
  className,
  variant = "default",
  cat,
  shadow = "normal",
}) => {
  const hasRoadmap = lesson.linkedRoadmaps && lesson.linkedRoadmaps.length > 0;

  if (variant === "cover") {
    const cardClass =
      shadow === "light"
        ? "bg-white rounded-[29px] border border-[rgba(0,0,0,0.08)] drop-shadow-[0px_1px_4px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col"
        : "bg-white rounded-[29px] lg:rounded-[36px] border border-[rgba(0,0,0,0.12)] overflow-hidden flex flex-col";
    return (
      <div className={cn(cardClass, "cursor-pointer group", className)} onClick={onClick}>
        <div className="relative flex items-center justify-center pt-[48px] pb-[16px] px-[24px] overflow-hidden">
          <p className="absolute top-[21px] left-[28px] font-noto-sans-jp font-bold text-[12px] text-[#6d56ff] leading-[1.6] whitespace-nowrap z-10">
            {cat ?? lesson.category ?? "UIデザイン"}
          </p>
          <div className="relative h-[176px] w-[116px] overflow-hidden rounded-tr-[4px] rounded-br-[4px]">
            {lesson.thumbnail && (
              <Image
                src={lesson.thumbnail}
                alt={`${lesson.title}のサムネイル`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              />
            )}
          </div>
        </div>
        <div className="px-[32px] py-[24px] flex flex-col gap-[12px]">
          {/* "レッスン" タグ（Phase 1 で共通 LessonTag atom に置き換え予定） */}
          <div className="bg-[rgba(102,102,102,0.06)] border border-[rgba(102,102,102,0.04)] rounded-[61px] flex items-center gap-[4px] px-[8px] py-[6px] self-start">
            <p className="font-noto-sans-jp font-bold text-[11px] text-[#666] uppercase leading-normal">
              レッスン
            </p>
          </div>
          <h4 className="font-noto-sans-jp font-bold text-[20px] text-text-primary leading-normal group-hover:opacity-70 transition-opacity duration-300">
            {lesson.title}
          </h4>
          {lesson.description && (
            <p className="font-noto-sans-jp font-normal text-[14px] text-text-primary/80 leading-[1.6]">
              {lesson.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <HoverCard
      as="article"
      className={cn(
        'bg-white flex flex-col p-3 sm:p-4 md:p-5 rounded-[20px] sm:rounded-[24px] md:rounded-[29px] cursor-pointer w-full h-full text-[#0d221d] opacity-100',
        className
      )}
      hoverTransform="translateY(-4px) scale(1.01)"
      hoverShadow="0px 4px 18px 0px rgba(0,0,0,0.16)"
      baseShadow="0px 1px 8px 0px rgba(0,0,0,0.08)"
      transitionTiming="0.2s ease"
      onClick={onClick}
    >
      <div className="flex h-full flex-col justify-between gap-2 sm:gap-3 md:gap-4">
        {/* カテゴリバッジ */}
        {lesson.category && (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center px-2 py-1 border border-black rounded-[30px]">
              <span className="font-noto-sans-jp text-[10px] sm:text-[11px] md:text-[12px] font-medium text-[#0d221d] leading-[10px]">
                {lesson.category}
              </span>
            </span>
          </div>
        )}

        {/* 画像エリア */}
        <div className="flex justify-center items-center py-1 sm:py-2 flex-1">
          {lesson.thumbnail ? (
            <div className="w-[90px] sm:w-[45%] sm:max-w-[120px] aspect-[2/3] rounded-tr-[4px] rounded-br-[4px] shadow-[0px_0px_32px_0px_rgba(0,0,0,0.16)] overflow-hidden">
              <img
                src={lesson.thumbnail}
                alt={`${lesson.title}のサムネイル`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-[90px] sm:w-[45%] sm:max-w-[120px] aspect-[2/3] rounded-tr-[4px] rounded-br-[4px] bg-gray-200" />
          )}
        </div>

        {/* タイトル・説明エリア */}
        <div className="flex flex-col gap-0.5 sm:gap-1">
          <h3 className="font-rounded-mplus-bold text-[13px] sm:text-sm md:text-base font-bold !text-[#0d221d] !opacity-100 leading-[1.4]">
            {lesson.title}
          </h3>
          {lesson.description && (
            <p className="font-noto-sans-jp text-[10px] sm:text-[11px] md:text-[13px] font-medium text-[rgba(13,34,29,0.48)] leading-[1.6] line-clamp-2">
              {lesson.description}
            </p>
          )}
          {/* ロードマップ紐づき表示 */}
          {hasRoadmap && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {lesson.linkedRoadmaps!.map((roadmap) => (
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
      </div>
    </HoverCard>
  );
};

export { LessonCard };
export default LessonCard;
