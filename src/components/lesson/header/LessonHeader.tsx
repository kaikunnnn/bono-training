import { ShareDropdown } from "@/components/common/ShareDropdown";
import { BackButton } from "@/components/common/BackButton";

interface LessonHeaderProps {
  /** 戻るボタンのラベル */
  backLabel?: string;
  /** 戻り先URL */
  backHref?: string;
  /** シェアボタンを表示するか */
  showShare?: boolean;
  /** シェア用タイトル */
  shareTitle?: string;
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
  backLabel = "戻る",
  backHref = "/lessons",
  showShare = true,
  shareTitle,
}: LessonHeaderProps) {
  // シェア用タイトル（指定がなければdocument.titleを使用）
  const title = shareTitle || (typeof document !== "undefined" ? document.title : "");

  return (
    <div className="flex items-start justify-between w-full mb-[24px]">
      {/* 左側：戻るボタン */}
      <div className="flex items-start">
        <BackButton label={backLabel} href={backHref} />
      </div>

      {/* 右側：シェアボタン（ドロップダウン付き） */}
      {showShare && (
        <div className="flex items-start">
          <ShareDropdown title={title} align="end">
            <button
              className="bg-white border border-[#EBEBEB] flex gap-1 items-center px-2.5 py-[7px] rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_3px_0px_rgba(0,0,0,0.04)] hover:bg-gray-50 transition"
            >
              <span className="font-noto-sans-jp font-semibold text-sm text-black">
                シェア
              </span>
            </button>
          </ShareDropdown>
        </div>
      )}
    </div>
  );
}

export default LessonHeader;
