import React from "react";

export interface HeadingSectionInnerProps {
  /** 左側タイトル */
  title: string;
  /** 「すべてみる」表示（default: true） */
  showLink?: boolean;
  /** リンクテキスト（default: "すべてみる"） */
  linkText?: string;
  /** リンク先URL */
  linkHref?: string;
  /** リンククリック時のコールバック */
  onLinkClick?: () => void;
}

/**
 * セクション見出しコンポーネント
 * 左にタイトル、右に「すべてみる」リンク（表示/非表示切替可能）
 */
export function HeadingSectionInner({
  title,
  showLink = true,
  linkText = "すべてみる",
  linkHref,
  onLinkClick,
}: HeadingSectionInnerProps) {
  return (
    <div className="w-full flex items-center justify-between">
      {/* 左側: タイトル */}
      <div className="flex items-center">
        <span
          className="text-[13px] text-[#020817] whitespace-nowrap font-bold"
          style={{ fontFamily: "'Rounded Mplus 1c', sans-serif" }}
        >
          {title}
        </span>
      </div>

      {/* 右側: リンク */}
      {showLink && (
        <div className="flex items-center">
          {linkHref ? (
            <a
              href={linkHref}
              className="text-[12px] text-[rgba(2,8,23,0.64)] leading-[32px] text-center whitespace-nowrap hover:opacity-80"
              style={{ fontFamily: "'Rounded Mplus 1c', sans-serif" }}
            >
              {linkText}
            </a>
          ) : (
            <button
              onClick={onLinkClick}
              className="text-[12px] text-[rgba(2,8,23,0.64)] leading-[32px] text-center whitespace-nowrap hover:opacity-80 bg-transparent border-none cursor-pointer"
              style={{ fontFamily: "'Rounded Mplus 1c', sans-serif" }}
            >
              {linkText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default HeadingSectionInner;
