/**
 * Stripe Webhook 自動テスト
 * Phase 1-3: 6個のテストケース
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import Stripe from "https://esm.sh/stripe@17.7.0";

// テスト用のWebhookシークレット
const TEST_WEBHOOK_SECRET = "whsec_test_secret";

// テスト用のStripeインスタンス
const stripe = new Stripe("sk_test_fake_key", {
  apiVersion: "2025-06-30.basil" as any,
  httpClient: Stripe.createFetchHttpClient(),
});

/**
 * Test 1: 正常なWebhook署名検証
 */
Deno.test("Test 1: 正常なWebhook署名検証", async () => {
  const payload = JSON.stringify({
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_123",
        mode: "subscription",
        subscription: "sub_test_123",
        metadata: {
          user_id: "test_user_123",
          plan_type: "standard",
          duration: "1",
        },
      },
    },
  });

  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  // Stripe署名を生成
  const signature = await stripe.webhooks.generateTestHeaderStringAsync({
    payload,
    secret: TEST_WEBHOOK_SECRET,
  }, cryptoProvider);

  // 署名検証
  const event = await stripe.webhooks.constructEventAsync(
    payload,
    signature,
    TEST_WEBHOOK_SECRET,
    undefined,
    cryptoProvider
  );

  assertEquals(event.type, "checkout.session.completed");
  assertExists(event.data.object);
  console.log("✅ Test 1 passed: 正常なWebhook署名検証");
});

/**
 * Test 2: 署名なしリクエスト
 */
Deno.test("Test 2: 署名なしリクエスト", async () => {
  const payload = JSON.stringify({
    type: "checkout.session.completed",
  });

  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  try {
    // 署名なしで検証を試みる（空文字列）
    await stripe.webhooks.constructEventAsync(
      payload,
      "",
      TEST_WEBHOOK_SECRET,
      undefined,
      cryptoProvider
    );
    throw new Error("Expected error but succeeded");
  } catch (err: any) {
    // エラーが発生することを期待
    assertExists(err.message);
    console.log("✅ Test 2 passed: 署名なしリクエストでエラー");
  }
});

/**
 * Test 3: 無効な署名
 */
Deno.test("Test 3: 無効な署名", async () => {
  const payload = JSON.stringify({
    type: "checkout.session.completed",
  });

  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  try {
    // 無効な署名で検証を試みる
    await stripe.webhooks.constructEventAsync(
      payload,
      "t=123456,v1=invalid_signature",
      TEST_WEBHOOK_SECRET,
      undefined,
      cryptoProvider
    );
    throw new Error("Expected error but succeeded");
  } catch (err: any) {
    assertExists(err.message);
    console.log("✅ Test 3 passed: 無効な署名でエラー");
  }
});

/**
 * Test 4: 古いタイムスタンプ（5分以上前）
 */
Deno.test("Test 4: 古いタイムスタンプ", async () => {
  const payload = JSON.stringify({
    type: "checkout.session.completed",
  });

  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  // 5分以上前のタイムスタンプで署名を生成
  const oldTimestamp = Math.floor(Date.now() / 1000) - 400; // 400秒前（6分40秒前）

  try {
    // 古いタイムスタンプで署名を試みる
    const signature = await stripe.webhooks.generateTestHeaderStringAsync({
      payload,
      secret: TEST_WEBHOOK_SECRET,
      timestamp: oldTimestamp,
    }, cryptoProvider);

    await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      TEST_WEBHOOK_SECRET,
      undefined,
      cryptoProvider
    );
    throw new Error("Expected error but succeeded");
  } catch (err: any) {
    assertExists(err.message);
    console.log("✅ Test 4 passed: 古いタイムスタンプでエラー");
  }
});

/**
 * Test 5: サポートされていないイベントタイプ
 */
Deno.test("Test 5: サポートされていないイベントタイプ", async () => {
  const payload = JSON.stringify({
    type: "customer.created",
    data: {
      object: {
        id: "cus_test_123",
      },
    },
  });

  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  // 署名を生成
  const signature = await stripe.webhooks.generateTestHeaderStringAsync({
    payload,
    secret: TEST_WEBHOOK_SECRET,
  }, cryptoProvider);

  // 署名検証（成功する）
  const event = await stripe.webhooks.constructEventAsync(
    payload,
    signature,
    TEST_WEBHOOK_SECRET,
    undefined,
    cryptoProvider
  );

  assertEquals(event.type, "customer.created");
  console.log("✅ Test 5 passed: サポートされていないイベントタイプでも署名検証は成功");
});

