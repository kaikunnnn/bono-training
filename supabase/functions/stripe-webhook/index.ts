
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// プランタイプと金額に基づいてメンバーアクセス権を判定
function determineMembershipAccess(planType: string, amount?: number): boolean {
  // コミュニティプランは常にメンバーアクセス権あり
  if (planType === "community") {
    return true;
  } else if (planType === "standard" || planType === "growth") {
    return true;
  } else if (amount) {
    // プランタイプが不明な場合は金額で判断（1000円以上）
    return amount >= 1000;
  }
  return false;
}

serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Stripeクライアントの初期化
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Stripeのwebhookシークレットを環境変数から取得
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRETが設定されていません");
      return new Response(JSON.stringify({ error: "Webhookシークレットが設定されていません" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // イベントを検証
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook署名検証エラー: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook署名検証エラー: ${err.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Supabaseクライアントの初期化
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`処理中のイベント: ${event.type}`);

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
        console.log(`処理されないイベント: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`Webhookエラー: ${error.message}`);
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
async function handleCheckoutCompleted(stripe: Stripe, supabase: any, session: any) {
  console.log("checkout.session.completedイベントを処理中");
  
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
    const planType = session.metadata?.plan_type || "community";
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

    // Stripe顧客情報を保存/更新
    const { error: customerError } = await supabase
      .from("stripe_customers")
      .upsert({
        user_id: userId,
        stripe_customer_id: customerId
      }, { onConflict: 'user_id' });

    if (customerError) {
      console.error("顧客情報の保存エラー:", customerError);
    }

    // user_subscriptionsテーブルにサブスクリプション情報を保存または更新
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
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (userSubError) {
      console.error("ユーザーサブスクリプション情報の保存エラー:", userSubError);
      return;
    }

    // サブスクリプション情報を保存
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        start_timestamp: new Date(subscription.current_period_start * 1000).toISOString(),
        end_timestamp: new Date(subscription.current_period_end * 1000).toISOString(),
        plan_members: hasMemberAccess
      });

    if (subscriptionError) {
      console.error("サブスクリプション情報の保存エラー:", subscriptionError);
    } else {
      console.log(`${planType}プラン（${duration}ヶ月）のサブスクリプション情報を正常に保存しました`);
    }

    // 既存サブスクリプションがある場合はキャンセル
    if (replaceSubscriptionId) {
      console.log(`既存サブスクリプション ${replaceSubscriptionId} をキャンセルします`);
      try {
        // 既存サブスクリプションを即座にキャンセル
        await stripe.subscriptions.cancel(replaceSubscriptionId);
        console.log(`既存サブスクリプション ${replaceSubscriptionId} をキャンセルしました`);

        // DBの古いサブスクリプション情報も更新
        const { error: oldSubError } = await supabase
          .from("subscriptions")
          .update({
            end_timestamp: new Date().toISOString()
          })
          .eq("stripe_subscription_id", replaceSubscriptionId);

        if (oldSubError) {
          console.error("古いサブスクリプション情報の更新エラー:", oldSubError);
        }
      } catch (cancelError) {
        console.error(`既存サブスクリプションのキャンセルエラー:`, cancelError.message);
        // キャンセルに失敗しても新しいサブスクリプションは有効なので、処理を継続
      }
    }

  } catch (error) {
    console.error("チェックアウト完了処理エラー:", error.message);
  }
}

/**
 * 請求書支払い完了イベントの処理
 */
async function handleInvoicePaid(stripe: Stripe, supabase: any, invoice: any) {
  console.log("invoice.paidイベントを処理中");
  
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

    // Price IDからプランタイプと期間を判定（subscription.updatedと同じロジック）
    const STANDARD_1M = Deno.env.get("STRIPE_TEST_STANDARD_1M_PRICE_ID") || Deno.env.get("STRIPE_STANDARD_1M_PRICE_ID");
    const STANDARD_3M = Deno.env.get("STRIPE_TEST_STANDARD_3M_PRICE_ID") || Deno.env.get("STRIPE_STANDARD_3M_PRICE_ID");
    const FEEDBACK_1M = Deno.env.get("STRIPE_TEST_FEEDBACK_1M_PRICE_ID") || Deno.env.get("STRIPE_FEEDBACK_1M_PRICE_ID");
    const FEEDBACK_3M = Deno.env.get("STRIPE_TEST_FEEDBACK_3M_PRICE_ID") || Deno.env.get("STRIPE_FEEDBACK_3M_PRICE_ID");

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
      console.warn(`未知のPrice ID (invoice.paid): ${priceId}`);
      planType = "community";
      duration = 1;
    }

    const hasMemberAccess = determineMembershipAccess(planType, amount);

    // サブスクリプション情報を更新
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (subError || !subData) {
      console.error("サブスクリプションに紐づくユーザーが見つかりません:", subError);
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
      .eq("stripe_subscription_id", subscriptionId);

    if (updateError) {
      console.error("サブスクリプション情報の更新エラー:", updateError);
    }

    // user_subscriptionsテーブルも更新
    const { error: userSubError } = await supabase
      .from("user_subscriptions")
      .update({
        is_active: true,
        plan_type: planType,
        plan_members: hasMemberAccess,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (userSubError) {
      console.error("ユーザーサブスクリプション情報の更新エラー:", userSubError);
    } else {
      console.log("サブスクリプション更新を正常に処理しました");
    }

  } catch (error) {
    console.error("請求書支払い完了処理エラー:", error.message);
  }
}

/**
 * サブスクリプション削除イベントの処理
 */
async function handleSubscriptionDeleted(stripe: Stripe, supabase: any, subscription: any) {
  console.log("customer.subscription.deletedイベントを処理中");
  
  const subscriptionId = subscription.id;

  try {
    // サブスクリプションに紐づくユーザーを検索
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (subError || !subData) {
      console.error("サブスクリプションに紐づくユーザーが見つかりません:", subError);
      return;
    }

    const userId = subData.user_id;
    
    // データベース内のサブスクリプション情報を更新
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        end_timestamp: new Date().toISOString()
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (updateError) {
      console.error("サブスクリプション情報の更新エラー:", updateError);
    }

    // user_subscriptionsテーブルも更新
    const { error: userSubError } = await supabase
      .from("user_subscriptions")
      .update({
        is_active: false,
        plan_members: false,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (userSubError) {
      console.error("ユーザーサブスクリプション情報の更新エラー:", userSubError);
    } else {
      console.log("サブスクリプション削除を正常に処理しました");
    }

  } catch (error) {
    console.error("サブスクリプション削除処理エラー:", error.message);
  }
}

/**
 * サブスクリプション更新イベントの処理
 * Customer Portalでのプラン変更時に発火
 */
async function handleSubscriptionUpdated(stripe: Stripe, supabase: any, subscription: any) {
  console.log("customer.subscription.updatedイベントを処理中");

  const subscriptionId = subscription.id;
  const customerId = subscription.customer;

  try {
    // サブスクリプションに紐づくユーザーを検索
    const { data: customerData, error: customerError } = await supabase
      .from("stripe_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (customerError || !customerData) {
      console.error("Stripe顧客に紐づくユーザーが見つかりません:", customerError);
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

    console.log("プラン変更情報:", { subscriptionId, userId, priceId, amount });

    // Price IDからプランタイプと期間を判定
    let planType: string;
    let duration: number;

    // 環境変数からPrice IDを取得（テスト環境と本番環境の両方に対応）
    const STANDARD_1M = Deno.env.get("STRIPE_TEST_STANDARD_1M_PRICE_ID") || Deno.env.get("STRIPE_STANDARD_1M_PRICE_ID");
    const STANDARD_3M = Deno.env.get("STRIPE_TEST_STANDARD_3M_PRICE_ID") || Deno.env.get("STRIPE_STANDARD_3M_PRICE_ID");
    const FEEDBACK_1M = Deno.env.get("STRIPE_TEST_FEEDBACK_1M_PRICE_ID") || Deno.env.get("STRIPE_FEEDBACK_1M_PRICE_ID");
    const FEEDBACK_3M = Deno.env.get("STRIPE_TEST_FEEDBACK_3M_PRICE_ID") || Deno.env.get("STRIPE_FEEDBACK_3M_PRICE_ID");

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
      console.warn(`未知のPrice ID: ${priceId}。デフォルトでcommunityプランに設定します`);
      planType = "community";
      duration = 1;
    }

    console.log("判定結果:", { planType, duration, matchedPriceId: priceId });

    // user_subscriptionsテーブルを更新
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        plan_type: planType,
        duration: duration,
        is_active: subscription.status === "active",
        stripe_subscription_id: subscriptionId,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("user_subscriptions更新エラー:", updateError);
    } else {
      console.log(`プラン変更完了: ${planType} (${duration}ヶ月)`);
    }

    // subscriptionsテーブルも更新
    const { error: subUpdateError } = await supabase
      .from("subscriptions")
      .update({
        end_timestamp: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (subUpdateError) {
      console.error("subscriptions更新エラー:", subUpdateError);
    }

  } catch (error) {
    console.error("サブスクリプション更新処理エラー:", error.message);
  }
}
