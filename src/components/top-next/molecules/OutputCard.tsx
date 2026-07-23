import Link from "next/link";
import Image from "next/image";

/**
 * 写真＋タイトルのみ（新トップページ Figma Make HANDOFF由来 / CommunitySection「アウトプット」用）
 */
export interface OutputCardProps {
  image?: string;
  title: string;
  href: string;
}

export function OutputCard({ image, title, href }: OutputCardProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col"
    >
      <div className="relative h-[230px] w-full overflow-hidden bg-muted-custom">
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
      <div className="pt-4">
        <h4
          className="line-clamp-2 overflow-hidden font-rounded-mplus text-[22px] font-normal leading-[1.6] tracking-[0.22px] text-text-primary transition-opacity duration-300 group-hover:opacity-70"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
        >
          {title}
        </h4>
      </div>
    </Link>
  );
}
