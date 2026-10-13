/**
 * テンプレート＝全コース共通: ヒーロー — #241
 *
 * 左: 小ラベル → h1（コース名）→ ひとこと → 得られる変化/期間/制作物 → 件数 → CTA
 * 右: アイキャッチ（16:10、最大 560px）
 */

import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Calendar, Magicpen, MonitorMobbile } from "iconsax-react";
import { Button } from "@/components/ui/button";
import type { Course, LessonMap } from "../data/types";
import CourseEyecatch, { pickCovers } from "./CourseEyecatch";
import { T } from "./kari";
import { ProgressBar } from "./path";
import type { CourseProgress } from "./progress";
import { courseCounts, splitTitle } from "./shared";

export default function CourseHero({
  course,
  lessons,
  startHref,
  progress,
}: {
  course: Course;
  lessons: LessonMap;
  startHref: string | null;
  /** 進行中の会員のときだけ。進捗バーと「続きから」を出す */
  progress: CourseProgress | null;
}) {
  const { main, sub } = splitTitle(course.title.text);
  const counts = courseCounts(course);

  const meta = [
    { label: "得られる変化", icon: Magicpen, field: course.change },
    { label: "期間", icon: Calendar, field: course.period },
    { label: "制作物", icon: MonitorMobbile, field: course.deliverable },
  ];

  return (
    <section aria-labelledby="course-title" className="pb-16 pt-6 md:pt-10 lg:pb-20">
      <Link
        href="/dev/course-pages/prototyping"
        className="mb-4 inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
      >
        ← プロトタイピングに戻る
      </Link>
      <nav aria-label="パンくずリスト" className="flex items-center gap-2 text-xs text-text-muted">
        <Link href="/dev/course-pages" className="hover:text-text-primary">
          コース
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-text-secondary" aria-current="page">
          {main}
        </span>
      </nav>

      <div className="mt-8 grid items-center gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-12">
        <div className="min-w-0">
          <p className="inline-flex items-center rounded-full border border-text-secondary px-2.5 py-0.5 text-xs font-bold text-text-secondary">
            コース
          </p>
          <h1
            id="course-title"
            className="mt-5 font-heading font-bold tracking-[-0.05em] text-text-primary"
          >
            <span className="block text-[32px] leading-[1.35] [word-break:keep-all] md:text-[40px]">
              {main.endsWith("コース") ? (
                <>
                  {main.slice(0, -3)}
                  <wbr />
                  コース
                </>
              ) : (
                main
              )}
            </span>
            {sub ? (
              <span className="mt-2 block text-[19px] leading-[1.5] tracking-[-0.03em] text-text-secondary md:text-[24px]">
                {sub}
              </span>
            ) : null}
          </h1>
          <p className="mt-5 max-w-[520px] text-[15px] leading-[1.9] text-text-secondary">
            <T f={course.tagline} />
          </p>

          <dl className="mt-7 max-w-[540px] divide-y divide-dashed divide-border-light border-y border-border-light">
            {meta.map(({ label, icon: Icon, field }) => (
              <div key={label} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:gap-4">
                <dt className="flex shrink-0 items-center gap-2 self-start text-xs font-bold leading-[1.9] text-text-muted sm:w-[108px]">
                  <Icon size={16} color="currentColor" variant="Linear" />
                  {label}
                </dt>
                <dd className="min-w-0 text-sm font-bold leading-[1.7] text-text-primary">
                  <T f={field} />
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-text-secondary">
            <span>
              ステップ <strong className="font-latin text-base text-text-primary">{counts.goals}</strong>
              {counts.hasChallenge ? " ＋ チャレンジ" : ""}
            </span>
            <span aria-hidden="true" className="text-border-default">|</span>
            <span>
              レッスン <strong className="font-latin text-base text-text-primary">{counts.lessons}</strong>本
              {counts.planned > 0 ? (
                <span className="text-text-muted">（うち未制作 {counts.planned}本）</span>
              ) : null}
            </span>
          </p>

          {progress ? (
            <div className="mt-7 flex max-w-[540px] items-center gap-3">
              <ProgressBar value={progress.percent} className="h-1.5 flex-1" />
              <span className="shrink-0 text-xs font-bold text-text-secondary">
                {progress.percent}% 完了・記事 {progress.articlesDone}/{progress.articlesTotal}
              </span>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {progress?.resume ? (
              <Button asChild size="large" className="h-auto min-h-12 whitespace-normal py-2.5 text-left">
                <Link href={`/lessons/${progress.resume.slug}`}>
                  <span>
                    <span className="block text-[11px] font-medium opacity-80">続きから</span>
                    {progress.resume.title}の記事{progress.resume.articleNumber}
                  </span>
                  <ArrowRight strokeWidth={2.5} />
                </Link>
              </Button>
            ) : startHref ? (
              <Button asChild size="large">
                <Link href={startHref}>
                  このコースをはじめる
                  <ArrowRight strokeWidth={2.5} />
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline-ghost" size="large">
              <a href="#curriculum">
                カリキュラムを見る
                <ArrowDown />
              </a>
            </Button>
          </div>
        </div>

        <div className="w-full max-w-[560px] lg:justify-self-end">
          <CourseEyecatch
            covers={pickCovers(course, lessons)}
            label={course.shortTitle.text}
            meta={`${counts.lessons} lessons`}
            sizes="(min-width: 1024px) 130px, 23vw"
            className="shadow-[var(--shadow-sm)]"
          />
        </div>
      </div>
    </section>
  );
}
