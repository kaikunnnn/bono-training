/**
 * Stripe顧客の名寄せ・解決ロジック（依存注入でテスト可能な純関数群）
 *
 * serve() の副作用から切り離し、`deps`（Stripe / Supabase の薄いインターフェース）を
 * 差し替えることでユニットテスト可能にしている。実SDKもテスト用モックも同じ形で差せる。
 *
 * 【重要】このファイルは esm.sh 等の外部importを持たない（deno test をオフライン・
 * 権限不要で高速に回すため）。必要な型はここでローカル定義する。
 */

// ============================================================================
// 薄い依存インターフェース（index.ts が実際に使うメソッドだけを型定義）
// ============================================================================

/** Stripe Customer の最小形 */
export interface StripeCustomerLike {
  id: string;
  email?: string | null;
  created?: number;
}

/** Stripe Subscription の最小形 */
export interface StripeSubscriptionLike {
  id: string;
  status: string;
  customer: string;
}

/** Stripe クライアントの最小インターフェース */
export interface StripeLike {
  customers: {
    list(params: {
      email: string;
      limit?: number;
    }): Promise<{ data: StripeCustomerLike[] }>;
    create(params: {
      email?: string | null;
      metadata?: Record<string, string>;
    }): Promise<StripeCustomerLike>;
  };
  subscriptions: {
    list(params: {
      customer: string;
      status?: string;
      limit?: number;
    }): Promise<{ data: StripeSubscriptionLike[] }>;
  };
}

/** Supabase クエリ結果の最小形 */
export interface SupabaseResult<T> {
  data: T | null;
  error: unknown | null;
}

/** select().eq()...single() のチェーン */
export interface SupabaseSelectBuilder<T> {
  eq(column: string, value: unknown): SupabaseSelectBuilder<T>;
  single(): Promise<SupabaseResult<T>>;
}

/** from(table) が返すテーブルハンドル */
export interface SupabaseTableLike {
  select(columns: string): SupabaseSelectBuilder<{ stripe_customer_id: string }>;
  upsert(
    values: Record<string, unknown>,
    options?: { onConflict?: string }
  ): Promise<{ error: unknown | null }>;
}

/** Supabase クライアントの最小インターフェース */
export interface SupabaseLike {
  from(table: string): SupabaseTableLike;
}

/** 依存注入コンテナ */
export interface CustomerResolutionDeps {
  stripe: StripeLike;
  supabase: SupabaseLike;
  /** 警告・情報ログ（テストでは差し替え可能。既定は no-op） */
  log?: (message: string, details?: unknown) => void;
}

/** 「契約あり」とみなすStripeサブスクリプションのステータス */
export const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing"] as const;

function noop(): void {}

// ============================================================================
// resolveStripeCustomerId
// ============================================================================

export interface ResolveCustomerParams {
  email?: string | null;
  userId: string;
  environment: string;
}

/**
 * ユーザーのStripe Customer IDを解決する。
 *
 * 手順:
 * 1. `stripe_customers`(user_id, environment) を見る（既存動作維持）。
 * 2. 無ければStripeを email で名寄せし、既存顧客があれば再利用する
 *    （複数ヒット時は「activeサブスク保有 > 最新作成」で選択、WARNログ）。
 * 3. それも無ければ新規作成する。
 * 4. 解決したIDを `stripe_customers` に upsert する。
 */
