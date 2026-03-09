/**
 * HeroBadge - バッジコンポーネント（gaabooスタイル準拠）
 *
 * サイズ感:
 * - フォント: 12px, bold
 * - パディング: 6px 12px
 * - 角丸: 4px
 * - 背景: プライマリカラー #f5533e
 */
import React from 'react';

interface HeroBadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'muted';
  className?: string;
}

export const HeroBadge: React.FC<HeroBadgeProps> = ({
  label,
  variant = 'primary',
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-[#f5533e] text-white',
    secondary: 'bg-[#30abe6] text-white',
    muted: 'bg-[#e0e0e0] text-[#555]',
  };

  return (
    <span
      className={`
        inline-block
        text-[12px]
        font-bold
        px-3
        py-1.5
        rounded
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {label}
    </span>
  );
};

export default HeroBadge;
