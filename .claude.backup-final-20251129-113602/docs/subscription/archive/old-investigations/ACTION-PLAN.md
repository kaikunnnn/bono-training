# 🎯 今すぐやること（アクションプラン）

## ステップ1: Supabase Dashboardでログを確認（5分）

### 1-1. Webhookログを確認

1. **ブラウザで以下を開く:**
   ```
   https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/logs/edge-functions
   ```

2. **左側の関数一覧から `stripe-webhook-test` をクリック**

3. **最新のログを確認:**
   - ✅ `🧪 [TEST環境] checkout.session.completedイベントを処理中` のログがあるか
   - ✅ `✅ [TEST環境] standardプラン（1ヶ月）のサブスクリプション情報を正常に保存しました` のログがあるか
   - ❌ `🧪 [TEST環境] ユーザーサブスクリプション情報の保存エラー:` のエラーログがないか

### 1-2. check-subscriptionログを確認

1. **同じページで `check-subscription` をクリック**

2. **最新のログを確認:**
   - `データベースの購読情報を返却` のログを探す
   - `isActive: false` になっている理由を確認

---

## ステップ2: データベースを直接確認（3分）

### 2-1. ユーザーIDを取得

1. `/account`ページを開く
2. ブラウザの開発者ツール（F12）を開く
3. Consoleタブで、ユーザーIDを確認（ログに表示されているはず）

### 2-2. SQL Editorで確認

1. **ブラウザで以下を開く:**
   ```
   https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/sql/new
   ```

2. **以下のSQLを実行（ユーザーIDを置き換える）:**

```sql
-- ユーザーIDを確認してから実行
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

3. **結果を確認:**
   - `is_active` が `false` になっているか
   - `plan_type` が `standard` になっているか
   - `environment` が `test` になっているか

---

## ステップ3: 問題の原因を特定

### パターンA: Webhookが処理されていない

**症状:**
- `stripe-webhook-test`のログに`checkout.session.completed`イベントがない

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
- `stripe-webhook-test`のログに「ユーザーサブスクリプション情報の保存エラー」がある

**対処法:**
1. エラーメッセージをコピー
2. エラーの内容に応じて修正:
   - RLS（Row Level Security）の問題 → RLSポリシーを確認
   - 制約エラー → データベースの制約を確認
   - その他のエラー → エラーメッセージを元に修正

### パターンC: 一時的な対処（手動でデータベースを更新）

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

更新後、`/account`ページをリロードして確認してください。

---

## ステップ4: 修正後の確認

1. `/account`ページをリロード
2. Consoleログを確認:
   - ✅ `isActive: true` になっているか
   - ✅ `hasMemberAccess: true` になっているか
   - ✅ `hasLearningAccess: true` になっているか
3. ページに「現在のプラン: Standard」と表示されるか確認

---

## 📞 ログを確認しても原因が分からない場合

1. ログのスクリーンショットを撮る
2. エラーメッセージをコピー
3. データベースの状態を確認
4. 上記の情報を共有してください

---

## 🎯 今すぐやること（優先順位順）

1. **最優先**: Supabase Dashboardでログを確認（ステップ1）
2. **次に**: データベースを直接確認（ステップ2）
3. **原因が分かったら**: パターンA〜Cの対処法を実行
4. **修正後**: ステップ4で確認

