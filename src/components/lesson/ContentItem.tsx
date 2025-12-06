import { useNavigate } from "react-router-dom";
import { urlFor } from "@/lib/sanity";
import { Check, Lock } from "lucide-react";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";

interface ContentItemProps {
  articleNumber: number; // ランタイムで付与
  title: string;
  slug: string;
  thumbnail?: any;
  thumbnailUrl?: string;
  videoDuration?: number;
  isCompleted?: boolean;
  isPremium?: boolean;
}

export default function ContentItem({
  articleNumber,
  title,
  slug,
  thumbnail,
  thumbnailUrl,
  videoDuration,
  isCompleted = false,
  isPremium = false,
}: ContentItemProps) {
  const navigate = useNavigate();
  const { canAccessContent } = useSubscriptionContext();

  // プレミアムコンテンツで未契約の場合、ロック状態
  const isLocked = isPremium && !canAccessContent(isPremium);

  const handleClick = () => {
    navigate(`/articles/${slug}`);
  };

  // サムネイル画像のURLを取得（URL優先、なければSanity画像オブジェクト）
  const getThumbnailUrl = () => {
    if (thumbnailUrl) {
      return thumbnailUrl;
    }
    if (thumbnail?.asset?._ref) {
      return urlFor(thumbnail).width(57).height(32).url();
    }
    return null;
  };

  const thumbnailSrc = getThumbnailUrl();

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-4 px-8 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
    >
      {/* 記事番号 */}
      <div className="flex-shrink-0">
        <span className="font-geist text-sm text-lesson-item-number font-medium">
          {String(articleNumber).padStart(2, "0")}
        </span>
      </div>

      {/* サムネイル */}
      {thumbnailSrc && (
        <div className="flex-shrink-0">
          <img
            src={thumbnailSrc}
            alt={title}
            className="w-[57px] h-[32px] object-cover rounded-[3.17px] bg-lesson-item-thumbnail-bg"
          />
        </div>
      )}

      {/* タイトルと動画時間 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {/* チェックマーク（完了済みの場合） */}
          {isCompleted && (
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2.5} />
          )}
          {/* ロックアイコン（プレミアムで未契約の場合） */}
          {isLocked && (
            <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
          )}
          <p className="font-noto-sans-jp text-sm text-lesson-item-title font-medium truncate">
            {title}
          </p>
        </div>
        {videoDuration && (
          <p className="font-geist text-xs text-lesson-item-duration mt-0.5">
            {videoDuration}分
          </p>
        )}
      </div>
    </div>
  );
}
