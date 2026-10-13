/**
 * テンプレート＝全コース共通: コースの流れ（01 → 02 → 03 → チャレンジ → ゴール）— #241
 *
 * 小ゴールを道筋として横に並べる（モバイルは縦）。体系的に見せる要。
 * 見出しの重複を避けるため、ここのステップ名は h3 にせず <p>（h3 はカリキュラム側）。
 */

import { ArrowDown } from "lucide-react";
import { Flag } from "iconsax-react";
import { cn } from "@/lib/utils";
import type { Course } from "../data/types";
import { T } from "./kari";
import { PASTEL_GRADIENT, SectionHead, StepBadge, numberSteps } from "./shared";

export default function CourseFlow({ course }: { course: Course }) {
  return (
    <section aria-labelledby="course-flow" className="border-t border-border-light py-16 md:py-20">
      <SectionHead
        id="course-flow"
        kicker="Path"
        title="コースの流れ"
        lead="小さなゴールを1つずつ越えていくと、最後にコース全体のゴールにたどり着きます。"
      />

      <div className="mt-10 rounded-[32px] border border-border-light bg-surface p-5 md:p-8">
        <ol
          className={cn(
            "grid gap-6 lg:gap-5",
            course.steps.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          )}
        >
          {numberSteps(course).map(({ step, index, goalNumber }) => {
            const challenge = step.kind === "challenge";
            const isLast = index === course.steps.length - 1;
            const lessonCount = step.items.length;
            const plannedCount = step.items.filter((item) => item.type === "planned").length;

            return (
              <li key={index} className="relative flex gap-4 lg:flex-col lg:gap-5">
                {/* つなぎ線（PC: 横 / モバイル: 縦） */}
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[64px] right-[-20px] top-[24px] hidden border-t-2 border-dotted border-border-default lg:block"
                  />
                ) : null}
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-[-24px] left-[27px] top-[60px] border-l-2 border-dotted border-border-default lg:hidden"
                  />
                ) : null}

                <div className="relative z-[1] bg-surface lg:self-start lg:pr-3">
                  <StepBadge size="sm" number={goalNumber ?? undefined} challenge={challenge} />
                </div>

                <a
                  href={`#curriculum-step-${index + 1}`}
                  className={cn(
                    "group block min-w-0 flex-1 rounded-[16px] p-4 transition-colors lg:-mx-1 lg:p-4",
                    challenge ? "bg-warm hover:bg-hover" : "bg-[var(--bg-base)] hover:bg-hover"
                  )}
                >
                  <p className="font-heading text-[15px] font-bold leading-[1.55] text-text-primary">
                    <T f={step.title} />
                  </p>
                  <p className="mt-2 text-xs leading-[1.8] text-text-secondary">
                    <span className="font-bold text-text-muted">できること：</span>
                    <T f={step.goal} />
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-text-muted">
                    {challenge ? (
                      <span>お題に取り組む</span>
                    ) : (
                      <>
                        <span>レッスン {lessonCount}本</span>
                        {plannedCount > 0 ? <span>（未制作 {plannedCount}）</span> : null}
                      </>
                    )}
                    <ArrowDown size={12} className="ml-auto transition-transform group-hover:translate-y-0.5" />
                  </p>
                </a>
              </li>
            );
          })}
        </ol>

        <div
          className={cn(
            "mt-6 flex flex-col gap-2 rounded-[20px] px-5 py-4 md:flex-row md:items-center md:gap-4 md:px-6",
            PASTEL_GRADIENT
          )}
        >
          <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-text-primary">
            <Flag size={18} color="currentColor" variant="Bulk" />
            コースのゴール
          </span>
          <p className="font-heading text-[15px] font-bold leading-[1.6] text-text-primary md:text-base">
            <T f={course.finalGoal} />
          </p>
        </div>
      </div>
    </section>
  );
}
