/**
 * customer-resolution（S2/S5）の回帰テスト
 *
 * gitに未コミットだった v180 の customer-resolution.ts の挙動を固定する。
 * オフライン・外部import無し（DIでStripe/Supabaseをモック）。
 *
 * 実行: deno test supabase/functions/create-checkout/customer-resolution.test.ts
 */

import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  resolveStripeCustomerId,
  findActiveStripeSubscriptions,
  type CustomerResolutionDeps,
  type StripeCustomerLike,
  type StripeSubscriptionLike,
  type StripeLike,
  type SupabaseLike,
} from "./customer-resolution.ts";

// ============================================================================
// モック
// ============================================================================

interface StripeMockConfig {
  /** customers.list({email}) が返す顧客 */
  listCustomers?: StripeCustomerLike[];
  /** customers.create が返す新規顧客 */
  createReturns?: StripeCustomerLike;
  /** customerId → サブスク一覧（subscriptions.list） */
  subsByCustomer?: Record<string, StripeSubscriptionLike[]>;
}

function makeStripeMock(config: StripeMockConfig) {
  const createCalls: Array<{ email?: string | null }> = [];
  const listCalls: Array<{ email: string }> = [];

  const stripe: StripeLike = {
    customers: {
      list(params) {
        listCalls.push({ email: params.email });
        return Promise.resolve({ data: config.listCustomers ?? [] });
      },
      create(params) {
        createCalls.push({ email: params.email });
        return Promise.resolve(
          config.createReturns ?? { id: "cus_NEW", email: params.email }
        );
      },
    },
    subscriptions: {
      list(params) {
        const data = config.subsByCustomer?.[params.customer] ?? [];
        return Promise.resolve({ data });
      },
    },
  };

  return { stripe, createCalls, listCalls };
}

interface SupabaseMockConfig {
  /** single() が返す stripe_customers 行（DBヒット）。null ならミス */
  dbCustomer?: { stripe_customer_id: string } | null;
  dbError?: unknown | null;
  /** upsert が返すエラー */
  upsertError?: unknown | null;
}

function makeSupabaseMock(config: SupabaseMockConfig) {
  const upsertCalls: Array<{ values: Record<string, unknown>; onConflict?: string }> = [];

  const supabase: SupabaseLike = {
    from(_table: string) {
      const builder = {
        select() {
          return builder as never;
        },
        eq() {
          return builder as never;
        },
        single() {
          return Promise.resolve({
            data: config.dbCustomer ?? null,
            error: config.dbError ?? (config.dbCustomer ? null : { message: "not found" }),
          });
        },
        upsert(values: Record<string, unknown>, options?: { onConflict?: string }) {
          upsertCalls.push({ values, onConflict: options?.onConflict });
          return Promise.resolve({ error: config.upsertError ?? null });
        },
      };
      return builder as never;
    },
  };

  return { supabase, upsertCalls };
}

function makeDeps(stripe: StripeLike, supabase: SupabaseLike): CustomerResolutionDeps {
  return { stripe, supabase, log: () => {} };
}

// ============================================================================
// resolveStripeCustomerId
// ============================================================================

Deno.test("resolve: DBに顧客があればそれを返し Stripeを呼ばない", async () => {
  const { stripe, listCalls, createCalls } = makeStripeMock({});
  const { supabase, upsertCalls } = makeSupabaseMock({
    dbCustomer: { stripe_customer_id: "cus_DB" },
  });

  const id = await resolveStripeCustomerId(makeDeps(stripe, supabase), {
    email: "a@example.com",
    userId: "user_1",
    environment: "live",
  });

  assertEquals(id, "cus_DB");
  assertEquals(listCalls.length, 0);
  assertEquals(createCalls.length, 0);
  assertEquals(upsertCalls.length, 0);
});

Deno.test("resolve: DBミス+emailで既存1件ヒット → 再利用し stripe_customers にupsert", async () => {
  const { stripe, createCalls } = makeStripeMock({
    listCustomers: [{ id: "cus_EXISTING", email: "a@example.com", created: 100 }],
  });
  const { supabase, upsertCalls } = makeSupabaseMock({ dbCustomer: null });

  const id = await resolveStripeCustomerId(makeDeps(stripe, supabase), {
    email: "a@example.com",
    userId: "user_1",
    environment: "live",
  });

  assertEquals(id, "cus_EXISTING");
  assertEquals(createCalls.length, 0); // 新規作成しない（重複防止）
  assertEquals(upsertCalls.length, 1);
  assertEquals(upsertCalls[0].values.stripe_customer_id, "cus_EXISTING");
  assertEquals(upsertCalls[0].onConflict, "user_id,environment");
});

