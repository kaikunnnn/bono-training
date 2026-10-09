/**
 * イベント一覧（#234）の表示用：開催時期の判定・日付表示・並び順。
 *
 * 純粋な関数のみ。Server / Client どちらからも import してよい。
 *
 * - 正確な開催日時 eventStartAt があればそれを使う
 * - 無ければ eventYear + eventMonth + eventPeriod（上旬/中旬/下旬）の概算を使う
 * - 日付はすべて日本時間（JST）で数える。サーバーは UTC で動くので getMonth()/getDate() は使わず、
 *   +09:00 ずらした時刻を getUTC*() で読む（onsite-registration.ts と同じやり方）
 */

export type EventPeriod = "early" | "mid" | "late";

export interface EventScheduleInput {
  eventStartAt?: string | null;
  eventYear?: number | null;
  eventMonth?: number | null;
  eventPeriod?: EventPeriod | null;
}

/** 募集中（これから開催）/ 終了 */
export type EventStatus = "upcoming" | "ended";

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: "募集中",
  ended: "終了",
};

export const EVENT_PERIOD_LABELS: Record<EventPeriod, string> = {
  early: "上旬",
  mid: "中旬",
  late: "下旬",
};

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** 日本時間の Y/M/D の 0:00 を表す UTC ミリ秒（month は 1始まり。day の繰り上がりは Date.UTC に任せる） */
function jstMidnight(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day) - JST_OFFSET_MS;
}

