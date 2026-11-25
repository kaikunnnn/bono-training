import "server-only";

/**
 * 「学んだ」の判定（learned.ts）に使う、レッスンと記事のつながりを Sanity から読む（327-D）。
 * 分析側（supabase_fetch.fetch_public_lessons ＋ lessons_with_article_quests）と同じ範囲:
 * - 公開（下書きでない・isHidden != true）のレッスンの quests[]->articles[]
 * - 記事側から quest->lesson でつながる記事
 * 読めなかったら例外を投げる（呼び出し側は「送らない」に倒す）。
 */
import { client as getSanityClient } from "@/lib/sanity";
import { buildLessonIndex, type ArticleLessonLink, type LessonIndex, type LessonSource } from "./learned";

const LESSONS_QUERY = `*[_type=="lesson" && !(_id in path("drafts.**")) && isHidden != true]{
  "lessonId": _id,
  "articleIds": quests[]->articles[]->_id
}`;

const ARTICLE_LINKS_QUERY = `*[_type=="article" && !(_id in path("drafts.**")) && defined(quest)]{
  "articleId": _id,
  "lessonId": quest->lesson._ref
}`;

export async function loadLessonIndexFromSanity(): Promise<LessonIndex> {
  const sanity = getSanityClient();
  const [lessons, links] = await Promise.all([
    sanity.fetch<LessonSource[] | null>(LESSONS_QUERY),
    sanity.fetch<ArticleLessonLink[] | null>(ARTICLE_LINKS_QUERY),
  ]);
  if (!Array.isArray(lessons) || lessons.length === 0) throw new Error("lesson index empty");
  return buildLessonIndex(
    lessons.map((l) => ({ lessonId: l.lessonId, articleIds: Array.isArray(l.articleIds) ? l.articleIds : [] })),
    Array.isArray(links) ? links : [],
  );
}