export async function resolveStripeCustomerId(
  deps: CustomerResolutionDeps,
  params: ResolveCustomerParams
): Promise<string> {
  const log = deps.log ?? noop;
  const { email, userId, environment } = params;

  // 1. DBに保存済みの顧客IDを探す（環境フィルタ付き）
  const { data: customerData, error: customerError } = await deps.supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .eq("environment", environment)
    .single();

  if (!customerError && customerData?.stripe_customer_id) {
    log(`既存のStripe顧客ID ${customerData.stripe_customer_id} をDBから使用します`);
    return customerData.stripe_customer_id;
  }

  // 2. DBに無い場合は Stripe を email で名寄せし、既存顧客があれば再利用する。
  //    Checkoutはデフォルトで毎回新規Customerを作るため、この名寄せをしないと
  //    同一メールで空の重複顧客が量産され、既存の課金リンクが壊れる。
  //    （customers.list は即時・確実。customers.search は反映ラグがあるため使わない）
  if (email) {
    const { data: matches } = await deps.stripe.customers.list({ email, limit: 100 });

    if (matches.length > 0) {
      const chosen = await selectBestCustomer(deps, matches);

      if (matches.length > 1) {
        log(
          `⚠️ 同一メールのStripe顧客が${matches.length}件ヒットしました。` +
            `${chosen.id} を再利用します（規則: activeサブスク保有 > 最新作成）`,
          { email }
        );
      } else {
        log(`同一メールの既存Stripe顧客 ${chosen.id} を再利用します`, { email });
      }

      await upsertCustomerLink(deps, {
        userId,
        environment,
        stripeCustomerId: chosen.id,
      });
      return chosen.id;
    }

    log(`同一メールのStripe顧客が見つからないため新規作成します`, { email });
  } else {
    log(`emailが無いため名寄せをスキップして新規作成します`, { userId });
  }

  // 3. どこにも無ければ新規作成する。
  const created = await deps.stripe.customers.create({
    email,
    metadata: { user_id: userId },
  });
  log(`${userId} のStripe顧客を新規作成しました`, { id: created.id });

  await upsertCustomerLink(deps, { userId, environment, stripeCustomerId: created.id });
  return created.id;
}

/**
 * 複数の候補Stripe顧客から再利用すべき1件を選ぶ。
 * 規則: active/trialing サブスクを持つ顧客を優先し、その中で（無ければ全体で）
 * 最新作成(created最大)を選ぶ。
 */
async function selectBestCustomer(
  deps: CustomerResolutionDeps,
  customers: StripeCustomerLike[]
): Promise<StripeCustomerLike> {
  if (customers.length === 1) return customers[0];

  const withActive: StripeCustomerLike[] = [];
  for (const customer of customers) {
    const subs = await fetchActiveSubsForCustomer(deps, customer.id);
    if (subs.length > 0) withActive.push(customer);
  }

  const pool = withActive.length > 0 ? withActive : customers;
  return pool.reduce((best, candidate) =>
    (candidate.created ?? 0) > (best.created ?? 0) ? candidate : best
  );
}

/**
 * 指定顧客の active/trialing サブスクだけを返す。
 * subscriptions.list は status を1つしか取れないため 'all' で引いてクライアント側で絞る。
 */
async function fetchActiveSubsForCustomer(
  deps: CustomerResolutionDeps,
  customerId: string
): Promise<StripeSubscriptionLike[]> {
  const { data } = await deps.stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });
  return data.filter((s) =>
    (ACTIVE_SUBSCRIPTION_STATUSES as readonly string[]).includes(s.status)
  );
}

async function upsertCustomerLink(
  deps: CustomerResolutionDeps,
  params: { userId: string; environment: string; stripeCustomerId: string }
): Promise<void> {
  const { error } = await deps.supabase.from("stripe_customers").upsert(
    {
      user_id: params.userId,
      stripe_customer_id: params.stripeCustomerId,
      environment: params.environment,
    },
    { onConflict: "user_id,environment" }
  );

  if (error) {
    throw new Error("顧客情報の保存に失敗しました");
  }
}

// ============================================================================
// findActiveStripeSubscriptions
// ============================================================================

export interface FindActiveSubsParams {
  email?: string | null;
}

/**
 * メールに紐づく全Stripe顧客を引き、各顧客のactive/trialingサブスクを集めて返す。
 * DBが未同期(inactive)でもStripe側の実態を見て二重課金を防ぐために使う。
 */
export async function findActiveStripeSubscriptions(
  deps: CustomerResolutionDeps,
  params: FindActiveSubsParams
): Promise<StripeSubscriptionLike[]> {
  const log = deps.log ?? noop;
  const { email } = params;

  if (!email) {
    // emailが無ければ名寄せできないため照会しない（新規作成扱いに委ねる）
    return [];
  }

  // メールに紐づく全Stripe顧客を引き、各顧客の active/trialing サブスクを集める。
  const { data: customers } = await deps.stripe.customers.list({
    email,
    limit: 100,
  });

  const activeSubs: StripeSubscriptionLike[] = [];
  for (const customer of customers) {
    const subs = await fetchActiveSubsForCustomer(deps, customer.id);
    activeSubs.push(...subs);
  }

  if (activeSubs.length > 0) {
    log(
      `⚠️ Stripe側に${activeSubs.length}件のactive/trialingサブスクを検出しました`,
      { email, subscriptionIds: activeSubs.map((s) => s.id) }
    );
  }

  return activeSubs;
}
