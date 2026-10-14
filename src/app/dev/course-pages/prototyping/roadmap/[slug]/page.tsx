/**
 * /dev/course-pages/prototyping/roadmap/[slug] — C ロードマップの詳細（#243 v2案）
 *
 * ロードマップ＝地図。並べるのはコースとコース外のやることだけで、レッスンは出さない。
 * セクションは issue 243「ロードマップ詳細の構成（v2案）」の順:
 * 1. ヒーロー（行き先・誰向け・たどり着く状態・期間・コースN＋コース外N・「最初のコースから始める」・無料で読める）
 *    ?progress=1 のときはヒーロー下に「いまここ」と次の1コース
 * 2. 自分に合うか（向いている人／別の行き先が合う人 → 他のロードマップ）
 * 3. たどり着いたときの姿（できること3つ＋手元に残るもの）
 * 4. 道のり（区切りごとに なぜこの順番か／次へ進んでよい目安。?progress=1 で終えた目安に印）
 * 5. コースの外でやること（道しるべ）
 * 6. 進め方の目安（週の時間別の期間）
 * 7. よくある迷い
 * 8. ほかの行き先
 * 押せるものだけ白。文言は data/roadmaps.ts（すべて仮）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Plus } from "lucide-react";
import { Briefcase, Book1, Calendar, Flag, Map1, MessageText, Profile2User, Routing2, TickCircle } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { courses, getCourse, lessonSlugs } from "../../../data";
import {
  getRoadmap,
  roadmaps,
  stopLabel,
  type OutsideKind,
  type Roadmap,
  type RoadmapStop,
} from "../../../data/roadmaps";
import { fetchLessons } from "../../../data/sanity-lessons";
import type { Field, LessonMap } from "../../../data/types";
import CourseEyecatch, { pickCovers } from "../../../template/CourseEyecatch";
import { KariProvider, T } from "../../../template/kari";
import { pad2, SectionHead, splitTitle } from "../../../template/shared";
import { hereLabel } from "../../../template/path";
import { MiniPath, ROADMAP_BASE, StopIcon, firstCourseSlug, roadmapStats } from "../parts";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ progress?: string }>;

const k = (text: string): Field => ({ text, kari: true });

const SECTION = "border-t border-border-light py-14 md:py-16";
/** 押せるもの（白） */
const CLICKABLE =
  "border border-border-light bg-surface shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]";

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

function GuideIcon({ kind, size = 20 }: { kind: OutsideKind; size?: number }) {
  if (kind === "portfolio") return <Book1 size={size} color="currentColor" variant="Linear" />;
  if (kind === "feedback") return <MessageText size={size} color="currentColor" variant="Linear" />;
  return <Briefcase size={size} color="currentColor" variant="Linear" />;
}

/* ---------- 道のりのカード ---------- */

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
  return (
    <Link
      href={`/dev/course-pages/v2/${slug}`}
      className={cn(
        "group flex flex-col gap-4 rounded-[20px] p-4 sm:flex-row sm:items-center sm:gap-5 md:p-5",
        CLICKABLE,
        emphasized && "border-text-primary hover:border-text-primary"
      )}
    >
      <div className="hidden w-[156px] shrink-0 sm:block">
        <CourseEyecatch covers={pickCovers(course, lessons)} label="" sizes="44px" className="rounded-[14px]" plannedLabel="近日公開" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-[17px] font-bold leading-[1.5] text-text-primary">{main}</h3>
        {sub ? <p className="text-xs font-bold text-text-secondary">{sub}</p> : null}
        <p className="mt-2 text-[13px] leading-[1.8] text-text-secondary">{note}</p>
        <p className="mt-2 flex items-center gap-1 text-xs font-bold text-text-primary">
          コースを見る
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </p>
      </div>
    </Link>
  );
}

function StopCard({ stop, lessons, emphasized }: { stop: RoadmapStop; lessons: LessonMap; emphasized: boolean }) {
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
        "group flex items-start gap-4 rounded-full py-3 pl-3 pr-5 max-sm:rounded-[20px]",
        CLICKABLE,
        emphasized && "border-text-primary hover:border-text-primary"
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
    return <span className="rounded-full bg-text-primary px-2 py-0.5 text-[11px] font-bold text-text-inverse">いまここ</span>;
  return null;
}

