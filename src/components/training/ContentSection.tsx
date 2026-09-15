import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { SubSectionData, extractSubSections } from '@/utils/parseContentSections';

interface ContentSectionProps {
  title: string;
  content: string | null | undefined;
  className?: string;
}

// マークダウンコンポーネントの定義
const markdownComponents: Components = {
  // 箇条書きスタイリング
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside space-y-1 mb-2 ml-4" {...props}>
      {children}
    </ul>
  ),
  li: ({ children, ...props }) => (
    <li className="text-[#475569] leading-[1.6] font-['Noto_Sans_JP:Regular',_sans-serif] text-lg" {...props}>
      {children}
    </li>
  ),
  
  // リンクスタイリング
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 underline transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),

  // 段落スタイリング
  p: ({ children, ...props }) => (
    <p className="text-[#475569] leading-[1.6] mb-2 font-['Noto_Sans_JP:Regular',_sans-serif] text-lg" {...props}>
      {children}
    </p>
  ),

  // インラインコードスタイリング
  code: ({ children, ...props }) => (
    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  ),

  // 画像スタイリング
  img: ({ src, alt, ...props }) => (
    <img 
      src={src} 
      alt={alt || ""} 
      className="w-full rounded-2xl lg:rounded-[20px] mb-4" 
      {...props} 
    />
  )
};

// BlockText コンポーネント（セクションタイトル）
const BlockText: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-[#1d382f] text-center tracking-[1px] w-full"
      data-name="block-Text"
    >
      <div className="flex flex-col font-rounded-mplus font-bold justify-center relative shrink-0 text-lg md:text-xl lg:text-[24px] w-full">
        <h2 className="block leading-[1.6] text-[20px] mt-2 -mb-2 md:text-[20px] md:mt-2 md:-mb-2 lg:text-[24px] lg:mt-0 lg:mb-0">{title}</h2>
      </div>
    </div>
  );
};

// SubSection コンポーネント（黒丸アイコン付きサブセクション）
const SubSection: React.FC<{ title: string; content: string | null | undefined }> = ({ title, content }) => {
  return (
    <div className="box-border content-stretch flex flex-row gap-4 items-start justify-start p-0 relative shrink-0 w-full">
      {/* 黒丸アイコン */}
      <div className="flex items-center justify-center relative shrink-0 mt-2.5">
        <div 
          className="bg-[#0d221d] h-2.5 rounded-full relative shrink-0 w-2.5" 
          data-name="black-dot"
        />
      </div>
      
      {/* サブセクション内容 */}
      <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start p-0 relative shrink-0 flex-1 min-w-0">
        {/* サブセクションタイトル */}
        <div className="font-rounded-mplus font-bold leading-[0] not-italic relative shrink-0 text-base md:text-lg lg:text-[18px] text-[#1d382f] text-left break-words">
          <h3 className="block leading-[1.6] break-words">{title}</h3>
        </div>
        
        {/* サブセクション本文 */}
        {(() => {
          if (!content || typeof content !== 'string') {
            return (
              <div className="text-gray-400 text-sm italic">
                サブセクションのコンテンツがありません
              </div>
            );
          }
          
          const trimmedContent = content.trim();
          if (!trimmedContent) {
            return null; // 空のコンテンツは表示しない
          }
          
          return (
            <div className="font-['Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-lg text-[#475569] text-left">
              <ReactMarkdown 
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {trimmedContent}
              </ReactMarkdown>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// 区切り線コンポーネント
const SectionDivider: React.FC = () => {
  return (
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
  );
};

// メインのContentSectionコンポーネント（白い丸角ボックス）
const ContentSection: React.FC<ContentSectionProps> = ({ 
  title, 
  content, 
  className = "" 
}) => {
  // Step 3で黒丸アイコン付きサブセクション実装完了
  console.log('📦 ContentSection レンダリング:', { title, contentLength: content?.length });

  return (
    <div
      className={`bg-[#ffffff] relative rounded-[40px] lg:rounded-[56px] shrink-0 w-full ${className}`}
      data-name={`##${title}`}
    >
      <div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-[40px] lg:rounded-[56px]" />
      <div className="flex flex-col items-center relative size-full">
        <div className="box-border content-stretch flex flex-col gap-8 items-center justify-start p-6 md:p-10 lg:p-[56px] relative w-full">
          
          {/* ヘッダー部分 */}
          <div
            className="box-border content-stretch flex flex-col gap-8 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
            <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
              <BlockText title={title} />
            </div>
            
            {/* 区切り線 */}
            <SectionDivider />
          </div>

          {/* コンテンツ部分（Step 3: サブセクション表示） */}
          <div
            className="box-border content-stretch flex flex-col gap-6 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="lists"
          >
            {(() => {
              // エラーガード: contentが無効な場合
              if (!content || typeof content !== 'string') {
                console.warn('ContentSection - 無効なコンテンツ:', { title, content, contentType: typeof content });
                return (
                  <div className="text-gray-400 text-sm italic">
                    コンテンツが利用できません
                  </div>
                );
              }

              const trimmedContent = content.trim();
              if (!trimmedContent) {
                return (
                  <div className="text-gray-400 text-sm italic">
                    コンテンツが空です
                  </div>
                );
              }

              const subSections = extractSubSections(content);
              console.log('📄 ContentSection - サブセクション解析:', { title, subSectionCount: subSections.length });
              
              if (subSections.length > 0) {
                return subSections.map((subSection, index) => (
                  <SubSection 
                    key={index}
                    title={subSection.title}
                    content={subSection.content}
                  />
                ));
              } else {
                // サブセクションがない場合は通常のコンテンツとして表示
                return (
                  <div className="font-['Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-lg text-[#475569] text-left w-full">
                    <ReactMarkdown 
                      components={markdownComponents}
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {trimmedContent}
                    </ReactMarkdown>
                  </div>
                );
              }
            })()
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentSection;