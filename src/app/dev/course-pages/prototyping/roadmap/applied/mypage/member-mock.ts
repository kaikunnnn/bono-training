/**
 * applied/mypage 用: 「未経験から転職」を選び、基礎コースの途中にいる会員のモック（#243）
 *
 * 本番マイページの各セクション（ProgressPreview / HistoryPreview）に渡す形を、
 * Sanity の実レッスン・実記事から組み立てる。ログインもDB書き込みもしない。
 * どこまで進んだかは data/progress-mock.ts と同じ（基礎: 2本目の記事9まで完了）。
 */

import "server-only";
import { client } from "@/lib/sanity";
import type { LessonWithProgress } from "@/app/mypage/sections/ProgressSectionClient";
import type { ViewedArticle } from "@/app/mypage/sections/HistorySectionClient";

interface Row {
  _id: string;
  title: string;
  slug: { current: string };
  iconImageUrl: string | null;
  articles: { _id: string; title: string; slug: { current: string } | null; resolvedThumbnailUrl: string | null }[] | null;
}

const QUERY = `*[_type == "lesson" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url),
  "articles": quests[]->articles[]->{
    _id,
    title,
    slug,
    "resolvedThumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url)
  }
}`;

export async function fetchMemberMock(
  lessonSlug: string,
  doneCount: number
): Promise<{ inProgress: LessonWithProgress[]; history: ViewedArticle[] }> {
  let row: Row | null = null;
  try {
    row = await client().fetch<Row | null>(QUERY, { slug: lessonSlug });
  } catch (error) {
    console.error("[dev/course-pages] マイページのモック用レッスン取得に失敗", error);
  }
  if (!row) return { inProgress: [], history: [] };

  const articles = (row.articles ?? []).filter((a) => a && a.slug?.current);
  const total = articles.length;
  const done = Math.min(doneCount, total);
  const next = articles[done] ?? null;

  const inProgress: LessonWithProgress[] = [
    {
      _id: row._id,
      title: row.title,
      slug: row.slug,
      iconImageUrl: row.iconImageUrl ?? undefined,
      progress: {
        lessonId: row._id,
        totalArticles: total,
        completedArticles: done,
        percentage: total > 0 ? Math.round((done / total) * 100) : 0,
        completedArticleIds: articles.slice(0, done).map((a) => a._id),
        lastUpdatedAt: null,
      },
      lessonStatus: "in_progress",
      firstIncompleteArticle: next ? { title: next.title, slug: next.slug!.current } : null,
    },
  ];

  // 閲覧履歴: 直近に見た記事（完了した最後の数本を新しい順に）
  const history: ViewedArticle[] = articles
    .slice(Math.max(0, done - 4), done)
    .reverse()
    .map((a) => ({
      _id: a._id,
      title: a.title,
      slug: a.slug!,
      resolvedThumbnailUrl: a.resolvedThumbnailUrl ?? undefined,
      questInfo: { lessonInfo: { title: row!.title } },
    }));

  return { inProgress, history };
}
