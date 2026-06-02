import Image from "next/image";

export interface OutputCardProps {
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

export default function OutputCard({
  title,
  thumbnailUrl,
  authorName,
  usedContent,
  publishedAt,
  externalUrl,
}: OutputCardProps) {
  return (
    <a
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <article className="bg-surface rounded-[20px] sm:rounded-[24px] overflow-hidden border-4 border-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-[1.02] group-hover:shadow-md">
        {/* サムネ画像 */}
        <div className="bg-muted-custom rounded-[16px] sm:rounded-[20px] overflow-hidden w-full aspect-[3/2] relative">
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* テキストコンテンツ */}
        <div className="p-4 sm:p-5">
          {/* タイトル */}
          <h3 className="text-sm sm:text-base font-bold text-text-primary font-rounded-mplus leading-[1.5] line-clamp-2">
            {title}
          </h3>

          {/* 投稿者 + 日付 */}
          <div className="flex items-center gap-2 text-xs text-text-primary/60 font-noto-sans-jp mt-2">
            <span>{authorName}</span>
            <span aria-hidden>•</span>
            <span>{formatDate(publishedAt)}</span>
          </div>

          {/* 使ったコンテンツバッジ */}
          <div className="mt-3">
            <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-muted-custom text-text-primary/70 font-noto-sans-jp">
              {usedContent.label}
            </span>
          </div>
        </div>
      </article>
    </a>
  );
}
