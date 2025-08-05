import React from 'react';
import SimpleMarkdownRenderer from './SimpleMarkdownRenderer';
import DottedSeparator from '@/components/common/DottedSeparator';

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
    <div className="relative w-full bg-white px-8 py-6 rounded-3xl flex flex-col gap-5 items-center justify-start">
      {/* Header section */}
      <div className="flex flex-col gap-5 w-full">
        {/* Title */}
        <div className="flex flex-col gap-5 w-full">
          <h3 className="text-lg font-bold font-noto-sans tracking-[0.75px] leading-[1.6] text-[#0d0f18]">
            {title}
          </h3>
          {/* Divider line */}
          <DottedSeparator 
            dotSize={0.5} 
            spacing={12} 
            color="#334155"
            className="my-0"
          />
        </div>
        
        {/* Content section */}
        <div className="flex flex-col gap-4 w-full">
          <div className="font-inter font-medium text-base leading-[1.68] text-[#0f172a]">
            <SimpleMarkdownRenderer 
              content={description}
              className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            />
            {referenceLink && (
              <div className="mt-2">
                参考リンク：
                <a 
                  href={referenceLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6b9fff] underline underline-offset-auto hover:text-[#5a8ce6]"
                >
                  『{referenceLink.text}』
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepBlock;