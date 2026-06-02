/**
 * StoryCard パターンB — 中庸（4要素）★推し
 * 画像 + タイトル + 人物名 + 職種
 */
import Link from "next/link";
import Image from "next/image";

interface StoryCardPatternBProps {
  slug: string;
  title: string;
  heroImageUrl: string;
  person: { name: string; currentRole: string };
}

export default function StoryCardPatternB({
  slug,
  title,
  heroImageUrl,
  person,
}: StoryCardPatternBProps) {
  return (
    <Link href={`/stories/${slug}`} className="group block">
      <article className="bg-surface rounded-[24px] sm:rounded-[32px] overflow-hidden border-4 border-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-[1.02] group-hover:shadow-md">
        <div className="bg-muted-custom rounded-[20px] sm:rounded-[28px] overflow-hidden w-full aspect-[16/9] relative">
          <Image src={heroImageUrl} alt={title} fill className="object-cover" unoptimized />
        </div>
        <div className="p-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-text-primary font-rounded-mplus leading-[1.6] line-clamp-2">
            {title}
          </h3>
          <div className="mt-3">
            <p className="text-sm font-bold text-text-primary font-noto-sans-jp">
              {person.name}
            </p>
            <p className="text-xs text-text-primary/60 font-noto-sans-jp mt-0.5 truncate">
              {person.currentRole}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
