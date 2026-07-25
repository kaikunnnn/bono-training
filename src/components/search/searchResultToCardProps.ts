import {
  SearchResult,
  isLessonResult,
  isArticleResult,
  isGuideResult,
} from "@/types/search";
import type {
  HorizontalContentCardProps,
  HorizontalCardVariant,
} from "./HorizontalContentCard";

/** SearchResult から HorizontalContentCard の href を解決 */
export const resolveSearchResultHref = (r: SearchResult): string => {
  switch (r.type) {
    case "lesson":
      return `/lessons/${r.slug}`;
    case "article":
      if (isArticleResult(r) && r.parentLessonSlug) {
        return `/lessons/${r.parentLessonSlug}/${r.slug}`;
      }
      return `/articles/${r.slug}`;
    case "guide":
      return `/guide/${r.slug}`;
    case "roadmap":
      return `/roadmaps/${r.slug}`;
    default:
      return "#";
  }
};

/**
 * SearchResult を HorizontalContentCard の props に変換
 * roadmap は HorizontalContentCard が受けないので null を返す
 */
export const searchResultToCardProps = (
  r: SearchResult
): HorizontalContentCardProps | null => {
  if (r.type === "roadmap") return null;

  const variant = r.type as HorizontalCardVariant;
  const base = {
    variant,
    href: resolveSearchResultHref(r),
    title: r.title,
    description: r.description,
    thumbnailUrl: r.thumbnail,
    isPremium: r.isPremium,
  } as const;

  if (isLessonResult(r)) {
    return {
      ...base,
      variant: "lesson",
      category: r.category,
      lessonCount: r.lessonCount,
      linkedRoadmaps: r.linkedRoadmaps,
    };
  }
  if (isArticleResult(r)) {
    return {
      ...base,
      variant: "article",
      parentLessonTitle: r.parentLessonTitle,
      readingTime: r.readingTime,
    };
  }
  if (isGuideResult(r)) {
    return {
      ...base,
      variant: "guide",
      author: r.author ? { name: r.author } : undefined,
      publishedDate: r.publishedAt,
      category: r.category,
    };
  }
  return null;
};
