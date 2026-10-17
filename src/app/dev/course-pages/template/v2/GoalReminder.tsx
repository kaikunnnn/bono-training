/**
 * テンプレート v2（完成形）: あなたが目指していること（進行中の会員のときだけ）— #242
 * 途中でも、なぜやるか・何が手に入るかを見返せるように、コースのゴールと今のステップの「習得すること」を1行ずつ。
 * 押せないので白は使わない（淡い面）。
 */

import { Flag } from "iconsax-react";
import type { CourseStep, Field } from "../../data/types";
import { T } from "../kari";

export default function GoalReminder({
  finalGoal,
  step,
  stepLabel,
}: {
  finalGoal: Field;
  step: CourseStep | null;
  /** 例: STEP 02 */
  stepLabel: string | null;
}) {
  return (
    <section
      aria-label="あなたが目指していること"
      className="-mt-6 mb-14 rounded-[20px] bg-[var(--persona-hero-surface)] px-5 py-4 md:px-6"
    >
      <p className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
        <Flag size={14} color="currentColor" variant="Bold" />
        あなたが目指していること
      </p>
      <dl className="mt-2 flex flex-col gap-1.5 text-sm leading-[1.75]">
        <div className="flex flex-col gap-0.5 md:flex-row md:gap-3">
          <dt className="shrink-0 font-bold text-text-secondary md:w-[200px]">コースのゴール</dt>
          <dd className="font-bold text-text-primary">
            <T f={finalGoal} />
          </dd>
        </div>
        {step && stepLabel ? (
          <div className="flex flex-col gap-0.5 md:flex-row md:gap-3">
            <dt className="shrink-0 font-bold text-text-secondary md:w-[200px]">いまの{stepLabel}で習得すること</dt>
            <dd className="text-text-primary">
              <T f={step.gain} />
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
