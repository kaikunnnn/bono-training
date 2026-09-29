"use client";

/**
 * ステップ1: 目標のスキル状態を選ぶ（18個をそのまま選択肢にする）。
 *
 * - DS patterns.md §3「選択で前進」: 選んだら即次へ（「次へ」ボタンを置かない）。
 *   選択肢カードは StepCategory（掲示板の投稿フロー）と同じ作り（button 要素のカード）。
 * - 似た状態が近くに並ぶよう、領域の順でまとめる。領域名は見出しにせず、小さな補助ラベルにとどめる。
 */

import type { RefObject } from "react";
import { ChevronRight } from "lucide-react";
import { GOAL_GROUPS, SKILL_STATES, type SkillStateId } from "@/lib/content-guide/skill-states";

interface GoalStepProps {
  headingRef: RefObject<HTMLHeadingElement | null>;
  onSelect: (goal: SkillStateId) => void;
}

export function GoalStep({ headingRef, onSelect }: GoalStepProps) {
  return (
    <section aria-labelledby="content-guide-goal-heading" className="space-y-6">
      <div className="space-y-1">
        <h2
          id="content-guide-goal-heading"
          ref={headingRef}
          tabIndex={-1}
          className="font-heading text-lg font-bold leading-7 text-text-primary outline-none sm:text-xl"
        >
          どんなスキルの状態になりたいですか？
        </h2>
        <p className="text-sm text-text-secondary">1つ選んでください。選ぶとすぐ次に進みます。</p>
      </div>

      <div className="space-y-6">
        {GOAL_GROUPS.map((group, gi) => {
          const labelId = `content-guide-goal-group-${gi}`;
          return (
            <div key={group.domain} role="group" aria-labelledby={labelId}>
              <p id={labelId} className="mb-2 text-xs text-text-muted">
                {group.domain}
              </p>
              <ul className="grid grid-cols-1 gap-2">
                {group.stateIds.map((id) => {
                  const state = SKILL_STATES[id];
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => onSelect(id)}
                        className="group flex w-full items-center gap-3 rounded-[12px] border-2 border-border bg-surface px-4 py-3.5 text-left transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-medium leading-6 text-text-primary">
                            {state.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-text-muted">{state.stage}</span>
                        </span>
                        <ChevronRight
                          aria-hidden="true"
                          className="size-5 shrink-0 text-text-muted transition-transform motion-safe:group-hover:translate-x-0.5"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
