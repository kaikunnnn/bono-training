import React from 'react';

interface DesignSolutionSectionProps {
  content: string | null | undefined;
  className?: string;
}

// DesignSolutionSection コンポーネント（デザイン解答例セクション用）
const DesignSolutionSection: React.FC<DesignSolutionSectionProps> = ({ 
  content, 
  className = "" 
}) => {
  console.log('🎨 DesignSolutionSection レンダリング:', { contentLength: content?.length });

  return (
    <div
      className={`bg-[#ffffff] relative rounded-[56px] shrink-0 w-full ${className}`}
      data-name="design-solution"
    >
      <div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-[56px]" />
      <div className="flex flex-col items-center relative size-full">
        <div className="box-border content-stretch flex flex-col gap-8 items-center justify-start p-[56px] relative w-full">
          
          {/* ヘッダー部分 */}
          <div
            className="box-border content-stretch flex flex-col gap-8 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
            <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
              {/* デザイン解答例タイトル */}
              <div
                className="box-border content-stretch flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-[#0d0f18] text-center tracking-[1px] w-full"
                data-name="block-Text"
              >
                <div
                  className="flex flex-col font-['Noto_Sans:Display_Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-[12px] w-full"
                  style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }}
                >
                  <p className="block leading-[1.6]">(解答例)</p>
                </div>
                <div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center relative shrink-0 text-[24px] w-full">
                  <p className="block leading-[1.6]">デザイン解答例</p>
                </div>
              </div>
            </div>
            
            {/* 区切り線 */}
            <div className="h-0 relative shrink-0 w-full">
              <div
                className="absolute bottom-0 left-0 right-0 top-[-2px]"
                style={{ "--stroke-0": "rgba(51, 65, 85, 1)" } as React.CSSProperties}
              >
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 628 2"
                >
                  <line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="627"
                    y1="1"
                    y2="1"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* デザイン解答例コンテンツ部分 */}
          <div
            className="box-border content-stretch flex flex-col gap-6 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="design-solution-content"
          >
            {(() => {
              // エラーガード: contentが無効な場合
              if (!content || typeof content !== 'string') {
                console.warn('DesignSolutionSection - 無効なコンテンツ:', { content, contentType: typeof content });
                return (
                  <div className="text-gray-400 text-sm italic">
                    デザイン解答例のコンテンツが利用できません
                  </div>
                );
              }

              const trimmedContent = content.trim();
              if (!trimmedContent) {
                return (
                  <div className="text-gray-400 text-sm italic">
                    デザイン解答例のコンテンツが空です
                  </div>
                );
              }

              return (
                <div className="font-['Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(13,15,24,0.8)] text-left w-full">
                  <p className="block leading-[1.6] whitespace-pre-wrap">{trimmedContent}</p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignSolutionSection;