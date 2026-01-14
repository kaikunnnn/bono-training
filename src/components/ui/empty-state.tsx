import React from "react";
import { Link } from "react-router-dom";

export interface EmptyStateProps {
  /** 表示メッセージ（改行はReactNodeで渡す） */
  message: React.ReactNode;
  /** リンク先URL（オプション） */
  linkHref?: string;
  /** リンクラベル（オプション） */
  linkLabel?: string;
}

/**
 * 空状態表示コンポーネント
 * マイページの「進行中がない」「お気に入りがない」「閲覧履歴がない」などで使用
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  linkHref,
  linkLabel,
}) => {
  return (
    <div
      className="self-stretch p-8 px-4 bg-black/[0.02] rounded-2xl flex flex-col justify-center items-center gap-3.5"
    >
      <div
        className="text-center text-black text-sm font-bold leading-6"
        style={{ fontFamily: "'Rounded Mplus 1c', sans-serif" }}
      >
        {message}
      </div>
      {linkHref && linkLabel && (
        <Link
          to={linkHref}
          className="px-2.5 py-1.5 bg-white rounded-lg border border-black/10 inline-flex justify-center items-center gap-1 no-underline"
        >
          <span
            className="text-[#020817] text-xs font-bold leading-6"
            style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}
          >
            {linkLabel}
          </span>
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
