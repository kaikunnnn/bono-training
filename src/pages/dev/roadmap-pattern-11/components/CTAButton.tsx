/**
 * CTAButton - グラデーションCTAボタンコンポーネント
 * グラデーション枠 + 2段構成（説明 + ボタン）
 */
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface CTAButtonProps {
  subtitle: string;
  buttonText: string;
  onClick?: () => void;
  className?: string;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  subtitle,
  buttonText,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`
        w-full max-w-[501px]
        p-1
        rounded-[20px]
        shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]
        ${className}
      `}
      style={{
        background: 'linear-gradient(193deg, rgb(48, 72, 81) 14%, rgb(135, 132, 164) 84%)',
      }}
    >
      <div className="bg-white rounded-2xl overflow-hidden">
        {/* サブタイトル */}
        <div className="px-4 py-2 text-center">
          <p className="text-[15px] text-slate-600">{subtitle}</p>
        </div>

        {/* メインボタン */}
        <div className="px-4 pb-4">
          <button
            onClick={onClick}
            className="
              w-full
              flex items-center justify-between
              px-6 py-3
              bg-black text-white
              rounded-[14px]
              h-[52px]
              hover:bg-gray-800
              transition-colors
            "
          >
            <span className="text-sm font-bold tracking-wide">{buttonText}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CTAButton;
