import { Check, Star, Share2, ChevronRight } from "lucide-react";

interface HeadingSectionProps {
  questNumber?: number;
  stepNumber?: number;
  title: string;
  description?: string;
  onComplete?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  onNext?: () => void;
}

/**
 * HeadingSection コンポーネント
 * 記事詳細ページのヘッダーセクション
 *
 * 仕様:
 * - クエスト情報表示（Quest N / Step N）
 * - タイトル（28px Noto Sans JP Bold）
 * - 説明文（16px Inter）
 * - アクションボタン（完了・お気に入り・シェア・次へ）
 */
const HeadingSection = ({
  questNumber,
  stepNumber,
  title,
  description,
  onComplete,
  onFavorite,
  onShare,
  onNext,
}: HeadingSectionProps) => {
  return (
    <div className="w-full space-y-3">
      {/* Quest Info */}
      {(questNumber !== undefined || stepNumber !== undefined) && (
        <div className="flex items-center gap-1 text-xs text-[#747474]">
          {questNumber !== undefined && (
            <>
              <span style={{ fontFamily: "Inter", letterSpacing: "-2.604%" }}>
                クエスト{questNumber}
              </span>
            </>
          )}
          {questNumber !== undefined && stepNumber !== undefined && (
            <span className="text-[#C0C0C0]">/</span>
          )}
          {stepNumber !== undefined && (
            <span style={{ fontFamily: "Inter", letterSpacing: "-2.604%" }}>
              ステップ{stepNumber}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h1
        className="text-[28px] font-bold leading-[32px] text-[#102028]"
        style={{
          fontFamily: '"Noto Sans JP", sans-serif',
          letterSpacing: "0.251%",
        }}
      >
        {title}
      </h1>

      {/* Description */}
      {description && (
        <p
          className="text-base leading-6 text-[#4A5565]"
          style={{
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-1.953%",
          }}
        >
          {description}
        </p>
      )}

      {/* Action Area */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {/* Left Button Group */}
        <div className="flex items-center gap-2">
          {/* Complete Button */}
          <button
            onClick={onComplete}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-[#F3F5F5] hover:bg-gray-200 transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <Check className="w-[18px] h-[18px]" strokeWidth={2} />
            <span className="text-sm font-bold leading-5 text-[#34373D]" style={{ letterSpacing: "-1.07421875%" }}>
              完了にする
            </span>
          </button>

          {/* Favorite Button */}
          <button
            onClick={onFavorite}
            className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <Star className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <span className="text-sm leading-5 text-[#6A7282]" style={{ letterSpacing: "-1.07421875%" }}>
              お気に入り
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={onShare}
            className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <Share2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <span className="text-sm leading-5 text-[#6A7282]" style={{ letterSpacing: "-1.07421875%" }}>
              シェア
            </span>
          </button>
        </div>

        {/* Right: Next Content Button */}
        {onNext && (
          <button
            onClick={onNext}
            className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors h-9"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <span className="text-sm leading-5 text-[#6A7282]" style={{ letterSpacing: "-1.07421875%" }}>
              次の動画
            </span>
            <ChevronRight className="w-4 h-4 text-[#6A7282]" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
};

export default HeadingSection;
