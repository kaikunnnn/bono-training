import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";

interface ContentItemProps {
  id: string;
  title: string;
  duration?: number;
  slug: string;
  isCompleted?: boolean;
  isFocus?: boolean;
  isPremium?: boolean;
  onCheckChange?: (id: string, isChecked: boolean) => void;
}

/**
 * ContentItem コンポーネント
 * サイドナビゲーションの記事アイテム
 *
 * 仕様（side-navi_quest-block.md準拠）:
 * - パディング: 16px
 * - ギャップ: 8px
 * - ボーダーラディウス: 6px（固定）
 * - Default状態背景: transparent
 * - Hover背景: #F9FAFB（親がDefault）、#F3F3F3（親がFocus）
 * - Focus状態背景: #F3F3F3、ボーダーラディウス12px、タイトル太字500
 * - チェックボックス: 16x16px、ボーダー1.25px #99A1AF、ボーダーラディウス3px
 * - タイトル: 12px Noto Sans JP 400、#677B87（Default）、#101828（Hover/Focus時太字500）
 * - 時間: 10px Noto Sans JP、#6A7282、ギャップ0px
 */
const ContentItem = ({
  id,
  title,
  duration,
  slug,
  isCompleted = false,
  isFocus = false,
  isPremium = false,
  onCheckChange,
}: ContentItemProps) => {
  const navigate = useNavigate();
  const { canAccessContent } = useSubscriptionContext();
  const [isHovered, setIsHovered] = useState(false);
  const [checked, setChecked] = useState(isCompleted);

  // プレミアムコンテンツで未契約の場合、ロック状態
  const isLocked = isPremium && !canAccessContent(isPremium);

  // isCompletedが変わったらcheckedを更新
  useEffect(() => {
    setChecked(isCompleted);
  }, [isCompleted]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newChecked = e.target.checked;
    setChecked(newChecked);
    onCheckChange?.(id, newChecked);
  };

  const handleItemClick = () => {
    navigate(`/articles/${slug}`);
  };

  const state = isFocus ? "focus" : isHovered ? "hover" : "default";

  // 背景色とボーダーラディウスの決定
  let backgroundColor = "transparent";
  let borderRadius = "6px";

  if (state === "focus") {
    backgroundColor = "#F3F3F3";
    borderRadius = "12px";
  } else if (state === "hover") {
    backgroundColor = "#F9FAFB"; // Default状態のQuestBlockのアイテムホバー
    borderRadius = "6px";
  }

  return (
    <div
      className="flex items-center cursor-pointer transition-all duration-150"
      style={{
        gap: "8px",
        padding: "16px",
        backgroundColor,
        borderRadius,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleItemClick}
      role="button"
      aria-label={`${title} - ${duration || "?"}分`}
    >
      {/* チェックボックス 16x16px - 丸型 */}
      <input
        type="checkbox"
        className="w-4 h-4 flex-shrink-0 cursor-pointer border-[1.25px] border-[#99A1AF] rounded-full bg-white appearance-none checked:bg-[#155DFC] checked:border-[#155DFC] hover:bg-[#E8E8E8] hover:border-[#88919F] transition-colors focus-visible:outline-2 focus-visible:outline-[#0066CC] focus-visible:outline-offset-2"
        checked={checked}
        onChange={handleCheckboxChange}
        onClick={(e) => e.stopPropagation()}
        aria-label={title}
      />

      {/* コンテンツブロック */}
      <div className="flex items-center justify-between flex-1" style={{ gap: "12px" }}>
        {/* タイトルと鍵アイコン */}
        <div className="flex items-center gap-1.5 flex-1">
          {/* 鍵アイコン（プレミアムで未契約の場合） */}
          {isLocked && (
            <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" strokeWidth={2} />
          )}
          <h3
            className={`text-xs m-0 flex-1 transition-all ${
              state === "focus" || state === "hover"
                ? "font-medium text-[#101828]"
                : "font-normal text-[#677B87]"
            }`}
            style={{
              fontFamily: '"Noto Sans JP", sans-serif',
              letterSpacing: "-1.25%",
              lineHeight: "1.667em",
            }}
          >
            {title}
          </h3>
        </div>

        {/* 学習時間 */}
        {duration !== undefined && (
          <div className="flex items-center flex-shrink-0 whitespace-nowrap" style={{ gap: "0" }}>
            <span
              className="text-[10px] text-[#6A7282]"
              style={{ fontFamily: '"Noto Sans JP", sans-serif', lineHeight: "1.6em" }}
            >
              {duration}
            </span>
            <span
              className="text-[10px] text-[#6A7282]"
              style={{ fontFamily: '"Noto Sans JP", sans-serif', lineHeight: "1.6em" }}
            >
              分
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentItem;
