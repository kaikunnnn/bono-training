/**
 * /dev/course-pages/prototyping/roadmap/career-change-v3 — 未経験から転職（新しい形・試作）#243
 *
 * 背骨は「区切りごとにポートフォリオが育つ」（issue 243 の決定 2026-10-14）。中身の根拠は 243-A。
 * 1. 最初の画面: 行き先・誰向け・たどり着く状態 ＋ 道のり全体の地図（区切りごとにつくるものの小さな画像）
 * 2. 区切り（5つ）: なぜ今これか → 目標（画像＋1行）→ つくるもの（画像）→ ポートフォリオに足されるもの（帯が1つずつ埋まる）→ 次へ進んでよい目安
 * 3. 完成したポートフォリオ（代表作3つ＋練習の記録）と、それでできること
 * 4. よくある迷い・ほかの行き先（短く）
 * ?progress=1: 会員の見え方（いまここ 2/5（1つ完了））
 * 押せるものだけ白。文言は data/roadmap-career-change-v3.ts（すべて仮）。
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Plus } from "lucide-react";
import { Calendar, Flag, Map1, Profile2User, Routing2, TickCircle } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCourse } from "../../../data";
import { careerChangeV3 as rm, PORTFOLIO_PIECES, type V3Stage } from "../../../data/roadmap-career-change-v3";
import { roadmaps } from "../../../data/roadmaps";
import type { Field } from "../../../data/types";
import { KariProvider, T } from "../../../template/kari";
import { hereLabel } from "../../../template/path";
import { pad2, splitTitle } from "../../../template/shared";
import { ROADMAP_BASE } from "../parts";
import WorkMock from "./WorkMock";
import { CLICKABLE, LinkChip, PathMap, PortfolioStrip, StageStatusTag, stageStatus } from "./parts";

export const metadata: Metadata = {
  title: "未経験から転職ロードマップ（新しい形・試作）",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ progress?: string }>;

const k = (text: string): Field => ({ text, kari: true });

const stages = rm.stages as V3Stage[];
const featuredCount = PORTFOLIO_PIECES.filter((p) => p.featured).length;

/* ---------- 区切りの中の小見出し（h3） ---------- */

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-xs font-bold tracking-[0.04em] text-text-muted", className)}>{children}</h3>;
}

