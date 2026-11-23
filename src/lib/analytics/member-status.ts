/**
 * GA4 ユーザープロパティ `member_status`（#213 T4）の値を決める純粋関数。
 *
 * ダッシュボードの「料金ページを見た」ファネルから課金中の会員を除外するために使う。
 * - paying:    有効な有料サブスクあり（user_subscriptions.is_active = true）
 * - free:      ログイン済みだが有効サブスクなし
 * - anonymous: 未ログイン
 *
 * 「有効なサブスク」の判定は料金ページ（PricingFinal）が「既に会員」とみなす
 * `SubscriptionState.isSubscribed`（= is_active）と同じにそろえる。
 * 100%クーポン等で実質無料のサブスクも is_active=true でプレミアム権限が付くため paying 扱い。
 * PII（user_id・メール等）は含めない。
 */
export type MemberStatus = "paying" | "free" | "anonymous";

export const MEMBER_STATUS_PROPERTY = "member_status";

export function deriveMemberStatus(params: {
  isLoggedIn: boolean;
  isSubscribed: boolean;
}): MemberStatus {
  if (!params.isLoggedIn) return "anonymous";
  return params.isSubscribed ? "paying" : "free";
}

// ===== イベント単位の会員状態（#266 S1）=====
//
// user_properties の member_status は「ユーザーの最新の状態」しか残らず、期間中に課金した人は
// 課金前のイベントまで paying 扱いになる。そこでイベントごとに「その時点の状態」を
// イベントパラメータ member_status_at_event として送る（gtag('set', {...}) で以降の全イベントに付く）。
// - paying / free / anonymous: サーバーで判定した MemberStatus そのまま
// - anonymous_member: 未ログインだが、この端末で90日以内に paying としてページを表示したことがある
//   （ログアウト中の有料会員を「会員以外」に数えないため）
//
// lesson-intro.ts のイベントパラメータ member_status（guest/free/paid/unknown）とは別物。

export type MemberStatusAtEvent = MemberStatus | "anonymous_member";

export const MEMBER_STATUS_EVENT_PARAM = "member_status_at_event";

/** 「最後に paying だった日時」（ISO 文字列のみ。個人情報は保存しない）。命名は first-touch（bono_first_touch）に合わせる */
export const LAST_PAYING_AT_STORAGE_KEY = "bono_last_paying_at";

/** 90日（first touch の有効期間と同じ） */
export const LAST_PAYING_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * イベント時点の会員状態を決める（純粋関数）。
 * anonymous のときだけ「最後に paying だった日時」を見て、0〜90日以内なら anonymous_member。
 * 日時が無い・読めない・未来・90日超は anonymous のまま。
 *
 * ※ GA_BOOTSTRAP（config.ts）に同じ判定を文字列スクリプトで埋め込んでいる
 *   （MEMBER_STATUS_AT_EVENT_RESOLVER_JS）。変えるときは両方を変え、
 *   src/__tests__/lib/analytics/config.test.ts の一致テストを通すこと。
 */
export function resolveMemberStatusAtEvent(
  status: MemberStatus,
  lastPayingAtRaw: string | null | undefined,
  nowMs: number
): MemberStatusAtEvent {
  if (status !== "anonymous") return status;
  if (!lastPayingAtRaw) return "anonymous";
  const at = Date.parse(lastPayingAtRaw);
  if (!Number.isFinite(at)) return "anonymous";
  const age = nowMs - at;
  return age >= 0 && age <= LAST_PAYING_TTL_MS ? "anonymous_member" : "anonymous";
}

/**
 * GA_BOOTSTRAP 用の同じ判定（ES5 の関数式の文字列）。resolveMemberStatusAtEvent と結果が一致すること。
 * 引数は (status, raw, nowMs)。
 */
export const MEMBER_STATUS_AT_EVENT_RESOLVER_JS = `function (status, raw, nowMs) {
    if (status !== 'anonymous') return status;
    if (!raw) return 'anonymous';
    var at = Date.parse(raw);
    if (!isFinite(at)) return 'anonymous';
    var age = nowMs - at;
    return age >= 0 && age <= ${LAST_PAYING_TTL_MS} ? 'anonymous_member' : 'anonymous';
  }`;

/** paying でページを表示したときに印を書く。localStorage が使えなければ何もしない */
export function rememberPayingNow(now: Date = new Date()): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_PAYING_AT_STORAGE_KEY, now.toISOString());
  } catch {
    // 使えない環境では印を残さない（anonymous として扱われる）
  }
}

/** 印を読む。読めなければ null */
export function readLastPayingAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_PAYING_AT_STORAGE_KEY);
  } catch {
    return null;
  }
}
