/**
 * 「続きから」カード（ContinueCourseCard）に渡すモックを組み立てる（#243 トピック5）
 *
 * 会員の状態: 転職ロードマップの途中で、基礎コース（見た目）を進めている。
 * ほかに AI のコースも少し進めている。進み具合は data/progress-mock.ts と同じ。
 * 次の記事のタイトル・画像は Sanity の実データ（member-mock と同じ取得）。ログインもDB書き込みもしない。
 */

import "server-only";
import { cache } from "react";
import { getCourse, lessonSlugs, progressMocks } from "../../data";
import { careerChangeV3 } from "../../data/roadmap-career-change-v3";
import { fetchLessons } from "../../data/sanity-lessons";
import type { Course, LessonMap } from "../../data/types";
import { computeProgress, type CourseProgress } from "../../template/progress";
import { splitTitle } from "../../template/shared";
import { fetchMemberMock } from "./applied/mypage/member-mock";
import type { ContinueCardData } from "./ContinueCourseCard";
import { ROADMAP_BASE } from "./parts";

/** 主に進めているコース・ほかに進めているコース */
const PRIMARY = "ui-design-visual";
const OTHERS = ["ai-ui-design"];

export const COURSE_V2 = "/dev/course-pages/v2";

/** コースの進み具合（レッスン単位: 全記事を終えたレッスンの数） */
export function courseSummary(course: Course, progress: CourseProgress) {
  const entries = Object.values(progress.lessons);
  return {
    title: splitTitle(course.title.text).main,
    href: `${COURSE_V2}/${course.slug}?started=1`,
    lessonsDone: entries.filter((l) => l.done === l.total).length,
    lessonsTotal: entries.length,
    percent: progress.percent,
  };
}

/** 行き先のいまここ（ロードマップは選ばせず、終えたコースから自動で出す想定） */
export function roadmapLine(done: number = careerChangeV3.progressDone) {
  return {
    label: "転職ロードマップの",
    done,
    total: careerChangeV3.stages.length,
    href: `${ROADMAP_BASE}/career-change-v3?progress=1`,
  };
}

/** 次に進める記事（レッスンの done+1 本目）。取れなければ null */
export async function fetchNextArticle(lessonSlug: string, done: number) {
  const member = await fetchMemberMock(lessonSlug, done);
  const lesson = member.inProgress[0];
  const article = lesson?.firstIncompleteArticle;
  if (!lesson || !article) return { next: null, member };
  return {
    next: {
      lessonTitle: lesson.title,
      articleTitle: article.title,
      articleNumber: done + 1,
      href: `/contents/${article.slug}`,
      thumbnailUrl: lesson.iconImageUrl ?? null,
    },
    member,
  };
}

/** ホーム・マイページ・placement で使う、進行中の会員のモック一式 */
export const fetchContinueMock = cache(async () => {
  const primary = getCourse(PRIMARY)!;
  const others = OTHERS.map((s) => getCourse(s)).filter((c): c is Course => Boolean(c));
  const lessons: LessonMap = await fetchLessons([primary, ...others].flatMap(lessonSlugs));

  const progress = computeProgress(primary, lessons, progressMocks[primary.slug] ?? {});
  const resumeSlug = progress.resume?.slug ?? lessonSlugs(primary)[0];
  const resumeDone = progress.lessons[resumeSlug]?.done ?? 0;
  const { next, member } = await fetchNextArticle(resumeSlug, resumeDone);

  const card: ContinueCardData = {
    course: courseSummary(primary, progress),
    next,
    roadmap: roadmapLine(),
    others: others.map((c) => {
      const p = computeProgress(c, lessons, progressMocks[c.slug] ?? {});
      return { ...courseSummary(c, p) };
    }),
  };

  return { card, member, primary, lessons };
});
