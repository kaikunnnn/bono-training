import Link from "next/link";
import { getCategoryInfo } from "@/lib/guideCategories";
import type { Guide } from "@/types/guide";
import { GuideCardImage } from "./GuideCardImage";

interface GuideCardProps {
  guide: Guide;
}

/**
 * ガイドカードメディア部分
 * サムネイル画像がある場合はそれを表示、ない場合はグラデーションプレースホルダー
 * ※ リスト表示では動画埋め込みではなくサムネイルを表示する
 */
function GuideCardMedia({ title, thumbnail }: { title: string; thumbnail?: string }) {
  return (
    <div className="w-full aspect-video rounded-3xl overflow-hidden bg-muted">
      {thumbnail ? (
        <GuideCardImage src={thumbnail} alt={title} />
      ) : (
        <GuideCardPlaceholder title={title} />
      )}
    </div>
  );
}

/**
 * サムネイルがない場合のプレースホルダー
 */
export function GuideCardPlaceholder({ title }: { title: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#e6e6ef] via-[#ede9f5] to-[#faf2ed]">
      <span className="text-[10px] font-bold tracking-[0.2em] text-foreground/30 uppercase">
        Guide Article
      </span>
      <p className="text-[13px] font-bold text-foreground/50 text-center px-6 line-clamp-2 leading-snug">
        {title}
      </p>
    </div>
  );
}

export function GuideCard({ guide }: GuideCardProps) {
  const categoryInfo = getCategoryInfo(guide.category);

  return (
    <Link href={`/guide/${guide.slug}`} className="group flex flex-col gap-5">
      <GuideCardMedia title={guide.title} thumbnail={guide.thumbnail} />

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2 text-balance group-hover:opacity-70 transition-opacity duration-200">
          {guide.title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {guide.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
              <span className="text-[8px] font-bold text-muted-foreground">
                {guide.author.charAt(0)}
              </span>
            </div>
            <span className="text-[13px] font-medium text-foreground">
              {guide.author}
            </span>
          </div>
          <span className="text-[13px] text-muted-foreground">
            {categoryInfo?.label ?? guide.category}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default GuideCard;
