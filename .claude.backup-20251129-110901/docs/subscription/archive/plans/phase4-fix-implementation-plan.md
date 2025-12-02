# Phase 4 修正実装計画

**作成日**: 2025-11-28
**前提**: Phase 4テストで発見された重大バグの修正

**関連ドキュメント**:
- `2025-11-28-phase4-test-critical-bugs.md`
- `2025-11-28-root-cause-analysis.md`

---

## 📋 修正タスク一覧

### Phase 1: Webhook 401エラーの修正 🚨
**優先度**: 最高
**理由**: これを修正しないと何も動かない

#### Task 1-1: stripe-webhook/index.ts の確認
- [ ] Webhook署名検証のコードを確認
- [ ] 環境変数の取得方法を確認
- [ ] エラーログの詳細を確認

#### Task 1-2: 環境変数の確認と修正
- [ ] Supabase Dashboard → Edge Functions → Secrets
- [ ] `STRIPE_WEBHOOK_SECRET` の値を確認
- [ ] テスト環境用と本番環境用が正しく設定されているか確認

#### Task 1-3: Stripe Dashboard の確認
- [ ] Stripe Dashboard → Developers → Webhooks
- [ ] Webhook Endpoint URLが正しいか確認
- [ ] Webhook Secretが正しいか確認

#### Task 1-4: Webhook修正とデプロイ
- [ ] 必要に応じてコード修正
- [ ] Edge Functionを再デプロイ
- [ ] ログで401エラーが解消されたことを確認

---

### Phase 2: プラン料金をStripeから取得 💰
**優先度**: 高
**理由**: ユーザーに誤った金額を表示してはいけない

#### Option A: Stripe Price API を使用（推奨）

**実装箇所**:
1. 新規 Edge Function: `get-plan-prices`
2. フロントエンド: `src/utils/subscriptionPlans.ts`
3. フロントエンド: `src/pages/Subscription.tsx`

**実装手順**:

##### Step 2A-1: Edge Function `get-plan-prices` の作成
```typescript
// supabase/functions/get-plan-prices/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createStripeClient } from "../_shared/stripe-helpers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = createStripeClient(ENVIRONMENT);

    // 環境変数からPrice IDを取得
    const envPrefix = ENVIRONMENT === 'test' ? "STRIPE_TEST_" : "STRIPE_";

    const priceIds = {
      standard_1m: Deno.env.get(`${envPrefix}STANDARD_1M_PRICE_ID`),
      standard_3m: Deno.env.get(`${envPrefix}STANDARD_3M_PRICE_ID`),
      feedback_1m: Deno.env.get(`${envPrefix}FEEDBACK_1M_PRICE_ID`),
      feedback_3m: Deno.env.get(`${envPrefix}FEEDBACK_3M_PRICE_ID`),
    };

    // Stripe APIで実際の料金を取得
    const prices: Record<string, any> = {};

    for (const [key, priceId] of Object.entries(priceIds)) {
      if (priceId) {
        const price = await stripe.prices.retrieve(priceId);
        prices[key] = {
          id: price.id,
          unit_amount: price.unit_amount, // 円単位（例: 4980 = ¥4,980）
          currency: price.currency,
          recurring: price.recurring,
        };
      }
    }

    return new Response(JSON.stringify({ prices, environment: ENVIRONMENT }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("料金取得エラー:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
```

##### Step 2A-2: フロントエンドで料金を取得
```typescript
// src/services/stripe.ts に追加

export async function getPlanPrices() {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase.functions.invoke('get-plan-prices');

  if (error) {
    console.error('料金取得エラー:', error);
    return { prices: null, error };
  }

  return { prices: data.prices, error: null };
}
```

##### Step 2A-3: Subscription.tsx で使用
```typescript
// src/pages/Subscription.tsx

const [planPrices, setPlanPrices] = useState<Record<string, any> | null>(null);

useEffect(() => {
  // 料金を取得
  getPlanPrices().then(({ prices, error }) => {
    if (!error && prices) {
      setPlanPrices(prices);
    }
  });
}, []);

// プラン定義を動的に生成
const plans = planPrices ? [
  {
    id: 'standard',
    name: 'スタンダード',
    durations: [
      {
        months: 1,
        price: planPrices.standard_1m.unit_amount,
        priceLabel: `${(planPrices.standard_1m.unit_amount).toLocaleString()}円/月`
      },
      // ...
    ]
  }
] : defaultPlans; // フォールバック用のデフォルト値
```

#### Option B: 環境変数で料金を管理（簡易版）

**実装手順**:

##### Step 2B-1: 環境変数に料金を追加
```bash
# Supabase Dashboard → Edge Functions → Secrets

STRIPE_TEST_STANDARD_1M_PRICE=4980
STRIPE_TEST_STANDARD_3M_PRICE=3800
STRIPE_TEST_FEEDBACK_1M_PRICE=1480
STRIPE_TEST_FEEDBACK_3M_PRICE=1280
```

