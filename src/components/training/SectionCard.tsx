
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  description?: string;
  items: string[];
  isNumbered?: boolean;
  className?: string;
  variant?: 'default' | 'premium';
}

/**
 * セクション表示用の汎用コンポーネント
 * 学習ゴール、手順、完成イメージなどに使用
 */
const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  items,
  isNumbered = false,
  className,
  variant = 'default'
}) => {
  const isPremium = variant === 'premium';
  
  return (
    <div className="bg-transparent">
      {/* 内側のラッパー */}
      <div className={cn(
        "rounded-[48px] px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto bg-white lg:py-[48px] lg:px-[64px]",
        isPremium && "bg-amber-50 border border-amber-200",
        className
      )}>
        {/* コンテンツエリア */}
        <div className="max-w-3xl mx-auto space-y-10">
          {/* ヘッダー */}
          <div className="text-center space-y-8">
            <h2 className={cn(
              "text-2xl md:text-3xl font-bold text-left border-b-2 border-dotted pb-2",
              isPremium ? "text-amber-800 border-amber-300" : "text-black border-gray-300"
            )}>
              {title}
            </h2>
          </div>

          {/* テキストエリア */}
          <div className="space-y-6">
            {/* 説明文 */}
            {description && (
              <p className={cn(
                "text-base leading-[1.66] tracking-[1px] font-normal",
                isPremium ? "text-amber-800" : "text-black"
              )}>
                {description}
              </p>
            )}

            {/* アイテムリスト */}
            {isNumbered ? (
              <ol className="space-y-2 text-left list-decimal list-inside">
                {items.map((item, index) => (
                  <li 
                    key={index} 
                    className={cn(
                      "text-base leading-[1.66] tracking-[1px] font-normal",
                      isPremium ? "text-amber-800" : "text-black"
                    )}
                  >
                    {item}
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="space-y-2 text-left">
                {items.map((item, index) => (
                  <li 
                    key={index} 
                    className={cn(
                      "flex items-center gap-2.5 h-[27px] text-base leading-[1.66] tracking-[1px] font-normal",
                      isPremium ? "text-amber-800" : "text-black"
                    )}
                  >
                    <span className={isPremium ? "text-amber-800" : "text-black"}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionCard;
