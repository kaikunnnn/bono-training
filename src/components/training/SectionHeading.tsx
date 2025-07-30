import React from 'react';
import { cn } from '@/lib/utils';
import CategoryTag from './CategoryTag';

interface SectionHeadingProps {
  category?: string;
  title: string;
  description: string;
  linkText?: string;
  linkHref?: string;
  className?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  category,
  title,
  description,
  linkText,
  linkHref,
  className
}) => {
  return (
    <div
      className={cn(
        "box-border flex flex-col gap-4 items-center justify-start p-0 relative w-full h-full",
        className
      )}
      data-name="Heading"
      id="node-3248_5674"
      data-annotations="この部分は /trainingのページで使い回すセクションタイトルのコンポーネントセットにしたいです。"
    >
      {/* カテゴリタグ */}
      {category && (
        <div
          data-name="Component 4"
          id="node-3287_2230"
          data-annotations="この部分は カテゴリタグのコンポーネントを使います ゆくゆく実装では、このカテゴリと同じ type=portfolioの :trainingSlugのコンテンツを表示するものを実装していきたいです。"
        >
          <CategoryTag category={category} />
        </div>
      )}

      {/* メインタイトル */}
      <div
        className="font-semibold text-[24px] leading-[40px] text-slate-900 text-center not-italic relative shrink-0 min-w-full w-min"
        style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}
        id="node-3248_5676"
      >
        <p className="block leading-[40px]">{title}</p>
      </div>

      {/* 説明文 */}
      <div
        className="font-semibold text-[14px] leading-[20px] text-[#1d382f] text-center not-italic relative shrink-0 min-w-full w-min"
        style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}
        id="node-3283_4562"
      >
        <p className="block mb-0">{description}</p>
      </div>

      {/* リンクセクション */}
      {linkText && linkHref && (
        <div
          className="box-border flex flex-col items-center justify-start p-0 relative shrink-0"
          data-name="link"
          id="node-3248_5684"
          data-annotations="リンクがある時はこれを表示する"
        >
          <div
            className="box-border flex flex-row gap-2.5 items-center justify-center py-3 px-4 relative rounded-[1000px] shrink-0"
            data-name="button"
            id="node-3248_5677"
          >
            <a
              href={linkHref}
              className="font-bold text-[14px] leading-none text-[#6462ff] text-center underline whitespace-nowrap relative shrink-0 not-italic tracking-[0.75px]"
              style={{ 
                fontFamily: "'Rounded Mplus 1c', sans-serif",
                textDecorationStyle: 'solid',
                textUnderlinePosition: 'from-font'
              }}
              id="node-I3248_5677-2399_1305"
            >
              <p className="block leading-none whitespace-pre">{linkText}</p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionHeading;