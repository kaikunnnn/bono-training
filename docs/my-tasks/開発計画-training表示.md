# コミュニティプラン課金機能実装

## 🎯 実装方針

`/training/plan`でコミュニティプランの1ヶ月・3ヶ月プランを選択できる課金導線を実装します。

---

## 1. バックエンド修正: create-checkout/index.ts

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// デバッグログ関数
const logDebug = (message: string, details?: any) => {
  console.log(`[CREATE-CHECKOUT] ${message}${details ? ` ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // リクエストボディを解析 - planPeriodを追加
    const { 
      returnUrl, 
      useTestPrice = false, 
      planType = 'community',
      planPeriod = '1M' // '1M' または '3M'
    } = await req.json();
    
    logDebug("リクエスト受信", { returnUrl, useTestPrice, planType, planPeriod });
    
    if (!returnUrl) {
      throw new Error("リダイレクトURLが指定されていません");
    }

    // Supabaseクライアントの作成
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // 認証ヘッダーから現在のユーザーを取得
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("認証されていません");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("ユーザー情報の取得に失敗しました");
    }
    
    logDebug("ユーザー認証成功", { userId: user.id, email: user.email });
    
    // Stripeクライアントの初期化
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // ユーザーのStripe Customer IDを取得または作成
    let stripeCustomerId: string;
    
    const { data: customerData, error: customerError } = await supabaseClient
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();
    
    if (customerError || !customerData) {
      // Stripe顧客が存在しない場合は新規作成
      logDebug(`${user.id}のStripe顧客情報がDBに存在しないため作成します`);
      
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      
      // 作成した顧客情報をDBに保存
      const { error: insertError } = await supabaseClient
        .from("stripe_customers")
        .insert({
          user_id: user.id,
          stripe_customer_id: customer.id
        });
      
      if (insertError) {
        logDebug("Stripe顧客情報のDB保存に失敗:", insertError);
        throw new Error("顧客情報の保存に失敗しました");
      }
      
      stripeCustomerId = customer.id;
    } else {
      stripeCustomerId = customerData.stripe_customer_id;
      logDebug(`既存のStripe顧客ID ${stripeCustomerId} を使用します`);
    }

    // プランタイプと期間に応じたPrice IDを選択
    let priceId: string | undefined;
    
    // コミュニティプランの期間別Price ID取得
    if (planType === 'community') {
      if (useTestPrice) {
        // テスト環境
        if (planPeriod === '3M') {
          priceId = Deno.env.get("STRIPE_TEST_COMMUNITY_3M_PRICE_ID");
          logDebug("テスト環境のCommunity 3ヶ月プラン使用", { priceId });
        } else {
          priceId = Deno.env.get("STRIPE_TEST_COMMUNITY_1M_PRICE_ID");
          logDebug("テスト環境のCommunity 1ヶ月プラン使用", { priceId });
        }
      } else {
        // 本番環境
        if (planPeriod === '3M') {
          priceId = Deno.env.get("STRIPE_COMMUNITY_3M_PRICE_ID");
          logDebug("本番環境のCommunity 3ヶ月プラン使用", { priceId });
        } else {
          priceId = Deno.env.get("STRIPE_COMMUNITY_1M_PRICE_ID");
          logDebug("本番環境のCommunity 1ヶ月プラン使用", { priceId });
        }
      }
    }
    
    if (!priceId) {
      throw new Error(`指定されたプラン (${planType}/${planPeriod}) のPrice IDが設定されていません`);
    }

    // Checkoutセッションの作成
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: returnUrl,
      metadata: {
        user_id: user.id,
        plan_type: planType,
        plan_period: planPeriod
      }
    });
    
    logDebug("Checkoutセッション作成完了", { 
      sessionId: session.id, 
      url: session.url,
      planType,
      planPeriod
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logDebug("Checkoutセッション作成エラー:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Checkoutセッション作成中にエラーが発生しました" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
```

---

## 2. フロントエンド修正: Training/Plan.tsx

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { createCheckoutSession } from '@/services/stripe';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type PlanPeriod = '1M' | '3M';

const TrainingPlan: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isSubscribed, planType, hasMemberAccess } = useSubscriptionContext();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PlanPeriod>('1M');
  
  // コミュニティプラン情報
  const communityPlans = {
    '1M': {
      id: 'community_1m',
      name: 'コミュニティプラン',
      period: '1ヶ月',
      price: '1,480円/月',
      description: 'トレーニングの全コンテンツにアクセス可能（月額プラン）',
      features: {
        member: true,
        learning: false,
        training: false
      }
    },
    '3M': {
      id: 'community_3m',
      name: 'コミュニティプラン',
      period: '3ヶ月',
      price: '4,200円/3ヶ月',
      description: 'トレーニングの全コンテンツにアクセス可能（3ヶ月プラン・5%割引）',
      savings: '240円お得',
      features: {
        member: true,
        learning: false,
        training: false
      }
    }
  };
  
  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      console.log(`コミュニティプラン ${selectedPeriod} のチェックアウト開始`);
      
      // チェックアウト後に戻るURLを指定
      const returnUrl = window.location.origin + '/profile';
      
      const { url, error } = await createCheckoutSession(
        returnUrl,
        'community', // プランタイプ
        selectedPeriod // プラン期間
      );
      
      if (error) throw error;
      if (url) window.location.href = url;
    } catch (error) {
      console.error('購読エラー:', error);
      toast({
        title: "エラーが発生しました",
        description: "決済処理の開始に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 現在のユーザーがすでにコミュニティプランに加入している場合
  const isCurrentCommunityPlan = isSubscribed && planType === 'community' && hasMemberAccess;
  
  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">トレーニングプラン</h1>
          <p className="text-lg text-gray-600">
            BONOトレーニングの全コンテンツにアクセスして、実践的なスキルを身につけましょう
          </p>
        </div>
        
        {/* プラン期間選択 */}
        <div className="max-w-md mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">プラン期間を選択</CardTitle>
              <CardDescription className="text-center">
                お支払い期間をお選びください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPeriod} onValueChange={(value: PlanPeriod) => setSelectedPeriod(value)}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="1M" id="1M" />
                  <Label htmlFor="1M" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">月額プラン</div>
                        <div className="text-sm text-gray-500">毎月1,480円</div>
                      </div>
                      <div className="text-xl font-bold">¥1,480/月</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 relative">
                  <RadioGroupItem value="3M" id="3M" />
                  <Label htmlFor="3M" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">3ヶ月プラン</div>
                        <div className="text-sm text-gray-500">3ヶ月間4,200円</div>
                        <div className="text-sm text-green-600 font-medium">240円お得！</div>
                      </div>
                      <div className="text-xl font-bold">¥1,400/月</div>
                    </div>
                  </Label>
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    おすすめ
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
        
        {/* 選択されたプランの詳細 */}
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-blue-500">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {communityPlans[selectedPeriod].name}
              </CardTitle>
              <CardDescription>
                {communityPlans[selectedPeriod].description}
              </CardDescription>
              <div className="text-3xl font-bold text-blue-600">
                {communityPlans[selectedPeriod].price}
              </div>
              {selectedPeriod === '3M' && (
                <div className="text-green-600 font-medium">
                  {communityPlans[selectedPeriod].savings}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  すべてのトレーニングコンテンツへのアクセス
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  コミュニティへの参加権限
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  プレミアム教材の閲覧
                </li>
              </ul>
              
              {isCurrentCommunityPlan ? (
                <Button disabled className="w-full">
                  現在のプラン
                </Button>
              ) : (
                <Button 
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? '処理中...' : `${communityPlans[selectedPeriod].period}プランに申し込む`}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-600 max-w-md mx-auto">
          <p>* 会員期間中はいつでも解約可能です</p>
          <p>* 支払いはStripeの安全な決済システムを利用します</p>
          <p>* 3ヶ月プランは一括前払いとなります</p>
        </div>
        
        {isSubscribed && planType && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => navigate('/profile')}>
              プロフィールページに戻る
            </Button>
          </div>
        )}
      </div>
    </TrainingLayout>
  );
};

export default TrainingPlan;
```

---

## 3. サービス層修正: services/stripe.ts

```typescript
export type PlanType = 'community' | 'standard' | 'growth';
export type PlanPeriod = '1M' | '3M';

export const createCheckoutSession = async (
  returnUrl: string,
  planType: PlanType = 'community',
  planPeriod: PlanPeriod = '1M'
): Promise<{ url?: string; error?: Error }> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.access_token) {
      throw new Error('認証が必要です');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.session.access_token}`
      },
      body: JSON.stringify({ 
        returnUrl,
        planType,
        planPeriod,
        useTestPrice: process.env.NODE_ENV === 'development'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'チェックアウトセッションの作成に失敗しました');
    }
    
    const data = await response.json();
    return { url: data.url };
  } catch (error) {
    console.error('チェックアウトセッション作成エラー:', error);
    return { error: error as Error };
  }
};
```

---

## 4. Webhook修正: stripe-webhook/index.ts

```typescript
// determineMembershipAccess関数を修正
function determineMemberAccess(planType: string): boolean {
  // communityプランでもmember権限は付与
  return ['community', 'standard', 'growth'].includes(planType);
}

// handleCheckoutCompleted関数内で
const planType = session.metadata?.plan_type || "community";
const planPeriod = session.metadata?.plan_period || "1M";

// データベース保存時にplan_periodも保存
const { error: userSubError } = await supabase
  .from("user_subscriptions")
  .upsert({
    user_id: userId,
    is_active: true,
    plan_type: planType,
    plan_period: planPeriod, // 追加
    plan_members: determineMemberAccess(planType),
    stripe_subscription_id: subscriptionId,
    updated_at: new Date().toISOString()
  }, { 
    onConflict: 'user_id'
  });
```

---

## 5. テスト手順

1. **開発環境でのテスト**
   ```bash
   # /training/planにアクセス
   # 1ヶ月プランを選択してチェックアウト開始
   # テストカード: 4242 4242 4242 4242 で決済
   # Webhookが正常に処理されることを確認
   ```

2. **データベース確認**
   ```sql
   SELECT 
     u.email,
     us.plan_type,
     us.plan_period,
     us.is_active,
     us.plan_members
   FROM auth.users u
   LEFT JOIN user_subscriptions us ON u.id = us.user_id;
   ```

3. **権限制御確認**
   - 決済後にmember権限コンテンツにアクセス可能か確認
   - 無料ユーザーは制限されるか確認