# Stripe Webhook実装のベストプラクティスと注意点

**作成日**: 2025-11-18
**目的**: Stripe Webhookの実装で失敗を回避するための仕様・学び

---

## 📋 重要な前提知識

### 1. Webhookイベントの発火タイミング

**1つのユーザーアクション → 複数のWebhookイベントが発火する**

#### 例: プラン変更時

```
ユーザーがCustomer Portalでプラン変更
    ↓
Stripe側で以下のイベントが順次発火:
1. customer.subscription.updated
2. invoice.created
3. invoice.finalized
4. invoice.paid
5. payment_intent.succeeded
6. charge.succeeded
```

**重要**: これらのイベントは**ほぼ同時**に発火し、**順序は保証されない**

---

### 2. Webhookイベントの実行順序

**❌ 間違った前提**:
- 「`customer.subscription.updated`が最初に実行される」
- 「後続のイベントは前のイベントの結果を引き継ぐ」

**✅ 正しい理解**:
- イベントの実行順序は**ランダム**
- 各イベントハンドラーは**独立して実行**される
- 後のイベントが先に実行される可能性もある

#### 実例: プラン表示不一致問題

```typescript
// ❌ 問題のあった実装
async function handleSubscriptionUpdated() {
  // Price IDから判定
  planType = "standard"; // ✅ 正しい
  // データベース更新
}

async function handleInvoicePaid() {
  // metadataから判定
  planType = subscription.metadata?.plan_type || "community"; // ❌ 空なので "community"
  // データベース更新 → 上書き
}
```

**結果**: `invoice.paid`が後に実行されると、正しい値が`"community"`で上書きされる

---

## 🎯 ベストプラクティス

### 1. **すべてのWebhookハンドラーで同じ判定ロジックを使用する**

**原則**: どのイベントが後に実行されても、同じ結果になるようにする

#### ✅ 良い例

```typescript
// 共通の判定関数を作成
function determinePlanFromPriceId(priceId: string): { planType: string; duration: number } {
  const STANDARD_1M = Deno.env.get("STRIPE_TEST_STANDARD_1M_PRICE_ID") || Deno.env.get("STRIPE_STANDARD_1M_PRICE_ID");
  const STANDARD_3M = Deno.env.get("STRIPE_TEST_STANDARD_3M_PRICE_ID") || Deno.env.get("STRIPE_STANDARD_3M_PRICE_ID");
  const FEEDBACK_1M = Deno.env.get("STRIPE_TEST_FEEDBACK_1M_PRICE_ID") || Deno.env.get("STRIPE_FEEDBACK_1M_PRICE_ID");
  const FEEDBACK_3M = Deno.env.get("STRIPE_TEST_FEEDBACK_3M_PRICE_ID") || Deno.env.get("STRIPE_FEEDBACK_3M_PRICE_ID");

  if (priceId === STANDARD_1M) return { planType: "standard", duration: 1 };
  if (priceId === STANDARD_3M) return { planType: "standard", duration: 3 };
  if (priceId === FEEDBACK_1M) return { planType: "feedback", duration: 1 };
  if (priceId === FEEDBACK_3M) return { planType: "feedback", duration: 3 };

  console.warn(`未知のPrice ID: ${priceId}`);
  return { planType: "community", duration: 1 };
}

// すべてのハンドラーで使用
async function handleSubscriptionUpdated(subscription: any) {
  const priceId = subscription.items.data[0].price.id;
  const { planType, duration } = determinePlanFromPriceId(priceId);
  // データベース更新
}

async function handleInvoicePaid(invoice: any) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const priceId = subscription.items.data[0].price.id;
  const { planType, duration } = determinePlanFromPriceId(priceId);
  // データベース更新
}
```

#### ❌ 悪い例

```typescript
// ハンドラーごとに異なる判定ロジック
async function handleSubscriptionUpdated() {
  // Price IDで判定
  const plan = determinePlanFromPriceId(priceId);
}

async function handleInvoicePaid() {
  // metadataで判定（異なるロジック！）
  const plan = subscription.metadata?.plan_type || "community";
}
```

---

### 2. **Price IDベースの判定を使用する**

**優先順位**:
1. ✅ **Price ID** - 最も信頼性が高い
2. ⚠️ Product ID - まあまあ信頼性がある
3. ❌ metadata - 手動設定が必要、空の可能性あり
4. ❌ 金額 (unit_amount) - 価格変更で壊れる

#### Price IDの利点

- Stripeが自動で設定
- サブスクリプションの全イベントで一貫して取得可能
- 期間（1ヶ月/3ヶ月）も区別できる
- 価格変更の影響を受けない

#### 実装例

