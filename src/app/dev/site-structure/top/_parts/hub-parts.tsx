/**
 * #267 各階層のページ（悩み・勉強法・キャリア）の共通部品 — 267-Q 1章
 *
 * - Breadcrumb: 267-O 1章の親子のとおり（来た道ではない）
 * - HubHeader: パンくず・h1・1行の説明・データから数えた数・「ここで開けるレッスン」の実物の表紙
 * - TocChips: ページ内の目次（チップ）
 * - ItemCard: 答えになるレッスンの表紙・名前（h3）・こんなとき・できること・形の印と無料。カード全体がリンク
 * - MainCard: 項目ページの主役のカード1枚
 * - AskPeople: 人に聞く出口（掲示板 → フィードバックの順）
 * - NextSteps: 次に整えたいこと（一行の理由つき）
 *
 * 表紙は Sanity の画像を CDN から直接（LessonCover は unoptimized。Vercel の画像最適化は使わない＝402 対策）。
 * 色はトークンだけ。アクセントは深い緑（cta-primary）、矢印とリンクはグレー。オレンジは使わない。
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { MessageQuestion, Messages1 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { PURPOSE_ICON_GRADIENT } from "@/styles/gradients";
import { cn } from "@/lib/utils";
import type { LessonMap, ResolvedLesson } from "../../../course-pages/data/types";
import { LessonCover } from "../../../course-pages/template/shared";
import { Kari } from "../../_parts/shared";
import {
  BOARD_HREF,
  FEEDBACK_HREF,
  isFree,
  kindsOf,
  resolveMain,
  type HubItem,
  type Kind,
} from "../_data/hierarchy";
import { withState } from "./top-parts";

export const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary";
/** 日本語の見出しを文節で折り返す */
export const PHRASE = "[word-break:auto-phrase] text-balance";
/** ページの横幅（左右の余白はトップの試作とそろえる） */
export const PAGE = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-12";

// ------------------------------------------------------------
// パンくず
// ------------------------------------------------------------

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="パンくずリスト" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-noto-sans-jp text-xs text-text-muted">
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1.5">
            {i > 0 ? <ChevronRight size={12} aria-hidden="true" className="shrink-0 text-text-disabled" /> : null}
            {c.href ? (
              <Link href={c.href} className={cn("rounded-[4px] hover:text-text-primary hover:underline hover:underline-offset-4", FOCUS)}>
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-bold text-text-secondary">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ------------------------------------------------------------
// 小さな印
// ------------------------------------------------------------

export function KindBadge({ kind }: { kind: Kind }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border-light px-2 py-px font-noto-sans-jp text-[11px] font-medium leading-[1.6] text-text-secondary">
      {kind}
    </span>
  );
}

export function FreeBadge({ children = "無料" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-cta-primary-bg/[0.07] px-2 py-px font-noto-sans-jp text-[11px] font-bold leading-[1.6] text-cta-primary-hover">
      {children}
    </span>
  );
}

/** 小さな英字＋日本語のアイブロウ（トップの試作と同じ形） */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-noto-sans-jp text-xs font-bold tracking-[0.16em] text-cta-primary-hover", className)}>{children}</p>
  );
}

// ------------------------------------------------------------
// ハブの頭
// ------------------------------------------------------------

/** 表紙を扇形に並べる（真ん中からのずれ → 傾き・下げ・重なり順） */
const FAN: Record<number, string> = {
  [-3]: "z-[1] translate-y-[18px] -rotate-[9deg]",
  [-2]: "z-[2] translate-y-[10px] -rotate-6",
  [-1]: "z-[3] translate-y-[4px] -rotate-3",
  0: "z-[4]",
  1: "z-[3] translate-y-[4px] rotate-3",
  2: "z-[2] translate-y-[10px] rotate-6",
  3: "z-[1] translate-y-[18px] rotate-[9deg]",
};

