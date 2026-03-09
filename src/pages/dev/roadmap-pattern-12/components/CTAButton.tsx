/**
 * CTAButton - CTAボタンコンポーネント（gaabooスタイル準拠）
 *
 * サイズ感:
 * - フォント: 15px, semibold
 * - パディング: 16px 32px
 * - 角丸: 8px
 * - 背景: プライマリカラー #f5533e
 * - ホバー: 少し暗く #e04a35
 */
import React from 'react';
import { Link } from 'react-router-dom';

interface CTAButtonProps {
  text: string;
  subtitle?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  onClick?: () => void;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  text,
  subtitle,
  href,
  variant = 'primary',
  className = '',
  onClick,
}) => {
  const variantStyles = {
    primary: `
      bg-[#f5533e] hover:bg-[#e04a35]
      text-white
      shadow-[0_2px_8px_rgba(245,83,62,0.3)]
      hover:shadow-[0_4px_12px_rgba(245,83,62,0.4)]
    `,
    secondary: `
      bg-[#30abe6] hover:bg-[#2899d1]
      text-white
    `,
    outline: `
      bg-transparent
      border-2 border-[#1a1a1a]
      text-[#1a1a1a]
      hover:bg-[#1a1a1a] hover:text-white
    `,
  };

  const buttonContent = (
    <>
      {subtitle && (
        <span className="block text-[13px] font-normal opacity-80 mb-1">
          {subtitle}
        </span>
      )}
      <span className="text-[15px] font-semibold">
        {text}
      </span>
    </>
  );

  const buttonClasses = `
    inline-flex flex-col items-center justify-center
    px-8 py-4
    rounded-lg
    transition-all duration-200
    hover:-translate-y-0.5
    ${variantStyles[variant]}
    ${className}
  `;

  if (href) {
    return (
      <Link to={href} className={buttonClasses}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses}>
      {buttonContent}
    </button>
  );
};

export default CTAButton;