```typescript
// ✅ 推奨: Price IDで判定
const priceId = subscription.items.data[0].price.id;
if (priceId === STANDARD_1M_PRICE_ID) {
  planType = "standard";
  duration = 1;
}

// ❌ 非推奨: 金額で判定
const amount = subscription.items.data[0].price.unit_amount;
if (amount === 498000) { // 4,980円 - 価格変更で壊れる
  planType = "standard";
}

// ❌ 非推奨: metadataで判定
const planType = subscription.metadata?.plan_type || "community"; // 空の可能性
```

---

### 3. **環境変数の命名規則を統一する**

#### Supabase Edge Function用の環境変数

```bash
# テスト環境
STRIPE_TEST_STANDARD_1M_PRICE_ID=price_xxxxx
STRIPE_TEST_STANDARD_3M_PRICE_ID=price_xxxxx
STRIPE_TEST_FEEDBACK_1M_PRICE_ID=price_xxxxx
STRIPE_TEST_FEEDBACK_3M_PRICE_ID=price_xxxxx

# 本番環境
STRIPE_STANDARD_1M_PRICE_ID=price_xxxxx
STRIPE_STANDARD_3M_PRICE_ID=price_xxxxx
STRIPE_FEEDBACK_1M_PRICE_ID=price_xxxxx
STRIPE_FEEDBACK_3M_PRICE_ID=price_xxxxx
```

#### フロントエンド用の環境変数（.env）

```bash
# VITE_プレフィックスが必要
VITE_STRIPE_STANDARD_1M_PRICE_ID=price_xxxxx
VITE_STRIPE_STANDARD_3M_PRICE_ID=price_xxxxx
VITE_STRIPE_FEEDBACK_1M_PRICE_ID=price_xxxxx
VITE_STRIPE_FEEDBACK_3M_PRICE_ID=price_xxxxx
```

#### Edge Functionでの環境変数取得

```typescript
// テスト環境と本番環境の両方に対応
const STANDARD_1M = Deno.env.get("STRIPE_TEST_STANDARD_1M_PRICE_ID")
                 || Deno.env.get("STRIPE_STANDARD_1M_PRICE_ID");
```

---

### 4. **データベース更新は冪等性を保つ**

**冪等性**: 同じ操作を何度実行しても、結果が変わらない性質

#### ✅ 良い例

```typescript
// UPSERTを使用（存在しなければINSERT、存在すればUPDATE）
const { error } = await supabase
  .from("user_subscriptions")
  .upsert({
    user_id: userId,
    plan_type: planType,
    duration: duration,
    stripe_subscription_id: subscriptionId,
    is_active: true,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id' // user_idが重複したらUPDATE
  });
```

#### ❌ 悪い例

```typescript
// 常にINSERTを試みる（重複エラーの可能性）
const { error } = await supabase
  .from("user_subscriptions")
  .insert({
    user_id: userId,
    plan_type: planType,
    // ...
  });
```

---

### 5. **ログを詳細に記録する**

**目的**: 問題発生時に原因を特定できるようにする

#### 必須のログ項目

```typescript
async function handleSubscriptionUpdated(subscription: any) {
  console.log("=== customer.subscription.updated ===");
  console.log("Subscription ID:", subscription.id);
  console.log("Customer ID:", subscription.customer);
  console.log("Price ID:", subscription.items.data[0].price.id);
  console.log("Status:", subscription.status);

  const { planType, duration } = determinePlanFromPriceId(priceId);
  console.log("判定結果:", { planType, duration });

  // データベース更新
  console.log("データベース更新完了:", { userId, planType, duration });
}
```

#### デバッグ時の追加ログ

```typescript
// 環境変数の確認
console.log("環境変数:", {
  STANDARD_1M,
  STANDARD_3M,
  FEEDBACK_1M,
  FEEDBACK_3M
});

// 比較結果の詳細
console.log("比較結果:", {
  priceId,
  "priceId === STANDARD_1M": priceId === STANDARD_1M,
  "priceId === STANDARD_3M": priceId === STANDARD_3M,
  "priceId === FEEDBACK_1M": priceId === FEEDBACK_1M,
  "priceId === FEEDBACK_3M": priceId === FEEDBACK_3M
});
```

---

## 🚨 よくある失敗パターン

### 失敗1: 金額ベースの判定

```typescript
// ❌ 金額で判定
if (amount === 498000) { // 4,980円
  planType = "standard";
}
```

**問題点**:
- 価格変更時に壊れる
- テスト環境と本番環境で金額が異なる可能性
- 通貨によって金額の表現が異なる（円: 498000、ドル: 4980）

**解決策**: Price IDで判定

---

### 失敗2: metadataへの依存

```typescript
// ❌ metadataに依存
const planType = subscription.metadata?.plan_type || "community";
```

**問題点**:
- metadataは手動設定が必要
- Checkout時にmetadataを設定し忘れる可能性
- 空の場合にデフォルト値（"community"）になる

**解決策**: Price IDで判定

---

### 失敗3: イベントハンドラーごとに異なるロジック

