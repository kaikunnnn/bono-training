import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface LessonCardProps {
  title?: string;
  emoji?: string;
  description?: string;
  link?: string;
  imageUrl?: string;
}

const LessonCard: React.FC<LessonCardProps> = ({
  title = 'ゼロからはじめる情報設計',
  emoji = '📚',
  description = '進め方の基礎はBONOで詳細に学習・実践できます',
  link = '/training',
  imageUrl
}) => {
  return (
    <Link 
      to={link}
      className="block w-full max-w-[730px] group"
    >
      <div className="flex items-center gap-5 p-6 lg:p-8 bg-[#e1e7e6] border-2 border-black rounded-3xl hover:bg-[#d5dbd9] transition-colors">
        {/* Left block - Image area */}
        <div className="flex-shrink-0 w-[163px] h-[105px] bg-[#ced3d2] rounded-2xl overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-50">📚</span>
            </div>
          )}
        </div>

        {/* Right block - Content area */}
        <div className="flex-1 flex flex-col gap-1">
          {/* Title block */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{emoji}</span>
              <h3 className="text-lg font-bold tracking-[0.75px] text-[#0d0f18] font-noto-sans">
                {title}
              </h3>
            </div>
            {/* Description */}
            <p className="text-base font-medium text-[#171923] leading-[167.99%]">
              {description}
            </p>
          </div>

          {/* Button */}
          <div className="mt-2">
            <span className="inline-flex items-center gap-2 px-4 py-1 bg-[#111827] text-white rounded-full border-2 border-[#111827] text-xs font-bold font-noto-sans group-hover:bg-[#1f2937] transition-colors">
              レッスン内容へ
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LessonCard;