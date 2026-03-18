/**
 * Preview Subscription Change API
 * Purpose: プラン変更時の日割り計算をプレビュー
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@17.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 環境変数から環境を取得（デフォルトはtest）
const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';

serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // リクエストボディを取得
    const { newPriceId } = await req.json();

    if (!newPriceId) {
      return new Response(
        JSON.stringify({ error: "newPriceId is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // ユーザーIDを取得
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // 既存のサブスクリプション情報を取得
    const { data: userSub, error: subError } = await supabase
      .from("user_subscriptions")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (subError || !userSub) {
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Stripeクライアントの初期化（環境に応じて切り替え）
    const stripeSecretKey = ENVIRONMENT === "test"
      ? Deno.env.get("STRIPE_TEST_SECRET_KEY")
      : Deno.env.get("STRIPE_LIVE_SECRET_KEY");

    const stripe = new Stripe(stripeSecretKey || "", {
      apiVersion: "2025-06-30.basil" as any,
      httpClient: Stripe.createFetchHttpClient(),
    });

    // サブスクリプション詳細を取得
    const subscription = await stripe.subscriptions.retrieve(
      userSub.stripe_subscription_id
    );

    const currentSubscriptionItemId = subscription.items.data[0].id;

    // 2025年版: invoices.createPreview() を使用
    const previewInvoice = await stripe.invoices.createPreview({
      customer: userSub.stripe_customer_id,
      subscription: userSub.stripe_subscription_id,
      subscription_details: {
        items: [
          {
            id: currentSubscriptionItemId,
            price: newPriceId,
          },
        ],
        proration_behavior: "always_invoice",
      },
    });

    // レスポンスを返す
    return new Response(
      JSON.stringify({
        success: true,
        preview: {
          amount_due: previewInvoice.amount_due,
          subtotal: previewInvoice.subtotal,
          total: previewInvoice.total,
          currency: previewInvoice.currency,
          lines: previewInvoice.lines.data.map((line: any) => ({
            description: line.description,
            amount: line.amount,
            proration: line.proration,
          })),
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Preview subscription change error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
