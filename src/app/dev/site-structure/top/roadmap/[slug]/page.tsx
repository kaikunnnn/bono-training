/**
 * #267 各ロードマップの形のページ（267-Q 2章・S4）
 *
 * 親子は 267-O 1章: トップ > ロードマップ > このロードマップ。
 * 中身は roadmaps.ts（文言は二重に持たない）。形だけ: ゴール（たどり着いたときの姿）→ 道のり（区切りごとのコース）→ 自分に合うか → 次に整えたいこと。
 * 区切りのカードは #243 の詳細ページと同じ部品（prototyping/roadmap/stop-parts）を使う。
 * 未経験からUI/UXデザイナーへ（career-change）は v6 で作り込み済みなので 01 の入口ページへ送る。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { Calendar, Flag, Profile2User, Routing2 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { courses, lessonSlugs } from "../../../../course-pages/data";
import { getRoadmap, type Roadmap, type RoadmapStop } from "../../../../course-pages/data/roadmaps";
import { fetchLessons } from "../../../../course-pages/data/sanity-lessons";
import type { Field } from "../../../../course-pages/data/types";
import { firstCourseSlug, roadmapStats } from "../../../../course-pages/prototyping/roadmap/parts";
import { StopCard, StopReason, stopKindLabel } from "../../../../course-pages/prototyping/roadmap/stop-parts";
import { Kari } from "../../../_parts/shared";
import { groupOf, hubRoadmaps, roadmapHubHref, V6_SLUG } from "../../_data/roadmap-hub";
import { DevStateToggle } from "../../_parts/DevStateToggle";
import { BackToHub, Breadcrumb, Eyebrow, NextSteps, PAGE, PHRASE, type NextStep } from "../../_parts/hub-parts";
import { F, MiniPathList, RoadmapMark } from "../../_parts/roadmap-parts";
import { pathDots } from "../../_data/roadmap-hub";
import { CAREER_BASE, ROADMAP_HUB_BASE, STUDY_BASE, TOP_BASE, TROUBLES_HUB_BASE, withState } from "../../_parts/top-parts";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const r = getRoadmap(slug);
  return {
    title: r ? `${r.name}｜ロードマップ（#267 試作）` : "ロードマップ（#267 試作）",
    robots: { index: false, follow: false },
  };
}

const renderField = (f: Field) => <F f={f} />;
const H2 = "font-heading text-[24px] font-bold leading-[1.45] text-text-primary lg:text-[28px]";

function SectionHeading({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className={cn("mt-3", H2, PHRASE)}>
        {title}
      </h2>
    </div>
  );
}

function stepLabel(stop: RoadmapStop) {
  return stopKindLabel(stop);
}

export default async function RoadmapShapePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ state?: string }>;
}) {
  const { slug } = await params;
  const { state } = await searchParams;
  const member = state === "member";

  // 作り込み済みの 01（v6）は入口ページが正
  if (slug === V6_SLUG) redirect(withState(CAREER_BASE, member));

  const roadmap = getRoadmap(slug);
  const group = roadmap ? groupOf(slug) : null;
  if (!roadmap || !group) notFound();

  const stats = roadmapStats(roadmap);
  const first = firstCourseSlug(roadmap);
  const usedCourseSlugs = roadmap.stops.flatMap((s) => (s.type === "course" ? [s.slug] : []));
  const lessons = await fetchLessons(usedCourseSlugs.flatMap((c) => (courses[c] ? lessonSlugs(courses[c]) : [])));

  const others = roadmap.fit.other
    .map((o) => ({ ...o, target: getRoadmap(o.slug) }))
    .filter((o): o is typeof o & { target: Roadmap } => o.target !== null);

  // 一番下: 同じ入口のほかのロードマップ → 悩み・勉強法（267-O 2章）
  const siblings: NextStep[] = hubRoadmaps(group)
    .filter((r) => r.slug !== roadmap.slug)
    .map((r) => ({ no: group.no, label: r.name, href: withState(roadmapHubHref(r.slug), member), reason: r.audience.text }));
  const nextItems: NextStep[] = [
    ...siblings,
    { label: "悩みの一覧", href: withState(TROUBLES_HUB_BASE, member), reason: "道のりの途中で手が止まったとき" },
    { label: "勉強法", href: withState(STUDY_BASE, member), reason: "働きながら続ける進め方を決める" },
  ];

  return (
    <div className="pb-24">
      <div className={cn(PAGE, "pt-6 lg:pt-8")}>
        <Breadcrumb
          items={[
            { label: "トップ", href: withState(TOP_BASE, member) },
            { label: "ロードマップ", href: withState(`${ROADMAP_HUB_BASE}#${group.no}`, member) },
            { label: roadmap.name },
          ]}
        />

        {/* 頭: 名前・誰向け・ゴール・期間と区切り・始めるボタン ／ 右に道のりの全体 */}
        <header className="mt-8 grid grid-cols-1 gap-10 pb-14 lg:mt-10 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-14">
          <div className="min-w-0">
            <Eyebrow>
              ROADMAP / {group.no} {group.label}
            </Eyebrow>
            <div className="mt-4 flex items-center gap-4">
              <RoadmapMark slug={roadmap.slug} group={group.no} />
              <h1 className={cn("font-heading text-[28px] font-bold leading-[1.3] tracking-[-0.01em] text-text-primary sm:text-[36px] lg:text-[44px]", PHRASE)}>
                {roadmap.name}
              </h1>
            </div>
            <p className="mt-5 flex items-start gap-2 font-noto-sans-jp text-[15px] font-bold leading-[1.7] text-text-primary">
              <Profile2User size={18} color="currentColor" variant="Linear" className="mt-[3px] shrink-0" aria-hidden="true" />
              <span>
                <F f={roadmap.audience} />
              </span>
            </p>
            <p className="mt-4 max-w-[640px] font-noto-sans-jp text-base leading-[1.9] text-text-secondary">
              <F f={roadmap.outcome} />
            </p>
            <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-noto-sans-jp text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Calendar size={16} color="currentColor" variant="Linear" aria-hidden="true" />
                期間の目安
                <strong className="text-text-primary">
                  <F f={roadmap.period} />
                </strong>
              </span>
              <span aria-hidden="true" className="text-border-default">
                |
              </span>
              <span className="flex items-center gap-1.5">
                <Routing2 size={16} color="currentColor" variant="Linear" aria-hidden="true" />
                コース <strong className="text-text-primary">{stats.courses + stats.planned}</strong>
                {stats.planned > 0 ? <span className="text-text-muted">（準備中 {stats.planned}）</span> : null}
                {stats.outside > 0 ? (
                  <>
                    ＋ コースの外 <strong className="text-text-primary">{stats.outside}</strong>
                  </>
                ) : null}
              </span>
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {first ? (
                <Button variant="primary" size="large" asChild>
                  <Link href={`/dev/course-pages/v2/${first}`}>
                    最初のコースから始める
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
              <Button variant="outline-ghost" size="large" asChild>
                <a href="#path">道のりを見る</a>
              </Button>
            </div>
            {!first ? (
              <p className="mt-4 font-noto-sans-jp text-xs leading-[1.8] text-text-muted">
                この道のりのコースは準備中です。今あるレッスンは、悩みの一覧から開けます。
                <Kari />
              </p>
            ) : null}
          </div>

          <aside aria-label="道のりの全体" className="h-fit rounded-[24px] border border-border-light bg-surface p-6 shadow-[var(--shadow-xs)]">
            <p className="font-noto-sans-jp text-xs font-bold tracking-[0.08em] text-text-muted">道のりの全体</p>
            <MiniPathList dots={pathDots(roadmap)} className="mt-3" />
            <p className="mt-4 flex items-start gap-2 border-t border-border-light pt-4 font-noto-sans-jp text-[13px] font-bold leading-[1.7] text-text-primary">
              <Flag size={16} color="currentColor" variant="Bold" className="mt-[2px] shrink-0" aria-hidden="true" />
              <span>
                <F f={roadmap.arrival.keep} />
              </span>
            </p>
          </aside>
        </header>

        {/* ゴール */}
        <section id="goal" aria-labelledby="goal-title" className="scroll-mt-24 border-t border-border-light py-14 lg:py-16">
          <SectionHeading id="goal-title" eyebrow="GOAL / ゴール" title="たどり着いたときの姿" />
          <ul className="mt-8 grid gap-5 md:grid-cols-3 md:gap-6">
            {roadmap.arrival.can.map((f, i) => (
              <li key={i} className="border-t-2 border-text-primary pt-3 font-noto-sans-jp text-[15px] font-bold leading-[1.75] text-text-primary">
                <F f={f} />
              </li>
            ))}
          </ul>
        </section>

        {/* 道のり（区切りごとのコース） */}
        <section id="path" aria-labelledby="path-title" className="scroll-mt-24 border-t border-border-light py-14 lg:py-16">
          <SectionHeading id="path-title" eyebrow="STEPS / 道のり" title="ステップと、使うコース" />
          <p className="mt-3 max-w-[560px] font-noto-sans-jp text-sm leading-[1.8] text-text-secondary">
            コースと、コースの外でやることを順に並べています。レッスンの中身は各コースのページで確かめられます。
            <Kari />
          </p>
          <ol className="mt-8 max-w-[820px]">
            {roadmap.stops.map((stop, i) => (
              <li key={i}>
                {i > 0 ? <span aria-hidden="true" className="ml-8 block h-7 w-px bg-border-default" /> : null}
                <p className="mb-2 flex items-center gap-2 font-latin text-[11px] font-bold tracking-[0.1em] text-text-muted">
                  STEP {String(i + 1).padStart(2, "0")}
                  <span className="font-noto-sans-jp tracking-normal">{stepLabel(stop)}</span>
                </p>
                <StopCard stop={stop} lessons={lessons} emphasized={false} renderField={renderField} />
                <StopReason stop={stop} done={false} renderField={renderField} />
              </li>
            ))}
          </ol>
        </section>

        {/* 自分に合うか */}
        <section id="fit" aria-labelledby="fit-title" className="scroll-mt-24 border-t border-border-light py-14 lg:py-16">
          <SectionHeading id="fit-title" eyebrow="FIT / 自分に合うか" title="この道のりが合う人" />
          <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-10">
            <div>
              <h3 className="font-heading text-base font-bold text-text-primary">向いている人</h3>
              <ul className="mt-3 space-y-2.5">
                {roadmap.fit.good.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 font-noto-sans-jp text-sm leading-[1.8] text-text-primary">
                    <Check size={16} strokeWidth={2.5} className="mt-[3px] shrink-0 text-text-success" aria-hidden="true" />
                    <span>
                      <F f={f} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-text-primary">別の道のりが合う人</h3>
              <ul className="mt-3 space-y-3">
                {others.map((o) => (
                  <li key={o.slug}>
                    <p className="font-noto-sans-jp text-sm leading-[1.8] text-text-secondary">
                      <F f={o.text} />
                    </p>
                    <Link
                      href={withState(roadmapHubHref(o.slug), member)}
                      className="group mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-border-light bg-surface px-3 py-1.5 font-noto-sans-jp text-xs font-bold text-text-primary shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]"
                    >
                      {o.target.name}
                      <ArrowRight size={13} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-10 border-t border-border-light pt-14 lg:pt-16">
          <NextSteps
            lead={
              <>
                同じ入口のほかの道のりと、途中で使う置き場所です。
                <Kari />
              </>
            }
            items={nextItems}
          />
          <div>
            <BackToHub href={withState(`${ROADMAP_HUB_BASE}#${group.no}`, member)} label="ロードマップの一覧へ戻る" />
          </div>
        </div>
      </div>

      <DevStateToggle base={`${ROADMAP_HUB_BASE}/${roadmap.slug}`} member={member} />
    </div>
  );
}
