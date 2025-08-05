import React from 'react';

interface GuideHeaderProps {
  emoji?: string;
  title?: string;
  description?: string;
}

const GuideHeader: React.FC<GuideHeaderProps> = ({
  emoji = '💪',
  title = '進め方ガイド',
  description = `デザイン基礎を身につけながらデザインするための
やり方の流れを説明します。`
}) => {
  return (
    <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start px-0 py-8 relative w-full">
      <div className="font-inter font-semibold relative shrink-0 text-center text-slate-900 w-full text-2xl md:text-3xl leading-tight">
        {emoji}
      </div>
      <h2 className="font-rounded-mplus font-bold text-black text-xl md:text-[24px] tracking-[1px] leading-[1.6] text-center w-full whitespace-normal md:whitespace-nowrap">
        {title}
      </h2>
      <p className="font-inter font-normal text-[14px] md:text-[16px] text-center text-slate-900 leading-[1.7] md:leading-[1.88] w-full whitespace-pre-line">
        {description}
      </p>
    </div>
  );
};

export default GuideHeader;