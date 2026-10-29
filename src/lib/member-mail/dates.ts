/**
 * 会員メール（#264）の日本時間の区切り。純粋関数のみ。
 * 日本はサマータイムが無いので、+9時間ずらして UTC として計算する。
 */

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 日本時間の「今日の0時」 */
export function jstDayStart(now: Date): Date {
  const shifted = now.getTime() + JST_OFFSET_MS;
  return new Date(Math.floor(shifted / DAY_MS) * DAY_MS - JST_OFFSET_MS);
}

/** 日本時間の「今週の月曜0時」（週の上限の区切り。264 §5-9 / 月曜・火曜に分けて送る 268） */
export function jstWeekStart(now: Date): Date {
  const dayStart = jstDayStart(now);
  const jstDow = new Date(dayStart.getTime() + JST_OFFSET_MS).getUTCDay(); // 0=日
  const sinceMonday = (jstDow + 6) % 7;
  return new Date(dayStart.getTime() - sinceMonday * DAY_MS);
}

/** 日本時間の時（0〜23） */
export function jstHour(now: Date): number {
  return new Date(now.getTime() + JST_OFFSET_MS).getUTCHours();
}

/** 送ってよい時間帯か（start <= 時 < end） */
export function isWithinSendWindow(now: Date, startHour: number, endHour: number): boolean {
  const h = jstHour(now);
  return h >= startHour && h < endHour;
}

/** 在籍月数の区分（人数だけ出すときの内訳） */
export function tenureBucket(createdAt: Date | null, now: Date): string {
  if (!createdAt) return "unknown";
  const months = (now.getTime() - createdAt.getTime()) / (30 * DAY_MS);
  if (months < 1) return "lt_1m";
  if (months < 3) return "1_3m";
  if (months < 6) return "3_6m";
  if (months < 12) return "6_12m";
  return "12m_plus";
}