function parseIso(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

/** 開催時期の分解結果（日付ブロック表示などに使う） */
export type EventDateParts =
  | {
      kind: "exact";
      year: number;
      month: number;
      day: number;
      /** 「水」など */
      weekday: string;
    }
  | {
      kind: "approximate";
      year: number | null;
      month: number;
      /** 「下旬」など。期間未設定なら null */
      period: string | null;
    };

export function getEventDateParts(event: EventScheduleInput): EventDateParts | null {
  const startMs = parseIso(event.eventStartAt);
  if (startMs !== null) {
    const shifted = new Date(startMs + JST_OFFSET_MS);
    return {
      kind: "exact",
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth() + 1,
      day: shifted.getUTCDate(),
      weekday: WEEKDAYS_JA[shifted.getUTCDay()],
    };
  }
  if (event.eventMonth) {
    return {
      kind: "approximate",
      year: event.eventYear ?? null,
      month: event.eventMonth,
      period: event.eventPeriod ? EVENT_PERIOD_LABELS[event.eventPeriod] : null,
    };
  }
  return null;
}

/**
 * 開催日の表示。
 * - 正確な日時あり: 「2026年10月21日(水)」
 * - 概算: 「2026年8月下旬」（期間なしは「2026年8月」、年なしは「8月下旬」）
 * - どちらも無い: null
 */
export function formatEventDate(event: EventScheduleInput): string | null {
  const parts = getEventDateParts(event);
  if (!parts) return null;
  if (parts.kind === "exact") {
    return `${parts.year}年${parts.month}月${parts.day}日(${parts.weekday})`;
  }
  const year = parts.year ? `${parts.year}年` : "";
  return `${year}${parts.month}月${parts.period ?? ""}`;
}

/**
 * 「終了」に切り替わる時刻（この時刻ちょうど以降は終了）。
 * - 正確な日時あり: 開催日（JST）の翌日 0:00 JST。当日中は「募集中」のまま
 *   （サイト上申込の締め切り getRegistrationDeadline と同じ区切り）
 * - 概算: 上旬=10日・中旬=20日・下旬=月末（期間なしも月末）を終了日とみなし、その翌日 0:00 JST
 * - 年が無い概算・日付情報が無い: null（判定できない）
 */
export function getEventEndBoundary(event: EventScheduleInput): Date | null {
  const parts = getEventDateParts(event);
  if (!parts) return null;
  if (parts.kind === "exact") {
    return new Date(jstMidnight(parts.year, parts.month, parts.day + 1));
  }
  if (!parts.year) return null;
  const period = event.eventPeriod ?? "late";
  if (period === "early") return new Date(jstMidnight(parts.year, parts.month, 11));
  if (period === "mid") return new Date(jstMidnight(parts.year, parts.month, 21));
  // 下旬・期間なし: 翌月1日 0:00 JST（12月なら翌年1月1日）
  return new Date(jstMidnight(parts.year, parts.month + 1, 1));
}

/**
 * 表示用の状態。
 * 判定できないイベント（年が無い概算・日付情報なし）は「終了」扱いにする
 * （開催予定が分からないものを「募集中」と出して申込を誘わないため）。
 */
export function getEventStatus(
  event: EventScheduleInput,
  now: Date = new Date(),
): EventStatus {
  const boundary = getEventEndBoundary(event);
  if (!boundary) return "ended";
  return now.getTime() < boundary.getTime() ? "upcoming" : "ended";
}

/**
 * 並び替え用の時刻（大きいほど新しい）。
 * 正確な日時はその時刻、概算は期間の初日（上旬=1日・中旬=11日・下旬=21日、期間なし=1日）の 0:00 JST。
 * 判定できないものは null（一覧の最後に回す想定）。
 */
export function getEventSortTime(event: EventScheduleInput): number | null {
  const startMs = parseIso(event.eventStartAt);
  if (startMs !== null) return startMs;
  if (!event.eventMonth || !event.eventYear) return null;
  const firstDay =
    event.eventPeriod === "mid" ? 11 : event.eventPeriod === "late" ? 21 : 1;
  return jstMidnight(event.eventYear, event.eventMonth, firstDay);
}

/** 開催時期の新しい順に並べた新しい配列を返す（同じ時期は元の順を保つ） */
export function sortEventsNewestFirst<T extends EventScheduleInput>(events: readonly T[]): T[] {
  return events
    .map((event, index) => ({ event, index, time: getEventSortTime(event) }))
    .sort((a, b) => {
      if (a.time === b.time) return a.index - b.index;
      if (a.time === null) return 1;
      if (b.time === null) return -1;
      return b.time - a.time;
    })
    .map(({ event }) => event);
}

// ---------------------------------------------------------------------------
// 募集中 / 過去の2ブロック表示（#234 パターン D）
// ---------------------------------------------------------------------------

/**
 * 開催日まであと何日か（日本時間の暦日で数える。当日は 0、過ぎていれば負の数）。
 * 正確な日時 eventStartAt があるときだけ数える。概算（8月下旬など）は「あと◯日」を言えないので null。
 * 例: 今 10/9 15:00 JST、開催 10/21 20:00 JST → 12
 */
export function getDaysUntilEvent(
  event: EventScheduleInput,
  now: Date = new Date(),
): number | null {
  const parts = getEventDateParts(event);
  if (!parts || parts.kind !== "exact") return null;
  const nowShifted = new Date(now.getTime() + JST_OFFSET_MS);
  const today = Date.UTC(
    nowShifted.getUTCFullYear(),
    nowShifted.getUTCMonth(),
    nowShifted.getUTCDate(),
  );
  const eventDay = Date.UTC(parts.year, parts.month - 1, parts.day);
  return Math.round((eventDay - today) / (24 * 60 * 60 * 1000));
}

/** 「今日」「あと12日」。過ぎている・数えられないときは null */
export function formatDaysUntil(days: number | null): string | null {
  if (days === null || days < 0) return null;
  return days === 0 ? "今日" : `あと${days}日`;
}

/** 開始時刻の表示「20:00〜」（日本時間）。正確な日時が無ければ null */
export function formatEventStartTime(event: EventScheduleInput): string | null {
  const startMs = parseIso(event.eventStartAt);
  if (startMs === null) return null;
  const shifted = new Date(startMs + JST_OFFSET_MS);
  const hh = String(shifted.getUTCHours()).padStart(2, "0");
  const mm = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}〜`;
}

/**
 * 「募集中」と「過去」に分ける。
 * - upcoming: 開催が近い順（昇順）
 * - ended: 新しい順（降順）。判定できないものは最後
 */
export function groupEventsByStatus<T extends EventScheduleInput>(
  events: readonly T[],
  now: Date = new Date(),
): { upcoming: T[]; ended: T[] } {
  const upcoming = events
    .map((event, index) => ({ event, index, time: getEventSortTime(event) }))
    .filter(({ event }) => getEventStatus(event, now) === "upcoming")
    .sort((a, b) => {
      if (a.time === b.time) return a.index - b.index;
      if (a.time === null) return 1;
      if (b.time === null) return -1;
      return a.time - b.time;
    })
    .map(({ event }) => event);
  const ended = sortEventsNewestFirst(events).filter(
    (e) => getEventStatus(e, now) === "ended",
  );
  return { upcoming, ended };
}

/**
 * Sanity のイベントから判定用の入力を作る（一覧・詳細で共通）。
 * eventStartAt も eventMonth も無い旧形式のイベントは、公開日時 publishedAt を開催日の代わりに使う
 * （詳細ページの従来の挙動と同じ）。
 */
export function toEventScheduleInput(event: {
  eventStartAt?: string | null;
  eventYear?: number | null;
  eventMonth?: number | null;
  eventPeriod?: string | null;
  publishedAt?: string | null;
}): EventScheduleInput {
  const period =
    event.eventPeriod === "early" || event.eventPeriod === "mid" || event.eventPeriod === "late"
      ? event.eventPeriod
      : null;
  return {
    eventStartAt: event.eventStartAt ?? (!event.eventMonth ? event.publishedAt : null) ?? null,
    eventYear: event.eventYear ?? null,
    eventMonth: event.eventMonth ?? null,
    eventPeriod: period,
  };
}
