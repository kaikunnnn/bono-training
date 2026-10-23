/**
 * /dev/course-pages/prototyping/roadmap/career-change-v6 — 未経験からUIデザイナーへ（v6・A 全体のページ）#243
 *
 * 計画: rebono/issues/243-C_試作計画_v6.md §3。A で全体を見る → B で1ステップずつ進む → C で背景を理解する。
 * 1 冒頭 / 2 ゴール / 3 全体図となぜこの順番か / 4 6つのステップ（縦線のタイムライン・lg で左に追従ナビ）
 * 5 先輩の道のり / 6 よくある質問（入口の現実はここだけ） / 7 根拠
 * 文言は data/roadmap-career-change-v6.ts（推測は「仮」）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Briefcase, Calendar, DocumentText, Map1 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCourse, lessonSlugs } from "../../../data";
import {
  careerChangeV6 as rm,
  getV6Skill,
  getV6StepById,
  v6Skills,
  v6StepHref,
  v6Steps,
  V6_GOAL_HREF,
  type V6Step,
} from "../../../data/roadmap-career-change-v6";
import { fetchLessons } from "../../../data/sanity-lessons";
import type { LessonMap } from "../../../data/types";
import { KariProvider, T } from "../../../template/kari";
import { ROADMAP_BASE } from "../parts";
import { DrawLine, Reveal } from "./_parts/motion";
import {
  Arrow,
  BODY,
  CourseCard,
  FOCUS,
  H3,
  H4,
  IconTile,
  Kicker,
  LIFT_CARD,
  OutputFigure,
  P,
  PHRASE,
  SECTION,
  SectionHead,
  SkillTagBadge,
  SkillTagLegend,
  STATIC_CARD,
  TextLink,
  courseSlugOf,
  pad2,
} from "./_parts/parts";
import ScrollSpy from "./_parts/ScrollSpy";

export const metadata: Metadata = {
  title: "未経験からUIデザイナーへ（v6・ロードマップ）",
  robots: { index: false, follow: false },
};

/* ---------- 1 冒頭 ---------- */

