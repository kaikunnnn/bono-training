import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackNavigationProps {
  lessonSlug: string;
}

/**
 * BackNavigation コンポーネント
 * レッスン詳細ページに戻るボタン
 *
 * 仕様:
 * - 16x16px 円形背景（#E4E4E4）
 * - 左矢印アイコン
 * - "トップへ" テキスト（10px Noto Sans JP 400、#6D6D6D）
 * - ギャップ: 4px
 * - ホバー時: アイコン背景 #D0D0D0、テキスト #4A4A4A
 * - クリック時: scale(0.96)
 */
const BackNavigation = ({ lessonSlug }: BackNavigationProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/lessons/${lessonSlug}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 w-auto border-none bg-transparent cursor-pointer transition-all duration-150 hover:opacity-85 active:scale-[0.96]"
      aria-label="トップへ戻る"
    >
      {/* 16x16px 円形アイコン背景 */}
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-150"
        style={{ backgroundColor: "#E4E4E4" }}
      >
        <ArrowLeft className="w-2.5 h-2.5 text-black" strokeWidth={1.5} />
      </div>

      {/* トップへ テキスト */}
      <span
        className="text-[10px] font-normal leading-[1.6em] transition-colors duration-150 m-0 p-0"
        style={{
          fontFamily: '"Noto Sans JP", sans-serif',
          color: "#6D6D6D",
        }}
      >
        トップへ
      </span>
    </button>
  );
};

export default BackNavigation;
