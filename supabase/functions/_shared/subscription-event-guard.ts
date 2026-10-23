/**
 * サブスクのイベントを user_subscriptions に反映してよいかの判定（rebono issue #250）。
 *
 * user_subscriptions はユーザーごとに1行（user_id + environment）で、
 * stripe_subscription_id に「今の契約」を持つ。同じ顧客に契約が2本ある状態
 * （Memberstack 手数料付き契約 → BONO の新しい契約への移行中、置き換え checkout 直後など）で
 * 古い契約のイベントが届くと、従来は user_id 単位で上書きしていたため
 *   - 古い契約の終了（deleted）で、新しい契約で払っている会員が無効になる
 *   - 古い契約の「期間末で終了」設定（updated）で、行が古い契約に戻り解約予定と出る
 * という不具合になる。ここでは「今の契約と違う契約のイベントで、今の契約がまだ生きている」
 * ときだけ反映を見送る。今の契約が終わっている（解約後の再入会）・一致する（プラン変更・解約予約）
 * ときは従来どおり反映する。
 *
 * import を持たない純粋モジュール（deno test をオフラインで回せる）。
 */

/** 移行スクリプトが新しい契約の metadata に付ける目印 */
export const MIGRATION_METADATA_KEY = "bono_migration";
export const MIGRATION_MS_FEE_REMOVAL = "ms_fee_removal";
export const MIGRATED_FROM_METADATA_KEY = "migrated_from_subscription";

/** Stripe 上で「まだ生きている（請求が続く）」とみなす status */
export const LIVE_SUBSCRIPTION_STATUSES = ["active", "trialing", "past_due"] as const;

export function isLiveSubscriptionStatus(status: unknown): boolean {
  return (
    typeof status === "string" &&
    (LIVE_SUBSCRIPTION_STATUSES as readonly string[]).includes(status)
  );
}

/** Memberstack 手数料をなくすための移行で作った契約か */
export function isFeeMigrationSubscription(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object") return false;
  return (
    (metadata as Record<string, unknown>)[MIGRATION_METADATA_KEY] ===
    MIGRATION_MS_FEE_REMOVAL
  );
}

export type SubscriptionEventKind = "updated" | "deleted" | "invoice_paid";

export interface SubscriptionEventGuardInput {
  kind: SubscriptionEventKind;
  /** 届いたイベントの契約 */
  eventSubscription: { id: string; created?: number | null };
  /** user_subscriptions に記録されている今の契約 id（行が無い・空なら null） */
  currentSubscriptionId: string | null | undefined;
  /**
   * 今の契約を Stripe から取り直した結果（ids が違うときだけ渡す）。
   * - オブジェクト: 取得できた（status / created）
   * - "missing": Stripe に存在しない（resource_missing。別環境・削除済み）
   * - "unavailable": 取得に失敗した（通信エラー等）
   * - undefined: 取得していない
   */
  currentSubscription?:
    | { status?: string | null; created?: number | null }
    | "missing"
    | "unavailable";
}

export type SubscriptionEventGuardReason =
  | "no_current"
  | "matches_current"
  | "current_not_live"
  | "newer_than_current"
  | "current_still_live"
  | "current_unavailable";

export interface SubscriptionEventGuardDecision {
  apply: boolean;
  reason: SubscriptionEventGuardReason;
}

/**
 * イベントを user_subscriptions に反映するか決める。
 *
 * - 行が無い / 今の契約と同じ → 反映
 * - 今の契約と違う
 *   - 今の契約が Stripe で終わっている（canceled 等）・存在しない → 反映（解約後の再入会など）
 *   - 今の契約の取得に失敗 → 見送り（会員を誤って無効にしない側に倒す。handler は例外を握るため
 *     Stripe の再送には頼れない）
 *   - 今の契約がまだ生きている
 *     - deleted → 見送り（古い契約の終了で、払っている会員を無効にしない）
 *     - updated / invoice_paid → 届いた契約のほうが新しく作られていれば反映
 *       （新しい契約の updated が created より先に届いたケース）。古ければ見送り
 */
export function decideSubscriptionEventApply(
  input: SubscriptionEventGuardInput
): SubscriptionEventGuardDecision {
  const currentId = input.currentSubscriptionId || null;
  if (!currentId) return { apply: true, reason: "no_current" };
  if (currentId === input.eventSubscription.id) {
    return { apply: true, reason: "matches_current" };
  }

  const current = input.currentSubscription;
  if (current === "missing") return { apply: true, reason: "current_not_live" };
  if (current === undefined || current === "unavailable") {
    return { apply: false, reason: "current_unavailable" };
  }
  if (!isLiveSubscriptionStatus(current.status)) {
    return { apply: true, reason: "current_not_live" };
  }

  if (input.kind !== "deleted") {
    const eventCreated = input.eventSubscription.created;
    const currentCreated = current.created;
    if (
      typeof eventCreated === "number" &&
      typeof currentCreated === "number" &&
      eventCreated > currentCreated
    ) {
      return { apply: true, reason: "newer_than_current" };
    }
  }
  return { apply: false, reason: "current_still_live" };
}
