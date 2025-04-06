
# Stripe Checkout セッション作成API

## 目的

ユーザーがStripe Checkoutを通じてメンバーシップを購入できるようにする。

## 要件

- Stripeの`checkout.sessions.create()`を呼び出すAPIを作成する
- `stripe_customer_id`をSupabaseのDBから取得する
- 存在しない場合はStripeでCustomerを作成し、DBに保存する
- セッション作成時に`price_id`, `success_url`, `cancel_url`を指定する

## 実装タスク

- `user_id`から`stripe_customer_id`を検索
- StripeでCustomerを作成（必要に応じて）
- Checkoutセッションを作成してフロントにURLを返すAPIを用意
- APIの認証・エラー処理を実装

## 実装例

```typescript
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
    // Supabaseクライアントの初期化
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // ユーザー認証
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("認証に失敗しました");
    }
    
    const userId = userData.user.id;
    
    // リクエストボディからパラメータ取得
    const { returnUrl, useTestPrice } = await req.json();
    
    if (!returnUrl) {
      throw new Error("リダイレクトURLが指定されていません");
    }

    // Stripe初期化
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // DBからstripe_customer_idを取得
    const { data: customerData } = await supabaseClient
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    let stripeCustomerId = customerData?.stripe_customer_id;

    // Stripeカスタマーが存在しない場合は作成
    if (!stripeCustomerId) {
      const { data: { user } } = await supabaseClient.auth.admin.getUserById(userId);
      
      if (!user || !user.email) {
        throw new Error("ユーザー情報の取得に失敗しました");
      }

      // Stripeでカスタマーを作成
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: userId }
      });
      
      stripeCustomerId = customer.id;
      
      // DBに保存
      await supabaseClient
        .from("stripe_customers")
        .insert({
          user_id: userId,
          stripe_customer_id: stripeCustomerId
        });
    }

    // 環境に応じたプライスIDを取得
    const priceId = useTestPrice 
      ? Deno.env.get("STRIPE_TEST_PRICE_ID") 
      : Deno.env.get("STRIPE_PRICE_ID");

    // チェックアウトセッション作成
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: "subscription",
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
    });

    // フロントにリダイレクトURLを返す
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Checkoutセッション作成エラー:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
```

## フロントエンド側の実装

```typescript
// Checkoutセッションの作成を呼び出す関数
export const createCheckoutSession = async (
  returnUrl: string,
  isTest?: boolean
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        returnUrl,
        useTestPrice: isTest || import.meta.env.MODE !== 'production' 
      }
    });
    
    if (error) {
      throw new Error('決済処理の準備に失敗しました');
    }
    
    return { url: data.url, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
};
```

## 必要なSupabase Edge Function設定

`supabase/config.toml`にEdge Functionを追加：

```toml
[functions.create-checkout]
verify_jwt = true
```

## 必要な環境変数

Supabase Edge Functionsの環境変数として以下を設定する必要があります：

- `STRIPE_SECRET_KEY` - Stripeシークレットキー
- `STRIPE_PRICE_ID` - 本番環境用のプランのPrice ID
- `STRIPE_TEST_PRICE_ID` - テスト環境用のプランのPrice ID
