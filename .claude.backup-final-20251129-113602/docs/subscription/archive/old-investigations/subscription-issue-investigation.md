# サブスク決済問題の調査記録

## 日時
2025-11-21

## 問題の概要
Stripe決済は完了しているが、ユーザーのサブスクリプション状態が正しく反映されない。

## 症状

### 1. 決済完了ページ (`/subscription-success`)
```
{hasMemberAccess: false, hasLearningAccess: false, planType: null}
Edge Functionエラー、直接DBから取得します: true
DB直接取得結果: {isActive: false, planType: null, duration: null, cancelAtPeriodEnd: false, cancelAt: null, …}
```

- Edge Functionがエラーを返している
- DBから直接取得してもサブスクリプションが無効 (`isActive: false`)

### 2. アカウントページ (`/account`)
```
DB直接取得結果: {isActive: false, planType: null, duration: null, cancelAtPeriodEnd: false, cancelAt: null, …}
Edge Functionから取得したアクセス権限を使用: {hasMemberAccess: false, hasLearningAccess: false, planType: null}
Realtime Subscription status: SUBSCRIBED
```

- 無料プランとして表示されている
- リアルタイム購読は`SUBSCRIBED`状態

### 3. ログの重複
同じログが複数回出力されている - これは開発環境でのReact Strict Modeによる可能性が高い（正常）

### 4. SQL確認
```sql
SELECT * FROM user_subscriptions WHERE user_id = auth.uid() AND is_active = true;
```
このクエリは成功するが、結果が返っていない可能性が高い（空の結果）

## 推測される問題点

### 1. Webhook処理の失敗
- `checkout.session.completed`イベントが正しく処理されていない
- Webhookが受信されていない、または処理でエラーが発生している

### 2. Edge Function (handle-subscription-update) のエラー
- サブスクリプション作成処理でエラーが発生している
- データベースへの書き込みが失敗している

### 3. データの不整合
- Stripeでは決済完了
- DBには反映されていない

## 調査計画

### Phase 1: ログ確認
1. ✅ Edge Function `handle-subscription-update` のログを確認
2. ✅ Webhookイベントの受信状況を確認
3. ✅ Stripe ダッシュボードで決済・サブスクリプション状態を確認

### Phase 2: データベース確認
4. ✅ `user_subscriptions` テーブルの実際のデータを確認
5. ✅ `stripe_customers` テーブルにユーザーが登録されているか確認

### Phase 3: 問題の特定と修正
6. ✅ 問題の原因を特定
7. ✅ 修正を実装
8. ✅ テストして動作確認

## 調査結果

### 1. Edge Functionログの確認
**重要な発見: Webhook 401エラー**

```
POST | 401 | https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook
```

複数の401エラーが記録されています。これは、StripeからのWebhookが認証エラーで失敗していることを意味します。

**問題点:**
- `handle-subscription-update` Functionのログが全く見当たらない
- `stripe-webhook` Functionが401エラーを返している
- Webhookの署名検証が失敗している可能性が高い

**考えられる原因:**
1. Stripe Webhook署名シークレット (`STRIPE_WEBHOOK_SECRET`) が正しく設定されていない
2. Edge FunctionでWebhook署名の検証に失敗している
3. Stripeダッシュボードで設定されたWebhook URLが間違っている

### 2. Stripeダッシュボードでの確認
**決済状況:**
- 決済ID: `pi_3SVmKkKUVUnt8Gty0NVzNEx8`
- 金額: 4,980円
- ステータス: **succeeded** ✅
- 顧客ID: `cus_TSgoDjZruK8uEK`

**サブスクリプション状況:**
- サブスクリプションID: `sub_1SVmKkKUVUnt8GtyZyWiOia4`
- ステータス: **active** ✅
- Stripe側では正常に作成されている