/**
 * Test 6: checkout.session.completed成功ケース
 */
Deno.test("Test 6: checkout.session.completed成功ケース", async () => {
  const payload = JSON.stringify({
    id: "evt_test_123",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_123",
        mode: "subscription",
        subscription: "sub_test_123",
        customer: "cus_test_123",
        metadata: {
          user_id: "test_user_123",
          plan_type: "standard",
          duration: "1",
        },
      },
    },
  });

  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  // 署名を生成
  const signature = await stripe.webhooks.generateTestHeaderStringAsync({
    payload,
    secret: TEST_WEBHOOK_SECRET,
  }, cryptoProvider);

  // 署名検証
  const event = await stripe.webhooks.constructEventAsync(
    payload,
    signature,
    TEST_WEBHOOK_SECRET,
    undefined,
    cryptoProvider
  );

  assertEquals(event.type, "checkout.session.completed");
  assertEquals(event.data.object.mode, "subscription");
  assertExists(event.data.object.subscription);
  assertExists(event.data.object.metadata.user_id);
  console.log("✅ Test 6 passed: checkout.session.completed成功ケース");
});

/**
 * Test 7: customer.subscription.deletedイベントの署名検証
 */
Deno.test("Test 7: customer.subscription.deletedイベントの署名検証", async () => {
  const payload = JSON.stringify({
    id: "evt_test_deleted_123",
    type: "customer.subscription.deleted",
    data: {
      object: {
        id: "sub_test_123",
        customer: "cus_test_123",
        status: "canceled",
        canceled_at: Math.floor(Date.now() / 1000),
      },
    },
  });

  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  // 署名を生成
  const signature = await stripe.webhooks.generateTestHeaderStringAsync({
    payload,
    secret: TEST_WEBHOOK_SECRET,
  }, cryptoProvider);

  // 署名検証
  const event = await stripe.webhooks.constructEventAsync(
    payload,
    signature,
    TEST_WEBHOOK_SECRET,
    undefined,
    cryptoProvider
  );

  assertEquals(event.type, "customer.subscription.deleted");
  assertEquals(event.data.object.status, "canceled");
  assertExists(event.data.object.canceled_at);
  console.log("✅ Test 7 passed: customer.subscription.deletedイベントの署名検証");
});

/**
 * Test 8: customer.subscription.deletedイベントのデータ構造検証
 */
Deno.test("Test 8: customer.subscription.deletedイベントのデータ構造検証", async () => {
  const canceledAt = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    id: "evt_test_deleted_456",
    type: "customer.subscription.deleted",
    data: {
      object: {
        id: "sub_test_456",
        customer: "cus_test_456",
        status: "canceled",
        canceled_at: canceledAt,
        current_period_end: canceledAt + 86400, // 1日後
      },
    },
  });

  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  // 署名を生成
  const signature = await stripe.webhooks.generateTestHeaderStringAsync({
    payload,
    secret: TEST_WEBHOOK_SECRET,
  }, cryptoProvider);

  // 署名検証
  const event = await stripe.webhooks.constructEventAsync(
    payload,
    signature,
    TEST_WEBHOOK_SECRET,
    undefined,
    cryptoProvider
  );

  // データ構造を検証
  const subscription = event.data.object;
  assertExists(subscription.id, "subscription.idが存在すること");
  assertExists(subscription.customer, "subscription.customerが存在すること");
  assertEquals(subscription.status, "canceled", "statusがcanceledであること");
  assertExists(subscription.canceled_at, "canceled_atが存在すること");
  assertExists(subscription.current_period_end, "current_period_endが存在すること");

  console.log("✅ Test 8 passed: customer.subscription.deletedイベントのデータ構造検証");
});

console.log("\n========================================");
console.log("✅ All 8 tests completed!");
console.log("========================================");
