/**
 * /dev/events-list-patterns — イベント一覧ページの行パターン比較（#234）
 *
 * 本実装（/events ページ・サイドバー・Sanity 変更）の前に、リスト型（A 新着型 / B 日付ブロック型 / C 大サムネ型 / D 募集中・過去の2ブロック）を
 * 本番のイベント7件（モック）で並べて比べる。Sanity には触れない。
 * 状態（募集中/終了）・日付表示・並び順は本実装に移す予定の src/lib/events/event-schedule.ts を使う。
 */

import { Metadata } from "next";
import Link from "next/link";
import {
  formatDaysUntil,
  formatEventDate,
  formatEventStartTime,
  getDaysUntilEvent,
  getEventDateParts,
  getEventStatus,
  groupEventsByStatus,
  sortEventsNewestFirst,
} from "@/lib/events/event-schedule";
import { DUMMY_EVENT_2025, MOCK_EVENTS, type MockEvent } from "./mock";
import { EventsListPatterns } from "./patterns";
import type { EventListItem } from "./rows";

export const metadata: Metadata = {
  title: "イベント一覧のパターン比較 (/dev/events-list-patterns)",
  robots: { index: false, follow: false },
};

// 状態（募集中/終了）を開いた時点で判定するため、毎回サーバーで描画する
export const dynamic = "force-dynamic";

function toListItem(e: MockEvent, now: Date): EventListItem {
  const status = getEventStatus(e, now);
  const dateParts = getEventDateParts(e);
  return {
    slug: e.slug,
    title: e.title,
    summary: e.summary,
    thumbnailUrl: e.thumbnailUrl,
    status,
    dateLabel: formatEventDate(e),
    dateTime: e.eventStartAt ?? undefined,
    dateParts,
    startTimeLabel: formatEventStartTime(e),
    daysUntilLabel: status === "upcoming" ? formatDaysUntil(getDaysUntilEvent(e, now)) : null,
    year: dateParts?.year ?? null,
  };
}

export default function Page() {
  const now = new Date();
  const events = sortEventsNewestFirst(MOCK_EVENTS).map((e) => toListItem(e, now));
  const groups = groupEventsByStatus(MOCK_EVENTS, now);
  const dData = {
    upcoming: groups.upcoming.map((e) => toListItem(e, now)),
    ended: groups.ended.map((e) => toListItem(e, now)),
    dummy2025: toListItem(DUMMY_EVENT_2025, now),
  };

  return (
    <div className="min-h-screen bg-base">
      <div className="mx-auto w-full min-w-0 max-w-[1440px] px-4 py-12 sm:px-6">
        <header className="mb-6 border-b border-gray-200 pb-4">
          <p className="font-noto-sans-jp text-sm font-bold text-text-primary/50">
            <Link href="/dev" className="underline hover:text-text-primary">
              Dev Portal
            </Link>{" "}
            / #234 イベント一覧
          </p>
          <h1 className="mt-1 font-rounded-mplus text-2xl font-bold text-text-primary">
            イベント一覧のパターン比較
          </h1>
          <p className="mt-2 font-noto-sans-jp text-sm leading-relaxed text-text-primary/60">
            /events に置く一覧の見せ方を比べるページです（初期表示は D。A/B/C は比較用に残しています）。データは本番のイベント7件のモック（年はまだ Sanity に無いので 2026 を仮で入れています）。
            A/B/C は開催時期の新しい順の1本のリスト、D は「募集中」（開催が近い順）と「過去のイベント」（新しい順）の2ブロック。状態は「募集中」（開催日の当日中まで）と「終了」の2種類で、開いた時点の日時で判定します。
            概算の開催時期は上旬=10日・中旬=20日・下旬=月末を終了日とみなします。
            各行のリンク先は /events/[slug]（本番の詳細ページ）です。
          </p>
        </header>

        <EventsListPatterns events={events} dData={dData} />
      </div>
    </div>
  );
}
