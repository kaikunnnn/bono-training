/**
 * OutputListItem — 横長リスト型 OutputCard
 *
 * Zapier / Intercom / Substack の List view 風の横長カード。
 * 「流し読み・件数多い」アウトプット一覧に最適化。
 */

import Image from "next/image";

export interface OutputListItemProps {
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

export default function OutputListItem({
  title,
  thumbnailUrl,
  authorName,
  usedContent,
  publishedAt,
  externalUrl,
}: OutputListItemProps) {
  return (
    <a
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <article className="bg-surface rounded-[20px] border border-gray-200/60 overflow-hidden shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-gray-300">
        <div className="flex gap-4 sm:gap-6 p-3 sm:p-4">
          {/* サムネ（左・固定幅） */}
          <div className="relative w-24 sm:w-40 aspect-[4/3] flex-shrink-0 rounded-[12px] overflow-hidden bg-muted-custom">
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* テキスト（右・伸縮） */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
            {/* タイトル */}
            <h3 className="text-sm sm:text-base font-bold text-text-primary font-rounded-mplus leading-snug line-clamp-2 group-hover:underline">
              {title}
            </h3>

            {/* メタ情報（一行・密度高め） */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-primary/60 font-noto-sans-jp">
              <span className="font-medium">{authorName}</span>
              <span aria-hidden className="text-text-primary/30">•</span>
              <span>{formatDate(publishedAt)}</span>
            </div>

            {/* 使ったコンテンツバッジ */}
            <div>
              <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-muted-custom text-text-primary/70 font-noto-sans-jp">
                {usedContent.label}
              </span>
            </div>
          </div>

          {/* 外部リンクアイコン（PCのみ） */}
          <div className="hidden sm:flex items-start text-text-primary/30 group-hover:text-text-primary/60 transition-colors mt-2">
            <span aria-hidden className="text-lg">↗</span>
          </div>
        </div>
      </article>
    </a>
  );
}
