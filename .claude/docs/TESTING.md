# Stripe実装テストガイド

**最終更新**: 2025-11-18

このドキュメントは、Stripe決済・サブスクリプション機能のテスト手順をまとめたものです。

---

## 📋 テスト実施日

**実施日**: __________
**テスト担当者**: __________

---

## 🔧 事前確認

### 環境確認
- [ ] 開発サーバーが起動している: http://localhost:8081
- [ ] ログインできる
- [ ] Stripe Dashboard（テストモード）にアクセス可能: https://dashboard.stripe.com/test
- [ ] Supabase Dashboard にアクセス可能: https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu

### テスト用カード番号
```
カード番号: 4242 4242 4242 4242
有効期限: 任意の未来の日付（例: 12/34）
CVC: 任意の3桁（例: 123）
郵便番号: 任意（例: 12345）
```

---

## 🧪 テスト1: プラン変更（feedback → standard）

### 目的
異なるプランへの変更時に二重課金が発生しないことを確認

### 前提条件
- 現在のプラン: **feedback** (1ヶ月 or 3ヶ月)
- 変更先: **standard** (同じ期間)

### 手順
1. [ ] http://localhost:8081/subscription にアクセス
2. [ ] 現在のプランと期間を確認・メモ:
   - 現在のプラン: __________
   - 現在の期間: __________
3. [ ] **standard** プランの「プラン変更」ボタンをクリック
4. [ ] Stripe Checkoutページに遷移することを確認
5. [ ] テストカード番号を入力して決済
6. [ ] 成功ページ (`/subscription/success`) にリダイレクトされることを確認
7. [ ] `/account` ページで新しいプランが表示されることを確認

### 確認A: Supabase Logs

**URL**: https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/logs/edge-functions

#### create-checkout 関数のログ
以下のログが順番に出力されているか確認:

```
[CREATE-CHECKOUT] リクエスト受信
[CREATE-CHECKOUT] ユーザー認証成功
[CREATE-CHECKOUT] 1件のアクティブサブスクリプションを検出
[CREATE-CHECKOUT] 1件のアクティブサブスクリプションをキャンセルします
[CREATE-CHECKOUT] 既存サブスクリプション取得成功
[CREATE-CHECKOUT] Stripeでサブスクリプションをキャンセル完了
[CREATE-CHECKOUT] DBでサブスクリプションを非アクティブ化完了
[CREATE-CHECKOUT] Checkoutセッション作成完了
```

- [ ] 上記のログが全て存在する
- [ ] エラーログがない
- [ ] 古いサブスクリプションIDが記録されている: __________
- [ ] 新しいCheckoutセッションIDが記録されている: __________

#### stripe-webhook 関数のログ
```
checkout.session.completedイベントを処理中
ユーザー [user_id] の既存アクティブサブスクリプションを確認
新しいサブスクリプションが作成されました。既存サブスクリプションは上記で処理済みです。
```

- [ ] checkout.session.completed イベントが処理されている
- [ ] 既存サブスクリプションのチェックログがある
- [ ] エラーログがない

### 確認B: Stripe Dashboard

**URL**: https://dashboard.stripe.com/test/subscriptions

1. [ ] Subscriptionsページで自分の顧客を検索
2. [ ] サブスクリプション一覧を確認

#### 古いサブスクリプション
- [ ] ステータスが `Canceled` になっている
- [ ] キャンセル日時が記録されている
- [ ] サブスクリプションID: __________

#### 新しいサブスクリプション
- [ ] ステータスが `Active` になっている
- [ ] プランが **standard** になっている
- [ ] サブスクリプションID: __________

#### ⚠️ 最重要確認
- [ ] **同時に2つ以上の `Active` サブスクリプションが存在しない**

#### Invoices（請求書）確認
**URL**: https://dashboard.stripe.com/test/invoices

- [ ] 新しいInvoiceが作成されている
- [ ] 日割り返金（Credit）が記録されている
- [ ] 二重課金が記録されていない

### 確認C: Supabase Database

**URL**: https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/editor

#### user_subscriptions テーブル

以下のSQLを実行:
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

**YOUR_USER_ID の確認方法**:
1. `/account` ページでブラウザの開発者ツールを開く
2. Console で以下を実行してJWTをコピー:
   ```javascript
   localStorage.getItem('supabase.auth.token')
   ```
3. https://jwt.io でデコードして `sub` フィールドを確認

#### 確認項目:
- [ ] 古いサブスクリプションの `is_active` が `false` になっている
- [ ] 新しいサブスクリプションの `is_active` が `true` になっている
- [ ] 新しいサブスクリプションの `plan_type` が `standard` になっている
- [ ] **`is_active=true` のレコードが1つだけ存在する**
- [ ] `updated_at` が最近の時刻になっている