/** コースへのリンク（押せる＝白）。解決できない slug は出さない */
function CourseLink({ slug }: { slug: string }) {
  const course = getCourse(slug);
  if (!course) return null;
  const { main, sub } = splitTitle(course.title.text);
  return (
    <Link href={`/dev/course-pages/v2/${slug}`} className={cn("group flex items-center gap-4 rounded-[16px] px-4 py-3", CLICKABLE)}>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-[15px] font-bold leading-[1.5]">{main}</p>
        {sub ? <p className="truncate text-xs text-text-secondary">{sub}</p> : null}
      </div>
      <span className="flex shrink-0 items-center gap-1 text-xs font-bold">
        コースを見る
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/** 記事などへのリンク（画像つきは記事のサムネイル＝実画像） */
function GuideLink({ label, href, image }: { label: string; href: string; image?: string }) {
  if (!image) return <LinkChip label={label} href={href} />;
  const external = href.startsWith("http");
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className={cn("group flex items-center gap-3 rounded-[16px] p-2 pr-4", CLICKABLE)}
    >
      <span className="relative aspect-[16/9] w-[96px] shrink-0 overflow-hidden rounded-[10px]">
        <Image src={image} alt="" fill sizes="96px" unoptimized className="object-cover" />
      </span>
      <span className="min-w-0 flex-1 text-[13px] font-bold leading-[1.5]">{label}</span>
      <ArrowRight size={14} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/* ---------- 区切り ---------- */

function Stage({ stage, index, done }: { stage: V3Stage; index: number; done: number | null }) {
  const status = stageStatus(index, done);
  return (
    <section
      id={`stage-${index + 1}`}
      aria-labelledby={`stage-${index + 1}-title`}
      className="scroll-mt-6 border-t border-border-light py-14 md:py-20"
    >
      {/* 見出し */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
        <span className="font-latin text-sm font-bold tracking-[0.08em] text-text-primary">
          {pad2(index + 1)} / {pad2(stages.length)}
        </span>
        <span className="rounded-full border border-border-default px-2 py-0.5 font-bold text-text-secondary">
          {stage.kind === "course" ? "コース" : "コースの外でやること"}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={14} color="currentColor" variant="Linear" />
          <T f={stage.period} />
        </span>
        <StageStatusTag status={status} />
      </div>
      <h2
        id={`stage-${index + 1}-title`}
        className="mt-3 font-heading text-[24px] font-bold leading-[1.4] tracking-[-0.03em] md:text-[30px]"
      >
        {stage.title}
      </h2>

      {/* なぜ今これか（控えめに） */}
      <div className="mt-4 max-w-[680px] border-l-2 border-border-default pl-4">
        <Label>なぜ今これか</Label>
        <p className="mt-1 text-[14px] leading-[1.9] text-text-secondary">
          <T f={stage.why} />
        </p>
      </div>

      {/* 目標 と つくるもの（画像が主役） */}
      <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-6">
        <div>
          <Label>目標</Label>
          <WorkMock kind={stage.goal.mock} className="mt-2" />
          <p className="mt-3 flex items-start gap-2 font-heading text-[17px] font-bold leading-[1.6] md:text-[18px]">
            <Flag size={18} color="currentColor" variant="Bold" className="mt-[5px] shrink-0" />
            <span>
              <T f={stage.goal.line} />
            </span>
          </p>
          <p className="mt-1 pl-[26px] text-xs text-text-muted">画像: {stage.goal.caption}</p>
        </div>
        <div>
          <Label>つくるもの</Label>
          <WorkMock kind={stage.make.mock} className="mt-2" />
          <ul className="mt-3 space-y-1.5">
            {stage.make.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[14px] leading-[1.7]">
                <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-text-primary" />
                <span>
                  <T f={item} />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-1 pl-[14px] text-xs text-text-muted">画像: {stage.make.caption}</p>
        </div>
      </div>

      {/* ポートフォリオに足されるもの */}
      <div className="mt-10 rounded-[24px] bg-[var(--bg-muted)] p-4 md:p-6">
        <Label>ポートフォリオに足されるもの</Label>
        <p className="mt-1 text-[15px] font-bold leading-[1.7]">
          <T f={stage.adds.line} />
        </p>
        <PortfolioStrip mode="stage" at={index} className="mt-3" />
        <div className="mt-3 border-t border-border-light pt-3">
          <p className="text-xs font-bold text-text-muted">記録しておくこと</p>
          <ul className="mt-1.5 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {stage.adds.record.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[13px] leading-[1.7] text-text-secondary">
                <Check size={13} strokeWidth={3} className="mt-[5px] shrink-0 text-text-muted" />
                <span>
                  <T f={r} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 次へ進んでよい目安 ＋ リンク */}
      <div className="mt-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
        <div
          className={cn(
            "flex items-start gap-3 rounded-[16px] px-4 py-3",
            status === "done" ? "bg-[var(--bg-success)]" : "bg-[var(--persona-hero-surface)]"
          )}
        >
          {status === "done" ? (
            <TickCircle size={20} color="currentColor" variant="Bold" className="mt-0.5 shrink-0 text-text-success" />
          ) : (
            <Flag size={20} color="currentColor" variant="Linear" className="mt-0.5 shrink-0" />
          )}
          <div>
            <Label className={status === "done" ? "text-text-success" : undefined}>
              {status === "done" ? "目安クリア" : "次へ進んでよい目安"}
            </Label>
            <p className={cn("mt-0.5 text-[15px] font-bold leading-[1.7]", status === "done" && "text-text-success")}>
              <T f={stage.checkpoint} />
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {stage.courseSlug ? <CourseLink slug={stage.courseSlug} /> : null}
          {stage.links.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stage.links.map((l) => (
                <GuideLink key={l.href} {...l} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ---------- ページ ---------- */

export default async function CareerChangeV3Page({ searchParams }: { searchParams: SearchParams }) {
  const { progress } = await searchParams;
  const done = progress === "1" ? rm.progressDone : null;
  const firstCourse = stages.find((s) => s.courseSlug)?.courseSlug ?? null;
  const nextStage = done !== null ? stages[done] : null;
  const ctaCourse = done !== null ? (nextStage?.courseSlug ?? null) : firstCourse;
  const courseStages = stages.filter((s) => s.kind === "course").length;
  const others = roadmaps.filter((r) => r.slug !== rm.slug);

  return (
    <KariProvider preview={{ progress: done !== null }}>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[1080px] px-4 pb-28 pt-6 md:px-10 md:pt-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
            <Link href={ROADMAP_BASE} className="hover:text-text-primary">
              ← ロードマップのプロト
            </Link>
            <Link href={`${ROADMAP_BASE}/career-change`} className="hover:text-text-primary">
              前の形（v2）と比べる
            </Link>
          </div>

          {/* 1. 最初の画面 */}
          <header className="pb-12 pt-6 md:pb-16">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-text-secondary px-2.5 py-0.5 text-xs font-bold text-text-secondary">
              <Map1 size={13} color="currentColor" variant="Linear" />
              ロードマップ
            </p>
            <div className="mt-3 grid gap-x-10 gap-y-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <h1 className="font-heading text-[30px] font-bold leading-[1.35] tracking-[-0.05em] md:text-[40px]">{rm.name}</h1>
                <p className="mt-2 flex items-start gap-2 text-[14px] font-bold leading-[1.7] text-text-secondary">
                  <Profile2User size={17} color="currentColor" variant="Linear" className="mt-[3px] shrink-0" />
                  <span>
                    <T f={rm.audience} />
                  </span>
                </p>
              </div>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-text-secondary md:justify-end">
                <span className="flex items-center gap-1.5">
                  <Calendar size={15} color="currentColor" variant="Linear" />
                  <strong className="text-text-primary">
                    <T f={rm.period} />
                  </strong>
                </span>
                <span aria-hidden="true" className="text-border-default">
                  |
                </span>
                <span className="flex items-center gap-1.5">
                  <Routing2 size={15} color="currentColor" variant="Linear" />
                  コース <strong className="text-text-primary">{courseStages}</strong> ＋ コースの外{" "}
                  <strong className="text-text-primary">{stages.length - courseStages}</strong>
                </span>
              </p>
            </div>

            <p className="mt-5 max-w-[760px] font-heading text-[19px] font-bold leading-[1.6] md:text-[22px]">
              <span className="text-text-muted">たどり着くのは、</span>
              <T f={rm.destination} />
              <span className="text-text-muted">状態です。</span>
            </p>

            {done !== null ? (
              <div className="mt-6 grid gap-4 rounded-[20px] border-2 border-text-primary p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:items-center md:gap-8">
                <div>
                  <p className="text-sm font-bold">{hereLabel(done, stages.length)}</p>
                  {nextStage ? (
                    <p className="mt-1 text-[13px] leading-[1.7] text-text-secondary">
                      次は「{nextStage.title}」。終えると、
                      <strong className="text-text-primary">
                        {PORTFOLIO_PIECES.filter((p) => p.addedAt === done)
                          .map((p) => p.label)
                          .join("、") || "説明ページ"}
                      </strong>
                      が入ります。
                    </p>
                  ) : null}
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted">あなたのポートフォリオ（いま入っているもの）</p>
                  <PortfolioStrip mode="progress" at={done} className="pt-1" />
                </div>
              </div>
            ) : null}

            <h2 className="mt-8 text-xs font-bold tracking-[0.04em] text-text-muted">道のり全体（5つの区切り）と、ポートフォリオに増えるもの</h2>
            <div className="mt-3">
              <PathMap
                stages={stages}
                done={done}
                destination={<T f={k("代表作3つ＋練習の記録が入ったポートフォリオで、求人に応募する")} />}
              />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {ctaCourse ? (
                <Button asChild size="large">
                  <Link href={`/dev/course-pages/v2/${ctaCourse}`}>
                    {done !== null ? "次のコースへ進む" : "最初のコースから始める"}
                    <ArrowRight strokeWidth={2.5} />
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline-ghost" size="large">
                <a href="#portfolio-final">完成したポートフォリオを見る</a>
              </Button>
            </div>
            {done === null ? (
              <p className="mt-3 text-xs leading-[1.8] text-text-muted">
                <T f={k("このページは誰でも最後まで読めます。進み具合の記録とコースの中身は会員向けです。")} />
              </p>
            ) : null}
          </header>

          {/* 2. 区切り */}
          {stages.map((stage, i) => (
            <Stage key={stage.short} stage={stage} index={i} done={done} />
          ))}

          {/* 3. 完成したポートフォリオ */}
          <section id="portfolio-final" aria-labelledby="final-title" className="scroll-mt-6 border-t border-border-light py-14 md:py-20">
            <p className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
              <Flag size={14} color="currentColor" variant="Bold" />
              行き先
            </p>
            <h2 id="final-title" className="mt-2 font-heading text-[24px] font-bold leading-[1.4] tracking-[-0.03em] md:text-[30px]">
              代表作{featuredCount}つと練習の記録が入ったポートフォリオ
            </h2>
            <p className="mt-2 max-w-[680px] text-[14px] leading-[1.9] text-text-secondary">
              <T f={k("5つの区切りで1つずつ足してきたものが、そのまま応募に使う形になります。代表作は最低3つ。1つだけだと「たまたまかも」と思われやすいためです。")} />
            </p>

            <div className="mt-6 rounded-[24px] bg-[var(--bg-muted)] p-4 md:p-6">
              <PortfolioStrip mode="final" size="lg" />
            </div>

            <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10">
              <figure>
                <Link href="/outputs" className={cn("group block overflow-hidden rounded-[20px]", CLICKABLE)}>
                  <Image
                    src="/images/content/career/outputs.png"
                    alt="BONOのメンバーがまとめた作品の記事の一覧"
                    width={1200}
                    height={675}
                    unoptimized
                    className="h-auto w-full"
                  />
                </Link>
                <figcaption className="mt-2 text-xs leading-[1.7] text-text-muted">
                  BONOのメンバーが、作品のつくり方をまとめた記事（実例）。説明ページを書くときの見本になります。
                </figcaption>
              </figure>
              <div>
                <h3 className="font-heading text-lg font-bold">これでできること</h3>
                <ul className="mt-3 space-y-2.5">
                  {[
                    k("UIデザイナーの求人に、会社ごとに並べ替えたポートフォリオで応募する"),
                    k("面接で、代表作1つを「何を・なぜ・どうやって」の順に3分で話す"),
                    k("15分フィードバックで現役のデザイナーに見てもらい、応募前に直す"),
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] leading-[1.8]">
                      <Check size={16} strokeWidth={2.5} className="mt-[4px] shrink-0 text-text-success" />
                      <span>
                        <T f={f} />
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  {firstCourse ? (
                    <Button asChild size="large">
                      <Link href={`/dev/course-pages/v2/${firstCourse}`}>
                        最初のコースから始める
                        <ArrowRight strokeWidth={2.5} />
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild variant="outline-ghost" size="large">
                    <Link href="/how-to/feedback">15分フィードバックとは</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* 4. よくある迷い */}
          <section aria-labelledby="faq-title" className="border-t border-border-light py-14">
            <h2 id="faq-title" className="font-heading text-xl font-bold tracking-[-0.03em]">
              よくある迷い
            </h2>
            <div className="mt-4 border-t border-text-secondary">
              {rm.faq.map((item, i) => (
                <details key={i} className="group border-b border-border-light">
                  <summary className="flex cursor-pointer list-none items-center gap-4 py-4 [&::-webkit-details-marker]:hidden">
                    <span className="font-latin text-sm font-bold text-text-muted">Q</span>
                    <h3 className="min-w-0 flex-1 text-[15px] font-bold leading-[1.6]">
                      <T f={item.question} />
                    </h3>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-light text-text-secondary transition-transform group-open:rotate-45">
                      <Plus size={14} strokeWidth={2} />
                    </span>
                  </summary>
                  <p className="pb-5 pl-7 pr-11 text-sm leading-[1.9] text-text-secondary">
                    <T f={item.answer} />
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* 5. ほかの行き先 */}
          <section aria-labelledby="others-title" className="border-t border-border-light pt-14">
            <h2 id="others-title" className="font-heading text-xl font-bold tracking-[-0.03em]">
              ほかの行き先
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {others.map((r) => (
                <li key={r.slug}>
                  <Link href={`${ROADMAP_BASE}/${r.slug}`} className={cn("inline-flex rounded-full px-3 py-1.5 text-xs font-bold", CLICKABLE)}>
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </KariProvider>
  );
}
