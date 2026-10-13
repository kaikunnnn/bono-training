/**
 * テンプレート＝全コース共通: 進捗の計算（純粋関数）— #241
 *
 * 構造: コース < ステップ < レッスン < 記事。進み具合は記事数で数える。
 * 未制作レッスン（記事がない）は計算に入れない。
 */

import type { Course, LessonMap, ProgressMock } from "../data/types";

export type StepStatus = "done" | "current" | "todo";

export interface LessonProgress {
  done: number;
  total: number;
}

export interface StepProgress {
  status: StepStatus;
  lessonsDone: number;
  /** 既存レッスンだけの数 */
  lessonsTotal: number;
  articlesDone: number;
  articlesTotal: number;
}

export interface CourseProgress {
  lessons: Record<string, LessonProgress>;
  steps: StepProgress[];
  articlesDone: number;
  articlesTotal: number;
  percent: number;
  /** 続きから再開する場所 */
  resume: { slug: string; title: string; articleNumber: number } | null;
}

export function computeProgress(
  course: Course,
  lessons: LessonMap,
  mock: ProgressMock
): CourseProgress {
  const lessonProgress: Record<string, LessonProgress> = {};
  let resume: CourseProgress["resume"] = null;

  const raw = course.steps.map((step) => {
    let lessonsDone = 0;
    let lessonsTotal = 0;
    let articlesDone = 0;
    let articlesTotal = 0;
    for (const item of step.items) {
      if (item.type !== "lesson") continue;
      const lesson = lessons[item.slug];
      const total = lesson?.articleCount ?? 0;
      if (total === 0) continue;
      const m = mock[item.slug] ?? 0;
      const done = m === "all" ? total : m === "half" ? Math.ceil(total / 2) : Math.min(m, total);
      lessonProgress[item.slug] = { done, total };
      lessonsTotal += 1;
      if (done === total) lessonsDone += 1;
      articlesDone += done;
      articlesTotal += total;
      if (!resume && done < total && lesson) {
        resume = { slug: item.slug, title: lesson.title, articleNumber: done + 1 };
      }
    }
    return { lessonsDone, lessonsTotal, articlesDone, articlesTotal };
  });

  let currentFound = false;
  const steps: StepProgress[] = raw.map((r) => {
    const complete = r.lessonsTotal > 0 && r.lessonsDone === r.lessonsTotal;
    let status: StepStatus = "todo";
    if (complete) status = "done";
    else if (!currentFound) {
      status = "current";
      currentFound = true;
    }
    return { ...r, status };
  });

  const articlesDone = raw.reduce((sum, r) => sum + r.articlesDone, 0);
  const articlesTotal = raw.reduce((sum, r) => sum + r.articlesTotal, 0);
  return {
    lessons: lessonProgress,
    steps,
    articlesDone,
    articlesTotal,
    percent: articlesTotal ? Math.round((articlesDone / articlesTotal) * 100) : 0,
    resume,
  };
}
