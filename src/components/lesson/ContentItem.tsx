import { useNavigate } from "react-router-dom";
import { urlFor } from "@/lib/sanity";

interface ContentItemProps {
  articleNumber: number; // ランタイムで付与
  title: string;
  slug: string;
  thumbnail?: any;
  videoDuration?: number;
}

export default function ContentItem({
  articleNumber,
  title,
  slug,
  thumbnail,
  videoDuration,
}: ContentItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/articles/${slug}`);
  };

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
      {thumbnail && (
        <div className="flex-shrink-0">
          <img
            src={urlFor(thumbnail).width(57).height(32).url()}
            alt={title}
            className="w-[57px] h-[32px] object-cover rounded-[3.17px] bg-lesson-item-thumbnail-bg"
          />
        </div>
      )}

      {/* タイトルと動画時間 */}
      <div className="flex-1 min-w-0">
        <p className="font-noto-sans-jp text-sm text-lesson-item-title font-medium truncate">
          {title}
        </p>
        {videoDuration && (
          <p className="font-geist text-xs text-lesson-item-duration mt-0.5">
            {videoDuration}分
          </p>
        )}
      </div>
    </div>
  );
}
