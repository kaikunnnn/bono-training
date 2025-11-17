
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// デバッグログ関数
const logDebug = (message: string, details?: any) => {
  console.log(`[CREATE-CHECKOUT] ${message}${details ? ` ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // リクエストボディを解析
    const { returnUrl, useTestPrice = false, planType = 'community', duration = 1 } = await req.json();
    
    logDebug("リクエスト受信", { returnUrl, useTestPrice, planType, duration });
    
    if (!returnUrl) {
      throw new Error("リダイレクトURLが指定されていません");
    }

    // Supabaseクライアントの作成
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // 認証ヘッダーから現在のユーザーを取得
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("認証されていません");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("ユーザー情報の取得に失敗しました");
    }
    
    logDebug("ユーザー認証成功", { userId: user.id, email: user.email });
    
    // Stripeクライアントの初期化
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // ユーザーのStripe Customer IDと既存サブスクリプションを取得
    let stripeCustomerId: string;
    let existingSubscriptionId: string | null = null;

    // DBからユーザーのStripe Customer IDを検索
    const { data: customerData, error: customerError } = await supabaseClient
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    // 既存サブスクリプションを確認
    const { data: existingSubData } = await supabaseClient
      .from("user_subscriptions")
      .select("stripe_subscription_id, is_active")
      .eq("user_id", user.id)
      .single();

    if (existingSubData?.is_active && existingSubData?.stripe_subscription_id) {
      existingSubscriptionId = existingSubData.stripe_subscription_id;
      logDebug("既存のアクティブなサブスクリプションを検出:", { existingSubscriptionId });
      // 注意: 既存契約者はCustomer Portalでプラン変更を行うため、ここではキャンセル処理を行わない
    }
    
    if (customerError || !customerData) {
      // Stripe顧客が存在しない場合は新規作成
      logDebug(`${user.id}のStripe顧客情報がDBに存在しないため作成します`);
      
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      
      // 作成した顧客情報をDBに保存
      const { error: insertError } = await supabaseClient
        .from("stripe_customers")
        .insert({
          user_id: user.id,
          stripe_customer_id: customer.id
        });
      
      if (insertError) {
        logDebug("Stripe顧客情報のDB保存に失敗:", insertError);
        throw new Error("顧客情報の保存に失敗しました");
      }
      
      stripeCustomerId = customer.id;
    } else {
      // 既存の顧客IDを使用
      stripeCustomerId = customerData.stripe_customer_id;
      logDebug(`既存のStripe顧客ID ${stripeCustomerId} を使用します`);
    }

    // プランタイプと期間に応じたPrice IDを選択
    let priceId: string | undefined;
    
    // 環境変数の命名規則: STRIPE_[TEST_]PLANTYPE_DURATION_PRICE_ID
    const envPrefix = useTestPrice ? "STRIPE_TEST_" : "STRIPE_";
    const planTypeUpper = planType.toUpperCase();
    const durationSuffix = duration === 1 ? "1M" : "3M";
    const envVarName = `${envPrefix}${planTypeUpper}_${durationSuffix}_PRICE_ID`;
    
    priceId = Deno.env.get(envVarName);
    logDebug(`Price ID環境変数 ${envVarName}:`, { priceId });
    
    if (!priceId) {
      throw new Error(`Price ID環境変数 ${envVarName} が設定されていません`);
    }

    // Checkoutセッションの作成
    const sessionMetadata: Record<string, string> = {
      user_id: user.id,
      plan_type: planType,
      duration: duration.toString()
    };

    // 既存サブスクリプションがある場合はメタデータに含める
    if (existingSubscriptionId) {
      sessionMetadata.replace_subscription_id = existingSubscriptionId;
      logDebug("メタデータに既存サブスクリプションIDを追加:", { existingSubscriptionId });
    }

    // cancel_urlは/subscriptionページに設定（returnUrlではなく）
    const baseUrl = returnUrl.split('/subscription')[0];
    const cancelUrl = `${baseUrl}/subscription`;

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: sessionMetadata
    });
    
    logDebug("Checkoutセッション作成完了", { 
      sessionId: session.id, 
      url: session.url,
      planType,
      duration
    });

    // セッションURLをフロントエンドに返す
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logDebug("Checkoutセッション作成エラー:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Checkoutセッション作成中にエラーが発生しました" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
