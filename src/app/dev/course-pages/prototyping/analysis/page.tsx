/**
 * /dev/course-pages/prototyping/analysis — 分析：コースとロードマップ（#242）
 *
 * 本文は analysis-content.ts（242-B_分析本文.md をそのまま写したもの）を描画するだけ。
 * 読みものとして本文幅 720px。結論は淡い面、問1の評価は観点ごとにロードマップとコースを横に並べる。
 * 白は押せる場所だけ（このページではリンク以外に白い面は使わない）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  analysisMeta,
  conclusion,
  sections,
  type Block,
  type Bullet,
  type Mark,
  type Rating,
} from "./analysis-content";

export const metadata: Metadata = {
  title: "分析：コースとロードマップ（プロト）",
  robots: { index: false, follow: false },
};

const MARK_STYLE: Record<Mark, { cls: string; label: string }> = {
  "◎": { cls: "bg-success-feedback text-text-success", label: "よくできている" },
  "〇": { cls: "bg-info-feedback text-text-info", label: "できている" },
  "△": { cls: "bg-warning-feedback text-text-warning", label: "弱い" },
  "✕": { cls: "bg-error-feedback text-text-error", label: "ない" },
};

function MarkBadge({ mark }: { mark: Mark }) {
  const s = MARK_STYLE[mark];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold", s.cls)}>
      <span className="text-[15px] leading-none">{mark}</span>
      {s.label}
    </span>
  );
}

function BulletList({ items, depth = 0 }: { items: Bullet[]; depth?: number }) {
  return (
    <ul className={cn("flex flex-col gap-2", depth === 0 ? "mt-4" : "mt-2 pl-5")}>
      {items.map((item, i) => (
        <li key={i} className="relative pl-4 text-[15px] leading-[1.9] text-text-primary">
          <span
            aria-hidden="true"
            className={cn(
              "absolute left-0 top-[0.8em] size-1.5 rounded-full",
              depth === 0 ? "bg-text-primary" : "border border-text-muted"
            )}
          />
          <span className={depth === 0 && item.children ? "font-bold" : undefined}>{item.text}</span>
          {item.children ? <BulletList items={item.children} depth={depth + 1} /> : null}
        </li>
      ))}
    </ul>
  );
}

function RatingCell({ who, rating }: { who: string; rating: Rating }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-bold text-text-muted">{who}</p>
      <div className="mt-1.5">
        <MarkBadge mark={rating.mark} />
      </div>
      {rating.comment ? (
        <p className="mt-2 text-[13px] leading-[1.8] text-text-secondary">{rating.comment}</p>
      ) : null}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p className="mt-4 text-[15px] leading-[1.95] text-text-primary">{block.text}</p>;
    case "list":
      return <BulletList items={block.items} />;
    case "h3":
      return (
        <h3 className="mt-12 font-heading text-lg font-bold leading-[1.6] text-text-primary md:text-xl">
          {block.text}
        </h3>
      );
    case "links":
      return (
        <div className="mt-5 flex flex-wrap gap-2">
          {block.links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-full border border-border-light bg-surface px-3 py-1 text-xs font-bold text-text-primary hover:border-border-default"
            >
              {l.label}
              <ArrowUpRight size={13} />
            </Link>
          ))}
        </div>
      );
    case "checklist":
      return (
        <ul className="mt-4 flex flex-col gap-2.5">
          {block.items.map((t, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-[1.85] text-text-primary">
              <Square size={16} strokeWidth={2} className="mt-[5px] shrink-0 text-text-muted" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      );
    case "compare":
      return (
        <div className="mt-4 border-t border-text-secondary">
          {block.rows.map((row) => (
            <div key={row.aspect} className="border-b border-border-light py-5">
              <h4 className="text-[15px] font-bold leading-[1.6] text-text-primary">{row.aspect}</h4>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:gap-6">
                <RatingCell who="ロードマップ" rating={row.roadmap} />
                <RatingCell who="コース" rating={row.course} />
              </div>
            </div>
          ))}
        </div>
      );
  }
}

export default function AnalysisPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
      <article className="mx-auto w-full max-w-[720px] px-4 pb-28 pt-8 md:pt-12">
        <Link
          href="/dev/course-pages/prototyping"
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
        >
          <ArrowLeft size={13} />
          プロトタイピングに戻る
        </Link>

        <header className="mt-8">
          <p className="font-mono text-[11px] tracking-[0.12em] text-text-muted">{analysisMeta.kicker}</p>
          <h1 className="mt-2 font-heading text-[28px] font-bold leading-[1.4] tracking-[-0.04em] md:text-[34px]">
            {analysisMeta.title}
          </h1>
          <p className="mt-3 flex flex-wrap gap-x-3 text-xs text-text-muted">
            <span>{analysisMeta.date}</span>
            <span>材料: {analysisMeta.source}</span>
          </p>
          <p className="mt-3 text-sm leading-[1.85] text-text-secondary">{analysisMeta.lead}</p>
        </header>

        {/* 結論（淡い面） */}
        <section
          id={conclusion.id}
          aria-labelledby="h-conclusion"
          className="mt-10 rounded-[24px] bg-[var(--persona-hero-surface)] px-5 py-6 md:px-8 md:py-8"
        >
          <h2 id="h-conclusion" className="font-heading text-2xl font-bold tracking-[-0.03em]">
            {conclusion.title}
          </h2>
          {conclusion.blocks.map((b, i) => (
            <BlockView key={i} block={b} />
          ))}
        </section>

        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`h-${section.id}`}
            className="mt-16 border-t border-border-light pt-12"
          >
            <h2
              id={`h-${section.id}`}
              className="font-heading text-[22px] font-bold leading-[1.5] tracking-[-0.03em] md:text-[26px]"
            >
              {section.title}
            </h2>
            {section.blocks.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}
