import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface LessonHeaderProps {
  /** 戻るボタンのラベル */
  backLabel?: string;
  /** 戻り先URL */
  backHref?: string;
  /** シェアボタンクリック時のコールバック */
  onShare?: () => void;
  /** シェアボタンを表示するか */
  showShare?: boolean;
}

/**
 * レッスンヘッダー（戻る + シェアボタン）
 *
 * Figma仕様:
 * - 高さ: 64px
 * - 左: 戻るボタン（142px）
 * - 右: シェアボタン（62px）
 * - ボタンスタイル: 白背景、黒ボーダー、角丸12px
 *
 * @example
 * <LessonHeader />
 * <LessonHeader backLabel="コース一覧へ" backHref="/courses" />
 */
export function LessonHeader({
  backLabel = "レッスン一覧へ",
  backHref = "/lessons",
  onShare,
  showShare = true,
}: LessonHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backHref);
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // デフォルト: Web Share APIを使用
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } else {
        // フォールバック: URLをクリップボードにコピー
        navigator.clipboard.writeText(window.location.href);
      }
    }
  };

  return (
    <div className="flex items-start justify-between w-full mb-[24px]">
      {/* 左側：戻るボタン */}
      <div className="flex items-start">
        <button
          onClick={handleBack}
          className="bg-white border border-[#EBEBEB] flex gap-2 items-center px-3 py-[7px] rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_3px_0px_rgba(0,0,0,0.04)] hover:bg-gray-50 transition"
        >
          {/* 矢印アイコン */}
          <ArrowLeft className="size-5 text-black" strokeWidth={2} />
          {/* テキスト */}
          <span className="font-noto-sans-jp font-semibold text-sm text-black">
            {backLabel}
          </span>
        </button>
      </div>

      {/* 右側：シェアボタン */}
      {showShare && (
        <div className="flex items-start">
          <button
            onClick={handleShare}
            className="bg-white border border-[#EBEBEB] flex gap-1 items-center px-2.5 py-[7px] rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_3px_0px_rgba(0,0,0,0.04)] hover:bg-gray-50 transition"
          >
            <span className="font-noto-sans-jp font-semibold text-sm text-black">
              シェア
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default LessonHeader;
