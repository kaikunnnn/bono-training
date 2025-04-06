
// supabase/functions/create-checkout/index.ts
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
    // リクエストボディを解析
    const { returnUrl, useTestPrice } = await req.json();
    
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
    
    if (!user?.email) {
      throw new Error('認証されていないか、メールアドレスが利用できません');
    }
    
    // Stripeクライアントの初期化
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { 
      apiVersion: '2023-10-16' 
    });
    
    // 既存のStripeカスタマーレコードを確認
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // 新しいカスタマーを作成
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
      
      // オプション: SupabaseデータベースにStripeカスタマーIDを保存
      await supabaseClient.from('stripe_customers').insert({
        user_id: user.id,
        stripe_customer_id: customerId
      });
    }
    
    // 環境に応じたPrice IDを選択
    const priceId = useTestPrice 
      ? Deno.env.get('NEXT_PUBLIC_STRIPE_TEST_PRICE_ID')
      : Deno.env.get('NEXT_PUBLIC_STRIPE_PRICE_ID');
      
    if (!priceId) {
      throw new Error('Price IDが設定されていません');
    }
    
    // Checkoutセッションを作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: returnUrl || req.headers.get('origin') || '',
      cancel_url: req.headers.get('origin') || '',
      allow_promotion_codes: true
    });
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Checkoutセッション作成エラー:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
