/**
 * data ＝ レッスンの実データを Sanity から slug でまとめて引く — #241
 *
 * 取得に失敗した・見つからない slug は null にして返す（画面では灰色の表紙＋slug で出す）。
 */

import "server-only";
import { client } from "@/lib/sanity";
import type { LessonMap, ResolvedLesson } from "./types";

interface Row {
  slug: string;
  title: string | null;
  iconImageUrl: string | null;
  description: string | null;
  purposes: string[] | null;
  questCount: number | null;
  articleCount: number | null;
  durations: (string | null)[] | null;
}

/** "MM:SS" / "HH:MM:SS" / 秒数 → 秒。読めないものは null */
function toSeconds(value: string | number | null): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parts = value.trim().split(":").map((p) => Number(p));
  if (parts.length < 2 || parts.some((n) => !Number.isFinite(n))) return null;
  return parts.reduce((sum, n) => sum * 60 + n, 0);
}

const QUERY = `*[_type == "lesson" && slug.current in $slugs]{
  "slug": slug.current,
  title,
  "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url),
  description,
  purposes,
  "questCount": count(quests),
  "articleCount": count(quests[]->articles[]),
  "durations": quests[]->articles[]->videoDuration
}`;

/** 記事の videoDuration を合計（取れた記事だけ）。1本も取れなければ null */
function videoTime(durations: (string | number | null)[] | null) {
  const secs = (durations ?? []).map(toSeconds).filter((s): s is number => s !== null);
  return {
    videoMinutes: secs.length > 0 ? Math.round(secs.reduce((a, b) => a + b, 0) / 60) : null,
    videoTimedCount: secs.length,
  };
}

export async function fetchLessons(slugs: string[]): Promise<LessonMap> {
  const map: LessonMap = Object.fromEntries(slugs.map((slug) => [slug, null]));
  if (slugs.length === 0) return map;

  try {
    const rows = await client().fetch<Row[]>(QUERY, { slugs });
    for (const row of rows) {
      const lesson: ResolvedLesson = {
        slug: row.slug,
        title: (row.title ?? row.slug).trim(),
        iconImageUrl: row.iconImageUrl,
        description: row.description?.trim() || null,
        purposes: (row.purposes ?? []).filter(Boolean),
        questCount: row.questCount ?? 0,
        articleCount: row.articleCount ?? 0,
        ...videoTime(row.durations),
      };
      map[row.slug] = lesson;
    }
  } catch (error) {
    console.error("[dev/course-pages] Sanity からのレッスン取得に失敗", error);
  }
  return map;
}
