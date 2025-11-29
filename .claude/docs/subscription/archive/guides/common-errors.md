# サブスクリプション実装 - よくある間違いと教訓

**最終更新**: 2025-11-24
**目的**: 過去の失敗から学び、同じ間違いを繰り返さないための教訓集

---

## 📚 目次

1. [Critical エラー](#critical-エラー)
2. [実装の誤解](#実装の誤解)
3. [環境構築の失敗](#環境構築の失敗)
4. [テストの失敗](#テストの失敗)
5. [予防策チェックリスト](#予防策チェックリスト)

---

## Critical エラー

### 🔴 Error 1: Webhook 401 Unauthorized

**発生日**: 2025-11-24
**重要度**: Critical
**影響**: サブスクリプション管理機能全体が動作しない

#### 症状

```bash
POST | 401 | stripe-webhook
```

- プラン変更してもデータベースが更新されない
- キャンセルしてもデータベースが更新されない
- 新規登録してもデータベースにレコードが作成されない

#### 根本原因

`STRIPE_WEBHOOK_SECRET_TEST` が Supabase Secrets に設定されていなかった。

Stripe Webhook は署名検証を行うため、Secret が設定されていないとすべてのリクエストが 401 エラーで拒否される。

#### 解決方法

```bash
# 1. Stripe Dashboard から Webhook Secret を取得
# https://dashboard.stripe.com/test/webhooks

# 2. Supabase Secrets に設定
npx supabase secrets set STRIPE_WEBHOOK_SECRET_TEST=whsec_xxxxx
```

#### 予防策

- ✅ 環境構築時に必ず Webhook Secret を設定する
- ✅ Edge Functions デプロイ後に Webhook 動作確認テストを実施
- ✅ 定期的に Edge Functions Logs で 401 エラーがないか確認

#### 詳細ドキュメント

- [webhook-401-error.md](./troubleshooting/webhook-401-error.md)
- [system-specification.md - 問題2](./SUBSCRIPTION-SYSTEM-SPECIFICATION.md#問題2-webhook-401-unauthorized-エラー重要)

---

### 🔴 Error 2: Price ID が見つからない

**発生日**: 2025-11-21
**重要度**: High
**影響**: Customer Portal が開けない、Checkout が作成できない

#### 症状

```
❌ Price ID not found: VITE_STRIPE_STANDARD_1M_PRICE_ID is not set
```

Edge Functions で 500 エラーが発生。

#### 根本原因

Stripe Price ID が Supabase Secrets に設定されていなかった。

Edge Functions は `.env` ファイルを読めないため、Supabase Secrets に設定する必要がある。

#### 解決方法

```bash
# すべての Price ID を Supabase Secrets に設定
npx supabase secrets set VITE_STRIPE_STANDARD_1M_PRICE_ID=price_xxxxx
npx supabase secrets set VITE_STRIPE_STANDARD_3M_PRICE_ID=price_xxxxx
npx supabase secrets set VITE_STRIPE_FEEDBACK_1M_PRICE_ID=price_xxxxx
npx supabase secrets set VITE_STRIPE_FEEDBACK_3M_PRICE_ID=price_xxxxx
```

#### 予防策

- ✅ 環境構築チェックリストに従って Price ID を設定
- ✅ Edge Functions デプロイ後に動作確認テストを実施

---

## 実装の誤解

### ❌ 誤解 1: customer.subscription.updated で自動キャンセル

**発生日**: 2025-11-22
**重要度**: Critical
**誤った実装**: `handleSubscriptionUpdated` に自動キャンセルロジックを追加

#### 誤った理解

「プラン変更時に新しいサブスクリプションが作成されるので、古いサブスクリプションを自動キャンセルする必要がある」

#### 正しい理解

**プラン変更時、新しいサブスクリプションは作成されない。**

Stripe の `subscription.update()` は：
1. 既存のサブスクリプション ID を維持
2. Subscription Items のみを更新
3. 自動的にプロレーション（日割り計算）を適用

**`customer.subscription.updated` イベントは「既存サブスクリプションの更新」を意味する。**

#### 影響

自動キャンセルロジックを追加すると：
- プラン変更時に他のサブスクリプションが誤ってキャンセルされる
- 二重課金防止ロジックが誤作動する

#### 正しい実装

```typescript
// ❌ 誤った実装
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // 他のアクティブサブスクリプションを自動キャンセル（不要！）
  await cancelOtherSubscriptions(subscription.id);
}

// ✅ 正しい実装
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // 既存レコードを更新するだけ
  await updateSubscriptionInDatabase(subscription);
}
```

#### 教訓

- Stripe の動作を正しく理解する（ドキュメントを読む）
- 推測で実装しない
- テストで動作を確認する

#### 詳細ドキュメント

- [SUBSCRIPTION-IMPLEMENTATION-SPEC.md](./archive/SUBSCRIPTION-IMPLEMENTATION-SPEC.md)

---

### ❌ 誤解 2: Deep Link = 新規サブスクリプション作成

**発生日**: 2025-11-22
**重要度**: Medium
**誤った実装**: Deep Link でプラン変更時に新規サブスクリプションを作成しようとした

#### 誤った理解

「Customer Portal Deep Link でプラン変更画面を開くと、新しいサブスクリプションが作成される」

#### 正しい理解

Customer Portal Deep Link は：
1. `flow_data.type = 'subscription_update_confirm'` を指定
2. **既存サブスクリプションを更新**する画面を開く
3. Stripe 側で `subscription.update()` を呼び出す
4. プロレーションが自動適用される

**新しいサブスクリプションは作成されない。**

#### 正しい実装

```typescript
// Deep Link で既存サブスクリプションを更新
const session = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: returnUrl,
  flow_data: {
    type: 'subscription_update_confirm',
    subscription_update_confirm: {
      subscription: existingSubscriptionId,  // 既存ID
      items: [{
        id: existingItemId,  // 既存アイテムID
        price: newPriceId,    // 新しいPrice ID
        quantity: 1
      }]
    }
  }
});
```

#### 教訓

- Deep Link は「既存サブスクリプションの更新」を意味する
- 新規作成には Checkout を使用する

---

## 環境構築の失敗

### ⚠️ 失敗 1: .env と Supabase Secrets の混同

**発生日**: 2025-11-21
**重要度**: High

#### 問題

「`.env` に環境変数を設定したのに Edge Functions で読めない」

#### 原因

- **フロントエンド（Vite）**: `.env` ファイルを読む
- **バックエンド（Deno Edge Functions）**: Supabase Secrets を読む

`.env` と Supabase Secrets は**完全に別物**。

#### 正しい設定

```bash
# フロントエンド用（.env）
VITE_STRIPE_STANDARD_1M_PRICE_ID=price_xxxxx

# バックエンド用（Supabase Secrets）
npx supabase secrets set VITE_STRIPE_STANDARD_1M_PRICE_ID=price_xxxxx
```

**両方に設定する必要がある。**

#### 教訓

- フロントエンドとバックエンドで環境変数の管理方法が異なる
- Edge Functions には必ず Supabase Secrets に設定

---

### ⚠️ 失敗 2: Webhook エンドポイントの設定忘れ

**発生日**: 2025-11-20
**重要度**: Critical

#### 問題

「Webhook イベントが届かない」

#### 原因

Stripe Dashboard で Webhook エンドポイントを作成していなかった。

#### 正しい設定

1. Stripe Dashboard → Webhooks
2. エンドポイントを追加:
   - URL: `https://[project-id].supabase.co/functions/v1/stripe-webhook-test`
   - イベント選択:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
3. Signing Secret をコピー
4. Supabase Secrets に設定

#### 教訓

- 環境構築チェックリストに従う
- Webhook 動作確認テストを必ず実施

---

## テストの失敗

### ⚠️ 失敗 1: フロントエンドだけ確認してデータベースを確認しない

**発生日**: 2025-11-24
**重要度**: High

#### 問題

「Customer Portal でプラン変更したら、フロントエンドの表示が更新されたので成功したと思った」

実際はデータベースが更新されておらず、Webhook が 401 エラーで失敗していた。

#### 教訓

**プラン変更などの重要な操作後は、必ずデータベースを直接確認する。**

```sql
SELECT plan_type, duration, updated_at, email
FROM user_subscriptions
JOIN auth.users ON user_subscriptions.user_id = auth.users.id
WHERE email = 'your-email@example.com'
ORDER BY updated_at DESC
LIMIT 1;
```

フロントエンドの表示だけでは不十分。

---

### ⚠️ 失敗 2: Edge Functions ログを確認しない

**発生日**: 2025-11-24
**重要度**: High

#### 問題

「エラーが出ているのに気づかなかった」

Edge Functions Logs を確認していれば、Webhook 401 エラーにすぐ気づけた。

#### 教訓

**テスト実施後は必ず Edge Functions Logs を確認する。**

```bash
# ログ確認コマンド
npx supabase functions logs stripe-webhook-test --limit 50
```

Supabase Dashboard → Edge Functions → Logs からも確認可能。

---

## 予防策チェックリスト

### 環境構築時

- [ ] Stripe Webhook エンドポイント作成
- [ ] **Webhook Signing Secret を取得してSupabase Secretsに設定**
- [ ] Stripe Secret Key を Supabase Secrets に設定
- [ ] すべての Price ID を Supabase Secrets に設定
- [ ] Edge Functions デプロイ
- [ ] **Webhook 動作確認テスト実施**（テストイベント送信）
- [ ] 新規登録テスト実施（データベース確認）
- [ ] プラン変更テスト実施（データベース確認）

### テスト実施時

- [ ] テスト前に現在の状態を記録
- [ ] テスト実施（ブラウザで操作）
- [ ] **データベースを直接確認**（フロントエンド表示だけでなく）
- [ ] **Edge Functions Logs を確認**（401エラーがないか）
- [ ] Stripe Dashboard でイベント履歴を確認
- [ ] テスト結果を TESTING-LOG.md に記録

### コード実装時

- [ ] Stripe ドキュメントを読んで動作を理解
- [ ] 推測で実装しない
- [ ] 既存の正しい実装パターンを参照
- [ ] コメントで意図を明確にする
- [ ] エラーハンドリングを実装
- [ ] ログ出力を追加

---

### ❌ 誤解 3: Stripe CLI が必要

**発生日**: 2025-11-21
**重要度**: Low
**誤った理解**: 「Webhook をテストするには Stripe CLI が必要」

#### 正しい理解

**このプロジェクトでは Stripe CLI は不要。**

理由：
1. Supabase Edge Functions を使用している
2. Webhook エンドポイント: `https://[project-id].supabase.co/functions/v1/stripe-webhook-test`
3. Stripe Dashboard で直接この URL を設定している

#### Webhook の流れ

```
Stripe → Supabase Edge Functions (stripe-webhook-test) → Database
```

Stripe CLI は関係ない。

#### Stripe CLI が必要な場合

ローカル開発サーバー（例: `localhost:3000`）で Webhook を受信したい場合のみ。

このプロジェクトでは：
- Supabase Edge Functions を使っている
- ローカル開発サーバーに Webhook エンドポイントがない
- **したがって、Stripe CLI は不要**

#### 教訓

- プロジェクトのアーキテクチャを正しく理解する
- 不要なツールをインストールしない

---

## 関連ドキュメント

### メインドキュメント

- [system-specification.md](../specifications/system-specification.md) - システム全体仕様
- [testing-log.md](../testing/testing-log.md) - テスト履歴

### 詳細ドキュメント

- [webhook-401-error.md](./troubleshooting/webhook-401-error.md) - Webhook 401 エラー詳細
- [user-flow-specification.md](../specifications/user-flow-specification.md) - ユーザーフロー

### アーカイブ（参考用）

- [archive/SUBSCRIPTION-IMPLEMENTATION-SPEC.md](./archive/SUBSCRIPTION-IMPLEMENTATION-SPEC.md) - 誤った実装の分析

---

**作成日**: 2025-11-24
**ステータス**: ✅ 完成
**用途**: AI開発時の参照、新規開発者のオンボーディング、トラブルシューティング