Deno.test("resolve: 複数ヒットは activeサブスク保有 > 最新作成 で選ぶ", async () => {
  // cus_OLD(created100, activeなし) / cus_ACTIVE(created50, active有) / cus_NEW(created200, activeなし)
  const { stripe } = makeStripeMock({
    listCustomers: [
      { id: "cus_OLD", created: 100 },
      { id: "cus_ACTIVE", created: 50 },
      { id: "cus_NEW", created: 200 },
    ],
    subsByCustomer: {
      cus_ACTIVE: [{ id: "sub_1", status: "active", customer: "cus_ACTIVE" }],
    },
  });
  const { supabase } = makeSupabaseMock({ dbCustomer: null });

  const id = await resolveStripeCustomerId(makeDeps(stripe, supabase), {
    email: "a@example.com",
    userId: "user_1",
    environment: "live",
  });

  // active保有が最優先（created が最大でなくても cus_ACTIVE）
  assertEquals(id, "cus_ACTIVE");
});

Deno.test("resolve: 複数ヒットで誰もactiveを持たない → 最新作成(created最大)を選ぶ", async () => {
  const { stripe } = makeStripeMock({
    listCustomers: [
      { id: "cus_OLD", created: 100 },
      { id: "cus_NEW", created: 200 },
    ],
    subsByCustomer: {},
  });
  const { supabase } = makeSupabaseMock({ dbCustomer: null });

  const id = await resolveStripeCustomerId(makeDeps(stripe, supabase), {
    email: "a@example.com",
    userId: "user_1",
    environment: "live",
  });

  assertEquals(id, "cus_NEW");
});

Deno.test("resolve: DBミス+email名寄せもゼロ → 新規作成して upsert", async () => {
  const { stripe, createCalls } = makeStripeMock({
    listCustomers: [],
    createReturns: { id: "cus_CREATED", email: "a@example.com" },
  });
  const { supabase, upsertCalls } = makeSupabaseMock({ dbCustomer: null });

  const id = await resolveStripeCustomerId(makeDeps(stripe, supabase), {
    email: "a@example.com",
    userId: "user_1",
    environment: "live",
  });

  assertEquals(id, "cus_CREATED");
  assertEquals(createCalls.length, 1);
  assertEquals(upsertCalls.length, 1);
  assertEquals(upsertCalls[0].values.stripe_customer_id, "cus_CREATED");
});

Deno.test("resolve: emailが無ければ名寄せをスキップして新規作成", async () => {
  const { stripe, listCalls, createCalls } = makeStripeMock({
    createReturns: { id: "cus_NOEMAIL" },
  });
  const { supabase } = makeSupabaseMock({ dbCustomer: null });

  const id = await resolveStripeCustomerId(makeDeps(stripe, supabase), {
    email: null,
    userId: "user_1",
    environment: "live",
  });

  assertEquals(id, "cus_NOEMAIL");
  assertEquals(listCalls.length, 0); // email無し→list呼ばない
  assertEquals(createCalls.length, 1);
});

Deno.test("resolve: upsert失敗時は例外を投げる", async () => {
  const { stripe } = makeStripeMock({
    listCustomers: [{ id: "cus_EXISTING", created: 100 }],
  });
  const { supabase } = makeSupabaseMock({
    dbCustomer: null,
    upsertError: { message: "db down" },
  });

  await assertRejects(
    () =>
      resolveStripeCustomerId(makeDeps(stripe, supabase), {
        email: "a@example.com",
        userId: "user_1",
        environment: "live",
      }),
    Error,
    "顧客情報の保存に失敗しました"
  );
});

// ============================================================================
// findActiveStripeSubscriptions
// ============================================================================

Deno.test("findActive: emailが無ければ [] を返す（名寄せしない）", async () => {
  const { stripe } = makeStripeMock({});
  const { supabase } = makeSupabaseMock({});
  const subs = await findActiveStripeSubscriptions(makeDeps(stripe, supabase), {
    email: null,
  });
  assertEquals(subs, []);
});

Deno.test("findActive: 顧客ゼロなら []", async () => {
  const { stripe } = makeStripeMock({ listCustomers: [] });
  const { supabase } = makeSupabaseMock({});
  const subs = await findActiveStripeSubscriptions(makeDeps(stripe, supabase), {
    email: "a@example.com",
  });
  assertEquals(subs, []);
});

Deno.test("findActive: 複数顧客の active/trialing のみを収集（canceled等は除外）", async () => {
  const { stripe } = makeStripeMock({
    listCustomers: [{ id: "cus_A" }, { id: "cus_B" }],
    subsByCustomer: {
      cus_A: [
        { id: "sub_active", status: "active", customer: "cus_A" },
        { id: "sub_canceled", status: "canceled", customer: "cus_A" },
      ],
      cus_B: [
        { id: "sub_trialing", status: "trialing", customer: "cus_B" },
        { id: "sub_pastdue", status: "past_due", customer: "cus_B" },
      ],
    },
  });
  const { supabase } = makeSupabaseMock({});

  const subs = await findActiveStripeSubscriptions(makeDeps(stripe, supabase), {
    email: "a@example.com",
  });

  const ids = subs.map((s) => s.id).sort();
  assertEquals(ids, ["sub_active", "sub_trialing"]);
});
