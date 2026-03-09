/**
 * SectionHeader - gaabooスタイル準拠
 *
 * サイズ感:
 * - タイトル: 28px, bold, tracking 0.03em
 * - マージン下: 16px (説明文がある場合)
 * - ドット: 12px (視覚的な強調)
 */
import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  className = '',
}) => {
  return (
    <div className={`mb-12 ${className}`}>
      {/* タイトル行 */}
      <div className="flex items-center gap-4 mb-4">
        {/* ドット - 12px、視覚的アンカー */}
        <div
          className="w-3 h-3 bg-[#1a1a1a] rounded-full flex-shrink-0"
          aria-hidden="true"
        />
        {/* タイトル - 28px, bold */}
        <h2 className="text-[28px] font-bold leading-[1.35] tracking-[0.03em] text-[#1a1a1a]">
          {title}
        </h2>
      </div>

      {/* 説明文（オプション） */}
      {description && (
        <p
          className="text-[15px] leading-[1.75] text-[#333333] max-w-[720px] pl-7"
          style={{ marginTop: '0' }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
