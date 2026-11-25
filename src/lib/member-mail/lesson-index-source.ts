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

/** Sanity の読み込みの時間切れ。cron は60秒で切られるので、待ち続けて送る時間を食わないようにする */
export const LESSON_INDEX_TIMEOUT_MS = 8_000;

/** 時間内に終わらなければ例外にする（呼び出し側は「送らない」に倒す） */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("lesson index timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function loadLessonIndexFromSanity(timeoutMs: number = LESSON_INDEX_TIMEOUT_MS): Promise<LessonIndex> {
  const sanity = getSanityClient();
  const [lessons, links] = await withTimeout(
    Promise.all([
      sanity.fetch<LessonSource[] | null>(LESSONS_QUERY),
      sanity.fetch<ArticleLessonLink[] | null>(ARTICLE_LINKS_QUERY),
    ]),
    timeoutMs,
  );
  if (!Array.isArray(lessons) || lessons.length === 0) throw new Error("lesson index empty");
  const index = buildLessonIndex(
    lessons.map((l) => ({ lessonId: l.lessonId, articleIds: Array.isArray(l.articleIds) ? l.articleIds : [] })),
    Array.isArray(links) ? links : [],
  );
  // 学習用の記事が1本も無い索引では、誰も「学んだ」にならず、学んだ人にも送ってしまう。読めなかった扱いにする
  if (index.learningOwners.size === 0) throw new Error("lesson index has no learning articles");
  return index;
}
