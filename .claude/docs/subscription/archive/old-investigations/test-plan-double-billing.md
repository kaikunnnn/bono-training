# 二重課金防止テスト計画

## テスト環境
- フロントエンド: http://localhost:8081
- Supabase Dashboard: https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu
- Stripe Dashboard: https://dashboard.stripe.com/test/subscriptions

## 事前確認

### 1. 現在のサブスクリプション状態を確認
**手順:**
1. http://localhost:8081 にアクセス
2. ログイン
3. アカウントページ（/account）で現在のプラン・期間を確認
4. Subscription ページ（/subscription）で選択可能なプランを確認

**確認項目:**
- [ ] 現在のプランタイプ: ________
- [ ] 現在の期間: ________
- [ ] is_active: ________
- [ ] stripe_subscription_id: ________

---

## テスト1: プラン変更（feedback → standard）

### 目的
異なるプランへの変更時に二重課金が発生しないことを確認

### 前提条件
- 現在のプラン: feedback（1ヶ月または3ヶ月）
- 変更先: standard（同じ期間）

### 実施手順
1. http://localhost:8081/subscription にアクセス
2. 現在のプランと異なるプランを選択
3. 「プラン変更」ボタンをクリック
4. Stripe Checkoutページに遷移することを確認
5. テストカード番号を入力して決済
6. 成功ページにリダイレクトされることを確認

### 確認項目

#### A. フロントエンド
- [ ] Checkoutページが正常に表示された
- [ ] 決済が正常に完了した
- [ ] 成功ページにリダイレクトされた
- [ ] /account ページで新しいプランが表示されている

#### B. Supabase Logs（https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/logs/edge-functions）
1. `create-checkout` 関数のログを確認:
   ```
   [CREATE-CHECKOUT] 既存のアクティブなサブスクリプションを検出
   [CREATE-CHECKOUT] 既存サブスクリプションをキャンセルします
   [CREATE-CHECKOUT] 既存サブスクリプション取得成功
   [CREATE-CHECKOUT] Stripeでサブスクリプションをキャンセル完了
   [CREATE-CHECKOUT] DBでサブスクリプションを非アクティブ化完了
   [CREATE-CHECKOUT] Checkoutセッション作成完了
   ```

2. `stripe-webhook` 関数のログを確認:
   ```
   [WEBHOOK] checkout.session.completed イベント受信
   [WEBHOOK] 新しいサブスクリプションが作成されました
   ```

**確認:**
- [ ] 古いサブスクリプションのキャンセルログがある
- [ ] 新しいCheckoutセッション作成ログがある
- [ ] エラーログがない

#### C. Stripe Dashboard（https://dashboard.stripe.com/test/subscriptions）
1. Subscriptionsページで該当顧客を検索
2. サブスクリプション一覧を確認

**確認:**
- [ ] 古いサブスクリプションのステータスが `Canceled` になっている
- [ ] 新しいサブスクリプションのステータスが `Active` になっている
- [ ] 同時に2つの `Active` サブスクリプションが存在しない
- [ ] 日割り返金（Credit）が発行されている

3. Invoicesページで確認
   - [ ] 二重課金が記録されていない
   - [ ] 日割り返金が正しく反映されている

#### D. Supabase Database（https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/editor）
1. `user_subscriptions` テーブルを確認