### テスト1の結果
- [ ] ✅ 成功
- [ ] ❌ 失敗

**失敗した場合の詳細**:
_______________________________________________________________

---

## 🧪 テスト2: 期間変更（1ヶ月 → 3ヶ月）

### 目的
同じプランで期間を変更した際に二重課金が発生しないことを確認

### 前提条件
- 現在のプラン: **standard** (1ヶ月)
- 変更先: **standard** (3ヶ月)

### 手順
1. [ ] http://localhost:8081/subscription にアクセス
2. [ ] 期間選択タブで「**3ヶ月**」を選択
3. [ ] **standard** プランの「プラン変更」ボタンをクリック
4. [ ] Stripe Checkoutページに遷移することを確認
5. [ ] 表示価格が3ヶ月プランの価格（3,800円/月）であることを確認
6. [ ] テストカード番号を入力して決済
7. [ ] 成功ページにリダイレクトされることを確認
8. [ ] `/account` ページで新しい期間（3ヶ月）が表示されることを確認

### 確認A: Supabase Logs

#### create-checkout 関数のログ
```
[CREATE-CHECKOUT] Price ID環境変数 STRIPE_STANDARD_3M_PRICE_ID
```

- [ ] 3ヶ月プランのPrice IDが使用されている
- [ ] キャンセル処理のログがある
- [ ] エラーログがない

#### stripe-webhook 関数のログ
- [ ] checkout.session.completed イベントが処理されている
- [ ] `duration` が `3` として記録されている

### 確認B: Stripe Dashboard

#### 古いサブスクリプション（1ヶ月）
- [ ] ステータスが `Canceled` になっている

#### 新しいサブスクリプション（3ヶ月）
- [ ] ステータスが `Active` になっている
- [ ] 請求間隔が **3 months** になっている
- [ ] 価格が3ヶ月プランの価格になっている

#### ⚠️ 最重要確認
- [ ] **同時に2つ以上の `Active` サブスクリプションが存在しない**

### 確認C: Supabase Database

