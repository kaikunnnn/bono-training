import React from 'react';

interface StepBlockProps {
  title: string;
  description: string;
  referenceLink?: {
    text: string;
    url: string;
  };
}

const StepBlock: React.FC<StepBlockProps> = ({
  title,
  description,
  referenceLink
}) => {
  return (
    <div className="w-full max-w-[730px] bg-white border-2 border-black rounded-3xl p-12">
      {/* Header section */}
      <div className="flex flex-col gap-5">
        {/* Title */}
        <div className="flex flex-col gap-5">
          <h3 className="text-lg font-bold leading-[160%] tracking-[0.75px] text-[#0d0f18] font-noto-sans">
            {title}
          </h3>
          {/* Divider line */}
          <div className="w-full h-[2px] bg-[#334155] rounded-full" />
        </div>
        
        {/* Content section */}
        <div className="flex flex-col gap-4">
          <p className="text-base font-medium leading-[167.99%] text-[#0d0f18] whitespace-pre-line">
            {description}
            {referenceLink && (
              <>
                <br />
                参考リンク：
                <a 
                  href={referenceLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  『{referenceLink.text}』
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepBlock;