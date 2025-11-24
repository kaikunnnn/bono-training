# サブスクリプションシステム実装計画

作成日: 2025-11-22
参照: [SUBSCRIPTION-IMPLEMENTATION-SPEC.md](./SUBSCRIPTION-IMPLEMENTATION-SPEC.md)

## 📋 実装フェーズ

### Phase 1: Webhook修正（緊急・最優先）

**優先度:** 🔴 **高**
**所要時間:** 30分
**影響範囲:** Backend

#### 📝 作業内容

##### 1.1 Test環境Webhook修正

**ファイル:** `supabase/functions/stripe-webhook-test/index.ts`

**削除する箇所:**
```typescript
// 🔥 Lines 443-477 を削除
// 理由: customer.subscription.updated は既存サブスクリプションの更新を意味する
// 新しいサブスクリプションは作成されていないため、キャンセル不要

// 削除する内容:
// - 他のアクティブなサブスクリプション検索ロジック
// - 自動キャンセルループ
```

**正しい実装:**
```typescript
async function handleSubscriptionUpdated(stripe: any, supabase: any, subscription: any) {
  console.log("🧪 [TEST環境] customer.subscription.updatedイベントを処理中");

  const subscriptionId = subscription.id;
  const customerId = subscription.customer;

  try {
    // ユーザーIDを取得
    const { data: customerData, error: customerError } = await supabase
      .from("stripe_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .eq("environment", ENVIRONMENT)
      .single();

    if (customerError || !customerData) {
      console.error("🧪 [TEST環境] Stripe顧客に紐づくユーザーが見つかりません:", customerError);
      return;
    }

    const userId = customerData.user_id;

    // サブスクリプション情報を抽出
    const planType = determinePlanTypeFromAmount(subscription);
    const duration = determineDurationFromInterval(subscription);

    // DBを更新（このサブスクリプションのみ）
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        plan_type: planType,
        duration: duration,
        is_active: subscription.status === 'active' || subscription.status === 'trialing',
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString()
      })
      .eq("stripe_subscription_id", subscriptionId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("❌ [TEST環境] DB更新エラー:", updateError);
      throw updateError;
    }

    console.log("✅ [TEST環境] サブスクリプション更新完了:", {
      subscriptionId,
      userId,
      planType,
      duration,
      status: subscription.status
    });

  } catch (error) {
    console.error("❌ [TEST環境] handleSubscriptionUpdated エラー:", error);
    throw error;
  }
}
```

##### 1.2 Live環境Webhook修正

**ファイル:** `supabase/functions/stripe-webhook/index.ts`

**作業内容:**
- Test環境と同じ修正を適用
- 自動キャンセルロジックを削除
- シンプルなDB更新のみに

---

### Phase 2: フロントエンド修正

**優先度:** 🟡 **中**
**所要時間:** 1時間
**影響範囲:** Frontend

#### 📝 作業内容

##### 2.1 Subscription.tsx修正

**ファイル:** `src/pages/Subscription.tsx`

**修正箇所:** `handleSubscribe` 関数（lines 56-100）

**Before:**
```typescript
if (isSubscribed) {
  // 既存契約者 → Customer Portal（ディープリンク）に遷移してプラン変更
  console.log('既存契約者: Customer Portal（プラン変更画面）に遷移します', {
    currentPlan: planType,
    currentDuration: currentDuration,
    selectedPlan: selectedPlanType,
    selectedDuration: selectedDuration
  });

  // ディープリンクを使用してサブスクリプション更新画面に直接遷移
  const portalUrl = await getCustomerPortalUrl('/subscription', true);
  window.location.href = portalUrl;
}
```

**After:**
```typescript
if (isSubscribed) {
  // 既存契約者 → updateSubscription APIを呼び出し
  console.log('既存契約者: プラン変更APIを呼び出します', {
    currentPlan: planType,
    currentDuration: currentDuration,
    selectedPlan: selectedPlanType,
    selectedDuration: selectedDuration
  });

  const { success, error } = await updateSubscription(selectedPlanType, selectedDuration);

  if (error) {
    throw error;
  }

  toast({
    title: "プランを変更しました",
    description: `${formatPlanDisplay(selectedPlanType, selectedDuration)}に変更しました。日割り計算が適用されます。`,
  });

  // サブスクリプション情報を再取得
  // ※ SubscriptionContextに refresh メソッドを追加する場合
  // await refreshSubscription();

  // または単純にページリロード
  window.location.reload();
}
```

##### 2.2 updateSubscription関数のインポート

**ファイル:** `src/pages/Subscription.tsx`

**修正箇所:** line 7

**Before:**
```typescript
import { createCheckoutSession, getCustomerPortalUrl } from '@/services/stripe';
```

**After:**
```typescript
import { createCheckoutSession, getCustomerPortalUrl, updateSubscription } from '@/services/stripe';
```

##### 2.3 SubscriptionInfo.tsx修正（オプション）

**ファイル:** `src/components/account/SubscriptionInfo.tsx`

