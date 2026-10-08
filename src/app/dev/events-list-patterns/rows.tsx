/**
 * イベント一覧（#234）の行パターン A / B / C と共通パーツ。
 *
 * - レスポンシブは画面幅ではなく「一覧の枠の幅」で切り替える（Tailwind v4 のコンテナクエリ @container / @2xl: など）。
 *   比較ページで PC 枠とスマホ 375px 枠を同じ画面に並べるため。本実装では /updates と同じ画面幅の
 *   ブレイクポイント（lg: など）に戻す想定
 * - 色はすべて既存トークン（text-text-primary / bg-muted-custom / bg-success-feedback など）
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EVENT_STATUS_LABELS,
  type EventDateParts,
  type EventStatus,
} from "@/lib/events/event-schedule";

export interface EventListItem {
  slug: string;
  title: string;
  summary: string;
  thumbnailUrl: string;
  status: EventStatus;
  /** 「2026年10月21日(水)」「2026年8月下旬」 */
  dateLabel: string | null;
  /** time 要素の機械可読値（正確な日時があるときだけ） */
  dateTime?: string;
  dateParts: EventDateParts | null;
}

export interface EventRowProps {
  event: EventListItem;
  /** 終了イベントを淡く表示するか */
  fadeEnded: boolean;
}

export type RowPattern = "a" | "b" | "c";

// ---------------------------------------------------------------------------
// 共通パーツ
// ---------------------------------------------------------------------------

/** /updates と同じ見出し（h1＋説明文）。比較ページでは1ページに複数並ぶので as で h1 以外にもできる */
export function EventsPageHeader({ as: Tag = "h1" }: { as?: "h1" | "div" }) {
  return (
    <>
      <Tag className="font-rounded-mplus text-[28px] font-medium leading-[1.5] text-text-primary">
        イベント
      </Tag>
      <p className="mt-2 font-noto-sans-jp text-sm leading-[1.71] text-text-primary/[0.56]">
        BONOで開催するワークショップや交流会の一覧です。開催予定と過去のイベントを新しい順に表示しています。
      </p>
    </>
  );
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 font-noto-sans-jp text-[11px] font-bold leading-[20px]",
        status === "upcoming"
          ? "bg-success-feedback text-text-success"
          : "bg-muted-custom text-text-secondary",
      )}
    >
      {EVENT_STATUS_LABELS[status]}
    </span>
  );
}

function isSanityImage(url: string) {
  try {
    const host = new URL(url).hostname;
    return host === "cdn.sanity.io" || host.endsWith(".sanity.io");
  } catch {
    return false;
  }
}

function EventThumbnail({
  url,
  sizes,
  faded,
  className,
}: {
  url: string;
  sizes: string;
  faded: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-video shrink-0 overflow-hidden rounded-[8px] bg-muted-custom",
        className,
      )}
    >
      <Image
        src={url}
        alt=""
        fill
        sizes={sizes}
        // remotePatterns に無い外部URL（Unsplash など）は最適化を通さずそのまま出す
        unoptimized={!isSanityImage(url)}
        className={cn(
          "object-cover transition duration-500 group-hover:scale-[1.06]",
          faded && "opacity-50 group-hover:opacity-100",
        )}
      />
    </div>
  );
}

/** /updates の ArticleRow（variant "updates"）と同じ行の外枠 */
const rowClassName =
  "group flex w-full items-center gap-4 rounded-[8px] border-b border-black/[0.1] px-1 py-3 text-left outline-none transition duration-200 hover:bg-black/[0.035] active:scale-[0.995] active:bg-black/[0.06] focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2";

function titleClassName(faded: boolean) {
  return cn(
    "font-rounded-mplus text-sm font-medium leading-[24px] group-hover:underline",
    faded ? "text-text-primary/[0.56]" : "text-text-primary",
  );
}

/** ArticleRow と同じ丸い矢印 */
function RowArrow({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full border border-black/[0.14] text-text-primary/[0.52] transition-colors duration-200 group-hover:border-black/[0.3] group-hover:text-text-primary",
        className,
      )}
    >
      <ArrowRight
        className="size-4.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-active:translate-x-1"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </span>
  );
}

