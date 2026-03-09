/**
 * BenefitCard - gaabooスタイル準拠
 *
 * サイズ感:
 * - 2列グリッド: gap 48px (横) / 16px (縦)
 * - アイコン: 24px
 * - テキスト: 15px, line-height 1.6
 * - パディング: 16px 0 (上下のみ)
 */
import React from 'react';
import { Check } from 'lucide-react';

interface BenefitCardProps {
  text: string;
  className?: string;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({
  text,
  className = '',
}) => {
  return (
    <div
      className={`
        flex items-start gap-3
        py-4
        ${className}
      `}
    >
      {/* チェックアイコン - 24px、プライマリカラー */}
      <div
        className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5"
        aria-hidden="true"
      >
        <Check
          className="w-5 h-5 text-[#f5533e]"
          strokeWidth={2.5}
        />
      </div>

      {/* テキスト - 15px、1.6行間 */}
      <p className="text-[15px] leading-[1.6] text-[#333333]">
        {text}
      </p>
    </div>
  );
};

export default BenefitCard;
