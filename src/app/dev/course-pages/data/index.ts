/**
 * data ＝ コースの一覧（slug → Course）— #241
 *
 * コースを足すときは data/<slug>.ts を作って courses に1行足すだけ。
 * 今回は AI コースのみ。残り3つは一覧で「準備中」として出す。
 */

import { aiUiDesignCourse } from "./ai-ui-design";
import { aiUiDesignProgressMock } from "./progress-mock";
import type { Course, CourseItem, LessonRef, ProgressMock } from "./types";

export const courses: Record<string, Course> = {
  [aiUiDesignCourse.slug]: aiUiDesignCourse,
};

/** データ未投入のコース（一覧で「準備中」カードとして出す。名前はオーナー決定済み） */
export const upcomingCourses: { title: string; shortTitle: string }[] = [
  {
    title: "はじめてのUIデザイン入門コース：画面の見た目と構造の基本",
    shortTitle: "はじめてのUIデザイン入門",
  },
  {
    title: "UIデザイン基礎コース：見た目（ビジュアル）のつくり方",
    shortTitle: "UIデザイン基礎",
  },
  {
    title: "UI体験デザイン基礎コース：操作性・画面遷移・ナビゲーション",
    shortTitle: "UI体験デザイン基礎",
  },
];

/** 「進行中の会員」表示用の進捗モック（コースごと） */
export const progressMocks: Record<string, ProgressMock> = {
  [aiUiDesignCourse.slug]: aiUiDesignProgressMock,
};

export function getCourse(slug: string): Course | null {
  return courses[slug] ?? null;
}

export function allItems(course: Course): CourseItem[] {
  return course.steps.flatMap((step) => step.items);
}

/** Sanity から引く必要のある slug 一覧 */
export function lessonSlugs(course: Course): string[] {
  return allItems(course)
    .filter((item): item is LessonRef => item.type === "lesson")
    .map((item) => item.slug);
}