#### user_subscriptions テーブル
```sql
SELECT
  stripe_subscription_id,
  plan_type,
  duration,
  is_active
FROM user_subscriptions
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

- [ ] 新しいサブスクリプションの `duration` が `3` になっている
- [ ] 新しいサブスクリプションの `plan_type` が `standard` のまま
- [ ] **`is_active=true` のレコードが1つだけ存在する**

### テスト2の結果
- [ ] ✅ 成功
- [ ] ❌ 失敗

**失敗した場合の詳細**:
_______________________________________________________________

---

## 🧪 テスト3: 新規ユーザー（オプション）

### 目的
既存サブスクリプションがない場合も正常に動作することを確認

### 前提条件
- サブスクリプションなし（新規ユーザーまたは全てキャンセル済み）

### 手順
1. [ ] 新規アカウントを作成、または既存サブスクリプションを全てキャンセル
2. [ ] http://localhost:8081/subscription にアクセス
3. [ ] いずれかのプランを選択
4. [ ] 「今すぐ始める」ボタンをクリック
5. [ ] Stripe Checkoutページに遷移することを確認
6. [ ] テストカード番号を入力して決済
7. [ ] 成功ページにリダイレクトされることを確認

### 確認A: Supabase Logs

#### create-checkout 関数のログ
- [ ] 「既存のアクティブなサブスクリプションを検出」のログが**ない**
- [ ] キャンセル処理がスキップされている
- [ ] Checkoutセッション作成ログがある

### 確認B: Stripe Dashboard
- [ ] 新しいサブスクリプションが正常に作成されている
- [ ] ステータスが `Active` になっている

### 確認C: Supabase Database
- [ ] `is_active=true` のレコードが1つ存在する

### テスト3の結果
- [ ] ✅ 成功
- [ ] ❌ 失敗

**失敗した場合の詳細**:
_______________________________________________________________

---

## 🧪 テスト4: 解約同期（リアルタイム更新）

### 目的
Stripeカスタマーポータルで解約した際に、アカウントページで即座に反映されることを確認

### 前提条件
- アクティブなサブスクリプション契約中

### 手順
1. [ ] http://localhost:8081/account にアクセス
2. [ ] ブラウザの開発者ツール（Console）を開く
3. [ ] 以下のログが表示されていることを確認:
   ```
   Realtime Subscriptionを設定: {userId: "..."}
   Realtime Subscription status: SUBSCRIBED
   ```
4. [ ] 「サブスクリプションを管理」ボタンをクリック
5. [ ] Stripeカスタマーポータルで「キャンセル」を実行
6. [ ] 「期間終了時にキャンセル」を選択
7. [ ] **元のタブに戻らずに待機**
8. [ ] Consoleで以下のログが表示されることを確認:
   ```
   サブスクリプション更新を検知: {new: {...}, old: {...}}
   ```
9. [ ] アカウントページが**リロードなし**で自動更新されることを確認
10. [ ] 「解約予定」のバッジまたは表示が追加されることを確認

### 確認項目
- [ ] Realtime Subscriptionが正常に接続されている
- [ ] Webhookが`customer.subscription.updated`を処理している
- [ ] DBが更新されている（`cancel_at_period_end: true`）
- [ ] ページリロードなしでUIが更新される

### テスト4の結果
- [ ] ✅ 成功
- [ ] ❌ 失敗

**失敗した場合の詳細**:
_______________________________________________________________

---

## 🧪 テスト5: キャンセルURL

### 目的
Checkoutページでキャンセルした際に正しいページに戻ることを確認

### 手順
1. [ ] http://localhost:8081/subscription にアクセス
2. [ ] いずれかのプランで「プラン変更」または「今すぐ始める」をクリック
3. [ ] Stripe Checkoutページに遷移
4. [ ] ブラウザの「戻る」ボタン、またはCheckoutの「戻る」リンクをクリック
5. [ ] `/subscription` ページに正しく戻ることを確認
6. [ ] 404エラーが表示されないことを確認

### テスト5の結果
- [ ] ✅ 成功
- [ ] ❌ 失敗

**失敗した場合の詳細**:
_______________________________________________________________

---

## 📊 総合結果

### テスト実施日時
- 開始: __________
- 終了: __________

### 実施したテスト
- [ ] テスト1: プラン変更
- [ ] テスト2: 期間変更
- [ ] テスト3: 新規ユーザー（オプション）
- [ ] テスト4: 解約同期
- [ ] テスト5: キャンセルURL

### 全体結果
- [ ] ✅ 全てのテストが成功
- [ ] ⚠️ 一部のテストが失敗
- [ ] ❌ 重大な問題が発見された

### 最重要確認事項
- [ ] **Stripe Dashboardで同時に2つ以上のActiveサブスクリプションが存在しなかった**
- [ ] **DBで `is_active=true` のレコードが常に1つだけだった**
- [ ] **二重課金が発生しなかった**

---

## 🚨 問題が発生した場合

### 二重課金が発生した場合
1. Stripe Dashboardで両方のサブスクリプションIDをメモ
2. Supabase Logsでエラーを確認
3. 以下を記録:
   - 発生したテスト番号
   - サブスクリプションID（古い/新しい）
   - エラーメッセージ
   - ログのスクリーンショット

### エラーログがある場合
1. ログの内容を全てコピー
2. エラーメッセージを確認
3. 以下を記録:
   - エラーが発生したEdge Function名
   - エラーメッセージ
   - タイムスタンプ

---

## 📝 テスト完了後の報告事項

以下の情報を報告してください:

1. **テスト結果**
   - [ ] 全て成功
   - [ ] 一部失敗（詳細を記載）

2. **Stripe Dashboard確認結果**
   - Activeサブスクリプション数: __________
   - 最終的なプラン: __________
   - 最終的な期間: __________

3. **DB確認結果**
   - `is_active=true` のレコード数: __________

4. **ログ確認結果**
   - [ ] エラーログなし
   - [ ] エラーログあり（詳細を記載）

5. **その他気づいた点**
   _______________________________________________________________
   _______________________________________________________________

---

## 🔍 ログの確認方法

### Supabase Logsの確認
1. Supabase Dashboard > Logs > Edge Functions
2. 関数名でフィルタ: `create-checkout` または `stripe-webhook`
3. 時刻でフィルタ: テスト実施時刻の前後10分

### Stripe Dashboardの確認
1. Dashboard > Customers
2. メールアドレスで検索
3. Subscriptions タブを確認

### DBの確認
1. Supabase Dashboard > Table Editor
2. `user_subscriptions` テーブルを選択
3. Filters でユーザーIDで絞り込み

---

## 📌 テスト環境情報

- プロジェクトID: fryogvfhymnpiqwssmuu
- フロントエンドURL: http://localhost:8081
- デプロイ日時: 2025-11-18
- 修正内容: 複数サブスクリプション対応、Webhook重複チェック追加、Realtime機能追加、エラーリトライ追加

---

**このドキュメントを印刷またはPDF保存して、テスト実施時に使用してください。**
