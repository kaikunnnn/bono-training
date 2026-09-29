"use client";

/**
 * ステップ2: いまできることをチェック。
 *
 * - 選んだ目標の前提になる状態だけを、学ぶ順に並べる。何もチェックしなくてよい。
 * - チェックした状態の前提も「できている扱い」。前提として含まれる状態は、チェック済み・変更不可で理由を添える。
 *   明示したチェックは保持するので、上位のチェックを外すと元の状態に戻る。
 * - 11_UI改善仕様書 §2B: 補足を短く、カウンターは「できている n／m」、ボタン文言はチェック数で変える、
 *   チェックマークに軽い動き（reduced-motion では無し）。
 * - 独立レビュー 低3: 同じティックに連続でチェックしても落ちないよう、最新の値を ref で持つ
 *   （props の checked は URL 由来で、router.replace の反映まで古い）。
 * - fieldset + legend でチェック群をまとめる（WAI-ARIA APG Checkbox / MDN fieldset）。
 */

import { useEffect, useRef, type RefObject } from "react";
import { Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SKILL_STATES, type SkillStateId } from "@/lib/content-guide/skill-states";
import { SHORT_TITLES } from "@/lib/content-guide/display";
import { closure, prerequisitesOf } from "@/lib/content-guide/path";
import { cn } from "@/lib/utils";

interface CheckStepProps {
  headingRef: RefObject<HTMLElement | null>;
  goal: SkillStateId;
  checked: SkillStateId[];
  onChange: (checked: SkillStateId[]) => void;
  onBack: () => void;
  onNext: () => void;
  /** 戻るボタンの文言（B案で使う。既定は現行のまま） */
  backLabel?: string;
  /** 次へボタンの文言（できている数で切り替える。既定は現行のまま） */
  nextLabel?: (doneCount: number) => string;
}

const defaultNextLabel = (doneCount: number) =>
  doneCount === 0 ? "まだどれもできない。最初から始める" : "結果を見る";

export function CheckStep({
  headingRef,
  goal,
  checked,
  onChange,
  onBack,
  onNext,
  backLabel = "目標を選び直す",
  nextLabel = defaultNextLabel,
}: CheckStepProps) {
  const candidates = prerequisitesOf(goal);

  // 最新のチェック（URL の反映を待たずに次のチェックへ使う）
  const latest = useRef<SkillStateId[]>(checked);
  useEffect(() => {
    latest.current = checked;
  }, [checked]);

  const checkedSet = new Set(checked);
  const implied = new Set<SkillStateId>();
  for (const id of checked) {
    for (const pre of closure([id])) if (pre !== id) implied.add(pre);
  }

  const toggle = (id: SkillStateId, next: boolean) => {
    const set = new Set(latest.current);
    if (next) set.add(id);
    else set.delete(id);
    const nextChecked = candidates.filter((c) => set.has(c));
    latest.current = nextChecked;
    onChange(nextChecked);
  };

  const doneCount = candidates.filter((id) => checkedSet.has(id) || implied.has(id)).length;

  return (
    <section aria-labelledby="content-guide-check-heading" className="space-y-6">
      <div className="rounded-[16px] bg-muted-custom px-4 py-3">
        <p className="text-xs text-text-muted">目指す状態</p>
        <p className="mt-0.5 text-sm font-bold leading-6 text-text-primary">{SHORT_TITLES[goal]}</p>
        <p data-cg-text="body" className="text-xs leading-5 text-text-secondary">{SKILL_STATES[goal].label}</p>
      </div>

      <div className="space-y-1">
        <h2
          id="content-guide-check-heading"
          ref={headingRef as RefObject<HTMLHeadingElement | null>}
          tabIndex={-1}
          className="font-heading text-lg font-bold leading-7 text-text-primary outline-none sm:text-xl"
        >
          すでにできることはありますか？
        </h2>
        <p id="content-guide-check-desc" className="text-sm leading-relaxed text-text-secondary">
          できるものにチェック（なくてもOK）。その前提も、できている扱いになります。
        </p>
      </div>

      <fieldset aria-describedby="content-guide-check-desc">
        <legend className="sr-only">いまできること</legend>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {candidates.map((id) => {
            const isImplied = implied.has(id);
            const isChecked = checkedSet.has(id) || isImplied;
            const inputId = `content-guide-check-${id}`;
            return (
              <li key={id}>
                <label
                  htmlFor={inputId}
                  className={cn(
                    "flex h-full min-h-11 w-full items-start gap-3 rounded-[16px] border-2 bg-surface px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                    isChecked ? "border-cta-primary-bg" : "border-border",
                    isImplied ? "cursor-not-allowed" : "cursor-pointer hover:bg-muted/30"
                  )}
                >
                  <Checkbox
                    id={inputId}
                    checked={isChecked}
                    disabled={isImplied}
                    onCheckedChange={(v) => toggle(id, v === true)}
                    className="mt-0.5 size-5 rounded-[6px] border-cta-primary-bg focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-70 data-[state=checked]:bg-cta-primary-bg motion-safe:[&_svg]:animate-in motion-safe:[&_svg]:zoom-in-50 motion-safe:[&_svg]:duration-200"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold leading-6 text-text-primary">{SHORT_TITLES[id]}</span>
                    <span data-cg-text="body" className="block text-xs leading-5 text-text-secondary">{SKILL_STATES[id].label}</span>
                    {isImplied && (
                      <span data-cg-text="body" className="mt-1 inline-flex items-center gap-1 text-xs text-text-muted">
                        <Lock aria-hidden="true" className="size-3" />
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

      <p className="text-sm font-bold text-text-secondary" aria-live="polite">
        できている {doneCount}／{candidates.length}
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="ghost" size="large" onClick={onBack}>
          {backLabel}
        </Button>
        <Button type="button" size="large" onClick={onNext} className="whitespace-normal">
          {nextLabel(doneCount)}
        </Button>
      </div>
    </section>
  );
}
