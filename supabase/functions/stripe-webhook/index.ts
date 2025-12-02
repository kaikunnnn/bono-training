/**
 * Stripe Webhook Handler - LIVE環境専用
 * 本番環境のStripe Webhookイベントを処理します
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createStripeClient, getWebhookSecret } from "../_shared/stripe-helpers.ts";
import Stripe from "https://esm.sh/stripe@17.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 環境変数から環境を取得（デフォルトはtest）
const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';
console.log(`🔍 [DEBUG] STRIPE_MODE env var: ${Deno.env.get('STRIPE_MODE')}`);
console.log(`🔍 [DEBUG] ENVIRONMENT: ${ENVIRONMENT}`);

// プランタイプと金額に基づいてメンバーアクセス権を判定
function determineMembershipAccess(planType: string, amount?: number): boolean {
  // standardとfeedbackプランはメンバーアクセス権あり
  if (planType === "standard" || planType === "feedback") {
    return true;
  } else if (amount) {
    // プランタイプが不明な場合は金額で判断（1000円以上）
    return amount >= 1000;
  }
  return false;
}

serve(async (req) => {
  // Deno環境用のcrypto providerを初期化（Webhook署名検証に必要）
  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  // CORSプリフライトリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // パフォーマンス測定開始
    const requestStartTime = Date.now();
    console.log(`🚀 [LIVE環境] Webhook受信`);

    // Stripe署名を取得
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "署名が見つかりません" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // リクエストボディを読み込む
    const body = await req.text();

    // Stripeクライアントの初期化（本番環境）
    const stripe = createStripeClient(ENVIRONMENT);

    // Webhookシークレットを取得（本番環境）
    const webhookSecret = getWebhookSecret(ENVIRONMENT);

    // イベントを検証
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider  // Deno環境用のcrypto provider
      );
      console.log(`✅ [LIVE環境] Webhook署名検証成功: ${event.type}`);
    } catch (err) {
      console.error(`❌ [LIVE環境] Webhook署名検証エラー: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook署名検証エラー: ${err.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Supabaseクライアントの初期化
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    console.log(`🔍 [DEBUG] SUPABASE_URL: ${supabaseUrl}`);
    console.log(`🔍 [DEBUG] SUPABASE_SERVICE_ROLE_KEY (first 20 chars): ${supabaseServiceKey.substring(0, 20)}...`);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ========================================
    // 🔒 冪等性チェック: 同じイベントを二重処理しない
    // ========================================
    const eventId = event.id;

    // webhook_eventsテーブルで処理済みかチェック
    const { data: existingEvent, error: checkError } = await supabase
      .from("webhook_events")
      .select("event_id")
      .eq("event_id", eventId)
      .eq("environment", ENVIRONMENT)
      .single();

    if (existingEvent) {
      console.log(`⏭️ [LIVE環境] Already processed event: ${eventId}`);
      return new Response(JSON.stringify({ received: true, status: "already_processed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = "not found" なので、それ以外のエラーはログ出力
      console.error(`⚠️ [LIVE環境] webhook_events check error:`, checkError);
    }

    // ========================================
    // 🚀 Phase 6-1: 非同期処理パターン
    // ========================================
    // パフォーマンス測定: リクエスト受信からここまでの時間
    const responseTime = Date.now() - requestStartTime;
    console.log(`⏱️ [LIVE環境] 200レスポンスまでの時間: ${responseTime}ms`);

    // 3. すぐに200を返す（ここまで1秒以内）
    const response = new Response(
      JSON.stringify({ received: true, event_type: event.type }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

    // 4. 重い処理は非同期で実行（Promiseを返さない）
    processWebhookAsync(stripe, supabase, event, eventId, ENVIRONMENT)
      .catch((error) => {
        console.error(`❌ [LIVE環境] Webhook非同期処理エラー:`, error);
        console.error(error.stack);
        // エラーログを記録（将来的にはDB保存も検討）
      });

    return response;
  } catch (error) {
    console.error(`❌ [LIVE環境] Webhookエラー: ${error.message}`);
    console.error(error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

/**
 * ========================================
 * Phase 6-1: 非同期Webhook処理関数
 * ========================================
 * DB更新、Stripe API呼び出しなど重い処理を実行
 * 目標: 3秒以内に完了
 */
