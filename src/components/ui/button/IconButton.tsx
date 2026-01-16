import React from "react";
import { Link } from "react-router-dom";

export interface IconButtonProps {
  /** アイコン要素 */
  icon: React.ReactNode;
  /** ボタンラベル */
  label: string;
  /** 遷移先URL（指定時はLinkとして動作） */
  to?: string;
  /** クリックハンドラ */
  onClick?: () => void;
}

/**
 * アイコン付きボタンコンポーネント
 * マイページのプロフィールボタンなどで使用
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  to,
  onClick,
}) => {
  const className =
    "bg-white px-[10px] py-[5px] rounded-[12px] border border-[rgba(0,0,0,0.08)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] inline-flex items-center gap-[4px] cursor-pointer";

  const content = (
    <>
      <div className="w-5 h-5 flex items-center justify-center">
        {icon}
      </div>
      <span className="font-bold text-[13px] text-[#020817] leading-[24px]">
        {label}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
};

export default IconButton;
