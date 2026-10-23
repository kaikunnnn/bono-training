/**
 * /dev/course-pages/prototyping/roadmap/career-change-v5 — 未経験から転職（v5・採用側の根拠と入口の現実）#243
 *
 * v4（記事ベース）に「企業が何を、なぜ求めているか」と「入口の現実」を足した版。v4 は比較用に残す。
 * 材料は rebono/issues/243-B_材料/ の A・B・C・E（日本の資料だけ。海外の資料は使わない）。
 * 0. ヘッダー（誰向け・目安・書いた人）
 * 1. 入口の現実（職種未経験の求人はほとんどない → だからポートフォリオで「現場で動ける」を見せる）
 * 2. 企業が見ているもの、なぜか（入場券／決め手＋ポテンシャル枠、3作品）
 * 3. AIで変わったこと、変わらないこと
 * 4. 全体図 → ステップ6つ（各ステップが入場券／決め手のどちらを証明するか＋3行メモ）
 * 5. 狭い入口の通り方
 * 6. 経験がある人 / 先輩の道のり / つまずき / よくある質問
 * 7. このロードマップの根拠
 * 文字は本文 16px（ds-body-jp）。12px は出典・パンくずなどのメタ情報だけ。
 * 文言は data/roadmap-career-change-v5.ts（材料にない推測は「仮」）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Calendar, Edit2, Flag, Map1, Profile2User } from "iconsax-react";
import { cn } from "@/lib/utils";
import { getCourse } from "../../../data";
import { careerChangeV5 as rm, type Para, type Proof, type Src, type V5CourseRef, type V5Stage } from "../../../data/roadmap-career-change-v5";
import { roadmaps } from "../../../data/roadmaps";
import { KariProvider, T } from "../../../template/kari";
import { splitTitle } from "../../../template/shared";
import { CLICKABLE, LinkChip } from "../career-change-v3/parts";
import { ROADMAP_BASE } from "../parts";

export const metadata: Metadata = {
  title: "未経験から転職ロードマップ（v5・採用側の根拠）",
  robots: { index: false, follow: false },
};

const stages = rm.stages as V5Stage[];
const stageNo = (id: string) => stages.findIndex((s) => s.id === id) + 1;

const SECTION = "scroll-mt-6 border-t border-border-light py-12 md:py-16";
const H2 = "font-heading text-[24px] font-bold leading-[1.4] tracking-[-0.03em] md:text-[28px]";
const H3 = "font-heading text-[18px] font-bold leading-[1.5]";
/** 本文（ds-body-jp） */
const BODY = "text-base leading-[1.8] text-text-secondary";
const PANEL = "rounded-[20px] bg-[var(--bg-muted)]";

const PROOF_LABEL: Record<Proof, string> = { ticket: "入場券", decider: "決め手" };

/* ---------- 部品 ---------- */

/** 段落（文ごとに「仮」タグを付けられるよう Field の並びで受ける） */
function P({ para, className }: { para: Para; className?: string }) {
  return (
    <p className={cn(BODY, className)}>
      {para.map((f, i) => (
        <T key={i} f={f} />
      ))}
    </p>
  );
}

/** 出典（12px のメタ情報） */
function Sources({ sources, className }: { sources?: Src[]; className?: string }) {
  if (!sources || sources.length === 0) return null;
  return (
    <p className={cn("text-xs leading-[1.7] text-text-muted", className)}>
      出典：
      {sources.map((src, i) => {
        const external = src.href.startsWith("http");
        return (
          <span key={src.label + src.href}>
            {i > 0 ? "、" : null}
            <a
              href={src.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="underline underline-offset-2 hover:text-text-primary"
            >
              {src.label}
            </a>
          </span>
        );
      })}
    </p>
  );
}

/** 入場券／決め手 のタグ */
function ProofTag({ proof }: { proof: Proof }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 rounded-full px-2 py-0.5 font-noto-sans-jp text-xs font-bold",
        proof === "decider" ? "bg-text-primary text-text-inverse" : "border border-text-secondary text-text-secondary"
      )}
    >
      {PROOF_LABEL[proof]}
    </span>
  );
}

