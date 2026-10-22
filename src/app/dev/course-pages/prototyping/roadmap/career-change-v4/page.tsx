/**
 * /dev/course-pages/prototyping/roadmap/career-change-v4 — 未経験から転職（v4・記事ベースの中身）#243
 *
 * 見た目より中身。BONO の記事だけを材料に「何を・どの順で・なぜ」を短く書く（材料は rebono/issues/243-B_材料/）。
 * 1. ヘッダー（誰向け・目安期間・作品数・前提知識）
 * 2. ゴール：採用で見られること（3つの評価軸と3つの作品）
 * 3. 全体図となぜこの順か（ステップの成果が次の材料になる）
 * 4. ステップ6つ（できること／なぜ／飛ばすと／ポートフォリオ／コース／AI／先輩の一言）
 * 5. 経験がある人はどこから？ 6. 先輩の道のり 7. つまずきと対策 8. よくある質問 9. ほかの行き先
 * ロードマップは選ばない。押せるのはコースと記事へのリンクだけ（押せるものだけ白）。
 * 文言は data/roadmap-career-change-v4.ts（材料にない推測は「仮」）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Calendar, Flag, Map1, Profile2User } from "iconsax-react";
import { cn } from "@/lib/utils";
import { getCourse } from "../../../data";
import { careerChangeV4 as rm, type V4CourseRef, type V4Stage } from "../../../data/roadmap-career-change-v4";
import { roadmaps } from "../../../data/roadmaps";
import { KariProvider, T } from "../../../template/kari";
import { splitTitle } from "../../../template/shared";
import { CLICKABLE, LinkChip } from "../career-change-v3/parts";
import { ROADMAP_BASE } from "../parts";

export const metadata: Metadata = {
  title: "未経験から転職ロードマップ（v4・記事ベースの中身）",
  robots: { index: false, follow: false },
};

const stages = rm.stages as V4Stage[];
const stageNo = (id: string) => stages.findIndex((s) => s.id === id) + 1;

const SECTION = "scroll-mt-6 border-t border-border-light py-12 md:py-16";
const H2 = "font-heading text-[22px] font-bold leading-[1.4] tracking-[-0.03em] md:text-[26px]";
const PANEL = "rounded-[20px] bg-[var(--bg-muted)]";

/* ---------- 部品 ---------- */

/** コース（押せる＝白）／準備中のコース（押せない） */
function CourseRow({ course }: { course: V4CourseRef }) {
  if (course.type === "planned") {
    return (
      <div className="flex items-center gap-3 rounded-[14px] border border-dashed border-border-default px-4 py-3">
        <p className="min-w-0 flex-1 text-[14px] font-bold text-text-secondary">{course.title}</p>
        <span className="shrink-0 rounded-full bg-[var(--bg-muted-strong)] px-2 py-0.5 text-[11px] font-bold text-text-muted">
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
      className={cn("group flex items-center gap-3 rounded-[14px] px-4 py-3", CLICKABLE)}
    >
      <p className="min-w-0 flex-1 font-heading text-[14px] font-bold leading-[1.5]">{main}</p>
      <span className="flex shrink-0 items-center gap-1 text-xs font-bold">
        このコースを始める
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function Item({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn("min-w-0", wide && "md:col-span-2")}>
      <dt className="text-xs font-bold text-text-muted">{label}</dt>
      <dd className="mt-0.5 text-[14px] leading-[1.8]">{children}</dd>
    </div>
  );
}

function Stage({ stage, index }: { stage: V4Stage; index: number }) {
  const n = index + 1;
  return (
    <article id={`stage-${n}`} aria-labelledby={`stage-${n}-title`} className="scroll-mt-6 border-t border-border-light pt-8 first:border-t-0 first:pt-0">
      <p className="text-xs">
        <span className="rounded-full bg-text-primary px-2 py-0.5 font-bold text-text-inverse">
          ステップ {n} / {stages.length}
        </span>
      </p>
      <h3 id={`stage-${n}-title`} className="mt-2 font-heading text-[19px] font-bold leading-[1.5] md:text-[21px]">
        {stage.title}
      </h3>

      <dl className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-2">
        <Item label="できるようになること" wide>
          <span className="font-bold">
            <T f={stage.can} />
          </span>
        </Item>
        <Item label="転職にとってのなぜ">
          <T f={stage.why} />
        </Item>
        <Item label="飛ばすとどうなるか">
          <T f={stage.skip} />
        </Item>
        <Item label="ポートフォリオに入るもの">
          <T f={stage.portfolio} />
        </Item>
        <Item label="AIの使いどころ">
          <T f={stage.ai} />
        </Item>
        <Item label="先輩の一言" wide>
          <span className="text-text-secondary">
            <T f={stage.senpai.text} />
          </span>
          <span className="ml-1 whitespace-nowrap text-xs text-text-muted">
            — {stage.senpai.who}（{stage.senpai.from}）
          </span>
        </Item>
      </dl>

      {stage.extra ? (
        <div className={cn("mt-4 px-4 py-3", PANEL)}>
          <p className="text-xs font-bold text-text-muted">{stage.extra.label}</p>
          <ul className="mt-1 space-y-0.5">
            {stage.extra.items.map((it, i) => (
              <li key={i} className="text-[13px] leading-[1.8]">
                <T f={it} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5">
        <p className="text-xs font-bold text-text-muted">コースと目安期間</p>
        <p className="mt-0.5 text-[13px] leading-[1.8] text-text-secondary">
          <Calendar size={14} color="currentColor" variant="Linear" className="mr-1 inline-block align-[-2px]" />
          目安 <T f={stage.period} />
          {stage.courseNote ? (
            <>
              {" "}
              ・ <T f={stage.courseNote} />
            </>
          ) : null}
        </p>
        {stage.courses.length > 0 ? (
          <div className="mt-2 flex flex-col gap-2">
            {stage.courses.map((c) => (
              <CourseRow key={c.type === "course" ? c.slug : c.title} course={c} />
            ))}
          </div>
        ) : null}
        {stage.links.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
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

export default function CareerChangeV4Page() {
  const others = roadmaps.filter((r) => r.slug !== rm.slug);
  const otherRoadmap = roadmaps.find((r) => r.slug === rm.experienced.otherRoadmap.slug);

  return (
    <KariProvider>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[880px] px-4 pb-28 pt-6 md:px-10 md:pt-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
            <Link href={ROADMAP_BASE} className="hover:text-text-primary">
              ← ロードマップのプロト
            </Link>
            <Link href={`${ROADMAP_BASE}/career-change-v3`} className="hover:text-text-primary">
              v3と比べる
            </Link>
          </div>

          {/* 1. ヘッダー */}
          <header className="pb-10 pt-6 md:pb-14">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-text-secondary px-2.5 py-0.5 text-xs font-bold text-text-secondary">
              <Map1 size={13} color="currentColor" variant="Linear" />
              ロードマップ
            </p>
            <h1 className="mt-3 font-heading text-[30px] font-bold leading-[1.35] tracking-[-0.05em] md:text-[40px]">{rm.name}</h1>
            <p className="mt-2 flex items-start gap-2 text-[14px] font-bold leading-[1.7] text-text-secondary">
              <Profile2User size={17} color="currentColor" variant="Linear" className="mt-[3px] shrink-0" />
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
                  <dt className="text-[11px] font-bold text-text-muted md:text-xs">{row.label}</dt>
                  <dd className="mt-0.5 font-heading text-[14px] font-bold leading-[1.5] md:text-[18px]">
                    <T f={row.value} />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-xs leading-[1.7] text-text-muted">
              先輩の実際: <T f={rm.summary.senpai} />
              （このページで紹介している転職者の話から。進み方には差があります）
            </p>
          </header>

          {/* 2. ゴール */}
          <section id="goal" aria-labelledby="goal-title" className={SECTION}>
            <h2 id="goal-title" className={H2}>
              ゴール：採用で見られること
            </h2>
            <p className="mt-2 text-[15px] leading-[1.8]">
              <T f={rm.goal.lead} />
            </p>
            <ul className="mt-4 grid gap-3 md:grid-cols-3">
              {rm.goal.points.map((p) => (
                <li key={p.title} className={cn("p-4", PANEL)}>
                  <h3 className="flex items-center gap-2 font-heading text-[16px] font-bold">
                    {p.title}
                    {p.tag ? (
                      <span className="rounded-full bg-text-primary px-2 py-0.5 font-noto-sans-jp text-[10px] text-text-inverse">
                        {p.tag}
                      </span>
                    ) : null}
                  </h3>
                  <p className="mt-1 text-[13px] leading-[1.8] text-text-secondary">
                    <T f={p.body} />
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-text-muted">
              <T f={rm.goal.note} />
            </p>

            <p className="mt-8 text-[15px] leading-[1.8]">
              <T f={rm.goal.worksLead} />
            </p>
            <ul className="mt-4 grid gap-3 md:grid-cols-3">
              {rm.goal.works.map((w) => (
                <li key={w.label} className={cn("flex flex-col p-4", PANEL)}>
                  <p className="text-[11px] font-bold text-text-muted">{w.label}</p>
                  <h3 className="mt-0.5 font-heading text-[16px] font-bold leading-[1.5]">{w.title}</h3>
                  <p className="mt-1 text-[13px] leading-[1.8] text-text-secondary">
                    <T f={w.body} />
                  </p>
                  <p className="mt-auto pt-2 text-xs font-bold text-text-muted">ステップ{stageNo(w.stageId)}でつくる</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-start gap-2 text-[14px] leading-[1.8]">
              <span className="shrink-0 font-bold">なぜ3つ？</span>
              <span className="text-text-secondary">
                <T f={rm.goal.whyThree} />
              </span>
            </p>
          </section>

          {/* 3. 全体図 */}
          <section id="overview" aria-labelledby="overview-title" className={SECTION}>
            <h2 id="overview-title" className={H2}>
              全体図と、なぜこの順か
            </h2>
            <ul className="mt-3 space-y-1">
              {rm.order.map((line, i) => (
                <li key={i} className="text-[14px] leading-[1.8] text-text-secondary">
                  <T f={line} />
                </li>
              ))}
            </ul>
            <ol className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {stages.map((stage, i) => (
                <li key={stage.id} className="min-w-0">
                  <a href={`#stage-${i + 1}`} className={cn("group flex h-full flex-col gap-1 rounded-[16px] p-3", CLICKABLE)}>
                    <span className="flex items-center gap-2 text-[11px] text-text-muted">
                      <span className="font-latin font-bold">{i + 1}</span>
                      <T f={stage.period} />
                    </span>
                    <span className="font-heading text-[15px] font-bold">{stage.short}</span>
                    <span className="flex items-start gap-1 text-[12px] leading-[1.6] text-text-secondary">
                      <ArrowRight size={12} className="mt-[4px] shrink-0 text-text-muted" />
                      <span>
                        <T f={stage.handoff} />
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-3 flex items-center gap-2 text-xs text-text-muted">
              <Flag size={14} color="currentColor" variant="Bold" />
              合計の目安 <T f={rm.summary.period} />（ステップごとの期間を足した幅）
            </p>
          </section>

          {/* 4. ステップ */}
          <section id="stages" aria-labelledby="stages-title" className={SECTION}>
            <h2 id="stages-title" className={H2}>
              ステップごとにやること
            </h2>
            <div className="mt-6 flex flex-col gap-8">
              {stages.map((stage, i) => (
                <Stage key={stage.id} stage={stage} index={i} />
              ))}
            </div>
          </section>

          {/* 5. 経験がある人 */}
          <section id="experienced" aria-labelledby="experienced-title" className={SECTION}>
            <h2 id="experienced-title" className={H2}>
              経験がある人はどこから？
            </h2>
            <p className="mt-2 text-[14px] leading-[1.8] text-text-secondary">
              <T f={rm.experienced.lead} />
            </p>
            <ul className={cn("mt-4 divide-y divide-border-light px-4", PANEL)}>
              {stages.map((stage, i) =>
                stage.skipIf ? (
                  <li key={stage.id} className="py-3">
                    <h3 className="text-xs font-bold text-text-muted">
                      ステップ{i + 1} {stage.short}を飛ばしてOK
                    </h3>
                    <p className="mt-0.5 text-[14px] leading-[1.7]">
                      <T f={stage.skipIf} />
                    </p>
                  </li>
                ) : null
              )}
            </ul>
            <p className="mt-3 text-[13px] leading-[1.8] text-text-secondary">
              <T f={rm.experienced.caution} />
            </p>
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
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {rm.stories.map((st) => (
                <li key={st.who} className={cn("p-4", PANEL)}>
                  <h3 className="font-heading text-[16px] font-bold leading-[1.5]">
                    {st.who}
                    <span className="ml-1.5 font-noto-sans-jp text-[13px] font-normal text-text-secondary">{st.from}</span>
                  </h3>
                  <dl className="mt-2 space-y-1.5 text-[13px] leading-[1.7]">
                    {[
                      { label: "進め方", f: st.style },
                      { label: "期間", f: st.period },
                      { label: "応募", f: st.apply },
                      { label: "評価された点", f: st.point },
                    ].map((row) => (
                      <div key={row.label} className="flex gap-3">
                        <dt className="w-[72px] shrink-0 text-xs font-bold leading-[1.9] text-text-muted">{row.label}</dt>
                        <dd className="min-w-0">
                          <T f={row.f} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          </section>

          {/* 7. つまずき */}
          <section id="pitfalls" aria-labelledby="pitfalls-title" className={SECTION}>
            <h2 id="pitfalls-title" className={H2}>
              よくあるつまずきと対策
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {rm.pitfalls.map((p) => (
                <li key={p.title} className={cn("p-4", PANEL)}>
                  <h3 className="font-heading text-[16px] font-bold">{p.title}</h3>
                  <p className="mt-1 text-[13px] leading-[1.8] text-text-secondary">
                    <T f={p.problem} />
                  </p>
                  <p className="mt-1 text-[14px] leading-[1.8]">
                    <span className="mr-1 font-bold">対策</span>
                    <T f={p.fix} />
                  </p>
                  {p.link ? (
                    <div className="mt-2">
                      <LinkChip {...p.link} />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          {/* 8. よくある質問 */}
          <section id="faq" aria-labelledby="faq-title" className={SECTION}>
            <h2 id="faq-title" className={H2}>
              よくある質問
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

          {/* 9. ほかの行き先 */}
          <section aria-labelledby="others-title" className="border-t border-border-light pt-12">
            <h2 id="others-title" className={H2}>
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
