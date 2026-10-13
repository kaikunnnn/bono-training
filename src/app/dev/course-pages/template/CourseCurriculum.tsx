/**
 * テンプレート＝全コース共通: カリキュラム（章立て・縦積み）— #241
 *
 * 各ステップ: 「STEP 01」ラベル＋横線 → 小ゴール見出し（h3）→ ◎このステップを終えると → レッスン行（h4）を全幅で縦に。
 * 外枠のカード・左の番号列・タイムラインは置かない。ステップ間は余白と線で区切る。
 * チャレンジも同じ章立てで ChallengeBlock が描く。
 */

import { Target } from "lucide-react";
import type { Course, LessonMap } from "../data/types";
import ChallengeBlock from "./ChallengeBlock";
import { T } from "./kari";
import LessonRow from "./LessonRow";
import PlannedLessonRow from "./PlannedLessonRow";
import { ChapterLabel, SectionHead, courseCounts, numberSteps, pad2 } from "./shared";

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

      <div className="mt-12 flex flex-col gap-16 md:gap-20">
        {numberSteps(course).map(({ step, index, goalNumber, firstLessonOrder }) => {
          if (step.kind === "challenge" || goalNumber === null) {
            return <ChallengeBlock key={index} step={step} index={index} />;
          }

          return (
            <div key={index} id={`curriculum-step-${index + 1}`} className="scroll-mt-24">
              <ChapterLabel label={`STEP ${pad2(goalNumber)}`} meta={`レッスン ${step.items.length}本`} />
              <h3 className="mt-5 font-heading text-[22px] font-bold leading-[1.5] tracking-[-0.03em] text-text-primary md:text-[26px]">
                <T f={step.title} />
              </h3>
              <p className="mt-3 flex flex-col gap-1.5 text-sm leading-[1.85] text-text-primary md:flex-row md:items-start md:gap-3">
                <span className="inline-flex shrink-0 items-center gap-1.5 self-start pt-[3px] text-xs font-bold text-text-muted">
                  <Target size={14} strokeWidth={2.5} />
                  このステップを終えると
                </span>
                <span>
                  <T f={step.goal} />
                </span>
              </p>

              <ol className="mt-7 flex flex-col gap-3">
                {step.items.map((item, itemIndex) => {
                  const order = firstLessonOrder + itemIndex;
                  return (
                    <li key={itemIndex}>
                      {item.type === "lesson" ? (
                        <LessonRow slug={item.slug} lesson={lessons[item.slug] ?? null} order={order} />
                      ) : (
                        <PlannedLessonRow item={item} order={order} />
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}
