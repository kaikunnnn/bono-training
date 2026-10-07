/**
 * イベントのサイト上参加申込（#218）の切り替えと、参加コメントの検証ルール。
 *
 * 純粋な定数・関数のみ。DB/cookies に触れないので Server / Client どちらからも import してよい。
 */

/**
 * サイト上で参加申込を受け付けるイベントの slug 一覧（#218）。
 *
 * - ここに入っているイベントだけ、Googleフォームの代わりにサイト上の申込UI（コメント付き）を出す。
 *   Sanity の registrationUrl が空でも申込UIを出す
 * - ここに無いイベントは今まで通り registrationUrl（Googleフォーム）へのボタン
 * - 追加のしかた: Sanity にイベント記事を作り、URL の /events/<slug> の <slug> をこの配列に足す
 *   （例: "bono-number-improvement-2026-10"）
 * - Sanity の「申込方法」項目化はイベント後の別タスク（rebono/issues/218 の「やらないこと」）
 */
export const ONSITE_REGISTRATION_EVENTS: readonly string[] = [
  "uidesign-challenge-2026-10",
];

export function isOnsiteRegistrationEvent(slug: string): boolean {
  return ONSITE_REGISTRATION_EVENTS.includes(slug);
}

// ---------------------------------------------------------------------------
// 申込の締め切り（開催日の日本時間 23:59:59.999 まで受け付ける）
//
// サーバーは UTC で動くので、getMonth()/getDate() などのローカル時刻は使わず、
// +09:00 ずらした時刻を getUTC*() で読んで日本時間の日付を出す。
// ---------------------------------------------------------------------------

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** ISO 文字列の日本時間での年月日・曜日。空・不正な値は null */
function toJstDateParts(
  iso: string | null | undefined,
): { year: number; month: number; day: number; weekday: number } | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return null;
  const shifted = new Date(ms + JST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
  };
}

/**
 * 申込の締め切り時刻（この時刻ちょうど以降は受付終了）。
 * 開催開始日（日本時間）の翌日 0:00 JST = 開催日の 23:59:59.999 JST の直後。
 * 例: eventStartAt 2026-10-21T11:00:00.000Z（10/21 20:00 JST）→ 2026-10-21T15:00:00.000Z
 * eventStartAt が無い・不正なら null（締め切らない）。
 */
export function getRegistrationDeadline(
  eventStartAt: string | null | undefined,
): Date | null {
  const parts = toJstDateParts(eventStartAt);
  if (!parts) return null;
  return new Date(
    Date.UTC(parts.year, parts.month, parts.day + 1) - JST_OFFSET_MS,
  );
}

/** 申込の受付が終了しているか（締め切りが無いイベントは常に false） */
export function isRegistrationClosed(
  eventStartAt: string | null | undefined,
  now: Date = new Date(),
): boolean {
  const deadline = getRegistrationDeadline(eventStartAt);
  return deadline !== null && now.getTime() >= deadline.getTime();
}

/**
 * 締め切り日の表示（例: 「10月21日（水）」）。開催開始日の日本時間の日付。
 * eventStartAt が無い・不正なら null。
 */
export function formatRegistrationDeadline(
  eventStartAt: string | null | undefined,
): string | null {
  const parts = toJstDateParts(eventStartAt);
  if (!parts) return null;
  return `${parts.month + 1}月${parts.day}日（${WEEKDAYS_JA[parts.weekday]}）`;
}

/** 参加コメントの初期値（DB の DEFAULT と同じ） */
export const DEFAULT_REGISTRATION_COMMENT = "参加します！";

/** 参加コメントの最大文字数（DB の CHECK (char_length(comment) BETWEEN 1 AND 300) と同じ） */
export const REGISTRATION_COMMENT_MAX_LENGTH = 300;

/**
 * 参加コメントを検証する（前後の空白は除く）。
 * JS の length はサロゲートペアを2と数えるため、Postgres の char_length 以上になり、
 * ここを通れば DB の CHECK も必ず通る。
 */
export function validateRegistrationComment(
  raw: unknown,
): { ok: true; comment: string } | { ok: false; error: string } {
  const comment = typeof raw === "string" ? raw.trim() : "";
  if (comment.length === 0) {
    return { ok: false, error: "コメントを入力してください" };
  }
  if (comment.length > REGISTRATION_COMMENT_MAX_LENGTH) {
    return {
      ok: false,
      error: `コメントは${REGISTRATION_COMMENT_MAX_LENGTH}文字以内で入力してください`,
    };
  }
  return { ok: true, comment };
}

// ---------------------------------------------------------------------------
// 参加者の表示（#218 スライスD）
// ---------------------------------------------------------------------------

/** 参加者アイコンを重ねて並べる最大数 */
export const PARTICIPANT_AVATAR_MAX = 4;

/** この人数以上で「N人が参加中」を出す（1〜4人はアイコンだけ） */
export const PARTICIPANT_COUNT_THRESHOLD = 5;

/**
 * 誰にでも見せる参加者の要約（アイコンと人数だけ）。
 * 名前・コメントは含めない（非会員の props / RSC payload / HTML に入れないため）。
 */
export interface EventParticipantSummary {
  totalCount: number;
  /** 新しい申込順。最大 PARTICIPANT_AVATAR_MAX 件。null はアイコン未設定 */
  avatarUrls: (string | null)[];
}

/** 会員だけに見せる参加者（名前・アイコン・コメント） */
export interface EventParticipant {
  id: string;
  name: string;
  avatarUrl: string | null;
  comment: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// 申込者のプロフィール（申込カードの「自分のアイコン＋名前」と、DB に保存する名前・アイコン）
// ---------------------------------------------------------------------------

/** 申込者の表示名とアイコン */
export interface RegistrantProfile {
  name: string;
  avatarUrl: string | null;
}

/**
 * ログインユーザーから申込者の名前・アイコンを導出する（question_comments の addComment と同じ順）。
 * 申込カードの表示（page.tsx）と、申込時に保存する値（actions.ts）で同じ結果になるよう共通化している。
 * user_metadata は本人が書き換えられる値なので、表示用にだけ使う（権限の判定には使わない）。
 */
export function getRegistrantProfile(user: {
  email?: string;
  user_metadata?: Record<string, unknown> | null;
}): RegistrantProfile {
  const meta = user.user_metadata ?? {};
  return {
    name:
      (meta.display_name as string | undefined) ||
      (meta.name as string | undefined) ||
      user.email?.split("@")[0] ||
      "メンバー",
    avatarUrl: (meta.avatar_url as string | undefined) ?? null,
  };
}
