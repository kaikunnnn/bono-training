import React from 'react';
import { Link } from 'react-router-dom';

interface LessonCardProps {
  title?: string;
  description?: string;
  link?: string;
  imageUrl?: string;
}

const LessonCard: React.FC<LessonCardProps> = ({
  title = 'ゼロからはじめる情報設計',
  description = '進め方の基礎はBONOで詳細に学習・実践できます',
  link = '/training',
  imageUrl
}) => {
  return (
    <Link 
      to={link}
      className="block w-full max-w-[730px] group"
    >
      <div 
        className="relative w-full h-full bg-[#f4eae3] rounded-3xl border border-[#d4d4d8] overflow-hidden"
        style={{ boxShadow: '1px 1px 14px 0px rgba(0,0,0,0.04)' }}
      >
        <div className="w-full h-full p-4 flex items-center gap-8 overflow-hidden">
          {/* Left block - Image area */}
          <div className="flex-shrink-0 w-[140px] sm:w-[180px] lg:w-[220px] aspect-[16/9] bg-[#475569] rounded-2xl overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
            ) : (
              <div className="w-full h-full bg-[url('/assets/backgrounds/gradation/bg-gradation/type-trainingdetail.svg')] bg-cover bg-center bg-no-repeat"></div>
            )}
          </div>

          {/* Right block - Content area */}
          <div className="flex-1 flex flex-col gap-1">
            {/* Title block */}
            <div className="flex flex-col gap-1 h-[61px]">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-[0.75px] text-[#0d0f18] font-noto-sans leading-[1.6]">
                  {title}
                </h3>
              </div>
              {/* Description */}
              <p className="text-base font-medium font-inter text-[#171923] leading-[1.68]">
                {description}
              </p>
            </div>

            {/* Button */}
            <div className="mt-1">
              <span className="inline-flex items-center gap-2 py-1 text-xs font-bold font-noto-sans text-[#171923]">
                レッスン内容へ
                <img src="/images/arrow/arrow/secondary/right.svg" alt="" className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LessonCard;