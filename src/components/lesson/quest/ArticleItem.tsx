import { useNavigate } from "react-router-dom";
import { urlFor } from "@/lib/sanity";
import { ChevronRight, Check, Lock } from "lucide-react";
import { Play, FileText } from "@/lib/icons";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { ArticleTag, type TagType } from "@/components/article/sidebar/ArticleTag";

interface ArticleItemProps {
  /** 記事番号 (1, 2, 3...) */
  articleNumber: number;
  /** 記事タイトル */
  title: string;
  /** 記事スラッグ (URLパス) */
  slug: string;
  /** サムネイル (Sanity画像) */
  thumbnail?: {
    asset?: {
      _ref?: string;
    };
  };
  /** サムネイルURL (直接指定) */
  thumbnailUrl?: string;
  /** Sanity記事タイプ（解説、イントロ、実践、チャレンジ） */
  articleType?: TagType;
  /** 完了状態 */
  isCompleted: boolean;
  /** 動画URL（あれば動画コンテンツとして扱う） */
  videoUrl?: string;
  /** 動画時間 (秒数) ※videoの場合 */
  videoDuration?: number;
  /** プレミアムコンテンツか */
  isPremium?: boolean;
}

/**
 * 記事アイテム（4状態対応: video/text × default/checked）
 *
 * @example
 * <ArticleItem
 *   articleNumber={1}
 *   title="UIデザインとは"
 *   slug="ui-design-basics"
 *   articleType="video"
 *   isCompleted={false}
 *   videoDuration={755}
 *   tag="解説"
 * />
 */
export function ArticleItem({
  articleNumber,
  title,
  slug,
  thumbnail,
  thumbnailUrl,
  articleType,
  isCompleted,
  videoUrl,
  videoDuration,
  isPremium = false,
}: ArticleItemProps) {
  const navigate = useNavigate();
  const { canAccessContent } = useSubscriptionContext();

  // プレミアムコンテンツで未契約の場合、ロック状態
  const isLocked = isPremium && !canAccessContent(isPremium);

  const durationSeconds =
    typeof videoDuration === "number" ? videoDuration : Number(videoDuration);
  const hasValidDuration = Number.isFinite(durationSeconds) && durationSeconds > 0;
  const isVideo =
    (typeof videoUrl === "string" && videoUrl.trim().length > 0) || hasValidDuration;

  // 動画時間をmm:ss形式に変換（不正値は null）
  const formatDuration = (seconds: number): string | null => {
    if (!Number.isFinite(seconds) || seconds <= 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  // サムネイルURL取得
  const getThumbnailUrl = () => {
    if (thumbnailUrl) return thumbnailUrl;
    if (thumbnail?.asset?._ref) {
      return urlFor(thumbnail).width(160).height(90).url();
    }
    return null;
  };

  const handleClick = () => {
    navigate(`/articles/${slug}`);
  };

  const imageUrl = getThumbnailUrl();

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-4 px-8 py-4 border-b border-black/[0.08] cursor-pointer hover:bg-gray-50 transition w-full"
    >
      {/* 1. 番号 or チェック */}
      {isCompleted ? (
        <div className="size-4 rounded-full bg-gradient-to-b from-[rgba(255,75,111,0.68)] to-[rgba(38,119,143,0.68)] backdrop-blur-[2px] flex items-center justify-center flex-shrink-0">
          <Check className="size-2.5 text-white" strokeWidth={2.5} />
        </div>
      ) : (
        <div className="size-4 flex items-center justify-center flex-shrink-0">
          <span className="font-rounded-mplus font-bold text-[13px] text-[#414141] text-center leading-none">
            {articleNumber}
          </span>
        </div>
      )}

      {/* 2. サムネイル */}
      <div className="relative w-20 h-[45px] rounded-[6px] overflow-hidden bg-[#e0dfdf] flex-shrink-0">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* タイプアイコン（中央配置）: videoUrl があれば動画、それ以外はテキスト */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isVideo ? (
            <div className="size-4 bg-white rounded-full flex items-center justify-center">
              <Play
                size={12}
                className="w-3 h-3"
                variant="Linear"
                color="#17102d"
              />
            </div>
          ) : (
            <div className="bg-white/[0.72] rounded-[3px] box-border h-4 w-4 p-px flex items-center justify-center">
              <FileText
                size={12}
                style={{ width: 12, height: 12 }}
                variant="Linear"
                color="#111827"
              />
            </div>
          )}
        </div>

        {/* 動画時間バッジ（時間が取れている場合のみ） */}
        {hasValidDuration && (
          <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 pt-1 pb-[5px] rounded-[3px] h-fit w-fit overflow-visible leading-[100%] flex flex-wrap">
            <span className="text-[8px] text-white font-noto-sans-jp leading-none h-fit w-fit">
              {formatDuration(durationSeconds)}
            </span>
          </div>
        )}
      </div>

      {/* 3. タイトルエリア */}
      <div className="flex-1 flex items-center justify-between overflow-hidden">
        <div className="flex flex-col gap-1">
          {/* タグ + ロックアイコン */}
          <div className="flex items-center gap-1.5">
            {articleType && <ArticleTag type={articleType} />}
            {isLocked && (
              <Lock className="size-3 text-gray-400" strokeWidth={2} />
            )}
          </div>
          {/* タイトル */}
          <span className="font-noto-sans-jp font-medium text-[14px] text-[#1e1b1b] leading-[20px]">
            {title}
          </span>
        </div>

        {/* 4. 右矢印 */}
        <div className="size-5 border border-black/[0.32] rounded-full backdrop-blur-[2.5px] flex items-center justify-center flex-shrink-0">
          <ChevronRight className="size-[15px] text-black/50" />
        </div>
      </div>
    </div>
  );
}
