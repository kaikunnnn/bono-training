
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, logDebug, createSupabaseClients, createStripeClient } from "./utils.ts";
import { SubscriptionService } from "./subscription-service.ts";

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
        JSON.stringify({ subscribed: false, planType: null, planMembers: false }),
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
        JSON.stringify({ subscribed: false, planType: null, planMembers: false }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    logDebug("ユーザー取得成功", { userId: user.id, email: user.email });

    // データベースからの購読情報を優先チェック
    const dbSubscription = await subscriptionService.getUserSubscription(user.id);
    
    // データベースに購読情報がある場合はそれを信頼する
    if (dbSubscription) {
      logDebug("データベースの購読情報を返却", { 
        isActive: dbSubscription.is_active,
        planType: dbSubscription.plan_type,
        planMembers: dbSubscription.plan_members
      });
      
      return new Response(
        JSON.stringify({
          subscribed: dbSubscription.is_active,
          planType: dbSubscription.plan_type,
          planMembers: dbSubscription.plan_members
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Stripeからの情報取得を試みる
    try {
      if (!stripe) {
        // Stripeが利用できない場合はデフォルトプランを設定
        // デモ用にデフォルトでトレーニングメンバーシップをtrueに設定
        await subscriptionService.updateSubscriptionStatus(
          user.id,
          true,
          "standard",
          true
        );
        
        return new Response(
          JSON.stringify({ 
            subscribed: true, 
            planType: "standard",
            planMembers: true,
            testMode: true
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      // Stripeの購読情報を取得
      const subscriptions = await stripe.subscriptions.list({
        customer: user.id,
        status: "active",
        expand: ["data.items.data.price"],
        limit: 1,
      });

      const hasActiveSubscription = subscriptions.data.length > 0;
      let planType = null;
      let planMembers = false;
      
      if (hasActiveSubscription) {
        const subscription = subscriptions.data[0];
        const price = await subscriptionService.getPlanInfo(subscription);
        if (price && price.unit_amount) {
          // 金額に基づいてプランタイプとトレーニングメンバーシップ権限を判定
          const [determinedPlanType, hasTrainingAccess] = subscriptionService.determinePlanInfo(price.unit_amount);
          planType = determinedPlanType;
          planMembers = hasTrainingAccess;
          
          logDebug("プラン判定", { 
            amount: price.unit_amount, 
            planType, 
            planMembers
          });
        }
        
        // データベースを更新
        await subscriptionService.updateSubscriptionStatus(
          user.id,
          true,
          planType,
          planMembers,
          subscription.id
        );
      } else {
        logDebug("アクティブなサブスクリプションなし");
        
        // 非アクティブとして更新
        await subscriptionService.updateSubscriptionStatus(
          user.id,
          false,
          planType,
          false
        );
      }

      return new Response(
        JSON.stringify({ 
          subscribed: hasActiveSubscription, 
          planType,
          planMembers 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (stripeError) {
      logDebug("Stripeエラー", { error: stripeError });
      
      // Stripeでエラーが発生した場合は、デフォルトの標準プランを設定
      // デモ用にplan_membersをtrueに設定
      await subscriptionService.updateSubscriptionStatus(
        user.id,
        true,
        "standard",
        true
      );
      
      return new Response(
        JSON.stringify({ 
          subscribed: true,
          planType: "standard",
          planMembers: true,
          error: "Stripeとの同期に失敗しましたが、標準プランとして処理します"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
  } catch (error) {
    console.error("サーバーエラー:", error);
    logDebug("予期せぬエラー", { error });
    
    return new Response(
      JSON.stringify({ 
        error: true,
        message: "サーバー内部エラーが発生しました",
        subscribed: false,
        planType: null,
        planMembers: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // エラー時も200を返してクライアントで処理
      }
    );
  }
});
