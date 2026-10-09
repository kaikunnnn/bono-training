/**
 * レッスンカード描画ヘルパー
 *
 * mainブランチの renderLessonCard (lines 465-503) からコピー
 * Next.js適応: motion.div → 静的div、navigate → Link
 */

import { urlFor } from "@/lib/sanity";
import type { Lesson } from "@/types/sanity";
import { LessonCard } from "@/components/lessons/LessonCard";
import { IntentPrefetchLink } from "@/components/common/IntentPrefetchLink";
import { HomeClickLink } from "@/components/analytics/HomeClickLink";
import type { HomeClickTracking } from "@/lib/activity-utils";

interface LessonCardRendererProps {
  lesson: Lesson & { index?: number };
  imageLoading?: "lazy" | "eager";
  /** 指定時はクリックを計測する（#232 home_click。/top のレッスン特集用）。未指定なら従来どおり */
  tracking?: HomeClickTracking;
}

/**
 * レッスンカードをレンダリングする Server Component
 * mainブランチの renderLessonCard に対応
 */
export function LessonCardRenderer({ lesson, imageLoading, tracking }: LessonCardRendererProps) {
  const categoryValue = lesson.tags?.[0] || "";

  const thumbnailUrl =
    lesson.iconImageUrl ||
    (lesson.iconImage
      ? urlFor(lesson.iconImage).width(216).height(326).url()
      : null) ||
    lesson.thumbnailUrl ||
    (lesson.thumbnail
      ? urlFor(lesson.thumbnail).width(600).height(450).url()
      : null) ||
    "";

  const card = (
    <LessonCard
      imageLoading={imageLoading}
      lesson={{
        id: lesson._id,
        title: lesson.title,
        description: lesson.description || "",
        category: categoryValue,
        thumbnail: thumbnailUrl,
        slug: lesson.slug.current,
      }}
    />
  );

  return (
    <div
      className="w-[232px] flex-shrink-0 sm:w-auto animate-fade-in-up"
      style={{ animationDelay: `${(lesson.index ?? 0) * 60}ms` }}
    >
      {tracking ? (
        <HomeClickLink
          href={`/lessons/${lesson.slug.current}`}
          className="block h-full"
          tracking={tracking}
          intentPrefetch
        >
          {card}
        </HomeClickLink>
      ) : (
        <IntentPrefetchLink
          href={`/lessons/${lesson.slug.current}`}
          className="block h-full"
        >
          {card}
        </IntentPrefetchLink>
      )}
    </div>
  );
}
