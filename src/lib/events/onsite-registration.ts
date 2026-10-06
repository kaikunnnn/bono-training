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
export const ONSITE_REGISTRATION_EVENTS: readonly string[] = [];

export function isOnsiteRegistrationEvent(slug: string): boolean {
  return ONSITE_REGISTRATION_EVENTS.includes(slug);
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