**追加内容:**
- 「決済情報を変更する」ボタンを追加
- `getCustomerPortalUrl(returnUrl, false)` を呼び出し
- Customer Portalは決済情報変更・キャンセル専用に

**実装例:**
```typescript
const handleManagePayment = async () => {
  try {
    const portalUrl = await getCustomerPortalUrl('/account', false);
    window.location.href = portalUrl;
  } catch (error) {
    toast({
      title: "エラーが発生しました",
      description: "決済情報の管理画面を開けませんでした",
      variant: "destructive",
    });
  }
};

// UIに追加
<Button onClick={handleManagePayment}>
  決済情報を変更する
</Button>
```

---

### Phase 3: update-subscription関数の環境対応

**優先度:** 🟢 **低**
**所要時間:** 30分
**影響範囲:** Backend

#### 📝 作業内容

##### 3.1 環境判定の追加

**ファイル:** `supabase/functions/update-subscription/index.ts`

**修正箇所:** Lines 22-54

**Before:**
```typescript
const { planType, duration = 1 } = await req.json();

// ...

// Stripeクライアントの初期化
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});
```

**After:**
```typescript
const { planType, duration = 1, useTestPrice = false } = await req.json();

// ...

import { createStripeClient, type StripeEnvironment } from "../_shared/stripe-helpers.ts";

// 環境を判定
const environment: StripeEnvironment = useTestPrice ? "test" : "live";
logDebug(`Stripe環境: ${environment}`);

// Stripeクライアントの初期化（環境に応じたAPIキーを使用）
const stripe = createStripeClient(environment);
```

##### 3.2 サブスクリプション取得の環境フィルタ

**修正箇所:** Lines 56-61

**Before:**
```typescript
const { data: subscriptionData, error: subError } = await supabaseClient
  .from("user_subscriptions")
  .select("stripe_subscription_id, stripe_customer_id, plan_type")
  .eq("user_id", user.id)
  .single();
```

**After:**
```typescript
const { data: subscriptionData, error: subError } = await supabaseClient
  .from("user_subscriptions")
  .select("stripe_subscription_id, stripe_customer_id, plan_type")
  .eq("user_id", user.id)
  .eq("environment", environment)
  .eq("is_active", true)
  .single();
```

##### 3.3 Price ID取得の環境対応

**修正箇所:** Lines 102-121

**Before:**
```typescript
// Edge Functionでは環境変数から直接取得（VITE_プレフィックスなし）
const planTypeUpper = planType.toUpperCase();
const durationSuffix = duration === 1 ? "1M" : "3M";

// まずSTRIPE_プレフィックスで試行（Edge Function用）
let envVarName = `STRIPE_${planTypeUpper}_${durationSuffix}_PRICE_ID`;
let priceId = Deno.env.get(envVarName);

// 見つからなければVITE_プレフィックスを試行（開発環境用）
if (!priceId) {
  envVarName = `VITE_STRIPE_${planTypeUpper}_${durationSuffix}_PRICE_ID`;
  priceId = Deno.env.get(envVarName);
}
```

**After:**
```typescript
// 環境変数の命名規則: STRIPE_[TEST_]PLANTYPE_DURATION_PRICE_ID
const envPrefix = useTestPrice ? "STRIPE_TEST_" : "STRIPE_";
const planTypeUpper = planType.toUpperCase();
const durationSuffix = duration === 1 ? "1M" : "3M";
const envVarName = `${envPrefix}${planTypeUpper}_${durationSuffix}_PRICE_ID`;

const priceId = Deno.env.get(envVarName);
```

---

### Phase 4: Customer Portal設定確認

**優先度:** 🟢 **低**（確認のみ、変更は不要）
**所要時間:** 10分
**影響範囲:** なし

#### 📝 確認項目

1. **Stripe Dashboard → Settings → Customer Portal**にアクセス

2. **「Subscription management」セクション**を確認:
   - ✅ 「Allow customers to switch plans」がON
   - ✅ 「Prorate subscription updates」がON
   - ℹ️ この設定はPhase 2以降は主に使用しないが、決済情報変更時に有効

3. **「Payment methods」セクション**を確認:
   - ✅ 「Allow customers to update their payment methods」がON

4. **「Cancellation」セクション**を確認:
   - ✅ 「Allow customers to cancel subscriptions」がON

**注意:**
- これらの設定はCustomer Portal経由での操作に影響
- Phase 2以降、プラン変更は主に `update-subscription` Edge Function経由
- Customer Portalは決済情報変更・キャンセル専用として継続利用

---

## 🧪 テスト計画

### Test 2D: Webhook修正の検証

**前提条件:**
- Phase 1完了
- Test環境使用
- アクティブなサブスクリプション: Feedback 1ヶ月

**実施手順:**

1. **準備**
   ```bash
   # Webhook修正がデプロイされていることを確認
   supabase functions list
   ```

2. **プラン変更実行**
   - Customer Portalでプラン変更（Feedback → Standard）
   - またはStripe Dashboard上で手動更新

3. **Webhook確認**
   ```bash
   # Webhookログを確認
   supabase functions logs stripe-webhook-test --tail
   ```

