
// supabase/functions/check-subscription/index.ts
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // OPTIONSリクエスト（CORS）の処理
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Supabaseクライアントの初期化
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    // ユーザー認証情報を取得
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // Stripeクライアントの初期化
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { 
      apiVersion: '2023-10-16' 
    });
    
    // SupabaseデータベースからStripeカスタマーIDを取得
    const { data: customerData } = await supabaseClient
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();
      
    if (!customerData?.stripe_customer_id) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // アクティブなサブスクリプションを確認
    const subscriptions = await stripe.subscriptions.list({
      customer: customerData.stripe_customer_id,
      status: 'active',
      limit: 1
    });
    
    const hasActiveSubscription = subscriptions.data.length > 0;
    
    return new Response(JSON.stringify({ subscribed: hasActiveSubscription }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('サブスクリプション確認エラー:', error);
    return new Response(
      JSON.stringify({ error: error.message, subscribed: false }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
