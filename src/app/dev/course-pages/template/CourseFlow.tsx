/**
 * テンプレート＝全コース共通: コースの流れ（横の道のり）— #241
 *
 * 横一本の線上に 01●─02●─03●─チャレンジ◆─ゴール⚑ を等間隔に置き、各点の下に中身を書く。
 * カード・背景なし（白はクリックできる場所だけに使う方針）。モバイルは縦の線＋点。
 * 見出しの重複を避けるため、ここのステップ名は h3 にせず <p>（h3 はカリキュラム側）。
 */

import { Flag } from "iconsax-react";
import { cn } from "@/lib/utils";
import type { Course } from "../data/types";
import { T } from "./kari";
import { SectionHead, numberSteps, pad2 } from "./shared";

function Marker({ kind }: { kind: "goal" | "challenge" | "finish" }) {
  if (kind === "finish") {
    return (
      <span className="flex size-5 items-center justify-center text-text-primary">
        <Flag size={20} color="currentColor" variant="Bold" />
      </span>
    );
  }
  return (
    <span className="flex size-5 items-center justify-center">
      <span
        className={cn(
          "block ring-4 ring-[var(--bg-base)]",
          kind === "challenge"
            ? "size-3 rotate-45 bg-[image:var(--persona-cta-gradient)]"
            : "size-3.5 rounded-full bg-text-primary"
        )}
      />
    </span>
  );
}

export default function CourseFlow({ course }: { course: Course }) {
  const steps = numberSteps(course);
  const columns = steps.length + 1; // 最後にゴール

  return (
    <section aria-labelledby="course-flow" className="border-t border-border-light py-16 md:py-20">
      <SectionHead
        id="course-flow"
        kicker="Path"
        title="コースの流れ"
        lead="小さなゴールを1つずつ越えていくと、最後にコース全体のゴールにたどり着きます。"
      />

      <ol
        className="relative mt-12 lg:grid"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {/* PC: 横一本の線（最初の点 → ゴールの点） */}
        <span
          aria-hidden="true"
          className="absolute left-[10px] top-[10px] hidden h-px bg-border-strong lg:block"
          style={{ right: `calc(${100 / columns}% - 10px)` }}
        />

        {steps.map(({ step, index, goalNumber }) => {
          const challenge = step.kind === "challenge";
          const plannedCount = step.items.filter((item) => item.type === "planned").length;
          return (
            <li key={index} className="relative pb-10 pl-10 lg:pb-0 lg:pl-0 lg:pr-6">
              {/* モバイル: 縦の線 */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-[10px] top-[10px] w-px bg-border-strong lg:hidden"
              />
              <span className="absolute left-0 top-0 lg:static lg:block">
                <Marker kind={challenge ? "challenge" : "goal"} />
              </span>

              <a href={`#curriculum-step-${index + 1}`} className="group block lg:mt-5">
                <p
                  className={cn(
                    "font-latin text-xs font-bold tracking-[0.08em]",
                    challenge ? "text-text-link-hover" : "text-text-muted"
                  )}
                >
                  {challenge ? "CHALLENGE" : `STEP ${pad2(goalNumber ?? 0)}`}
                </p>
                <p className="mt-1.5 font-heading text-[15px] font-bold leading-[1.55] text-text-primary group-hover:underline group-hover:underline-offset-4">
                  <T f={step.title} />
                </p>
              </a>
              <p className="mt-2 text-xs leading-[1.8] text-text-secondary">
                <T f={step.goal} />
              </p>
              <p className="mt-2 text-[11px] font-bold text-text-muted">
                {challenge
                  ? "お題に取り組む"
                  : `レッスン ${step.items.length}本${plannedCount > 0 ? `（未制作 ${plannedCount}）` : ""}`}
              </p>
            </li>
          );
        })}

        <li className="relative pl-10 lg:pl-0">
          <span className="absolute left-0 top-0 lg:static lg:block">
            <Marker kind="finish" />
          </span>
          <p className="font-latin text-xs font-bold tracking-[0.08em] text-text-primary lg:mt-5">GOAL</p>
          <p className="mt-1.5 font-heading text-[15px] font-bold leading-[1.55] text-text-primary">
            コースのゴール
          </p>
          <p className="mt-2 text-xs leading-[1.8] text-text-secondary">
            <T f={course.finalGoal} />
          </p>
        </li>
      </ol>
    </section>
  );
}
