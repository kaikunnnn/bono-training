"use client";

/**
 * 結果画面のレッスン表示の部品。
 *
 * - 11_UI改善仕様書 §2C: 会員限定の表示は静かに。青いバッジはやめ、レッスンごとに
 *   小さな鍵アイコン（未ログイン表示かつ無料が3分の1未満のときだけ）+「無料 n／全 m」。
 * - クリックで content_guide_lesson_click（主指標）を送る。
 */

import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import { isMemberHeavy, type GuideLesson } from "@/lib/content-guide/lesson-map";
import type { SkillStateId } from "@/lib/content-guide/skill-states";
import { trackContentGuide } from "@/lib/content-guide/tracking";
import type { Viewer } from "./query";
import type { Variant } from "./flow-query";

export type LessonPosition = "first_step_primary" | "first_step_list" | "sticky_cta" | "path";

export interface LessonClickContext {
  stateId: SkillStateId;
  goal: SkillStateId;
  viewer: Viewer;
  position: LessonPosition;
  /** 道筋の中での順番（0始まり） */
  pathIndex: number;
  /** どの案の画面か（12_仕様書 §1: 計測に variant を足す） */
  variant: Variant;
}

export function trackLessonClick(lesson: GuideLesson, lessonIndex: number, ctx: LessonClickContext) {
  trackContentGuide("content_guide_lesson_click", {
    lesson_slug: lesson.slug,
    state_id: ctx.stateId,
    goal_state_id: ctx.goal,
    position: ctx.position,
    path_index: ctx.pathIndex,
    lesson_index: lessonIndex,
    is_goal_state: ctx.stateId === ctx.goal,
    viewer: ctx.viewer,
    variant: ctx.variant,
  });
}

/** 「無料 n／全 m 記事」＋（未ログインで会員限定が多いときだけ）鍵アイコン */
export function LessonMeta({ lesson, viewer }: { lesson: GuideLesson; viewer: Viewer }) {
  const locked = viewer === "guest" && isMemberHeavy(lesson);
  const allFree = lesson.freeCount === lesson.totalCount;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-text-muted">
      {locked && (
        <>
          <Lock aria-hidden="true" className="size-3" />
          <span className="sr-only">会員限定の記事が多いレッスン。</span>
        </>
      )}
      {allFree ? `全${lesson.totalCount}記事 無料` : `無料 ${lesson.freeCount}／全 ${lesson.totalCount} 記事`}
    </span>
  );
}

interface CompactLessonListProps extends Omit<LessonClickContext, "position"> {
  lessons: readonly GuideLesson[];
  position: LessonPosition;
  /** lesson_index の起点（先頭を別表示しているとき 1） */
  indexOffset?: number;
}

/** 小さなレッスンのリスト（ほかのレッスン／道筋の展開） */
export function CompactLessonList({ lessons, indexOffset = 0, ...ctx }: CompactLessonListProps) {
  return (
    <ul className="divide-y divide-[var(--card-border-subtle)] overflow-hidden rounded-[12px] border border-[var(--card-border-subtle)] bg-surface">
      {lessons.map((lesson, i) => (
        <li key={lesson.slug}>
          <Link
            href={`/lessons/${lesson.slug}`}
            onClick={() => trackLessonClick(lesson, indexOffset + i, ctx)}
            className="group flex min-h-11 items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/30 focus-visible:relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium leading-6 text-text-primary group-hover:underline">
                {lesson.title}
              </span>
              {lesson.note && <span className="block text-xs leading-5 text-text-secondary">{lesson.note}</span>}
              <LessonMeta lesson={lesson} viewer={ctx.viewer} />
            </span>
            <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-text-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
