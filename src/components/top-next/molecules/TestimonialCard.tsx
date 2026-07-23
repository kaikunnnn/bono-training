import Link from "next/link";
import Image from "next/image";

/**
 * 写真＋タイトル＋アバター（新トップページ Figma Make HANDOFF由来 / CommunitySection「体験談」用）
 */
export interface TestimonialCardProps {
  image?: string;
  category: string;
  title: string;
  authorImage?: string;
  authorName: string;
  authorRole: string;
  href: string;
}

export function TestimonialCard({
  image,
  category,
  title,
  authorImage,
  authorName,
  authorRole,
  href,
}: TestimonialCardProps) {
  return (
    <Link href={href} className="group flex flex-col">
      <div className="relative h-[283px] w-full overflow-hidden bg-muted-custom">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
      </div>
      <div className="flex flex-col gap-3 pt-4">
        <p className="font-noto-sans-jp text-xs font-bold leading-4 text-text-primary/60">
          {category}
        </p>
        <h4
          className="line-clamp-2 overflow-hidden font-rounded-mplus text-[22px] font-normal leading-[1.6] tracking-[0.22px] text-text-primary transition-opacity duration-300 group-hover:opacity-70"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
        >
          {title}
        </h4>
        <div className="flex items-center gap-3">
          <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted-custom">
            {authorImage && (
              <Image src={authorImage} alt="" fill unoptimized className="object-cover" />
            )}
          </div>
          <div>
            <p className="font-noto-sans-jp text-sm font-bold leading-[17.5px] text-text-primary">
              {authorName}
            </p>
            <p className="font-noto-sans-jp text-xs font-normal leading-4 text-text-primary/60">
              {authorRole}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
