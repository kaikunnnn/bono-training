"use client";

/**
 * 結果画面のセクション（現行・A案・B案で共通）。
 *
 * もとは ResultView.tsx の中にあったものを、そのまま（DOM・クラスを変えずに）切り出した:
 * 最初の一歩 / ゴールまでの道筋（ステッパー）/ やり直し / モバイルの固定ボタン、と結果の計算・計測。
 * A案・B案（12_診断UI_A案B案_仕様書 §4-2・§5-1）は、要約（§6）だけを差し替えて、これらを再利用する。
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { Flag } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { LEARNING_ORDER, SKILL_STATES, WEEKS_PER_STATE, type SkillStateId } from "@/lib/content-guide/skill-states";
import { closure, computePath, doneStates, hasPrerequisites } from "@/lib/content-guide/path";
import { LESSON_MAP, orderLessonsForResult, type GuideLesson, type StateLessons } from "@/lib/content-guide/lesson-map";
import { SHORT_TITLES } from "@/lib/content-guide/display";
import { trackContentGuide } from "@/lib/content-guide/tracking";
import { cn } from "@/lib/utils";
import { CompactLessonList, LessonMeta, trackLessonClick } from "./LessonList";
import { Chip } from "./ResultParts";
import type { Viewer } from "./query";
import type { Variant } from "./flow-query";

export const resultCardClass =
  "rounded-[20px] border border-[var(--card-border-subtle)] bg-surface p-5 shadow-[var(--shadow-board-card)] sm:p-6";

type StepStatus = "done" | "current" | "upcoming";

export interface ResultModel {
  goal: SkillStateId;
  checked: SkillStateId[];
  path: SkillStateId[];
  first: SkillStateId;
  weeks: number;
  /** 目標に必要な状態（学ぶ順。目標を含む） */
  required: SkillStateId[];
  done: Set<SkillStateId>;
  doneInRequired: SkillStateId[];
  total: number;
  firstIsGoal: boolean;
  firstEntry: StateLessons;
  entryLesson: GuideLesson | undefined;
  otherLessons: GuideLesson[];
  firstMissing: boolean;
  firstNear: boolean;
}

export function computeResultModel(goal: SkillStateId, checked: SkillStateId[]): ResultModel {
  const { path, first, weeks } = computePath(goal, checked);
  const required = LEARNING_ORDER.filter((id) => closure([goal]).has(id));
  const done = doneStates(checked);
  const doneInRequired = required.filter((id) => done.has(id));
  const firstEntry = LESSON_MAP[first];
  const firstLessons = orderLessonsForResult(firstEntry.lessons);
  return {
    goal,
    checked,
    path,
    first,
    weeks,
    required,
    done,
    doneInRequired,
    total: required.length,
    firstIsGoal: first === goal,
    firstEntry,
    entryLesson: firstLessons[0],
    otherLessons: firstLessons.slice(1),
    firstMissing: firstEntry.coverage === "×",
    firstNear: firstEntry.coverage === "△",
  };
}

/** ログイン後に診断の状態へ戻れるよう、現在の URL をそのまま渡す（独立レビュー 中2） */
export function useRedirectTo(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  return `${pathname}${search ? `?${search}` : ""}`;
}

/**
 * content_guide_result_view を、目標・チェックの組み合わせごとに1回だけ送る
 * （StrictMode の二重実行も防ぐ。viewer の切り替えでは送り直さない）。
 */
export function useResultViewTracking(model: ResultModel, viewer: Viewer, variant: Variant) {
  const { goal, checked, first, path, doneInRequired } = model;
  const viewKey = `${goal}|${checked.join(",")}`;
  const sentViewKey = useRef<string | null>(null);
  useEffect(() => {
    if (sentViewKey.current === viewKey) return;
    sentViewKey.current = viewKey;
    trackContentGuide("content_guide_result_view", {
      goal_state_id: goal,
      first_state: first,
      path_length: path.length,
      done_count: doneInRequired.length,
      checked_count: checked.length,
      viewer,
      variant,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey]);
}

interface SectionProps {
  model: ResultModel;
  viewer: Viewer;
  variant: Variant;
}

/**
 * 最初の一歩: 最初の状態と、主ボタン「このレッスンから始める」（無料の入口）。ほかのレッスンは小さなリスト。
 * encouragement: 主ボタンの上に添える励ましの一言（A案・B案。13_夜明けデザイン仕様書 §5-4。現行では出さない）
 */
export function FirstStepSection({ model, viewer, variant, encouragement }: SectionProps & { encouragement?: string }) {
  const { goal, first, firstIsGoal, entryLesson, otherLessons, firstMissing, firstNear } = model;
  const primaryLabel = firstMissing ? "近いレッスンから始める" : "このレッスンから始める";
  return (
    <section
      id="content-guide-first-step"
      data-first-state={first}
      aria-labelledby="content-guide-first-heading"
      className="scroll-mt-24 rounded-[20px] border-2 border-cta-primary-bg bg-surface p-5 shadow-[var(--shadow-board-card)] sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="content-guide-first-heading" className="text-xs font-bold text-text-muted">
          最初の一歩
        </h2>
        <Chip tone="primary">いまここ</Chip>
        <span className="text-xs text-text-muted">目安 約{WEEKS_PER_STATE}週間</span>
      </div>
      <h3 className="mt-2 font-heading text-lg font-bold leading-7 text-text-primary sm:text-xl">
        {SHORT_TITLES[first]}
      </h3>
      {firstIsGoal ? (
        <p className="mt-1 text-xs leading-5 text-text-secondary">目指す状態に、そのまま取り組めます。</p>
      ) : (
        <p className="mt-1 text-xs leading-5 text-text-secondary">{SKILL_STATES[first].label}</p>
      )}

      {entryLesson ? (
        <div className="mt-4 rounded-[16px] bg-muted-custom p-4">
          <p className="text-[11px] font-bold text-text-muted">
            {firstMissing || firstNear ? "近い内容のレッスン" : "まずはこのレッスン"}
          </p>
          <p className="mt-0.5 text-[15px] font-bold leading-6 text-text-primary">{entryLesson.title}</p>
          {entryLesson.note && <p className="text-xs leading-5 text-text-secondary">{entryLesson.note}</p>}
          <div>
            <LessonMeta lesson={entryLesson} viewer={viewer} />
          </div>
          {encouragement && (
            <p className="mt-3 text-sm font-bold leading-6 text-text-primary" data-encouragement>
              {encouragement}
            </p>
          )}
          <Button asChild size="large" className="mt-3 flex w-full sm:inline-flex sm:w-auto">
            <Link
              href={`/lessons/${entryLesson.slug}`}
              onClick={() =>
                trackLessonClick(entryLesson, 0, {
                  stateId: first,
                  goal,
                  viewer,
                  variant,
                  position: "first_step_primary",
                  pathIndex: 0,
                })
              }
            >
              {primaryLabel}
            </Link>
          </Button>
        </div>
      ) : null}

      {(firstMissing || firstNear) && (
        <p className="mt-3 text-xs leading-5 text-text-muted">
          {firstMissing
            ? "この状態にぴったりの教材は準備中です。"
            : "ぴったりの教材はまだないため、近い内容のレッスンを出しています。"}
        </p>
      )}

      {otherLessons.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold text-text-muted">ほかのレッスン</p>
          <CompactLessonList
            lessons={otherLessons}
            indexOffset={1}
            stateId={first}
            goal={goal}
            viewer={viewer}
            variant={variant}
            position="first_step_list"
            pathIndex={0}
          />
        </div>
      )}
    </section>
  );
}

/** ゴールまでの道筋: 縦のステッパー。できている（淡く）／いまここ（強調）／これから（折りたたみ。タップで展開） */
export function PathSection({ model, viewer, variant }: SectionProps) {
  const { goal, path, first, required, done } = model;
  const [expanded, setExpanded] = useState<Set<SkillStateId>>(new Set());
  const toggleExpanded = (id: SkillStateId) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const statusOf = (id: SkillStateId): StepStatus =>
    done.has(id) ? "done" : id === first ? "current" : "upcoming";

  return (
    <section aria-labelledby="content-guide-path-heading" className={resultCardClass}>
      <h2 id="content-guide-path-heading" className="font-heading text-base font-bold leading-6 text-text-primary">
        ゴールまでの道筋
      </h2>
      <p className="mt-1 text-xs text-text-muted">
        のこり{path.length}ステップ（1ステップ 約{WEEKS_PER_STATE}週間）
      </p>
      <ol className="mt-5">
        {required.map((id, i) => {
          const status = statusOf(id);
          const isGoal = id === goal;
          const isLast = i === required.length - 1;
          const pathIndex = path.indexOf(id);
          const entry = LESSON_MAP[id];
          const lessons = orderLessonsForResult(entry.lessons);
          const regionId = `content-guide-step-${id}`;
          const isOpen = expanded.has(id);
          return (
            <li key={id} className="flex gap-3" data-step-id={id} data-status={status}>
              <div className="flex flex-col items-center" aria-hidden="true">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    status === "done" && "bg-muted-strong text-text-muted",
                    status === "current" && "bg-cta-primary-bg text-text-inverse ring-4 ring-muted-strong",
                    status === "upcoming" && "border-2 border-border-default bg-surface text-text-secondary"
                  )}
                >
                  {status === "done" ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                {!isLast && (
                  <span className={cn("w-0.5 flex-1", status === "done" ? "bg-muted-strong" : "bg-border-light")} />
                )}
              </div>

              <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-5")}>
                {status === "done" && (
                  <div className="flex min-h-7 flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium leading-6 text-text-muted line-through decoration-border-default">
                      {SHORT_TITLES[id]}
                    </h3>
                    <Chip>できている</Chip>
                  </div>
                )}

                {status === "current" && (
                  <div>
                    <div className="flex min-h-7 flex-wrap items-center gap-2">
                      <h3 className="text-[15px] font-bold leading-6 text-text-primary">{SHORT_TITLES[id]}</h3>
                      <Chip tone="primary">いまここ</Chip>
                      {isGoal && <Chip tone="outline">ゴール</Chip>}
                    </div>
                    <a
                      href="#content-guide-first-step"
                      className="mt-1 inline-block rounded-[6px] text-xs text-text-link underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      「最初の一歩」のレッスンから始めましょう
                    </a>
                  </div>
                )}

                {status === "upcoming" && (
                  <div>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={regionId}
                        onClick={() => toggleExpanded(id)}
                        className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] items-center gap-2 rounded-[10px] px-2 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-[15px] font-bold leading-6 text-text-primary">{SHORT_TITLES[id]}</span>
                            {isGoal && (
                              <Chip tone="outline">
                                <Flag aria-hidden="true" size={11} color="currentColor" />
                                ゴール
                              </Chip>
                            )}
                          </span>
                          <span className="block text-xs font-normal text-text-muted">
                            約{WEEKS_PER_STATE}週間・{lessons.length > 0 ? `レッスン ${lessons.length}` : "教材は準備中"}
                          </span>
                        </span>
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-4 shrink-0 text-text-muted motion-safe:transition-transform",
                            isOpen && "rotate-180"
                          )}
                        />
                      </button>
                    </h3>
                    <div
                      id={regionId}
                      hidden={!isOpen}
                      className="mt-2 space-y-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-200"
                    >
                      <p className="text-xs leading-5 text-text-secondary">{SKILL_STATES[id].label}</p>
                      {entry.coverage === "×" && (
                        <p className="text-xs leading-5 text-text-muted">
                          この状態にぴったりの教材は準備中です。
                          {lessons.length > 0 ? "近い内容のレッスンから始められます。" : ""}
                        </p>
                      )}
                      {entry.coverage === "△" && (
                        <p className="text-xs leading-5 text-text-muted">
                          ぴったりの教材はまだないため、近い内容のレッスンを出しています。
                        </p>
                      )}
                      {lessons.length > 0 && (
                        <CompactLessonList
                          lessons={lessons}
                          stateId={id}
                          goal={goal}
                          viewer={viewer}
                          variant={variant}
                          position="path"
                          pathIndex={pathIndex}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** やり直し */
export function RestartActions({
  goal,
  onEditChecked,
  onRestart,
  editLabel = "いまできることを選び直す",
  restartLabel = "目標を選び直す",
}: {
  goal: SkillStateId;
  onEditChecked: () => void;
  onRestart: () => void;
  editLabel?: string;
  restartLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      {hasPrerequisites(goal) && (
        <Button type="button" variant="outline" size="large" onClick={onEditChecked}>
          {editLabel}
        </Button>
      )}
      <Button type="button" variant="outline" size="large" onClick={onRestart}>
        <RotateCcw aria-hidden="true" />
        {restartLabel}
      </Button>
    </div>
  );
}

/** モバイルの固定ボタン（セーフエリア分の余白をとる） */
export function StickyStartBar({ model, viewer, variant }: SectionProps) {
  const { entryLesson, first, goal } = model;
  if (!entryLesson) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--card-border-subtle)] bg-surface px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-board-card)] md:hidden">
      <p className="mb-2 truncate text-xs text-text-muted">
        最初の一歩: <span className="font-bold text-text-primary">{entryLesson.title}</span>
      </p>
      <Button asChild size="large" className="w-full">
        <Link
          href={`/lessons/${entryLesson.slug}`}
          onClick={() =>
            trackLessonClick(entryLesson, 0, { stateId: first, goal, viewer, variant, position: "sticky_cta", pathIndex: 0 })
          }
        >
          最初のレッスンから始める
        </Link>
      </Button>
    </div>
  );
}
