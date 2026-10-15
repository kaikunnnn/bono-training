/**
 * テンプレート v2（完成形）: ヒーロー — #242 問1の改善点を入れたもの
 *
 * v1 の CourseHero からの違い
 * - タイトル直下に「こんな人向け」1行（自分ごと）
 * - 得られる変化は v2 の書き直した文（Figma 原文は Course.change に残す）
 * - 件数は「公開中・近日公開」に分け、コース全体の目安時間（動画の合計）を出す
 * - ボタンの近くに料金の一文
 */

import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Calendar, Magicpen, MonitorMobbile, Profile2User } from "iconsax-react";
import { Button } from "@/components/ui/button";
import type { Course, CourseV2, LessonMap } from "../../data/types";
import CourseEyecatch, { pickCovers } from "../CourseEyecatch";
import { T } from "../kari";
import { ProgressBar } from "../path";
import type { CourseProgress } from "../progress";
import { courseCounts, formatMinutes, splitTitle } from "../shared";
import PriceNote from "./PriceNote";

export default function CourseHeroV2({
  course,
  v2,
  lessons,
  startHref,
  progress,
  totalMinutes,
  started = null,
  resumeArticleTitle = null,
}: {
  course: Course;
  v2: CourseV2;
  lessons: LessonMap;
  startHref: string | null;
  progress: CourseProgress | null;
  /** 公開中レッスンの動画の合計（分）。取れなければ null */
  totalMinutes: number | null;
  /** #243 トピック4: false=まだ始めていない（押すと ?started=1）／true=進めているコース／null=従来どおり */
  started?: boolean | null;
  /** 続きからの記事タイトル。無ければ「レッスン名の記事N」 */
  resumeArticleTitle?: string | null;
}) {
  const startLink = started === false ? `/dev/course-pages/v2/${course.slug}?started=1` : startHref;
  const { main, sub } = splitTitle(course.title.text);
  const counts = courseCounts(course);
  const published = counts.lessons - counts.planned;

  const meta = [
    { label: "得られる変化", icon: Magicpen, field: v2.change },
    { label: "期間", icon: Calendar, field: course.period },
    { label: "制作物", icon: MonitorMobbile, field: course.deliverable },
  ];

  return (
    <section aria-labelledby="course-title" className="pb-16 pt-6 md:pt-10 lg:pb-20">
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
        <Link href="/dev/course-pages/prototyping" className="hover:text-text-primary">
          ← プロトタイピングに戻る
        </Link>
        <Link href={`/dev/course-pages/${course.slug}`} className="font-bold text-text-link hover:underline">
          v1 と比べる →
        </Link>
      </div>
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
          <p className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-text-secondary px-2.5 py-0.5 text-xs font-bold text-text-secondary">
              コース
            </span>
            {started ? (
              <span className="inline-flex items-center rounded-full bg-text-primary px-2.5 py-0.5 text-xs font-bold text-text-inverse">
                進めているコース
              </span>
            ) : null}
          </p>
          <h1 className="mt-5 font-heading font-bold tracking-[-0.05em] text-text-primary" id="course-title">
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

          {/* こんな人向け（自分ごと） */}
          <p className="mt-4 flex items-start gap-2 text-[15px] font-bold leading-[1.7] text-text-primary">
            <Profile2User size={18} color="currentColor" variant="Linear" className="mt-[3px] shrink-0" />
            <span>
              <T f={v2.audienceLine} />
            </span>
          </p>

          <p className="mt-4 max-w-[520px] text-[15px] leading-[1.9] text-text-secondary">
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
              公開中 <strong className="font-latin text-base text-text-primary">{published}</strong>本
              {counts.planned > 0 ? <span className="text-text-muted">・近日公開 {counts.planned}本</span> : null}
            </span>
            {totalMinutes ? (
              <>
                <span aria-hidden="true" className="text-border-default">|</span>
                <span>
                  動画 <strong className="text-text-primary">{formatMinutes(totalMinutes)}</strong>
                </span>
              </>
            ) : null}
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
                    {resumeArticleTitle ?? `${progress.resume.title}の記事${progress.resume.articleNumber}`}
                  </span>
                  <ArrowRight strokeWidth={2.5} />
                </Link>
              </Button>
            ) : startLink ? (
              <Button asChild size="large">
                <Link href={startLink}>
                  このコースを始める
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
          {progress ? null : <PriceNote className="mt-4" />}
        </div>

        <div className="w-full max-w-[560px] lg:justify-self-end">
          <CourseEyecatch
            covers={pickCovers(course, lessons)}
            label={course.shortTitle.text}
            meta={`${counts.lessons} lessons`}
            sizes="(min-width: 1024px) 130px, 23vw"
            className="shadow-[var(--shadow-sm)]"
            plannedLabel="近日公開"
          />
        </div>
      </div>
    </section>
  );
}
