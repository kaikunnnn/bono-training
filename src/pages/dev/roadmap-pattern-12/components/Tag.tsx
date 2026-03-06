/**
 * Tag - タグコンポーネント（gaabooスタイル準拠）
 *
 * サイズ感:
 * - フォント: 13px
 * - パディング: 6px 12px
 * - 角丸: 4px
 * - 背景: #f0f0f0
 * - gap: 8px (タグ間)
 */
import React from 'react';

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-block
        text-[13px]
        px-3
        py-1.5
        bg-[#f0f0f0]
        text-[#555]
        rounded
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Tag;
