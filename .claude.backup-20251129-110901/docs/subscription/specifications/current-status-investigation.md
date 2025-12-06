# 現状調査結果 - Stripe Webhook問題

**調査日時**: 2025-11-29
**調査者**: Claude (Opus 4.5)

---

## 🚨 発見された問題

### 1. Webhook 401エラー（根本原因）

**症状**:
- Stripe Webhookが401エラーで失敗している
- これにより以下の問題が発生:
  - ✅ Checkout完了 → 新しいサブスクリプション作成
  - ❌ Webhook失敗 → 古いサブスクリプションがキャンセルされない（**二重課金**）
  - ❌ Webhook失敗 → DBが更新されない → `subscribed: false`のまま
  - ❌ Webhook失敗 → プラン情報が表示されない

**ログ証拠**:
```
POST | 401 | stripe-webhook
timestamp: 1764379307022000 (2025-11-29 10:28:27)
timestamp: 1764379107723000 (2025-11-29 10:25:07)
```

### 2. Webhook URLのミスマッチ

**Stripe Dashboard設定**:
- Endpoint URL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook-test`
- 名前: Supabase Edge Function (Test)
- イベント:
  - checkout.session.completed
  - customer.subscription.created
  - customer.subscription.deleted
  - customer.subscription.updated
  - invoice.paid
  - invoice.payment_failed

**アプリが実際に使用しているURL**:
- `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook`

**問題**: URLが異なるため、Stripeからのイベントが正しいWebhook関数に届いていない

---

## 📂 プロジェクト構成

### Webhook関数（2つ存在）

```
supabase/functions/
├── stripe-webhook/          ← メイン（本番用？）
│   └── index.ts
└── stripe-webhook-test/     ← テスト用
    └── index.ts
```

**stripe-webhook/index.ts**:
```typescript
// 環境変数から環境を取得（デフォルトはtest）
const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';
```
- デフォルトは `test`
- `STRIPE_MODE` 環境変数で切り替え可能

**Webhook Secret取得ロジック** (`_shared/stripe-helpers.ts`):
```typescript
export function getWebhookSecret(environment: StripeEnvironment): string {
  const envVarName = environment === 'test'
    ? 'STRIPE_WEBHOOK_SECRET_TEST'
    : 'STRIPE_WEBHOOK_SECRET_LIVE';

  const secret = Deno.env.get(envVarName);

  if (!secret) {
    throw new Error(`${envVarName} is not set in environment variables`);
  }

  return secret;
}
```

---

## 🗄️ データベース状態

### テストユーザー: kyasya00@gmail.com

**user_subscriptions テーブル**:
```json
{
  "id": "992ca97b-2688-43a6-a932-0f22a54f883a",
  "user_id": "c18e3b81-864d-46c7-894e-62ed0e889876",
  "stripe_customer_id": "cus_TVIqdyp7mGOOib",
  "stripe_subscription_id": "sub_1SYczlKUVUnt8Gty6zun2AUS",
  "plan_type": "feedback",
  "duration": 1,
  "is_active": false,          // ← 古いサブスクリプション（非アクティブ）
  "environment": "test",
  "cancel_at_period_end": false,
  "current_period_end": "2025-12-29 01:30:40+00",
  "created_at": "2025-11-28 06:40:51.120335+00",
  "updated_at": "2025-11-29 01:30:49.444996+00",
  "email": "kyasya00@gmail.com"
}
```

**問題**:
- DB内には1件のサブスクリプションのみ（`is_active: false`）
- Stripeで作成された新しいサブスクリプションがDBに記録されていない
- これはWebhookが動作していない証拠

### Stripeダッシュボードの状態

**テスト結果** (MASTER_PLAN.md より):
```
実施日時: 2025-11-29 10:29

Stripe ダッシュボード:
- メールアドレス: kyasya00@gmail.com
- サブスクリプション:
  1. グロースプラン (有効) - 毎月ごとに請求 - 次の請求書: 12/29 に ￥185
  2. グロースプラン (有効) - [DUPLICATE SUBSCRIPTION]
