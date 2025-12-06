# ステップ 7: 設定とテストガイド

**目的**: Customer Portal を使ったプラン変更機能の設定とテスト
**所要時間**: 設定 15 分 + テスト 30 分 = 合計 45 分

---

## 📋 目次

1. [Stripe Customer Portal 設定](#1-stripe-customer-portal設定)
2. [動作テスト](#2-動作テスト)
3. [トラブルシューティング](#3-トラブルシューティング)

---

## 1. Stripe Customer Portal 設定

### ⏱️ 所要時間: 15 分

### 🔗 設定 URL

https://dashboard.stripe.com/test/settings/billing/portal

**重要**: 左上が「テストモード」になっていることを確認

---

### ✅ 設定チェックリスト

#### ステップ 1: Customer Portal の有効化

- [ok] 「Activate test link」ボタンをクリック（初回のみ）
- [ok] Customer Portal が有効になっていることを確認

---

#### ステップ 2: プラン変更機能の有効化

**セクション**: "Subscription changes"

- [ok] 「Allow customers to switch plans」を **ON** にする
- [ok] "Proration behavior"を確認:
  - 推奨設定: **"Create prorations"**（日割り計算が自動適用）
  - または: **"Always invoice"**（即座に請求書発行）

**設定方法**:

1. "Subscription changes"セクションの右側にある「Edit」をクリック
2. トグルスイッチを **ON**
3. "Proration behavior"のドロップダウンから選択
4. 「Save」をクリック

---

#### ステップ 3: 表示するプランの設定

**セクション**: "Products"

- [ok] Standard 1 ヶ月プランが表示される
- [ ok] Standard 3 ヶ月プランが表示される
- [ ok] Feedback 1 ヶ月プランが表示される
- [ok ] Feedback 3 ヶ月プランが表示される

**設定方法**:

1. "Products"セクションの「Select products」をクリック
2. 検索ボックスで「Standard」を検索
3. Standard 1 ヶ月（4,000 円）と 3 ヶ月（3,800 円）にチェック
4. 検索ボックスで「Feedback」を検索
5. Feedback 1 ヶ月（1,480 円）と 3 ヶ月（1,280 円）にチェック
6. 「Save」をクリック

**注意**:

- 価格 ID（Price ID）は環境変数と一致させる
- テストモードの価格を選択する

---

#### ステップ 4: キャンセル機能の設定（推奨）

**セクション**: "Cancellations"

- [ok] 「Allow customers to cancel subscriptions」を **ON** にする
- [ok ] "Cancellation behavior"を確認:
  - 推奨設定: **"Cancel at period end"**（期間終了時にキャンセル）

**設定方法**:

1. "Cancellations"セクションの「Edit」をクリック
2. トグルスイッチを **ON**
3. "Cancellation behavior"を選択
4. 「Save」をクリック

---

#### ステップ 5: 支払い方法の更新（推奨）

**セクション**: "Payment methods"

- [ ] 「Allow customers to update payment methods」を **ON** にする

**設定方法**:

1. "Payment methods"セクションの「Edit」をクリック
2. トグルスイッチを **ON**
3. 「Save」をクリック

---

#### ステップ 6: リダイレクト URL 設定

**セクション**: "Business information"

- [ ] "Default return URL"を設定

**設定値**:

```
http://localhost:5173/subscription
```

**設定方法**:

1. "Business information"セクションの「Edit」をクリック
2. "Default return URL"フィールドに上記 URL を入力
3. 「Save」をクリック

**注意**:

- 開発環境: `http://localhost:5173/subscription`
- 本番環境では: `https://yourdomain.com/subscription`に変更

---

### ✅ 設定完了確認

すべてのチェックボックスにチェックが入っていることを確認:

- [ok ] Customer Portal 有効化
- [ok ] プラン変更機能 ON
- [ok ] 日割り計算（Proration）有効
- [ok ] Standard/Feedback プラン表示設定
- [ok ] キャンセル機能 ON（推奨）
- [ok ] 支払い方法更新 ON（推奨）
- [ok ] リダイレクト URL 設定

---

## 2. 動作テスト

### ⏱️ 所要時間: 30 分

---

### テストケース 1: 新規ユーザーの登録

**目的**: Checkout フローが正常に動作することを確認

**手順**:

1. **ログインまたは新規登録**

   - 新しいアカウントを作成、または未契約のアカウントでログイン
   - テストメール: `test-user-001@example.com`（任意）

2. **`/subscription`ページにアクセス**

   - URL: http://localhost:5173/subscription
   - 期待: プラン一覧が表示される

3. **プランを選択**

   - 例: Standard 1 ヶ月プラン
   - 「選択する」ボタンをクリック

4. **Checkout ページへ遷移**

   - 期待: Stripe Checkout ページが開く
   - URL が`https://checkout.stripe.com/...`になる

5. **テストカードで決済**

   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 任意の未来の日付（例: `12/34`）
   - CVC: 任意の 3 桁（例: `123`）
   - 名前: 任意
   - 郵便番号: 任意

6. **決済完了後の確認**

   - 期待: `/subscription/success`ページに遷移
   - 成功メッセージが表示される
   - 「レッスンを見る」「アカウント設定」ボタンが表示される

7. **サブスクリプション情報の確認**
   - `/account`ページにアクセス
   - 期待: 選択したプラン（例: Standard）が表示される
   - 「プランを管理」ボタンが表示される

**✅ 成功条件**:

- [ok] Checkout に正しく遷移した
- [ok] 決済が完了した
- [ok] `/subscription/success`に遷移した
- [ok] `/account`で正しいプランが表示される

→ 追記 /account のページでは「プラン名」＋「期間」も表示してほしいです。可能なら更新日も。更新日は可能なら。
→ /subscription の現在のプランも「期間（1 ヶ月、か、３ヶ月）」出してほしいです

---

### テストケース 2: 既存契約者のプラン変更

**目的**: Customer Portal でのプラン変更が正常に動作することを確認

**前提条件**: テストケース 1 を完了していること

**手順**:

1. **`/subscription`ページにアクセス**

   - URL: http://localhost:5173/subscription
   - 期待: 現在のプランに「現在のプラン」バッジが表示される
   - 他のプランに「プラン変更」ボタンが表示される
     → 追記：OK。だけど /subscription の現在のプランも「期間（1 ヶ月、か、３ヶ月）」出してほしいです

2. **別のプランを選択**
   - 例: Standard → Feedback
   - 「プラン変更」ボタンをクリック

- 追記：エラーが発生します以下のものです。更新ができません。

```stripe.ts:154
 POST https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/create-customer-portal 500 (Internal Server Error)
stripe.ts:159 カスタマーポータルセッション作成エラー: FunctionsHttpError: Edge Function returned a non-2xx status code
    at FunctionsClient.<anonymous> (@supabase_supabase-j…?v=52e6a777:1407:17)
    at Generator.next (<anonymous>)
    at fulfilled (@supabase_supabase-j…?v=52e6a777:1326:24)
stripe.ts:169 カスタマーポータルURL取得エラー: Error: カスタマーポータルの作成に失敗しました。
    at getCustomerPortalUrl (stripe.ts:160:13)
    at async handleSubscribe (Subscription.tsx:68:27)
Subscription.tsx:89 購読エラー: Error: カスタマーポータルの作成に失敗しました。
    at getCustomerPortalUrl (stripe.ts:160:13)



```

1. **Customer Portal へ遷移**

   - 期待: Stripe Customer Portal が開く
   - URL が`https://billing.stripe.com/session/...`になる
   - Stripe 提供の UI が表示される

2. **Customer Portal 内での操作**

   - 現在のプラン（例: Standard 1 ヶ月）が表示されることを確認
   - 「Update plan」または「プランを更新」をクリック
   - 利用可能なプランのリストが表示される
   - Standard/Feedback の 1 ヶ月/3 ヶ月プランがすべて表示されることを確認

3. **新しいプランを選択**

   - 例: Feedback 1 ヶ月を選択
   - **日割り計算後の金額が表示される**ことを確認
   - 「変更する」または「Update subscription」をクリック

4. **変更完了後の確認**

   - 期待: `/subscription`ページに戻る
   - 変更には数秒かかる場合がある（ページをリロード）

5. **データベースの確認**
   - `/account`ページにアクセス
   - 期待: 新しいプラン（Feedback）が表示される

**✅ 成功条件**:

- [× ] Customer Portal に正しく遷移した
- [× ] すべてのプランが表示された
- [× ] 日割り計算の金額が表示された
- [× ] プラン変更が完了した
- [× ] `/account`で新しいプランが表示される

---

### テストケース 3: 期間変更（1 ヶ月 ↔3 ヶ月）

**目的**: 同じプラン内での期間変更が正常に動作することを確認

**前提条件**: 何らかのプランに契約していること

**手順**:

1. **`/subscription`ページにアクセス**

2. OK**期間タブを切り替え**

   - 現在: 1 ヶ月契約中
   - 操作: 「3 ヶ月」タブをクリック
   - 期待: 価格が 3 ヶ月プランの金額に変わる

3. × **同じプランの別期間を選択**
   - 例: Standard 1 ヶ月 → Standard 3 ヶ月
   - 「プラン変更」ボタンをクリック

- 追記：× 　プラン変更と同じようなエラーが発生、エラーがでて Customer Portal 二遷移できません。

4. **Customer Portal で変更**

   - 手順はテストケース 2 と同様
   - Standard 3 ヶ月を選択
   - 日割り計算が表示される
   - 変更を確定

5. **変更後の確認**
   - `/account`ページで確認
   - 期待: プランはそのまま（Standard）
   - 期間が 3 ヶ月に変更されていることを確認（表示されない場合あり）

**✅ 成功条件**:

- [ ] 期間変更が完了した
- [ ] 日割り計算が適用された
- [ ] データベースが更新された

---

### テストケース 4: 解約機能

**目的**: 解約が正常に動作することを確認

**手順**:

1. **`/account`ページにアクセス**

   - URL: http://localhost:5173/account

2. OK **「プランを管理」ボタンをクリック**

   - 期待: Customer Portal に遷移
   - OK

3. **Customer Portal 内で解約操作**

   - 「Cancel plan」または「プランをキャンセル」をクリック
   - 確認ダイアログが表示される
   - 解約理由を選択（任意）
   - 「Cancel plan」を確定
   - OK👍️

4. **解約後の確認**

   - `/subscription`ページに戻る
   - `/account`ページにアクセス
   - 期待: 「無料」または「フリープラン」が表示される
   - 「プランを見る」ボタンが表示される
   - 追記：即解除じゃないので、期間が残っているのですぐに「無料」にはならないです。

5. **データベースの確認**
   - Supabase SQL Editor で確認:
   ```sql
   SELECT * FROM user_subscriptions
   WHERE user_id = 'YOUR_USER_ID';
   ```
   - 期待: `is_active = false`

▽ 結果です
`` メール: takumi.kai.skywalker@gmail.com

- ユーザー ID: 71136a45-a876-48fa-a16a-79b031226b8a

- プラン種別: community

- 期間: 1

- 有効フラグ: true

- Stripe サブスクリプション ID: sub_1SUKKVKUVUnt8GtyIjjafv1l

- Stripe カスタマー ID: cus_TN1J7SyNzawoqw
- 更新日時: 2025-11-17 04:52:08.116862+00 ```

- ちなみに
  - マイページ：フィードバック
  - カスタマーポータル：スタンダード
    になってます。どういうこと？？？

**✅ 成功条件**:

- [ ] 解約が完了した
- [ ] `/account`で無料プランが表示される
- [ ] データベースが更新された（`is_active = false`）

---

## 3. トラブルシューティング

### 問題 1: Customer Portal にアクセスできない

**症状**:

- 「Stripe 顧客情報が見つかりません」エラー
- 404 エラー

**原因**:

- `stripe_customers`テーブルにユーザーのレコードがない
- 初回チェックアウトが完了していない

**解決方法**:

1. データベースを確認:

```sql
SELECT * FROM stripe_customers WHERE user_id = 'YOUR_USER_ID';
```

2. レコードがない場合:
   - 一度ログアウト
   - 新規登録（チェックアウト）を実行
   - チェックアウト完了後、`stripe_customers`にレコードが作成される
3. 再度 Customer Portal にアクセス

---

### 問題 2: プラン変更のオプションが表示されない

**症状**:

- Customer Portal で「Update plan」ボタンがない
- プランのリストが空

**原因**:

- Stripe ダッシュボードでプランが設定されていない
- "Subscription changes"が無効

**解決方法**:

1. https://dashboard.stripe.com/test/settings/billing/portal を開く
2. "Subscription changes" → 「Allow customers to switch plans」を **ON**
3. "Products" → 表示するプランを選択:
   - Standard 1 ヶ月/3 ヶ月
   - Feedback 1 ヶ月/3 ヶ月
4. 保存

---

### 問題 3: 日割り計算が適用されない

**症状**:

- プラン変更時に全額請求される
- クレジットが付与されない

**原因**:

- Proration behavior が無効

**解決方法**:

1. https://dashboard.stripe.com/test/settings/billing/portal を開く
2. "Subscription changes"セクション → 「Edit」
3. "Proration behavior" → **"Create prorations"** を選択
4. 保存

---

### 問題 4: プラン変更後にデータベースが更新されない

**症状**:

- Customer Portal で変更したのに、`/account`で古いプランが表示される

**原因**:

- Webhook イベントが処理されていない
- `customer.subscription.updated`イベントの失敗

**確認方法**:

1. https://dashboard.stripe.com/test/webhooks にアクセス
2. 最新のイベントを確認
3. `customer.subscription.updated`イベントのステータスを確認
   - ✅ 200 OK → 正常
   - ❌ 401/404/500 → エラー

**解決方法（Webhook エラーの場合）**:

1. Webhook ログを確認:
   - エラーメッセージを読む
   - リクエスト/レスポンスを確認
2. Edge Function のログを確認:
   - Supabase Dashboard → Edge Functions → stripe-webhook → Logs
3. 必要に応じて再デプロイ:

```bash
npx supabase functions deploy stripe-webhook --no-verify-jwt
```

4. Stripe ダッシュボードでイベントを再送信:
   - 該当イベントの「Resend webhook」をクリック

---

### 問題 5: `/subscription/success`で 404 エラー

**症状**:

- チェックアウト完了後に 404 エラー

**原因**:

- ルーティングが設定されていない（本実装では解決済み）

**確認方法**:

```typescript
// src/App.tsx
<Route
  path="/subscription/success"
  element={
    <PrivateRoute>
      <SubscriptionSuccess />
    </PrivateRoute>
  }
/>
```

**解決方法**:

- すでに実装済みのため、発生しないはず
- もし発生した場合はブラウザキャッシュをクリア

---

## 📊 テスト結果チェックリスト

### 必須テスト

- [ ] テストケース 1: 新規ユーザー登録
- [ ] テストケース 2: プラン変更
- [ ] テストケース 3: 期間変更
- [ ] テストケース 4: 解約

### 確認項目

- [ ] Checkout フローが正常
- [ ] Customer Portal に遷移できる
- [ ] すべてのプランが表示される
- [ ] 日割り計算が表示される
- [ ] プラン変更が反映される
- [ ] データベースが更新される
- [ ] Webhook が 200 OK で処理される

---

## 🎯 完了条件

すべてのテストケースが成功し、以下が確認できたら完了:

1. ✅ 新規ユーザーが Checkout で登録できる
2. ✅ 既存契約者が Customer Portal でプラン変更できる
3. ✅ 日割り計算が自動適用される
4. ✅ 変更後にデータベースが更新される
5. ✅ `/account`ページで正しいプランが表示される
6. ✅ 解約が正常に動作する

---

## 📝 メモ・備考

### テスト用アカウント情報

**既存テストユーザー**:

- メールアドレス: `takumi.kai.skywalker@gmail.com`
- User ID: `71136a45-a876-48fa-a16a-79b031226b8a`
- 現在のプラン: なし（テスト用にキャンセル済み）

**新規テスト用**:

- 任意のメールアドレス（例: `test-001@example.com`）
- パスワード: テスト用の適当なもの

### Stripe テストカード

**成功するカード**:

- カード番号: `4242 4242 4242 4242`
- 有効期限: 任意の未来の日付
- CVC: 任意の 3 桁

**失敗するカード（テスト用）**:

- カード番号: `4000 0000 0000 0002`
- 結果: カード拒否エラー

### データベース確認 SQL

```sql
-- ユーザーのサブスクリプション情報を確認
SELECT
  user_id,
  plan_type,
  duration,
  is_active,
  stripe_subscription_id,
  updated_at
FROM user_subscriptions
WHERE user_id = 'YOUR_USER_ID';

-- Stripe顧客情報を確認
SELECT * FROM stripe_customers
WHERE user_id = 'YOUR_USER_ID';
```

---

**作成日**: 2025-11-17
**最終更新**: 2025-11-17
**所要時間**: 設定 15 分 + テスト 30 分 = 合計 45 分