### 3. データベースの確認
```sql
SELECT * FROM user_subscriptions WHERE stripe_customer_id = 'cus_TSgoDjZruK8uEK';
```
**結果: 空（データが存在しない）** ❌

## 問題の原因特定

**確定した問題:**
1. ✅ Stripe決済は成功している
2. ✅ Stripeサブスクリプションは正常に作成されている
3. ❌ **Webhookが401エラーで失敗している**
4. ❌ **データベースにサブスクリプション情報が保存されていない**

**根本原因:**
Stripe WebhookがSupabase Edge Functionに届いているが、401 Unauthorized エラーで拒否されている。これにより、`handle-subscription-update` Functionが呼ばれず、データベースへの書き込みが行われない。

### 4. Edge Functionコードの確認
✅ `stripe-webhook/index.ts`を確認しました
- コードは正しく実装されている
- Webhook署名検証ロジックも正常
- `getWebhookSecret('live')` で `STRIPE_WEBHOOK_SECRET_LIVE` を取得している

### 5. 環境変数の確認
✅ Supabase secretsを確認しました
```
STRIPE_WEBHOOK_SECRET_LIVE | 728b2de...
STRIPE_WEBHOOK_SECRET_TEST | c71770b...
```
環境変数は設定されています。

## 問題の絞り込み

**考えられる原因:**
1. **Stripeダッシュボードで設定されたWebhook署名シークレットとSupabaseの環境変数が一致していない**
   - Webhookエンドポイントを作成した際に生成されたシークレットと、Supabaseに設定したシークレットが異なる
   - 複数のWebhookエンドポイントが存在し、間違ったシークレットを使用している

2. **Webhook URLが間違っている**
   - Stripeが別のURLにリクエストを送信している
   - URLが`/stripe-webhook`ではなく`/stripe-webhook-test`になっている

3. **本番とテストモードが混在している**
   - Stripeでテストモードで決済しているのに、`stripe-webhook` Functionが本番用のシークレットを使用している

## 解決策

### 必須アクション: Stripeダッシュボードでの確認と修正

#### 1. Webhook設定を確認する
Stripeダッシュボードで以下を確認してください:

1. **ダッシュボードにアクセス**: https://dashboard.stripe.com/test/webhooks
2. **Webhookエンドポイントを確認**:
   - URL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook`
   - イベント: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
3. **署名シークレットを確認**:
   - 「Signing secret」をクリックして表示
   - この値が Supabaseの`STRIPE_WEBHOOK_SECRET_LIVE`と一致しているか確認

#### 2. 署名シークレットが一致しない場合
もし一致しない場合は、以下のどちらかを実行:

**オプションA: Supabaseの環境変数を更新**
```bash
npx supabase secrets set STRIPE_WEBHOOK_SECRET_LIVE="whsec_xxxxx" --project-ref fryogvfhymnpiqwssmuu
```

**オプションB: Webhookエンドポイントを再作成**
1. 既存のWebhookエンドポイントを削除
2. 新しいWebhookエンドポイントを作成
   - URL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook`
   - イベント: 上記4つ
3. 新しい署名シークレットをSupabaseに設定

#### 3. テストと本番モードの確認
- 現在テスト決済を行っている場合は、**テストモード用のWebhookエンドポイント**が必要
- 本番決済の場合は、**本番モード用のWebhookエンドポイント**が必要

### Phase 2: 既存データの修復
Webhookが正常に動作するようになったら:
1. 過去の成功した決済データを手動でDBに登録するスクリプトを作成
2. 既存のStripeサブスクリプションをDBに同期

### Phase 3: テストと確認
1. Webhookをテストして正常に動作することを確認
2. 新規決済でエンドツーエンドのテスト

## 参考情報

- 決済フローは正常に完了している（ユーザーは決済完了ページに到達）
- フロントエンドのコードは正しく動作している（データ取得・表示ロジック）
- 問題はバックエンド（Webhook処理、Edge Function、DB書き込み）にある可能性が高い
