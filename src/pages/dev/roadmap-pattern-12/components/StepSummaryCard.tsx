/**
 * StepSummaryCard - 進め方サマリーカード（gaabooスタイル準拠）
 *
 * サイズ感:
 * - カード: 角丸 19px、パディング 4px（外側）
 * - ヘッダー: 背景 #ececec、パディング 6px 20px
 * - 行: パディング 16px 0、border-bottom 1px
 * - 番号: 18-20px, bold, 幅 40px
 * - タイトル: 16px, semibold, 幅 180px
 * - 説明: 14-15px, #666
 */
import React from 'react';

interface StepItem {
  number: string;
  title: string;
  description: string;
}

interface StepSummaryCardProps {
  title?: string;
  items: StepItem[];
  className?: string;
}

export const StepSummaryCard: React.FC<StepSummaryCardProps> = ({
  title = '道のりのサマリー',
  items,
  className = '',
}) => {
  return (
    <div
      className={`
        bg-white
        rounded-[19px]
        overflow-hidden
        p-1
        shadow-[0_2px_8px_rgba(0,0,0,0.08)]
        ${className}
      `}
    >
      {/* カードヘッダー */}
      <div className="bg-[#ececec] rounded-t-[15px] px-5 py-2">
        <span className="text-[14px] font-bold text-[#1a1a1a]">
          {title}
        </span>
      </div>

      {/* ステップ行リスト */}
      <div className="px-6 py-4">
        {items.map((item, index) => (
          <div
            key={item.number}
            className={`
              flex items-center
              py-4
              ${index !== items.length - 1 ? 'border-b border-[#eee]' : ''}
            `}
          >
            {/* 番号バー - 視覚的アクセント */}
            <div
              className="w-1.5 h-12 bg-[#1a1a1a] rounded-sm flex-shrink-0 mr-4"
              aria-hidden="true"
            />

            {/* 番号 - 18px, bold */}
            <span className="text-[18px] font-bold text-[#555] w-10 flex-shrink-0">
              {item.number}
            </span>

            {/* タイトル - 16px, semibold */}
            <span className="text-[16px] font-semibold text-[#333] w-44 flex-shrink-0">
              {item.title}
            </span>

            {/* 説明 - 14px, #666 */}
            <span className="text-[14px] leading-[1.6] text-[#666] flex-1">
              {item.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepSummaryCard;
