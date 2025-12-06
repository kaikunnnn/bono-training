import React from 'react';
import { cn } from '@/lib/utils';

interface PageTopHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * ページトップ見出しコンポーネント
 *
 * ページの最上部に表示されるタイトルとサブタイトル
 * Figma仕様: heading-block_pagetop
 */
const PageTopHeading: React.FC<PageTopHeadingProps> = ({
  title,
  subtitle,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-[7px] w-full max-w-[1088px]', className)}>
      <h1 className="font-noto-sans-jp text-[32px] md:text-[28px] sm:text-[24px] font-bold leading-none tracking-[0.07px] text-black m-0">
        {title}
      </h1>
      {subtitle && (
        <p className="font-inter text-[13px] md:text-[14px] font-normal leading-[1.615em] tracking-tight text-black/79 m-0">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageTopHeading;
