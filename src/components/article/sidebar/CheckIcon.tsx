import { Check } from "lucide-react";

interface CheckIconProps {
  isCompleted: boolean;
}

/**
 * CheckIcon コンポーネント
 * 記事の完了状態を示すアイコン
 *
 * Figma仕様（SIDEBAR-SPEC.md準拠）:
 * - サイズ: 16x16px
 * - 未完了: 透明背景、グレーのアウトライン、グレーのチェック
 * - 完了: グラデーション背景（#ECBFFF → #81D4FA）、白のチェック
 */
export function CheckIcon({ isCompleted }: CheckIconProps) {
  if (isCompleted) {
    // Done（完了）
    return (
      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#ECBFFF] to-[#81D4FA] flex justify-center items-center flex-shrink-0">
        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
      </div>
    );
  }

  // Default（未完了）
  return (
    <div className="w-4 h-4 rounded-full outline outline-1 outline-offset-[-1px] outline-black/5 backdrop-blur-[2px] flex justify-center items-center flex-shrink-0">
      <Check className="w-2.5 h-2.5 text-neutral-300" strokeWidth={3} />
    </div>
  );
}

export default CheckIcon;
