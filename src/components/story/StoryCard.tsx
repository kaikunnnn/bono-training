import Link from "next/link";
import Image from "next/image";

export interface StoryCardProps {
  slug: string;
  title: string;
  excerpt: string;
  heroImageUrl: string;
  categoryLabel: string;
  tags: string[];
  person: {
    name: string;
    profileImageUrl?: string;
    currentRole: string;
  };
}

export default function StoryCard({
  slug,
  title,
  excerpt,
  heroImageUrl,
  categoryLabel,
  tags,
  person,
}: StoryCardProps) {
  return (
    <Link href={`/stories/${slug}`} className="group block">
      <article className="bg-surface rounded-[24px] sm:rounded-[32px] overflow-hidden border-4 border-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-[1.02] group-hover:shadow-md">
        {/* アイキャッチ画像 */}
        <div className="bg-muted-custom rounded-[20px] sm:rounded-[28px] overflow-hidden w-full aspect-[16/9] relative">
          <Image
            src={heroImageUrl}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* テキストコンテンツ */}
        <div className="p-5 sm:p-6">
          {/* カテゴリラベル */}
          <span className="inline-block text-[10px] sm:text-xs font-bold text-text-primary/60">
            {categoryLabel}
          </span>

          {/* タイトル */}
          <h3 className="text-base sm:text-lg font-bold text-text-primary font-rounded-mplus leading-[1.6] mt-1 line-clamp-2">
            {title}
          </h3>

          {/* リード文 */}
          <p className="text-sm text-text-primary/70 font-noto-sans-jp mt-2 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>

          {/* 人物プロフィール */}
          <div className="flex items-center gap-3 mt-4">
            {person.profileImageUrl && (
              <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-muted-custom">
                <Image
                  src={person.profileImageUrl}
                  alt={person.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-primary leading-tight font-noto-sans-jp">
                {person.name}
              </p>
              <p className="text-xs text-text-primary/60 truncate font-noto-sans-jp mt-0.5">
                {person.currentRole}
              </p>
            </div>
          </div>

          {/* タグ */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-muted-custom text-text-primary/70 font-noto-sans-jp"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
