import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  createStripeClient,
  type StripeEnvironment,
} from "../_shared/stripe-helpers.ts";
import {
  resolveStripeCustomerId,
  findActiveStripeSubscriptions,
  type CustomerResolutionDeps,
  type StripeLike,
  type SupabaseLike,
} from "./customer-resolution.ts";
import {
  linkExistingStripeSubscription,
  type FullStripeSubscriptionLike,
  type LinkSupabaseLike,
} from "../_shared/subscription-link.ts";

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

    // 顧客解決・二重登録ガードの依存注入コンテナ
    // （実SDKを薄いインターフェースに束ねる。ロジックは customer-resolution.ts に集約）
    const resolutionDeps: CustomerResolutionDeps = {
      stripe: stripe as unknown as StripeLike,
      supabase: supabaseClient as unknown as SupabaseLike,
      log: logDebug,
    };

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

    // Phase 5 追加ガード: Stripe側の実態チェック（DB未同期対策）
    // DBが inactive でも Stripe側に active/trialing サブスクが残っている人が
    // 再登録すると二重課金になりうるため、メールで名寄せしてStripe側も塞ぐ。
    const stripeActiveSubs = await findActiveStripeSubscriptions(resolutionDeps, {
      email: user.email,
    });

    // S5 + S3-A: Stripe側に active/trialing があるが DB は未同期のケース。
    //  - 複数active（異常系）: 誤リンク防止のためリンクせず 400 + サポート案内。
    //  - 単一active: 検出済みの実契約をβ DB へ自動リンク（復元）して 200 を返す。
    //    押したプランボタンと実契約が違う可能性があるため checkout は作らない
    //    （作ると二重課金リスク）。プラン変更はマイページ(ポータル)から。
    const supportResponse = () =>
      new Response(
        JSON.stringify({
          error: "既にアクティブな契約があります。",
          details:
            "決済システム側に有効なサブスクリプションが残っています。お手数ですがサポートへご連絡ください。",
          existing_subscriptions: stripeActiveSubs.map((s) => s.id),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );

    if (stripeActiveSubs.length > 1) {
      logDebug(
        `Stripe側に${stripeActiveSubs.length}件のactive/trialingサブスクを検出（複数=異常系）- リンクせず400を返します`,
        { subscriptionIds: stripeActiveSubs.map((s) => s.id) }
      );
      return supportResponse();
    }

    if (stripeActiveSubs.length === 1) {
      const detected = stripeActiveSubs[0];
      logDebug(
        "Stripe側に1件のactive/trialingサブスクを検出 - β DB へ自動リンク(復元)を試みます",
        { subscriptionId: detected.id }
      );

      // price(product) を含む完全なサブスクを取得してリンクする
      let fullSub: FullStripeSubscriptionLike;
      try {
        fullSub = (await stripe.subscriptions.retrieve(detected.id, {
          expand: ["items.data.price.product"],
        })) as unknown as FullStripeSubscriptionLike;
      } catch (retrieveError) {
        console.error(
          "❌ [CREATE-CHECKOUT] 既存サブスクの取得に失敗（リンク中止・従来の400を返します）:",
          retrieveError
        );
        return supportResponse();
      }

      const linkResult = await linkExistingStripeSubscription(
        {
          supabase: supabaseClient as unknown as LinkSupabaseLike,
          log: logDebug,
          errorLog: (m, d) => console.error(m, d),
        },
        {
          userId: user.id,
          environment: ENVIRONMENT,
          subscription: fullSub,
        }
      );

      if (!linkResult.linked) {
        // price導出不能 / DB書き込み失敗 → 「復元しました」を返さず従来の400
        logDebug("自動リンクに失敗したため従来の400を返します", {
          reason: linkResult.reason,
          subscriptionId: detected.id,
        });
        return supportResponse();
      }

      logDebug("既存契約の自動リンク(復元)に成功しました", {
        subscriptionId: detected.id,
        planType: linkResult.planType,
        duration: linkResult.duration,
      });

      return new Response(
        JSON.stringify({
          restored: true,
          message:
            "既存の契約を確認し、アカウントに復元しました。ページを再読み込みすると会員として表示されます。プラン変更はマイページから行えます。",
          plan_type: linkResult.planType,
          duration: linkResult.duration,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Stripe Customer IDを解決する（DB→email名寄せ再利用→新規作成の順）
    // これにより同一メールでの重複Stripe顧客の量産を防ぐ。
    const stripeCustomerId = await resolveStripeCustomerId(resolutionDeps, {
      email: user.email,
      userId: user.id,
      environment: ENVIRONMENT,
    });

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
      success_url: `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: sessionMetadata,
      locale: "ja", // 日本語UI
      allow_promotion_codes: true, // クーポンコード入力欄を表示
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
