# Stripe 実装テストガイド（環境分離対応版）

**最終更新**: 2025-11-21
**対応内容**: テスト環境と本番環境の分離実装完了後のテスト

このドキュメントは、Stripe 決済・サブスクリプション機能のテスト手順をまとめたものです。

---

## 📋 テスト実施日

**実施日**: **\_\_**

---

## 🔧 事前確認

### 環境確認

- [ ] 開発サーバーが起動している: http://localhost:8081
- [ ] Stripe Dashboard（テストモード）にアクセス可能: https://dashboard.stripe.com/test
- [ ] Supabase Dashboard にアクセス可能: https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu

### 環境分離の確認

- [ ] `STRIPE_TEST_SECRET_KEY` が設定されている
- [ ] `STRIPE_LIVE_SECRET_KEY` が設定されている
- [ ] `STRIPE_WEBHOOK_SECRET_TEST` が設定されている
- [ ] `STRIPE_WEBHOOK_SECRET_LIVE` が設定されている
- [ ] Stripe Webhook（テスト環境）が登録されている: `stripe-webhook-test`
- [ ] Stripe Webhook（本番環境）が登録されている: `stripe-webhook`

### テスト用カード番号

```
カード番号: 4242 4242 4242 4242
有効期限: 任意の未来の日付（例: 12/34）
CVC: 任意の3桁（例: 123）
郵便番号: 任意（例: 12345）
```

---

## 🧪 テスト 0: 新規ユーザー登録とサブスクリプション作成

### 目的

まっさらな状態から新規登録し、テスト環境でサブスクリプションを作成する

### 前提条件

- テストユーザーのデータが全て削除されている

### 手順

1. [○] http://localhost:8081 にアクセス
2. [○] 新規登録ページに移動
3. [○] メール: `takumi.kai.skywalker@gmail.com`、パスワード: 任意
4. [○] 登録完了後、メール認証リンクをクリック
5. [○] ログイン
6. [○] `/subscription` ページに移動
7. [○] **Standard 1 ヶ月プラン**を選択
8. [○] 「今すぐ始める」ボタンをクリック
9. [○] 開発者コンソールで以下のログを確認:
   - checkout が開いた 11/21 .
   - ただ Console を見ると以下のエラ＾があるのが気になった大丈夫？
   - cs_test_a1pDaiZNCotJ…zsX1AMqrbffAjGxMe:6 Uncaught (in promise) Error: Cannot find module './en'
     at cs_test_a1pDaiZNCotJ…rbffAjGxMe:6:348760
     14
     Loading the font '<URL>' violates the following Content Security Policy directive: "font-src 'self' <URL>". The action has been blocked.
     m=uZmJdd:62
     POST https://play.google.com/log?format=json&hasfast=true&authuser=0 net::ERR_BLOCKED_BY_CONTENT_BLOCKER
10. [○] テストカード番号を入力して決済
11. [○] 成功ページにリダイレクトされる
12. [×] `/account` ページでサブスクリプション情報が表示される

- サブスクリプション情報
  現在のプラン:無料
  プレミアムプランにアップグレードして、全てのコンテンツにアクセスしましょう
  が表示されています。

Console を見ると
`DB直接取得結果: {isActive: false, planType: 'standard', duration: 1, cancelAtPeriodEnd: false, cancelAt: null, …}`

````Edge Functionから取得したアクセス権限を使用: {hasMemberAccess: false, hasLearningAccess: false, planType: 'standard'}
hasLearningAccess
:
false
hasMemberAccess
:
false
planType
:
"standard"
[[Prototype]]
:
Object ```



### 確認 A: Supabase Database

```sql
-- 新しいユーザーIDを取得（/accountページのコンソールで確認）
-- テスト環境のデータが作成されているか確認
SELECT * FROM stripe_customers
WHERE user_id = 'YOUR_USER_ID' AND environment = 'test';

SELECT * FROM user_subscriptions
WHERE user_id = 'YOUR_USER_ID' AND environment = 'test';
````

**確認項目**:

- [ ] `stripe_customers.environment = 'test'`
- [ ] `user_subscriptions.environment = 'test'`
- [ ] `user_subscriptions.is_active = true`
- [ ] `user_subscriptions.plan_type = 'standard'`
- [ ] `user_subscriptions.duration = 1`

### 確認 B: Stripe Dashboard（テストモード）

**URL**: https://dashboard.stripe.com/test/customers

1. [ ] `takumi.kai.skywalker@gmail.com` で検索
2. [ ] 顧客が 1 件作成されている
3. [ ] サブスクリプションが 1 件、`Active` ステータスで存在する
4. [ ] プランが **standard** になっている

### 確認 C: Stripe Webhook Logs

**URL**: https://dashboard.stripe.com/test/webhooks