```

**二重課金確認**: Stripe上に2つのアクティブなサブスクリプションが存在

---

## 🔧 関連コードの状態

### create-checkout/index.ts (lines 178-187)

```typescript
// 既存サブスクリプションIDをmetadataに追加（Webhookでキャンセルするため）
// これにより、Checkout完了「後」に既存サブスクがキャンセルされる
// ユーザーがCheckout画面で離脱しても既存サブスクは残るため安全
if (activeSubscriptions.length > 0) {
  logDebug(
    `${activeSubscriptions.length}件の既存サブスクリプションをmetadataに記録（Webhook経由でキャンセルします）`
  );
  // 複数ある場合は最初の1つをmetadataに記録（Webhook側で全てのアクティブサブスクをキャンセル）
  sessionMetadata.replace_subscription_id = activeSubscriptions[0].stripe_subscription_id;
}
```

**意図**: Checkoutセッション完了後、Webhookで古いサブスクリプションをキャンセル

### stripe-webhook/index.ts (lines 162-199)

```typescript
// 既存アクティブサブスクリプションをキャンセル
console.log(`🚀 [LIVE環境] ユーザー ${userId} の既存アクティブサブスクリプションを確認`);

const { data: existingActiveSubs, error: checkError } = await supabase
  .from("user_subscriptions")
  .select("stripe_subscription_id")
  .eq("user_id", userId)
  .eq("is_active", true)
  .eq("environment", ENVIRONMENT)
  .neq("stripe_subscription_id", subscriptionId);

if (existingActiveSubs && existingActiveSubs.length > 0) {
  for (const oldSub of existingActiveSubs) {
    // Stripe側でキャンセル
    await stripe.subscriptions.cancel(oldSub.stripe_subscription_id, { prorate: true });

    // DB更新
    await supabase
      .from("user_subscriptions")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", oldSub.stripe_subscription_id);
  }
}
```

**意図**: 二重課金防止ロジック（Webhookで古いサブスクをキャンセル）

**問題**: Webhookが動いていないため、このロジックが実行されていない

---

## 🎯 実装ゴール（ユーザー要件）

### 開発環境
- Stripeの**テストモード**で動作
- テストカードで課金テスト可能
- 実際のお金は動かない

### 本番環境（将来）
- Stripeの**本番モード (Live)** で動作
- 実際の課金処理

### 要件
- 同じコードベースで両環境に対応
- 環境変数で切り替え可能

---

## 🔍 未確認事項

### Supabase Secrets

以下の環境変数が設定されているか不明:
- `STRIPE_WEBHOOK_SECRET_TEST`
- `STRIPE_WEBHOOK_SECRET_LIVE`
- `STRIPE_MODE`

### stripe-webhook-test の用途

- なぜ2つのWebhook関数が存在するのか？
- `stripe-webhook-test` は何に使われているのか？
- 削除してよいのか、それとも別の用途があるのか？

---

## 📋 解決すべき課題

### 短期（テストモード修正）

1. **Webhook設定の修正**
   - 選択肢A: 新しいEndpoint作成 (`stripe-webhook` 用)
   - 選択肢B: 既存Endpointの URL変更 (`stripe-webhook-test` → `stripe-webhook`)

2. **Supabase Secrets設定**
   - `STRIPE_WEBHOOK_SECRET_TEST` に正しいWebhook Secretを設定

3. **動作確認**
   - Test 1を再実行
   - 二重課金が解消されるか確認
   - `subscribed: true` になるか確認

### 長期（本番対応）

1. **仕様ドキュメント作成**
   - Stripe環境の使い分け（test/live）
   - Webhook関数の役割
   - 環境変数の設定方法

2. **本番環境用Webhook設定**
   - Stripe Dashboard (本番モード) でEndpoint作成
   - `STRIPE_WEBHOOK_SECRET_LIVE` 設定
   - `STRIPE_MODE=live` 設定

3. **デプロイ手順書作成**
   - 環境変数の設定手順
   - Webhook設定手順
   - 動作確認手順

---

## 📝 次のステップ（提案）

1. **仕様を整理・定義**
   - Stripe×Supabaseの統合仕様を文書化
   - 環境の使い分けを明確化
   - Webhook関数の役割を定義

2. **仕様に基づいて実装修正**
   - Webhook設定を修正
   - 環境変数を設定
   - テスト実行

3. **ドキュメント作成**
   - 開発者向けガイド
   - デプロイ手順書
   - トラブルシューティングガイド
