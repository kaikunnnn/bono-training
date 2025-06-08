
import React from 'react';
import { TaskFrontmatter } from '@/types/training';

interface LessonHeaderProps {
  frontmatter: TaskFrontmatter;
}

/**
 * builder.ioデザインを再現したレッスンヘッダーコンポーネント
 * フロントマターからSTAGE、タイトル、説明、目安時間、難易度を表示
 * Tailwind標準クラスを使用してハードコーディングを排除
 */
const LessonHeader: React.FC<LessonHeaderProps> = ({ frontmatter }) => {
  const {
    title,
    description,
    order_index,
    estimated_time,
    difficulty
  } = frontmatter;

  // order_indexを2桁の文字列に変換
  const stageNumber = String(order_index).padStart(2, '0');

  return (
    <div className="flex flex-col gap-5 md:gap-4">
      {/* STAGE & タイトル */}
      <div className="flex items-end gap-5 md:gap-4">
        {/* STAGE部分 */}
        <div className="flex flex-col items-center gap-1.5 py-1.5">
          <div className="text-slate-800 text-center font-dot text-lg md:text-base sm:text-sm leading-none">
            STAGE
          </div>
          <div className="text-slate-800 text-center font-dot text-4xl md:text-3xl sm:text-2xl leading-none">
            {stageNumber}
          </div>
        </div>

        {/* タイトル */}
        <h1 className="text-slate-900 font-rounded font-medium text-5xl md:text-4xl sm:text-3xl leading-none">
          {title}
        </h1>
      </div>

      {/* 説明文（descriptionがある場合） */}
      {description && (
        <div className="text-slate-700 font-rounded font-medium text-xl md:text-lg sm:text-base leading-7 md:leading-6 sm:leading-tight">
          {description}
        </div>
      )}

      {/* 目安時間 & 難易度 */}
      <div className="flex items-start gap-8 md:gap-6 sm:flex-col sm:gap-4">
        {/* 目安時間 */}
        <div className="flex items-start gap-5">
          <span className="text-slate-700 font-rounded font-medium text-xl md:text-lg sm:text-base leading-7 md:leading-6 sm:leading-tight">
            目安
          </span>
          <span className="text-slate-700 font-rounded font-normal text-xl md:text-lg sm:text-base leading-7 md:leading-6 sm:leading-tight">
            {estimated_time || '不明'}
          </span>
        </div>

        {/* 難易度 */}
        <div className="flex items-start gap-5">
          <span className="text-slate-700 font-rounded font-medium text-xl md:text-lg sm:text-base leading-7 md:leading-6 sm:leading-tight">
            難易度
          </span>
          <span className="text-slate-700 font-rounded font-normal text-xl md:text-lg sm:text-base leading-7 md:leading-6 sm:leading-tight">
            {difficulty || '不明'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;