/** 区切りの下: なぜこの順番か／次へ進んでよい目安（終えた区切りは印つき） */
function StopReason({ stop, done }: { stop: RoadmapStop; done: boolean }) {
  return (
    <dl className="mt-3 grid gap-2 px-1 text-[13px] leading-[1.75] sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-3">
      <dt className="text-xs font-bold leading-[1.75] text-text-muted sm:pt-px">なぜこの順番</dt>
      <dd className="-mt-1.5 text-text-secondary sm:mt-0">
        <T f={stop.whyHere} />
      </dd>
      <dt
        className={cn(
          "flex items-center gap-1 text-xs font-bold leading-[1.75] sm:pt-px",
          done ? "text-text-success" : "text-text-muted"
        )}
      >
        {done ? (
          <TickCircle size={14} color="currentColor" variant="Bold" />
        ) : (
          <Flag size={14} color="currentColor" variant="Linear" />
        )}
        {done ? "目安クリア" : "次へ進む目安"}
      </dt>
      <dd className={cn("-mt-1.5 font-bold sm:mt-0", done ? "text-text-success" : "text-text-primary")}>
        <T f={stop.checkpoint} />
      </dd>
    </dl>
  );
}

/* ---------- 進行中の会員: 次の1コース ---------- */

function NextCourse({ roadmap, done, lessons }: { roadmap: Roadmap; done: number; lessons: LessonMap }) {
  const next = roadmap.stops.slice(done).find((s) => s.type === "course");
  const current = roadmap.stops[done];
  return (
    <section aria-labelledby="rm-next" className="pb-14">
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
          <>
            <CourseStopCard slug={next.slug} lessons={lessons} note={<T f={next.note} />} emphasized />
            <p className="mt-3 flex items-start gap-1.5 px-1 text-[13px] font-bold leading-[1.75]">
              <Flag size={14} color="currentColor" variant="Linear" className="mt-[3px] shrink-0 text-text-muted" />
              <span>
                <span className="text-text-muted">終えたら次へ進む目安：</span>
                <T f={next.checkpoint} />
              </span>
            </p>
          </>
        ) : (
          <p className="rounded-[20px] border-2 border-dashed border-border-light p-5 text-sm text-text-muted">
            この先のコースは準備中です。
          </p>
        )}
      </div>
    </section>
  );
}

/* ---------- ページ ---------- */

