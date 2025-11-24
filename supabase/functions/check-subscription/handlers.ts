
import { corsHeaders, logDebug, createSupabaseClients, createStripeClient } from "./utils.ts";
import { SubscriptionService } from "./subscription-service/index.ts";
import { CheckSubscriptionResponse } from "./types.ts";

/**
 * プランタイプに基づいてアクセス権限を計算
 */
function calculateAccessPermissions(planType: string | null, isActive: boolean): { hasMemberAccess: boolean; hasLearningAccess: boolean } {
  if (!isActive || !planType) {
    return { hasMemberAccess: false, hasLearningAccess: false };
  }

  // メンバーアクセス: すべての有料プラン
  const hasMemberAccess = ['standard', 'growth', 'community', 'feedback'].includes(planType);

  // 学習アクセス: standard, growth, feedback
  const hasLearningAccess = ['standard', 'growth', 'feedback'].includes(planType);

  return { hasMemberAccess, hasLearningAccess };
}

/**
 * 未認証レスポンスを返す
 */
export function createUnauthenticatedResponse(): Response {
  logDebug("認証ヘッダーなし");
  return new Response(
    JSON.stringify({ 
      subscribed: false, 
      planType: null,
      isSubscribed: false,
      hasMemberAccess: false,
      hasLearningAccess: false
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}

/**
 * ユーザーの購読状態を取得して返す
 */
export async function handleAuthenticatedRequest(authHeader: string): Promise<Response> {
  try {
    logDebug("=== handleAuthenticatedRequest 開始 ===");

    // クライアントの初期化
    logDebug("クライアント初期化開始");
    const { supabaseClient, supabaseAdmin } = createSupabaseClients();
    logDebug("Supabaseクライアント作成完了");

    const stripe = createStripeClient();
    logDebug("Stripeクライアント作成完了", { hasStripe: !!stripe });

    logDebug("SubscriptionService初期化開始");
    const subscriptionService = new SubscriptionService(supabaseAdmin, stripe);
    logDebug("SubscriptionService初期化完了");

    const token = authHeader.replace("Bearer ", "");
    logDebug("トークン取得", { token: token.substring(0, 10) + "..." });

    logDebug("ユーザー認証開始");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      logDebug("ユーザー取得エラー", { error: userError });
      return createUnauthenticatedResponse();
    }

    logDebug("ユーザー取得成功", { userId: user.id, email: user.email });

    // データベースからの購読情報を優先チェック
    logDebug("getUserSubscription 呼び出し開始", { userId: user.id });
    const dbSubscription = await subscriptionService.getUserSubscription(user.id);
    logDebug("getUserSubscription 呼び出し完了", { hasSubscription: !!dbSubscription });
  
  // データベースに購読情報がある場合はそれを信頼する
  if (dbSubscription) {
    const isSubscribed = dbSubscription.is_active;
    const planType = dbSubscription.plan_type;
    const duration = dbSubscription.duration || null;
    const cancelAtPeriodEnd = dbSubscription.cancel_at_period_end || false;
    const cancelAt = dbSubscription.cancel_at || null;
    const currentPeriodEnd = dbSubscription.current_period_end || null;

    // renewalDate:
    // - キャンセル済み（cancel_at_period_end=true）の場合はcancel_atを使用（利用期限）
    // - 通常のサブスクリプションの場合はcurrent_period_endを使用（次回更新日）
    const renewalDate = cancelAtPeriodEnd && cancelAt ? cancelAt : currentPeriodEnd;

    // アクセス権限を計算
    const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions(planType, isSubscribed);

    logDebug("データベースの購読情報を返却", {
      isActive: isSubscribed,
      planType,
      duration,
      cancelAtPeriodEnd,
      cancelAt,
      renewalDate,
      hasMemberAccess,
      hasLearningAccess
    });

    return new Response(
      JSON.stringify({
        subscribed: isSubscribed,
        planType,
        duration,
        isSubscribed,
        cancelAtPeriodEnd,
        cancelAt,
        renewalDate,
        hasMemberAccess,
        hasLearningAccess
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }

    logDebug("DB購読情報なし、Stripe確認へ");
    return await handleStripeSubscriptionCheck(subscriptionService, user.id, stripe);
  } catch (error) {
    logDebug("=== handleAuthenticatedRequest内でエラー発生 ===", {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });
    throw error; // 上位のcatchブロックで処理させる
  }
}

/**
 * Stripeからの購読情報を取得して返す
 */
export async function handleStripeSubscriptionCheck(
  subscriptionService: SubscriptionService, 
  userId: string, 
  stripe: any
): Promise<Response> {
  try {
    if (!stripe) {
      // Stripeが利用できない場合はデフォルトプランを設定
      await subscriptionService.updateSubscriptionStatus(
        userId,
        true,
        "standard"
      );
      
      const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions("standard", true);
      
      return new Response(
        JSON.stringify({ 
          subscribed: true, 
          planType: "standard",
          isSubscribed: true,
          hasMemberAccess,
          hasLearningAccess,
          testMode: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    const response = await processStripeSubscription(subscriptionService, userId, stripe);
    
    // アクセス権限を計算
    const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions(response.planType, response.subscribed);
    
    return new Response(
      JSON.stringify({
        ...response,
        isSubscribed: response.subscribed,
        hasMemberAccess,
        hasLearningAccess
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (stripeError) {
    logDebug("Stripeエラー", { error: stripeError });
    
    // Stripeでエラーが発生した場合は、デフォルトの標準プランを設定
    await subscriptionService.updateSubscriptionStatus(
      userId,
      true,
      "standard"
    );
    
    const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions("standard", true);
    
    return new Response(
      JSON.stringify({ 
        subscribed: true,
        planType: "standard",
        isSubscribed: true,
        hasMemberAccess,
        hasLearningAccess,
        error: "Stripeとの同期に失敗しましたが、標準プランとして処理します"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
}

/**
 * Stripe購読情報の処理
 */
export async function processStripeSubscription(
  subscriptionService: SubscriptionService,
  userId: string,
  stripe: any
): Promise<CheckSubscriptionResponse> {
  // Stripeの購読情報を取得
  const subscriptions = await stripe.subscriptions.list({
    customer: userId,
    status: "active",
    expand: ["data.items.data.price"],
    limit: 1,
  });

  const hasActiveSubscription = subscriptions.data.length > 0;
  let planType = null;
  
  if (hasActiveSubscription) {
    const subscription = subscriptions.data[0];
    const price = await subscriptionService.getPlanInfo(subscription);
    if (price && price.unit_amount) {
      // 金額に基づいてプランタイプを判定
      const [determinedPlanType] = subscriptionService.determinePlanInfo(price.unit_amount);
      planType = determinedPlanType;
      
      logDebug("プラン判定", { 
        amount: price.unit_amount, 
        planType
      });
    }
    
    // データベースを更新
    await subscriptionService.updateSubscriptionStatus(
      userId,
      true,
      planType,
      subscription.id
    );
  } else {
    logDebug("アクティブなサブスクリプションなし");
    
    // 非アクティブとして更新
    await subscriptionService.updateSubscriptionStatus(
      userId,
      false,
      planType
    );
  }

  return { 
    subscribed: hasActiveSubscription, 
    planType
  };
}
