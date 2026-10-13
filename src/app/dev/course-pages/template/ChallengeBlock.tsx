/**
 * テンプレート＝全コース共通: チャレンジのお題と提出物（簡潔に）— #241
 * 押せないので白い箱は使わず、線で区切る。
 */

import { Check } from "lucide-react";
import type { CourseStep } from "../data/types";
import { T } from "./kari";

export default function ChallengeBlock({ step }: { step: CourseStep }) {
  if (!step.brief) return null;
  return (
    <div className="border-l-2 border-border-default py-1 pl-5">
      <p className="text-[15px] font-bold leading-[1.7] text-text-primary">
        <span className="mr-2 text-xs text-text-muted">お題</span>
        <T f={step.brief.description} />
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {step.brief.deliverables.map((d, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-[1.7] text-text-secondary">
            <Check size={13} strokeWidth={2.5} className="mt-[4px] shrink-0 text-text-muted" />
            <span>
              <T f={d} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
