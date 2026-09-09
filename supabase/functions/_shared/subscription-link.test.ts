/**
 * linkExistingStripeSubscription（S3）のユニットテスト
 *   - オフライン・外部import無し（DIでSupabaseをモック）
 *   - 成功 / price解決不能 / customer upsert失敗 / subscription upsert失敗 を網羅
 *
 * 実行: deno test supabase/functions/_shared/subscription-link.test.ts
 */

import {
  assertEquals,
} from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  linkExistingStripeSubscription,
  type FullStripeSubscriptionLike,
  type LinkSupabaseLike,
} from "./subscription-link.ts";

interface UpsertCall {
  table: string;
  values: Record<string, unknown>;
  onConflict?: string;
}

/** 各テーブルの upsert を記録し、指定テーブルはエラーを返すモック */
function makeSupabaseMock(errorTables: Set<string> = new Set()) {
  const calls: UpsertCall[] = [];
  const supabase: LinkSupabaseLike = {
    from(table: string) {
      return {
        upsert(
          values: Record<string, unknown>,
          options?: { onConflict?: string }
        ) {
          calls.push({ table, values, onConflict: options?.onConflict });
          return Promise.resolve({
            error: errorTables.has(table) ? { message: `mock error on ${table}` } : null,
          });
        },
      };
    },
  };
  return { supabase, calls };
}

function makeSubscription(
  price: FullStripeSubscriptionLike["items"]["data"][number]["price"]
): FullStripeSubscriptionLike {
  return {
    id: "sub_TEST",
    status: "active",
    customer: "cus_TEST",
    current_period_end: 1893456000, // 2030-01-01
    cancel_at_period_end: false,
    cancel_at: null,
    items: { data: [{ price }] },
  };
}

Deno.test("成功: 単一active → stripe_customers と user_subscriptions を upsert し linked:true", async () => {
  const errorLogs: unknown[][] = [];
  const { supabase, calls } = makeSupabaseMock();

  const result = await linkExistingStripeSubscription(
    { supabase, errorLog: (m, d) => errorLogs.push([m, d]) },
    {
      userId: "user_1",
      environment: "live",
      subscription: makeSubscription({
        id: "price_std1",
        unit_amount: 680000,
        recurring: { interval: "month", interval_count: 1 },
      }),
    }
  );

  assertEquals(result.linked, true);
  if (result.linked) {
    assertEquals(result.planType, "standard");
    assertEquals(result.duration, 1);
    assertEquals(result.customerId, "cus_TEST");
    assertEquals(result.subscriptionId, "sub_TEST");
  }

  // 2テーブルとも upsert された
  assertEquals(calls.length, 2);
  assertEquals(calls[0].table, "stripe_customers");
  assertEquals(calls[0].onConflict, "user_id,environment");
  assertEquals(calls[0].values.stripe_customer_id, "cus_TEST");

  assertEquals(calls[1].table, "user_subscriptions");
  assertEquals(calls[1].onConflict, "user_id,environment");
  assertEquals(calls[1].values.is_active, true);
  assertEquals(calls[1].values.plan_type, "standard");
  assertEquals(calls[1].values.duration, 1);
  assertEquals(calls[1].values.plan_members, true);
  assertEquals(calls[1].values.stripe_subscription_id, "sub_TEST");
  assertEquals(calls[1].values.stripe_customer_id, "cus_TEST");

  // 成功時に errorLog は呼ばれない
  assertEquals(errorLogs.length, 0);
});

Deno.test("成功: feedback plan は plan_members:true / duration は price由来", async () => {
  const { supabase, calls } = makeSupabaseMock();
  const result = await linkExistingStripeSubscription(
    { supabase },
    {
      userId: "user_2",
      environment: "live",
      subscription: makeSubscription({
        id: "price_fb3",
        unit_amount: 4140000,
        recurring: { interval: "month", interval_count: 3 },
      }),
    }
  );
  assertEquals(result.linked, true);
  if (result.linked) {
    assertEquals(result.planType, "feedback");
    assertEquals(result.duration, 3);
  }
  assertEquals(calls[1].values.plan_members, true);
  assertEquals(calls[1].values.duration, 3);
});

Deno.test("price解決不能: リンク中止・DBは一切書かず errorLog を出す → price_unresolved", async () => {
  const errorLogs: unknown[][] = [];
  const { supabase, calls } = makeSupabaseMock();

  const result = await linkExistingStripeSubscription(
    { supabase, errorLog: (m, d) => errorLogs.push([m, d]) },
    {
      userId: "user_3",
      environment: "live",
      subscription: makeSubscription({
        id: "price_ambiguous",
        unit_amount: 2640000, // plan_type不明 → derivePlanFromPrice が null
        recurring: { interval: "month", interval_count: 3 },
      }),
    }
  );

  assertEquals(result.linked, false);
  if (!result.linked) assertEquals(result.reason, "price_unresolved");

  // DB書き込みは発生しない
  assertEquals(calls.length, 0);
  // fail loud: errorLog が呼ばれ price 情報を含む
  assertEquals(errorLogs.length, 1);
});

Deno.test("customer upsert 失敗 → user_subscriptions は書かず customer_upsert_failed", async () => {
  const { supabase, calls } = makeSupabaseMock(new Set(["stripe_customers"]));
  const result = await linkExistingStripeSubscription(
    { supabase },
    {
      userId: "user_4",
      environment: "live",
      subscription: makeSubscription({
        id: "price_std1",
        unit_amount: 680000,
        recurring: { interval: "month", interval_count: 1 },
      }),
    }
  );
  assertEquals(result.linked, false);
  if (!result.linked) assertEquals(result.reason, "customer_upsert_failed");
  // stripe_customers だけ試行、user_subscriptions は試行しない
  assertEquals(calls.length, 1);
  assertEquals(calls[0].table, "stripe_customers");
});

Deno.test("subscription upsert 失敗（ねじれ等）→ subscription_upsert_failed（復元と誤報しない）", async () => {
  const { supabase, calls } = makeSupabaseMock(new Set(["user_subscriptions"]));
  const result = await linkExistingStripeSubscription(
    { supabase },
    {
      userId: "user_5",
      environment: "live",
      subscription: makeSubscription({
        id: "price_std1",
        unit_amount: 680000,
        recurring: { interval: "month", interval_count: 1 },
      }),
    }
  );
  assertEquals(result.linked, false);
  if (!result.linked) assertEquals(result.reason, "subscription_upsert_failed");
  // 両テーブル試行（customer成功→sub失敗）
  assertEquals(calls.length, 2);
  assertEquals(calls[1].table, "user_subscriptions");
});
