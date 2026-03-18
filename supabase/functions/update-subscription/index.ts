import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 環境変数から環境を取得（デフォルトはtest）
const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';

// デバッグログ関数
const logDebug = (message: string, details?: any) => {
  console.log(`[UPDATE-SUBSCRIPTION] ${message}${details ? ` ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // リクエストボディを解析
    const { planType, duration = 1 } = await req.json();

    const environment = ENVIRONMENT;
    logDebug("プラン変更リクエスト受信", { planType, duration, environment });

    if (!planType) {
      throw new Error("プランタイプが指定されていません");
    }

    // Supabaseクライアントの作成
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

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

    // Stripeクライアントの初期化（環境に応じて切り替え）
    const stripeSecretKey = environment === "test"
      ? Deno.env.get("STRIPE_TEST_SECRET_KEY")
      : Deno.env.get("STRIPE_LIVE_SECRET_KEY");

    if (!stripeSecretKey) {
      throw new Error(`Stripe秘密鍵が設定されていません（環境: ${environment}）`);
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    logDebug("Stripe クライアント初期化完了", { environment });

    // ユーザーの現在のサブスクリプション情報を取得（環境でフィルタ）
    const { data: subscriptionData, error: subError } = await supabaseClient
      .from("user_subscriptions")
      .select("stripe_subscription_id, stripe_customer_id, plan_type, duration")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .eq("environment", environment)
      .single();

    if (subError || !subscriptionData) {
      throw new Error("サブスクリプション情報が見つかりません");
    }

    const { stripe_subscription_id, stripe_customer_id, plan_type: currentPlan, duration: currentDuration } = subscriptionData;

    if (!stripe_subscription_id) {
      throw new Error("Stripeサブスクリプションが見つかりません");
    }

    // 同じプランかつ同じ期間への変更はスキップ
    if (currentPlan === planType && currentDuration === duration) {
      logDebug("同じプラン・期間への変更のためスキップ", { currentPlan, planType, currentDuration, duration });
      return new Response(
        JSON.stringify({
          success: true,
          message: "既に同じプランです",
          planType: currentPlan
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    logDebug("既存サブスクリプション情報", {
      subscriptionId: stripe_subscription_id,
      currentPlan,
      newPlan: planType
    });

    // Stripeから現在のサブスクリプションを取得
    const subscription = await stripe.subscriptions.retrieve(stripe_subscription_id);

    if (!subscription || subscription.status === 'canceled') {
      throw new Error("有効なサブスクリプションが見つかりません");
    }

    // 新しいPrice IDを取得（環境に応じて切り替え）
    const planTypeUpper = planType.toUpperCase();
    const durationSuffix = duration === 1 ? "1M" : "3M";
    const envPrefix = environment === "test" ? "STRIPE_TEST" : "STRIPE";

    // 環境に応じたPrice ID環境変数名を構築
    let envVarName = `${envPrefix}_${planTypeUpper}_${durationSuffix}_PRICE_ID`;
    let priceId = Deno.env.get(envVarName);

    // 見つからなければVITE_プレフィックスを試行（開発環境用）
    if (!priceId) {
      envVarName = `VITE_${envPrefix}_${planTypeUpper}_${durationSuffix}_PRICE_ID`;
      priceId = Deno.env.get(envVarName);
    }

    logDebug(`Price ID環境変数 ${envVarName}:`, { priceId });

    if (!priceId) {
      throw new Error(`Price ID環境変数が設定されていません（${envVarName}）`);
    }

    // サブスクリプションアイテムを更新
    const subscriptionItem = subscription.items.data[0];

    logDebug("サブスクリプション更新開始", {
      subscriptionId: subscription.id,
      currentPriceId: subscriptionItem.price.id,
      newPriceId: priceId
    });

    // Stripeサブスクリプションを更新（日割り計算あり）
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      items: [{
        id: subscriptionItem.id,
        price: priceId,
      }],
      proration_behavior: 'create_prorations', // 日割り計算を有効化
      metadata: {
        user_id: user.id,
        plan_type: planType,
        duration: duration.toString(),
        updated_at: new Date().toISOString()
      }
    });

    logDebug("サブスクリプション更新完了", {
      subscriptionId: updatedSubscription.id,
      status: updatedSubscription.status,
      newPlanType: planType
    });

    // DBのuser_subscriptionsを更新
    const { error: updateError } = await supabaseClient
      .from("user_subscriptions")
      .update({
        plan_type: planType,
        duration: duration,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (updateError) {
      logDebug("DB更新エラー:", updateError);
      // Stripe更新は成功したが、DB更新に失敗した場合
      // Webhookで最終的に同期されるため、エラーは返さない
      console.warn("DB更新に失敗しましたが、Webhookで同期されます");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "プランを変更しました",
        planType: planType,
        subscriptionId: updatedSubscription.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logDebug("プラン変更エラー:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "プラン変更中にエラーが発生しました",
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