/** 「募集中・2026年10月21日(水) 開催」の1行 */
function StatusDateLine({ event }: { event: EventListItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 font-noto-sans-jp text-xs font-medium leading-[24px] text-text-primary/[0.56]">
      <EventStatusBadge status={event.status} />
      {event.dateLabel && (
        <time dateTime={event.dateTime}>{event.dateLabel} 開催</time>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// A. 新着型（/updates の ArticleRow と同じ見た目。カテゴリ欄 → 状態バッジ・開催日）
// ---------------------------------------------------------------------------

export function EventRowA({ event, fadeEnded }: EventRowProps) {
  const faded = fadeEnded && event.status === "ended";
  return (
    <Link href={`/events/${event.slug}`} className={rowClassName}>
      <EventThumbnail
        url={event.thumbnailUrl}
        sizes="115px"
        faded={faded}
        className="w-[101px] @2xl:w-[115px]"
      />
      <div className="min-w-0 flex-1">
        <StatusDateLine event={event} />
        <h2 className={titleClassName(faded)}>{event.title}</h2>
      </div>
      <RowArrow />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// B. 日付ブロック型（左に「いつ」の塊 → 小さめサムネ → バッジ＋タイトル）
// ---------------------------------------------------------------------------

function DateBlock({
  parts,
  dateTime,
  faded,
}: {
  parts: EventDateParts | null;
  dateTime?: string;
  faded: boolean;
}) {
  const main =
    parts?.kind === "exact" ? `${parts.month}/${parts.day}` : parts ? `${parts.month}月` : "未定";
  const sub =
    parts?.kind === "exact" ? `(${parts.weekday})` : parts?.period ?? "";
  // 正確な日時があるときだけ time 要素（「8月下旬」は time の値にできないので span）
  const Tag = dateTime ? "time" : "span";
  return (
    <Tag
      dateTime={dateTime}
      className={cn(
        "flex w-[52px] shrink-0 flex-col items-center text-center @2xl:w-[64px]",
        faded ? "text-text-primary/[0.56]" : "text-text-primary",
      )}
    >
      <span className="font-noto-sans-jp text-[11px] font-medium leading-[16px] text-text-primary/[0.56]">
        {parts?.year ?? ""}
      </span>
      <span className="font-rounded-mplus text-lg font-bold leading-[1.3] tabular-nums @2xl:text-xl">
        {main}
      </span>
      <span className="font-noto-sans-jp text-xs font-medium leading-[18px] text-text-primary/[0.56]">
        {sub}
      </span>
    </Tag>
  );
}

export function EventRowB({ event, fadeEnded }: EventRowProps) {
  const faded = fadeEnded && event.status === "ended";
  return (
    <Link href={`/events/${event.slug}`} className={cn(rowClassName, "gap-3 @2xl:gap-4")}>
      <DateBlock parts={event.dateParts} dateTime={event.dateTime} faded={faded} />
      <span aria-hidden="true" className="w-px self-stretch bg-black/[0.1]" />
      <EventThumbnail
        url={event.thumbnailUrl}
        sizes="96px"
        faded={faded}
        className="w-[72px] @2xl:w-[96px]"
      />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <EventStatusBadge status={event.status} />
        <h2 className={titleClassName(faded)}>{event.title}</h2>
      </div>
      <RowArrow className="hidden @2xl:flex" />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// C. 大サムネ型（サムネ160px → 「バッジ・開催日」→ タイトル → 概要2行）
// ---------------------------------------------------------------------------

export function EventRowC({ event, fadeEnded }: EventRowProps) {
  const faded = fadeEnded && event.status === "ended";
  return (
    <Link href={`/events/${event.slug}`} className={cn(rowClassName, "items-start py-4")}>
      <EventThumbnail
        url={event.thumbnailUrl}
        sizes="160px"
        faded={faded}
        className="w-[120px] @md:w-[160px]"
      />
      <div className="min-w-0 flex-1">
        <StatusDateLine event={event} />
        <h2 className={cn(titleClassName(faded), "line-clamp-2")}>{event.title}</h2>
        <p
          className={cn(
            "mt-1 line-clamp-2 font-noto-sans-jp text-xs leading-[1.6]",
            faded ? "text-text-primary/[0.4]" : "text-text-primary/[0.56]",
          )}
        >
          {event.summary}
        </p>
      </div>
    </Link>
  );
}

export const ROW_COMPONENTS: Record<RowPattern, (props: EventRowProps) => React.ReactNode> = {
  a: EventRowA,
  b: EventRowB,
  c: EventRowC,
};
