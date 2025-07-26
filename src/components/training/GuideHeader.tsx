import React from 'react';

interface GuideHeaderProps {
  emoji?: string;
  title?: string;
  description?: string;
}

const GuideHeader: React.FC<GuideHeaderProps> = ({
  emoji = '💪',
  title = '進め方ガイド',
  description = 'デザイン基礎を身につけながらデザインするための\nやり方の流れを説明します。'
}) => {
  return (
    <div className="flex flex-col gap-3 max-w-[368px]">
      <span className="text-sm font-semibold leading-5 text-[#0f172a]">
        {emoji}
      </span>
      <h2 className="text-2xl font-bold leading-[160%] tracking-[1px] text-[#0d0f18] font-noto-sans">
        {title}
      </h2>
      <p className="text-base font-normal leading-6 text-[#0f172a] whitespace-pre-line">
        {description}
      </p>
    </div>
  );
};

export default GuideHeader;