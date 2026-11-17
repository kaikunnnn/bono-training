/**
 * /dev/course-pages/v3 — 個別ロードマップ4本をコースに置き換えた一覧（#300）
 *
 * カードは v1 のコース一覧（/dev/course-pages）のカード（CourseEyecatch＋見出し＋情報の行）を流用し、
 * 中身を「名前・1行・期間・本数」に差し替えた。並びは転職ロードマップの順。
 * 確認用（画面下のバー）:
 * - ?state=guest（既定）… 未課金に見える形。「最初の1本は無料」「目次を見る」
 * - ?state=member … 課金後。各カードに進み具合（何本中何本・モック）と「続きから」
 * - ?name=a|b … 名前の2案（カードの名前と1行が変わる）
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { coursesV3, lessonSlugsV3, parseName, progressMocksV3, resolveCourse, V3_BASE } from "../data/v3";
import { fetchLessons } from "../data/sanity-lessons";
import type { LessonRef } from "../data/types";
import CourseEyecatch, { pickCovers } from "../template/CourseEyecatch";
import { KariProvider, T } from "../template/kari";
import { ProgressBar } from "../template/path";
import { computeProgress } from "../template/progress";
import { courseCounts, splitTitle } from "../template/shared";
import { nameSegment, parseState, stateSegment } from "./switches";

export const metadata: Metadata = {
  title: "コース一覧（v3 プロト）",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function CourseListV3Page({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const name = parseName(one(query.name));
  const state = parseState(one(query.state));
  const member = state === "member";

  const list = coursesV3.map((entry) => ({ entry, course: resolveCourse(entry, name) }));
  const lessons = await fetchLessons(list.flatMap(({ course }) => lessonSlugsV3(course)));

  const keep = new URLSearchParams();
  if (name !== "a") keep.set("name", name);
  if (member) keep.set("state", "member");
  const qs = keep.toString() ? `?${keep.toString()}` : "";

  return (
    <KariProvider segments={[nameSegment(name), stateSegment(state)]}>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-10 md:px-10 md:pt-14">
          <Link
            href="/dev/course-pages/prototyping"
            className="mb-6 inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
          >
            ← プロトタイピングに戻る
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">Courses</p>
          <h1 className="mt-3 font-heading text-[30px] font-bold leading-[1.4] tracking-[-0.05em] md:text-[40px]">
            コース
          </h1>
          <p className="mt-3 max-w-[560px] text-[15px] leading-[1.9] text-text-secondary">
            {member
              ? "進めているコースの続きから再開できます。上から順に進めると、転職ロードマップの流れに沿って進めます。"
              : "なりたい状態ごとに、レッスンを順番に並べたコースです。どのコースも目次を見られて、最初の1本は無料で見られます。"}
          </p>

          <ul className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2">
            {list.map(({ entry, course }) => {
              const { main, sub } = splitTitle(course.title.text);
              const counts = courseCounts(course);
              const href = `${V3_BASE}/${course.slug}${qs}`;
              const first = course.steps.flatMap((s) => s.items).find((i): i is LessonRef => i.type === "lesson");
              const progress = member
                ? computeProgress(course, lessons, progressMocksV3[course.slug] ?? {})
                : null;
              const lessonsDone = progress ? progress.steps.reduce((sum, s) => sum + s.lessonsDone, 0) : 0;
              const lessonsTotal = progress ? progress.steps.reduce((sum, s) => sum + s.lessonsTotal, 0) : 0;
              const notStarted = progress ? progress.articlesDone === 0 : false;

              return (
                <li key={course.slug}>
                  <Link href={href} className="group block" aria-label={`${main}を見る`}>
                    <CourseEyecatch
                      covers={pickCovers(course, lessons)}
                      label={course.shortTitle.text}
                      meta={`${counts.lessons} lessons`}
                      sizes="(min-width: 768px) 120px, 23vw"
                      className="transition-shadow group-hover:shadow-[var(--shadow-md)]"
                    />
                  </Link>
                  <div className="mt-5 px-1">
                    <h2 className="font-heading text-xl font-bold leading-[1.5] tracking-[-0.03em]">
                      <Link href={href} className="hover:underline">
                        {main}
                        {sub ? <span className="mt-0.5 block text-[15px] text-text-secondary">{sub}</span> : null}
                      </Link>
                    </h2>
                    <p className="mt-3 text-sm font-medium leading-[1.8] text-text-primary">
                      <T f={entry.names[name].cardLine} />
                    </p>
                    <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] leading-[1.7]">
                      <div className="flex gap-2">
                        <dt className="text-text-muted">期間</dt>
                        <dd className="font-medium">
                          <T f={course.period} />
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-text-muted">レッスン</dt>
                        <dd className="font-medium">
                          {counts.lessons}本（{counts.goals}章{counts.hasChallenge ? "＋実践" : ""}）
                        </dd>
                      </div>
                    </dl>

                    {progress ? (
                      <div className="mt-5">
                        <div className="flex items-center gap-3">
                          <ProgressBar value={progress.percent} className="h-1.5 flex-1" />
                          <span className="shrink-0 text-xs font-bold text-text-secondary">
                            {lessonsTotal}本中{lessonsDone}本 完了
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {progress.resume ? (
                            <Button asChild className="h-auto min-h-10 whitespace-normal py-2 text-left">
                              <Link href={`/lessons/${progress.resume.slug}`}>
                                <span>
                                  <span className="block text-[11px] font-medium opacity-80">
                                    {notStarted ? "最初の1本から" : "続きから"}
                                  </span>
                                  {progress.resume.title}
                                  {notStarted ? "" : `（記事${progress.resume.articleNumber}）`}
                                </span>
                                <ArrowRight strokeWidth={2.5} />
                              </Link>
                            </Button>
                          ) : null}
                          <Button asChild variant="outline-ghost">
                            <Link href={`${href}#curriculum`}>目次を見る</Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        {first ? (
                          <Button asChild>
                            <Link href={`/lessons/${first.slug}`}>
                              最初の1本は無料
                              <ArrowRight strokeWidth={2.5} />
                            </Link>
                          </Button>
                        ) : null}
                        <Button asChild variant="outline-ghost">
                          <Link href={`${href}#curriculum`}>目次を見る</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </KariProvider>
  );
}