1. [ ] `stripe-webhook-test` エンドポイントをクリック
2. [ ] Logs タブで `checkout.session.completed` イベントを確認
3. [ ] ステータスが `succeeded` になっている
4. [ ] ログに `🧪 [TEST環境]` と表示されている

### テスト 0 の結果

- [ ] ✅ 成功
- [ ] ❌ 失敗

**失敗した場合の詳細**:

---

---

## 🧪 テスト 1: プラン変更（standard → feedback）

### 目的

異なるプランへの変更時に二重課金が発生しないことを確認

### 前提条件

- 現在のプラン: **standard** (1 ヶ月) - テスト 0 で作成済み
- 変更先: **feedback** (同じ期間)

### 手順

1. [ ] http://localhost:8081/subscription にアクセス
2. [ ] 現在のプランと期間を確認:
   - 現在のプラン: **Standard**
   - 現在の期間: **1 ヶ月**
3. [ ] **Feedback プラン**の「プラン変更」ボタンをクリック
4. [ ] Stripe Customer Portal（プラン変更画面）に遷移することを確認
5. [ ] プラン選択画面で **Feedback プラン**を選択
6. [ ] プラン変更を確定
7. [ ] `/subscription` ページに戻ることを確認
8. [ ] `/account` ページで新しいプラン(**Feedback**)が表示されることを確認

### 確認 A: Supabase Logs

**URL**: https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/logs/edge-functions

#### create-customer-portal 関数のログ

- [ ] `[TEST環境]` または `環境: test` のログがある
- [ ] エラーログがない

#### stripe-webhook-test 関数のログ

```
🧪 [TEST環境] Webhook受信
🧪 [TEST環境] customer.subscription.updatedイベントを処理中
✅ [TEST環境] プラン変更完了: feedback (1ヶ月)
```

- [ ] customer.subscription.updated イベントが処理されている
- [ ] `[TEST環境]` ログが表示されている
- [ ] プランが `feedback` に変更されている
- [ ] エラーログがない

### 確認 B: Stripe Dashboard

**URL**: https://dashboard.stripe.com/test/subscriptions

1. [ ] 自分の顧客を検索
2. [ ] サブスクリプション一覧を確認

#### 確認項目

- [ ] サブスクリプションが 1 件、`Active` ステータスで存在する
- [ ] プランが **Feedback** に変更されている
- [ ] **同時に 2 つ以上の `Active` サブスクリプションが存在しない**

### 確認 C: Supabase Database

```sql
SELECT
  stripe_subscription_id,
  plan_type,
  duration,
  is_active,
  environment,
  updated_at
FROM user_subscriptions
WHERE user_id = 'YOUR_USER_ID' AND environment = 'test'
ORDER BY created_at DESC;
```

**確認項目**:

- [ ] `plan_type = 'feedback'` になっている
- [ ] `is_active = true`
- [ ] `environment = 'test'`
- [ ] **`is_active=true` かつ `environment='test'` のレコードが 1 つだけ存在する**

### テスト 1 の結果

- [ ] ✅ 成功
- [ ] ❌ 失敗

**失敗した場合の詳細**:

---

---

## 🧪 テスト 2: 期間変更（1 ヶ月 → 3 ヶ月）

### 目的

同じプランで期間を変更した際に二重課金が発生しないことを確認

### 前提条件

- 現在のプラン: **feedback** (1 ヶ月)
- 変更先: **feedback** (3 ヶ月)

### 手順

1. [ ] http://localhost:8081/subscription にアクセス
2. [ ] 期間選択タブで「**3 ヶ月**」を選択
3. [ ] **Feedback プラン**の「プラン変更」ボタンをクリック
4. [ ] Stripe Customer Portal に遷移
5. [ ] 3 ヶ月プランを選択
6. [ ] プラン変更を確定
7. [ ] `/account` ページで新しい期間（3 ヶ月）が表示されることを確認

### 確認 A: Stripe Dashboard

- [ ] サブスクリプションが 1 件、`Active` ステータスで存在する
- [ ] 請求間隔が **3 months** になっている
- [ ] プランが **Feedback** のまま
- [ ] **同時に 2 つ以上の `Active` サブスクリプションが存在しない**

### 確認 B: Supabase Database

```sql
SELECT
  stripe_subscription_id,
  plan_type,
  duration,
  is_active,
  environment
FROM user_subscriptions
WHERE user_id = 'YOUR_USER_ID' AND environment = 'test'
ORDER BY created_at DESC;
```

- [ ] `duration = 3` になっている
- [ ] `plan_type = 'feedback'` のまま
- [ ] `environment = 'test'`
- [ ] **`is_active=true` のレコードが 1 つだけ存在する**

### テスト 2 の結果

- [ ] ✅ 成功
- [ ] ❌ 失敗

**失敗した場合の詳細**:

---

---

## 🧪 テスト 3: 環境分離の確認

### 目的

