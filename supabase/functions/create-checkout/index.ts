
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
    // リクエストボディを解析
    const { returnUrl, useTestPrice = false, planType = 'standard' } = await req.json();
    
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
    
    // Stripeクライアントの初期化
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // ユーザーのStripe Customer IDを取得または作成
    let stripeCustomerId: string;
    
    // DBからユーザーのStripe Customer IDを検索
    const { data: customerData, error: customerError } = await supabaseClient
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();
    
    if (customerError || !customerData) {
      // Stripe顧客が存在しない場合は新規作成
      console.log(`${user.id}のStripe顧客情報がDBに存在しないため作成します`);
      
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
        console.error("Stripe顧客情報のDB保存に失敗:", insertError);
        throw new Error("顧客情報の保存に失敗しました");
      }
      
      stripeCustomerId = customer.id;
    } else {
      // 既存の顧客IDを使用
      stripeCustomerId = customerData.stripe_customer_id;
      console.log(`既存のStripe顧客ID ${stripeCustomerId} を使用します`);
    }

    // プランタイプに応じたPrice IDを選択
    let priceId: string | undefined;
    
    // テスト環境と本番環境で異なるPrice IDを使用
    if (useTestPrice) {
      // テスト環境のPrice ID
      switch(planType) {
        case 'community':
          priceId = Deno.env.get("STRIPE_TEST_COMMUNITY_PRICE_ID");
          break;
        case 'growth':
          priceId = Deno.env.get("STRIPE_TEST_GROWTH_PRICE_ID");
          break;
        case 'standard':
        default:
          priceId = Deno.env.get("STRIPE_TEST_STANDARD_PRICE_ID");
      }
    } else {
      // 本番環境のPrice ID
      switch(planType) {
        case 'community':
          priceId = Deno.env.get("STRIPE_COMMUNITY_PRICE_ID");
          break;
        case 'growth':
          priceId = Deno.env.get("STRIPE_GROWTH_PRICE_ID");
          break;
        case 'standard':
        default:
          priceId = Deno.env.get("STRIPE_STANDARD_PRICE_ID");
      }
    }
    
    // Price IDがなければデフォルトを使用
    priceId = priceId || (useTestPrice 
      ? Deno.env.get("STRIPE_TEST_PRICE_ID")
      : Deno.env.get("STRIPE_PRICE_ID"));
    
    if (!priceId) {
      throw new Error("Stripe Price IDが設定されていません");
    }

    // Checkoutセッションの作成
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
      cancel_url: returnUrl,
      metadata: {
        user_id: user.id,
        plan_type: planType
      }
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
    console.error("Checkoutセッション作成エラー:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Checkoutセッション作成中にエラーが発生しました" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
