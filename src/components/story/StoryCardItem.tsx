/**
 * StoryCardItem — 受講者ストーリー一覧用カード（本番版・現状版/全要素入り）
 *
 * BON-327 採用: 現状版（8要素）
 *   1. アイキャッチ画像
 *   2. カテゴリラベル
 *   3. タイトル
 *   4. リード文（excerpt）
 *   5. プロフィール画像
 *   6. 人物名
 *   7. 現在の職種
 *   8. タグ
 *
 * Sanity の StorySummary をそのまま受ける。
 */

import Link from "next/link";
import Image from "next/image";
import type { StorySummary } from "@/types/sanity";

interface StoryCardItemProps {
  story: StorySummary;
}

const FALLBACK_HERO = "/placeholder-thumbnail.svg";

export default function StoryCardItem({ story }: StoryCardItemProps) {
  const heroUrl = story.heroImageUrl || FALLBACK_HERO;

  return (
    <Link href={`/stories/${story.slug.current}`} className="group block">
      <article className="bg-surface rounded-[24px] sm:rounded-[32px] overflow-hidden border-4 border-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-[1.02] group-hover:shadow-md">
        {/* アイキャッチ画像 */}
        <div className="bg-muted-custom rounded-[20px] sm:rounded-[28px] overflow-hidden w-full aspect-[16/9] relative">
          <Image
            src={heroUrl}
            alt={story.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="p-5 sm:p-6">
          {/* カテゴリラベル */}
          {story.categoryLabel && (
            <span className="inline-block text-[10px] sm:text-xs font-bold text-text-primary/60">
              {story.categoryLabel}
            </span>
          )}

          {/* タイトル */}
          <h3 className="text-base sm:text-lg font-bold text-text-primary font-rounded-mplus leading-[1.6] mt-1 line-clamp-2">
            {story.title}
          </h3>

          {/* 人物プロフィール */}
          <div className="flex items-center gap-3 mt-4">
            {story.person.profileImageUrl && (
              <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-muted-custom">
                <Image
                  src={story.person.profileImageUrl}
                  alt={story.person.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-primary leading-tight font-noto-sans-jp">
                {story.person.name}
              </p>
              {story.person.currentRole && (
                <p className="text-xs text-text-primary/60 truncate font-noto-sans-jp mt-0.5">
                  {story.person.currentRole}
                </p>
              )}
            </div>
          </div>

          {/* タグ */}
          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {story.tags.map((tag) => (
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
