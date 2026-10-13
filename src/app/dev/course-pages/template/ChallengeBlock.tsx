/**
 * テンプレート＝全コース共通: チャレンジ（レッスンではなくお題）— #241
 * ステップと同じ章立てで「CHALLENGE」ラベル。色はラベルと線にだけ控えめに使い、白い箱は使わない。
 */

import { Check } from "lucide-react";
import type { CourseStep } from "../data/types";
import { T } from "./kari";
import { ChapterLabel } from "./shared";

export default function ChallengeBlock({ step, index }: { step: CourseStep; index: number }) {
  return (
    <div id={`curriculum-step-${index + 1}`} className="scroll-mt-24">
      <ChapterLabel label="CHALLENGE" meta="最後のお題" accent />
      <h3 className="mt-5 font-heading text-[22px] font-bold leading-[1.5] tracking-[-0.03em] text-text-primary md:text-[26px]">
        <T f={step.title} />
      </h3>
      <p className="mt-3 text-sm leading-[1.85] text-text-primary">
        <span className="mr-2 text-xs font-bold text-text-muted">できること</span>
        <T f={step.goal} />
      </p>

      {step.brief ? (
        <div className="mt-7 grid gap-6 border-t border-border-light pt-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10">
          <div>
            <p className="text-xs font-bold text-text-muted">お題</p>
            <p className="mt-2 text-sm leading-[1.9] text-text-primary">
              <T f={step.brief.description} />
            </p>
          </div>
          <div className="md:border-l md:border-border-light md:pl-10">
            <p className="text-xs font-bold text-text-muted">提出するもの</p>
            <ul className="mt-2 flex flex-col gap-2">
              {step.brief.deliverables.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm leading-[1.75] text-text-primary">
                  <Check size={14} strokeWidth={2.5} className="mt-[5px] shrink-0 text-text-success" />
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
  );
}
