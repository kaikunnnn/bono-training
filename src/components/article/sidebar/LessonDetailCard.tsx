import { Link } from "react-router-dom";
import { urlFor } from "@/lib/sanity";
import type { SanityImage } from "@/types/sanity";

interface LessonDetailCardProps {
  iconUrl?: string;
  icon?: SanityImage;
  title: string;
  progress: number;
  href?: string;
}

/**
 * LessonDetailCard コンポーネント
 * レッスンの進捗状況を表示するカード。ArticleDetailページのサイドバーで使用。
 *
 * Figma仕様（SIDEBAR-SPEC.md準拠）:
 * - 幅: 304px（レスポンシブ対応でw-full）
 * - 背景: #FFFFFF
 * - border: 1px solid rgba(0,0,0,0.08)
 * - 角丸: 20px
 * - padding: 24px / 20px / 20px
 */
export function LessonDetailCard({
  iconUrl,
  icon,
  title,
  progress,
  href,
}: LessonDetailCardProps) {
  // 画像URL取得
  const imageUrl = iconUrl || (icon ? urlFor(icon).width(120).height(180).url() : null);

  const content = (
    <div className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-[20px] overflow-hidden pt-6 pb-5 px-5 flex flex-col items-start">
      <div className="w-full h-[140px] flex flex-col items-center justify-center gap-4">
        {/* アイコン */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="aspect-[276/417] w-12 h-full flex-1 rounded-tr-[4px] rounded-br-[4px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.19)] object-cover"
          />
        ) : (
          <div className="aspect-[276/417] flex-1 bg-gray-200 rounded-tr-[4px] rounded-br-[4px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.19)] flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}

        {/* 情報エリア */}
        <div className="w-full flex flex-col items-center gap-[9px]">
          {/* タイトル */}
          <p className="w-full text-center text-black text-[14px] font-bold font-rounded-mplus underline leading-[1.28] line-clamp-2">
            {title}
          </p>

          {/* プログレスバー */}
          <div className="w-full px-8 flex items-center gap-[9px]">
            {/* バー */}
            <div className="flex-1 h-[7px] bg-[#eaeaea] rounded-full overflow-hidden">
              <div
                className="h-full bg-black rounded-[40px] transition-all duration-400"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>

            {/* パーセント */}
            <div className="flex items-end text-black font-bold font-rounded-mplus">
              <span className="text-2xl tracking-[-0.48px] leading-none">
                {progress}
              </span>
              <span className="text-[10px] leading-none">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

export default LessonDetailCard;
