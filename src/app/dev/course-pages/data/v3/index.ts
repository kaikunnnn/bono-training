/**
 * data v3 ＝ 4コースの一覧と、名前の案を重ねる関数 — #300
 *
 * v1/v2 の data/index.ts の courses には入れない（既存の一覧・ページを変えないため）。
 * 並びは転職ロードマップの順（Figma → UIビジュアル → 情報設計 → UX）。
 */

import type { Course, LessonRef, ProgressMock } from "../types";
import { figmaBeginnerV3 } from "./figma-beginner";
import { informationArchitectureV3 } from "./information-architecture";
import type { CourseV3Entry, NameKey } from "./types";
import { uiVisualV3 } from "./ui-visual";
import { uxDesignBasicV3 } from "./ux-design-basic";

export type { CourseV3Entry, NameKey } from "./types";

export const V3_BASE = "/dev/course-pages/v3";

export const coursesV3: CourseV3Entry[] = [figmaBeginnerV3, uiVisualV3, informationArchitectureV3, uxDesignBasicV3];

export function getCourseV3Entry(slug: string): CourseV3Entry | null {
  return coursesV3.find((c) => c.base.slug === slug) ?? null;
}

/** ?name= を読む（a / b 以外は a） */
export function parseName(value: string | undefined): NameKey {
  return value === "b" ? "b" : "a";
}

/** 選んだ名前の項目（タイトル・こんな人向け・得られる変化・向いていない人）をベースに重ねた Course */
export function resolveCourse(entry: CourseV3Entry, name: NameKey): Course {
  const n = entry.names[name];
  const base = entry.base;
  return {
    ...base,
    title: n.title,
    change: n.change,
    v2: {
      ...base.v2!,
      audienceLine: n.audienceLine,
      change: n.change,
      notFor: n.notFor,
    },
  };
}

/** 名前つきの Course を slug で引く（「修了したら次は」の次のコース用。無ければ null） */
export function getCourseV3(slug: string, name: NameKey): Course | null {
  const entry = getCourseV3Entry(slug);
  return entry ? resolveCourse(entry, name) : null;
}

export function lessonSlugsV3(course: Course): string[] {
  return course.steps
    .flatMap((s) => s.items)
    .filter((i): i is LessonRef => i.type === "lesson")
    .map((i) => i.slug);
}

/**
 * 課金後（?state=member）の進捗モック。記事数は Sanity の実データから計算する
 * - Figma入門: 1本目を完了、2本目の途中（3本中1本）
 * - UIビジュアル: 1本目を完了、デザインサイクルの途中（7本中1本）
 * - 情報設計: 1本目の途中（5本中0本）
 * - UX: まだ始めていない（5本中0本）
 */
export const progressMocksV3: Record<string, ProgressMock> = {
  "figma-beginner": { figmabeginner: "all", "figma-elementary": 3 },
  "ui-visual": { "tutorial-uivisual": "all", "ui-design-flow-lv1": 6 },
  "information-architecture": { "ui-architect-beginner": 9 },
  "ux-design-basic": {},
};
