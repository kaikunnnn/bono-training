/**
 * 日付の扱い（#263）。外す日・期限は「日本時間の日付」（YYYY-MM-DD）で持つ。純粋関数。
 * 日本はサマータイムがないので、UTC+9 時間ずらして日付部分を取れば JST の日付になる。
 */

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** 時刻 → JST の日付（YYYY-MM-DD） */
export function toJstDate(at: Date): string {
  return new Date(at.getTime() + JST_OFFSET_MS).toISOString().slice(0, 10);
}

/** YYYY-MM-DD に日数を足す */
export function addDays(date: string, days: number): string {
  if (!DATE_RE.test(date)) throw new Error(`invalid date: ${date}`);
  const base = Date.parse(`${date}T00:00:00Z`);
  return new Date(base + days * DAY_MS).toISOString().slice(0, 10);
}

/** 遅いほうの日付（YYYY-MM-DD は文字列比較で前後が分かる） */
export function laterDate(a: string, b: string): string {
  return a >= b ? a : b;
}

/** 表示用: 2026-10-27 → 10月27日 */
export function formatJpDate(date: string): string {
  if (!DATE_RE.test(date)) return date;
  const [, m, d] = date.split("-").map(Number);
  return `${m}月${d}日`;
}
