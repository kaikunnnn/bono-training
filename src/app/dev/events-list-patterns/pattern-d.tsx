/**
 * パターン D: B（日付ブロック型）をベースに「募集中」と「過去のイベント」の2ブロックに分けた案。
 *
 * - 日付ブロックは固定幅（両セクション共通）で、右の区切り線の位置がそろう
 * - 年（小）→ 月日（大）→ 曜日（小）の3段。募集中の行は月日をさらに大きくし、曜日の横に開始時刻
 * - 募集中は「募集中」バッジの代わりに「あと◯日」/「今日」を目立たせる。過去は「終了」バッジを出さない
 *   （どちらもセクション名で状態が分かるため）
 */

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  EventThumbnail,
  RowArrow,
  rowClassName,
  titleClassName,
  type EventListItem,
} from "./rows";

/** 日付ブロックの幅（両セクション共通。区切り線の位置をそろえる） */
const DATE_BLOCK_WIDTH = "w-[68px] @2xl:w-[84px]";

function DateBlockD({
  event,
  emphasis,
  faded,
}: {
  event: EventListItem;
  /** 募集中の行（月日を大きく、開始時刻も出す） */
  emphasis: boolean;
  faded: boolean;
}) {
  const parts = event.dateParts;
  const main =
    parts?.kind === "exact" ? `${parts.month}/${parts.day}` : parts ? `${parts.month}月` : "未定";
  const sub = parts?.kind === "exact" ? `(${parts.weekday})` : (parts?.period ?? "");
  // 正確な日時があるときだけ time 要素（「8月下旬」は time の値にできないので span）
  const Tag = event.dateTime ? "time" : "span";
  return (
    <Tag
      dateTime={event.dateTime}
      className={cn(
        "flex shrink-0 flex-col items-center text-center",
        DATE_BLOCK_WIDTH,
        faded ? "text-text-primary/[0.56]" : "text-text-primary",
      )}
    >
      <span className="font-noto-sans-jp text-[11px] font-medium leading-[16px] text-text-primary/[0.56]">
        {parts?.year ?? ""}
      </span>
      <span
        className={cn(
          "font-rounded-mplus font-bold tabular-nums leading-[1.2]",
          emphasis ? "text-[26px] @2xl:text-[32px]" : "text-xl @2xl:text-[22px]",
        )}
      >
        {main}
      </span>
      <span className="font-noto-sans-jp text-xs font-medium leading-[18px] text-text-primary/[0.56]">
        {sub}
      </span>
      {emphasis && event.startTimeLabel && (
        <span className="font-noto-sans-jp text-xs font-bold leading-[18px] tabular-nums text-text-secondary">
          {event.startTimeLabel}
        </span>
      )}
    </Tag>
  );
}

function EventRowD({
  event,
  upcoming,
  faded,
}: {
  event: EventListItem;
  upcoming: boolean;
  faded: boolean;
}) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(rowClassName, "gap-3 @2xl:gap-4", upcoming && "py-4")}
    >
      <DateBlockD event={event} emphasis={upcoming} faded={faded} />
      <span aria-hidden="true" className="w-px self-stretch bg-black/[0.1]" />
      <EventThumbnail
        url={event.thumbnailUrl}
        sizes={upcoming ? "128px" : "96px"}
        faded={faded}
        className={upcoming ? "w-[80px] @2xl:w-[128px]" : "w-[72px] @2xl:w-[96px]"}
      />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        {upcoming && event.daysUntilLabel && (
          <span className="inline-flex items-center rounded-full bg-success-feedback px-2.5 font-noto-sans-jp text-xs font-bold leading-[22px] text-text-success">
            {event.daysUntilLabel}
          </span>
        )}
        <h3 className={titleClassName(faded)}>{event.title}</h3>
      </div>
      <RowArrow className="hidden @2xl:flex" />
    </Link>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-black/[0.1] pb-2">
      <h2 className="font-rounded-mplus text-lg font-medium leading-[1.5] text-text-primary">
        {title}
      </h2>
      <span className="font-noto-sans-jp text-sm text-text-primary/[0.56]">{count}件</span>
    </div>
  );
}

function YearHeading({ year }: { year: number | null }) {
  return (
    <h3 className="mt-6 px-1 font-rounded-mplus text-sm font-medium leading-[24px] text-text-primary/[0.56] first:mt-3">
      {year ? `${year}年` : "開催時期未定"}
    </h3>
  );
}

/** 年が変わるところで区切る（並びはそのまま） */
function splitByYear(events: EventListItem[]) {
  const groups: { year: number | null; events: EventListItem[] }[] = [];
  for (const event of events) {
    const last = groups[groups.length - 1];
    if (last && last.year === event.year) last.events.push(event);
    else groups.push({ year: event.year, events: [event] });
  }
  return groups;
}

export function PatternDList({
  upcoming,
  ended,
  fadeEnded,
  yearHeadings,
}: {
  upcoming: EventListItem[];
  ended: EventListItem[];
  fadeEnded: boolean;
  yearHeadings: boolean;
}) {
  return (
    <div className="mt-8 flex flex-col gap-10">
      <section>
        <SectionHeader title="募集中" count={upcoming.length} />
        {upcoming.length > 0 ? (
          <div className="flex flex-col">
            {upcoming.map((event) => (
              <EventRowD key={event.slug} event={event} upcoming faded={false} />
            ))}
          </div>
        ) : (
          <p className="px-1 py-6 font-noto-sans-jp text-sm text-text-primary/[0.56]">
            いま募集中のイベントはありません
          </p>
        )}
      </section>

      <section>
        <SectionHeader title="過去のイベント" count={ended.length} />
        {yearHeadings ? (
          splitByYear(ended).map((group) => (
            <div key={group.year ?? "unknown"}>
              <YearHeading year={group.year} />
              <div className="flex flex-col">
                {group.events.map((event) => (
                  <EventRowD key={event.slug} event={event} upcoming={false} faded={fadeEnded} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col">
            {ended.map((event) => (
              <EventRowD key={event.slug} event={event} upcoming={false} faded={fadeEnded} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
