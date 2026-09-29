"use client";

/**
 * 状態ごとの該当レッスン一覧（結果画面）。
 *
 * - 並びは 07 の順（先頭=入口）。無料0本のレッスンだけ後ろへ（orderLessonsForResult）。
 * - 各レッスンに「無料 n／全 m 記事」。未ログイン表示では、会員限定が多いレッスンに注記を出す。
 * - 対応度×は「準備中」を表示し、近いレッスンがあれば併記。△は「近い内容のレッスン」とする。
 * - クリックで content_guide_lesson_click（主指標）を送る。
 */

import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import {
  LESSON_MAP,
  isMemberHeavy,
  orderLessonsForResult,
  type GuideLesson,
} from "@/lib/content-guide/lesson-map";
import type { SkillStateId } from "@/lib/content-guide/skill-states";
import { trackContentGuide } from "@/lib/content-guide/tracking";
import { cn } from "@/lib/utils";
import type { Viewer } from "./query";

export type LessonPosition = "first_state" | "path";

interface LessonListProps {
  stateId: SkillStateId;
  goal: SkillStateId;
  viewer: Viewer;
  position: LessonPosition;
  /** 道筋の中での順番（0始まり） */
  pathIndex: number;
  /** 先頭のレッスンを「まずはここから」として強調する */
  emphasizeFirst?: boolean;
  /** 見出しレベル（呼び出し側のネストに合わせる） */
  headingLevel: "h3" | "h4";
}

function LessonMeta({ lesson, viewer }: { lesson: GuideLesson; viewer: Viewer }) {
  const heavy = isMemberHeavy(lesson);
  const allFree = lesson.freeCount === lesson.totalCount;
  return (
    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      <span className={cn(allFree ? "font-bold text-text-success" : "text-text-muted")}>
        {allFree ? `全${lesson.totalCount}記事 無料` : `無料 ${lesson.freeCount}／全 ${lesson.totalCount} 記事`}
      </span>
      {viewer === "guest" && heavy && (
        <span className="inline-flex items-center gap-1 rounded-full bg-info-feedback px-2 py-0.5 font-medium text-text-info">
          <Lock aria-hidden="true" className="size-3" />
          {lesson.freeCount === 0 ? "すべて会員限定" : "会員限定の記事が多い"}
        </span>
      )}
    </span>
  );
}

export function LessonList({
  stateId,
  goal,
  viewer,
  position,
  pathIndex,
  emphasizeFirst = false,
  headingLevel,
}: LessonListProps) {
  const entry = LESSON_MAP[stateId];
  const lessons = orderLessonsForResult(entry.lessons);
  const Heading = headingLevel;
  const missing = entry.coverage === "×";
  const near = entry.coverage === "△";

  const heading = missing ? "近いレッスン" : near ? "近い内容のレッスン" : "該当レッスン";

  const handleClick = (lesson: GuideLesson, lessonIndex: number) => {
    trackContentGuide("content_guide_lesson_click", {
      lesson_slug: lesson.slug,
      state_id: stateId,
      goal_state_id: goal,
      position,
      path_index: pathIndex,
      lesson_index: lessonIndex,
      is_goal_state: stateId === goal,
      viewer,
    });
  };

  return (
    <div className="space-y-3">
      {missing && (
        <p className="rounded-[12px] bg-warning-feedback px-4 py-3 text-sm leading-relaxed text-text-primary">
          この状態にぴったりの教材は準備中です。
          {lessons.length > 0 ? "近い内容のレッスンから始められます。" : ""}
        </p>
      )}
      {near && entry.note && (
        <p className="text-xs leading-relaxed text-text-muted">
          ぴったりの教材はまだないため、近い内容のレッスンを出しています。
        </p>
      )}

      {lessons.length > 0 && (
        <>
          <Heading className="text-xs font-bold tracking-wider text-text-muted">{heading}</Heading>
          <ul className="space-y-2">
            {lessons.map((lesson, i) => {
              const isEntry = emphasizeFirst && i === 0;
              return (
                <li key={lesson.slug}>
                  <Link
                    href={`/lessons/${lesson.slug}`}
                    onClick={() => handleClick(lesson, i)}
                    className={cn(
                      "group flex items-center gap-3 rounded-[12px] border bg-surface px-4 py-3 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isEntry ? "border-2 border-cta-primary-bg" : "border-[var(--card-border-subtle)]"
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      {isEntry && (
                        <span className="mb-1 inline-block rounded-full bg-cta-primary-bg px-2 py-0.5 text-[11px] font-bold text-text-inverse">
                          まずはここから
                        </span>
                      )}
                      <span className="block text-sm font-bold leading-6 text-text-primary group-hover:underline">
                        {lesson.title}
                      </span>
                      {lesson.note && (
                        <span className="block text-xs leading-5 text-text-secondary">{lesson.note}</span>
                      )}
                      <LessonMeta lesson={lesson} viewer={viewer} />
                    </span>
                    <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-text-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

/** 表示中の状態のうち、未ログインで会員限定が多いレッスンを含むか */
export function hasMemberHeavyLesson(stateIds: readonly SkillStateId[]): boolean {
  return stateIds.some((id) => LESSON_MAP[id].lessons.some(isMemberHeavy));
}
