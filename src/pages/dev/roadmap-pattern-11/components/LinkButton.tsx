/**
 * LinkButton - リンクボタンコンポーネント
 * アウトラインスタイル、矢印アイコン付き
 */
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface LinkButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'outline' | 'solid';
}

export const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'outline',
}) => {
  const baseStyles = 'inline-flex items-center justify-between gap-4 px-6 py-3 rounded-2xl h-[52px] font-bold text-sm tracking-wide transition-colors';

  const variantStyles = {
    outline: 'bg-white border border-black/10 text-black hover:bg-gray-50',
    solid: 'bg-black text-white hover:bg-gray-800',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      <span>{children}</span>
      <ChevronRight className="w-4 h-4" />
    </button>
  );
};

export default LinkButton;
