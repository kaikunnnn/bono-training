/**
 * Stripe Webhook Handler - TEST環境専用
 * テスト環境のStripe Webhookイベントを処理します
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getSupabaseSecretKey } from "../_shared/supabase-keys.ts";
import { createStripeClient, getWebhookSecret } from "../_shared/stripe-helpers.ts";
import { getPlanInfo } from "../_shared/plan-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 環境変数から環境を取得（デフォルトはtest）
const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';

// プランタイプに基づいてメンバーアクセス権を判定
function determineMembershipAccess(planType: string): boolean {
  // standardとfeedbackプランはメンバーアクセス権あり
  return planType === "standard" || planType === "feedback";
}

Deno.serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const envLabel = ENVIRONMENT === 'test' ? '🧪 [TEST環境]' : '🚀 [本番環境]';
    console.log(`${envLabel} Webhook受信`);

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

    // Stripeクライアントの初期化（テスト環境）
    const stripe = createStripeClient(ENVIRONMENT);

    // Webhookシークレットを取得（テスト環境）
    const webhookSecret = getWebhookSecret(ENVIRONMENT);

    // イベントを検証
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log(`✅ [TEST環境] Webhook署名検証成功: ${event.type}`);
    } catch (err) {
      console.error(`❌ [TEST環境] Webhook署名検証エラー: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook署名検証エラー: ${err.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Supabaseクライアントの初期化
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = getSupabaseSecretKey();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🧪 [TEST環境] 処理中のイベント: ${event.type}`);

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
        console.log(`🧪 [TEST環境] 処理されないイベント: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`❌ [TEST環境] Webhookエラー: ${error.message}`);
    console.error(error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

/**
 * チェックアウト完了イベントの処理
 */
async function handleCheckoutCompleted(stripe: any, supabase: any, session: any) {
  console.log("🧪 [TEST環境] checkout.session.completedイベントを処理中");

  if (session.mode !== "subscription") {
    console.log("サブスクリプションモードではないため、処理をスキップします");
    return;
  }

  const subscriptionId = session.subscription;
  if (!subscriptionId) {
    console.error("セッションにサブスクリプションIDがありません");
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = subscription.customer as string;

    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.error("顧客が削除されています");
      return;
    }

    // Stripe Price ID から plan_type と duration を判定（metadata は使用しない）
    const priceId = subscription.items.data[0]?.price?.id;
    if (!priceId) {
      console.error("Price ID が見つかりません");
      return;
    }

    const planInfo = getPlanInfo(priceId);
    const planType = planInfo.planType;
    const duration = planInfo.duration;

    console.log(`🧪 [TEST環境] Price ID: ${priceId} → plan_type: ${planType}, duration: ${duration}`);

    const userId = session.metadata?.user_id || subscription.metadata?.user_id;

    if (!userId) {
      console.error("ユーザーIDが見つかりません");
      return;
    }

    const items = subscription.items.data;
    let amount = 0;
    if (items && items.length > 0 && items[0].price.unit_amount) {
      amount = items[0].price.unit_amount;
    }

    const hasMemberAccess = determineMembershipAccess(planType);

    // 既存のアクティブサブスクリプションを非アクティブ化
    console.log(`🧪 [TEST環境] ユーザー ${userId} の既存アクティブサブスクリプションを確認`);

    const { data: existingActiveSubs, error: checkError } = await supabase
      .from("user_subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .eq("environment", ENVIRONMENT) // 環境フィルタ追加
      .neq("stripe_subscription_id", subscriptionId);

    if (checkError) {
      console.error("既存サブスクリプション確認エラー:", checkError);
    } else if (existingActiveSubs && existingActiveSubs.length > 0) {
      console.warn(`⚠️ [TEST環境] ユーザー ${userId} に ${existingActiveSubs.length} 件の既存アクティブサブスクリプションが存在します`);

      for (const oldSub of existingActiveSubs) {
        console.log(`🧪 [TEST環境] 古いサブスクリプション ${oldSub.stripe_subscription_id} を非アクティブ化`);

        try {
          const oldStripeSubscription = await stripe.subscriptions.retrieve(oldSub.stripe_subscription_id);
          if (oldStripeSubscription.status === 'active' || oldStripeSubscription.status === 'trialing') {
            await stripe.subscriptions.cancel(oldSub.stripe_subscription_id, { prorate: true });
            console.log(`✅ [TEST環境] Stripe側でサブスクリプション ${oldSub.stripe_subscription_id} をキャンセル完了`);
          }
        } catch (stripeError) {
          console.error(`❌ [TEST環境] Stripe側でのキャンセル失敗 (続行します):`, stripeError);
        }

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
      console.error("🧪 [TEST環境] 顧客情報の保存エラー:", customerError);
    }

    // user_subscriptionsテーブルにサブスクリプション情報を保存（環境を含む）
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
      console.error("🧪 [TEST環境] ユーザーサブスクリプション情報の保存エラー:", userSubError);
      return;
    }

    // subscriptionsテーブルにサブスクリプション情報を保存（環境を含む）
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
      console.error("🧪 [TEST環境] サブスクリプション情報の保存エラー:", subscriptionError);
    } else {
      console.log(`✅ [TEST環境] ${planType}プラン（${duration}ヶ月）のサブスクリプション情報を正常に保存しました`);
    }

  } catch (error) {
    console.error("🧪 [TEST環境] チェックアウト完了処理エラー:", error.message);
  }
}

