/**
 * 既存Stripe契約の自動リンク（S3）ロジック
 *
 * 「Stripeに active/trialing サブスクがあるのに β DB(user_subscriptions)が未同期」
 * というユーザーを、検出済みのStripeサブスクからDBへ復元(link)する共有ロジック。
 * create-checkout（S3-A: S5ガード発火点）と signup後リンク（S3-B）の両方から使う。
 *
 * 【重要】このファイルは esm.sh 等の外部importを持たない（deno test をオフライン・
 * 権限不要で高速に回すため）。Stripe/Supabase は薄いインターフェースを DI する。
 * price導出は同じく外部import無しの ./plan-utils.ts を再利用する。
 */

import { derivePlanFromPrice, type StripePriceLike } from "./plan-utils.ts";

// ============================================================================
// 薄い依存インターフェース
// ============================================================================

/** リンク対象の（retrieve済み・product expand済み）Stripe Subscription の最小形 */
export interface FullStripeSubscriptionLike {
  id: string;
  status?: string;
  customer: string;
  current_period_end?: number | null;
  cancel_at_period_end?: boolean | null;
  cancel_at?: number | null;
  items: { data: Array<{ price: StripePriceLike }> };
}

export interface LinkSupabaseResult {
  error: unknown | null;
}

/** upsert だけ使う薄い Supabase テーブルハンドル */
export interface LinkSupabaseTableLike {
  upsert(
    values: Record<string, unknown>,
    options?: { onConflict?: string }
  ): Promise<LinkSupabaseResult>;
}

export interface LinkSupabaseLike {
  from(table: string): LinkSupabaseTableLike;
}

export interface SubscriptionLinkDeps {
  supabase: LinkSupabaseLike;
  log?: (message: string, details?: unknown) => void;
  errorLog?: (message: string, details?: unknown) => void;
}

function noop(): void {}

// ============================================================================
// linkExistingStripeSubscription
// ============================================================================

export interface LinkParams {
  userId: string;
  environment: string;
  /** retrieve済み（expand: items.data.price.product 推奨）のサブスクリプション */
  subscription: FullStripeSubscriptionLike;
}

export type LinkResult =
  | {
      linked: true;
      planType: string;
      duration: number;
      subscriptionId: string;
      customerId: string;
    }
  | {
      linked: false;
      reason: "price_unresolved" | "customer_upsert_failed" | "subscription_upsert_failed";
    };

/** standard / feedback はメンバーアクセス権あり（webhook determineMembershipAccess と同義） */
function hasMemberAccess(planType: string): boolean {
  return planType === "standard" || planType === "feedback";
}

/**
 * 検出済みのStripeサブスクからβ DBへリンク（復元）する。
 *
 * 手順:
 * 1. price から plan_type/duration を導出（derivePlanFromPrice）。
 *    導出不能なら **リンク中止** し price情報を errorLog（fail loud）→ price_unresolved。
 * 2. stripe_customers を upsert（user_id+environment）。
 *    webhookイベントの届き先を、実際にサブスクを持つ customer に正す。
 * 3. user_subscriptions を upsert（user_id+environment, is_active=true 等）。
 *
 * DB書き込みが失敗した場合は linked:false を返す（呼び出し側で「復元しました」を返さない）。
 */
export async function linkExistingStripeSubscription(
  deps: SubscriptionLinkDeps,
  params: LinkParams
): Promise<LinkResult> {
  const log = deps.log ?? noop;
  const errorLog = deps.errorLog ?? deps.log ?? noop;
  const { userId, environment, subscription } = params;

  const price = subscription.items?.data?.[0]?.price;

  // 1. price → plan_type/duration 導出（fail loud）
  const plan = derivePlanFromPrice(price);
  if (!plan) {
    errorLog(
      "❌ [subscription-link] priceからplan_type/durationを導出できませんでした。リンクを中止します（standard/1に握り潰さない）",
      {
        userId,
        environment,
        subscriptionId: subscription.id,
        priceId: price?.id,
        unitAmount: price?.unit_amount,
        nickname: price?.nickname,
        recurring: price?.recurring,
        product: price?.product,
      }
    );
    return { linked: false, reason: "price_unresolved" };
  }

  const customerId = subscription.customer;
  const memberAccess = hasMemberAccess(plan.planType);

  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end ?? false;
  const cancelAt = subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000).toISOString()
    : null;

  // 2. stripe_customers を upsert（webhookイベントの届き先を正す）
  const { error: customerError } = await deps.supabase.from("stripe_customers").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      environment,
    },
    { onConflict: "user_id,environment" }
  );

  if (customerError) {
    errorLog("❌ [subscription-link] stripe_customers upsert 失敗", {
      userId,
      customerId,
      error: customerError,
    });
    return { linked: false, reason: "customer_upsert_failed" };
  }

  // 3. user_subscriptions を upsert（is_active=true で復元）
  const { error: subError } = await deps.supabase.from("user_subscriptions").upsert(
    {
      user_id: userId,
      is_active: true,
      plan_type: plan.planType,
      duration: plan.duration,
      plan_members: memberAccess,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
      cancel_at: cancelAt,
      environment,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,environment" }
  );

  if (subError) {
    // stripe_subscription_id+environment のunique制約違反（別user_idに同subが紐付く
    // ねじれ）等で失敗しうる。その場合は「復元しました」を返してはいけない。
    errorLog("❌ [subscription-link] user_subscriptions upsert 失敗", {
      userId,
      subscriptionId: subscription.id,
      error: subError,
    });
    return { linked: false, reason: "subscription_upsert_failed" };
  }

  log("✅ [subscription-link] 既存Stripe契約をβ DBへ復元しました", {
    userId,
    subscriptionId: subscription.id,
    customerId,
    planType: plan.planType,
    duration: plan.duration,
  });

  return {
    linked: true,
    planType: plan.planType,
    duration: plan.duration,
    subscriptionId: subscription.id,
    customerId,
  };
}
