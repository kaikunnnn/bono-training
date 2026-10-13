/**
 * data ＝ コースの一覧（slug → Course）— #241
 *
 * コースを足すときは data/<slug>.ts を作って courses に1行足すだけ。
 * 一覧ページはこの並び順で出す。
 */

import { aiUiDesignCourse } from "./ai-ui-design";
import {
  aiUiDesignProgressMock,
  uiDesignFirstProgressMock,
  uiDesignVisualProgressMock,
  uiExperienceProgressMock,
} from "./progress-mock";
import { uiDesignFirstCourse } from "./ui-design-first";
import { uiDesignVisualCourse } from "./ui-design-visual";
import { uiExperienceCourse } from "./ui-experience";
import type { Course, CourseItem, LessonRef, ProgressMock } from "./types";

export const courses: Record<string, Course> = {
  [uiDesignFirstCourse.slug]: uiDesignFirstCourse,
  [uiDesignVisualCourse.slug]: uiDesignVisualCourse,
  [aiUiDesignCourse.slug]: aiUiDesignCourse,
  [uiExperienceCourse.slug]: uiExperienceCourse,
};

/** 「進行中の会員」表示用の進捗モック（コースごと） */
export const progressMocks: Record<string, ProgressMock> = {
  [uiDesignFirstCourse.slug]: uiDesignFirstProgressMock,
  [uiDesignVisualCourse.slug]: uiDesignVisualProgressMock,
  [aiUiDesignCourse.slug]: aiUiDesignProgressMock,
  [uiExperienceCourse.slug]: uiExperienceProgressMock,
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
