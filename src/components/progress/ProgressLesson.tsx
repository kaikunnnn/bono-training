import React, { useState } from "react";

export interface ProgressLessonProps {
  /** レッスンタイトル */
  title: string;
  /** 進捗率 (0-100) */
  progress: number;
  /** 現在のステップ名 */
  currentStep: string;
  /** アイコン画像URL（Sanity CMSから取得） */
  iconImageUrl: string;
  /** 次の記事URL */
  nextArticleUrl?: string;
  /** 次の記事クリック時のコールバック */
  onNextArticleClick?: () => void;
  /** メインカードクリック時のコールバック */
  onCardClick?: () => void;
  /** 100%完了ボタンを表示するか（progress=100の時のみ有効） */
  showCompleteButton?: boolean;
  /** 完了ボタンクリック時のコールバック */
  onCompleteClick?: () => void;
  /** 完了ボタンのローディング状態 */
  isCompleting?: boolean;
  /** カスタムクラス名 */
  className?: string;
}

export const ProgressLesson: React.FC<ProgressLessonProps> = ({
  title,
  progress,
  currentStep,
  iconImageUrl,
  nextArticleUrl,
  onNextArticleClick,
  onCardClick,
  showCompleteButton = false,
  onCompleteClick,
  isCompleting = false,
  className = "",
}) => {
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isNextHovered, setIsNextHovered] = useState(false);
  const [isCompleteHovered, setIsCompleteHovered] = useState(false);

  // 100%かつ完了ボタン表示フラグがtrueの場合のみボタンを表示
  const shouldShowCompleteButton = progress === 100 && showCompleteButton;

  // 次の記事リンククリック処理
  const handleNextArticleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素へのイベント伝播を停止

    if (onNextArticleClick) {
      onNextArticleClick();
    }

    if (nextArticleUrl) {
      window.location.href = nextArticleUrl;
    }
  };

  // 完了ボタンクリック処理
  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素へのイベント伝播を停止

    if (onCompleteClick && !isCompleting) {
      onCompleteClick();
    }
  };

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {/* ブロック1: lesson_block（メインカード） */}
      <div
        role="article"
        aria-label={`${title}の進捗状況`}
        onClick={onCardClick}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingTop: "19px",
          paddingBottom: "19px",
          marginBottom: "-18px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          flexShrink: 0,
          boxShadow:
            isCardHovered && onCardClick
              ? "0px 4px 16px rgba(0, 0, 0, 0.12)"
              : "0px 2px 8px rgba(0, 0, 0, 0.08)",
          cursor: onCardClick ? "pointer" : "default",
          transition: "box-shadow 0.2s ease",
          zIndex: 2,
          overflow: "clip",
        }}
      >
        {/* 内部の横並びレイアウト */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            flexShrink: 0,
          }}
        >
          {/* 左側: コンテンツエリア */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
              flex: "1 1 0",
              minWidth: 0,
            }}
          >
            {/* アイコンエリア（Sanity CMS画像） */}
            <div
              style={{
                width: "48px",
                height: "73px",
                borderTopRightRadius: "8px",
                borderBottomRightRadius: "8px",
                position: "relative",
                flexShrink: 0,
                overflow: "hidden",
                backgroundColor: "#F5F5F5", // プレースホルダー背景
              }}
            >
              <img
                src={iconImageUrl}
                alt={`${title}のアイコン`}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "50% 50%",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* テキストエリア（タイトル + プログレスバー） */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "9px",
                alignItems: "flex-start",
                minWidth: 0,
                flex: "1 1 0",
              }}
            >
              {/* タイトル */}
              <div
                style={{
                  fontFamily: "'Rounded Mplus 1c', sans-serif",
                  fontWeight: 600,
                  fontSize: "20px",
                  fontStyle: "normal",
                  lineHeight: "normal",
                  color: "#000000",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  width: "100%",
                  maxWidth: "320px",
                  flexShrink: 0,
                }}
              >
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "16px",
                    lineHeight: "normal",
                    margin: 0,
                    width: "100%",
                  }}
                >
                  {title}
                </p>
              </div>

              {/* プログレスバー */}
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{
                  backgroundColor: "#EAEAEA",
                  height: "6px",
                  width: "100%",
                  borderRadius: "1000px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  flexShrink: 0,
                  overflow: "clip",
                  position: "relative",
                }}
              >
                {/* 進捗部分 */}
                <div
                  style={{
                    backgroundColor: "#000000",
                    width: `${progress}%`,
                    height: "6px",
                    minWidth: "1px",
                    minHeight: "1px",
                    borderRadius: "40px",
                    flexGrow: 1,
                    flexBasis: 0,
                    flexShrink: 0,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          </div>

          {/* 右側: パーセンテージ表示 */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              fontFamily: "'Rounded Mplus 1c', sans-serif",
              fontWeight: 700,
              fontStyle: "normal",
              lineHeight: 0,
              color: "#000000",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {/* 数字部分 */}
            <div
              style={{
                fontSize: "24px",
                letterSpacing: "-0.48px",
                textAlign: "right",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <p
                style={{
                  lineHeight: "normal",
                  whiteSpace: "nowrap",
                  margin: 0,
                }}
              >
                {progress}
              </p>
            </div>

            {/* %記号 */}
            <div
              style={{
                fontSize: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <p
                style={{
                  lineHeight: "normal",
                  whiteSpace: "nowrap",
                  margin: 0,
                }}
              >
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ブロック2: 完了ボタン or 次の記事 */}
      {shouldShowCompleteButton ? (
        /* 完了ボタン（100%時） */
        <button
          type="button"
          aria-label="レッスンを完了する"
          disabled={isCompleting}
          onClick={handleCompleteClick}
          onMouseEnter={() => setIsCompleteHovered(true)}
          onMouseLeave={() => setIsCompleteHovered(false)}
          style={{
            backgroundColor: isCompleting
              ? "#9CA3AF"
              : isCompleteHovered
              ? "#16A34A"
              : "#22C55E",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
            paddingTop: "18px",
            paddingBottom: "8px",
            paddingLeft: "24px",
            paddingRight: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            flexShrink: 0,
            zIndex: 1,
            overflow: "clip",
            cursor: isCompleting ? "not-allowed" : "pointer",
            transition: "background-color 0.2s ease",
            border: "none",
          }}
        >
          <span
            style={{
              fontFamily: "'Rounded Mplus 1c', 'Noto Sans JP', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              color: "#FFFFFF",
              lineHeight: "normal",
            }}
          >
            {isCompleting ? "処理中..." : "✓ レッスンを完了する"}
          </span>
        </button>
      ) : (
        /* 次の記事リンク（通常時） */
        <div
          role="link"
          tabIndex={0}
          aria-label={`次の記事: ${currentStep}`}
          onClick={handleNextArticleClick}
          onMouseEnter={() => setIsNextHovered(true)}
          onMouseLeave={() => setIsNextHovered(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleNextArticleClick(e as unknown as React.MouseEvent);
            }
          }}
          style={{
            backgroundColor: isNextHovered ? "#E5E5E5" : "#EFEFEF",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
            paddingTop: "18px",
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "100%",
            flexShrink: 0,
            zIndex: 1,
            overflow: "clip",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
        >
          {/* 内部コンテンツエリア */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              paddingLeft: "24px",
              paddingRight: "24px",
              paddingTop: "8px",
              paddingBottom: "8px",
              width: "100%",
              flexShrink: 0,
              lineHeight: 0,
              whiteSpace: "nowrap",
            }}
          >
            {/* 「次」テキスト + 絵文字 */}
            <div
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontWeight: 400,
                fontSize: "10px",
                color: "#4B5563",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <p
                style={{
                  lineHeight: "normal",
                  whiteSpace: "nowrap",
                  margin: 0,
                }}
              >
                <span style={{ fontWeight: 700 }}>次</span>👉️
              </p>
            </div>

            {/* ステップ名 */}
            <div
              style={{
                fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                fontStyle: "normal",
                lineHeight: "20px",
                color: "#000000",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <p style={{ whiteSpace: "nowrap", margin: 0 }}>{currentStep}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressLesson;