export function HubHeader({
  crumbs,
  eyebrow,
  title,
  titleKari,
  intro,
  counts,
  covers,
  coversCaption,
  aside,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  titleKari?: boolean;
  intro: ReactNode;
  /** データから数えた数（例: [{ n: 14, label: "の悩み" }]） */
  counts: { n: number; label: string; pre?: string }[];
  /** 「ここで開けるレッスン」の表紙 */
  covers: (ResolvedLesson | null)[];
  coversCaption: string;
  /** 表紙の扇の代わりに出す絵（表紙が少ないハブ用。キャリアは記事のサムネイルを並べる） */
  aside?: ReactNode;
}) {
  const shown = covers.filter((c): c is ResolvedLesson => Boolean(c?.iconImageUrl)).slice(0, 7);
  return (
    <header className={cn(PAGE, "pt-6 pb-12 lg:pt-8 lg:pb-16")}>
      <Breadcrumb items={crumbs} />
      <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:mt-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:gap-14">
        <div className="min-w-0">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className={cn("mt-4 font-heading text-[30px] font-bold leading-[1.3] tracking-[-0.01em] text-text-primary sm:text-[40px] lg:text-[48px]", PHRASE)}>
            {title}
            {titleKari ? <Kari className="ml-2 align-middle" /> : null}
          </h1>
          <div className="mt-5 max-w-[520px] font-noto-sans-jp text-base leading-[1.9] text-text-secondary">{intro}</div>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
            {counts.map((c) => (
              <div key={c.label} className="flex flex-col">
                <dt className="order-2 font-noto-sans-jp text-xs text-text-muted">{c.label}</dt>
                <dd className="order-1 font-latin text-[32px] font-bold leading-none tracking-[-0.02em] text-text-primary">
                  {c.pre ? <span className="mr-0.5 font-noto-sans-jp text-sm font-bold text-text-secondary">{c.pre}</span> : null}
                  {c.n}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ここで開けるレッスンの実物の表紙（「ここで何を作るか」が一目で分かる） */}
        {aside ? (
          <figure className="min-w-0">
            {aside}
            <figcaption className="mt-3 font-noto-sans-jp text-xs leading-[1.6] text-text-muted">{coversCaption}</figcaption>
          </figure>
        ) : shown.length > 0 ? (
          <figure className="min-w-0">
            <div className="relative overflow-hidden rounded-[24px] border border-border-light bg-muted-custom px-4 pt-9 pb-12 sm:px-6 sm:pt-10 sm:pb-14">
              <ul className="flex items-end justify-center" aria-label="この一覧から開けるレッスンの表紙">
                {shown.map((lesson, i) => {
                  const offset = i - Math.floor(shown.length / 2);
                  return (
                    <li
                      key={lesson.slug}
                      className={cn(
                        "-mx-1 w-[19%] max-w-[140px] shrink-0 sm:w-[14.5%]",
                        FAN[offset] ?? "",
                        // 端の2枚はスマホでは隠す（5枚まで）
                        Math.abs(offset) === 3 && "hidden sm:block"
                      )}
                    >
                      <LessonCover
                        lesson={lesson}
                        sizes="120px"
                        className="w-full shadow-[var(--shadow-md)] ring-1 ring-black/[0.06]"
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
            <figcaption className="mt-3 font-noto-sans-jp text-xs leading-[1.6] text-text-muted">{coversCaption}</figcaption>
          </figure>
        ) : null}
      </div>
    </header>
  );
}

// ------------------------------------------------------------
// ページ内の目次（チップ）
// ------------------------------------------------------------

export function TocChips({
  items,
  label = "このページの目次",
  className,
}: {
  items: { href: string; label: string; count?: number }[];
  label?: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap gap-2">
        {items.map((it) => (
          <li key={it.href}>
            <a
              href={it.href}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full border border-border-light bg-surface px-4 font-noto-sans-jp text-sm font-medium text-text-primary transition-colors hover:border-border-default hover:bg-hover",
                FOCUS
              )}
            >
              {it.label}
              {it.count !== undefined ? <span className="font-latin text-xs text-text-muted">{it.count}</span> : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ------------------------------------------------------------
// 項目のカード
// ------------------------------------------------------------

export function ItemCard({
  item,
  href,
  lesson,
  no,
  member,
  reason,
  compact,
}: {
  item: HubItem;
  href: string;
  /** サムネイルにするレッスン（item.thumb を Sanity から引いたもの） */
  lesson: ResolvedLesson | null | undefined;
  /** 一覧の中の番号（01〜14） */
  no?: string;
  member: boolean;
  /** 関係する項目として出すときの一行の理由 */
  reason?: string;
  compact?: boolean;
}) {
  const kinds = kindsOf(item);
  // 会員は全部読めるので「無料」の印は出さない
  const free = !member && isFree(item);
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full flex-row overflow-hidden rounded-[20px] sm:flex-col border border-border-light bg-surface shadow-[var(--shadow-xs)]",
        "transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:-translate-y-0.5 hover:border-border-default hover:shadow-[var(--shadow-md)] motion-reduce:hover:translate-y-0",
        FOCUS
      )}
    >
      {/* 答えになっているレッスンの表紙 */}
      {/* スマホは左に小さく（縦に長くなりすぎないよう横並び）、sm 以上は上に大きく */}
      <div
        className={cn(
          "relative flex w-[92px] shrink-0 items-center justify-center overflow-hidden bg-muted-custom sm:w-auto sm:items-end",
          compact ? "sm:h-[132px]" : "sm:h-[172px]"
        )}
      >
        {no ? (
          <span className="absolute top-2.5 left-3 font-latin text-[11px] tracking-[0.2em] text-text-muted sm:top-3 sm:left-4 sm:text-xs" aria-hidden="true">
            {no}
          </span>
        ) : null}
        <div className="w-[60%] transition-transform duration-300 sm:h-[78%] sm:w-auto sm:translate-y-[6%] sm:group-hover:translate-y-[2%] motion-reduce:transition-none motion-reduce:sm:group-hover:translate-y-[6%]">
          <LessonCover
            lesson={lesson ?? null}
            slug={item.thumb}
            sizes="96px"
            className="w-full shadow-[var(--shadow-md)] ring-1 ring-black/[0.06] sm:h-full sm:w-auto"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <h3 className={cn("font-heading text-lg font-bold leading-[1.45] text-text-primary", PHRASE)}>
          {item.name}
          {item.nameKari ? <Kari /> : null}
        </h3>
        <p className="font-noto-sans-jp text-xs leading-[1.6] text-text-muted">
          <span className="mr-1.5 font-bold text-text-secondary">こんなとき</span>
          {item.when}
        </p>
        {reason ? (
          <p className="border-t border-border-light pt-2.5 font-noto-sans-jp text-sm leading-[1.7] text-text-secondary">
            {reason}
            <Kari />
          </p>
        ) : (
          <p className="border-t border-border-light pt-2.5 font-noto-sans-jp text-sm leading-[1.7] text-text-secondary">
            <span className="mr-1.5 text-xs font-bold text-cta-primary-hover">できること</span>
            {item.canDo}
            <Kari />
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {free ? <FreeBadge /> : null}
            {kinds.map((k) => (
              <KindBadge key={k} kind={k} />
            ))}
          </div>
          <ArrowRight
            size={16}
            aria-hidden="true"
            className="shrink-0 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-text-primary motion-reduce:group-hover:translate-x-0"
          />
        </div>
      </div>
    </Link>
  );
}

// ------------------------------------------------------------
// 主役のカード（項目ページ）
// ------------------------------------------------------------

export function MainCard({
  item,
  lessons,
  member,
}: {
  item: HubItem;
  lessons: LessonMap;
  member: boolean;
}) {
  if (!item.main) return null;
  const main = resolveMain(item.main);
  const cover = main.lessonSlug ? lessons[main.lessonSlug] : item.thumb ? lessons[item.thumb] : null;

  if (main.type === "people") {
    return (
      <div className="rounded-[24px] border border-border-light bg-surface p-6 shadow-[var(--shadow-xs)] md:p-8">
        <p className="font-noto-sans-jp text-xs font-bold text-text-muted">この悩みの主役</p>
        <h3 className="mt-2 font-heading text-[22px] font-bold leading-[1.45] text-text-primary">人に見てもらう</h3>
        <p className="mt-2 font-noto-sans-jp text-sm leading-[1.8] text-text-secondary">
          {main.reason}
          <Kari />
        </p>
        <p className="mt-4 font-noto-sans-jp text-sm text-text-secondary">下の「人に聞く」から始められます。</p>
      </div>
    );
  }

  const label = main.type === "course" ? "コース" : "レッスン";
  const action = main.type === "course" ? `第${main.chapter?.no}章を開く` : "レッスンを開く";
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-[24px] border border-border-light bg-surface shadow-[var(--shadow-xs)] sm:grid-cols-[200px_minmax(0,1fr)]">
      <div className="flex items-center justify-center bg-muted-custom px-10 py-8 sm:px-8">
        <LessonCover
          lesson={cover ?? null}
          slug={main.lessonSlug}
          sizes="140px"
          className="w-[120px] shadow-[var(--shadow-md)] ring-1 ring-black/[0.06] sm:w-[136px]"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-3 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-1.5">
          <KindBadge kind={label} />
          {!member && (main.free ?? 0) > 0 ? <FreeBadge>無料で読める記事あり</FreeBadge> : null}
        </div>
        <h3 className={cn("font-heading text-[22px] font-bold leading-[1.45] text-text-primary", PHRASE)}>{main.title}</h3>
        {main.chapter ? (
          <p className="font-noto-sans-jp text-sm font-bold text-text-secondary">
            第{main.chapter.no}章「{main.chapter.title}」で扱います
          </p>
        ) : null}
        <p className="font-noto-sans-jp text-sm leading-[1.8] text-text-secondary">
          {main.reason}
          <Kari />
        </p>
        {main.total ? (
          <p className="font-noto-sans-jp text-xs text-text-muted">
            記事 {main.total}本
            {!member && main.free ? `・うち無料 ${main.free}本` : ""}
            {main.type === "course" ? "（この章の最初のレッスン）" : ""}
          </p>
        ) : null}
        <div className="mt-2">
          <Button variant="primary" size="large" asChild>
            <Link href={main.href}>
              {action}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 人に聞く出口
// ------------------------------------------------------------

const ICON = { size: 24, color: "currentColor", variant: "Outline" as const };

export function AskPeople({
  id = "ask",
  title = "人に聞く",
  lead,
  boardLabel = "掲示板で聞く",
}: {
  id?: string;
  title?: string;
  lead: ReactNode;
  boardLabel?: string;
}) {
  const exits = [
    {
      title: boardLabel,
      body: "つまずいたところを、メンバーに質問・相談できます。",
      href: BOARD_HREF,
      icon: <MessageQuestion {...ICON} />,
    },
    {
      title: "フィードバックを頼む",
      body: "つくった画面を、現役のデザイナーに見てもらえます。",
      href: FEEDBACK_HREF,
      icon: <Messages1 {...ICON} />,
    },
  ];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <h2 id={`${id}-title`} className={cn("font-heading text-[24px] font-bold leading-[1.45] text-text-primary lg:text-[28px]", PHRASE)}>
        {title}
      </h2>
      <div className="mt-3 max-w-[560px] font-noto-sans-jp text-sm leading-[1.8] text-text-secondary">{lead}</div>
      <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {exits.map((e) => (
          <li key={e.href}>
            <Link
              href={e.href}
              className={cn(
                "group flex h-full items-center gap-4 rounded-[20px] border border-border-light bg-surface p-5 transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]",
                FOCUS
              )}
            >
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-[0.5px] border-black/10 text-text-primary"
                style={{ backgroundImage: PURPOSE_ICON_GRADIENT }}
                aria-hidden="true"
              >
                {e.icon}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-base font-bold leading-[1.5] text-text-primary">{e.title}</h3>
                <p className="mt-0.5 font-noto-sans-jp text-[13px] leading-[1.7] text-text-secondary">
                  {e.body}
                  <Kari />
                </p>
              </div>
              <ArrowUpRight
                size={18}
                aria-hidden="true"
                className="shrink-0 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ------------------------------------------------------------
// 次に整えたいこと
// ------------------------------------------------------------

export interface NextStep {
  label: string;
  href: string;
  reason: string;
  no?: string;
}

export function NextSteps({
  id = "next",
  title = "次に整えたいこと",
  lead,
  items,
}: {
  id?: string;
  title?: string;
  lead?: ReactNode;
  items: NextStep[];
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <h2 id={`${id}-title`} className={cn("font-heading text-[24px] font-bold leading-[1.45] text-text-primary lg:text-[28px]", PHRASE)}>
        {title}
      </h2>
      {lead ? <div className="mt-3 font-noto-sans-jp text-sm leading-[1.8] text-text-secondary">{lead}</div> : null}
      <ul className="mt-6 grid grid-cols-1 border-t border-border-light md:grid-cols-2 md:gap-x-12">
        {items.map((it) => (
          <li key={it.label} className="border-b border-border-light">
            <Link
              href={it.href}
              className={cn("group -mx-3 flex items-center justify-between gap-4 rounded-[8px] px-3 py-5 transition-colors hover:bg-hover", FOCUS)}
            >
              <span className="flex min-w-0 items-baseline gap-3">
                {it.no ? (
                  <span className="shrink-0 font-latin text-xs tracking-[0.2em] text-text-muted" aria-hidden="true">
                    {it.no}
                  </span>
                ) : null}
                <span className="min-w-0">
                  <span className="block font-noto-sans-jp text-[15px] font-bold leading-[1.6] text-text-primary">{it.label}</span>
                  <span className="mt-0.5 block font-noto-sans-jp text-[13px] leading-[1.6] text-text-muted">
                    {it.reason}
                    <Kari />
                  </span>
                </span>
              </span>
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 「◯の悩みの一覧へ戻る」 */
export function BackToHub({ href, label }: { href: string; label: string }) {
  return (
    <Button variant="outline-ghost" size="large" asChild>
      <Link href={href}>
        <ArrowRight aria-hidden="true" className="rotate-180" />
        {label}
      </Link>
    </Button>
  );
}

export { withState };
