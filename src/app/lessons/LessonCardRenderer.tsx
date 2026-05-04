/**
 * レッスンカード描画ヘルパー
 *
 * mainブランチの renderLessonCard (lines 465-503) からコピー
 * Next.js適応: motion.div → 静的div、navigate → Link
 */

import Link from "next/link";
import { urlFor, type LessonWithArticleIds } from "@/lib/sanity";
import { LessonCard } from "@/components/lessons/LessonCard";

interface LessonCardRendererProps {
  lesson: LessonWithArticleIds & { index?: number };
}

/**
 * レッスンカードをレンダリングする Server Component
 * mainブランチの renderLessonCard に対応
 */
export function LessonCardRenderer({ lesson }: LessonCardRendererProps) {
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

  return (
    <div
      className="w-[232px] flex-shrink-0 sm:w-auto animate-fade-in-up"
      style={{ animationDelay: `${(lesson.index ?? 0) * 60}ms` }}
    >
      <Link href={`/lessons/${lesson.slug.current}`}>
        <LessonCard
          lesson={{
            id: lesson._id,
            title: lesson.title,
            description: lesson.description || "",
            category: categoryValue,
            thumbnail: thumbnailUrl,
            slug: lesson.slug.current,
          }}
        />
      </Link>
    </div>
  );
}
