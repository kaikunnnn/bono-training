/**
 * link-stripe-subscription（S3-B: サインアップ/認証後の既存Stripe契約リンク）
 *
 * 認証済みユーザー（JWT必須）のメールで Stripe を名寄せし、active/trialing の
 * サブスクがあるのに β DB(user_subscriptions) が未同期なら、検出済み契約から
 * stripe_customers + user_subscriptions を復元する。
 *
 * 旧サイト時代の契約者が新メール/新規アカウントでβ登録した場合でも、
 * ログイン確定時点で有料表示になるようにする（S3-Aの補完）。
 *
 * best-effort: 呼び出し側（認証コールバック）は失敗してもユーザー体験を止めない。
 * ここでは常に 200 を返し、結果を JSON で伝える（linked: boolean）。
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createStripeClient } from "../_shared/stripe-helpers.ts";
import {
  findActiveStripeSubscriptions,
  type CustomerResolutionDeps,
  type StripeLike,
  type SupabaseLike,
} from "../create-checkout/customer-resolution.ts";
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

const ENVIRONMENT = (Deno.env.get("STRIPE_MODE") || "test") as "test" | "live";

const logDebug = (message: string, details?: unknown) => {
  console.log(
    `[LINK-STRIPE-SUB] ${message}${details ? ` ${JSON.stringify(details)}` : ""}`
  );
};

/** 常に200を返すJSONヘルパー（best-effort。呼び出し側を止めない） */
function ok(body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // JWT検証: Authorization ヘッダから現在のユーザーを取得
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      // best-effort: 認証情報が無ければ何もしない（200で返す）
      return ok({ linked: false, reason: "no_auth" });
    }
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return ok({ linked: false, reason: "invalid_auth" });
    }

    if (!user.email) {
      return ok({ linked: false, reason: "no_email" });
    }

    logDebug("リンク判定開始", { userId: user.id, email: user.email });

    // 既にβ側で有効なサブスクがあるなら何もしない（二重処理防止）
    const { data: existingActive } = await supabaseClient
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("environment", ENVIRONMENT)
      .eq("is_active", true);

    if (existingActive && existingActive.length > 0) {
      return ok({ linked: false, reason: "already_active" });
    }

    const stripe = createStripeClient(ENVIRONMENT);
    const resolutionDeps: CustomerResolutionDeps = {
      stripe: stripe as unknown as StripeLike,
      supabase: supabaseClient as unknown as SupabaseLike,
      log: logDebug,
    };

    // メールで Stripe を名寄せし active/trialing を収集
    const stripeActiveSubs = await findActiveStripeSubscriptions(resolutionDeps, {
      email: user.email,
    });

    if (stripeActiveSubs.length === 0) {
      return ok({ linked: false, reason: "no_stripe_subscription" });
    }

    // 複数active（異常系）は誤リンク防止のためリンクしない
    if (stripeActiveSubs.length > 1) {
      logDebug("複数のactive/trialingを検出したためリンクをスキップします", {
        subscriptionIds: stripeActiveSubs.map((s) => s.id),
      });
      return ok({ linked: false, reason: "multiple_subscriptions" });
    }

    // 単一active → 完全なサブスクを取得してリンク
    const detected = stripeActiveSubs[0];
    let fullSub: FullStripeSubscriptionLike;
    try {
      fullSub = (await stripe.subscriptions.retrieve(detected.id, {
        expand: ["items.data.price.product"],
      })) as unknown as FullStripeSubscriptionLike;
    } catch (retrieveError) {
      console.error("❌ [LINK-STRIPE-SUB] サブスク取得失敗（リンク中止）:", retrieveError);
      return ok({ linked: false, reason: "retrieve_failed" });
    }

    const linkResult = await linkExistingStripeSubscription(
      {
        supabase: supabaseClient as unknown as LinkSupabaseLike,
        log: logDebug,
        errorLog: (m, d) => console.error(m, d),
      },
      { userId: user.id, environment: ENVIRONMENT, subscription: fullSub }
    );

    if (!linkResult.linked) {
      return ok({ linked: false, reason: linkResult.reason });
    }

    logDebug("既存契約をリンク(復元)しました", {
      userId: user.id,
      subscriptionId: linkResult.subscriptionId,
      planType: linkResult.planType,
      duration: linkResult.duration,
    });

    return ok({
      linked: true,
      plan_type: linkResult.planType,
      duration: linkResult.duration,
    });
  } catch (error) {
    // best-effort: 失敗してもユーザー体験を壊さない。ログのみ残して200で返す。
    console.error("❌ [LINK-STRIPE-SUB] 予期しないエラー:", error);
    return ok({ linked: false, reason: "unexpected_error" });
  }
});
