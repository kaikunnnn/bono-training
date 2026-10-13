/**
 * テンプレート＝全コース共通: 最後のCTA — #241
 */

import Link from "next/link";
import { ArrowRight, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Course } from "../data/types";
import { T } from "./kari";
import { courseCounts, splitTitle } from "./shared";

export default function CourseFinalCta({
  course,
  startHref,
}: {
  course: Course;
  startHref: string | null;
}) {
  const counts = courseCounts(course);
  const { main } = splitTitle(course.title.text);

  return (
    <section aria-labelledby="course-final-cta" className="pb-28 pt-4">
      <div className="rounded-[32px] bg-[image:var(--persona-cta-gradient)] px-6 py-12 text-center text-text-inverse md:px-12 md:py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-inverse/70">Start the course</p>
        <h2
          id="course-final-cta"
          className="mt-3 font-heading text-2xl font-bold leading-[1.5] tracking-[-0.04em] md:text-[32px]"
        >
          {main}をはじめよう
        </h2>
        <p className="mx-auto mt-3 max-w-[520px] text-sm leading-[1.9] text-text-inverse/85">
          <T f={course.finalGoal} />
          <span className="mt-1 block text-xs text-text-inverse/70">
            ステップ {counts.goals}つ＋チャレンジ・レッスン {counts.lessons}本・期間の目安 {course.period.text}
          </span>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {startHref ? (
            <Button asChild variant="outline" size="large" className="border-transparent">
              <Link href={startHref}>
                最初のレッスンへ進む
                <ArrowRight strokeWidth={2.5} />
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline-dark" size="large">
            <a href="#curriculum">
              カリキュラムをもう一度見る
              <ArrowUp />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
