/**
 * StepDetailCard - ステップ詳細カード（gaabooスタイル準拠）
 *
 * サイズ感:
 * - カード: 角丸 24px、シャドウ軽め
 * - ステップ番号: 48px, bold
 * - タイトル: 28px, bold
 * - ゴール: 14px, #666
 * - コースリスト: gap 16px
 */
import React from 'react';
import { CourseCard } from './CourseCard';

interface Course {
  number: string;
  title: string;
  description: string;
  thumbnail?: string;
  url?: string;
}

interface StepDetailCardProps {
  stepNumber: string;
  title: string;
  goal: string;
  duration?: string;
  sectionTitle?: string;
  courses: Course[];
  className?: string;
}

export const StepDetailCard: React.FC<StepDetailCardProps> = ({
  stepNumber,
  title,
  goal,
  duration,
  sectionTitle = 'レッスン',
  courses,
  className = '',
}) => {
  return (
    <div
      className={`
        w-full
        bg-white
        rounded-3xl
        overflow-hidden
        shadow-[0_2px_8px_rgba(0,0,0,0.08)]
        hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]
        transition-shadow duration-200
        ${className}
      `}
    >
      {/* ============================================
          ヘッダー部分
          ============================================ */}
      <div className="px-10 py-8 border-b border-[#eee]">
        {/* ステップ番号 + ラベル */}
        <div className="flex items-end gap-4 mb-6">
          {/* 大きな番号 - 48px */}
          <span
            className="text-[48px] font-bold text-[#9e9e9e] leading-none"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {stepNumber}
          </span>

          {/* ステップラベル */}
          <div className="flex items-center gap-3 pb-2">
            <div className="w-4 h-0.5 bg-[#9e9e9e]" aria-hidden="true" />
            <span className="text-[12px] font-bold text-[#1a1a1a] tracking-wider uppercase">
              ステップ
            </span>
            {duration && (
              <span className="text-[12px] text-[#9e9e9e] ml-2">
                {duration}
              </span>
            )}
          </div>
        </div>

        {/* タイトル + ゴール */}
        <div className="flex gap-8 items-start">
          {/* タイトル - 28px */}
          <h3 className="text-[28px] font-bold text-[#1a1a1a] leading-[1.4] whitespace-pre-line flex-shrink-0 max-w-[400px]">
            {title}
          </h3>

          {/* ゴール */}
          <div className="flex-1 pt-1">
            <span className="text-[12px] font-bold text-[#9e9e9e] tracking-wider uppercase block mb-2">
              ゴール
            </span>
            <p className="text-[14px] leading-[1.6] text-[#555]">
              {goal}
            </p>
          </div>
        </div>
      </div>

      {/* ============================================
          コースリスト部分
          ============================================ */}
      <div className="px-10 py-8">
        {/* セクションヘッダー */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-2.5 h-2.5 bg-[#1a1a1a] rounded-full"
            aria-hidden="true"
          />
          <span className="text-[15px] font-bold text-[#1a1a1a]">
            {sectionTitle}
          </span>
        </div>

        {/* コースカードリスト - gap 16px */}
        <div className="flex flex-col gap-4">
          {courses.map((course, index) => (
            <CourseCard
              key={index}
              number={course.number}
              title={course.title}
              description={course.description}
              thumbnail={course.thumbnail}
              url={course.url}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepDetailCard;
