import React from 'react';
import { cn } from '@/lib/utils';

interface HeadingBlock2Props {
  children: React.ReactNode;
  className?: string;
}

/**
 * セクション見出しコンポーネント
 *
 * ページ内のセクション見出しとして使用
 * Figma仕様: heading-block_2
 */
const HeadingBlock2: React.FC<HeadingBlock2Props> = ({
  children,
  className,
}) => {
  return (
    <h2 className={cn(
      'font-noto-sans-jp text-xl font-bold leading-[1.6em] tracking-[0.07px] text-[#101828] m-0',
      className
    )}>
      {children}
    </h2>
  );
};

export default HeadingBlock2;
