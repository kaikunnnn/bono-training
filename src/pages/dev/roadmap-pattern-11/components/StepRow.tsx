/**
 * StepRow - ステップサマリー行コンポーネント
 * 番号バー + 番号 + タイトル + 説明
 */
import React from 'react';

interface StepRowProps {
  number: string;
  title: string;
  description: string;
  isLast?: boolean;
  className?: string;
}

export const StepRow: React.FC<StepRowProps> = ({
  number,
  title,
  description,
  isLast = false,
  className = '',
}) => {
  return (
    <div
      className={`
        flex items-center gap-6
        py-4
        ${!isLast ? 'border-b border-black/[0.08]' : ''}
        ${className}
      `}
    >
      {/* 番号バー */}
      <div className="w-1.5 h-16 bg-slate-900 rounded flex-shrink-0" />

      {/* 番号 (Unbounded フォント) */}
      <span
        className="text-xl font-bold text-gray-600 w-8 flex-shrink-0"
        style={{ fontFamily: "'Unbounded', sans-serif" }}
      >
        {number}
      </span>

      {/* タイトル */}
      <span className="text-base font-bold text-gray-600 w-72 flex-shrink-0">
        {title}
      </span>

      {/* 説明 */}
      <span className="text-base text-gray-600">{description}</span>
    </div>
  );
};

export default StepRow;
