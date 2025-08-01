import React from 'react';
import { cn } from '@/lib/utils';

interface CategoryTagProps {
  category?: string;
  type?: 'challenge' | 'skill' | 'portfolio';
  displayMode?: 'category' | 'type';
  className?: string;
}

// カテゴリー別のスタイル設定
const categoryConfig = {
  "UXデザイン": {
    bgColor: "rgba(248,158,61,0.13)",
    textColor: "#ac5f0c"
  },
  "情報設計": {
    bgColor: "rgba(13,147,77,0.12)", 
    textColor: "#007b3b"
  },
  "UIビジュアル": {
    bgColor: "rgba(85,160,235,0.13)",
    textColor: "#146fc9"
  },
  "Figma": {
    bgColor: "rgba(135,20,201,0.12)",
    textColor: "#8714c9"
  }
} as const;

// デフォルトスタイル（ピンク系）
const defaultCategoryStyle = {
  bgColor: "rgba(184,4,85,0.12)",
  textColor: "#b80455"
};

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
          <div className="font-rounded-mplus font-bold leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-left text-nowrap tracking-[0.75px]">
            <p className="adjustLetterSpacing block leading-none whitespace-pre">
              {getDisplayText(type)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Category mode (default)
  // カテゴリーに応じたスタイルを取得（定義されていない場合はデフォルト）
  const categoryStyle = category && categoryConfig[category as keyof typeof categoryConfig] 
    ? categoryConfig[category as keyof typeof categoryConfig]
    : defaultCategoryStyle;

  return (
    <div
      className={cn(
        "box-border content-stretch flex flex-row gap-3 items-center justify-start p-0 relative shrink-0",
        className
      )}
      data-name="category"
    >
      <div
        className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded min-w-[60px] h-[20px] shrink-0"
        style={{
          backgroundColor: categoryStyle.bgColor,
          color: categoryStyle.textColor
        }}
        data-name="Component 4"
      >
        <div className="font-noto-sans-jp font-medium leading-[0] relative shrink-0 text-[12px] text-center text-nowrap">
          <p className="block leading-[16px] whitespace-pre">{category}</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryTag;