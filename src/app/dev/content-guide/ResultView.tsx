"use client";

/**
 * ステップ3: 結果画面（10_仕様書 §4 / 11_UI改善仕様書 §2C）。
 *
 * 構成（見出し: h2=各セクション / h3=状態）:
 * 1. 要約バー: 目指す状態（短い見出し）・「全n ステップ・できている k・あと約w週間」・進捗バー
 * 2. 最初の一歩: 最初の状態と、主ボタン「このレッスンから始める」（無料の入口）。ほかのレッスンは小さなリスト
 * 3. 未ログイン かつ 入口レッスンが会員限定の割合が高いときだけ、会員登録の案内（最初の一歩の直下）
 * 4. ゴールまでの道筋: 縦のステッパー。できている（淡く）／いまここ（強調）／これから（折りたたみ。タップで展開）
 * 5. やり直し
 * モバイルでは画面下に「最初のレッスンから始める」を固定表示。
 *
 * 重複の削除: 最初の状態のレッスンは「最初の一歩」にだけ出す。道筋が1つだけ（前提なしの目標）のときは道筋を出さない。
 * 「何を作るか（課題の中身）」は表示しない。
 */

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { Flag } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { LEARNING_ORDER, SKILL_STATES, WEEKS_PER_STATE, type SkillStateId } from "@/lib/content-guide/skill-states";
import { closure, computePath, doneStates, hasPrerequisites } from "@/lib/content-guide/path";
import { LESSON_MAP, isMemberHeavy, orderLessonsForResult } from "@/lib/content-guide/lesson-map";
import { SHORT_TITLES } from "@/lib/content-guide/display";
import { trackContentGuide } from "@/lib/content-guide/tracking";
import { cn } from "@/lib/utils";
import { CompactLessonList, LessonMeta, trackLessonClick } from "./LessonList";
import { MemberNotice } from "./MemberNotice";
import { Chip, ProgressBar } from "./ResultParts";
import type { Viewer } from "./query";

interface ResultViewProps {
  headingRef: RefObject<HTMLElement | null>;
  goal: SkillStateId;
  checked: SkillStateId[];
  viewer: Viewer;
  onRestart: () => void;
  onEditChecked: () => void;
}

const cardClass =
  "rounded-[20px] border border-[var(--card-border-subtle)] bg-surface p-5 shadow-[var(--shadow-board-card)] sm:p-6";

type StepStatus = "done" | "current" | "upcoming";

export function ResultView({ headingRef, goal, checked, viewer, onRestart, onEditChecked }: ResultViewProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  // 独立レビュー 中2: ログイン後に診断の状態へ戻れるよう、現在の URL をそのまま渡す
  const redirectTo = `${pathname}${search ? `?${search}` : ""}`;

  const { path, first, weeks } = computePath(goal, checked);
  const required = LEARNING_ORDER.filter((id) => closure([goal]).has(id));
  const done = doneStates(checked);
  const doneInRequired = required.filter((id) => done.has(id));
  const total = required.length;
  const firstIsGoal = first === goal;

  const firstEntry = LESSON_MAP[first];
  const firstLessons = orderLessonsForResult(firstEntry.lessons);
  const entryLesson = firstLessons[0];
  const otherLessons = firstLessons.slice(1);
  const firstMissing = firstEntry.coverage === "×";
  const firstNear = firstEntry.coverage === "△";
  const showMemberNotice = viewer === "guest" && entryLesson !== undefined && isMemberHeavy(entryLesson);
  const primaryLabel = firstMissing ? "近いレッスンから始める" : "このレッスンから始める";

  // 目標・チェックの組み合わせごとに1回だけ送る（StrictMode の二重実行も防ぐ。viewer の切り替えでは送り直さない）
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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey]);

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
    <div className="space-y-5 pb-28 md:pb-0">
      {/* 1. 要約バー */}
      <section aria-labelledby="content-guide-summary-heading" className={cardClass}>
        <p className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
          <Flag aria-hidden="true" size={14} color="currentColor" />
          目指す状態
        </p>
        <h2
          id="content-guide-summary-heading"
          ref={headingRef as RefObject<HTMLHeadingElement | null>}
          tabIndex={-1}
          className="mt-1 font-heading text-xl font-bold leading-8 text-text-primary outline-none sm:text-2xl"
        >
          {SHORT_TITLES[goal]}
        </h2>
        <p className="mt-1 text-xs leading-5 text-text-secondary">{SKILL_STATES[goal].label}</p>
        <div className="mt-4 space-y-2">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-text-primary">
            <span>
              全<span className="font-bold">{total}</span>ステップ
            </span>
            <span>
              できている <span className="font-bold">{doneInRequired.length}</span>つ
            </span>
            <span>
              あと約<span className="font-bold">{weeks}</span>週間
            </span>
          </p>
          <ProgressBar value={doneInRequired.length} max={total} label="目指す状態までの進み具合" />
        </div>
      </section>

      {/* 2. 最初の一歩 */}
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
            <Button asChild size="large" className="mt-3 flex w-full sm:inline-flex sm:w-auto">
              <Link
                href={`/lessons/${entryLesson.slug}`}
                onClick={() =>
                  trackLessonClick(entryLesson, 0, { stateId: first, goal, viewer, position: "first_step_primary", pathIndex: 0 })
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
              position="first_step_list"
              pathIndex={0}
            />
          </div>
        )}
      </section>

      {/* 3. 会員登録の案内（未ログイン かつ 入口レッスンが会員限定の割合が高いとき） */}
      {showMemberNotice && <MemberNotice redirectTo={redirectTo} />}

      {/* 4. ゴールまでの道筋（状態が2つ以上のときだけ） */}
      {total > 1 && (
        <section aria-labelledby="content-guide-path-heading" className={cardClass}>
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
      )}

      {/* 5. やり直し */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {hasPrerequisites(goal) && (
          <Button type="button" variant="outline" size="large" onClick={onEditChecked}>
            いまできることを選び直す
          </Button>
        )}
        <Button type="button" variant="outline" size="large" onClick={onRestart}>
          <RotateCcw aria-hidden="true" />
          目標を選び直す
        </Button>
      </div>

      {/* モバイルの固定ボタン（セーフエリア分の余白をとる） */}
      {entryLesson && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--card-border-subtle)] bg-surface px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-board-card)] md:hidden">
          <p className="mb-2 truncate text-xs text-text-muted">
            最初の一歩: <span className="font-bold text-text-primary">{entryLesson.title}</span>
          </p>
          <Button asChild size="large" className="w-full">
            <Link
              href={`/lessons/${entryLesson.slug}`}
              onClick={() =>
                trackLessonClick(entryLesson, 0, { stateId: first, goal, viewer, position: "sticky_cta", pathIndex: 0 })
              }
            >
              最初のレッスンから始める
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
