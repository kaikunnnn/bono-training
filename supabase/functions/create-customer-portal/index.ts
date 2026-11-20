import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getSupabaseSecretKey } from '../_shared/supabase-keys.ts';
import { createStripeClient, type StripeEnvironment, getPriceId, type PlanType, type PlanDuration } from "../_shared/stripe-helpers.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceRoleKey = getSupabaseSecretKey();

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 環境変数から環境を取得（デフォルトはtest）
const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';

Deno.serve(async (req) => {
  // CORS プリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 認証トークンを取得
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // リクエストボディから returnUrl, planType, duration を取得
    const body = await req.json();
    const returnUrl = body.returnUrl;
    const planType = body.planType as PlanType | undefined; // 選択されたプラン（Deep Link用）
    const duration = body.duration as PlanDuration | undefined; // 選択された期間（Deep Link用）

    // 環境はサーバー側で判定（STRIPE_MODE環境変数）
    const environment: StripeEnvironment = ENVIRONMENT;

    // Deep Link モードを無効化（Option 3実装により使用しない）
    // プラン変更は /subscription ページから create-checkout を使用
    const isDeepLinkMode = false;

    console.log('Customer Portal リクエスト:', {
      userId: user.id,
      returnUrl,
      environment,
      isDeepLinkMode,
      planType,
      duration
    });

    // ユーザーのStripe Customer IDを取得
    // 優先順位: 1) アクティブなサブスクリプションに紐づく顧客ID、2) 最新の顧客ID
    let stripeCustomerId: string | null = null;

    // まず、アクティブなサブスクリプションから顧客IDを取得（環境フィルタ付き）
    const { data: activeSubscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .eq('environment', environment)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('[DEBUG] アクティブサブスクリプション取得結果:', {
      data: activeSubscription,
      error: subError,
      userId: user.id,
      environment
    });

    if (activeSubscription?.stripe_customer_id) {
      stripeCustomerId = activeSubscription.stripe_customer_id;
      console.log(`[${environment.toUpperCase()}] アクティブなサブスクリプションから顧客IDを取得:`, stripeCustomerId);
    } else {
      console.log('[DEBUG] アクティブサブスクリプションなし。stripe_customersテーブルを確認します');

      // アクティブなサブスクリプションがない場合は、最新の顧客IDを取得（環境フィルタ付き）
      const { data: customers, error: custError } = await supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .eq('environment', environment)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('[DEBUG] stripe_customers取得結果:', {
        data: customers,
        error: custError,
        userId: user.id,
        environment
      });

      if (customers && customers.length > 0) {
        stripeCustomerId = customers[0].stripe_customer_id;
        console.log(`[${environment.toUpperCase()}] 最新の顧客IDを取得:`, stripeCustomerId);
      }
    }

    // Stripeクライアントの初期化（環境に応じたAPIキーを使用）
    const stripe = createStripeClient(environment);

    if (!stripeCustomerId) {
      console.error('❌ Stripe顧客情報が見つかりません:', {
        userId: user.id,
        environment,
        message: 'user_subscriptions と stripe_customers の両方で顧客IDが見つかりませんでした'
      });
      return new Response(
        JSON.stringify({
          error: 'Stripe顧客情報が見つかりません。まずプランに登録してください。',
          debug: {
            userId: user.id,
            environment,
            message: 'データベースに該当環境の顧客情報が存在しません'
          }
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // return_urlを検証して設定
    let finalReturnUrl: string;
    if (returnUrl && returnUrl.startsWith('http')) {
      finalReturnUrl = returnUrl;
    } else {
      // デフォルトURL（開発環境）
      finalReturnUrl = 'http://localhost:8080/subscription';
    }

    console.log('Customer Portal作成:', { customerId: stripeCustomerId, returnUrl: finalReturnUrl, isDeepLinkMode });

    // Customer Portal セッション設定を構築
    let sessionConfig: any = {
      customer: stripeCustomerId,
      return_url: finalReturnUrl,
      locale: 'ja', // 日本語で表示
    };

    // Deep Link モードの場合: プラン変更画面に直接遷移
    if (isDeepLinkMode && planType && duration) {
      console.log('🔗 Deep Link モード: プラン変更画面に直接遷移します');

      // 1. 現在のサブスクリプションIDを取得
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', user.id)
        .eq('environment', environment)
        .eq('is_active', true)
        .single();

      if (subError || !subscription?.stripe_subscription_id) {
        console.error('❌ アクティブなサブスクリプションが見つかりません:', subError);
        throw new Error('アクティブなサブスクリプションが見つかりません');
      }

      const stripeSubscriptionId = subscription.stripe_subscription_id;
      console.log('✅ サブスクリプションID取得:', stripeSubscriptionId);

      // 2. Stripe APIからサブスクリプション詳細を取得（アイテムIDを取得）
      const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

      if (!stripeSubscription.items.data || stripeSubscription.items.data.length === 0) {
        console.error('❌ サブスクリプションアイテムが見つかりません');
        throw new Error('サブスクリプションアイテムが見つかりません');
      }

      const subscriptionItemId = stripeSubscription.items.data[0].id;
      console.log('✅ サブスクリプションアイテムID取得:', subscriptionItemId);

      // 3. 新しいプランのPrice IDを取得
      const newPriceId = getPriceId(planType, duration, environment);
      console.log('✅ 新しいプランのPrice ID:', newPriceId);

      // 4. Deep Link用のflow_dataを設定
      sessionConfig.flow_data = {
        type: 'subscription_update_confirm',
        subscription_update_confirm: {
          subscription: stripeSubscriptionId,
          items: [
            {
              id: subscriptionItemId,
              price: newPriceId,
              quantity: 1
            }
          ]
        }
      };

      console.log('🔗 Deep Link設定完了:', {
        subscription: stripeSubscriptionId,
        item: subscriptionItemId,
        newPrice: newPriceId
      });
    } else {
      console.log('📋 標準モード: Customer Portalトップページに遷移します');
    }

    // Stripe カスタマーポータルセッションを作成
    const session = await stripe.billingPortal.sessions.create(sessionConfig);

    console.log('✅ Customer Portal URL生成成功:', session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error creating customer portal session:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    if (error.response) {
      console.error('❌ Error response:', error.response);
    }
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        errorName: error.name,
        errorStack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
