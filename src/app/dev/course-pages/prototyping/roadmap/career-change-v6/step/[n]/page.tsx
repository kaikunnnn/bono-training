/**
 * /dev/course-pages/prototyping/roadmap/career-change-v6/step/[n] — ステップの詳しいページ（v6・B）#243
 *
 * 計画: rebono/issues/243-C_試作計画_v6.md §4。ステップ1を作り込み、2〜6は同じ型に仮の文。
 * 1 全体のどこか（6ステップの横並び・1 / 6・パンくず） / 2 冒頭 / 3 なぜ必要か / 4 身につけるスキル
 * 5 欲しいアウトプット / 6 コース / 7 よくあるつまずき / 8 次のステップへ
 * xl 以上は右に追従する目次。AIの使いどころの節と「飛ばしてよい条件」は置かない（AIはスキルの1つ）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, Plus } from "lucide-react";
import { Edit2 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCourse, lessonSlugs } from "../../../../../data";
import {
  careerChangeV6 as rm,
  getV6Skill,
  getV6Step,
  v6StepHref,
  v6Steps,
  V6_GOAL_HREF,
  type V6Step,
} from "../../../../../data/roadmap-career-change-v6";
import { fetchLessons } from "../../../../../data/sanity-lessons";
import { KariProvider, T } from "../../../../../template/kari";
import { Reveal } from "../../_parts/motion";
import {
  Arrow,
  BODY,
  Breadcrumb,
  CourseCard,
  FOCUS,
  H2,
  H3,
  IconTile,
  Kicker,
  LIFT_CARD,
  OutputFigure,
  P,
  PHRASE,
  SkillTagBadge,
  STATIC_CARD,
  TextLink,
  courseSlugOf,
  pad2,
} from "../../_parts/parts";
import ScrollSpy from "../../_parts/ScrollSpy";

type Params = Promise<{ n: string }>;

/** 1〜6 以外はルーティングの段階で 404（loading.tsx のストリーミングで 200 にならないように） */
export const dynamicParams = false;

export function generateStaticParams() {
  return v6Steps.map((st) => ({ n: String(st.n) }));
}

function resolveStep(n: string): V6Step | null {
  if (!/^\d+$/.test(n)) return null;
  return getV6Step(Number(n));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { n } = await params;
  const step = resolveStep(n);
  return {
    title: step ? `ステップ${step.n}：${step.canDo}（v6）` : "ステップ（v6）",
    robots: { index: false, follow: false },
  };
}

const SEC = "scroll-mt-20 border-t border-border-light pt-12 md:pt-14";

const TOC = [
  { id: "why", label: "なぜ転職に必要か" },
  { id: "skills", label: "身につけるスキル" },
  { id: "output", label: "欲しいアウトプット" },
  { id: "course", label: "このステップのコース" },
  { id: "stumbles", label: "よくあるつまずき" },
  { id: "next", label: "次のステップへ" },
];

/* ---------- 1 全体のどこか ---------- */