/** コース（押せる＝白）／準備中のコース（押せない） */
function CourseRow({ course }: { course: V5CourseRef }) {
  if (course.type === "planned") {
    return (
      <div className="flex items-center gap-3 rounded-[14px] border border-dashed border-border-default px-4 py-3">
        <p className="min-w-0 flex-1 text-base font-bold text-text-secondary">{course.title}</p>
        <span className="shrink-0 rounded-full bg-[var(--bg-muted-strong)] px-2 py-0.5 text-xs font-bold text-text-muted">
          準備中
        </span>
      </div>
    );
  }
  const data = getCourse(course.slug);
  if (!data) return null;
  const { main } = splitTitle(data.title.text);
  return (
    <Link
      href={`/dev/course-pages/v2/${course.slug}`}
      className={cn("group flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[14px] px-4 py-3", CLICKABLE)}
    >
      <p className="min-w-0 flex-1 font-heading text-base font-bold leading-[1.5]">{main}</p>
      <span className="flex shrink-0 items-center gap-1 text-sm font-bold">
        このコースを始める
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function Stage({ stage, index }: { stage: V5Stage; index: number }) {
  const n = index + 1;
  return (
    <article id={`stage-${n}`} aria-labelledby={`stage-${n}-title`} className="scroll-mt-6 border-t border-border-light pt-10 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-text-primary px-2 py-0.5 font-bold text-text-inverse">
          ステップ {n} / {stages.length}
        </span>
        <span className="text-text-muted">証明するもの</span>
        {stage.proves.map((p) => (
          <ProofTag key={p} proof={p} />
        ))}
      </div>
      <h3 id={`stage-${n}-title`} className="mt-3 font-heading text-[20px] font-bold leading-[1.6] md:text-[22px]">
        {stage.title}
      </h3>

      <div className="mt-4 space-y-4">
        {stage.body.map((para, i) => (
          <P key={i} para={para} />
        ))}
      </div>

      {stage.extra ? (
        <div className="mt-4">
          <P para={[stage.extra.lead]} />
          <ol className={cn(BODY, "mt-2 list-decimal space-y-1 pl-6")}>
            {stage.extra.items.map((it, i) => (
              <li key={i}>
                <T f={it} />
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {/* このステップの3行メモ */}
      <div className="mt-6 rounded-[16px] border border-border-default p-4 md:p-5">
        <h4 className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <Edit2 size={16} color="currentColor" variant="Linear" className="shrink-0" />
          このステップの3行メモ
        </h4>
        <p className="mt-1 text-sm leading-[1.7] text-text-muted">
          <T f={stage.memo.about} />
        </p>
        <ol className={cn(BODY, "mt-2 list-decimal space-y-1 pl-6")}>
          {stage.memo.lines.map((line, i) => (
            <li key={i}>
              <T f={line} />
            </li>
          ))}
        </ol>
      </div>

      <blockquote className="mt-6 border-l-2 border-border-default pl-4">
        <p className="text-base leading-[1.8] text-text-primary">
          「<T f={stage.senpai.text} />」
        </p>
        <footer className="mt-1 text-sm text-text-muted">
          — 先輩の一言：{stage.senpai.who}（{stage.senpai.from}）
        </footer>
      </blockquote>

      <div className={cn("mt-6 p-4 md:p-5", PANEL)}>
        <p className="flex items-start gap-2 text-base leading-[1.8] text-text-secondary">
          <Calendar size={18} color="currentColor" variant="Linear" className="mt-[5px] shrink-0" />
          <span>
            目安は<T f={stage.period} />です。
            {stage.courseNote ? (
              <>
                <T f={stage.courseNote} />。
              </>
            ) : null}
          </span>
        </p>
        {stage.courses.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2">
            {stage.courses.map((c) => (
              <CourseRow key={c.type === "course" ? c.slug : c.title} course={c} />
            ))}
          </div>
        ) : null}
        {stage.links.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {stage.links.map((l) => (
              <LinkChip key={l.href} {...l} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

/* ---------- ページ ---------- */

export default function CareerChangeV5Page() {
  const others = roadmaps.filter((r) => r.slug !== rm.slug);
  const otherRoadmap = roadmaps.find((r) => r.slug === rm.experienced.otherRoadmap.slug);
  const src = rm.sources;

  return (
    <KariProvider>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[880px] px-4 pb-28 pt-6 md:px-10 md:pt-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
            <Link href={ROADMAP_BASE} className="hover:text-text-primary">
              ← ロードマップのプロト
            </Link>
            <Link href={`${ROADMAP_BASE}/career-change-v4`} className="hover:text-text-primary">
              v4と比べる
            </Link>
          </div>

          {/* 0. ヘッダー */}
          <header className="pb-10 pt-6 md:pb-14">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-text-secondary px-2.5 py-0.5 text-xs font-bold text-text-secondary">
              <Map1 size={13} color="currentColor" variant="Linear" />
              ロードマップ
            </p>
            <h1 className="mt-3 font-heading text-[30px] font-bold leading-[1.35] tracking-[-0.05em] md:text-[40px]">{rm.name}</h1>
            <p className="mt-3 flex items-start gap-2 text-base font-bold leading-[1.8] text-text-secondary">
              <Profile2User size={18} color="currentColor" variant="Linear" className="mt-[5px] shrink-0" />
              <span>
                <T f={rm.audience} />
              </span>
            </p>
            <dl className={cn("mt-6 grid grid-cols-3 gap-3 p-4 md:p-5", PANEL)}>
              {[
                { label: "目安期間", value: rm.summary.period },
                { label: "つくる作品", value: rm.summary.works },
                { label: "前提知識", value: rm.summary.prerequisite },
              ].map((row) => (
                <div key={row.label} className="min-w-0">
                  <dt className="text-xs font-bold text-text-muted">{row.label}</dt>
                  <dd className="mt-0.5 font-heading text-base font-bold leading-[1.5] md:text-[20px]">
                    <T f={row.value} />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-xs leading-[1.7] text-text-muted">
              先輩の実際: <T f={rm.summary.senpai} />
              （このページで紹介している転職者の話から。進み方には差があります）
            </p>
            <p className="mt-4 text-xs leading-[1.7] text-text-muted">
              このロードマップを書いた人：<T f={rm.author.who} />
              <br />
              求人と採用側の資料は <T f={rm.author.surveyedAt} /> に調べたものです（
              <a href="#sources" className="underline underline-offset-2 hover:text-text-primary">
                根拠の一覧
              </a>
              ）
            </p>
          </header>

          {/* 1. 入口の現実 */}
          <section id="reality" aria-labelledby="reality-title" className={SECTION}>
            <h2 id="reality-title" className={H2}>
              入口の現実
            </h2>
            <div className="mt-4 space-y-5">
              {rm.reality.blocks.map((b, i) => (
                <div key={i}>
                  <P para={b.para} />
                  <Sources sources={b.sources} className="mt-1" />
                </div>
              ))}
            </div>
            <p className={cn("mt-6 border-l-2 border-text-primary pl-4 text-base font-bold leading-[1.8] text-text-primary")}>
              <T f={rm.reality.goal} />
            </p>
            <div className={cn("mt-6 p-4 md:p-5", PANEL)}>
              <P para={rm.reality.senpai} />
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="#gate" className={cn("group inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold", CLICKABLE)}>
                  狭い入口の通り方を見る
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </a>
                <a href="#stories" className={cn("group inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold", CLICKABLE)}>
                  先輩の道のりを見る
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </section>

          {/* 2. 企業が見ているもの */}
          <section id="wants" aria-labelledby="wants-title" className={SECTION}>
            <h2 id="wants-title" className={H2}>
              企業が見ているもの、なぜか
            </h2>
            <P para={rm.wants.lead} className="mt-3" />
            <ul className="mt-5 grid gap-3 md:grid-cols-2">
              {rm.wants.layers.map((l) => (
                <li key={l.key} className={cn("flex flex-col p-4 md:p-5", PANEL)}>
                  <ProofTag proof={l.key} />
                  <h3 className={cn(H3, "mt-2")}>{l.title}</h3>
                  <p className={cn(BODY, "mt-2")}>
                    <T f={l.body} />
                  </p>
                  <p className="mt-auto pt-3 text-sm font-bold leading-[1.6] text-text-primary">
                    <T f={l.stat} />
                  </p>
                  <Sources sources={l.sources} className="mt-1" />
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-5">
              <div>
                <P para={rm.wants.ticketWhy.para} />
                <Sources sources={rm.wants.ticketWhy.sources} className="mt-1" />
              </div>
              {rm.wants.deciderWhy.map((b, i) => (
                <div key={i}>
                  <P para={b.para} />
                  <Sources sources={b.sources} className="mt-1" />
                </div>
              ))}
            </div>

            <div className={cn("mt-8 p-4 md:p-5", PANEL)}>
              <h3 className={H3}>{rm.wants.potential.title}</h3>
              <P para={rm.wants.potential.para} className="mt-2" />
              <Sources sources={rm.wants.potential.sources} className="mt-1" />
            </div>

            <h3 className={cn(H3, "mt-10")}>ポートフォリオの3つの作品</h3>
            <P para={[rm.wants.worksLead]} className="mt-2" />
            <ul className="mt-4 grid gap-3 md:grid-cols-3">
              {rm.wants.works.map((w) => (
                <li key={w.label} className={cn("flex flex-col p-4", PANEL)}>
                  <p className="text-xs font-bold text-text-muted">{w.label}</p>
                  <h4 className="mt-1 font-heading text-[18px] font-bold leading-[1.5]">{w.title}</h4>
                  <p className={cn(BODY, "mt-2")}>
                    <T f={w.body} />
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
                    {w.proves.map((p) => (
                      <ProofTag key={p} proof={p} />
                    ))}
                    <span className="text-xs font-bold text-text-muted">ステップ{stageNo(w.stageId)}でつくる</span>
                  </div>
                </li>
              ))}
            </ul>
            <P para={[rm.wants.whyThree]} className="mt-4" />
          </section>

          {/* 3. AI */}
          <section id="ai" aria-labelledby="ai-title" className={SECTION}>
            <h2 id="ai-title" className={H2}>
              AIで変わったこと、変わらないこと
            </h2>
            <div className="mt-4 space-y-5">
              {rm.ai.blocks.map((b, i) => (
                <div key={i}>
                  <P para={b.para} />
                  <Sources sources={b.sources} className="mt-1" />
                </div>
              ))}
            </div>
          </section>

          {/* 4. 全体図 */}
          <section id="overview" aria-labelledby="overview-title" className={SECTION}>
            <h2 id="overview-title" className={H2}>
              全体図と、なぜこの順か
            </h2>
            <P para={rm.order} className="mt-3" />
            <ol className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {stages.map((stage, i) => (
                <li key={stage.id} className="min-w-0">
                  <a href={`#stage-${i + 1}`} className={cn("group flex h-full flex-col gap-1 rounded-[16px] p-4", CLICKABLE)}>
                    <span className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      <span className="font-latin font-bold">{i + 1}</span>
                      <T f={stage.period} />
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-[18px] font-bold leading-[1.5]">{stage.short}</span>
                      {stage.proves.map((p) => (
                        <ProofTag key={p} proof={p} />
                      ))}
                    </span>
                    <span className="flex items-start gap-1.5 text-base leading-[1.7] text-text-secondary">
                      <ArrowRight size={14} className="mt-[6px] shrink-0 text-text-muted" />
                      <span>
                        <T f={stage.handoff} />
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-3 flex items-center gap-2 text-sm text-text-muted">
              <Flag size={14} color="currentColor" variant="Bold" />
              合計の目安 <T f={rm.summary.period} />（ステップごとの期間を足した幅）
            </p>
          </section>

          {/* 4. ステップ */}
          <section id="stages" aria-labelledby="stages-title" className={SECTION}>
            <h2 id="stages-title" className={H2}>
              ステップごとにやること
            </h2>
            <div className={cn("mt-4 p-4 md:p-5", PANEL)}>
              <p className="flex items-center gap-2 text-sm font-bold text-text-primary">
                <Edit2 size={16} color="currentColor" variant="Linear" className="shrink-0" />
                全ステップ共通：つくったら「なぜこの形か」を3行で書く
              </p>
              <P para={rm.memoIntro.para} className="mt-2" />
            </div>
            <div className="mt-10 flex flex-col gap-8">
              {stages.map((stage, i) => (
                <Stage key={stage.id} stage={stage} index={i} />
              ))}
            </div>
          </section>

          {/* 5. 狭い入口の通り方 */}
          <section id="gate" aria-labelledby="gate-title" className={SECTION}>
            <h2 id="gate-title" className={H2}>
              狭い入口の通り方
            </h2>
            <P para={rm.gate.lead} className="mt-3" />
            <div className="mt-6 flex flex-col gap-8">
              {rm.gate.items.map((it) => (
                <div key={it.title}>
                  <h3 className={H3}>{it.title}</h3>
                  <P para={it.body} className="mt-2" />
                  <Sources sources={it.sources} className="mt-1" />
                </div>
              ))}
            </div>
          </section>

          {/* 6. 経験がある人 */}
          <section id="experienced" aria-labelledby="experienced-title" className={SECTION}>
            <h2 id="experienced-title" className={H2}>
              経験がある人はどこから？
            </h2>
            <p className={cn(BODY, "mt-3")}>
              <T f={rm.experienced.lead} />
              次のことができるなら、そのステップは飛ばして構いません。
            </p>
            <ul className={cn(BODY, "mt-3 list-disc space-y-2 pl-6")}>
              {stages.map((stage, i) =>
                stage.skipIf ? (
                  <li key={stage.id}>
                    <span className="font-bold text-text-primary">
                      ステップ{i + 1}「{stage.short}」
                    </span>
                    ：<T f={stage.skipIf} />
                  </li>
                ) : null
              )}
            </ul>
            <P para={[rm.experienced.caution]} className="mt-4" />
            {otherRoadmap ? (
              <div className="mt-3">
                <LinkChip label={`${rm.experienced.otherRoadmap.label}：${otherRoadmap.name}`} href={`${ROADMAP_BASE}/${otherRoadmap.slug}`} />
              </div>
            ) : null}
          </section>

          {/* 6. 先輩の道のり */}
          <section id="stories" aria-labelledby="stories-title" className={SECTION}>
            <h2 id="stories-title" className={H2}>
              先輩の道のり
            </h2>
            <p className="mt-2 text-xs text-text-muted">BONOで学んで転職した人の話から（名前は伏せています）</p>
            <div className="mt-6 flex flex-col gap-8">
              {rm.stories.map((st) => (
                <div key={st.who}>
                  <h3 className={H3}>
                    {st.who}
                    <span className="ml-2 font-noto-sans-jp text-sm font-normal text-text-muted">{st.from}</span>
                  </h3>
                  <P para={st.body} className="mt-2" />
                </div>
              ))}
            </div>
          </section>

          {/* 6. つまずき */}
          <section id="pitfalls" aria-labelledby="pitfalls-title" className={SECTION}>
            <h2 id="pitfalls-title" className={H2}>
              よくあるつまずきと対策
            </h2>
            <div className="mt-6 flex flex-col gap-8">
              {rm.pitfalls.map((p) => (
                <div key={p.title}>
                  <h3 className={H3}>{p.title}</h3>
                  <P para={p.body} className="mt-2" />
                  {p.link ? (
                    <div className="mt-3">
                      <LinkChip {...p.link} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          {/* 6. よくある質問 */}
          <section id="faq" aria-labelledby="faq-title" className={SECTION}>
            <h2 id="faq-title" className={H2}>
              よくある質問
            </h2>
            <div className="mt-4 border-t border-text-secondary">
              {rm.faq.map((item, i) => (
                <details key={i} className="group border-b border-border-light">
                  <summary className="flex cursor-pointer list-none items-center gap-4 py-4 [&::-webkit-details-marker]:hidden">
                    <span className="font-latin text-sm font-bold text-text-muted">Q</span>
                    <h3 className="min-w-0 flex-1 text-base font-bold leading-[1.6]">
                      <T f={item.question} />
                    </h3>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-light text-text-secondary transition-transform group-open:rotate-45">
                      <Plus size={14} strokeWidth={2} />
                    </span>
                  </summary>
                  <p className={cn(BODY, "pb-5 pl-7 pr-4 md:pr-11")}>
                    <T f={item.answer} />
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* 7. 根拠 */}
          <section id="sources" aria-labelledby="sources-title" className={SECTION}>
            <h2 id="sources-title" className={H2}>
              このロードマップの根拠
            </h2>
            <p className="mt-3 text-sm leading-[1.8] text-text-secondary">
              <T f={src.note} />
            </p>
            <div className="mt-6 flex flex-col gap-6">
              {[src.jobs, src.market, src.companies, src.bono, src.senpai].map((g) => (
                <div key={g.title}>
                  <h3 className="text-sm font-bold text-text-primary">{g.title}</h3>
                  <p className="mt-1 text-sm leading-[1.8] text-text-secondary">
                    <T f={g.body} />
                  </p>
                  {g.links.length > 0 ? (
                    <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                      {g.links.map((l) => (
                        <li key={l.href}>
                          <a href={l.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-text-primary">
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          {/* ほかの行き先 */}
          <section aria-labelledby="others-title" className="border-t border-border-light pt-12">
            <h2 id="others-title" className={H2}>
              ほかの行き先
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {others.map((r) => (
                <li key={r.slug}>
                  <Link href={`${ROADMAP_BASE}/${r.slug}`} className={cn("inline-flex rounded-full px-4 py-2 text-sm font-bold", CLICKABLE)}>
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
