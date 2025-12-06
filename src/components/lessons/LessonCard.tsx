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
 * Figma仕様: item_lesson
 */
const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onClick,
  className,
}) => {
  return (
    <article
      className={cn(
        'flex w-full border border-black/5 rounded-xl overflow-hidden cursor-pointer',
        'transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]',
        'hover:border-black/10 active:translate-y-[-2px]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col w-full bg-black/[0.04]">
        {/* 画像エリア */}
        <div className="flex justify-center items-center p-[10.33px] w-full h-40 bg-white rounded-t-xl">
          <div className="rounded-r-[8.77px] shadow-[1px_1px_12px_0_rgba(0,0,0,0.24)]">
            <img
              src={lesson.coverImage}
              alt={`${lesson.title}のカバー画像`}
              className="w-[85.55px] h-32 object-cover block"
            />
          </div>
        </div>

        {/* 情報エリア */}
        <div className="flex flex-col gap-1 px-5 py-4 bg-[#F3F3F4]">
          <div className="flex flex-col gap-0.5">
            <p className="font-noto-sans-jp text-[13px] font-light leading-[1.938em] tracking-[1px] text-[#151834] m-0">
              {lesson.category}
            </p>
            <h3 className="font-noto-sans-jp text-base font-bold leading-[1.48em] tracking-[0.75px] text-[#151834] m-0">
              {lesson.title}
            </h3>
          </div>
          <p className="font-noto-sans-jp text-[13px] font-light leading-[1.6em] tracking-[1px] text-[#151834] m-0">
            {lesson.description}
          </p>
        </div>
      </div>
    </article>
  );
};

export default LessonCard;
