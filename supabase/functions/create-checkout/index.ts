import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  createStripeClient,
  type StripeEnvironment,
} from "../_shared/stripe-helpers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// 環境変数から環境を取得（デフォルトはtest）
const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';

// デバッグログ関数
const logDebug = (message: string, details?: any) => {
  console.log(
    `[CREATE-CHECKOUT] ${message}${
      details ? ` ${JSON.stringify(details)}` : ""
    }`
  );
};

serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // リクエストボディを解析
    const {
      returnUrl,
      planType = "standard",
      duration = 1,
    } = await req.json();

    logDebug("リクエスト受信", { returnUrl, planType, duration, environment: ENVIRONMENT });

    if (!returnUrl) {
      throw new Error("リダイレクトURLが指定されていません");
    }

    // Supabaseクライアントの作成（サービスロールキーを使用してRLSをバイパス）
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // 認証ヘッダーから現在のユーザーを取得
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("認証されていません");
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("ユーザー情報の取得に失敗しました");
    }

    logDebug("ユーザー認証成功", { userId: user.id, email: user.email });

    // Stripeクライアントの初期化（環境変数に応じたAPIキーを使用）
    const stripe = createStripeClient(ENVIRONMENT);
    logDebug(`Stripe環境: ${ENVIRONMENT}`);

    // ユーザーのStripe Customer IDと既存サブスクリプションを取得
    let stripeCustomerId: string;

    // DBからユーザーのStripe Customer IDを検索（環境フィルタ付き）
    const { data: customerData, error: customerError } = await supabaseClient
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .eq("environment", ENVIRONMENT)
      .single();

    // 既存サブスクリプションを確認（複数ある場合も全て取得、環境フィルタ付き）
    const { data: existingSubList, error: existingSubError } =
      await supabaseClient
        .from("user_subscriptions")
        .select("stripe_subscription_id, is_active")
        .eq("user_id", user.id)
        .eq("environment", ENVIRONMENT)
        .eq("is_active", true);

    if (existingSubError) {
      logDebug("既存サブスクリプション取得エラー:", existingSubError);
      throw new Error("サブスクリプション情報の取得に失敗しました");
    }

    // Phase 5: 既存サブスクリプションチェック（新規登録専用）
    // 既存のアクティブサブスクリプションがある場合はエラーを返す
    // プラン変更は update-subscription API を使用すること
    const activeSubscriptions = existingSubList || [];
    if (activeSubscriptions.length > 0) {
      logDebug(
        `${activeSubscriptions.length}件のアクティブサブスクリプションを検出 - エラーを返します`
      );

      return new Response(
        JSON.stringify({
          error: "既存のアクティブなサブスクリプションが存在します。",
          details: "プラン変更は /account ページの「サブスクリプションを管理」から行ってください。",
          existing_subscriptions: activeSubscriptions.map((s) => s.stripe_subscription_id),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (customerError || !customerData) {
      // Stripe顧客が存在しない場合は新規作成
      logDebug(`${user.id}のStripe顧客情報がDBに存在しないため作成します`);

      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });

      // 作成した顧客情報をDBに保存（upsertで既存レコードがあっても対応、環境を含む）
      const { error: insertError } = await supabaseClient
        .from("stripe_customers")
        .upsert(
          {
            user_id: user.id,
            stripe_customer_id: customer.id,
            environment: ENVIRONMENT,
          },
          { onConflict: "user_id,environment" }
        );

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
    const envPrefix = ENVIRONMENT === 'test' ? "STRIPE_TEST_" : "STRIPE_";
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
      duration: duration.toString(),
    };

    // cancel_urlは常に/subscriptionページに設定
    const baseUrl = new URL(returnUrl).origin;
    const cancelUrl = `${baseUrl}/subscription`;

    // 既存サブスクリプションIDをmetadataに追加（Webhookでキャンセルするため）
    // これにより、Checkout完了「後」に既存サブスクがキャンセルされる
    // ユーザーがCheckout画面で離脱しても既存サブスクは残るため安全
    if (activeSubscriptions.length > 0) {
      logDebug(
        `${activeSubscriptions.length}件の既存サブスクリプションをmetadataに記録（Webhook経由でキャンセルします）`
      );
      // 複数ある場合は最初の1つをmetadataに記録（Webhook側で全てのアクティブサブスクをキャンセル）
      sessionMetadata.replace_subscription_id = activeSubscriptions[0].stripe_subscription_id;
    }

    // セッション設定オブジェクト
    const sessionConfig: any = {
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
      metadata: sessionMetadata,
    };

    // 【重要】既存サブスクリプションのキャンセルはWebhook（checkout.session.completed）で実行
    // Checkout作成「前」にキャンセルすると、ユーザーが離脱時に無課金状態になるため
    // stripe-webhook/index.ts Lines 178-196 でキャンセル処理を実行

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logDebug("Checkoutセッション作成完了", {
      sessionId: session.id,
      url: session.url,
      planType,
      duration,
    });

    // セッションURLをフロントエンドに返す
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logDebug("Checkoutセッション作成エラー:", error);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));

    // エラーの詳細情報を取得
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : undefined;

    // より詳細なエラー情報を返す
    const errorResponse = {
      error: errorMessage || "Checkoutセッション作成中にエラーが発生しました",
      errorName: errorName,
      details: errorStack || String(error),
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