##### Step 2B-2: subscriptionPlans.ts を修正
```typescript
// src/utils/subscriptionPlans.ts

const PLAN_PRICES = {
  standard_1m: import.meta.env.VITE_STANDARD_1M_PRICE || 4980,
  standard_3m: import.meta.env.VITE_STANDARD_3M_PRICE || 3800,
  feedback_1m: import.meta.env.VITE_FEEDBACK_1M_PRICE || 1480,
  feedback_3m: import.meta.env.VITE_FEEDBACK_3M_PRICE || 1280,
};

export const AVAILABLE_PLANS: PlanInfo[] = [
  {
    type: 'standard',
    duration: 1,
    displayName: 'スタンダード（1ヶ月）',
    description: '全てのコンテンツにアクセスできる基本プラン',
    pricePerMonth: PLAN_PRICES.standard_1m // ← 環境変数から取得
  },
  // ...
];
```

**推奨**: Option A（Stripe Price API）
- **理由**: Stripeの実際の値と常に一致する
- 料金変更時にコードやenv変更が不要

---

### Phase 3: プラン選択バグの調査と修正 🔍
**優先度**: 中

#### Task 3-1: フロントエンドのログ確認
```typescript
// Subscription.tsx の handleSubscribe にログ追加
console.log('選択されたプラン:', {
  selectedPlanType,
  selectedDuration,
  selectedNewPlan
});
```

#### Task 3-2: Edge Functionのログ確認
```typescript
// create-checkout/index.ts のログ確認
logDebug("リクエスト受信", { returnUrl, planType, duration, environment: ENVIRONMENT });
logDebug(`Price ID環境変数 ${envVarName}:`, { priceId });
```

#### Task 3-3: 環境変数の確認
```bash
# Supabase Dashboard で確認
STRIPE_TEST_STANDARD_1M_PRICE_ID=price_xxx
STRIPE_TEST_STANDARD_3M_PRICE_ID=price_xxx
STRIPE_TEST_FEEDBACK_1M_PRICE_ID=price_xxx
STRIPE_TEST_FEEDBACK_3M_PRICE_ID=price_xxx
STRIPE_TEST_GROWTH_1M_PRICE_ID=price_xxx  ← なぜこれが使われた？
```

---

### Phase 4: UX改善（オプション）
**優先度**: 低（Phase 1-3完了後に検討）

#### Option 1: モーダルを削除してCheckoutのみ
- [ ] `PlanChangeConfirmModal` を削除
- [ ] 直接 Checkoutに遷移
- [ ] プロレーション計算をSkip

#### Option 2: Deep Link（Customer Portal）に移行
- [ ] `create-customer-portal/index.ts` の `isDeepLinkMode = true` に変更
- [ ] 二重課金監視Webhookを強化
- [ ] モーダルを削除

#### Option 3: Option 3の完全実装
- [ ] Webhookを完全に修正
- [ ] Checkout画面の表示を改善（できれば）
- [ ] モーダルの説明文を改善

---

## 🧪 テスト計画

### Phase 1修正後のテスト
1. **Webhook 200 OK確認**
   ```bash
   # Edge Functionログで確認
   POST | 200 | stripe-webhook
   ```

2. **データベース更新確認**
   ```sql
   SELECT * FROM user_subscriptions WHERE user_id = 'test_user_id';
   ```

3. **/subscription ページで表示確認**
   - [ ] 現在のプランが正しく表示される
   - [ ] `subscribed: true` になっている

### Phase 2修正後のテスト
1. **料金表示確認**
   - [ ] モーダルで正しい料金が表示される
   - [ ] Stripeの実際の値と一致している

2. **プロレーション計算確認**
   - [ ] 返金額が正しい
   - [ ] 新プラン請求額が正しい
   - [ ] 合計金額が正しい

### Phase 3修正後のテスト
1. **プラン選択確認**
   - [ ] Feedbackを選択 → Feedbackが作成される
   - [ ] Standardを選択 → Standardが作成される
   - [ ] 間違ったプランが作成されない

---

## 📅 実装スケジュール

### Day 1: Webhook修正（最優先）
- [ ] Task 1-1: コード確認
- [ ] Task 1-2: 環境変数確認
- [ ] Task 1-3: Stripe Dashboard確認
- [ ] Task 1-4: 修正とデプロイ
- [ ] テスト実施

### Day 2: 料金取得実装
- [ ] Step 2A-1: Edge Function作成
- [ ] Step 2A-2: フロントエンド実装
- [ ] Step 2A-3: Subscription.tsx修正
- [ ] テスト実施

### Day 3: プラン選択バグ修正
- [ ] Task 3-1~3-3: 調査
- [ ] 必要に応じて修正
- [ ] テスト実施

### Day 4: 統合テスト
- [ ] Test 2B 再実施
- [ ] 全パターンテスト
- [ ] ドキュメント更新

---

## 📝 完了条件

### Phase 1完了
- [x] Webhook 401エラーが解消
- [x] POST | 200 | stripe-webhook
- [x] データベースが正しく更新される
- [x] /subscription で現在のプランが表示される

### Phase 2完了
- [x] Stripeの実際の料金が表示される
- [x] プロレーション計算が正しい
- [x] ハードコード値が削除されている

### Phase 3完了
- [x] 選択したプランが正しく作成される
- [x] 間違ったプランが作成されない

### 全Phase完了
- [x] Test 2B が成功する
- [x] 二重課金が発生しない
- [x] ユーザー体験が良好

---

**作成日**: 2025-11-28
**最終更新**: 2025-11-28
