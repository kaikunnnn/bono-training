/**
 * CourseCard - コースリンクカードコンポーネント
 * サムネイル + 番号 + タイトル + 説明
 */
import React from 'react';

interface CourseCardProps {
  number: string;
  title: string;
  description: string;
  thumbnail?: string;
  className?: string;
  onClick?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  number,
  title,
  description,
  thumbnail,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`
        flex items-center gap-10
        px-6 py-4
        bg-white border border-black/5
        rounded-[28px]
        shadow-[0px_1px_8px_0px_rgba(0,0,0,0.07)]
        cursor-pointer
        hover:shadow-md
        transition-shadow
        ${className}
      `}
      onClick={onClick}
    >
      {/* サムネイル */}
      <div className="w-24 h-36 flex-shrink-0 shadow-lg rounded overflow-hidden bg-gray-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-xs font-bold">
            <div className="text-center leading-tight">
              <div className="text-[10px] opacity-60">UI DESIGN</div>
              <div className="text-[10px] opacity-60">FLOW</div>
            </div>
          </div>
        )}
      </div>

      {/* コース情報 */}
      <div className="flex flex-col gap-1.5">
        {/* 番号 */}
        <span
          className="text-sm font-bold text-gray-500"
          style={{ fontFamily: "'Unbounded', sans-serif" }}
        >
          {number}
        </span>

        {/* タイトル */}
        <h4
          className="text-lg font-bold text-slate-900"
          style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif" }}
        >
          {title}
        </h4>

        {/* 説明 */}
        <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
          {description}
        </p>
      </div>
    </div>
  );
};

export default CourseCard;