/**
 * 請求書支払い完了イベントの処理
 */
async function handleInvoicePaid(stripe: any, supabase: any, invoice: any) {
  console.log("🧪 [TEST環境] invoice.paidイベントを処理中");

  const subscriptionId = invoice.subscription;
  if (!subscriptionId) {
    console.log("請求書にサブスクリプションIDがありません");
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

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

    // Price IDからプランタイプと期間を判定
    const STANDARD_1M = Deno.env.get("STRIPE_TEST_STANDARD_1M_PRICE_ID");
    const STANDARD_3M = Deno.env.get("STRIPE_TEST_STANDARD_3M_PRICE_ID");
    const FEEDBACK_1M = Deno.env.get("STRIPE_TEST_FEEDBACK_1M_PRICE_ID");
    const FEEDBACK_3M = Deno.env.get("STRIPE_TEST_FEEDBACK_3M_PRICE_ID");

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
      console.warn(`🧪 [TEST環境] 未知のPrice ID (invoice.paid): ${priceId}`);
      planType = "community";
      duration = 1;
    }

    const hasMemberAccess = determineMembershipAccess(planType);

    // サブスクリプション情報を更新（環境フィルタ付き）
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .eq("environment", ENVIRONMENT)
      .single();

    if (subError || !subData) {
      console.error("🧪 [TEST環境] サブスクリプションに紐づくユーザーが見つかりません:", subError);
      return;
    }

    const userId = subData.user_id;

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
      console.error("🧪 [TEST環境] サブスクリプション情報の更新エラー:", updateError);
    }

    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;
    const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;
    const cancelAt = subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null;

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
      console.error("🧪 [TEST環境] ユーザーサブスクリプション情報の更新エラー:", userSubError);
    } else {
      console.log("✅ [TEST環境] サブスクリプション更新を正常に処理しました");
    }

  } catch (error) {
    console.error("🧪 [TEST環境] 請求書支払い完了処理エラー:", error.message);
  }
}

/**
 * サブスクリプション削除イベントの処理
 */
async function handleSubscriptionDeleted(stripe: any, supabase: any, subscription: any) {
  console.log("🧪 [TEST環境] customer.subscription.deletedイベントを処理中");

  const subscriptionId = subscription.id;

  try {
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .eq("environment", ENVIRONMENT)
      .single();

    if (subError || !subData) {
      console.error("🧪 [TEST環境] サブスクリプションに紐づくユーザーが見つかりません:", subError);
      return;
    }

    const userId = subData.user_id;

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        end_timestamp: new Date().toISOString()
      })
      .eq("stripe_subscription_id", subscriptionId)
      .eq("environment", ENVIRONMENT);

    if (updateError) {
      console.error("🧪 [TEST環境] サブスクリプション情報の更新エラー:", updateError);
    }

    const { error: userSubError } = await supabase
      .from("user_subscriptions")
      .update({
        is_active: false,
        plan_members: false,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .eq("environment", ENVIRONMENT);

    if (userSubError) {
      console.error("🧪 [TEST環境] ユーザーサブスクリプション情報の更新エラー:", userSubError);
    } else {
      console.log("✅ [TEST環境] サブスクリプション削除を正常に処理しました");
    }

  } catch (error) {
    console.error("🧪 [TEST環境] サブスクリプション削除処理エラー:", error.message);
  }
}

/**
 * サブスクリプション更新イベントの処理
 */
async function handleSubscriptionUpdated(stripe: any, supabase: any, subscription: any) {
  console.log("🧪 [TEST環境] customer.subscription.updatedイベントを処理中");

  const subscriptionId = subscription.id;
  const customerId = subscription.customer;

  try {
    const { data: customerData, error: customerError } = await supabase
      .from("stripe_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .eq("environment", ENVIRONMENT)
      .single();

    if (customerError || !customerData) {
      console.error("🧪 [TEST環境] Stripe顧客に紐づくユーザーが見つかりません:", customerError);
      return;
    }

    const userId = customerData.user_id;

    // サブスクリプション情報を抽出
    const items = subscription.items.data;
    if (!items || items.length === 0) {
      console.error("サブスクリプションにアイテムがありません");
      return;
    }

    const priceId = items[0].price.id;
    const amount = items[0].price.unit_amount;

    console.log("🧪 [TEST環境] プラン変更情報:", { subscriptionId, userId, priceId, amount });

    // Stripe Price ID から plan_type と duration を判定
    const planInfo = getPlanInfo(priceId);
    const planType = planInfo.planType;
    const duration = planInfo.duration;

    console.log(`🧪 [TEST環境] Price ID: ${priceId} → plan_type: ${planType}, duration: ${duration}`);

    const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;
    const cancelAt = subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null;
    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

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
      console.error("🧪 [TEST環境] user_subscriptions更新エラー:", updateError);
    } else {
      console.log(`✅ [TEST環境] プラン変更完了: ${planType} (${duration}ヶ月)`);
    }

    const { error: subUpdateError } = await supabase
      .from("subscriptions")
      .update({
        end_timestamp: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq("stripe_subscription_id", subscriptionId)
      .eq("environment", ENVIRONMENT);

    if (subUpdateError) {
      console.error("🧪 [TEST環境] subscriptions更新エラー:", subUpdateError);
    }

  } catch (error) {
    console.error("🧪 [TEST環境] サブスクリプション更新処理エラー:", error.message);
  }
}
