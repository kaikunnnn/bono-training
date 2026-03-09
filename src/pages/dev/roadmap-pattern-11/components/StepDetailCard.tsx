/**
 * StepDetailCard - ステップ詳細カードコンポーネント
 * 大きなステップ番号 + タイトル + ゴール + コースリスト
 */
import React from 'react';
import { CourseCard } from './CourseCard';

interface Course {
  number: string;
  title: string;
  description: string;
  thumbnail?: string;
}

interface StepDetailCardProps {
  stepNumber: string;
  title: string;
  goal: string;
  sectionTitle?: string;
  courses: Course[];
  className?: string;
}

export const StepDetailCard: React.FC<StepDetailCardProps> = ({
  stepNumber,
  title,
  goal,
  sectionTitle = 'デザインしよう',
  courses,
  className = '',
}) => {
  return (
    <div
      className={`
        w-full
        bg-white border border-black/5
        rounded-[50px]
        overflow-hidden
        ${className}
      `}
    >
      {/* ヘッダー部分 */}
      <div className="px-12 py-6 border-b border-black/[0.08]">
        {/* ステップラベル */}
        <div className="flex items-end gap-3.5 mb-5">
          <span
            className="text-7xl font-bold text-[#929db3] leading-none"
            style={{ fontFamily: "'Unbounded', sans-serif" }}
          >
            {stepNumber}
          </span>
          <div className="flex items-center gap-3.5 pb-2">
            <div className="w-4 flex items-center justify-center">
              <div className="w-4 h-0.5 bg-[#929db3]" />
            </div>
            <span className="text-xs font-bold text-slate-900 tracking-wider uppercase">
              ステップ
            </span>
          </div>
        </div>

        {/* タイトルとゴール */}
        <div className="flex gap-6 items-end">
          {/* タイトル */}
          <div className="w-[420px]">
            <h3 className="text-3xl font-bold text-slate-900 leading-relaxed whitespace-pre-line">
              {title}
            </h3>
          </div>

          {/* ゴール */}
          <div className="flex-1 pb-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-gray-500 tracking-wider uppercase">
                ゴール
              </span>
              <p className="text-sm text-slate-600 leading-relaxed">
                {goal}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* コースリスト部分 */}
      <div className="px-12 py-8">
        {/* セクションヘッダー */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-slate-900 rounded-full" />
          <span className="text-base font-bold text-black">{sectionTitle}</span>
        </div>

        {/* コースカード */}
        <div className="flex flex-col gap-4">
          {courses.map((course, index) => (
            <CourseCard
              key={index}
              number={course.number}
              title={course.title}
              description={course.description}
              thumbnail={course.thumbnail}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepDetailCard;
