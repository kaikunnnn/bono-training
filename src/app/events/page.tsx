import type { Metadata } from "next";
import { connection } from "next/server";
import { EventListSection } from "@/components/event/EventListSection";
import type { EventListRowProps } from "@/components/event/EventListRow";
import { getAllEvents, type EventListItem } from "@/lib/sanity";
import {
  formatDaysUntil,
  formatEventStartTime,
  getDaysUntilEvent,
  getEventDateParts,
  groupEventsByStatus,
  toEventScheduleInput,
  type EventScheduleInput,
} from "@/lib/events/event-schedule";
import { OG_DEFAULTS } from "@/lib/seo-metadata";

const DESCRIPTION =
  "BONOで開催するワークショップや交流会です。募集中のイベントと、これまでのイベントを載せています。";

export const metadata: Metadata = {
  title: "イベント",
  description: DESCRIPTION,
  alternates: { canonical: "/events" },
  robots: { index: true, follow: true },
  openGraph: {
    ...OG_DEFAULTS,
    title: "イベント | BONO",
    description: DESCRIPTION,
  },
  twitter: {
    title: "イベント | BONO",
    description: DESCRIPTION,
  },
};

/**
 * イベント一覧（/events）。#234 パターン D。
 *
 * 「募集中」（開催が近い順）と「過去のイベント」（新しい順）の2ブロック。
 * 判定・並び・あと◯日は src/lib/events/event-schedule.ts（すべて日本時間）。
 *
 * キャッシュ方針: リクエスト時に描画する（connection()）。
 * 「募集中/過去」と「あと◯日」は今の日時で変わるため、ISR（revalidate）で HTML を持つと、
 * アクセスの少ない時間帯をまたいだ最初の人に何日も前の HTML（例: 実際は「今日」なのに「あと2日」、
 * 終わったのに「募集中」）が返り得る（stale-while-revalidate）。
 * Sanity の取得は getAllEvents の unstable_cache（5分・tag "event"）が効くので、毎回 CDN を叩くわけではない。
 */
export default async function EventsPage() {
  await connection();
  const now = new Date();
  const events = await getAllEvents();

  // 判定用の入力（eventStartAt / eventYear など）に元のイベントを添えて分ける
  const { upcoming, ended } = groupEventsByStatus(
    events.map((event) => ({ ...toEventScheduleInput(event), event })),
    now,
  );

  const toRow = (
    item: EventScheduleInput & { event: EventListItem },
    isUpcoming: boolean,
  ): EventListRowProps & { key: string } => ({
    key: item.event._id,
    href: `/events/${item.event.slug.current}`,
    title: item.event.title,
    thumbnailUrl: item.event.thumbnailUrl,
    dateParts: getEventDateParts(item),
    dateTime: item.eventStartAt ?? undefined,
    startTimeLabel: formatEventStartTime(item),
    daysUntilLabel: isUpcoming ? formatDaysUntil(getDaysUntilEvent(item, now)) : null,
    upcoming: isUpcoming,
  });

  return (
    <section className="px-6 lg:px-12">
      <div className="py-8">
        <h1 className="font-rounded-mplus text-[28px] font-medium leading-[1.5] text-text-primary">
          イベント
        </h1>
        <p className="mt-2 font-noto-sans-jp text-sm leading-[1.71] text-text-primary/[0.56]">
          {DESCRIPTION}
        </p>

        <div className="mt-8 flex flex-col gap-10">
          <EventListSection
            title="募集中"
            rows={upcoming.map((s) => toRow(s, true))}
            emptyText="いま募集中のイベントはありません"
          />
          <EventListSection
            title="過去のイベント"
            rows={ended.map((s) => toRow(s, false))}
            emptyText="過去のイベントはまだありません"
          />
        </div>
      </div>
    </section>
  );
}
