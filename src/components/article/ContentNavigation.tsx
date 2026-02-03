import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavigationItem {
  slug: string;
  title: string;
}

interface ContentNavigationProps {
  previous?: NavigationItem;
  next?: NavigationItem;
}

/**
 * ContentNavigation コンポーネント
 * 記事の最後に表示される前後の記事へのナビゲーション
 *
 * 仕様:
 * - 前の記事カード（左側、左矢印）
 * - 次の記事カード（右側、右矢印）
 * - 216px ギャップ（デスクトップ）
 * - カード: 16px ボーダーラディウス、1px #DEDEDE ボーダー
 * - ラベル: 10px Noto Sans JP Medium #787878
 * - タイトル: 12px Hind SemiBold #101828
 */
const ContentNavigation = ({ previous, next }: ContentNavigationProps) => {
  const navigate = useNavigate();

  // 前後どちらもない場合は何も表示しない
  if (!previous && !next) {
    return null;
  }

  return (
    <div className="w-full flex flex-col-reverse md:flex-row justify-between gap-4 md:gap-8 mt-12">
      {/* 前の記事カード */}
      {previous ? (
        <button
          onClick={() => navigate(`/articles/${previous.slug}`)}
          className="flex items-center gap-3 px-6 py-5 bg-white rounded-[20px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] hover:bg-gray-50 transition-colors flex-1 min-w-0"
        >
          {/* 左矢印 */}
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
          </div>

          {/* テキストコンテナ */}
          <div className="flex flex-col gap-1 text-left flex-1 min-w-0">
            {/* ラベル */}
            <span
              className="text-[10px] font-medium leading-[10px] text-[#787878]"
              style={{
                fontFamily: '"Noto Sans JP", sans-serif',
                letterSpacing: "-3.125%",
              }}
            >
              前
            </span>

            {/* タイトル */}
            <span
              className="text-sm font-semibold leading-4 text-[#101828] truncate"
              style={{
                fontFamily: "Hind, sans-serif",
              }}
            >
              {previous.title}
            </span>
          </div>
        </button>
      ) : (
        <div className="hidden md:block flex-1" /> // スペーサー（PC表示のみ）
      )}

      {/* 次の記事カード */}
      {next ? (
        <button
          onClick={() => navigate(`/articles/${next.slug}`)}
          className="flex items-center gap-3 px-6 py-5 bg-white rounded-[20px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] hover:bg-gray-50 transition-colors flex-1 min-w-0"
        >
          {/* テキストコンテナ */}
          <div className="flex flex-col gap-1 text-left flex-1 min-w-0">
            {/* ラベル */}
            <span
              className="text-[10px] font-medium leading-[10px] text-[#787878]"
              style={{
                fontFamily: '"Noto Sans JP", sans-serif',
                letterSpacing: "-3.125%",
              }}
            >
              次
            </span>

            {/* タイトル */}
            <span
              className="text-sm font-semibold leading-4 text-[#101828] truncate"
              style={{
                fontFamily: "Hind, sans-serif",
              }}
            >
              {next.title}
            </span>
          </div>

          {/* 右矢印 */}
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </button>
      ) : (
        <div className="hidden md:block flex-1" /> // スペーサー（PC表示のみ）
      )}
    </div>
  );
};

export default ContentNavigation;
