
import React from 'react';
import { TaskFrontmatter } from '@/types/training';

interface LessonHeaderProps {
  frontmatter: TaskFrontmatter;
}

/**
 * builder.ioデザインを再現したレッスンヘッダーコンポーネント
 * フロントマターからSTAGE、タイトル、説明、目安時間、難易度を表示
 */
const LessonHeader: React.FC<LessonHeaderProps> = ({ frontmatter }) => {
  const {
    title,
    order_index,
    estimated_time,
    difficulty
  } = frontmatter;

  // order_indexを2桁の文字列に変換
  const stageNumber = String(order_index).padStart(2, '0');

  return (
    <div className="flex flex-col gap-5 lg:gap-5 md:gap-4 sm:gap-4">
      {/* STAGE & タイトル */}
      <div className="flex items-end gap-5 lg:gap-5 md:gap-4 sm:flex-col sm:items-start sm:gap-4">
        {/* STAGE部分 */}
        <div className="flex flex-col items-center gap-1.5 py-1.5">
          <div className="text-[#0D221D] text-center font-dot text-[17.455px] lg:text-[17.455px] md:text-[15px] sm:text-[14px] leading-none">
            STAGE
          </div>
          <div className="text-[#0D221D] text-center font-dot text-[40.727px] lg:text-[40.727px] md:text-[32px] sm:text-[28px] leading-none">
            {stageNumber}
          </div>
        </div>

        {/* タイトル */}
        <h1 className="text-[#0D0F18] font-rounded font-medium text-[48px] lg:text-[48px] md:text-[36px] sm:text-[28px] leading-none">
          {title}
        </h1>
      </div>

      {/* 説明文（descriptionがある場合） */}
      <div className="text-[rgba(13,15,24,0.8)] font-rounded font-medium text-[20px] lg:text-[20px] md:text-[18px] sm:text-[16px] leading-[28px] lg:leading-[28px] md:leading-[24px] sm:leading-[22px]">
        このレッスンでは、Todo アプリの基本的な画面設計を行います。
      </div>

      {/* 目安時間 & 難易度 */}
      <div className="flex items-start gap-8 lg:gap-8 md:gap-6 sm:flex-col sm:gap-4">
        {/* 目安時間 */}
        <div className="flex items-start gap-5">
          <span className="text-[rgba(13,15,24,0.8)] font-rounded font-medium text-[20px] lg:text-[20px] md:text-[18px] sm:text-[16px] leading-[28px] lg:leading-[28px] md:leading-[24px] sm:leading-[22px]">
            目安
          </span>
          <span className="text-[rgba(13,15,24,0.8)] font-rounded font-normal text-[20px] lg:text-[20px] md:text-[18px] sm:text-[16px] leading-[28px] lg:leading-[28px] md:leading-[24px] sm:leading-[22px]">
            {estimated_time || '不明'}
          </span>
        </div>

        {/* 難易度 */}
        <div className="flex items-start gap-5">
          <span className="text-[rgba(13,15,24,0.8)] font-rounded font-medium text-[20px] lg:text-[20px] md:text-[18px] sm:text-[16px] leading-[28px] lg:leading-[28px] md:leading-[24px] sm:leading-[22px]">
            難易度
          </span>
          <span className="text-[rgba(13,15,24,0.8)] font-rounded font-normal text-[20px] lg:text-[20px] md:text-[18px] sm:text-[16px] leading-[28px] lg:leading-[28px] md:leading-[24px] sm:leading-[22px]">
            {difficulty || '不明'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;
