import React from 'react';

interface ProgressLessonProps {
  /** アイコン画像URL または テキスト */
  icon?: string;
  /** アイコン背景色 */
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

export const ProgressLesson: React.FC<ProgressLessonProps> = ({
  icon = 'COPY',
  iconBgColor = '#FFE5E5',
  title,
  progress,
  currentStep,
  isStepCompleted,
  onClick,
}) => {
  return (
    <div
      className="progress-lesson-card"
      onClick={onClick}
      role="article"
      aria-label={`${title}の進捗状況`}
      style={{
        width: '360px',
        height: '147px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0px 4px 16px rgba(0, 0, 0, 0.12)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0px 2px 8px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* 上部エリア: アイコン + タイトル + プログレスバー */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* アイコン */}
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: iconBgColor,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '10px',
            fontWeight: '600',
            color: '#666',
            overflow: 'hidden',
          }}
        >
          {icon.startsWith('http') ? (
            <img
              src={icon}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span>{icon}</span>
          )}
        </div>

        {/* タイトル + プログレスバー */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* タイトル */}
          <h3
            style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: '700',
              color: '#1A1A1A',
              lineHeight: '1.4',
            }}
          >
            {title}
          </h3>

          {/* プログレスバー + パーセンテージ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* プログレスバー */}
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{
                flex: 1,
                height: '6px',
                backgroundColor: '#E5E5E5',
                borderRadius: '3px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#1A1A1A',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* パーセンテージ */}
            <span
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1A1A1A',
                minWidth: '42px',
                textAlign: 'right',
              }}
            >
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* 下部エリア: ステップ表示 */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#666666',
        }}
      >
        {/* キラキラアイコン */}
        <span style={{ fontSize: '16px' }}>✨</span>

        {/* 完了/未完了アイコン */}
        <span
          style={{
            fontSize: '14px',
            color: isStepCompleted ? '#4CAF50' : '#999999',
          }}
        >
          {isStepCompleted ? '✓' : '✕'}
        </span>

        {/* ステップ名 */}
        <span>{currentStep}</span>
      </div>
    </div>
  );
};

export default ProgressLesson;
