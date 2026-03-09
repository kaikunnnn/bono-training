/**
 * CourseCard - コースカード（gaabooスタイル準拠）
 *
 * サイズ感:
 * - カード: 角丸 12px、シャドウ軽め、ホバーで -4px + シャドウ強化
 * - サムネイル: 80x80px、角丸 8px
 * - 番号: 14px, bold, #9e9e9e
 * - タイトル: 16px, semibold
 * - 説明: 14px, #666, 2行制限
 */
import React from 'react';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  number: string;
  title: string;
  description: string;
  thumbnail?: string;
  url?: string;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  number,
  title,
  description,
  thumbnail,
  url,
  className = '',
}) => {
  const content = (
    <div
      className={`
        flex gap-4
        p-4
        bg-[#f8f9fa]
        rounded-xl
        hover:bg-white
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]
        hover:-translate-y-0.5
        transition-all duration-200
        cursor-pointer
        group
        ${className}
      `}
    >
      {/* サムネイル - 80x80px */}
      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#e0e0e0]">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#9e9e9e]">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 min-w-0">
        {/* 番号 - 14px */}
        <span className="text-[14px] font-bold text-[#9e9e9e] block mb-1">
          {number}
        </span>

        {/* タイトル - 16px */}
        <h4 className="text-[16px] font-semibold text-[#1a1a1a] mb-1.5 group-hover:text-[#f5533e] transition-colors">
          {title}
        </h4>

        {/* 説明 - 14px, 2行制限 */}
        <p className="text-[14px] leading-[1.6] text-[#666] line-clamp-2">
          {description}
        </p>
      </div>

      {/* 矢印アイコン */}
      <div className="flex items-center text-[#9e9e9e] group-hover:text-[#f5533e] transition-colors">
        <svg
          className="w-5 h-5 group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );

  if (url) {
    return <Link to={url}>{content}</Link>;
  }

  return content;
};

export default CourseCard;
