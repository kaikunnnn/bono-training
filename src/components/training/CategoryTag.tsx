import React from 'react';
import { cn } from '@/lib/utils';

interface CategoryTagProps {
  category?: string;
  type?: 'challenge' | 'skill' | 'portfolio';
  displayMode?: 'category' | 'type';
  className?: string;
}

const CategoryTag: React.FC<CategoryTagProps> = ({ 
  category, 
  type, 
  displayMode = 'category', 
  className 
}) => {
  const getDisplayText = (type: string) => {
    return type === 'portfolio' ? 'ポートフォリオお題' : type;
  };
  if (displayMode === 'type' && type) {
    return (
      <div
        className={cn(
          "box-border content-stretch flex flex-row gap-1 items-center justify-start p-0 relative shrink-0",
          className
        )}
        data-name="type"
      >
        <div
          className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0"
          data-name="Component 2"
        >
          <div className="bg-gradient-to-b from-[#0618e3] rounded-[1000px] shrink-0 size-2 to-[#3cf5fc]" />
          <div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-left text-nowrap tracking-[0.75px]">
            <p className="adjustLetterSpacing block leading-none whitespace-pre">
              {getDisplayText(type)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Category mode (default)
  return (
    <div
      className={cn(
        "box-border content-stretch flex flex-row gap-3 items-center justify-start p-0 relative shrink-0",
        className
      )}
      data-name="category"
    >
      <div
        className="bg-[rgba(184,4,85,0.12)] border border-[rgba(184,4,85,0.4)] border-opacity-40 box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded min-w-[60px] h-[20px] shrink-0"
        data-name="Component 4"
      >
        <div className="font-medium leading-[0] relative shrink-0 text-[#b80455] text-[12px] text-center text-nowrap">
          <p className="block leading-[16px] whitespace-pre">{category}</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryTag;