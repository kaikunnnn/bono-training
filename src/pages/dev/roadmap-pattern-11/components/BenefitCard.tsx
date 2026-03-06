/**
 * BenefitCard - 得られるものカードコンポーネント
 * グレー背景、黒い四角ドット + テキスト
 */
import React from 'react';

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
        flex items-center gap-2
        px-4 py-2.5
        bg-[#e9e9e9] rounded-lg
        ${className}
      `}
    >
      <div className="w-2 h-2 bg-black rounded-sm flex-shrink-0" />
      <p className="text-base font-bold text-black">{text}</p>
    </div>
  );
};

export default BenefitCard;
