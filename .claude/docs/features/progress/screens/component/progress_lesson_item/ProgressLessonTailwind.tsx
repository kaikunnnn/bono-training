import React from 'react';

interface ProgressLessonProps {
  /** アイコン画像URL または テキスト */
  icon?: string;
  /** アイコン背景色 (Tailwind class) */
  iconBgColor?: string;
  /** レッスンタイトル */
  title: string;
  /** 進捗率 (0-100) */
  progress: number;
  /** 現在のステップ名 */
  currentStep: string;
  /** ステップ完了フラグ */
  isStepCompleted: boolean;
  /** クリック時のコールバック */
  onClick?: () => void;
}

export const ProgressLessonTailwind: React.FC<ProgressLessonProps> = ({
  icon = 'COPY',
  iconBgColor = 'bg-pink-100',
  title,
  progress,
  currentStep,
  isStepCompleted,
  onClick,
}) => {
  return (
    <div
      className={`
        w-[360px] h-[147px] 
        bg-white rounded-2xl 
        p-5 
        shadow-md 
        transition-shadow duration-200
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
      `}
      onClick={onClick}
      role="article"
      aria-label={`${title}の進捗状況`}
    >
      {/* 上部エリア: アイコン + タイトル + プログレスバー */}
      <div className="flex items-start gap-3">
        {/* アイコン */}
        <div
          className={`
            w-12 h-12 
            ${iconBgColor}
            rounded-lg 
            flex items-center justify-center 
            flex-shrink-0 
            text-[10px] font-semibold text-gray-600
            overflow-hidden
          `}
        >
          {icon.startsWith('http') ? (
            <img
              src={icon}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{icon}</span>
          )}
        </div>

        {/* タイトル + プログレスバー */}
        <div className="flex-1 min-w-0">
          {/* タイトル */}
          <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight">
            {title}
          </h3>

          {/* プログレスバー + パーセンテージ */}
          <div className="flex items-center gap-3">
            {/* プログレスバー */}
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-gray-900 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* パーセンテージ */}
            <span className="text-sm font-semibold text-gray-900 min-w-[42px] text-right">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* 下部エリア: ステップ表示 */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        {/* キラキラアイコン */}
        <span className="text-base">✨</span>

        {/* 完了/未完了アイコン */}
        <span className={isStepCompleted ? 'text-green-500' : 'text-gray-400'}>
          {isStepCompleted ? '✓' : '✕'}
        </span>

        {/* ステップ名 */}
        <span>{currentStep}</span>
      </div>
    </div>
  );
};

export default ProgressLessonTailwind;
