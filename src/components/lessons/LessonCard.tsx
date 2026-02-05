import React from 'react';
import { Lesson } from '@/types/lesson';
import { cn } from '@/lib/utils';

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
 */
const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onClick,
  className,
}) => {
  return (
    <article
      className={cn(
        'bg-white flex flex-col p-5 rounded-[29px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.08)]',
        'cursor-pointer transition-all duration-200',
        'hover:shadow-[0px_1px_12px_0px_rgba(0,0,0,0.12)]',
        'w-full h-full text-[#0d221d] opacity-100',
        'sm:min-h-[320px] md:min-h-[340px] lg:min-h-0',
        'lg:aspect-[298/357]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex h-full flex-col justify-between gap-4">
        {/* カテゴリバッジ */}
        {lesson.category && (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center px-2 py-[6px] border border-black rounded-[30px]">
              <span className="font-noto-sans-jp text-[12px] font-medium text-[#0d221d] leading-[10px]">
                {lesson.category}
              </span>
            </span>
          </div>
        )}

        {/* 画像エリア */}
        <div className="flex justify-center items-center py-2 min-h-[40%]">
          {lesson.thumbnail ? (
            <div className="w-[108px] h-[163px] sm:w-[120px] sm:h-[180px] md:w-[132px] md:h-[198px] lg:w-[108px] lg:h-[163px] rounded-tr-[4px] rounded-br-[4px] shadow-[0px_0px_32px_0px_rgba(0,0,0,0.16)] overflow-hidden">
              <img
                src={lesson.thumbnail}
                alt={`${lesson.title}のサムネイル`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-[108px] h-[163px] sm:w-[120px] sm:h-[180px] md:w-[132px] md:h-[198px] lg:w-[108px] lg:h-[163px] rounded-tr-[4px] rounded-br-[4px] bg-gray-200" />
          )}
        </div>

        {/* タイトル・説明エリア */}
        <div className="flex flex-col gap-1">
          <h3 className="font-rounded-mplus-bold text-base font-bold !text-[#0d221d] !opacity-100 leading-[1.5]">
            {lesson.title}
          </h3>
          {lesson.description && (
            <p className="font-noto-sans-jp text-xs font-medium text-[rgba(13,34,29,0.48)] leading-[1.5] line-clamp-2">
              {lesson.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default LessonCard;
