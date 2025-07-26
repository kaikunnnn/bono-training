import React from 'react';
import { Training } from '@/types/training';
import { cn } from '@/lib/utils';
import CategoryTag from './CategoryTag';

interface PortfolioTrainingCardProps {
  training: Training;
  className?: string;
}

const PortfolioTrainingCard: React.FC<PortfolioTrainingCardProps> = ({ 
  training, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "box-border content-stretch flex flex-col gap-0 items-start justify-start overflow-clip p-0 relative w-[328px] max-w-full",
        "rounded-[32px] pt-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
        className
      )}
      style={{ height: '346px' }}
      data-name="training_content"
    >
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(183deg, #F5F8FD 2.2%, #FAF4F0 49.72%, rgba(222, 228, 242, 0.00) 97.86%)',
          width: '571px',
          height: '328px',
          left: '-140px',
          top: '-150px',
          borderRadius: '32px',
        }}
        data-name="background-image-gradation"
      />
      
      {/* Wrap Container */}
      <div 
        className="box-border content-stretch flex flex-col gap-0 items-start justify-start p-0 relative w-full bg-white rounded-[32px] overflow-hidden"
        style={{ height: '322px' }}
        data-name="wrap"
      >
        {/* SVG Wave Background */}
        <div 
          className="relative w-full bg-white"
          style={{ height: '50px' }}
          data-name="Rectangle 7"
        >
          <svg
            width="328"
            height="50"
            viewBox="0 0 328 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 left-0"
          >
            <path
              d="M0 0H328V35.8793C328 35.8793 279.5 50 164 50C48.5 50 0 35.8793 0 35.8793V0Z"
              fill="white"
            />
          </svg>
        </div>
        
        {/* Hover Content Area */}
        <div 
          className="box-border content-stretch flex flex-col items-start justify-start px-9 pb-5 relative w-full bg-white"
          style={{ 
            height: '272px',
            gap: '-18px' // Negative gap as specified
          }}
          data-name="hover"
        >
          {/* Icon */}
          <div 
            className="relative shrink-0 bg-white border border-black/10 flex items-center justify-center overflow-hidden"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '100px 100px 12px 12px',
              borderWidth: '0.9px',
              marginTop: '-36px', // To overlap with the wave
            }}
            data-name="icon"
          >
            {training.icon ? (
              <img 
                src={training.icon}
                alt={training.title}
                className="object-cover"
                style={{ width: '49.5px', height: '49.5px' }}
              />
            ) : (
              <div className="bg-gradient-to-b from-[#0618e3] to-[#3cf5fc] rounded-full w-8 h-8" />
            )}
          </div>
          
          {/* Main Content Frame */}
          <div 
            className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative w-full"
            style={{ height: '198px' }}
            data-name="Frame 3467245"
          >
            {/* Content Area */}
            <div 
              className="box-border content-stretch flex flex-col gap-3 items-start justify-start p-0 relative w-full"
              style={{ height: '102px' }}
              data-name="Image"
            >
              {/* Category Tag */}
              {training.category && (
                <CategoryTag 
                  category={training.category}
                  className="shrink-0"
                  data-name="Component 5"
                />
              )}
              
              {/* Heading Text Area */}
              <div 
                className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative w-full"
                style={{ height: '80px' }}
                data-name="Heading"
              >
                <h3 className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] font-bold text-black text-[20px] leading-[30px] tracking-[1px] line-clamp-2">
                  {training.title}
                </h3>
                <p className="font-['Noto_Sans_JP:Regular',_sans-serif] text-[#64748B] text-[14px] leading-[20px] line-clamp-2">
                  {training.description}
                </p>
              </div>
            </div>
            
            {/* Separator Line */}
            <div 
              className="w-full border-t border-[#E2E8F0]"
              style={{ height: '0px' }}
              data-name="Line 14"
            />
            
            {/* Footer */}
            <div 
              className="box-border content-stretch flex flex-row gap-4 items-center justify-between p-0 relative w-full"
              style={{ height: '28px' }}
              data-name="Frame 3467304"
            >
              {/* Time Info Tag */}
              {training.estimated_total_time && (
                <div 
                  className="bg-[rgba(184,4,85,0.12)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0"
                  data-name="Component 4"
                >
                  <span className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium text-[#b80455] text-[12px] leading-[16px] text-center text-nowrap">
                    {training.estimated_total_time}
                  </span>
                </div>
              )}
              
              {/* Task Count Footer */}
              {training.task_count && (
                <div 
                  className="box-border content-stretch flex flex-row gap-2 items-center justify-end p-0 relative shrink-0"
                  data-name="Footer"
                >
                  <span className="font-['Noto_Sans_JP:Regular',_sans-serif] text-[#64748B] text-[14px] leading-[20px]">
                    {training.task_count}個のタスク
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioTrainingCard;