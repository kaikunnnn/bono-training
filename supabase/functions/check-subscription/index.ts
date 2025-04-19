
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * デバッグ用ログ出力関数
 */
function logDebug(message: string, data?: any) {
  console.log(`[CHECK-SUBSCRIPTION] ${message}`, data ? JSON.stringify(data) : '');
}

serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logDebug("関数開始");

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
      logDebug("認証ヘッダーなし");
      return new Response(
        JSON.stringify({ subscribed: false, planType: null }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    logDebug("トークン取得", { token: token.substring(0, 10) + "..." });
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      logDebug("ユーザー取得エラー", { error: userError });
      return new Response(
        JSON.stringify({ subscribed: false, planType: null }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    logDebug("ユーザー取得成功", { userId: user.id, email: user.email });
    
    // デバッグ用：現在のuser_subscriptionsテーブルの内容を確認
    const { data: existingSubs, error: existingSubsError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id);
      
    logDebug("既存サブスクリプション情報", { 
      data: existingSubs, 
      error: existingSubsError 
    });
    
    // Stripeクライアントの初期化
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logDebug("Stripe APIキーが設定されていません");
      
      // Stripeキーがない場合はテスト用の値を設定
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from("user_subscriptions")
        .update({
          is_active: true,
          plan_type: "standard",
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
        
      logDebug("テスト用サブスクリプション情報を更新", { 
        data: updateData, 
        error: updateError 
      });
      
      return new Response(
        JSON.stringify({ 
          subscribed: true, 
          planType: "standard",
          testMode: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // アクティブなサブスクリプションを検索
    const subscriptions = await stripe.subscriptions.list({
      customer: null,
      status: "active",
      expand: ["data.customer"],
      limit: 1,
    });
    
    logDebug("Stripeサブスクリプション検索結果", { 
      count: subscriptions.data.length,
    });
    
    // アクティブなサブスクリプションが存在するかチェック
    const hasActiveSubscription = subscriptions.data.length > 0;
    let planType = null;
    
    if (hasActiveSubscription) {
      // サブスクリプションからプラン情報を取得
      const subscription = subscriptions.data[0];
      logDebug("アクティブなサブスクリプション", { 
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      });
      
      // プラン情報を取得
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      logDebug("価格情報", { 
        priceId,
        amount,
        currency: price.currency,
        interval: price.recurring?.interval
      });
      
      // 金額に基づいてプランを判断
      if (amount <= 1000) {
        planType = "standard";
      } else if (amount <= 2000) {
        planType = "growth";
      } else {
        planType = "community";
      }
      
      logDebug("プラン判定", { amount, planType });
      
      // user_subscriptionsテーブルを更新
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from("user_subscriptions")
        .update({
          is_active: true,
          plan_type: planType,
          stripe_subscription_id: subscription.id,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
          
      if (updateError) {
        console.error("サブスクリプション情報の更新エラー:", updateError);
        logDebug("サブスクリプション情報更新エラー", updateError);
      } else {
        logDebug("サブスクリプション情報更新成功");
      }
    } else {
      logDebug("アクティブなサブスクリプションなし");
      
      // アクティブなサブスクリプションがない場合、状態を更新
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from("user_subscriptions")
        .update({
          is_active: false,
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
        
      if (updateError) {
        console.error("サブスクリプション情報の更新エラー:", updateError);
        logDebug("サブスクリプション情報更新エラー", updateError);
      } else {
        logDebug("サブスクリプション情報更新成功");
      }
    }
    
    // 最終的なデータを確認
    const { data: finalSubscriptionData, error: finalError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();
      
    logDebug("最終サブスクリプションデータ", { 
      data: finalSubscriptionData, 
      error: finalError 
    });
    
    return new Response(
      JSON.stringify({ 
        subscribed: hasActiveSubscription, 
        planType,
        dbData: finalSubscriptionData
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("購読状態確認エラー:", error);
    logDebug("予期せぬエラー", { error });
    
    return new Response(
      JSON.stringify({ error: error.message || "購読状態確認中にエラーが発生しました", subscribed: false, planType: null }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
