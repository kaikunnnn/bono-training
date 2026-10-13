/**
 * テンプレート＝全コース共通: カリキュラム — #241
 *
 * ロードマップ詳細の CurriculumStep を寄せたもの。
 * ステップ番号バッジ＋小ゴール見出し（h3）＋ゴール文 → その下にレッスン行（h4）。
 * チャレンジは ChallengeBlock で見た目を変える。
 */

import { Target } from "lucide-react";
import type { Course, LessonMap } from "../data/types";
import ChallengeBlock from "./ChallengeBlock";
import { T } from "./kari";
import LessonRow from "./LessonRow";
import PlannedLessonRow from "./PlannedLessonRow";
import { SectionHead, StepBadge, courseCounts, numberSteps, pad2 } from "./shared";

export default function CourseCurriculum({
  course,
  lessons,
}: {
  course: Course;
  lessons: LessonMap;
}) {
  const counts = courseCounts(course);

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
        lead={`${counts.goals}つのステップと、最後のチャレンジで構成しています。ステップごとのゴールを越えながら、上から順に進めてください。`}
      />

      <div className="mt-10 flex flex-col gap-6">
        {numberSteps(course).map(({ step, index, goalNumber, firstLessonOrder }) => {
          if (step.kind === "challenge" || goalNumber === null) {
            return <ChallengeBlock key={index} step={step} index={index} />;
          }

          return (
            <div
              key={index}
              id={`curriculum-step-${index + 1}`}
              className="scroll-mt-24 rounded-[32px] border border-border-light bg-surface"
            >
              {/* ステップの見出し */}
              <div className="flex flex-col gap-4 p-5 md:flex-row md:gap-6 md:p-8">
                <StepBadge number={goalNumber} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-text-muted">
                    小ゴール {pad2(goalNumber)}
                    <span className="ml-3 font-medium">レッスン {step.items.length}本</span>
                  </p>
                  <h3 className="mt-1.5 font-heading text-lg font-bold leading-[1.6] text-text-primary md:text-[22px]">
                    <T f={step.title} />
                  </h3>
                  <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-start md:gap-3">
                    <span className="inline-flex shrink-0 items-center gap-1 self-start rounded-[8px] bg-muted-custom px-2.5 py-1 text-[11px] font-bold text-text-primary">
                      <Target size={12} strokeWidth={2.5} />
                      このステップを終えると
                    </span>
                    <p className="text-sm leading-[1.85] text-text-primary md:pt-px">
                      <T f={step.goal} />
                    </p>
                  </div>
                </div>
              </div>

              <div className="mx-5 border-t border-border-light md:mx-8" />

              {/* レッスン一覧（PC は左にタイムライン） */}
              <div className="flex p-5 md:p-8">
                <div className="relative mr-6 hidden w-[72px] shrink-0 md:block" aria-hidden="true">
                  <span className="absolute bottom-6 left-1/2 top-6 w-px -translate-x-1/2 bg-border-light" />
                </div>
                <ol className="flex min-w-0 flex-1 flex-col gap-4">
                  {step.items.map((item, itemIndex) => {
                    const lessonOrder = firstLessonOrder + itemIndex;
                    return (
                      <li key={itemIndex} className="relative">
                        <span
                          aria-hidden="true"
                          className="absolute -left-[65px] top-1/2 hidden size-2.5 -translate-y-1/2 rounded-full border-2 border-surface bg-border-default md:block"
                        />
                        {item.type === "lesson" ? (
                          <LessonRow slug={item.slug} lesson={lessons[item.slug] ?? null} order={lessonOrder} />
                        ) : (
                          <PlannedLessonRow item={item} order={lessonOrder} />
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
