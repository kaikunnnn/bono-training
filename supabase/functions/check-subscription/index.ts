
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
    // Supabaseクライアントの作成
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    // 認証用のクライアント
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // サービスロール用のクライアント（DBへの書き込み用）
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    // 認証ヘッダーから現在のユーザーを取得
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ subscribed: false, planType: null }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ subscribed: false, planType: null }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Stripeクライアントの初期化
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // DBからユーザーのStripe Customer IDを検索
    const { data: customerData, error: customerError } = await supabaseClient
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();
    
    if (customerError || !customerData) {
      // Stripe顧客情報が存在しない場合、購読していない
      return new Response(
        JSON.stringify({ subscribed: false, planType: null }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // アクティブなサブスクリプションを検索
    const subscriptions = await stripe.subscriptions.list({
      customer: customerData.stripe_customer_id,
      status: "active",
      limit: 1,
    });
    
    // アクティブなサブスクリプションが存在するかチェック
    const hasActiveSubscription = subscriptions.data.length > 0;
    let planType = null;
    
    if (hasActiveSubscription) {
      // サブスクリプションからプラン情報を取得
      const subscription = subscriptions.data[0];
      
      // プラン情報を取得（例：価格IDからプランタイプを判断）
      const priceId = subscription.items.data[0].price.id;
      
      // ここでプラン情報を判断するロジックを実装（例：Stripeの価格IDからプランタイプを決定）
      // この例では単純に価格額に基づいてプランタイプを決定
      try {
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;
        
        // 金額に基づいてプランを判断（例）
        if (amount <= 1000) {
          planType = "standard";
        } else if (amount <= 2000) {
          planType = "growth";
        } else {
          planType = "community";
        }
        
        // user_subscriptionsテーブルを更新
        const { error: subscriptionUpdateError } = await supabaseAdmin
          .from("user_subscriptions")
          .upsert({
            user_id: user.id,
            is_active: true,
            plan_type: planType,
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });
          
        if (subscriptionUpdateError) {
          console.error("サブスクリプション情報の更新エラー:", subscriptionUpdateError);
        }
      } catch (error) {
        console.error("プラン情報の取得エラー:", error);
      }
    } else {
      // アクティブなサブスクリプションがない場合、状態を更新
      const { error: subscriptionUpdateError } = await supabaseAdmin
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          is_active: false,
          plan_type: planType,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });
        
      if (subscriptionUpdateError) {
        console.error("サブスクリプション情報の更新エラー:", subscriptionUpdateError);
      }
    }
    
    return new Response(
      JSON.stringify({ subscribed: hasActiveSubscription, planType }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("購読状態確認エラー:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "購読状態確認中にエラーが発生しました", subscribed: false, planType: null }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