4. **DB確認**
   ```sql
   SELECT
     stripe_subscription_id,
     user_id,
     plan_type,
     duration,
     is_active,
     environment
   FROM user_subscriptions
   WHERE user_id = 'YOUR_USER_ID';
   ```

**期待結果:**
- ✅ `customer.subscription.updated` イベントが処理される
- ✅ DB内のレコードは1つのまま
- ✅ `plan_type` が `standard` に更新
- ✅ `stripe_subscription_id` は変わらない
- ✅ 自動キャンセルロジックは実行されない

**不合格条件:**
- ❌ DB内にレコードが2つ以上
- ❌ 古いサブスクリプションがキャンセルされる
- ❌ 新しいサブスクリプションが作成される

---

### Test 2E: プラン変更End-to-End

**前提条件:**
- Phase 2完了
- Test環境使用
- アクティブなサブスクリプション: Feedback 1ヶ月

**実施手順:**

1. **Subscriptionページにアクセス**
   - http://localhost:8080/subscription

2. **プラン選択**
   - Standard 1ヶ月プランを選択
   - 「変更する」ボタンをクリック

3. **トースト確認**
   - 「プランを変更しました」トーストが表示される

4. **Stripe Dashboard確認**
   - Subscriptions → 対象サブスクリプション
   - Items配下のPrice IDが新しいものに変更
   - サブスクリプションIDは変わらず

5. **Invoice確認**
   - Recent Invoicesに新しいInvoice Draft
   - Invoice Itemsに「Proration」行が存在
   - 金額が日割り計算されている

6. **DB確認**
   ```sql
   SELECT
     stripe_subscription_id,
     user_id,
     plan_type,
     duration,
     is_active,
     environment,
     updated_at
   FROM user_subscriptions
   WHERE user_id = 'YOUR_USER_ID';
   ```

**期待結果:**
- ✅ `updateSubscription` APIが呼ばれる
- ✅ トーストで即座に変更完了を通知
- ✅ Stripeで同じサブスクリプションIDのまま更新
- ✅ Invoice ItemにProration（日割り計算）が追加
- ✅ DBの `plan_type` が `standard` に更新
- ✅ アクティブなサブスクリプションは常に1つ
- ✅ ページリロード後も正しいプランが表示される

**不合格条件:**
- ❌ Customer Portalに遷移してしまう
- ❌ プラン変更が完了しない
- ❌ DB内に複数のアクティブサブスクリプション
- ❌ 日割り計算が適用されていない

---

## 📊 進捗管理

### チェックリスト

#### Phase 1: Webhook修正
- [ ] 1.1 Test環境Webhook修正完了
- [ ] 1.2 Live環境Webhook修正完了
- [ ] Test 2D合格

#### Phase 2: フロントエンド修正
- [ ] 2.1 Subscription.tsx修正完了
- [ ] 2.2 updateSubscription関数インポート完了
- [ ] 2.3 SubscriptionInfo.tsx修正完了（オプション）
- [ ] Test 2E合格

#### Phase 3: update-subscription関数の環境対応
- [ ] 3.1 環境判定追加完了
- [ ] 3.2 サブスクリプション取得の環境フィルタ完了
- [ ] 3.3 Price ID取得の環境対応完了

#### Phase 4: Customer Portal設定確認
- [ ] 設定確認完了

---

## 🚨 ロールバック計画

### Phase 1のロールバック

**問題発生時:**
- Webhookエラーが多発
- サブスクリプションが正しく更新されない

**ロールバック手順:**
```bash
# 以前のWebhook関数に戻す
git revert <commit-hash>
supabase functions deploy stripe-webhook-test
supabase functions deploy stripe-webhook
```

### Phase 2のロールバック

**問題発生時:**
- `updateSubscription` APIがエラー
- ユーザーがプラン変更できない

**ロールバック手順:**
```typescript
// Subscription.tsx を元の実装に戻す
if (isSubscribed) {
  const portalUrl = await getCustomerPortalUrl('/subscription', true);
  window.location.href = portalUrl;
}
```

---

## ✅ 完了条件

すべてのPhaseが完了し、以下の条件を満たすこと:

1. ✅ Test 2D合格（Webhook修正検証）
2. ✅ Test 2E合格（プラン変更End-to-End）
3. ✅ 本番環境でテスト実施
4. ✅ ドキュメント更新（TESTING-LOG.md）

---

## 📝 備考

### 参照ドキュメント

- [Stripe - Change Subscription Price](https://docs.stripe.com/billing/subscriptions/change-price)
- [Stripe - Prorations](https://docs.stripe.com/billing/subscriptions/prorations)
- [Stripe - Customer Portal](https://docs.stripe.com/customer-management/configure-portal)

### 関連ファイル

- `supabase/functions/stripe-webhook-test/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/update-subscription/index.ts`
- `src/pages/Subscription.tsx`
- `src/services/stripe.ts`

### 今後の拡張

- [ ] SubscriptionContextに `refresh()` メソッドを追加
- [ ] プラン変更履歴の記録（audit log）
- [ ] プラン変更時の確認ダイアログ
- [ ] ダウングレード時の警告表示
