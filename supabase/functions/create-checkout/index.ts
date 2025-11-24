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
      useTestPrice = false,
      planType = "community",
      duration = 1,
    } = await req.json();

    logDebug("リクエスト受信", { returnUrl, useTestPrice, planType, duration });

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

    // 環境を判定（useTestPriceフラグに基づく）
    const environment: StripeEnvironment = useTestPrice ? "test" : "live";
    logDebug(`Stripe環境: ${environment}`);

    // Stripeクライアントの初期化（環境に応じたAPIキーを使用）
    const stripe = createStripeClient(environment);

    // ユーザーのStripe Customer IDと既存サブスクリプションを取得
    let stripeCustomerId: string;

    // DBからユーザーのStripe Customer IDを検索（環境フィルタ付き）
    const { data: customerData, error: customerError } = await supabaseClient
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .eq("environment", environment)
      .single();

    // 既存サブスクリプションを確認（複数ある場合も全て取得、環境フィルタ付き）
    const { data: existingSubList, error: existingSubError } =
      await supabaseClient
        .from("user_subscriptions")
        .select("stripe_subscription_id, is_active")
        .eq("user_id", user.id)
        .eq("environment", environment)
        .eq("is_active", true);

    if (existingSubError) {
      logDebug("既存サブスクリプション取得エラー:", existingSubError);
      throw new Error("サブスクリプション情報の取得に失敗しました");
    }

    // アクティブなサブスクリプションが複数ある場合は警告
    const activeSubscriptions = existingSubList || [];
    if (activeSubscriptions.length > 0) {
      logDebug(
        `${activeSubscriptions.length}件のアクティブサブスクリプションを検出`
      );

      if (activeSubscriptions.length > 1) {
        console.warn(
          `警告: ユーザー ${
            user.id
          } に複数のアクティブサブスクリプション: ${activeSubscriptions
            .map((s) => s.stripe_subscription_id)
            .join(", ")}`
        );
      }
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
            environment: environment,
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
      duration: duration.toString(),
    };

    // cancel_urlは常に/subscriptionページに設定
    const baseUrl = new URL(returnUrl).origin;
    const cancelUrl = `${baseUrl}/subscription`;

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

    // 既存サブスクリプションが複数ある場合は全てキャンセル（二重課金を防止）
    if (activeSubscriptions.length > 0) {
      logDebug(
        `${activeSubscriptions.length}件のアクティブサブスクリプションをキャンセルします`
      );

      for (const existingSub of activeSubscriptions) {
        const existingSubscriptionId = existingSub.stripe_subscription_id;

        try {
          // 1. Stripeで既存サブスクリプションの状態を確認
          let existingSubscription;
          try {
            existingSubscription = await stripe.subscriptions.retrieve(
              existingSubscriptionId
            );
            logDebug("既存サブスクリプション取得成功:", {
              id: existingSubscriptionId,
              status: existingSubscription.status,
              customer: existingSubscription.customer,
            });
          } catch (retrieveError) {
            // サブスクリプションが存在しない場合はスキップ
            logDebug(
              "サブスクリプションが見つかりません（既にキャンセル済みの可能性）:",
              retrieveError
            );
            existingSubscription = null;
          }

          // 2. サブスクリプションが存在し、顧客IDが一致する場合のみキャンセル
          if (existingSubscription) {
            if (existingSubscription.customer !== stripeCustomerId) {
              logDebug("警告: サブスクリプションの顧客IDが一致しません", {
                subscriptionId: existingSubscriptionId,
                subscriptionCustomer: existingSubscription.customer,
                expectedCustomer: stripeCustomerId,
              });
              throw new Error("サブスクリプション情報に不整合があります");
            }

            // アクティブまたはトライアル中のサブスクリプションのみキャンセル
            if (
              existingSubscription.status === "active" ||
              existingSubscription.status === "trialing"
            ) {
              // Stripeでキャンセル（日割り返金付き）
              await stripe.subscriptions.cancel(existingSubscriptionId, {
                prorate: true,
              });
              logDebug(
                "Stripeでサブスクリプションをキャンセル完了:",
                existingSubscriptionId
              );
            } else {
              logDebug("サブスクリプションは既に非アクティブです:", {
                id: existingSubscriptionId,
                status: existingSubscription.status,
              });
            }
          }

          // 3. DBを更新（Stripeの状態に関わらず、DBは確実に更新）
          const { error: updateError } = await supabaseClient
            .from("user_subscriptions")
            .update({
              is_active: false,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", existingSubscriptionId)
            .eq("user_id", user.id); // セキュリティ: 必ずuser_idも条件に含める

          if (updateError) {
            logDebug("DB更新エラー:", updateError);
            // DB更新失敗は警告のみ（Webhookで最終的に同期される）
            console.warn(
              "既存サブスクリプションのDB更新に失敗しましたが、処理を続行します"
            );
          } else {
            logDebug(
              "DBでサブスクリプションを非アクティブ化完了:",
              existingSubscriptionId
            );
          }
        } catch (cancelError) {
          logDebug(
            `サブスクリプション ${existingSubscriptionId} のキャンセルエラー:`,
            cancelError
          );
          // 1つでもキャンセル失敗したらCheckout作成を中止（二重課金を確実に防止）
          throw new Error(
            `既存サブスクリプションのキャンセルに失敗しました: ${cancelError.message}`
          );
        }
      }
    }

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
