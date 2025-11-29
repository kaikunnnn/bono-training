# サブスクリプション状態の問題デバッグガイド

## 🔍 問題の概要

`/account`ページで以下の矛盾が発生しています：

- **表示**: 「現在のプラン:無料」
- **Consoleログ**: 
  - `DB直接取得結果: {isActive: false, planType: 'standard', ...}`
  - `Edge Functionから取得したアクセス権限を使用: {hasMemberAccess: false, hasLearningAccess: false, planType: 'standard'}`

### 矛盾点

1. `planType: 'standard'`なのに`isActive: false`
2. `planType: 'standard'`なのに`hasMemberAccess: false, hasLearningAccess: false`

これは、データベースに`planType: 'standard'`が記録されているのに、`is_active: false`になっていることを示しています。

---

## 📋 ログ確認で把握できること

### ✅ 1. `check-subscription` Edge Functionのログ

**確認すべきログ:**
- データベースから取得した購読情報の詳細
- `is_active`の値
- `planType`の値
- アクセス権限の計算結果

**確認方法:**
```bash
# Supabase CLIを使用
supabase functions logs check-subscription --limit 50

# またはSupabase Dashboard
# https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/logs/edge-functions
# → check-subscription を選択
```

**期待されるログ:**
```
データベースの購読情報を返却: {
  isActive: true,  // ← これがfalseになっている
  planType: 'standard',
  duration: 1,
  hasMemberAccess: true,  // ← これがfalseになっている
  hasLearningAccess: true  // ← これがfalseになっている
}
```

---

### ✅ 2. `stripe-webhook` Edge Functionのログ

**確認すべきログ:**
- `checkout.session.completed`イベントの処理
- データベースへの`is_active: true`の更新
- エラーメッセージ

**確認方法:**
```bash
# Supabase CLIを使用
supabase functions logs stripe-webhook --limit 50

# またはSupabase Dashboard
# https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/logs/edge-functions
# → stripe-webhook を選択
```

**期待されるログ:**
```
🧪 [TEST環境] Webhook受信
🧪 [TEST環境] checkout.session.completedイベントを処理中
✅ [TEST環境] サブスクリプション作成完了: standard (1ヶ月)
✅ [TEST環境] データベース更新完了: is_active=true
```

**問題がある場合のログ:**
```
❌ [TEST環境] データベース更新エラー: ...
❌ [TEST環境] is_activeの更新に失敗
```

---

### ✅ 3. `create-checkout` Edge Functionのログ

**確認すべきログ:**
- Checkoutセッションの作成
- エラーメッセージ

**確認方法:**
```bash
supabase functions logs create-checkout --limit 50
```

---

## 🔍 原因の特定手順

### ステップ1: Webhookログを確認

1. Supabase Dashboardで`stripe-webhook`のログを確認
2. `checkout.session.completed`イベントが処理されているか確認
3. エラーログがないか確認

**確認ポイント:**
- ✅ Webhookが正しく受信されているか
- ✅ データベース更新が成功しているか
- ✅ `is_active: true`が設定されているか

### ステップ2: check-subscriptionログを確認

1. Supabase Dashboardで`check-subscription`のログを確認
2. データベースから取得した値を確認

**確認ポイント:**
- ✅ `isActive: false`になっている理由
- ✅ `planType: 'standard'`が正しく取得できているか

### ステップ3: データベースを直接確認

```sql
-- ユーザーIDを確認（/accountページのコンソールで確認）
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
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

**確認ポイント:**
- ✅ `is_active`が`false`になっている理由
- ✅ `plan_type`が`standard`になっているか
- ✅ `environment`が`test`になっているか
- ✅ `updated_at`が最近更新されているか

---

## 🎯 よくある原因と対処法

### 原因1: Webhookが正しく処理されていない

**症状:**
- `stripe-webhook`のログにエラーがある
- `checkout.session.completed`イベントが処理されていない

**対処法:**
1. Stripe DashboardでWebhookイベントを確認
2. Webhookの署名シークレットが正しく設定されているか確認
3. Webhookエンドポイントが正しいか確認

### 原因2: データベース更新が失敗している

**症状:**
- `stripe-webhook`のログに「データベース更新エラー」がある
- `is_active`が`false`のまま

**対処法:**
1. Webhookログのエラーメッセージを確認
2. データベースの制約エラーがないか確認
3. RLS（Row Level Security）の設定を確認

### 原因3: 環境分離の問題

**症状:**
- `environment`が`test`になっていない
- テスト環境と本番環境のデータが混在している

**対処法:**
1. Webhookログで環境判定が正しいか確認
2. データベースの`environment`カラムを確認
3. 環境変数が正しく設定されているか確認

### 原因4: Stripe顧客IDの不一致

**症状:**
- `check-subscription`でStripeからサブスクリプションが取得できない
- `processStripeSubscription`で`hasActiveSubscription = false`になる

**対処法:**
1. `stripe_customers`テーブルで`stripe_customer_id`を確認
2. Stripe Dashboardで顧客が正しく作成されているか確認
3. `customer`パラメータが正しいか確認（`processStripeSubscription`の207行目）

---

## 📊 ログ確認の優先順位

1. **最優先**: `stripe-webhook`のログ
   - Webhookが正しく処理されているか
   - データベース更新が成功しているか

2. **次に優先**: `check-subscription`のログ
   - データベースから取得した値
   - アクセス権限の計算結果

3. **補足**: `create-checkout`のログ
   - Checkoutセッションの作成
   - エラーメッセージ

---

## 🛠️ デバッグコマンド

### ログを一括確認

```bash
# すべてのEdge Functionsのログを確認
./scripts/check-supabase-logs.sh

# 特定のFunctionのログを確認
./scripts/check-supabase-logs.sh stripe-webhook
./scripts/check-supabase-logs.sh check-subscription
```

### リアルタイムでログを監視

```bash
# Webhookのログをリアルタイムで監視
supabase functions logs stripe-webhook --follow

# check-subscriptionのログをリアルタイムで監視
supabase functions logs check-subscription --follow
```

---

## 📝 ログ確認後の次のステップ

ログを確認したら、以下を実施してください：

1. **エラーログを特定**
   - エラーメッセージをコピー
   - エラーが発生したタイムスタンプを記録

2. **原因を特定**
   - 上記の「よくある原因と対処法」を参照
   - データベースの状態を確認

3. **修正を実施**
   - 原因に応じた修正を実施
   - 修正後、再度テストを実行

4. **結果を確認**
   - `/account`ページで正しく表示されるか確認
   - Consoleログで`isActive: true`になっているか確認

---

## 🔗 関連ドキュメント

- [Supabaseログ確認ガイド](./supabase-logs-guide.md)
- [TESTING.md](../.claude/docs/TESTING.md)

