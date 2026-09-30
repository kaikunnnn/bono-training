/**
 * 進捗表示（目標 → いまできること → 結果）。前提がない目標では「いまできること」を飛ばす。
 */

import { cn } from "@/lib/utils";
import type { Step } from "./query";

const STEPS: { id: Step; label: string }[] = [
  { id: "goal", label: "目標を選ぶ" },
  { id: "check", label: "いまできること" },
  { id: "result", label: "結果" },
];

interface StepIndicatorProps {
  step: Step;
  skipCheck: boolean;
  className?: string;
}

export function StepIndicator({ step, skipCheck, className }: StepIndicatorProps) {
  const visible = STEPS.filter((s) => !(skipCheck && s.id === "check"));
  const currentIndex = visible.findIndex((s) => s.id === step);

  return (
    <nav aria-label="診断の進み具合" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {visible.map((s, i) => {
          const isCurrent = i === currentIndex;
          const isDone = i < currentIndex;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold",
                  isCurrent && "bg-cta-primary-bg text-text-inverse",
                  isDone && "bg-muted-strong text-text-secondary",
                  !isCurrent && !isDone && "bg-surface text-text-muted"
                )}
              >
                <span aria-hidden="true">{i + 1}</span>
                {s.label}
              </span>
              {i < visible.length - 1 && (
                <span aria-hidden="true" className="text-text-disabled">
                  →
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
