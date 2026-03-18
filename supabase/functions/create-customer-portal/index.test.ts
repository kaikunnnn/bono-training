/**
 * Create Customer Portal テスト
 * Purpose: Customer Portal Session作成機能の自動テスト
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import Stripe from "https://esm.sh/stripe@17.7.0";

const TEST_SECRET_KEY = Deno.env.get("STRIPE_TEST_SECRET_KEY") || "";

Deno.test("Test 1: 正しいCustomer IDでPortal Sessionを作成できるか", async () => {
  const stripe = new Stripe(TEST_SECRET_KEY, {
    apiVersion: "2025-06-30.basil" as any,
    httpClient: Stripe.createFetchHttpClient(),
  });

  // テスト用のCustomerを作成
  const customer = await stripe.customers.create({
    email: "test-portal@example.com",
    metadata: { test: "true" },
  });

  // Customer Portal Sessionを作成
  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: "http://localhost:8080/account",
  });

  // アサーション
  assertExists(session.id, "Session IDが存在すること");
  assertExists(session.url, "Portal URLが存在すること");
  assertEquals(session.customer, customer.id, "Customer IDが一致すること");

  // クリーンアップ
  await stripe.customers.del(customer.id);
});

Deno.test("Test 2: return_urlが正しく設定されるか", async () => {
  const stripe = new Stripe(TEST_SECRET_KEY, {
    apiVersion: "2025-06-30.basil" as any,
    httpClient: Stripe.createFetchHttpClient(),
  });

  const customer = await stripe.customers.create({
    email: "test-return-url@example.com",
    metadata: { test: "true" },
  });

  const returnUrl = "http://localhost:8080/subscription";
  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: returnUrl,
  });

  // return_urlの検証
  assertExists(session.return_url, "return_urlが存在すること");
  assertEquals(session.return_url, returnUrl, "return_urlが一致すること");

  await stripe.customers.del(customer.id);
});

Deno.test("Test 3: 無効なCustomer IDでエラーを返すか", async () => {
  const stripe = new Stripe(TEST_SECRET_KEY, {
    apiVersion: "2025-06-30.basil" as any,
    httpClient: Stripe.createFetchHttpClient(),
  });

  let errorOccurred = false;
  try {
    // 存在しないCustomer IDでPortal Session作成
    await stripe.billingPortal.sessions.create({
      customer: "cus_invalid_customer_id_12345",
      return_url: "http://localhost:8080/account",
    });
  } catch (error: any) {
    errorOccurred = true;
    assertExists(error.message, "エラーメッセージが存在すること");
  }

  assertEquals(errorOccurred, true, "無効なCustomer IDでエラーが発生すること");
});

Deno.test("Test 4: 日本語ロケールが設定されるか", async () => {
  const stripe = new Stripe(TEST_SECRET_KEY, {
    apiVersion: "2025-06-30.basil" as any,
    httpClient: Stripe.createFetchHttpClient(),
  });

  const customer = await stripe.customers.create({
    email: "test-locale@example.com",
    metadata: { test: "true" },
  });

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: "http://localhost:8080/account",
    locale: "ja",
  });

  assertExists(session.id, "Session IDが存在すること");
  assertEquals(session.locale, "ja", "ロケールが日本語に設定されること");

  await stripe.customers.del(customer.id);
});
