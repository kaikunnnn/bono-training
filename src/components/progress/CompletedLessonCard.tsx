import React from "react";
import { useNavigate } from "react-router-dom";

export interface CompletedLessonCardProps {
  /** レッスンタイトル */
  title: string;
  /** アイコン画像URL */
  iconImageUrl: string;
  /** レッスンスラッグ（URLパス） */
  lessonSlug: string;
  /** クリックハンドラ（オプション、指定しない場合はlessonSlugへ遷移） */
  onClick?: () => void;
}

/**
 * 完了済みレッスンカードコンポーネント
 * マイページの「完了」セクションで使用
 */
export const CompletedLessonCard: React.FC<CompletedLessonCardProps> = ({
  title,
  iconImageUrl,
  lessonSlug,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/lessons/${lessonSlug}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl p-4 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] cursor-pointer transition-shadow hover:shadow-[0px_4px_12px_rgba(0,0,0,0.12)]"
    >
      <div className="flex items-center gap-3">
        <img
          src={iconImageUrl}
          alt={title}
          className="w-12 h-[73px] object-cover rounded-r-lg"
        />
        <div>
          <h4
            className="text-base font-bold text-[#020817] m-0 mb-1"
            style={{ fontFamily: "'Rounded Mplus 1c', sans-serif" }}
          >
            {title}
          </h4>
          <span className="text-sm font-semibold text-[#EC4899]">
            ✓ 完了
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompletedLessonCard;
