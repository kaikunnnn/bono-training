"use client";

/**
 * ステップ3: 結果画面（10_仕様書 §4。オーナーが確認する画面）。
 *
 * 構成（見出し: h2=各セクション / h3=状態 / h4=レッスン一覧）:
 * 1. 最初に取り掛かる状態 + 該当レッスン（無料で始められる入口を先頭）
 * 2. 目指す状態
 * 3. そこに通じる道筋（まだできていない状態の並び・各状態の該当レッスン・約2週間×状態数）
 * 4. 未ログイン表示のみ: 会員登録の導線（会員限定が多いレッスンがあるとき）
 * 5. やり直し
 *
 * 「何を作るか（課題の中身）」は表示しない。
 */

import { useEffect, type RefObject } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SKILL_STATES, WEEKS_PER_STATE, type SkillStateId } from "@/lib/content-guide/skill-states";
import { computePath, doneStates, hasPrerequisites, prerequisitesOf } from "@/lib/content-guide/path";
import { trackContentGuide } from "@/lib/content-guide/tracking";
import { cn } from "@/lib/utils";
import { LessonList, hasMemberHeavyLesson } from "./LessonList";
import { MemberNotice } from "./MemberNotice";
import type { Viewer } from "./query";

interface ResultViewProps {
  headingRef: RefObject<HTMLHeadingElement | null>;
  goal: SkillStateId;
  checked: SkillStateId[];
  viewer: Viewer;
  onRestart: () => void;
  onEditChecked: () => void;
}

const sectionBase = "rounded-[20px] bg-surface p-5 shadow-[var(--shadow-board-card)] sm:p-6";
const sectionClass = `${sectionBase} border border-[var(--card-border-subtle)]`;
const firstSectionClass = `${sectionBase} border-2 border-cta-primary-bg`;
const sectionHeadingClass = "font-heading text-base font-bold leading-6 text-text-muted";
const enterClass = "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300";

function Chip({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "primary" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
        tone === "primary" ? "bg-cta-primary-bg text-text-inverse" : "bg-muted-strong text-text-secondary"
      )}
    >
      {children}
    </span>
  );
}

export function ResultView({ headingRef, goal, checked, viewer, onRestart, onEditChecked }: ResultViewProps) {
  const result = computePath(goal, checked);
  const { path, first, weeks } = result;
  const goalState = SKILL_STATES[goal];
  const firstState = SKILL_STATES[first];
  const firstIsGoal = first === goal;
  const done = doneStates(checked);
  const doneList = prerequisitesOf(goal).filter((id) => done.has(id));
  const showMemberNotice = viewer === "guest" && hasMemberHeavyLesson(path);

  const checkedKey = checked.join(",");
  useEffect(() => {
    trackContentGuide("content_guide_result_view", {
      goal_state_id: goal,
      first_state: first,
      path_length: path.length,
      checked_count: checkedKey ? checkedKey.split(",").length : 0,
      viewer,
    });
    // 目標・チェックが変わったときだけ送る（viewer の切り替えは開発用なので送り直さない）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal, checkedKey]);

  return (
    <div className="space-y-6">
      {/* 1. 最初に取り掛かる状態 */}
      <section aria-labelledby="content-guide-first-heading" className={cn(firstSectionClass, enterClass)}>
        <h2
          id="content-guide-first-heading"
          ref={headingRef}
          tabIndex={-1}
          className={cn(sectionHeadingClass, "outline-none")}
        >
          最初に取り掛かる状態
        </h2>
        <h3 className="mt-2 font-heading text-xl font-bold leading-8 text-text-primary sm:text-2xl">
          {firstState.label}
        </h3>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <Chip tone="primary">最初のテーマ</Chip>
          <span>目安 約{WEEKS_PER_STATE}週間</span>
          {firstIsGoal && <span>（これが目指す状態です）</span>}
        </p>
        <div className="mt-5">
          <LessonList
            stateId={first}
            goal={goal}
            viewer={viewer}
            position="first_state"
            pathIndex={0}
            emphasizeFirst
            headingLevel="h4"
          />
        </div>
      </section>

      {/* 2. 目指す状態 */}
      <section aria-labelledby="content-guide-goal-result-heading" className={cn(sectionClass, enterClass)}>
        <h2 id="content-guide-goal-result-heading" className={sectionHeadingClass}>
          目指す状態
        </h2>
        <h3 className="mt-2 font-heading text-lg font-bold leading-7 text-text-primary">{goalState.label}</h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {firstIsGoal
            ? `最初のテーマが、そのまま目指す状態です。目安は約${weeks}週間です。`
            : `ここまで、あと${path.length}つの状態。1つ約${WEEKS_PER_STATE}週間として、約${weeks}週間が目安です。`}
        </p>
      </section>

      {/* 3. そこに通じる道筋 */}
      <section aria-labelledby="content-guide-path-heading" className={cn(sectionClass, enterClass)}>
        <h2 id="content-guide-path-heading" className={sectionHeadingClass}>
          そこに通じる道筋
        </h2>
        <p className="mt-2 text-sm text-text-primary">
          <span className="font-bold">約{weeks}週間</span>
          <span className="text-text-muted">
            （{WEEKS_PER_STATE}週間 × {path.length}つの状態）
          </span>
        </p>

        <ol className="mt-5 space-y-0">
          {path.map((id, i) => {
            const isFirst = i === 0;
            const isGoal = id === goal;
            const isLast = i === path.length - 1;
            return (
              <li key={id} className="relative flex gap-3 sm:gap-4">
                {/* 番号と縦線 */}
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isFirst ? "bg-cta-primary-bg text-text-inverse" : "border-2 border-border-default bg-surface text-text-secondary"
                    )}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  {!isLast && <span aria-hidden="true" className="w-0.5 flex-1 bg-border-light" />}
                </div>

                <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-6")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="sr-only">{i + 1}番目</span>
                    {isFirst && <Chip tone="primary">最初のテーマ</Chip>}
                    {isGoal && <Chip>目指す状態</Chip>}
                    <span className="text-xs text-text-muted">約{WEEKS_PER_STATE}週間</span>
                  </div>
                  <h3 className="mt-1 text-[15px] font-bold leading-6 text-text-primary">
                    {SKILL_STATES[id].label}
                  </h3>
                  <div className="mt-3">
                    {isFirst ? (
                      <p className="text-xs text-text-muted">該当レッスンは「最初に取り掛かる状態」に表示しています。</p>
                    ) : (
                      <LessonList
                        stateId={id}
                        goal={goal}
                        viewer={viewer}
                        position="path"
                        pathIndex={i}
                        headingLevel="h4"
                      />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {doneList.length > 0 && (
          <div className="mt-6 rounded-[12px] bg-muted-custom px-4 py-3">
            <p className="text-xs font-bold text-text-muted">できている扱いにした状態（{doneList.length}）</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs leading-5 text-text-secondary">
              {doneList.map((id) => (
                <li key={id}>{SKILL_STATES[id].label}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 4. 未ログイン: 会員登録の導線 */}
      {showMemberNotice && <MemberNotice redirectTo="/dev/content-guide" />}

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
    </div>
  );
}