export default async function RoadmapDetailPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  const { progress } = await searchParams;
  const roadmap = getRoadmap(slug);
  if (!roadmap) notFound();

  const lessons = await fetchLessons(Object.values(courses).flatMap(lessonSlugs));
  const stats = roadmapStats(roadmap);
  const done = progress === "1" ? roadmap.progressDone : null;
  // 進捗なし: 最初のコース／進捗あり: いまここ以降で最初のコース
  const nextStop = done !== null ? roadmap.stops.slice(done).find((st) => st.type === "course") : null;
  const first = done !== null ? (nextStop && nextStop.type === "course" ? nextStop.slug : null) : firstCourseSlug(roadmap);
  // 別の行き先: 解決できない slug は出さない
  const others = roadmap.fit.other
    .map((o) => ({ ...o, target: getRoadmap(o.slug) }))
    .filter((o): o is typeof o & { target: Roadmap } => o.target !== null);

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
            <Link href={`${ROADMAP_BASE}/vs-course`} className="font-bold text-text-link hover:underline">
              コースとの違い →
            </Link>
          </div>

          {/* 1. ヒーロー */}
          <header className="pb-14 pt-8">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-text-secondary px-2.5 py-0.5 text-xs font-bold text-text-secondary">
              <Map1 size={13} color="currentColor" variant="Linear" />
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
            <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Calendar size={16} color="currentColor" variant="Linear" />
                期間の目安{" "}
                <strong className="text-text-primary">
                  <T f={roadmap.period} />
                </strong>
              </span>
              <span aria-hidden="true" className="text-border-default">
                |
              </span>
              <span className="flex items-center gap-1.5">
                <Routing2 size={16} color="currentColor" variant="Linear" />
                コース <strong className="text-text-primary">{stats.courses + stats.planned}</strong>
                {stats.planned > 0 ? <span className="text-text-muted">（準備中 {stats.planned}）</span> : null}
                {stats.outside > 0 ? (
                  <>
                    ＋ コースの外 <strong className="text-text-primary">{stats.outside}</strong>
                  </>
                ) : null}
              </span>
            </p>

            {done !== null ? (
              <div className="mt-7 max-w-[560px]">
                <p className="text-xs font-bold text-text-secondary">{hereLabel(done, stats.stops)}</p>
                <MiniPath roadmap={roadmap} done={done} className="mt-2" />
              </div>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-3">
              {first ? (
                <Button asChild size="large">
                  <Link href={`/dev/course-pages/v2/${first}`}>
                    {done !== null ? "次のコースへ進む" : "最初のコースから始める"}
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
            {done === null ? (
              <p className="mt-4 text-xs leading-[1.8] text-text-muted">
                <T f={k("このページは誰でも最後まで読めます。進み具合の記録とコースの中身は会員向けです。")} />
              </p>
            ) : null}
          </header>

          {done !== null ? <NextCourse roadmap={roadmap} done={done} lessons={lessons} /> : null}

          {/* 2. 自分に合うか */}
          <section aria-labelledby="rm-fit" className={SECTION}>
            <SectionHead id="rm-fit" kicker="Fit" title="自分に合うか" />
            <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-10">
              <div>
                <h3 className="font-heading text-base font-bold">向いている人</h3>
                <ul className="mt-3 space-y-2.5">
                  {roadmap.fit.good.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-[1.8]">
                      <Check size={16} strokeWidth={2.5} className="mt-[3px] shrink-0 text-text-success" />
                      <span>
                        <T f={f} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold">別の行き先が合う人</h3>
                <ul className="mt-3 space-y-3">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <p className="text-sm leading-[1.8] text-text-secondary">
                        <T f={o.text} />
                      </p>
                      <Link
                        href={`${ROADMAP_BASE}/${o.slug}`}
                        className={cn("group mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold", CLICKABLE)}
                      >
                        <Map1 size={14} color="currentColor" variant="Linear" />
                        {o.target.name}
                        <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 3. たどり着いたときの姿 */}
          <section aria-labelledby="rm-arrival" className={SECTION}>
            <SectionHead id="rm-arrival" kicker="Arrival" title="たどり着いたときの姿" />
            <h3 className="mt-8 text-xs font-bold text-text-muted">できること</h3>
            <ul className="mt-3 grid gap-5 md:grid-cols-3 md:gap-6">
              {roadmap.arrival.can.map((f, i) => (
                <li key={i} className="border-t-2 border-text-primary pt-3 text-[15px] font-bold leading-[1.75]">
                  <T f={f} />
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-[20px] bg-[var(--persona-hero-surface)] px-5 py-4">
              <h3 className="text-xs font-bold text-text-muted">手元に残るもの</h3>
              <p className="mt-1 text-[15px] font-bold leading-[1.7]">
                <T f={roadmap.arrival.keep} />
              </p>
            </div>
          </section>

          {/* 4. 道のり */}
          <section id="rm-path" aria-labelledby="rm-path-title" className={cn(SECTION, "scroll-mt-16")}>
            <SectionHead
              id="rm-path-title"
              kicker="Path"
              title="道のり"
              lead="コースと、コースの外でやることを順に並べています。レッスンの中身は各コースのページで確かめられます。"
            />
            <ol className="mt-8">
              {roadmap.stops.map((stop, i) => {
                const status = done === null ? "plain" : i < done ? "done" : i === done ? "current" : "todo";
                return (
                  <li key={i}>
                    {i > 0 ? <span aria-hidden="true" className="ml-8 block h-7 w-px bg-border-default" /> : null}
                    <p className="mb-2 flex items-center gap-2 font-latin text-[11px] font-bold tracking-[0.1em] text-text-muted">
                      {pad2(i + 1)}
                      <span className="font-noto-sans-jp tracking-normal">{stopKindLabel(stop)}</span>
                      <StatusTag status={status} />
                    </p>
                    <div className={cn(status === "done" && "opacity-75")}>
                      <StopCard stop={stop} lessons={lessons} emphasized={status === "current"} />
                    </div>
                    <StopReason stop={stop} done={status === "done"} />
                  </li>
                );
              })}
              <li>
                <span aria-hidden="true" className="ml-8 block h-7 w-px bg-border-default" />
                <div className="rounded-[20px] bg-[var(--persona-hero-surface)] px-5 py-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                    <Flag size={14} color="currentColor" variant="Bold" />
                    行き先
                  </p>
                  <p className="mt-1 text-[15px] font-bold leading-[1.7]">
                    <T f={roadmap.outcome} />
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* 5. コースの外でやること */}
          <section aria-labelledby="rm-guides" className={SECTION}>
            <SectionHead
              id="rm-guides"
              kicker="Guide"
              title="コースの外でやること"
              lead={<T f={k("コースを終えても、作品をまとめて人に見せるところまでは自分で進めます。そのための道しるべです。")} />}
            />
            <ul className={cn("mt-8 grid gap-8", roadmap.guides.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
              {roadmap.guides.map((g) => (
                <li key={g.kind} className="border-t-2 border-text-primary pt-4">
                  <span className="flex text-text-secondary">
                    <GuideIcon kind={g.kind} size={22} />
                  </span>
                  <h3 className="mt-3 font-heading text-base font-bold">{g.title}</h3>
                  <p className="mt-2 text-[13px] leading-[1.85] text-text-secondary">
                    <T f={g.body} />
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {g.links.map((l) => {
                      const external = l.href.startsWith("http");
                      return (
                        <li key={l.href + l.label}>
                          <Link
                            href={l.href}
                            target={external ? "_blank" : undefined}
                            className={cn("group inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold", CLICKABLE)}
                          >
                            {l.label}
                            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          {/* 6. 進め方の目安 */}
          <section aria-labelledby="rm-pace" className={SECTION}>
            <SectionHead
              id="rm-pace"
              kicker="Pace"
              title="進め方の目安"
              lead={<T f={k("コースの外でやることも含めた、最後の区切りまでの目安です。")} />}
            />
            <dl className="mt-8 grid grid-cols-2 gap-4 sm:max-w-[520px]">
              {roadmap.pace.map((p) => (
                <div key={p.hours} className="border-t-2 border-text-primary pt-3">
                  <dt className="text-xs font-bold text-text-muted">{p.hours}なら</dt>
                  <dd className="mt-1 font-heading text-[24px] font-bold tracking-[-0.03em] md:text-[28px]">
                    <T f={p.period} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* 7. よくある迷い */}
          <section aria-labelledby="rm-faq" className={SECTION}>
            <SectionHead id="rm-faq" kicker="FAQ" title="よくある迷い" />
            <div className="mt-8 border-t border-text-secondary">
              {roadmap.faq.map((item, i) => (
                <details key={i} className="group border-b border-border-light" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center gap-4 py-5 [&::-webkit-details-marker]:hidden">
                    <span className="font-latin text-sm font-bold text-text-muted">Q</span>
                    <h3 className="min-w-0 flex-1 text-[15px] font-bold leading-[1.6]">
                      <T f={item.question} />
                    </h3>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-light text-text-secondary transition-transform group-open:rotate-45">
                      <Plus size={14} strokeWidth={2} />
                    </span>
                  </summary>
                  <p className="pb-6 pl-7 pr-11 text-sm leading-[1.9] text-text-secondary">
                    <T f={item.answer} />
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* 8. ほかの行き先 */}
          <section aria-labelledby="rm-others" className="border-t border-border-light pt-14">
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
                      className={cn("inline-flex rounded-full px-3 py-1.5 text-xs font-bold", CLICKABLE)}
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
              行き先を選ぶページへ
              <ArrowRight size={15} />
            </Link>
          </section>
        </div>
      </div>
    </KariProvider>
  );
}
