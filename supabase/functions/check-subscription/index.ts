
import { corsHeaders, logDebug, createSupabaseClients, createStripeClient } from "./utils.ts";
import { SubscriptionService } from "./subscription-service.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logDebug("関数開始");
    
    // クライアントの初期化
    const { supabaseClient, supabaseAdmin } = createSupabaseClients();
    const stripe = createStripeClient();
    const subscriptionService = new SubscriptionService(supabaseAdmin, stripe);
    
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
    
    // Stripeキーがなければテストモードとして扱う
    if (!stripe) {
      const { data: updateData, error: updateError } = await subscriptionService
        .updateSubscriptionStatus(user.id, true, "standard");
      
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
    
    // アクティブなサブスクリプションを検索
    const subscription = await subscriptionService.getStripeSubscription();
    const hasActiveSubscription = !!subscription;
    let planType = null;
    
    if (hasActiveSubscription && subscription) {
      const price = await subscriptionService.getPlanInfo(subscription);
      if (price && price.unit_amount) {
        planType = subscriptionService.determinePlanType(price.unit_amount);
        logDebug("プラン判定", { amount: price.unit_amount, planType });
        
        await subscriptionService.updateSubscriptionStatus(
          user.id, 
          true, 
          planType,
          subscription.id
        );
      }
    } else {
      logDebug("アクティブなサブスクリプションなし");
      
      await subscriptionService.updateSubscriptionStatus(
        user.id,
        false,
        planType
      );
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
