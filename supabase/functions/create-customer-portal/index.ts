import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
});

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

    // リクエストボディから returnUrl と useDeepLink を取得
    const body = await req.json();
    const returnUrl = body.returnUrl;
    const useDeepLink = body.useDeepLink || false; // ディープリンクを使用するか

    console.log('Customer Portal リクエスト:', { userId: user.id, returnUrl, useDeepLink });

    // ユーザーのStripe Customer IDを取得
    const { data: customer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (customerError || !customer?.stripe_customer_id) {
      console.error('Stripe顧客情報が見つかりません:', { userId: user.id, error: customerError });
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

    console.log('Customer Portal作成:', { customerId: customer.stripe_customer_id, returnUrl: finalReturnUrl });

    // ディープリンク用のセッション設定
    let sessionConfig: any = {
      customer: customer.stripe_customer_id,
      return_url: finalReturnUrl,
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
    console.error('Error creating customer portal session:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
