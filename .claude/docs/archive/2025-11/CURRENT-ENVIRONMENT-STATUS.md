# 現在の環境状態 - 完全なデータ収集

**最終更新:** 2025-11-21

---

## 1. 使用中の Stripe 環境

**確認済み:** Test mode

---

## 2. Supabase 環境変数 (確認済み)

```
✅ STRIPE_TEST_SECRET_KEY - 設定済み
✅ STRIPE_LIVE_SECRET_KEY - 設定済み
✅ STRIPE_WEBHOOK_SECRET_TEST - 設定済み
✅ STRIPE_WEBHOOK_SECRET_LIVE - 設定済み
```

---

## 3. Edge Function 設定 (確認済み)

**ファイル:** `/supabase/functions/stripe-webhook/index.ts`
**問題:** `const ENVIRONMENT = 'live' as const;` (15 行目)

**現状:**

- Edge Function が LIVE 環境にハードコードされている
- Test mode の Stripe を使用しているが、LIVE 環境の secret で検証しようとしている
- これが 401 エラーの直接的な原因

---

## 4. データベーススキーマ (確認済み)

**user_subscriptions テーブル:**

- environment カラム: text 型 (test/live を格納)

**stripe_customers テーブル:**

- environment カラム: text 型 (test/live を格納)

**subscriptions テーブル:**

- ❌ environment カラムなし（subscriptions テーブルには environment カラムが存在しない）

---

## 5. 必要な追加情報（ユーザーに確認）

### 5-1. Stripe Dashboard Test mode Webhook 設定 ✅ 確認完了

**URL:** https://dashboard.stripe.com/test/webhooks

**確認済み情報:**

1. ✅ Webhook endpoint URL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook-test`
2. ✅ Signing secret: `whsec_OsDEO0Sk2YT6EkLsdxxfJ2T9H81H1xvT`
3. ✅ リスニングしているイベント:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.deleted
   - customer.subscription.updated
   - invoice.paid
   - invoice.payment_failed

**Webhook ID:** we_1SVTCBKUVUnt8Gty0Lu5njab
**名前:** Supabase Edge Function (Test)
**ステータス:** アクティブ

### 5-2. 最近の失敗した Webhook

**URL:** https://dashboard.stripe.com/test/webhooks (失敗した webhook のログ)

**確認が必要な情報:**

1. ❓ 最新の失敗した webhook のタイムスタンプ
2. ❓ エラーメッセージの詳細
3. ❓ Stripe が送信した webhook のペイロード（イベントタイプ、customer ID 等）

### 5-3. テスト決済データ

**確認が必要な情報:**

1. ❓ テスト決済を行ったユーザーのメールアドレス
2. ❓ Stripe Customer ID (cus\_で始まる)
3. ❓ Stripe Subscription ID (sub\_で始まる)
4. ❓ Stripe Payment Intent ID (pi\_で始まる)

---

## 6. 確認されている問題

### 問題 1: Edge Function の環境設定ミスマッチ ✅ 確認済み

- **現状:** LIVE 環境にハードコード
- **使用中:** Test mode
- **結果:** Webhook 署名検証が失敗 (401 エラー)

### 問題 2: subscriptions テーブルの environment カラム欠損 ✅ 修正完了

- **修正日時:** 2025-11-21 14:40 JST
- **マイグレーション:** add_environment_column_to_subscriptions
- **結果:** ✅ environment カラム追加完了

### 問題 3: user_subscriptions テーブルの UNIQUE 制約不整合 ✅ 修正完了

- **修正日時:** 2025-11-21 14:41 JST
- **マイグレーション:** fix_user_subscriptions_unique_constraint
- **結果:** ✅ UNIQUE(user_id, environment) 制約追加完了

---

## 次のステップ

### ✅ 完了した作業

1. ✅ Stripe Test mode webhook設定を確認
2. ✅ Signing secretを取得
3. ✅ Supabase環境変数 `STRIPE_WEBHOOK_SECRET_TEST` を更新完了
4. ✅ 初回テスト決済を実施（エラー検出）
5. ✅ データベーススキーマ修正完了
   - subscriptions テーブルに environment カラム追加
   - user_subscriptions テーブルに UNIQUE(user_id, environment) 制約追加

### 📋 次の作業

1. **再テスト決済を実施**
   - 修正後の動作確認
   - 詳細は TEST-PAYMENT-PROCEDURE.md の「再テスト」セクション参照

2. **結果確認**
   - Webhookログ: エラーなし
   - データベース: データ保存成功
   - ユーザー画面: 正しいプラン表示