function Stepper({ current }: { current: V6Step }) {
  return (
    <nav aria-label="ロードマップのステップ" className="mt-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-text-secondary">
          <span className="font-latin text-base font-bold tabular-nums text-text-primary">
            {current.n} / {v6Steps.length}
          </span>
          <span className="ml-2 font-bold text-text-primary md:hidden">{current.short}</span>
        </p>
        <Link href={rm.base} className={cn("rounded-[4px] text-xs text-text-muted hover:text-text-primary", FOCUS)}>
          全体を見る
        </Link>
      </div>
      <ol className="mt-3 grid grid-cols-6 gap-1.5 md:gap-2">
        {v6Steps.map((st) => {
          const isCurrent = st.n === current.n;
          return (
            <li key={st.id} className="min-w-0">
              <Link
                href={v6StepHref(st.n)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`ステップ${st.n}：${st.short}`}
                className={cn("group flex flex-col gap-2 rounded-[6px] pb-1", FOCUS)}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "block h-1 rounded-full transition-colors duration-200",
                    isCurrent ? "bg-text-primary" : "bg-border-light group-hover:bg-border-strong"
                  )}
                />
                <span className="flex min-w-0 items-baseline gap-1.5">
                  <span
                    className={cn(
                      "font-latin text-xs font-bold tabular-nums",
                      isCurrent ? "text-text-primary" : "text-text-muted group-hover:text-text-primary"
                    )}
                  >
                    {pad2(st.n)}
                  </span>
                  <span
                    className={cn(
                      "hidden min-w-0 truncate text-xs md:inline",
                      isCurrent ? "font-bold text-text-primary" : "text-text-muted group-hover:text-text-primary"
                    )}
                  >
                    {st.short}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---------- ページ ---------- */

export default async function V6StepPage({ params }: { params: Params }) {
  const { n } = await params;
  const step = resolveStep(n);
  if (!step) notFound();

  const slug = courseSlugOf(step.course);
  const course = slug ? getCourse(slug) : null;
  const lessons = await fetchLessons(course ? lessonSlugs(course) : []);
  const next = getV6Step(step.n + 1);
  const prev = getV6Step(step.n - 1);

  return (
    <KariProvider>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[1120px] px-4 pb-32 pt-6 md:px-10 md:pt-10">
          <Breadcrumb items={[{ label: "ロードマップ", href: rm.base }, { label: `ステップ${step.n}` }]} />
          <Stepper current={step} />

          <div className="mt-10 grid gap-12 md:mt-14 xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-16">
            <div className="min-w-0 max-w-[760px]">
              {/* 2 冒頭 */}
              <header className="pb-12 md:pb-14">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Kicker className="text-text-primary">Step {pad2(step.n)}</Kicker>
                  <span className="text-sm text-text-muted">
                    目安 <T f={step.period} />
                  </span>
                  <SkillTagBadge tag={step.tag} />
                </div>
                <h1 className={cn("mt-4 font-heading text-[30px] font-bold leading-[1.4] tracking-[-0.05em] text-text-primary md:text-[40px]", PHRASE)}>
                  {step.canDo}
                </h1>
                <p className={cn(BODY, "mt-4")}>
                  <T f={step.lead} />
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <Button asChild variant="persona-gradient" size="persona-cta" className={cn("group text-base", FOCUS)}>
                    <a href="#course">
                      このステップを実践できるコース
                      <ArrowDown
                        size={18}
                        aria-hidden="true"
                        className="shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-y-0.5 motion-reduce:group-hover:translate-y-0"
                      />
                    </a>
                  </Button>
                </div>
              </header>

              {/* 3 なぜ必要か */}
              <section id="why" aria-labelledby="why-title" className={SEC}>
                <Kicker>Why</Kicker>
                <h2 id="why-title" className={cn(H2, "mt-3")}>
                  なぜ転職にこのステップが必要か
                </h2>
                <div className="mt-8 flex flex-col gap-8">
                  {step.why.map((b) => (
                    <Reveal key={b.h}>
                      <h3 className={cn(H3, "text-[19px] md:text-[20px]")}>{b.h}</h3>
                      <P para={b.para} className="mt-2" />
                    </Reveal>
                  ))}
                </div>
                <div className="mt-8">
                  <TextLink href={`${V6_GOAL_HREF}#hiring`}>採用で見られることを詳しく読む</TextLink>
                </div>
              </section>

              {/* 4 身につけるスキル */}
              <section id="skills" aria-labelledby="skills-title" className={cn(SEC, "mt-14")}>
                <Kicker>Skills</Kicker>
                <h2 id="skills-title" className={cn(H2, "mt-3")}>
                  身につけるスキル
                </h2>
                <ul className="mt-8 flex flex-col gap-4">
                  {step.skillCards.map((card, i) => {
                    const sk = getV6Skill(card.skillId);
                    if (!sk) return null;
                    return (
                      <Reveal as="li" key={card.skillId} index={i} className={cn("rounded-[20px] p-5 md:p-6", STATIC_CARD)}>
                        <div className="flex items-start gap-4">
                          <IconTile icon={sk.icon} />
                          <div className="min-w-0 flex-1">
                            <SkillTagBadge tag={sk.tag} />
                            <h3 className={cn("mt-1.5 font-heading text-[18px] font-bold leading-[1.5] text-text-primary", PHRASE)}>{sk.name}</h3>
                          </div>
                        </div>
                        <dl className="mt-5 grid gap-4 border-t border-border-light pt-5 md:grid-cols-3 md:gap-6">
                          {[
                            { dt: "何か", dd: card.what },
                            { dt: "なぜ要るか", dd: card.why },
                            { dt: "「できた」と言える目安", dd: card.done },
                          ].map((row) => (
                            <div key={row.dt} className="min-w-0">
                              <dt className="text-xs font-bold text-text-muted">{row.dt}</dt>
                              <dd className={cn(BODY, "mt-1")}>
                                <T f={row.dd} />
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </Reveal>
                    );
                  })}
                </ul>
              </section>

              {/* 5 欲しいアウトプット */}
              <section id="output" aria-labelledby="output-title" className={cn(SEC, "mt-14")}>
                <Kicker>Output</Kicker>
                <h2 id="output-title" className={cn(H2, "mt-3")}>
                  欲しいアウトプット
                </h2>
                <div className="mt-8">
                  <OutputFigure step={step} size="lg" />
                </div>
                <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3" aria-label="見本の画像（準備中）">
                  {step.outputDetail.samples.map((label, i) => (
                    <Reveal
                      as="li"
                      key={label}
                      index={i}
                      className={cn(
                        "flex aspect-[4/3] flex-col justify-end rounded-[16px] border border-dashed border-border-default bg-muted-custom p-3",
                        i === 0 && step.outputDetail.samples.length === 3 && "col-span-2 md:col-span-1"
                      )}
                    >
                      <span className="text-xs font-bold leading-[1.5] text-text-muted">{label}</span>
                      <span className="text-[11px] text-text-disabled">見本の画像（準備中）</span>
                    </Reveal>
                  ))}
                </ul>

                <h3 className={cn(H3, "mt-12 text-[19px] md:text-[20px]")}>できあがりのチェックリスト</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {step.outputDetail.checklist.map((item, i) => (
                    <li key={i} className={cn(BODY, "flex items-start gap-3")}>
                      <span aria-hidden="true" className="mt-[5px] size-[18px] shrink-0 rounded-[5px] border-[1.5px] border-border-strong bg-surface" />
                      <span>
                        <T f={item} />
                      </span>
                    </li>
                  ))}
                </ul>

                <h3 className={cn(H3, "mt-12 text-[19px] md:text-[20px]")}>「なぜこの形にしたか」3行メモの書き方</h3>
                <p className={cn(BODY, "mt-2")}>
                  <T f={step.outputDetail.memo.about} />
                  ケーススタディをまとめるとき、このメモがそのまま材料になります。
                </p>
                <figure className={cn("mt-5 rounded-[20px] p-5 md:p-6", STATIC_CARD)}>
                  <figcaption className="flex items-center gap-2 text-xs font-bold text-text-muted">
                    <Edit2 size={14} color="currentColor" variant="Linear" />
                    書く例
                  </figcaption>
                  <ol className="mt-3 flex flex-col gap-2">
                    {step.outputDetail.memo.lines.map((line, i) => (
                      <li key={i} className="flex gap-3 text-base leading-[1.8] text-text-primary">
                        <span className="w-4 shrink-0 font-latin text-sm font-bold leading-[1.8] text-text-muted tabular-nums">{i + 1}</span>
                        <span className="min-w-0">
                          <T f={line} />
                        </span>
                      </li>
                    ))}
                  </ol>
                </figure>
              </section>

              {/* 6 コース */}
              <section id="course" aria-labelledby="course-title" className={cn(SEC, "mt-14")}>
                <Kicker>Course</Kicker>
                <h2 id="course-title" className={cn(H2, "mt-3")}>
                  このステップのコース
                </h2>
                <p className={cn(BODY, "mt-3")}>
                  <T f={step.course.reason} />
                </p>
                <div className="mt-6">
                  <CourseCard course={step.course} lessons={lessons} />
                </div>
              </section>

              {/* 7 よくあるつまずき */}
              <section id="stumbles" aria-labelledby="stumbles-title" className={cn(SEC, "mt-14")}>
                <Kicker>Q&amp;A</Kicker>
                <h2 id="stumbles-title" className={cn(H2, "mt-3")}>
                  よくあるつまずき
                </h2>
                <div className="mt-6 border-t border-text-secondary">
                  {step.stumbles.map((item, i) => (
                    <details key={i} className="group border-b border-border-light" open={i === 0}>
                      <summary
                        className={cn(
                          "flex cursor-pointer list-none items-center gap-4 rounded-[4px] py-5 [&::-webkit-details-marker]:hidden",
                          FOCUS
                        )}
                      >
                        <span aria-hidden="true" className="font-latin text-sm font-bold text-text-muted">Q</span>
                        <h3 className="min-w-0 flex-1 text-base font-bold leading-[1.6] text-text-primary">
                          <T f={item.q} />
                        </h3>
                        <span
                          aria-hidden="true"
                          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-light text-text-secondary transition-transform duration-200 group-open:rotate-45"
                        >
                          <Plus size={14} strokeWidth={2} />
                        </span>
                      </summary>
                      <P para={item.a} className="pb-6 pl-7 pr-2 md:pr-11" />
                    </details>
                  ))}
                </div>
              </section>

              {/* 8 次のステップへ */}
              <section id="next" aria-labelledby="next-title" className={cn(SEC, "mt-14")}>
                <Kicker>Next</Kicker>
                <h2 id="next-title" className={cn(H2, "mt-3")}>
                  {next ? "次のステップへ" : "応募の先へ"}
                </h2>
                <div className="mt-6">
                  {next ? (
                    <Link href={v6StepHref(next.n)} className={cn("flex items-center gap-5 rounded-[24px] p-6 md:p-8", LIFT_CARD)}>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-primary">Step {pad2(next.n)}</span>
                          <span className="text-sm text-text-muted">
                            目安 <T f={next.period} />
                          </span>
                        </p>
                        <h3 className={cn(H3, "mt-2")}>{next.canDo}</h3>
                        <p className={cn(BODY, "mt-2")}>
                          <T f={next.lead} />
                        </p>
                      </div>
                      <span className="hidden size-11 shrink-0 items-center justify-center rounded-full border border-border-light text-text-primary sm:flex">
                        <Arrow size={18} />
                      </span>
                    </Link>
                  ) : (
                    <Link href={V6_GOAL_HREF} className={cn("flex items-center gap-5 rounded-[24px] p-6 md:p-8", LIFT_CARD)}>
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-primary">Guide</span>
                        <h3 className={cn(H3, "mt-2")}>ゴールと道のりの解説を読む</h3>
                        <p className={cn(BODY, "mt-2")}>採用で見られることと、この順番にした理由をまとめています。</p>
                      </div>
                      <span className="hidden size-11 shrink-0 items-center justify-center rounded-full border border-border-light text-text-primary sm:flex">
                        <Arrow size={18} />
                      </span>
                    </Link>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                  {prev ? (
                    <Link href={v6StepHref(prev.n)} className={cn("rounded-[4px] text-text-muted hover:text-text-primary", FOCUS)}>
                      ← ステップ{prev.n}「{prev.short}」に戻る
                    </Link>
                  ) : null}
                  <Link href={rm.base} className={cn("rounded-[4px] text-text-muted hover:text-text-primary", FOCUS)}>
                    ロードマップの全体を見る
                  </Link>
                </div>
              </section>
            </div>

            {/* xl 以上: 右に追従する目次 */}
            <aside className="hidden xl:block">
              <ScrollSpy label="このページの内容" title="このページの内容" className="sticky top-8" items={TOC} />
            </aside>
          </div>
        </div>
      </div>
    </KariProvider>
  );
}
