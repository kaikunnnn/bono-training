
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
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
    console.log("イベントデータ:", JSON.stringify(event.data.object));

    // イベントタイプに基づいて処理
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripe, supabase, event.data.object);
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
 * サブスクリプションの作成と顧客情報の保存
 */
async function handleCheckoutCompleted(stripe: Stripe, supabase: any, session: any) {
  console.log("checkout.session.completedイベントを処理中");
  console.log("セッション情報:", JSON.stringify(session));
  
  if (session.mode !== "subscription") {
    console.log("サブスクリプションモードではないため、処理をスキップします");
    return;
  }

  // セッションからsubscriptionIdを取得
  const subscriptionId = session.subscription;
  if (!subscriptionId) {
    console.error("セッションにサブスクリプションIDがありません");
    return;
  }

  try {
    // サブスクリプション詳細を取得
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log("サブスクリプション詳細:", JSON.stringify(subscription));
    
    const customerId = subscription.customer as string;
    
    // カスタマーデータを取得
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.error("顧客が削除されています");
      return;
    }

    // Supabaseで顧客IDからユーザーIDを検索
    const { data: customerData, error: customerError } = await supabase
      .from("stripe_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (customerError) {
      console.error("Stripe顧客IDに紐づくユーザーが見つかりません:", customerError);
      // メタデータからユーザーIDを取得することを試みる
      const userId = session.metadata?.user_id || subscription.metadata?.user_id;
      if (!userId) {
        console.error("ユーザーIDが見つかりません");
        return;
      }
      
      // ユーザーIDとStripe顧客IDの関連付けを作成
      const { error: insertCustomerError } = await supabase
        .from("stripe_customers")
        .insert({
          user_id: userId,
          stripe_customer_id: customerId
        });
      
      if (insertCustomerError) {
        console.error("顧客情報の保存エラー:", insertCustomerError);
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
        });

      if (subscriptionError) {
        console.error("サブスクリプション情報の保存エラー:", subscriptionError);
      } else {
        console.log("サブスクリプション情報を正常に保存しました");
      }
      
    } else {
      const userId = customerData.user_id;
      
      // サブスクリプション情報をデータベースに保存
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          start_timestamp: new Date(subscription.current_period_start * 1000).toISOString(),
          end_timestamp: new Date(subscription.current_period_end * 1000).toISOString(),
        });

      if (subscriptionError) {
        console.error("サブスクリプション情報の保存エラー:", subscriptionError);
      } else {
        console.log("サブスクリプション情報を正常に保存しました");
      }
    }
  } catch (error) {
    console.error("チェックアウト完了処理エラー:", error.message);
    console.error(error.stack);
  }
}

/**
 * 請求書支払い完了イベントの処理
 * サブスクリプション期限の更新
 */
async function handleInvoicePaid(stripe: Stripe, supabase: any, invoice: any) {
  console.log("invoice.paidイベントを処理中");
  
  // 請求書からサブスクリプションIDを取得
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) {
    console.log("請求書にサブスクリプションIDがありません");
    return;
  }

  try {
    // サブスクリプション詳細を取得
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // データベース内のサブスクリプション情報を更新
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        end_timestamp: new Date(subscription.current_period_end * 1000).toISOString(),
        stripe_invoice_id: invoice.id,
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (updateError) {
      console.error("サブスクリプション情報の更新エラー:", updateError);
    } else {
      console.log("サブスクリプション期限を正常に更新しました");
    }
  } catch (error) {
    console.error("請求書支払い完了処理エラー:", error.message);
    console.error(error.stack);
  }
}

/**
 * サブスクリプション削除イベントの処理
 * データベース内のサブスクリプション情報を更新
 */
async function handleSubscriptionDeleted(stripe: Stripe, supabase: any, subscription: any) {
  console.log("customer.subscription.deletedイベントを処理中");
  
  // サブスクリプションIDを取得
  const subscriptionId = subscription.id;
  
  // データベース内のサブスクリプション情報を更新
  const { error: updateError } = await supabase
    .from("subscriptions")
    .update({
      end_timestamp: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (updateError) {
    console.error("サブスクリプション情報の更新エラー:", updateError);
  } else {
    console.log("サブスクリプション削除を正常に処理しました");
  }
}