async function processWebhookAsync(
  stripe: any,
  supabase: any,
  event: Stripe.Event,
  eventId: string,
  environment: 'test' | 'live'
) {
  const asyncStartTime = Date.now();
  console.log(`🚀 [LIVE環境] 非同期処理開始: ${event.type}`);

  try {
    // イベントタイプに基づいて処理
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripe, supabase, event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(stripe, supabase, event.data.object);
        break;
      case "invoice.paid":
        await handleInvoicePaid(stripe, supabase, event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(stripe, supabase, event.data.object);
        break;
      default:
        console.log(`🚀 [LIVE環境] 処理されないイベント: ${event.type}`);
    }

    // ========================================
    // 🔒 処理完了をwebhook_eventsに記録
    // ========================================
    const { error: saveError } = await supabase
      .from("webhook_events")
      .insert({
        event_id: eventId,
        event_type: event.type,
        environment: environment,
      });

    if (saveError) {
      console.error(`❌ [LIVE環境] webhook_events保存エラー:`, saveError);
      throw saveError; // エラーをcatchブロックで捕捉
    } else {
      console.log(`✅ [LIVE環境] webhook_events保存完了: ${eventId}`);
    }

    // パフォーマンス測定: 非同期処理完了までの時間
    const asyncProcessingTime = Date.now() - asyncStartTime;
    console.log(`⏱️ [LIVE環境] 非同期処理完了時間: ${asyncProcessingTime}ms`);

    // 目標チェック（3秒 = 3000ms）
    if (asyncProcessingTime > 3000) {
      console.warn(`⚠️ [LIVE環境] 非同期処理が目標時間（3000ms）を超過: ${asyncProcessingTime}ms`);
    }

  } catch (error) {
    const asyncProcessingTime = Date.now() - asyncStartTime;

    // ========================================
    // Phase 6-2: 強化されたエラーログ
    // ========================================
    console.error(`❌ [LIVE環境] 非同期処理失敗 (${asyncProcessingTime}ms)`);
    console.error(`📋 エラーコンテキスト:`, {
      event_id: eventId,
      event_type: event.type,
      environment: environment,
      processing_time_ms: asyncProcessingTime,
      error_message: error.message,
      error_stack: error.stack,
    });

    // 詳細エラー情報を記録
    if (error instanceof Error) {
      console.error(`🔍 エラー詳細:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    throw error; // 上位のcatchで捕捉
  }
}

/**
 * チェックアウト完了イベントの処理
 */
async function handleCheckoutCompleted(stripe: any, supabase: any, session: any) {
  console.log("🚀 [LIVE環境] checkout.session.completedイベントを処理中");

  // 🔍 DEBUG: セッションオブジェクトの詳細をログ
  console.log("🔍 DEBUG: session.mode =", session.mode);
  console.log("🔍 DEBUG: session.metadata =", JSON.stringify(session.metadata, null, 2));
  console.log("🔍 DEBUG: session.subscription =", session.subscription);
  console.log("🔍 DEBUG: session.customer =", session.customer);
  console.log("🔍 DEBUG: session.id =", session.id);

  if (session.mode !== "subscription") {
    console.log("❌ サブスクリプションモードではないため、処理をスキップします");
    console.log("   実際のmode:", session.mode);
    return;
  }

  const subscriptionId = session.subscription;
  if (!subscriptionId) {
    console.error("セッションにサブスクリプションIDがありません");
    return;
  }

  try {
    // サブスクリプション詳細を取得
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = subscription.customer as string;
    
    // カスタマーデータを取得
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.error("顧客が削除されています");
      return;
    }

    // メタデータからプラン情報を取得
    const planType = session.metadata?.plan_type || "standard";
    const duration = parseInt(session.metadata?.duration || "1");
    const replaceSubscriptionId = session.metadata?.replace_subscription_id; // 既存サブスクリプションのID

    // 金額情報を取得
    const items = subscription.items.data;
    let amount = 0;
    if (items && items.length > 0 && items[0].price.unit_amount) {
      amount = items[0].price.unit_amount;
    }
    
    // メンバーアクセス権を判定
    const hasMemberAccess = determineMembershipAccess(planType, amount);

    // ユーザーIDを取得
    const userId = session.metadata?.user_id || subscription.metadata?.user_id;
    if (!userId) {
      console.error("ユーザーIDが見つかりません");
      return;
    }

    // === 重複チェック: 既存のアクティブサブスクリプションを確認して非アクティブ化 ===
    console.log(`🚀 [LIVE環境] ユーザー ${userId} の既存アクティブサブスクリプションを確認`);

    const { data: existingActiveSubs, error: checkError } = await supabase
      .from("user_subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .eq("environment", ENVIRONMENT) // 環境フィルタ追加
      .neq("stripe_subscription_id", subscriptionId); // 新しいサブスクリプションは除外

    if (checkError) {
      console.error("既存サブスクリプション確認エラー:", checkError);
    } else if (existingActiveSubs && existingActiveSubs.length > 0) {
      console.warn(`⚠️ [LIVE環境] ユーザー ${userId} に ${existingActiveSubs.length} 件の既存アクティブサブスクリプションが存在します`);

      // 全て非アクティブ化
      for (const oldSub of existingActiveSubs) {
        console.log(`🚀 [LIVE環境] 古いサブスクリプション ${oldSub.stripe_subscription_id} を非アクティブ化`);

        // Stripe側でもキャンセル試行
        try {
          const oldStripeSubscription = await stripe.subscriptions.retrieve(oldSub.stripe_subscription_id);
          if (oldStripeSubscription.status === 'active' || oldStripeSubscription.status === 'trialing') {
            await stripe.subscriptions.cancel(oldSub.stripe_subscription_id, { prorate: true });
            console.log(`✅ [LIVE環境] Stripe側でサブスクリプション ${oldSub.stripe_subscription_id} をキャンセル完了`);
          }
        } catch (stripeError) {
          console.error(`❌ [LIVE環境] Stripe側でのキャンセル失敗 (続行します):`, stripeError);
        }

        // DB更新
        await supabase
          .from("user_subscriptions")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", oldSub.stripe_subscription_id);
      }
    }

    // Stripe顧客情報を保存/更新（環境を含む）
    const { error: customerError } = await supabase
      .from("stripe_customers")
      .upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        environment: ENVIRONMENT // 環境を記録
      }, { onConflict: 'user_id,environment' });

    if (customerError) {
      console.error("🚀 [LIVE環境] 顧客情報の保存エラー:", customerError);
    }

    // user_subscriptionsテーブルにサブスクリプション情報を保存または更新（環境を含む）
    const { error: userSubError } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: userId,
        is_active: true,
        plan_type: planType,
        plan_members: hasMemberAccess,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        duration: duration,
        environment: ENVIRONMENT, // 環境を記録
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,environment' });

    if (userSubError) {
      console.error("🚀 [LIVE環境] ユーザーサブスクリプション情報の保存エラー:", userSubError);
      return;
    }

    // サブスクリプション情報を保存（環境を含む）
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        start_timestamp: new Date(subscription.current_period_start * 1000).toISOString(),
        end_timestamp: new Date(subscription.current_period_end * 1000).toISOString(),
        plan_members: hasMemberAccess,
        environment: ENVIRONMENT // 環境を記録
      });

    if (subscriptionError) {
      console.error("🚀 [LIVE環境] サブスクリプション情報の保存エラー:", subscriptionError);
    } else {
      console.log(`✅ [LIVE環境] ${planType}プラン（${duration}ヶ月）のサブスクリプション情報を正常に保存しました`);
    }

    console.log("🚀 [LIVE環境] 新しいサブスクリプションが作成されました。既存サブスクリプションは上記で処理済みです。");

  } catch (error) {
    // Phase 6-2: 強化されたエラーログ
    console.error("❌ [LIVE環境] チェックアウト完了処理エラー");
    console.error(`📋 エラーコンテキスト:`, {
      event_type: "checkout.session.completed",
      session_id: session.id,
      subscription_id: session.subscription,
      user_id: session.metadata?.user_id || "unknown",
      plan_type: session.metadata?.plan_type || "unknown",
      duration: session.metadata?.duration || "unknown",
      error_message: error.message,
      error_stack: error.stack,
    });
  }
}

/**
 * 請求書支払い完了イベントの処理
 */
async function handleInvoicePaid(stripe: any, supabase: any, invoice: any) {
  console.log("🚀 [LIVE環境] invoice.paidイベントを処理中");
  
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) {
    console.log("請求書にサブスクリプションIDがありません");
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // プラン情報を取得
    const items = subscription.items.data;
    if (!items || items.length === 0) {
      console.error("サブスクリプションにアイテムがありません");
      return;
    }

    const priceId = items[0].price.id;
    let amount = 0;
    if (items[0].price.unit_amount) {
      amount = items[0].price.unit_amount;
    }

    // Price IDからプランタイプと期間を判定（環境に応じた環境変数を使用）
    const envPrefix = ENVIRONMENT === 'test' ? 'STRIPE_TEST_' : 'STRIPE_';
    const STANDARD_1M = Deno.env.get(`${envPrefix}STANDARD_1M_PRICE_ID`);
    const STANDARD_3M = Deno.env.get(`${envPrefix}STANDARD_3M_PRICE_ID`);
    const FEEDBACK_1M = Deno.env.get(`${envPrefix}FEEDBACK_1M_PRICE_ID`);
    const FEEDBACK_3M = Deno.env.get(`${envPrefix}FEEDBACK_3M_PRICE_ID`);

    let planType: string;
    let duration: number;

    if (priceId === STANDARD_1M) {
      planType = "standard";
      duration = 1;
    } else if (priceId === STANDARD_3M) {
      planType = "standard";
      duration = 3;
    } else if (priceId === FEEDBACK_1M) {
      planType = "feedback";
      duration = 1;
    } else if (priceId === FEEDBACK_3M) {
      planType = "feedback";
      duration = 3;
    } else {
      console.warn(`🚀 [LIVE環境] 未知のPrice ID (invoice.paid): ${priceId}`);
      planType = "standard";
      duration = 1;
    }

    const hasMemberAccess = determineMembershipAccess(planType, amount);

    // サブスクリプション情報を更新（環境フィルタ付き）
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .eq("environment", ENVIRONMENT)
      .single();

    if (subError || !subData) {
      console.error("🚀 [LIVE環境] サブスクリプションに紐づくユーザーが見つかりません:", subError);
      return;
    }

    const userId = subData.user_id;

    // データベース内のサブスクリプション情報を更新
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        end_timestamp: new Date(subscription.current_period_end * 1000).toISOString(),
        stripe_invoice_id: invoice.id,
        plan_members: hasMemberAccess
      })
      .eq("stripe_subscription_id", subscriptionId)
      .eq("environment", ENVIRONMENT);

    if (updateError) {
      console.error("🚀 [LIVE環境] サブスクリプション情報の更新エラー:", updateError);
    }

    // 次回更新日とキャンセル情報を取得
    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;
    const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;
    const cancelAt = subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null;

    // user_subscriptionsテーブルも更新
    const { error: userSubError } = await supabase
      .from("user_subscriptions")
      .update({
        is_active: true,
        plan_type: planType,
        duration: duration,
        plan_members: hasMemberAccess,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: cancelAtPeriodEnd,
        cancel_at: cancelAt,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .eq("environment", ENVIRONMENT);

    if (userSubError) {
      console.error("🚀 [LIVE環境] ユーザーサブスクリプション情報の更新エラー:", userSubError);
    } else {
      console.log("✅ [LIVE環境] サブスクリプション更新を正常に処理しました");
    }

  } catch (error) {
    // Phase 6-2: 強化されたエラーログ
    console.error("❌ [LIVE環境] 請求書支払い完了処理エラー");
    console.error(`📋 エラーコンテキスト:`, {
      event_type: "invoice.paid",
      invoice_id: invoice.id,
      subscription_id: invoice.subscription,
      customer_id: invoice.customer,
      amount_paid: invoice.amount_paid,
      error_message: error.message,
      error_stack: error.stack,
    });
  }
}

/**
 * サブスクリプション削除イベントの処理
 */
async function handleSubscriptionDeleted(stripe: any, supabase: any, subscription: any) {
  console.log("🚀 [LIVE環境] customer.subscription.deletedイベントを処理中");

  const subscriptionId = subscription.id;

  try {
    // サブスクリプションに紐づくユーザーを検索
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .eq("environment", ENVIRONMENT)
      .single();

    if (subError || !subData) {
      console.error("🚀 [LIVE環境] サブスクリプションに紐づくユーザーが見つかりません:", subError);
      return;
    }

    const userId = subData.user_id;

    // データベース内のサブスクリプション情報を更新
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        end_timestamp: new Date().toISOString()
      })
      .eq("stripe_subscription_id", subscriptionId)
      .eq("environment", ENVIRONMENT);

    if (updateError) {
      console.error("🚀 [LIVE環境] サブスクリプション情報の更新エラー:", updateError);
    }

    // user_subscriptionsテーブルも更新
    const { error: userSubError } = await supabase
      .from("user_subscriptions")
      .update({
        is_active: false,
        plan_members: false,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .eq("environment", ENVIRONMENT);

    if (userSubError) {
      console.error("🚀 [LIVE環境] ユーザーサブスクリプション情報の更新エラー:", userSubError);
    } else {
      console.log("✅ [LIVE環境] サブスクリプション削除を正常に処理しました");
    }

  } catch (error) {
    // Phase 6-2: 強化されたエラーログ
    console.error("❌ [LIVE環境] サブスクリプション削除処理エラー");
    console.error(`📋 エラーコンテキスト:`, {
      event_type: "customer.subscription.deleted",
      subscription_id: subscription.id,
      customer_id: subscription.customer,
      status: subscription.status,
      error_message: error.message,
      error_stack: error.stack,
    });
  }
}

/**
 * サブスクリプション更新イベントの処理
 * Customer Portalでのプラン変更時に発火
 */
async function handleSubscriptionUpdated(stripe: any, supabase: any, subscription: any) {
  console.log("🚀 [LIVE環境] customer.subscription.updatedイベントを処理中");

  const subscriptionId = subscription.id;
  const customerId = subscription.customer;

  try {
    // サブスクリプションに紐づくユーザーを検索
    const { data: customerData, error: customerError } = await supabase
      .from("stripe_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .eq("environment", ENVIRONMENT)
      .single();

    if (customerError || !customerData) {
      console.error("🚀 [LIVE環境] Stripe顧客に紐づくユーザーが見つかりません:", customerError);
      return;
    }

    const userId = customerData.user_id;

    // 新しいプラン情報を取得
    const items = subscription.items.data;
    if (!items || items.length === 0) {
      console.error("サブスクリプションにアイテムがありません");
      return;
    }

    const priceId = items[0].price.id;
    const amount = items[0].price.unit_amount;

    console.log("🚀 [LIVE環境] プラン変更情報:", { subscriptionId, userId, priceId, amount });

    // Price IDからプランタイプと期間を判定（環境に応じた環境変数を使用）
    let planType: string;
    let duration: number;

    const envPrefix = ENVIRONMENT === 'test' ? 'STRIPE_TEST_' : 'STRIPE_';
    const STANDARD_1M = Deno.env.get(`${envPrefix}STANDARD_1M_PRICE_ID`);
    const STANDARD_3M = Deno.env.get(`${envPrefix}STANDARD_3M_PRICE_ID`);
    const FEEDBACK_1M = Deno.env.get(`${envPrefix}FEEDBACK_1M_PRICE_ID`);
    const FEEDBACK_3M = Deno.env.get(`${envPrefix}FEEDBACK_3M_PRICE_ID`);

    if (priceId === STANDARD_1M) {
      planType = "standard";
      duration = 1;
    } else if (priceId === STANDARD_3M) {
      planType = "standard";
      duration = 3;
    } else if (priceId === FEEDBACK_1M) {
      planType = "feedback"; // グロースプラン1ヶ月
      duration = 1;
    } else if (priceId === FEEDBACK_3M) {
      planType = "feedback"; // グロースプラン3ヶ月
      duration = 3;
    } else {
      console.warn(`🚀 [LIVE環境] 未知のPrice ID: ${priceId}。デフォルトでstandardプランに設定します`);
      planType = "standard";
      duration = 1;
    }

    console.log("🚀 [LIVE環境] 判定結果:", { planType, duration, matchedPriceId: priceId });

    // キャンセル情報を取得
    const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;
    const cancelAt = subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null;

    // 次回更新日を取得
    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

    console.log("🚀 [LIVE環境] サブスクリプション情報:", {
      cancelAtPeriodEnd,
      cancelAt,
      currentPeriodEnd
    });

    // user_subscriptionsテーブルを更新
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        plan_type: planType,
        duration: duration,
        is_active: subscription.status === "active",
        stripe_subscription_id: subscriptionId,
        cancel_at_period_end: cancelAtPeriodEnd,
        cancel_at: cancelAt,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .eq("environment", ENVIRONMENT);

    if (updateError) {
      console.error("🚀 [LIVE環境] user_subscriptions更新エラー:", updateError);
    } else {
      console.log(`✅ [LIVE環境] プラン変更完了: ${planType} (${duration}ヶ月)`);
    }

    // subscriptionsテーブルも更新
    const { error: subUpdateError } = await supabase
      .from("subscriptions")
      .update({
        end_timestamp: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq("stripe_subscription_id", subscriptionId)
      .eq("environment", ENVIRONMENT);

    if (subUpdateError) {
      console.error("🚀 [LIVE環境] subscriptions更新エラー:", subUpdateError);
    }

  } catch (error) {
    // Phase 6-2: 強化されたエラーログ
    console.error("❌ [LIVE環境] サブスクリプション更新処理エラー");
    console.error(`📋 エラーコンテキスト:`, {
      event_type: "customer.subscription.updated",
      subscription_id: subscription.id,
      customer_id: subscription.customer,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      error_message: error.message,
      error_stack: error.stack,
    });
  }
}
