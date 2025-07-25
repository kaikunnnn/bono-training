import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigationHeaderProps {
  trainingSlug: string;
  orderIndex: number;
}

function Frame() {
  return (
    <div className="relative size-2.5" data-name="Frame">
      <img 
        src="/images/left-arrow.svg" 
        alt="Left Arrow"
        className="block size-full"
      />
    </div>
  );
}

function ArrowRight() {
  return (
    <div
      className="bg-[#0d221d] relative rounded-[999999px] size-full"
      data-name="Arrow Right"
    >
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-center overflow-clip p-[5px] relative size-full">
          <div className="flex items-center justify-center relative shrink-0">
            <div className="flex-none rotate-[180deg] scale-y-[-100%]">
              <Frame />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute border-0 border-gray-700 border-solid inset-0 pointer-events-none rounded-[999999px]" />
    </div>
  );
}

function Frame3467320({ trainingSlug }: { trainingSlug: string }) {
  const navigate = useNavigate();
  
  return (
    <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <ArrowRight />
        </div>
      </div>
      <button 
        className="[white-space-collapse:collapse] block cursor-pointer font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(13,15,24,0.8)] text-left text-nowrap"
        onClick={() => navigate(`/training/${trainingSlug}`)}
      >
        <p className="block leading-[24px] whitespace-pre">戻る</p>
      </button>
    </div>
  );
}

function NumberoforderIndex({ orderIndex }: { orderIndex: number }) {
  return (
    <div
      className="box-border content-stretch flex flex-row font-['DotGothic16:Regular',_sans-serif] gap-[5.818px] items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#0d221d] text-[14px] text-center text-nowrap"
      data-name="numberoforder_index"
    >
      <div className="relative shrink-0 tracking-[2px]">
        <p className="adjustLetterSpacing block leading-none text-nowrap whitespace-pre">
          TRAINING
        </p>
      </div>
      <div className="relative shrink-0 tracking-[-1px]">
        <p className="adjustLetterSpacing block leading-none text-nowrap whitespace-pre">
          {String(orderIndex).padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}

function Frame3467321() {
  return (
    <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 shrink-0" />
  );
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ trainingSlug, orderIndex }) => {
  return (
    <div className="h-6 relative shrink-0 w-full" data-name="tableofcontents">
      <div className="flex flex-row items-center overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-row h-6 items-center justify-between px-10 py-0 relative w-full">
          <Frame3467320 trainingSlug={trainingSlug} />
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <NumberoforderIndex orderIndex={orderIndex} />
          </div>
          <Frame3467321 />
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;