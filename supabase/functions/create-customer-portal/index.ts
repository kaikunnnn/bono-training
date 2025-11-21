import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { createStripeClient, type StripeEnvironment } from "../_shared/stripe-helpers.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    // リクエストボディから returnUrl, useDeepLink, useTestPrice を取得
    const body = await req.json();
    const returnUrl = body.returnUrl;
    const useDeepLink = body.useDeepLink || false; // ディープリンクを使用するか
    const useTestPrice = body.useTestPrice || false; // テスト環境を使用するか

    // 環境を判定（useTestPriceフラグに基づく）
    const environment: StripeEnvironment = useTestPrice ? 'test' : 'live';

    console.log('Customer Portal リクエスト:', { userId: user.id, returnUrl, useDeepLink, environment });

    // ユーザーのStripe Customer IDを取得
    // 優先順位: 1) アクティブなサブスクリプションに紐づく顧客ID、2) 最新の顧客ID
    let stripeCustomerId: string | null = null;

    // まず、アクティブなサブスクリプションから顧客IDを取得（環境フィルタ付き）
    const { data: activeSubscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .eq('environment', environment)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (activeSubscription?.stripe_customer_id) {
      stripeCustomerId = activeSubscription.stripe_customer_id;
      console.log(`[${environment.toUpperCase()}] アクティブなサブスクリプションから顧客IDを取得:`, stripeCustomerId);
    } else {
      // アクティブなサブスクリプションがない場合は、最新の顧客IDを取得（環境フィルタ付き）
      const { data: customers } = await supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .eq('environment', environment)
        .order('created_at', { ascending: false })
        .limit(1);

      if (customers && customers.length > 0) {
        stripeCustomerId = customers[0].stripe_customer_id;
        console.log(`[${environment.toUpperCase()}] 最新の顧客IDを取得:`, stripeCustomerId);
      }
    }

    // Stripeクライアントの初期化（環境に応じたAPIキーを使用）
    const stripe = createStripeClient(environment);

    if (!stripeCustomerId) {
      console.error('Stripe顧客情報が見つかりません:', { userId: user.id });
      return new Response(
        JSON.stringify({
          error: 'Stripe顧客情報が見つかりません。まずプランに登録してください。'
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
      finalReturnUrl = 'http://localhost:5173/subscription';
    }

    console.log('Customer Portal作成:', { customerId: stripeCustomerId, returnUrl: finalReturnUrl });

    // ディープリンク用のセッション設定
    let sessionConfig: any = {
      customer: stripeCustomerId,
      return_url: finalReturnUrl,
      locale: 'ja', // 日本語で表示
    };

    // ディープリンクが有効な場合、サブスクリプション更新画面に直接遷移
    if (useDeepLink) {
      // アクティブなサブスクリプションIDを取得
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (subError || !subscription?.stripe_subscription_id) {
        console.error('アクティブなサブスクリプションが見つかりません:', { userId: user.id, error: subError });
        return new Response(
          JSON.stringify({
            error: 'アクティブなサブスクリプションが見つかりません。'
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // flow_dataを追加してサブスクリプション更新画面に直接遷移
      sessionConfig.flow_data = {
        type: 'subscription_update',
        subscription_update: {
          subscription: subscription.stripe_subscription_id
        }
      };

      console.log('ディープリンク使用:', { subscriptionId: subscription.stripe_subscription_id });
    }

    // Stripe カスタマーポータルセッションを作成
    const session = await stripe.billingPortal.sessions.create(sessionConfig);

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