テスト環境と本番環境のデータが正しく分離されていることを確認

### 手順

1. [ ] Supabase SQL Editor で以下を実行:

```sql
-- 全ての環境のデータを確認
SELECT
  environment,
  COUNT(*) as count,
  STRING_AGG(DISTINCT plan_type, ', ') as plan_types
FROM user_subscriptions
WHERE user_id = 'YOUR_USER_ID'
GROUP BY environment;
```

**期待される結果**:

```
environment | count | plan_types
------------|-------|------------
test        | 1     | feedback
```

2. [ ] 本番環境（`environment = 'live'`）のデータが存在しないことを確認

### 確認項目

- [ ] テスト環境のデータのみ存在する（`environment = 'test'`）
- [ ] 本番環境のデータは存在しない（`environment = 'live'` のレコードが 0 件）

### テスト 3 の結果

- [ ] ✅ 成功
- [ ] ❌ 失敗

---

## 🧪 テスト 4: Webhook エンドポイントの分離確認

### 目的

テスト環境の Webhook が正しいエンドポイントに送信されていることを確認

### 手順

1. [ ] Stripe Dashboard（テストモード） → Developers → Webhooks
2. [ ] `stripe-webhook-test` エンドポイントをクリック
3. [ ] Logs タブで最近のイベントを確認

**確認項目**:

- [ ] `checkout.session.completed` イベントが記録されている
- [ ] `customer.subscription.updated` イベントが記録されている
- [ ] 全てのイベントが `succeeded` ステータス
- [ ] エラーがない

4. [ ] Stripe Dashboard（本番モード - "Viewing test data"をオフ） → Developers → Webhooks
5. [ ] `stripe-webhook` エンドポイントをクリック
6. [ ] Logs タブを確認

**確認項目**:

- [ ] テスト期間中のイベントが**記録されていない**（本番 Webhook には何も送信されていない）

### テスト 4 の結果

- [ ] ✅ 成功
- [ ] ❌ 失敗

---

## 📊 総合結果

### テスト実施日時

- 開始: **\_\_**
- 終了: **\_\_**

### 実施したテスト

- [ ] テスト 0: 新規ユーザー登録とサブスクリプション作成
- [ ] テスト 1: プラン変更
- [ ] テスト 2: 期間変更
- [ ] テスト 3: 環境分離の確認
- [ ] テスト 4: Webhook エンドポイントの分離確認

### 全体結果

- [ ] ✅ 全てのテストが成功
- [ ] ⚠️ 一部のテストが失敗
- [ ] ❌ 重大な問題が発見された

### 最重要確認事項（環境分離）

- [ ] **テスト環境のデータに `environment = 'test'` が記録されている**
- [ ] **本番環境のデータ（`environment = 'live'`）は作成されていない**
- [ ] **テスト環境の Webhook エンドポイント（`stripe-webhook-test`）が正しく動作している**
- [ ] **本番環境の Webhook エンドポイントにテストデータが送信されていない**
- [ ] **Stripe Dashboard で同時に 2 つ以上の Active サブスクリプションが存在しなかった**
- [ ] **DB で `is_active=true` のレコードが常に 1 つだけだった**

---

## 🚨 問題が発生した場合

### 環境が正しく分離されていない場合

1. コンソールログで `useTestPrice` の値を確認
2. Edge Function ログで環境判定が正しいか確認
3. 環境変数が正しく設定されているか確認:
   ```bash
   npx supabase secrets list | grep STRIPE
   ```

### Webhook エラーが発生した場合

1. Stripe Dashboard → Webhooks → Logs でエラー内容を確認
2. 署名シークレット（`STRIPE_WEBHOOK_SECRET_TEST`）が正しく設定されているか確認
3. Supabase Edge Function Logs でエラー詳細を確認

---

## 📝 テスト完了後の報告事項

1. **テスト結果**

   - [ ] 全て成功
   - [ ] 一部失敗（詳細を記載）

2. **環境分離確認結果**

   - テスト環境のレコード数: **\_\_**
   - 本番環境のレコード数: **\_\_** (0 であるべき)

3. **Stripe Dashboard 確認結果**

   - テスト環境の Active サブスクリプション数: **\_\_**
   - 最終的なプラン: **\_\_**
   - 最終的な期間: **\_\_**

4. **Webhook 確認結果**

   - [ ] テスト環境 Webhook が正常に動作
   - [ ] 本番環境 Webhook にテストデータが送信されていない

5. **その他気づいた点**
   ***

---

## 📌 テスト環境情報

- プロジェクト ID: fryogvfhymnpiqwssmuu
- フロントエンド URL: http://localhost:8081
- 実装内容: テスト環境と本番環境の分離
- Webhook エンドポイント:
  - テスト: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook-test`
  - 本番: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook`

---

**このドキュメントを使用して、環境分離が正しく実装されていることを確認してください。**