function HeroBand() {
  const sm = rm.summary;
  const rows = [
    { icon: Calendar, label: "目安", big: <T f={sm.months} />, sub: <T f={sm.hoursPerWeek} /> },
    { icon: DocumentText, label: "ケーススタディ", big: <T f={sm.caseStudies} />, sub: "ポートフォリオに載せる" },
    { icon: Briefcase, label: "前提知識", big: <T f={sm.prerequisite} />, sub: "デザイン未経験でOK" },
  ];
  return (
    <dl className="mt-8 grid grid-cols-3 divide-x divide-border-light border-y border-border-light">
      {rows.map((r) => (
        <div key={r.label} className="min-w-0 px-3 py-4 first:pl-0 md:px-5">
          <dt className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
            <r.icon size={14} color="currentColor" variant="Linear" className="hidden shrink-0 sm:block" />
            {r.label}
          </dt>
          <dd className="mt-1.5">
            <span className="block font-latin text-[22px] font-bold leading-[1.2] tracking-[-0.03em] text-text-primary md:text-[30px]">
              {r.big}
            </span>
            <span className="mt-1 block text-xs leading-[1.5] text-text-secondary">{r.sub}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** アーチの面に、6ステップの小さな道のり（縦） */
function HeroArch() {
  return (
    <div
      className={cn(
        "relative hidden w-full max-w-[440px] justify-self-end overflow-hidden md:block",
        "rounded-t-[220px] rounded-b-[16px]",
        "bg-[var(--persona-hero-surface)] bg-[image:url('/images/lesson-persona-ui/hero-gradient.webp')] bg-cover bg-center"
      )}
      aria-label="6つのステップの道のり"
    >
      <div className="absolute inset-0 bg-[var(--persona-hero-overlay)]" aria-hidden="true" />
      <div className="relative px-10 pb-8 pt-28 lg:px-12">
        <Kicker className="text-center">6 steps · 6–9 months</Kicker>
        <ol className="relative mt-6 flex flex-col gap-3.5">
          <span aria-hidden="true" className="absolute bottom-3 left-[7px] top-3 w-px bg-border-strong" />
          {v6Steps.map((st) => (
            <li key={st.id} className="relative flex items-center gap-3">
              <span
                aria-hidden="true"
                className="relative z-10 size-[15px] shrink-0 rounded-full border-[3px] border-surface bg-text-primary shadow-[var(--shadow-xs)]"
              />
              <span className="font-latin text-xs font-bold tabular-nums text-text-muted">{pad2(st.n)}</span>
              <span className="min-w-0 truncate font-heading text-[15px] font-bold leading-[1.5] text-text-primary">{st.short}</span>
            </li>
          ))}
          <li className="relative flex items-center gap-3 pt-1">
            <span aria-hidden="true" className="relative z-10 flex size-[15px] shrink-0 items-center justify-center">
              <Map1 size={15} color="currentColor" variant="Bold" />
            </span>
            <span className="text-sm font-bold text-text-primary">UIデザイナーとして内定</span>
          </li>
        </ol>
        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-text-primary/70">From zero to UI designer</p>
      </div>
    </div>
  );
}

/** スマホだけ: 帯の下に横の小さな道のり */
function MobilePath() {
  return (
    <ol className="relative mt-6 flex md:hidden" aria-label="6つのステップの道のり">
      <span aria-hidden="true" className="absolute left-[calc(100%/12)] right-[calc(100%/12)] top-[7px] h-px bg-border-strong" />
      {v6Steps.map((st) => (
        <li key={st.id} className="relative flex min-w-0 flex-1 flex-col items-center">
          <span aria-hidden="true" className="relative z-10 size-[15px] rounded-full border-[3px] border-[var(--bg-base)] bg-text-primary" />
          <span className="mt-1 font-latin text-[11px] font-bold tabular-nums text-text-muted">{pad2(st.n)}</span>
        </li>
      ))}
    </ol>
  );
}

/* ---------- 3 全体図 ---------- */

function Overview() {
  return (
    <div className="relative mt-8">
      {/* PC: 横の線（等幅のノードの中心をつなぐ。左から引かれる） */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[27px] hidden overflow-hidden lg:block">
        <DrawLine className="mx-[calc(100%/12)] block h-px bg-border-strong" />
      </div>
      <ol className="relative grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-3">
        {v6Steps.map((st, i) => (
          <Reveal as="li" key={st.id} index={i} className="min-w-0">
            <a href={`#step-${st.n}`} className={cn("flex h-full flex-col rounded-[20px] p-4 lg:items-center lg:px-3 lg:pt-0 lg:text-center", LIFT_CARD, "lg:border-transparent lg:bg-transparent lg:shadow-none lg:hover:bg-surface")}>
              <span className="flex items-center gap-2 lg:flex-col lg:gap-0">
                <span
                  aria-hidden="true"
                  className="relative z-10 hidden size-[14px] rounded-full border-[3px] border-[var(--bg-base)] bg-text-primary ring-1 ring-border-strong lg:mt-5 lg:block"
                />
                <span className="font-latin text-sm font-bold tabular-nums text-text-muted lg:mt-3">{pad2(st.n)}</span>
                <SkillTagBadge tag={st.tag} className="lg:mt-2" />
              </span>
              <span className={cn("mt-2 font-heading text-[17px] font-bold leading-[1.45] text-text-primary lg:flex lg:min-h-[47px] lg:items-center lg:text-base", PHRASE)}>{st.short}</span>
              <span className="mt-1 text-sm text-text-muted">
                <T f={st.period} />
              </span>
              <span className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-border-light pt-3 text-text-primary lg:w-full lg:flex-col lg:items-center">
                <span className="flex items-baseline gap-1 whitespace-nowrap">
                  <span className="font-latin text-[22px] font-bold leading-none tabular-nums">{st.output.amount}</span>
                  <span className="text-sm font-bold">{st.output.unit}</span>
                </span>
                <span className={cn("text-xs leading-[1.5] text-text-secondary", PHRASE)}>
                  <T f={st.output.label} />
                </span>
              </span>
            </a>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

/* ---------- 4 ステップ ---------- */

function StepBlock({ step, lessons, last }: { step: V6Step; lessons: LessonMap; last: boolean }) {
  return (
    <article id={`step-${step.n}`} aria-labelledby={`step-${step.n}-title`} className="relative scroll-mt-20 pb-14 pl-8 last:pb-0 md:pl-12">
      {/* 縦線とドット（本番ロードマップの形をトークンで） */}
      {!last ? <span aria-hidden="true" className="absolute bottom-0 left-[7px] top-4 w-px bg-border-light md:left-[11px]" /> : null}
      <span
        aria-hidden="true"
        className="absolute left-0 top-[5px] size-[15px] rounded-full border-[3px] border-[var(--bg-base)] bg-text-primary ring-1 ring-border-strong md:left-1 md:top-1.5"
      />

      <Reveal>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Kicker className="text-text-primary">Step {pad2(step.n)}</Kicker>
          <span className="text-sm text-text-muted">
            <T f={step.period} />
          </span>
          <SkillTagBadge tag={step.tag} />
        </div>
        <h3 id={`step-${step.n}-title`} className={cn(H3, "mt-2")}>
          {step.canDo}
        </h3>
        <p className={cn(BODY, "mt-2 max-w-[640px]")}>
          <T f={step.lead} />
        </p>
      </Reveal>

      <div className="mt-8">
        <h4 className={H4}>身につけるスキル</h4>
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {step.skillIds.map((id, i) => {
            const sk = getV6Skill(id);
            if (!sk) return null;
            return (
              <Reveal as="li" key={id} index={i} className={cn("flex items-center gap-3 rounded-[16px] p-3 sm:flex-col sm:items-stretch sm:p-4", STATIC_CARD)}>
                <div className="flex shrink-0 items-start justify-between gap-2">
                  <IconTile icon={sk.icon} size="sm" />
                  <SkillTagBadge tag={sk.tag} className="hidden sm:inline-flex" />
                </div>
                <p className={cn("min-w-0 flex-1 text-[15px] font-bold leading-[1.5] text-text-primary", PHRASE)}>{sk.name}</p>
                <SkillTagBadge tag={sk.tag} className="sm:hidden" />
              </Reveal>
            );
          })}
        </ul>
      </div>

      <div className="mt-8">
        <h4 className={H4}>欲しいアウトプット</h4>
        <div className={cn("mt-3 rounded-[20px] px-5 py-5 md:px-6", STATIC_CARD)}>
          <OutputFigure step={step} />
        </div>
      </div>

      <div className="mt-8">
        <h4 className={H4}>このステップのコース</h4>
        <p className={cn(BODY, "mt-2")}>
          <T f={step.course.reason} />
        </p>
        <div className="mt-4">
          <CourseCard course={step.course} lessons={lessons} />
        </div>
      </div>

      <div className="mt-6">
        <TextLink href={v6StepHref(step.n)}>ステップ{step.n}を詳しく見る</TextLink>
      </div>
    </article>
  );
}

/* ---------- ページ ---------- */

export default async function CareerChangeV6Page() {
  const slugs = v6Steps.map((st) => courseSlugOf(st.course)).filter((s): s is string => s !== null);
  const lessons = await fetchLessons(
    slugs.flatMap((slug) => {
      const c = getCourse(slug);
      return c ? lessonSlugs(c) : [];
    })
  );

  return (
    <KariProvider>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[1120px] px-4 pb-32 pt-6 md:px-10 md:pt-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
            <Link href={ROADMAP_BASE} className={cn("rounded-[4px] hover:text-text-primary", FOCUS)}>
              ← ロードマップのプロト
            </Link>
            <Link href={`${ROADMAP_BASE}/career-change-v5`} className={cn("rounded-[4px] hover:text-text-primary", FOCUS)}>
              v5と比べる
            </Link>
          </div>

          {/* 1 冒頭 */}
          <header className="grid items-center gap-10 pb-14 pt-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:pb-16 md:pt-10">
            <div className="min-w-0">
              <Kicker>Roadmap · Career change</Kicker>
              <h1 className="mt-4 [word-break:auto-phrase] font-heading text-[34px] font-bold leading-[1.35] tracking-[-0.06em] text-text-primary md:text-[46px] lg:text-[52px]">
                未経験から
                <br />
                UIデザイナーへ
              </h1>
              <p className="mt-4 text-base font-bold leading-[1.8] text-text-secondary">
                <T f={rm.audience} />
              </p>
              <HeroBand />
              <MobilePath />
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button asChild variant="persona-gradient" size="persona-cta" className={cn("group text-base", FOCUS)}>
                  <Link href={v6StepHref(1)}>
                    ステップ1から始める
                    <Arrow size={18} />
                  </Link>
                </Button>
                <TextLink href={V6_GOAL_HREF}>ゴールと道のりの解説を読む</TextLink>
              </div>
            </div>
            <HeroArch />
          </header>

          {/* 2 ゴール */}
          <section id="goal" aria-labelledby="goal-title" className={SECTION}>
            <SectionHead id="goal-title" kicker="Goal" title="この状態になれば、応募できる" />

            <h3 className={cn(H3, "mt-10")}>ポートフォリオに必要な3つのケーススタディ</h3>
            <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {rm.caseStudies.map((cs, i) => {
                const st = getV6StepById(cs.stepId);
                if (!st) return null;
                return (
                  <Reveal as="li" key={cs.id} index={i}>
                    <Link href={v6StepHref(st.n)} className={cn("flex h-full flex-col rounded-[20px] p-5 md:p-6", LIFT_CARD)}>
                      <IconTile icon={cs.icon} size="lg" />
                      <h4 className="mt-5 font-heading text-[18px] font-bold leading-[1.5] text-text-primary">{cs.title}</h4>
                      <p className={cn(BODY, "mt-2")}>
                        <T f={cs.what} />
                      </p>
                      <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-bold text-text-primary">
                        ステップ{st.n}でつくる
                        <Arrow size={14} />
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </ul>

            <h3 className={cn(H3, "mt-14")}>身につけるスキル</h3>
            <SkillTagLegend className="mt-4" />
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {v6Skills.map((sk, i) => (
                <Reveal as="li" key={sk.id} index={i} className={cn("flex flex-col rounded-[16px] p-4", STATIC_CARD)}>
                  <div className="flex items-start justify-between gap-2">
                    <IconTile icon={sk.icon} size="sm" />
                    <SkillTagBadge tag={sk.tag} />
                  </div>
                  <p className={cn("mt-3 text-[15px] font-bold leading-[1.5] text-text-primary", PHRASE)}>{sk.name}</p>
                  <p className="mt-1 text-sm leading-[1.7] text-text-secondary">
                    <T f={sk.oneLine} />
                  </p>
                </Reveal>
              ))}
            </ul>
            <div className="mt-6">
              <TextLink href={`${V6_GOAL_HREF}#hiring`}>なぜこのスキルが必要？ 解説を読む</TextLink>
            </div>
          </section>

          {/* 3 全体図 */}
          <section id="overview" aria-labelledby="overview-title" className={SECTION}>
            <SectionHead
              id="overview-title"
              kicker="Overview"
              title="全体図と、なぜこの順番か"
              lead={<P para={rm.orderLead} />}
            />
            <div className="mt-4">
              <TextLink href={`${V6_GOAL_HREF}#order`}>順番の理由をくわしく読む</TextLink>
            </div>
            <Overview />
          </section>

          {/* 4 6つのステップ */}
          <section id="steps" aria-labelledby="steps-title" className={SECTION}>
            <SectionHead id="steps-title" kicker="Steps" title="6つのステップ" />
            <div className="mt-10 grid gap-10 lg:grid-cols-[196px_minmax(0,1fr)] lg:gap-12">
              <div className="hidden lg:block">
                <ScrollSpy
                  label="ステップの目次"
                  className="sticky top-8"
                  items={v6Steps.map((st) => ({ id: `step-${st.n}`, label: st.short, meta: pad2(st.n) }))}
                />
              </div>
              <div className="min-w-0">
                {v6Steps.map((st, i) => (
                  <StepBlock key={st.id} step={st} lessons={lessons} last={i === v6Steps.length - 1} />
                ))}
              </div>
            </div>
          </section>

          {/* 5 先輩の道のり */}
          <section id="seniors" aria-labelledby="seniors-title" className={SECTION}>
            <SectionHead
              id="seniors-title"
              kicker="Stories"
              title="先輩の道のり"
              lead="BONOで学んで転職した人の話から。名前は伏せています。"
            />
            <ul className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
              {rm.seniors.map((sn, i) => (
                <Reveal as="li" key={i} index={i} className={cn("flex w-[78%] shrink-0 snap-start flex-col rounded-[20px] p-5 md:w-auto", STATIC_CARD)}>
                  <h3 className="font-heading text-base font-bold leading-[1.5] text-text-primary">
                    <T f={sn.who} />
                  </h3>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-border-light py-3">
                    <div>
                      <dt className="text-xs text-text-muted">内定までの期間</dt>
                      <dd className="mt-0.5 font-latin text-lg font-bold text-text-primary">
                        <T f={sn.period} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-text-muted">応募した数</dt>
                      <dd className="mt-0.5 font-latin text-lg font-bold text-text-primary">
                        <T f={sn.applications} />
                      </dd>
                    </div>
                  </dl>
                  <p className={cn(BODY, "mt-3")}>
                    <T f={sn.note} />
                  </p>
                </Reveal>
              ))}
            </ul>
          </section>

          {/* 6 よくある質問 */}
          <section id="faq" aria-labelledby="faq-title" className={SECTION}>
            <div className="grid gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
              <SectionHead id="faq-title" kicker="FAQ" title="よくある質問" />
              <div className="border-t border-text-secondary">
                {rm.faq.map((item, i) => (
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
                    <div className="space-y-3 pb-6 pl-7 pr-2 md:pr-11">
                      {item.a.map((para, j) => (
                        <P key={j} para={para} />
                      ))}
                      {item.sources.length > 0 ? (
                        <p className="text-xs leading-[1.7] text-text-muted">
                          出典（2026年10月時点）：
                          {item.sources.map((src, j) => (
                            <span key={src.href}>
                              {j > 0 ? "、" : null}
                              <a href={src.href} target="_blank" rel="noopener noreferrer" className={cn("rounded-[2px] underline underline-offset-2 hover:text-text-primary", FOCUS)}>
                                {src.label}
                              </a>
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* 7 根拠 */}
          <section id="sources" aria-labelledby="sources-title" className={cn(SECTION, "pb-0")}>
            <Kicker>Sources</Kicker>
            <h2 id="sources-title" className="mt-2 font-heading text-lg font-bold text-text-primary">
              このロードマップの根拠
            </h2>
            <p className="mt-2 text-sm leading-[1.8] text-text-secondary">
              <T f={rm.sources.note} />
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {rm.sources.groups.map((g) => (
                <div key={g.title}>
                  <h3 className="text-sm font-bold text-text-primary">{g.title}</h3>
                  <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                    {g.links.map((l) => (
                      <li key={l.href}>
                        <a href={l.href} target="_blank" rel="noopener noreferrer" className={cn("rounded-[2px] underline underline-offset-2 hover:text-text-primary", FOCUS)}>
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </KariProvider>
  );
}
