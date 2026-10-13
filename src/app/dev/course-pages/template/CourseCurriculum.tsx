/**
 * テンプレート＝全コース共通: カリキュラム — #241
 *
 * 目に入るのは「ステップ名と、その中のレッスンの並び」。各ステップは上から
 *   STEP 01（小）→ 小ゴール見出し（h3）→ なぜやるか1文（控えめ）
 *   → レッスン（主役。番号付きで縦に。h4）／チャレンジはお題と提出物
 *   → 終えると：〇〇（チェックポイント1行）
 * 先頭に sticky の小さな道のり（CurriculumPath）。白はレッスンの行（リンク）だけ。
 */

import { Flag } from "iconsax-react";
import type { Course, LessonMap } from "../data/types";
import ChallengeBlock from "./ChallengeBlock";
import CurriculumPath, { type PathItem } from "./CurriculumPath";
import { T } from "./kari";
import LessonRow from "./LessonRow";
import PlannedLessonRow from "./PlannedLessonRow";
import type { CourseProgress } from "./progress";
import { SectionHead, courseCounts, numberSteps, pad2 } from "./shared";

export default function CourseCurriculum({
  course,
  lessons,
  progress,
}: {
  course: Course;
  lessons: LessonMap;
  progress: CourseProgress | null;
}) {
  const counts = courseCounts(course);
  const numbered = numberSteps(course);

  const pathItems: PathItem[] = [
    ...numbered.map(({ index, goalNumber, step }) => ({
      stepNumber: index + 1,
      kind: step.kind === "challenge" ? ("challenge" as const) : ("goal" as const),
      label: step.kind === "challenge" ? "CHALLENGE" : `STEP ${pad2(goalNumber ?? 0)}`,
    })),
    { stepNumber: null, kind: "finish", label: "GOAL" },
  ];

  return (
    <section
      id="curriculum"
      aria-labelledby="course-curriculum"
      className="scroll-mt-16 border-t border-border-light py-16 md:py-20"
    >
      <SectionHead
        id="course-curriculum"
        kicker="Curriculum"
        title="カリキュラム"
        lead={`${counts.goals}つのステップと、最後のチャレンジ。上から順にレッスンを進めます。`}
      />

      <div className="mt-8">
        <CurriculumPath
          items={pathItems}
          statuses={progress ? progress.steps.map((s) => s.status) : undefined}
        />

        <div className="mt-10 flex max-w-[880px] flex-col gap-16">
          {numbered.map(({ step, index, goalNumber }) => {
            const challenge = step.kind === "challenge";
            const sp = progress?.steps[index];
            return (
              <div key={index} id={`curriculum-step-${index + 1}`} className="scroll-mt-28">
                <p className="flex flex-wrap items-baseline gap-x-3 font-latin text-xs font-bold tracking-[0.1em] text-text-muted">
                  {challenge ? "CHALLENGE" : `STEP ${pad2(goalNumber ?? 0)}`}
                  {sp && sp.lessonsTotal > 0 ? (
                    <span className="font-noto-sans-jp tracking-normal text-text-secondary">
                      {sp.status === "done" ? "✓ " : ""}レッスン {sp.lessonsDone}/{sp.lessonsTotal} 完了
                    </span>
                  ) : null}
                </p>
                <h3 className="mt-2 font-heading text-[22px] font-bold leading-[1.5] tracking-[-0.03em] text-text-primary [text-wrap:pretty] md:text-[26px]">
                  <T f={step.title} />
                </h3>
                <p className="mt-1.5 text-[13px] leading-[1.8] text-text-muted">
                  <T f={step.why} />
                </p>

                <div className="mt-5">
                  {challenge ? (
                    <ChallengeBlock step={step} />
                  ) : (
                    <ol className="flex flex-col gap-2.5">
                      {step.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          {item.type === "lesson" ? (
                            <LessonRow
                              slug={item.slug}
                              lesson={lessons[item.slug] ?? null}
                              number={itemIndex + 1}
                              progress={progress?.lessons[item.slug]}
                            />
                          ) : (
                            <PlannedLessonRow item={item} number={itemIndex + 1} />
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                {/* チェックポイント（押せないので白にしない） */}
                <p className="mt-4 flex items-start gap-2.5 rounded-[12px] bg-[var(--persona-hero-surface)] px-4 py-2.5 text-[13px] leading-[1.7] text-text-primary">
                  <Flag size={16} color="currentColor" variant="Bold" className="mt-[2px] shrink-0" />
                  <span>
                    <span className="mr-1 font-bold">終えると：</span>
                    <T f={step.gain} />
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
