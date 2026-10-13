/**
 * テンプレート＝全コース共通: チャレンジ（レッスンではなくお題）— #241
 * 小ゴールのステップと見た目を変え、最後に取り組むお題だとわかるようにする。
 */

import { Check } from "lucide-react";
import { Magicpen } from "iconsax-react";
import type { CourseStep } from "../data/types";
import { T } from "./kari";
import { StepBadge } from "./shared";

export default function ChallengeBlock({ step, index }: { step: CourseStep; index: number }) {
  return (
    <div
      id={`curriculum-step-${index + 1}`}
      className="scroll-mt-24 overflow-hidden rounded-[32px] bg-[image:var(--persona-cta-gradient)] p-[3px]"
    >
      <div className="rounded-[29px] bg-warm p-5 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          <StepBadge challenge />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
              <Magicpen size={14} color="currentColor" variant="Linear" />
              最後のお題
            </p>
            <h3 className="mt-1.5 font-heading text-lg font-bold leading-[1.6] text-text-primary md:text-xl">
              <T f={step.title} />
            </h3>
            <p className="mt-2 text-sm leading-[1.85] text-text-secondary">
              <span className="font-bold text-text-primary">できること：</span>
              <T f={step.goal} />
            </p>
          </div>
        </div>

        {step.brief ? (
          <div className="mt-6 grid gap-5 rounded-[20px] bg-surface p-5 md:ml-[96px] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8 md:p-6">
            <div>
              <p className="text-[11px] font-bold text-text-muted">お題</p>
              <p className="mt-1.5 text-sm leading-[1.9] text-text-primary">
                <T f={step.brief.description} />
              </p>
            </div>
            <div className="md:border-l md:border-dashed md:border-border-light md:pl-8">
              <p className="text-[11px] font-bold text-text-muted">提出するもの</p>
              <ul className="mt-2 flex flex-col gap-2">
                {step.brief.deliverables.map((d, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-[1.7] text-text-primary">
                    <Check size={14} strokeWidth={2.5} className="mt-[4px] shrink-0 text-text-success" />
                    <span>
                      <T f={d} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
