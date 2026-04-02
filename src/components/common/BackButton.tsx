import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /** ボタンラベル（例: "戻る", "レッスン一覧へ"） */
  label?: string;
  /** フォールバック先URL（履歴がない場合に遷移） */
  href?: string;
  /** 追加クラス */
  className?: string;
}

/**
 * 戻るボタン（白背景＋グレー枠＋影）
 *
 * - 可能なら history.back()
 * - 外部から直接来た場合などは href へ遷移
 */
export function BackButton({
  label = "戻る",
  href = "/",
  className,
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    const referrer = document.referrer;
    const isInternalReferrer =
      referrer && new URL(referrer).origin === window.location.origin;

    if (isInternalReferrer) {
      navigate(-1);
    } else {
      navigate(href);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        "bg-white border border-[#EBEBEB] flex items-center justify-center px-2.5 sm:px-3 py-[7px] rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_3px_0px_rgba(0,0,0,0.04)] hover:bg-gray-50 transition gap-0 sm:gap-2",
        className,
      )}
    >
      <ArrowLeft className="size-5 text-black" strokeWidth={2} />
      {/* スマホではアイコンのみ、テキストは非表示 */}
      <span className="hidden sm:inline font-noto-sans-jp font-semibold text-sm text-black">
        {label}
      </span>
    </button>
  );
}

export default BackButton;

