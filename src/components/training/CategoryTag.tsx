import React from 'react';
import { cn } from '@/lib/utils';

interface CategoryTagProps {
  category: string;
  className?: string;
}

const CategoryTag: React.FC<CategoryTagProps> = ({ category, className }) => {
  return (
    <div
      className={cn(
        "box-border content-stretch flex flex-row gap-3 items-center justify-start p-0 relative shrink-0",
        className
      )}
      data-name="category"
    >
      <div
        className="bg-[rgba(184,4,85,0.12)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0"
        data-name="Component 4"
      >
        <div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#b80455] text-[12px] text-center text-nowrap">
          <p className="block leading-[16px] whitespace-pre">{category}</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryTag;