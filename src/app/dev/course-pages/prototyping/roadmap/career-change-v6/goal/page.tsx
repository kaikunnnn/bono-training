/**
 * /dev/course-pages/prototyping/roadmap/career-change-v6/goal — ゴールと道のりの解説（v6・C）#243
 *
 * 計画: rebono/issues/243-C_試作計画_v6.md §5。型に当てはめず1本の読み物として書く。
 * h2 は3つだけ: 採用で見られること / ポートフォリオに必要なもの / なぜこの順番で身につけるのか
 * 本文は 752px 幅まで、1段落3文まで、小見出しを細かく。
 * 企業の採用記事は「裏づけ」として、xl 以上は本文の横の注、それより狭い幅は段落の下の引用で添える（同じ要素を置き場所だけ変える）。
 * lg 以上は左に追従する目次。スマホは本文の冒頭に普通の目次。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  careerChangeV6 as rm,
  v6StepHref,
  type V6ArticleBlock,
  type V6ArticleSection,
} from "../../../../data/roadmap-career-change-v6";
import { KariProvider, T } from "../../../../template/kari";
import { Reveal } from "../_parts/motion";
import {
  Arrow,
  Breadcrumb,
  FOCUS,
  H2,
  Kicker,
  P,
  PHRASE,
  SkillTagBadge,
  TextLink,
} from "../_parts/parts";
import ScrollSpy from "../_parts/ScrollSpy";

export const metadata: Metadata = {
  title: "ゴールと道のりの解説（v6・未経験からUIデザイナーへ）",
  robots: { index: false, follow: false },
};

const article = rm.goalArticle;
const sections = article.sections as V6ArticleSection[];

/** ポートフォリオのつくり方（ステップ5の詳しいページ） */
const PORTFOLIO_STEP = 5;

function Evidence({ ev }: { ev: NonNullable<V6ArticleBlock["evidence"]> }) {
  const external = ev.href.startsWith("http");
  return (
    <aside
      aria-label={`裏づけ：${ev.org}`}
      className="mt-4 border-l-2 border-border-default pl-4 xl:mt-1.5 xl:border-l xl:pl-5"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">裏づけ</p>
      <p className="mt-1 text-sm font-bold leading-[1.6] text-text-primary">{ev.org}</p>
      <p className="mt-1 text-sm leading-[1.75] text-text-secondary">
        <T f={ev.text} />
      </p>
      {external ? (
        <a
          href={ev.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("mt-1.5 inline-block rounded-[2px] text-xs text-text-muted underline underline-offset-2 hover:text-text-primary", FOCUS)}
        >
          記事を開く
        </a>
      ) : (
        <Link
          href={`${rm.base}${ev.href}`}
          className={cn("mt-1.5 inline-block rounded-[2px] text-xs text-text-muted underline underline-offset-2 hover:text-text-primary", FOCUS)}
        >
          根拠の一覧
        </Link>
      )}
    </aside>
  );
}

function ArticleBlock({ section, block }: { section: V6ArticleSection; block: V6ArticleBlock }) {
  return (
    <Reveal
      id={`${section.id}-${block.id}`}
      className="scroll-mt-20 xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-x-10"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h3 className={cn("font-heading text-[19px] font-bold leading-[1.5] text-text-primary md:text-[20px]", PHRASE)}>{block.h}</h3>
          {block.tag ? <SkillTagBadge tag={block.tag} /> : null}
        </div>
        <div className="mt-2 space-y-4">
          {block.paras.map((para, i) => (
            <P key={i} para={para} />
          ))}
        </div>
        {section.id === "portfolio" && block.id === "how" ? (
          <div className="mt-4">
            <TextLink href={v6StepHref(PORTFOLIO_STEP)}>ステップ5「ポートフォリオにまとめる」を見る</TextLink>
          </div>
        ) : null}
      </div>
      {block.evidence ? <Evidence ev={block.evidence} /> : <span className="hidden xl:block" aria-hidden="true" />}
    </Reveal>
  );
}

export default function V6GoalPage() {
  return (
    <KariProvider>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-32 pt-6 md:px-10 md:pt-10">
          <Breadcrumb items={[{ label: "ロードマップ", href: rm.base }, { label: article.title }]} />

          <div className="mt-8 grid gap-12 md:mt-12 lg:grid-cols-[168px_minmax(0,1fr)] lg:gap-12">
            {/* lg 以上: 左に追従する目次 */}
            <div className="hidden lg:block">
              <ScrollSpy
                label="目次"
                title="目次"
                className="sticky top-8"
                items={sections.map((s, i) => ({ id: s.id, label: s.h, meta: String(i + 1) }))}
              />
            </div>

            <article className="min-w-0 max-w-[752px] xl:max-w-none">
              <header className="max-w-[752px] pb-10">
                <Kicker>Guide · 未経験からUIデザイナーへ</Kicker>
                <h1 className={cn("mt-4 font-heading text-[30px] font-bold leading-[1.4] tracking-[-0.05em] text-text-primary md:text-[40px]", PHRASE)}>
                  {article.title}
                </h1>
                <P para={article.lead} className="mt-4" />
              </header>

              {/* スマホ〜md: 本文の冒頭に普通の目次（追従させない） */}
              <nav aria-label="目次" className="mb-10 max-w-[752px] rounded-[20px] border border-border-light bg-surface p-5 lg:hidden">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">目次</p>
                <ol className="mt-2 flex flex-col">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className={cn("group flex items-center gap-3 rounded-[6px] py-2 text-base font-bold text-text-primary", FOCUS)}>
                        <span className="w-4 font-latin text-sm text-text-muted">{i + 1}</span>
                        <span className="min-w-0 flex-1">{s.h}</span>
                        <ArrowDown size={14} aria-hidden="true" className="shrink-0 text-text-muted" />
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className="scroll-mt-20 border-t border-border-light py-12 md:py-14"
                >
                  <div className="max-w-[752px]">
                    <Kicker>{section.kicker}</Kicker>
                    <h2 id={`${section.id}-title`} className={cn(H2, "mt-3")}>
                      {section.h}
                    </h2>
                    <p className="mt-3 text-base leading-[1.8] text-text-secondary">
                      <T f={section.lead} />
                    </p>
                  </div>
                  <div className="mt-10 flex flex-col gap-10">
                    {section.blocks.map((block) => (
                      <ArticleBlock key={block.id} section={section} block={block} />
                    ))}
                  </div>
                </section>
              ))}

              {/* 最後に: 戻る／始める */}
              <div className="max-w-[752px] border-t border-border-light pt-10">
                <p className="text-base leading-[1.8] text-text-secondary">ゴールと順番が分かったら、ステップ1から始めます。</p>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                  <Button asChild variant="outline-ghost" size="persona-cta" className={cn("rounded-[14px]", FOCUS)}>
                    <Link href={rm.base}>ロードマップに戻る</Link>
                  </Button>
                  <Button asChild variant="persona-gradient" size="persona-cta" className={cn("group text-base", FOCUS)}>
                    <Link href={v6StepHref(1)}>
                      ステップ1から始める
                      <Arrow size={18} />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </KariProvider>
  );
}
