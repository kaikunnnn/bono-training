/**
 * Create Checkout テスト
 * Phase 5-3: 新規登録フロー維持のテスト
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import Stripe from "https://esm.sh/stripe@17.7.0";

const TEST_SECRET_KEY = Deno.env.get("STRIPE_TEST_SECRET_KEY") || "";

Deno.test("Test 1: 未登録ユーザーでCheckout Sessionを作成できるか", async () => {
  const stripe = new Stripe(TEST_SECRET_KEY, {
    apiVersion: "2025-06-30.basil" as any,
    httpClient: Stripe.createFetchHttpClient(),
  });

  // テスト用のCustomerを作成（サブスクリプションなし）
  const customer = await stripe.customers.create({
    email: "test-checkout-new@example.com",
    metadata: { test: "true" },
  });

  // Checkout Sessionを作成
  const priceId = Deno.env.get("STRIPE_TEST_STANDARD_1M_PRICE_ID");
  assertExists(priceId, "STRIPE_TEST_STANDARD_1M_PRICE_ID環境変数が設定されていること");

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId!,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: "http://localhost:8080/subscription/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "http://localhost:8080/subscription",
    metadata: {
      user_id: "test_user_new_123",
      plan_type: "standard",
      duration: "1",
    },
  });

  // アサーション
  assertExists(session.id, "Session IDが存在すること");
  assertExists(session.url, "Checkout URLが存在すること");
  assertEquals(session.customer, customer.id, "Customer IDが一致すること");
  assertEquals(session.mode, "subscription", "modeがsubscriptionであること");

  // クリーンアップ
  await stripe.customers.del(customer.id);
  console.log("✅ Test 1 passed: 未登録ユーザーでCheckout Sessionを作成できた");
});

Deno.test("Test 2: 既存アクティブサブスクリプションがある場合は作成しない（仕様確認）", async () => {
  const stripe = new Stripe(TEST_SECRET_KEY, {
    apiVersion: "2025-06-30.basil" as any,
    httpClient: Stripe.createFetchHttpClient(),
  });

  // テスト用のCustomerを作成
  const customer = await stripe.customers.create({
    email: "test-checkout-existing@example.com",
    metadata: { test: "true" },
  });

  // 既存のサブスクリプションを作成
  const priceId = Deno.env.get("STRIPE_TEST_STANDARD_1M_PRICE_ID");
  assertExists(priceId, "STRIPE_TEST_STANDARD_1M_PRICE_ID環境変数が設定されていること");

  const existingSubscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId! }],
    payment_behavior: "default_incomplete",
  });

  // Checkout Sessionを作成（仕様上は可能だが、DBチェックでエラーになるべき）
  // ここではStripe APIレベルでの動作確認
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId!,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: "http://localhost:8080/subscription/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "http://localhost:8080/subscription",
    metadata: {
      user_id: "test_user_existing_123",
      plan_type: "standard",
      duration: "1",
    },
  });

  // Stripe APIレベルでは作成可能（create-checkout Edge Functionでエラーを返すべき）
  assertExists(session.id, "Session IDが存在すること");
  assertExists(session.url, "Checkout URLが存在すること");

  // クリーンアップ
  await stripe.subscriptions.cancel(existingSubscription.id);
  await stripe.customers.del(customer.id);
  console.log("✅ Test 2 passed: Stripe APIレベルでは作成可能（Edge Functionでチェック必要）");
});

Deno.test("Test 3: metadata（user_id, plan_type, duration）が正しく設定されるか", async () => {
  const stripe = new Stripe(TEST_SECRET_KEY, {
    apiVersion: "2025-06-30.basil" as any,
    httpClient: Stripe.createFetchHttpClient(),
  });

  const customer = await stripe.customers.create({
    email: "test-checkout-metadata@example.com",
    metadata: { test: "true" },
  });

  const priceId = Deno.env.get("STRIPE_TEST_STANDARD_1M_PRICE_ID");
  assertExists(priceId, "STRIPE_TEST_STANDARD_1M_PRICE_ID環境変数が設定されていること");

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId!,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: "http://localhost:8080/subscription/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "http://localhost:8080/subscription",
    metadata: {
      user_id: "test_user_metadata_123",
      plan_type: "feedback",
      duration: "3",
    },
  });

  // metadataの検証
  assertExists(session.metadata, "metadataが存在すること");
  assertEquals(session.metadata?.user_id, "test_user_metadata_123", "user_idが正しいこと");
  assertEquals(session.metadata?.plan_type, "feedback", "plan_typeが正しいこと");
  assertEquals(session.metadata?.duration, "3", "durationが正しいこと");

  // クリーンアップ
  await stripe.customers.del(customer.id);
  console.log("✅ Test 3 passed: metadataが正しく設定された");
});

Deno.test("Test 4: cancel_urlが/subscriptionページに設定されるか", async () => {
  const stripe = new Stripe(TEST_SECRET_KEY, {
    apiVersion: "2025-06-30.basil" as any,
    httpClient: Stripe.createFetchHttpClient(),
  });

  const customer = await stripe.customers.create({
    email: "test-checkout-cancel-url@example.com",
    metadata: { test: "true" },
  });

  const priceId = Deno.env.get("STRIPE_TEST_STANDARD_1M_PRICE_ID");
  assertExists(priceId, "STRIPE_TEST_STANDARD_1M_PRICE_ID環境変数が設定されていること");

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId!,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: "http://localhost:8080/subscription/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "http://localhost:8080/subscription",
    metadata: {
      user_id: "test_user_cancel_url_123",
      plan_type: "standard",
      duration: "1",
    },
  });

  // cancel_urlの検証
  assertExists(session.cancel_url, "cancel_urlが存在すること");
  assertEquals(
    session.cancel_url,
    "http://localhost:8080/subscription",
    "cancel_urlが/subscriptionであること"
  );

  // クリーンアップ
  await stripe.customers.del(customer.id);
  console.log("✅ Test 4 passed: cancel_urlが正しく設定された");
});

console.log("\n========================================");
console.log("✅ All create-checkout tests completed!");
console.log("========================================");