**SQL:**
```sql
SELECT
  stripe_subscription_id,
  plan_type,
  duration,
  is_active,
  cancel_at_period_end,
  created_at,
  updated_at
FROM user_subscriptions
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

**確認:**
- [ ] 古いサブスクリプションの `is_active` が `false` になっている
- [ ] 新しいサブスクリプションの `is_active` が `true` になっている
- [ ] `is_active=true` のレコードが1つだけ存在する

---

## テスト2: 期間変更（1ヶ月 → 3ヶ月）

### 目的
同じプランで期間を変更した際に二重課金が発生しないことを確認

### 前提条件
- 現在のプラン: standard（1ヶ月）
- 変更先: standard（3ヶ月）

### 実施手順
1. http://localhost:8081/subscription にアクセス
2. 期間選択タブで「3ヶ月」を選択
3. 現在のプラン（standard）の「プラン変更」ボタンをクリック
4. Stripe Checkoutページに遷移することを確認
5. テストカード番号を入力して決済
6. 成功ページにリダイレクトされることを確認

### 確認項目

#### A. フロントエンド
- [ ] 期間タブの切り替えが正常に動作した
- [ ] Checkoutページが正常に表示された
- [ ] 決済が正常に完了した
- [ ] /account ページで新しい期間（3ヶ月）が表示されている

#### B. Supabase Logs
**確認:**
- [ ] 古いサブスクリプションのキャンセルログがある
- [ ] 新しいCheckoutセッション作成ログがある（duration=3）
- [ ] エラーログがない

#### C. Stripe Dashboard
**確認:**
- [ ] 古いサブスクリプション（1ヶ月）が `Canceled` になっている
- [ ] 新しいサブスクリプション（3ヶ月）が `Active` になっている
- [ ] 同時に2つの `Active` サブスクリプションが存在しない
- [ ] 価格が3ヶ月プランの価格（3,800円/月）になっている

#### D. Supabase Database
**確認:**
- [ ] 新しいレコードの `duration` が `3` になっている
- [ ] `is_active=true` のレコードが1つだけ存在する

---

## テスト3: 新規ユーザー

### 目的
既存サブスクリプションがない場合も正常に動作することを確認

### 前提条件
- サブスクリプションなし（新規ユーザーまたは全てキャンセル済み）

### 実施手順
1. 新規アカウントを作成、またはサブスクリプションを全てキャンセル
2. http://localhost:8081/subscription にアクセス
3. いずれかのプランを選択
4. 「今すぐ始める」ボタンをクリック
5. Stripe Checkoutページに遷移することを確認
6. テストカード番号を入力して決済

### 確認項目

#### A. Supabase Logs
**確認:**
- [ ] キャンセル処理がスキップされている
- [ ] Checkoutセッション作成ログがある
- [ ] エラーログがない

#### B. Stripe Dashboard
**確認:**
- [ ] 新しいサブスクリプションが正常に作成されている
- [ ] ステータスが `Active` になっている

---

## テスト4: エラーケース

### 4-1. Stripe APIタイムアウト（シミュレーション困難）
実環境で発生した場合の想定動作:
- エラーメッセージがユーザーに表示される
- 新しいCheckoutセッションは作成されない
- 既存サブスクリプションがキャンセルされている場合、手動で復旧が必要

### 4-2. DB更新失敗
Webhookで最終的に同期されるため、重大な問題にはならない

---

## テスト結果まとめ

### テスト1: プラン変更
- 実施日時: ___________
- 結果: [ ] 成功 / [ ] 失敗
- 備考: ___________

### テスト2: 期間変更
- 実施日時: ___________
- 結果: [ ] 成功 / [ ] 失敗
- 備考: ___________

### テスト3: 新規ユーザー
- 実施日時: ___________
- 結果: [ ] 成功 / [ ] 失敗
- 備考: ___________

---

## 問題が発生した場合の対処

### 二重課金が発生した場合
1. Stripe Dashboardで両方のサブスクリプションを確認
2. 古い方を手動でキャンセル
3. ログを確認してキャンセル処理が実行されなかった原因を特定
4. DBの `is_active` を手動で修正

### キャンセルのみ成功し新規作成が失敗した場合
1. ユーザーに再度Checkoutを試してもらう
2. 既存サブスクリプションがないため、新規作成として処理される

### ログにエラーが記録されている場合
1. エラーメッセージを確認
2. Stripe APIレスポンスを確認
3. 必要に応じてコードを修正

---

## チェックリスト

テスト実施前:
- [ ] 開発サーバーが起動している（http://localhost:8081）
- [ ] Supabase Dashboardにアクセスできる
- [ ] Stripe Dashboard（テストモード）にアクセスできる
- [ ] テスト用のカード番号を準備（4242 4242 4242 4242）

テスト実施後:
- [ ] 全てのテストケースで二重課金が発生しなかった
- [ ] Stripe Dashboardで `Active` サブスクリプションが1つだけ
- [ ] DBで `is_active=true` のレコードが1つだけ
- [ ] ログにエラーがない
- [ ] 日割り返金が正しく発行されている
