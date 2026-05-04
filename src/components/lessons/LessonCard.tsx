"use client";

import React from 'react';
import { Map } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}) => {
  const hasRoadmap = lesson.linkedRoadmaps && lesson.linkedRoadmaps.length > 0;

  return (
    <article
      className={cn(
        'bg-white flex flex-col p-3 sm:p-4 md:p-5 rounded-[20px] sm:rounded-[24px] md:rounded-[29px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.08)]',
        'cursor-pointer will-change-transform',
        'hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0px_4px_18px_0px_rgba(0,0,0,0.16)]',
        'w-full h-full text-[#0d221d] opacity-100',
        className
      )}
      onClick={onClick}
      style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
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
    </article>
  );
};

export { LessonCard };
export default LessonCard;
