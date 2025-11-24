# サブスクリプション非アクティブ問題 調査ドキュメント

**作成日**: 2025-11-21
**優先度**: 🔴 最高

---

## 📋 問題概要

### 症状
- Stripe Checkoutで決済は成功
- `/account` ページで「現在のプラン: 無料」と表示される
- `isActive: false` になっている

### コンソールログ
```javascript
DB直接取得結果: {
  isActive: false,
  planType: 'standard',
  duration: 1,
  cancelAtPeriodEnd: false,
  cancelAt: null
}

Edge Functionから取得したアクセス権限: {
  hasMemberAccess: false,
  hasLearningAccess: false,
  planType: 'standard'
}
```

**重要な観察:**
- `planType: 'standard'` は正しい
- `isActive: false` が問題（trueであるべき）
- アクセス権限が全てfalse

---

## 🔍 原因仮説（優先順位順）

### 仮説1: Stripe Webhookが実行されていない ⭐️ 最有力
**問題内容:**
- Checkoutセッション完了後、Webhookが発火していない
- または、Webhookが発火したがエラーで処理されていない
- `checkout.session.completed` イベントでサブスクリプションをアクティブ化する必要がある

**確認方法:**
1. Stripe Dashboard（テストモード） → Webhooks → `stripe-webhook-test` を確認
2. 最近のイベントで `checkout.session.completed` があるか確認
3. ステータスが `succeeded` か `failed` かを確認
4. Supabase Logs で `stripe-webhook-test` 関数のログを確認

**期待される結果:**
- `checkout.session.completed` イベントが成功している
- ログに「✅ サブスクリプション作成完了」が表示される

**対応策（もしWebhookが実行されていない場合）:**
- Webhookエンドポイントの設定を確認
- Webhook署名シークレットが正しいか確認
- 手動でWebhookイベントを再送信

---

### 仮説2: Webhook処理でエラーが発生している
**問題内容:**
- Webhookは発火したが、`stripe-webhook-test` 関数内でエラー
- `user_subscriptions` テーブルへの書き込みに失敗
- または `is_active` が `false` のまま保存されている

**確認方法:**
1. Supabase Logs → `stripe-webhook-test` 関数のエラーログを確認
2. データベースの `user_subscriptions` テーブルを直接確認:
```sql
SELECT * FROM user_subscriptions
WHERE user_id = 'c2930eb2-edde-486a-8594-780dbac4f744'
AND environment = 'test'
ORDER BY created_at DESC;
```

**期待される結果:**
- レコードが存在する
- `is_active = true`
- `stripe_subscription_id` が設定されている

**対応策:**
- Webhookハンドラーのコードを確認
- エラーログから具体的な問題を特定

---

### 仮説3: check-subscription関数の判定ロジックが間違っている
**問題内容:**
- DBには正しくデータが保存されている
- しかし `check-subscription` 関数が間違った判定をしている
- 環境フィルタが正しく動作していない可能性

**確認方法:**
1. `check-subscription` 関数のコードを確認
2. 環境判定ロジックを確認
3. Supabase Logs で `check-subscription` 関数のログを確認

**対応策:**
- `check-subscription` 関数に環境フィルタを追加
- ログを追加して判定過程を可視化

---

### 仮説4: Stripeサブスクリプションのステータスが不正
**問題内容:**
- Stripe側でサブスクリプションが `active` になっていない
- `incomplete` や `trialing` などの状態

**確認方法:**
1. Stripe Dashboard（テストモード） → Customers
2. `takumi.kai.skywalker@gmail.com` で検索
3. サブスクリプションのステータスを確認

**期待される結果:**
- ステータスが `Active`

**対応策:**
- Stripeサブスクリプションを手動でアクティブ化
- または再度決済を実行

---

## ✅ 調査タスク（実行順序）

### タスク1: Stripe Webhook ログ確認 🔴 最優先
**手順:**
1. [ ] Stripe Dashboard（テストモード）を開く: https://dashboard.stripe.com/test/webhooks
2. [ ] `stripe-webhook-test` エンドポイントをクリック
3. [ ] Logsタブを開く
4. [ ] 最近のイベントで `checkout.session.completed` を探す
5. [ ] ステータスを確認（succeeded / failed）
6. [ ] Detailsを確認

**結果:**
```
（ここに結果を貼り付け）
```

---

### タスク2: Supabase Webhook関数ログ確認
**手順:**
1. [ ] Supabase Dashboard → Edge Functions → `stripe-webhook-test` → Logs
2. [ ] 決済時刻（約10:53頃）のログを確認
3. [ ] エラーログがあるか確認

**結果:**
```
（ここに結果を貼り付け）
```

---

### タスク3: データベース直接確認
**手順:**
1. [ ] Supabase SQL Editor を開く
2. [ ] 以下のSQLを実行:
```sql
-- ユーザーのサブスクリプション情報を確認
SELECT
  stripe_subscription_id,
  plan_type,
  duration,
  is_active,
  environment,
  created_at,
  updated_at
FROM user_subscriptions
WHERE user_id = 'c2930eb2-edde-486a-8594-780dbac4f744'
ORDER BY created_at DESC;

-- ユーザーのStripe顧客情報を確認
SELECT
  stripe_customer_id,
  environment,
  created_at
FROM stripe_customers
WHERE user_id = 'c2930eb2-edde-486a-8594-780dbac4f744';
```

**結果:**
```
（ここに結果を貼り付け）
```

---

### タスク4: Stripeサブスクリプション状態確認
**手順:**
1. [ ] Stripe Dashboard（テストモード）: https://dashboard.stripe.com/test/customers
2. [ ] `takumi.kai.skywalker@gmail.com` で検索
3. [ ] 顧客詳細ページを開く
4. [ ] サブスクリプションのステータスを確認

**結果:**
- ステータス: ______
- プラン: ______
- 金額: ______

---

## 🔧 修正手順（原因特定後）

### 原因が「仮説1: Webhookが実行されていない」の場合

**手順:**
1. [ ] Webhookエンドポイント設定を確認
2. [ ] 署名シークレットを確認・再設定
3. [ ] Stripe Dashboardから手動でイベントを再送信
4. [ ] ログを確認して成功を確認

---

### 原因が「仮説2: Webhook処理エラー」の場合

**手順:**
1. [ ] エラーログから具体的な問題を特定
2. [ ] `stripe-webhook-test` 関数のコードを修正
3. [ ] 関数を再デプロイ
4. [ ] Webhookイベントを再送信してテスト

---

### 原因が「仮説3: check-subscription関数の問題」の場合

**手順:**
1. [ ] `check-subscription` 関数のコードを確認
2. [ ] 環境フィルタを追加・修正
3. [ ] 関数を再デプロイ
4. [ ] ページをリロードして確認

---

## 📊 進捗状況

**開始日時:** ___________

### チェックリスト
- [ ] タスク1: Stripe Webhook ログ確認完了
- [ ] タスク2: Supabase Webhook関数ログ確認完了
- [ ] タスク3: データベース直接確認完了
- [ ] タスク4: Stripeサブスクリプション状態確認完了
- [ ] 原因特定完了
- [ ] 修正実施完了
- [ ] 再テスト完了
- [ ] 問題解決確認

---

## 📝 最終結果

**原因:**
（確定後記入）

**実施した修正:**
（確定後記入）

**修正後の動作:**
- [ ] ✅ 正常動作
- [ ] ❌ まだエラーあり

---

**次のアクション: タスク1（Stripe Webhookログ確認）を実行してください**
