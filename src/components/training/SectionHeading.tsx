import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  category?: string;
  title: string;
  description: string;
  linkText?: string;
  linkHref?: string;
  className?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  category,
  title,
  description,
  linkText,
  linkHref,
  className
}) => {
  return (
    <div
      className={cn(
        "box-border flex flex-col gap-2 items-start justify-start p-0 relative w-full h-full",
        className
      )}
      data-name="Heading"
      id="node-3248_5674"
      data-annotations="この部分は /trainingのページで使い回すセクションタイトルのコンポーネントセットにしたいです。"
    >

      {/* メインタイトル */}
      <div
        className="font-semibold text-2xl md:text-xl lg:text-2xl leading-[40px] text-slate-900 text-left not-italic relative shrink-0 min-w-full w-min"
        style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}
        id="node-3248_5676"
      >
        <h2 className="block leading-[40px] font-rounded-mplus-bold">{title}</h2>
      </div>

      {/* 説明文 */}
      <div
        className="font-medium text-[16px] leading-[20px] text-[#1d382f] text-left not-italic relative shrink-0 min-w-full w-min"
        style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}
        id="node-3283_4562"
      >
        <p className="block mb-0">{description}</p>
        {linkText && linkHref && (
          <Link 
            to={linkHref}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1 mt-2"
          >
            {linkText}
            <span>→</span>
          </Link>
        )}
      </div>

    </div>
  );
};

export default SectionHeading;