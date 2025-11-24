# サブスクリプション問題のクイックデバッグガイド

## 🚨 現在の問題

- `/account`ページで「現在のプラン:無料」と表示される
- Consoleログ: `isActive: false, planType: 'standard'`（矛盾している）

---

## 📋 ステップ1: Supabase Dashboardでログを確認（5分）

### 1-1. Webhookログを確認

1. ブラウザで以下を開く:
   ```
   https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/logs/edge-functions
   ```

2. 左側の関数一覧から **`stripe-webhook`** をクリック

3. 最新のログを確認:
   - ✅ `checkout.session.completed`イベントが処理されているか
   - ✅ `✅ [TEST環境] サブスクリプション作成完了` のログがあるか
   - ✅ `✅ [TEST環境] データベース更新完了: is_active=true` のログがあるか
   - ❌ エラーログがないか

### 1-2. check-subscriptionログを確認

1. 同じページで **`check-subscription`** をクリック

2. 最新のログを確認:
   - ✅ `データベースの購読情報を返却` のログを探す
   - ✅ `isActive: true` になっているか確認
   - ❌ `isActive: false` になっている場合は、その理由を確認

---

## 📋 ステップ2: データベースを直接確認（3分）

### 2-1. Supabase SQL Editorで確認

1. ブラウザで以下を開く:
   ```
   https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/sql/new
   ```

2. 以下のSQLを実行（ユーザーIDは`/account`ページのコンソールで確認）:

```sql
-- ユーザーIDを確認（/accountページのコンソールで確認してください）
-- 例: '12345678-1234-1234-1234-123456789012'

SELECT 
  user_id,
  plan_type,
  is_active,
  duration,
  environment,
  stripe_subscription_id,
  created_at,
  updated_at
FROM user_subscriptions
WHERE user_id = 'YOUR_USER_ID_HERE'  -- ← ここを実際のユーザーIDに置き換える
ORDER BY created_at DESC;
```

3. 結果を確認:
   - ✅ `is_active` が `true` になっているか
   - ✅ `plan_type` が `standard` になっているか
   - ✅ `environment` が `test` になっているか
   - ❌ `is_active` が `false` の場合は、`updated_at` を確認

---

## 📋 ステップ3: 問題の原因を特定

### パターンA: Webhookが処理されていない

**症状:**
- `stripe-webhook`のログに`checkout.session.completed`イベントがない
- またはエラーログがある

**対処法:**
1. Stripe DashboardでWebhookイベントを確認:
   ```
   https://dashboard.stripe.com/test/webhooks
   ```
2. `stripe-webhook-test`エンドポイントをクリック
3. Logsタブで`checkout.session.completed`イベントを確認
4. エラーがある場合は、エラーメッセージを確認

### パターンB: データベース更新が失敗している

**症状:**
- `stripe-webhook`のログに「データベース更新エラー」がある
- `is_active`が`false`のまま

**対処法:**
1. エラーメッセージをコピー
2. エラーの内容に応じて修正:
   - RLS（Row Level Security）の問題 → RLSポリシーを確認
   - 制約エラー → データベースの制約を確認
   - その他のエラー → エラーメッセージを元に修正

### パターンC: 環境分離の問題

**症状:**
- `environment`が`test`になっていない
- または`[LIVE環境]`のログが表示されている

**対処法:**
1. Webhookログで環境判定が正しいか確認
2. 環境変数が正しく設定されているか確認:
   ```bash
   npx supabase secrets list | grep STRIPE
   ```

### パターンD: Stripe顧客IDの不一致

**症状:**
- `check-subscription`でStripeからサブスクリプションが取得できない
- `processStripeSubscription`で`hasActiveSubscription = false`になる

**対処法:**
1. `stripe_customers`テーブルで`stripe_customer_id`を確認:
   ```sql
   SELECT user_id, stripe_customer_id, environment
   FROM stripe_customers
   WHERE user_id = 'YOUR_USER_ID_HERE';
   ```
2. Stripe Dashboardで顧客が正しく作成されているか確認
3. `customer`パラメータが正しいか確認

---

## 📋 ステップ4: 修正後の確認

修正後、以下を確認してください:

1. `/account`ページをリロード
2. Consoleログを確認:
   - ✅ `isActive: true` になっているか
   - ✅ `hasMemberAccess: true` になっているか
   - ✅ `hasLearningAccess: true` になっているか
3. ページに「現在のプラン: Standard」と表示されるか確認

---

## 🔧 よくある修正方法

### 修正1: 手動でデータベースを更新

**注意**: これは一時的な対処法です。根本原因を解決する必要があります。

```sql
-- ユーザーIDを確認してから実行
UPDATE user_subscriptions
SET 
  is_active = true,
  updated_at = NOW()
WHERE user_id = 'YOUR_USER_ID_HERE' 
  AND environment = 'test'
  AND plan_type = 'standard';
```

### 修正2: Webhookを再実行

1. Stripe DashboardでWebhookイベントを確認
2. 失敗したイベントを再送信

---

## 📞 ログを確認しても原因が分からない場合

1. ログのスクリーンショットを撮る
2. エラーメッセージをコピー
3. データベースの状態を確認
4. 上記の情報を元に、さらに詳しく調査

---

## 🎯 次のアクション

1. **今すぐ**: Supabase Dashboardでログを確認（ステップ1）
2. **次に**: データベースを直接確認（ステップ2）
3. **原因が分かったら**: パターンA〜Dの対処法を実行
4. **修正後**: ステップ4で確認

