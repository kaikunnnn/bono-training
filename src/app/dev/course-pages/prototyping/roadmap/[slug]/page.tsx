/**
 * /dev/course-pages/prototyping/roadmap/[slug] — C ロードマップの詳細（#243）
 *
 * ロードマップ＝地図。並べるのはコースとコース外のやることだけで、レッスンは出さない（数だけ）。
 * - ヒーロー: 行き先・誰向け・到達する状態・期間の目安・「最初の1コースからはじめる」
 * - 道のり: 区切りを縦に、短いコネクタでつないだカードで見せる
 *   コース＝白いカード（v2 のコースへ）／準備中のコース＝点線・薄く／コース外のやること＝アイコン付きの別の見た目
 * - ?progress=1: 完了した区切りに ✓、いまここを強調、次の1コースを大きく出す（モック）
 * - 末尾: ほかの行き先を見る
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { Calendar, Profile2User } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { courses, getCourse, lessonSlugs } from "../../../data";
import { getRoadmap, roadmaps, stopLabel, type Roadmap, type RoadmapStop } from "../../../data/roadmaps";
import { fetchLessons } from "../../../data/sanity-lessons";
import type { LessonMap } from "../../../data/types";
import CourseEyecatch, { pickCovers } from "../../../template/CourseEyecatch";
import { KariProvider, T } from "../../../template/kari";
import { courseCounts, pad2, splitTitle } from "../../../template/shared";
import { MiniPath, ROADMAP_BASE, StopIcon, firstCourseSlug, roadmapStats } from "../parts";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ progress?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const r = getRoadmap(slug);
  return {
    title: r ? `${r.name}ロードマップ（プロト）` : "ロードマップ（プロト）",
    robots: { index: false, follow: false },
  };
}

function stopKindLabel(stop: RoadmapStop) {
  if (stop.type === "course") return "コース";
  if (stop.type === "planned-course") return "準備中のコース";
  return "コースの外でやること";
}

function CourseStopCard({
  slug,
  lessons,
  note,
  emphasized,
}: {
  slug: string;
  lessons: LessonMap;
  note: React.ReactNode;
  emphasized: boolean;
}) {
  const course = getCourse(slug);
  if (!course) return null;
  const { main, sub } = splitTitle(course.title.text);
  const c = courseCounts(course);
  return (
    <Link
      href={`/dev/course-pages/v2/${slug}`}
      className={cn(
        "group flex flex-col gap-4 rounded-[20px] border bg-surface p-4 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:shadow-[var(--shadow-md)] sm:flex-row sm:items-center sm:gap-5 md:p-5",
        emphasized ? "border-text-primary" : "border-border-light hover:border-border-default"
      )}
    >
      <div className="w-full shrink-0 sm:w-[176px]">
        <CourseEyecatch covers={pickCovers(course, lessons)} label="" sizes="44px" className="rounded-[14px]" plannedLabel="近日公開" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-[17px] font-bold leading-[1.5] text-text-primary">{main}</h3>
        {sub ? <p className="text-xs font-bold text-text-secondary">{sub}</p> : null}
        <p className="mt-2 text-[13px] leading-[1.8] text-text-secondary">{note}</p>
        <p className="mt-2 text-xs text-text-muted">
          レッスン {c.lessons}本{c.planned > 0 ? `（近日公開 ${c.planned}本）` : ""}・{course.period.text}
        </p>
      </div>
      <ArrowRight size={20} className="hidden shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 sm:block" />
    </Link>
  );
}

function StopCard({
  stop,
  lessons,
  emphasized,
}: {
  stop: RoadmapStop;
  lessons: LessonMap;
  emphasized: boolean;
}) {
  const note = <T f={stop.note} />;
  if (stop.type === "course") {
    return <CourseStopCard slug={stop.slug} lessons={lessons} note={note} emphasized={emphasized} />;
  }
  if (stop.type === "planned-course") {
    // 押せないので白にしない。点線＋薄く
    return (
      <div
        className={cn(
          "rounded-[20px] border-2 border-dashed p-4 md:p-5",
          emphasized ? "border-text-primary/40" : "border-border-light"
        )}
      >
        <h3 className="font-heading text-[17px] font-bold leading-[1.5] text-text-disabled">{stop.title}</h3>
        <p className="mt-2 text-[13px] leading-[1.8] text-text-muted">{note}</p>
      </div>
    );
  }
  // コース外のやること: アイコン付きの別の見た目（押せるのでリンク）
  const external = stop.href.startsWith("http");
  return (
    <Link
      href={stop.href}
      target={external ? "_blank" : undefined}
      className={cn(
        "group flex items-start gap-4 rounded-full border bg-surface py-3 pl-3 pr-5 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:shadow-[var(--shadow-md)] max-sm:rounded-[20px]",
        emphasized ? "border-text-primary" : "border-border-light hover:border-border-default"
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--persona-hero-surface)] text-text-primary">
        <StopIcon stop={stop} />
      </span>
      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="font-heading text-[16px] font-bold leading-[1.5] text-text-primary">{stop.title}</h3>
        <p className="mt-0.5 text-[13px] leading-[1.75] text-text-secondary">{note}</p>
      </div>
      <ArrowRight size={18} className="mt-3 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function StatusTag({ status }: { status: "done" | "current" | "todo" | "plain" }) {
  if (status === "done")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-text-success px-2 py-0.5 text-[11px] font-bold text-text-inverse">
        <Check size={11} strokeWidth={3.5} />
        完了
      </span>
    );
  if (status === "current")
    return (
      <span className="rounded-full bg-text-primary px-2 py-0.5 text-[11px] font-bold text-text-inverse">いまここ</span>
    );
  return null;
}

function NextCourse({ roadmap, done, lessons }: { roadmap: Roadmap; done: number; lessons: LessonMap }) {
  // いまここ以降で最初の既存コース
  const next = roadmap.stops.slice(done).find((s) => s.type === "course");
  const current = roadmap.stops[done];
  return (
    <section aria-labelledby="rm-next" className="mt-10">
      <h2 id="rm-next" className="font-heading text-xl font-bold tracking-[-0.03em]">
        次の1コース
      </h2>
      {current && current.type !== "course" ? (
        <p className="mt-2 text-sm text-text-secondary">
          いまの区切り「{stopLabel(current)}」は{current.type === "planned-course" ? "準備中のコースです" : "コースの外でやることです"}。
        </p>
      ) : null}
      <div className="mt-4">
        {next && next.type === "course" ? (
          <CourseStopCard slug={next.slug} lessons={lessons} note={<T f={next.note} />} emphasized />
        ) : (
          <p className="rounded-[20px] border-2 border-dashed border-border-light p-5 text-sm text-text-muted">
            この先のコースは準備中です。
          </p>
        )}
      </div>
    </section>
  );
}

export default async function RoadmapDetailPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  const { progress } = await searchParams;
  const roadmap = getRoadmap(slug);
  if (!roadmap) notFound();

  const lessons = await fetchLessons(Object.values(courses).flatMap(lessonSlugs));
  const stats = roadmapStats(roadmap);
  const done = progress === "1" ? roadmap.progressDone : null;
  // 進捗なし: 最初の1コース／進捗あり: いまここ以降で最初のコース
  const nextStop = done !== null ? roadmap.stops.slice(done).find((st) => st.type === "course") : null;
  const first = done !== null ? (nextStop && nextStop.type === "course" ? nextStop.slug : null) : firstCourseSlug(roadmap);

  return (
    <KariProvider preview={{ progress: done !== null }}>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[880px] px-4 pb-28 pt-8 md:px-10 md:pt-12">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
            <Link href={`${ROADMAP_BASE}`} className="hover:text-text-primary">
              ← ロードマップのプロト
            </Link>
            <Link href={`${ROADMAP_BASE}/list`} className="hover:text-text-primary">
              行き先を選ぶ
            </Link>
          </div>

          {/* ヒーロー */}
          <header className="mt-8">
            <p className="inline-flex items-center rounded-full border border-text-secondary px-2.5 py-0.5 text-xs font-bold text-text-secondary">
              ロードマップ
            </p>
            <h1 className="mt-4 font-heading text-[30px] font-bold leading-[1.4] tracking-[-0.05em] md:text-[40px]">
              {roadmap.name}
            </h1>
            <p className="mt-3 flex items-start gap-2 text-[15px] font-bold leading-[1.7]">
              <Profile2User size={18} color="currentColor" variant="Linear" className="mt-[3px] shrink-0" />
              <span>
                <T f={roadmap.audience} />
              </span>
            </p>
            <p className="mt-4 max-w-[680px] text-[16px] leading-[1.9] text-text-secondary">
              <T f={roadmap.outcome} />
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Calendar size={16} color="currentColor" variant="Linear" />
                期間の目安 <strong className="text-text-primary"><T f={roadmap.period} /></strong>
              </span>
              <span aria-hidden="true" className="text-border-default">|</span>
              <span>
                区切り <strong className="text-text-primary">{stats.stops}</strong>
                （コース {stats.courses}・準備中のコース {stats.planned}・コースの外 {stats.outside}）
              </span>
            </p>

            {done !== null ? (
              <div className="mt-6 max-w-[560px]">
                <p className="text-xs font-bold text-text-secondary">
                  いまここ：{done}/{stats.stops} まで
                </p>
                <MiniPath roadmap={roadmap} done={done} className="mt-2" />
              </div>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-3">
              {first ? (
                <Button asChild size="large">
                  <Link href={`/dev/course-pages/v2/${first}`}>
                    {done !== null ? "次の1コースへ進む" : "最初の1コースからはじめる"}
                    <ArrowRight strokeWidth={2.5} />
                  </Link>
                </Button>
              ) : (
                <p className="rounded-[14px] border-2 border-dashed border-border-light px-4 py-3 text-sm text-text-muted">
                  このロードマップのコースは準備中です
                </p>
              )}
              <Button asChild variant="outline-ghost" size="large">
                <a href="#rm-path">道のりを見る</a>
              </Button>
            </div>
          </header>

          {done !== null ? <NextCourse roadmap={roadmap} done={done} lessons={lessons} /> : null}

          {/* 道のり */}
          <section id="rm-path" aria-labelledby="rm-path-title" className="mt-14 scroll-mt-16 border-t border-border-light pt-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">Path</p>
            <h2 id="rm-path-title" className="mt-2 font-heading text-[24px] font-bold tracking-[-0.04em] md:text-[28px]">
              道のり
            </h2>
            <p className="mt-2 text-sm leading-[1.85] text-text-secondary">
              コースと、コースの外でやることを順番に並べています。レッスンの中身は各コースのページで確かめられます。
            </p>
            <ol className="mt-8">
              {roadmap.stops.map((stop, i) => {
                const status = done === null ? "plain" : i < done ? "done" : i === done ? "current" : "todo";
                return (
                  <li key={i}>
                    {i > 0 ? <span aria-hidden="true" className="ml-8 block h-7 w-px bg-border-default" /> : null}
                    <div className={cn(status === "done" && "opacity-75")}>
                      <p className="mb-2 flex items-center gap-2 font-latin text-[11px] font-bold tracking-[0.1em] text-text-muted">
                        {pad2(i + 1)}
                        <span className="font-noto-sans-jp tracking-normal">{stopKindLabel(stop)}</span>
                        <StatusTag status={status} />
                      </p>
                      <StopCard stop={stop} lessons={lessons} emphasized={status === "current"} />
                    </div>
                  </li>
                );
              })}
              <li>
                <span aria-hidden="true" className="ml-8 block h-7 w-px bg-border-default" />
                <div className="rounded-[20px] bg-[var(--persona-hero-surface)] px-5 py-4">
                  <p className="text-xs font-bold text-text-muted">行き先</p>
                  <p className="mt-1 text-[15px] font-bold leading-[1.7]">
                    <T f={roadmap.outcome} />
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* ほかの行き先 */}
          <section aria-labelledby="rm-others" className="mt-14 border-t border-border-light pt-10">
            <h2 id="rm-others" className="font-heading text-xl font-bold tracking-[-0.03em]">
              ほかの行き先
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {roadmaps
                .filter((r) => r.slug !== roadmap.slug)
                .map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`${ROADMAP_BASE}/${r.slug}`}
                      className="inline-flex rounded-full border border-border-light bg-surface px-3 py-1.5 text-xs font-bold hover:border-border-default"
                    >
                      {r.name}
                    </Link>
                  </li>
                ))}
            </ul>
            <Link
              href={`${ROADMAP_BASE}/list`}
              className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-text-primary hover:underline"
            >
              ほかの行き先を見る
              <ArrowRight size={15} />
            </Link>
          </section>
        </div>
      </div>
    </KariProvider>
  );
}
