/**
 * #295 の試作が使う Sanity データ（読むだけ）。
 * スラッグが解決できないものは結果から外してログを出す（クラッシュも黙殺もしない）。
 */

import "server-only";

import { unstable_cache } from "next/cache";
import { client } from "@/lib/sanity";
import type { SanityReferenceContent } from "@/types/sanity-roadmap";
import {
  AI_LESSON_SLUGS,
  FIGMA_LESSON_SLUGS,
  FIRST_ONE_DEFS,
  FREE_START_LESSON_SLUG,
  MEMBER_EXAMPLE,
  type FirstOneView,
} from "./guide-utils";

interface RawLesson extends SanityReferenceContent {
  articles?: Array<{ isPremium?: boolean } | null> | null;
}

interface RawGuide {
  title: string;
  slug: string;
}

export interface GuideData {
  /** ステップの _key → 最初の1本 */
  firstOnes: Record<string, FirstOneView>;
  /** AI のステップに並べるレッスン */
  aiLessons: SanityReferenceContent[];
  /** Figma のステップの4レッスンの本数。1つでも欠けたら null（数字を出さない） */
  figmaArticles: { total: number; free: number } | null;
  /** ヒーローの「無料で始める」の行き先 */
  freeStart: FirstOneView | null;
  /** K の例示の「次の1本」 */
  memberLesson: FirstOneView | null;
}

const EMPTY: GuideData = { firstOnes: {}, aiLessons: [], figmaArticles: null, freeStart: null, memberLesson: null };

const fetchRaw = unstable_cache(
  async (lessonSlugs: string[], guideSlugs: string[]) =>
    client().fetch<{ lessons: RawLesson[]; guides: RawGuide[] }>(
      `{
        "lessons": *[_type == "lesson" && slug.current in $lessonSlugs && isHidden != true && !(_id in path("drafts.**"))] {
          _id,
          _type,
          title,
          slug,
          description,
          "thumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
          "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url),
          "articles": quests[]->articles[]->{ isPremium }
        },
        "guides": *[_type == "guide" && slug.current in $guideSlugs && !(_id in path("drafts.**"))] {
          title,
          "slug": slug.current
        }
      }`,
      { lessonSlugs, guideSlugs }
    ),
  ["dev:roadmap-career-patterns:guide"],
  { tags: ["lesson", "guide"], revalidate: 3600 }
);

function countArticles(lesson: RawLesson) {
  const articles = (lesson.articles ?? []).filter((a) => a !== null);
  return { total: articles.length, free: articles.filter((a) => !a.isPremium).length };
}

function toLessonView(lesson: RawLesson): FirstOneView {
  const { total, free } = countArticles(lesson);
  return {
    kind: "lesson",
    title: lesson.title.trim(),
    href: `/lessons/${lesson.slug.current}`,
    imageUrl: lesson.iconImageUrl || lesson.thumbnailUrl,
    articleCount: total,
    freeArticleCount: free,
  };
}

export async function loadGuideData(): Promise<GuideData> {
  const defs = Object.entries(FIRST_ONE_DEFS);
  const lessonSlugs = [
    ...new Set([
      ...defs.filter(([, d]) => d.kind === "lesson").map(([, d]) => d.slug),
      ...AI_LESSON_SLUGS,
      ...FIGMA_LESSON_SLUGS,
      FREE_START_LESSON_SLUG,
      MEMBER_EXAMPLE.lessonSlug,
    ]),
  ].sort();
  const guideSlugs = defs.filter(([, d]) => d.kind === "guide").map(([, d]) => d.slug);

  let raw: { lessons: RawLesson[]; guides: RawGuide[] };
  try {
    raw = await fetchRaw(lessonSlugs, guideSlugs);
  } catch (e) {
    console.warn("[dev/roadmap-career-patterns] 最初の1本の取得に失敗", e);
    return EMPTY;
  }

  const lessonBySlug = new Map(raw.lessons.map((l) => [l.slug.current, l]));
  const findLesson = (slug: string) => {
    const lesson = lessonBySlug.get(slug);
    if (!lesson) console.warn(`[dev/roadmap-career-patterns] レッスンが見つかりません: ${slug}`);
    return lesson;
  };

  const firstOnes: Record<string, FirstOneView> = {};
  for (const [stepKey, def] of defs) {
    if (def.kind === "guide") {
      const guide = raw.guides.find((g) => g.slug === def.slug);
      if (guide) {
        firstOnes[stepKey] = { kind: "guide", title: guide.title, href: `/guide/${guide.slug}` };
      } else {
        console.warn(`[dev/roadmap-career-patterns] 解説記事が見つかりません: ${def.slug}`);
      }
      continue;
    }
    const lesson = findLesson(def.slug);
    if (lesson) firstOnes[stepKey] = toLessonView(lesson);
  }

  const aiLessons = AI_LESSON_SLUGS.flatMap((slug): SanityReferenceContent[] => {
    const lesson = findLesson(slug);
    if (!lesson) return [];
    // articles はカードに不要なので渡さない
    return [
      {
        _id: lesson._id,
        _type: lesson._type,
        title: lesson.title.trim(),
        slug: lesson.slug,
        description: lesson.description,
        thumbnailUrl: lesson.thumbnailUrl,
        iconImageUrl: lesson.iconImageUrl,
      },
    ];
  });

  const figmaLessons = FIGMA_LESSON_SLUGS.map(findLesson);
  const figmaArticles = figmaLessons.every((l): l is RawLesson => l !== undefined)
    ? figmaLessons.reduce(
        (sum, l) => {
          const { total, free } = countArticles(l);
          return { total: sum.total + total, free: sum.free + free };
        },
        { total: 0, free: 0 }
      )
    : null;

  const freeStartLesson = findLesson(FREE_START_LESSON_SLUG);
  const memberLesson = findLesson(MEMBER_EXAMPLE.lessonSlug);

  return {
    firstOnes,
    aiLessons,
    figmaArticles,
    freeStart: freeStartLesson ? toLessonView(freeStartLesson) : null,
    memberLesson: memberLesson ? toLessonView(memberLesson) : null,
  };
}
