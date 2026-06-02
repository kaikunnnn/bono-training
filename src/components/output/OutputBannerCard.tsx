/**
 * OutputBannerCard — 横長バナー型 OutputCard
 *
 * 参考: ユーザー指定の横長カード（aspect 2:1〜近く、2列グリッド）。
 * サムネを大きく見せつつメタ情報を残す、Pinterest/Behanceに近いスタイル。
 */

import Image from "next/image";

export interface OutputBannerCardProps {
  title: string;
  thumbnailUrl: string;
  authorName: string;
  usedContent: {
    label: string;
    href: string;
  };
  publishedAt: string;
  externalUrl: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function OutputBannerCard({
  title,
  thumbnailUrl,
  authorName,
  usedContent,
  publishedAt,
  externalUrl,
}: OutputBannerCardProps) {
  return (
    <a
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <article className="bg-surface rounded-[20px] border border-gray-200/60 overflow-hidden shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-gray-300">
        {/* サムネ：横長 2:1 */}
        <div className="relative w-full aspect-[2/1] bg-muted-custom overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            unoptimized
          />
        </div>

        {/* テキスト部 */}
        <div className="p-4 sm:p-5">
          {/* タイトル */}
          <h3 className="text-sm sm:text-base font-bold text-text-primary font-rounded-mplus leading-snug line-clamp-2 group-hover:underline">
            {title}
          </h3>

          {/* メタ情報（1行・横並び・密度高め） */}
          <div className="flex items-center gap-2 mt-2 text-xs text-text-primary/60 font-noto-sans-jp">
            <span className="font-medium truncate">{authorName}</span>
            <span aria-hidden className="text-text-primary/30 flex-shrink-0">•</span>
            <span className="flex-shrink-0">{formatDate(publishedAt)}</span>
          </div>

          {/* 使ったコンテンツバッジ */}
          <div className="mt-2.5">
            <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-muted-custom text-text-primary/70 font-noto-sans-jp">
              {usedContent.label}
            </span>
          </div>
        </div>
      </article>
    </a>
  );
}
