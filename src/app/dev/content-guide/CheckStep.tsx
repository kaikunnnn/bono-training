"use client";

/**
 * ステップ2: いまできることをチェック。
 *
 * - 選んだ目標の前提になる状態だけを、学ぶ順に並べる。何もチェックしなくてよい。
 * - チェックした状態の前提も「できている扱い」になる。そのため、前提として含まれる状態は
 *   チェック済み・変更不可で表示し、理由を添える（外すには、元のチェックを外す）。
 *   明示したチェックは保持するので、上位のチェックを外すと元の状態に戻る。
 * - fieldset + legend でチェック群をまとめる（WAI-ARIA APG Checkbox / MDN fieldset）。
 */

import type { RefObject } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SKILL_STATES, type SkillStateId } from "@/lib/content-guide/skill-states";
import { closure, prerequisitesOf } from "@/lib/content-guide/path";
import { cn } from "@/lib/utils";

interface CheckStepProps {
  headingRef: RefObject<HTMLHeadingElement | null>;
  goal: SkillStateId;
  checked: SkillStateId[];
  onChange: (checked: SkillStateId[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function CheckStep({ headingRef, goal, checked, onChange, onBack, onNext }: CheckStepProps) {
  const candidates = prerequisitesOf(goal);
  const checkedSet = new Set(checked);
  // チェックした状態の前提（チェックした状態自身は除く）= できている扱い
  const implied = new Set<SkillStateId>();
  for (const id of checked) {
    for (const pre of closure([id])) if (pre !== id) implied.add(pre);
  }

  const toggle = (id: SkillStateId, next: boolean) => {
    const set = new Set(checked);
    if (next) set.add(id);
    else set.delete(id);
    // 明示チェックはそのまま残す（上位のチェックを外したとき、元のチェックに戻せるように）
    onChange(candidates.filter((c) => set.has(c)));
  };

  const doneCount = candidates.filter((id) => checkedSet.has(id) || implied.has(id)).length;

  return (
    <section aria-labelledby="content-guide-check-heading" className="space-y-6">
      <div className="rounded-[12px] bg-muted-custom px-4 py-3">
        <p className="text-xs text-text-muted">選んだ目標</p>
        <p className="mt-0.5 text-sm font-medium leading-6 text-text-primary">
          {SKILL_STATES[goal].label}
        </p>
      </div>

      <div className="space-y-1">
        <h2
          id="content-guide-check-heading"
          ref={headingRef}
          tabIndex={-1}
          className="font-heading text-lg font-bold leading-7 text-text-primary outline-none sm:text-xl"
        >
          次のうち、すでにできることはありますか？
        </h2>
        <p id="content-guide-check-desc" className="text-sm leading-relaxed text-text-secondary">
          目標の前提になる状態です。できるものにチェックしてください（なければ、そのまま進んでOK）。
          チェックした状態の前提も、できているものとして扱います。
        </p>
      </div>

      <fieldset aria-describedby="content-guide-check-desc">
        <legend className="sr-only">いまできること</legend>
        <ul className="grid grid-cols-1 gap-2">
          {candidates.map((id) => {
            const isImplied = implied.has(id);
            const isChecked = checkedSet.has(id) || isImplied;
            const inputId = `content-guide-check-${id}`;
            return (
              <li key={id}>
                <label
                  htmlFor={inputId}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-[12px] border-2 bg-surface px-4 py-3.5 transition-colors",
                    isChecked ? "border-cta-primary-bg" : "border-border",
                    isImplied ? "cursor-not-allowed" : "cursor-pointer hover:bg-muted/30"
                  )}
                >
                  <Checkbox
                    id={inputId}
                    checked={isChecked}
                    disabled={isImplied}
                    onCheckedChange={(v) => toggle(id, v === true)}
                    className="mt-1 size-5 rounded-[6px] border-cta-primary-bg data-[state=checked]:bg-cta-primary-bg"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium leading-6 text-text-primary">
                      {SKILL_STATES[id].label}
                    </span>
                    {isImplied && (
                      <span className="mt-0.5 block text-xs text-text-muted">
                        チェックした状態の前提なので、できている扱いです
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <p className="text-xs text-text-muted" aria-live="polite">
        {candidates.length}個中 {doneCount}個をできている扱いにしています
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="ghost" size="large" onClick={onBack}>
          目標を選び直す
        </Button>
        <Button type="button" size="large" onClick={onNext}>
          結果を見る
        </Button>
      </div>
    </section>
  );
}