```typescript
// ❌ subscription.updatedとinvoice.paidで異なるロジック
async function handleSubscriptionUpdated() {
  const plan = determinePlanFromPriceId(priceId); // Price ID判定
}

async function handleInvoicePaid() {
  const plan = subscription.metadata?.plan_type || "community"; // metadata判定
}
```

**問題点**:
- レースコンディション発生
- 後に実行されたイベントが結果を上書き

**解決策**: すべてのハンドラーで同じロジックを使用

---

### 失敗4: 環境変数の設定ミス

```typescript
// Edge Functionのコード
const STANDARD_1M = Deno.env.get("VITE_STRIPE_STANDARD_1M_PRICE_ID"); // ❌ VITE_は不要
```

**問題点**:
- Edge FunctionではVITE_プレフィックスは使わない
- フロントエンドとバックエンドで環境変数名が異なる

**解決策**:
- Edge Function: `STRIPE_TEST_STANDARD_1M_PRICE_ID`
- フロントエンド: `VITE_STRIPE_STANDARD_1M_PRICE_ID`

---

## 📚 Stripe製品とプラン名のマッピング

### プロジェクト固有の命名

このプロジェクトでは、Stripe製品名とシステム内部名が異なる：

| Stripe製品名 | システム内部名 | plan_type値 |
|-------------|--------------|------------|
| スタンダードプラン | スタンダードプラン | `standard` |
| **グロースプラン** | **フィードバックプラン** | `feedback` |

**重要**: Stripe上では「グロースプラン」、システム内では「フィードバックプラン」として扱う

### Price ID一覧

```typescript
// スタンダードプラン
STRIPE_TEST_STANDARD_1M_PRICE_ID=price_1OIiOUKUVUnt8GtyOfXEoEvW  // 4,980円/月
STRIPE_TEST_STANDARD_3M_PRICE_ID=price_1OIiPpKUVUnt8Gty0OH3Pyip  // 4,780円/月（3ヶ月）

// フィードバックプラン（Stripe上は「グロースプラン」）
STRIPE_TEST_FEEDBACK_1M_PRICE_ID=price_1OIiMRKUVUnt8GtyMGSJIH8H  // 9,999円/月
STRIPE_TEST_FEEDBACK_3M_PRICE_ID=price_1OIiMRKUVUnt8GtyttXJ71Hz  // 9,799円/月（3ヶ月）
```

---

## 🔍 デバッグ手順

### 1. Stripe Dashboardでイベントを確認

1. Stripe Dashboard → Webhooks → Events
2. 該当時刻のイベントをクリック
3. Request bodyで`price.id`を確認
4. Responseでステータスコードを確認

### 2. Supabase Edge Functionのログを確認

1. Supabase Dashboard → Functions → stripe-webhook
2. Logsタブを開く
3. 該当時刻のログを確認
4. 判定結果とデータベース更新のログを確認

### 3. 環境変数を確認

```bash
# Supabase Secretsを確認
npx supabase secrets list

# 特定のSecretの値を確認（Dashboard経由）
# https://supabase.com/dashboard/project/[PROJECT_ID]/settings/vault/secrets
```

### 4. データベースの状態を確認

```sql
SELECT
  user_id,
  plan_type,
  duration,
  is_active,
  stripe_subscription_id,
  updated_at
FROM user_subscriptions
WHERE user_id = 'xxxxx';
```

---

## ✅ チェックリスト

### 新しいプランを追加する時

- [ ] Stripe Dashboardで製品とPriceを作成
- [ ] Price IDをコピー
- [ ] `.env`にフロントエンド用環境変数を追加（`VITE_`プレフィックス）
- [ ] Supabase Secretsにバックエンド用環境変数を追加（`STRIPE_TEST_`プレフィックス）
- [ ] `determinePlanFromPriceId`関数に判定ロジックを追加
- [ ] すべてのWebhookハンドラーが同じロジックを使用していることを確認
- [ ] デプロイしてテスト

### Webhookハンドラーを修正する時

- [ ] すべての関連ハンドラーで同じロジックを使用しているか確認
- [ ] Price IDベースの判定を使用しているか確認
- [ ] 詳細なログを追加
- [ ] デプロイ
- [ ] テスト環境でプラン変更をテスト
- [ ] Stripe Webhookイベントログを確認
- [ ] Supabase Edge Functionログを確認
- [ ] データベースの値を確認
- [ ] すべてのページで表示が一致することを確認

---

## 📖 参考資料

### Stripe公式ドキュメント

- [Webhooks](https://docs.stripe.com/webhooks)
- [Customer Portal](https://docs.stripe.com/customer-management/integrate-customer-portal)
- [Subscription Lifecycle](https://docs.stripe.com/billing/subscriptions/overview)
- [Event Types](https://docs.stripe.com/api/events/types)

### Supabase Edge Functions

- [Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Environment Variables](https://supabase.com/docs/guides/functions/secrets)

---

**最終更新**: 2025-11-18
**作成者**: Claude Code
