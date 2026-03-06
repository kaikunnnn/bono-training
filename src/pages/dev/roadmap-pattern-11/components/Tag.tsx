/**
 * Tag - タグコンポーネント
 * 白背景、角丸のピル型タグ
 */
import React from 'react';

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ children, className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-2.5 py-0.5
        bg-white rounded-lg
        text-[15px] text-slate-600
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Tag;
