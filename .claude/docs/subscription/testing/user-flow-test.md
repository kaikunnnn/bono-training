# サブスクリプション ユーザーフローテスト

**作成日**: 2025-11-24
**目的**: 実装済みユーザーフローの動作確認

---

## 📑 目次

1. [テスト環境](#テスト環境)
2. [Test 1: ログイン済みユーザーの新規登録](#test-1-ログイン済みユーザーの新規登録)
3. [Test 2A: プラン変更 - ダウングレード（Standard → Feedback）](#test-2a-プラン変更---ダウングレードstandard--feedback)
4. [Test 2B: プラン変更 - アップグレード（Feedback → Standard）](#test-2b-プラン変更---アップグレードfeedback--standard)
5. [Test 3A: 期間変更 - 延長（1 ヶ月 → 3 ヶ月）](#test-3a-期間変更---延長1ヶ月--3ヶ月)
6. [Test 3B: 期間変更 - 短縮（3 ヶ月 → 1 ヶ月）](#test-3b-期間変更---短縮3ヶ月--1ヶ月)
7. [Test 4: キャンセル](#test-4-キャンセル)
8. [Test 5: 二重課金防止](#test-5-二重課金防止)
9. [テストサマリー](#テストサマリー)

---

## テスト環境

- **テストモード**: Stripe Test Mode
- **テストユーザー**: `test-user@example.com`
- **テストカード**: `4242 4242 4242 4242`

---

## Test 1: ログイン済みユーザーの新規登録

### 前提条件

- [○] ユーザーがログイン済み
- [○] サブスクリプション未登録状態

### テスト手順

1. `/subscription` ページにアクセス
2. プランを選択（Standard / Feedback）
3. 期間を選択（1 ヶ月 / 3 ヶ月）
4. 「今すぐ始める」ボタンをクリック
5. Stripe Checkout ページで決済情報入力
6. 決済完了
7. `/subscription/success` ページにリダイレクト

▼ テストした内容 11/25/2025
`テスト内容：フィードバックの3ヶ月を選択します`

### 期待される結果

#### ✅ フロントエンド

- [○] `/subscription` ページで選択したプランが表示される
- [○] `/subscription/success` ページに正常に遷移
- [○] サブスクリプション情報が正しく表示される

#### ✅ データベース

**user_subscriptions テーブル**:

```sql
SELECT
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  plan_type,
  duration,
  status,
  created_at
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

**期待値**:

- user_id: （テストユーザーの ID）
- stripe_subscription_id: `sub_xxxxx`
- stripe_customer_id: `cus_xxxxx`
- plan_type: 選択したプラン（'standard' / 'feedback'）
- duration: 選択した期間（1 / 3）
- status: 'active'

#### ✅ Stripe Dashboard

- [○] 新しいサブスクリプションが作成されている
- [○] ステータスが 'active'
- [○] 正しいプラン・金額が設定されている

### 実施結果

**実施日時**:
11/25/2025
**フロントエンド結果**:

```
[選択したプラン・期間を記入 : フィードバック3ヶ月]
[リダイレクト先URL：サブスク成功時は http://localhost:8080/subscription/success?session_id=cs_test_a13nIqocOX2nM5uhouQrUcbWQOTj8LjyTLCO8HU2yA0ITDSlzpaYo5y3PH - フィードバックプランへようこそと出ました]
[表示されたサブスクリプション情報 :
　/account - フィードバック3ヶ月 次回更新日:2026年2月25日
/subscription - 現在のプラン: フィードバック（3ヶ月）

stripe customer portal - グロースプラン
3 カ月ごとに ￥26,400
次の請求日は 2026年2月25日 です。]

```

**データベース結果**:

```sql
  {
    "id": "cee95f09-f15c-429a-a78e-f71cbd296125",
    "user_id": "e118477b-9d42-4d5c-80b9-ad66f73b6b02",
    "plan_type": "feedback",
    "is_active": true,
    "stripe_subscription_id": "sub_1SXGeNKUVUnt8GtyFkhIAVEB",
    "created_at": "2025-11-25 07:27:07.816682+00",
    "updated_at": "2025-11-25 07:27:15.181818+00",
    "stripe_customer_id": "cus_TUF88ONsX2pa7j",
    "plan_members": true,
    "duration": 3,
    "cancel_at_period_end": false,
    "cancel_at": null,
    "current_period_end": "2026-02-25 07:26:59+00",
    "environment": "test"
  }
]
```

**Stripe Dashboard**:

```
[Subscription ID] sub_1SXGeNKUVUnt8GtyFkhIAVEB
[ステータス]有効
[金額] 26,400
cus_TUF88ONsX2pa7j
```

**判定**: ✅ 成功

**備考**:

```
[問題点・気づいた点があれば記入]
```

---

## Test 2A: プラン変更 - ダウングレード（Feedback → Standard）

**テストの目的**: 価格が下がるプラン変更（ダウングレード）の動作確認

### 前提条件

- [○] フィードバック 3 ヶ月プランに登録済み
  → 価格設定的に スタンダード >> フィードバック

### テスト手順

1. `/subscription` ページにアクセス
2. 「Standard 1 ヶ月」プランの「このプランに変更」ボタンをクリック
3. Customer Portal で変更内容を確認
4. 「確定」ボタンをクリック
5. `/subscription` ページに戻る

### 期待される結果

#### ✅ フロントエンド

- [○] プラン変更後、Standard プランが表示される
- [○] プロレーション（日割り計算）が正しく表示される
- [○] ダウングレードの場合、通常は次回更新日から新プランに切り替わる

#### ✅ データベース

**変更前の状態を記録**:

```sql
SELECT plan_type, duration, stripe_subscription_id, updated_at
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

**変更後の状態を確認**:

```sql
SELECT plan_type, duration, stripe_subscription_id, updated_at
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

**期待値**:

- plan_type: 'standard' → 'feedback'
- duration: 1（変更なし）
- stripe_subscription_id: （同じ ID）
- updated_at: （更新されている）

#### ✅ Stripe Dashboard

- [○] サブスクリプション ID は変わらない
- [○] Subscription Items が更新されている
- [○] プロレーション: 差額がクレジットまたは次回請求時に調整される
- [○] 価格: ¥4,980 → ¥3,980

#### ✅ Edge Functions Logs

```bash
npx supabase functions logs stripe-webhook-test --limit 20
```

**期待値**:

- [?] `POST | 200 | stripe-webhook-test`
- [?] `customer.subscription.updated` イベントが処理されている
- [?] エラーなし

### 実施結果（2025-11-25 初回テスト）

**実施日時**:
11/25 16:44
**変更前の状態**:

```sql
テスト1のものと同じです
```

**変更後の状態**:

```sql
[
  {
    "id": "cee95f09-f15c-429a-a78e-f71cbd296125",
    "user_id": "e118477b-9d42-4d5c-80b9-ad66f73b6b02",
    "plan_type": "standard",
    "is_active": true,
    "stripe_subscription_id": "sub_1SXGeNKUVUnt8GtyFkhIAVEB",
    "created_at": "2025-11-25 07:27:07.816682+00",
    "updated_at": "2025-11-25 07:45:36.277978+00",
    "stripe_customer_id": "cus_TUF88ONsX2pa7j",
    "plan_members": true,
    "duration": 1,
    "cancel_at_period_end": false,
    "cancel_at": null,
    "current_period_end": "2025-12-25 07:45:32+00",
    "environment": "test"
  }
]
```

**Stripe Dashboard**:

```
[Subscription ID（変更前後で同じか確認）] sub_1SXGeNKUVUnt8GtyFkhIAVEB
[プロレーション金額]
(￥21,417)
JPY
支払い済み
1 カ月ごと
AGYEPFFN-0002
kyasya00@gmail.com
—
11/25 16:45
PDF をダウンロード
￥26,400
JPY
支払い済み
3 カ月ごと
[新しいプラン: standard 1M - ¥4,980]→確認できた
```

**Edge Functions Logs**:

```
**Edge Functions Logs**:

  ✅ Webhook正常処理を確認

  2025-11-25T07:45:36.380Z
  POST | 200 | stripe-webhook-test
  実行時間: 1394ms
  イベント: customer.subscription.updated (推定)
  Subscription ID: sub_1SXGeNKUVUnt8GtyFkhIAVEB

  2025-11-25T07:45:36.011ZPOST | 200 | stripe-webhook-test
  実行時間: 1540ms
  Status: 200 (成功)

  エラーなし - データベース更新成功
  plan_type: feedback → standard
  duration: 3 → 1
```

**判定**: ✅ 成功 ナイス！

---

### 🔄 再テスト結果（2025-11-27 useTestPrice修正後）

**実施日時**: 2025-11-27
**テストプラン**: スタンダード 1ヶ月 → フィードバック 1ヶ月

**テスト結果**: ✅ **完全成功**

**変更前の状態**:
```sql
plan_type: 'standard'
duration: 1
stripe_subscription_id: [同じID]
```

**変更後の状態**:
```sql
plan_type: 'feedback'
duration: 1
stripe_subscription_id: [同じID]
```

**Console ログ**:
```javascript
購読状態確認結果: {
  subscribed: true,
  planType: 'feedback',
  duration: 1,
  isSubscribed: true,
  cancelAtPeriodEnd: false,
  ...
}

Edge Functionから取得したアクセス権限を使用: {
  hasMemberAccess: true,
  hasLearningAccess: true,
  planType: 'feedback'
}
```

**確認事項**:
- ✅ プラン変更: スタンダード → フィードバック
- ✅ Customer Portal で変更完了
- ✅ `/subscription` ページに正しく反映
- ✅ 購読状態が正常に取得できている
- ✅ アクセス権限が正しく設定されている
- ⚠️ Stripe 404エラー（`billing.stripe.com/ajax/client_init_timeout_report`）
  - **問題なし**: Stripe側の内部分析用エンドポイント
  - **影響**: なし（Stripeの内部ログ収集機能）
  - **対処**: 不要

**判定**: ✅ **修正完了 - 正常動作確認**

**備考**:
- プラン変更機能が正常に動作
- useTestPrice修正の影響なし
- Stripe 404エラーはStripe側の仕様（無視してOK）

---

**備考（初回テスト）**:

```
▼ メモ：更新時（フィードバック3ヶ月からフィードバック1ヶ月）の日割り計算表示のコピペ
更新を確認
スタンダードプラン
次回からのお支払い (毎月)
2025年12月25日 以降
￥4,980
グロースプラン の比例配分のクレジット
-￥26,397
スタンダードプラン
￥4,980
合計
-￥21,417
アカウント残高をクレジット
￥21,417
本日が期日の金額
￥0
本日が期日の金額

詳細を非表示
￥0
Visa •••• 4242


```

---

## Test 2B: プラン変更 - アップグレード（Standard → Feedback)

**テストの目的**: 価格が上がるプラン変更（アップグレード）の動作確認
補足：スタンダードよりフィードバックの方が金額は高いです。

### 前提条件

- [○] Standard 1 ヶ月プランに登録済み

### テスト手順

1. `/subscription` ページにアクセス
2. Feedback 1 ヶ月」プランの「このプランに変更」ボタンをクリック
3. Customer Portal で変更内容を確認
4. 「確定」ボタンをクリック
5. `/subscription` ページに戻る

### 期待される結果

#### ✅ フロントエンド

- [○] プラン変更後、Feedback1 ヶ月プランが表示される
- [○] プロレーション（日割り計算）が正しく表示される
- [○] アップグレードの場合、即座に新プランに切り替わる

#### ✅ データベース

**変更前の状態を記録**:

```sql
SELECT plan_type, duration, stripe_subscription_id, updated_at
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

**変更後の状態を確認**:

```sql
SELECT plan_type, duration, stripe_subscription_id, updated_at
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

**期待値**:

- plan_type: 'feedback' → 'standard'
- duration: 1（変更なし）
- stripe_subscription_id: （同じ ID）
- updated_at: （更新されている）

#### ✅ Stripe Dashboard

- [○] サブスクリプション ID は変わらない
- [○] Subscription Items が更新されている
- [○] プロレーション: 残り期間分の差額が即座に請求される
- [○] 価格: ¥3,980 → ¥4,980
- [○] 新しいインボイスが作成されている（差額請求）

#### ✅ Edge Functions Logs

```bash
npx supabase functions logs stripe-webhook-test --limit 20
```

**期待値**:

- [?] `POST | 200 | stripe-webhook-test`
- [?] `customer.subscription.updated` イベントが処理されている
- [?] エラーなし

### 実施結果

**実施日時**:
11/27 09:41

**変更前の状態**:

````sql
テスト2Aの結果？と同じスタンダードプラン1ヶ月のステータスです。```

**変更後の状態**:

```sql

  {
    "user_id": "e118477b-9d42-4d5
  c-80b9-ad66f73b6b02",
    "stripe_subscription_id":
  "sub_1SXGeNKUVUnt8GtyFkhIAVEB",
    "stripe_customer_id":
  "cus_TUF88ONsX2pa7j",
    "plan_type": "feedback",
    "duration": 1,
    "cancel_at_period_end":
  false,
    "current_period_end":
  "2025-12-25 07:45:32+00",
    "created_at": "2025-11-25
  07:27:07.816682+00",
    "updated_at": "2025-11-26
  00:43:03.047389+00"
  }
````

**Stripe Dashboard**:

```
[Subscription ID（変更前後で同じか確認）] = sub_1SXGeNKUVUnt8GtyFkhIAVEB
[プロレーション金額] = `下の 更新を確認のページでの差額の計算は以下の表示でした に記入`
[新しいプラン: ] = グロース 9999円/月
[新しいインボイスID] = (￥4,863)
JPY
sub_1SXGeNKUVUnt8GtyFkhIAVEB
ii_1SXWoyKUVUnt8GtyktWkhDnK
11/26 09:43
￥9,764
JPY
sub_1SXGeNKUVUnt8GtyFkhIAVEB
ii_1SXWoyKUVUnt8GtyyVXvElQz
11/26 09:43

```

**Edge Functions Logs**:

```
○ 購読状態確認結果: `読状態確認結果: {subscribed: true, planType: 'feedback', duration: 1, isSubscribed: true, cancelAtPeriodEnd: false, …}`

○ Edge Functionから取得したアクセス権限を使用:
{hasMemberAccess: true, hasLearningAccess: true, planType: 'feedback'}


- 26 Nov 25 09:43:16: 401 POST 44a16a3d-fc96-4560-b63b-8284c4ba48d9

- 26 Nov 25 09:43:10: 200 POST 3b695e5b-660f-4208-87dd-c7d39e0ef824

- 26 Nov 25 09:43:10: 200 POST 82fb3b7f-faa4-44e7-b2c3-55f781da3ae9

- 26 Nov 25 09:43:10: 200 POST 03202eb0-58b1-4ad4-ae36-e2fd5079bf9e

- 26 Nov 25 09:43:10: 200 POST 1f5cf11d-867f-46d5-840a-af6c19730474

- 26 Nov 25 09:43:10: 200 OPTIONS 7504ce47-2e0a-4ba3-8f6e-d9a1ec5d8ad3

- 26 Nov 25 09:43:10: 200 OPTIONS 66720620-d5b4-4a11-912f-28dd4cb4238d

- 26 Nov 25 09:43:10: 200 OPTIONS ed52b1fe-5d54-4570-8509-b42e15348817

- 26 Nov 25 09:43:10: 200 OPTIONS 59db97bc-aad9-4b14-8222-4e37185c4f91

- 26 Nov 25 09:43:03: 200 POST 37d92a3d-bdd6-4f6b-8576-6779d8beb761

- 26 Nov 25 09:43:01: 401 POST fde47705-8ee0-4150-93e4-db8b0f1d039c


```

**判定**: ✅ 成功

**備考**:

```
▼ 更新を確認のページでの差額の計算は以下の表示でした
`更新を確認
グロースプラン
次回からのお支払い (毎月)
2026年1月25日 以降
￥9,999
スタンダードプラン の比例配分のクレジット
-￥4,863
グロースプラン の比例配分の請求
￥9,764
グロースプラン
￥9,999
合計
￥14,900
適用された残高
-￥14,900
2025年12月25日が期日の金額
￥0
2025年12月25日が期日の金額

詳細を非表示
￥0
`
```

### 🔄 再テスト結果（2025-11-27 useTestPrice修正後）

**実施日時**: 2025-11-27
**テストプラン**: フィードバック 1ヶ月 → スタンダード 1ヶ月
**テスト結果**: ✅ **完全成功**

**Console ログ**:
```javascript
Edge Functionから取得したアクセス権限を使用: {
  hasMemberAccess: true,
  hasLearningAccess: true,
  planType: 'standard'
}
```

**確認事項**:
- ✅ プラン変更: フィードバック → スタンダード
- ✅ プロレーション金額が正しく表示された
- ✅ アクセス権限が正しく更新された
  - `hasMemberAccess: true` ✅
  - `hasLearningAccess: true` ✅
  - `planType: 'standard'` ✅
- ✅ Console エラーなし
- ✅ Edge Function が正常動作

**判定**: ✅ **成功 - useTestPrice修正後も正常動作**

---

## Test 3A: 期間変更 - 延長（1 ヶ月 → 3 ヶ月）

**テストの目的**: 短期プランから長期プランへの変更確認

### 前提条件

- [○] 任意のプランで 1 ヶ月登録済み = フィードバック 1 ヶ月に加入済み

### テスト手順

1. `/subscription` ページにアクセス
2. 現在のプランで「3 ヶ月」を選択 → フィードバックになる
3. 「このプランに変更」ボタンをクリック
4. Customer Portal で変更内容を確認
5. 「確定」ボタンをクリック

### 期待される結果

#### ✅ フロントエンド

- [○] 期間が 3 ヶ月に変更されている
- [○] プロレーションが正しく表示される

#### ✅ データベース

**変更前の状態を記録**:

```sql
SELECT plan_type, duration, stripe_subscription_id, updated_at
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

**変更後の状態を確認**:

```sql
SELECT plan_type, duration, stripe_subscription_id, updated_at
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

**期待値**:

- plan_type: （変更なし）
- duration: 1 → 3
- stripe_subscription_id: （同じ ID）
- updated_at: （更新されている）

#### ✅ Stripe Dashboard

- [○] サブスクリプション ID は変わらない
- [○] Subscription Items が更新されている
- [○] 価格: 1 ヶ月プラン → 3 ヶ月プラン（例: ¥4,980 → ¥13,680 または ¥3,980 → ¥10,980）
- [○] プロレーション: 残り期間分の差額が即座に請求される

#### ✅ Edge Functions Logs

```bash
npx supabase functions logs stripe-webhook-test --limit 20
```

**期待値**:

- [?] `POST | 200 | stripe-webhook-test`
- [?] `customer.subscription.updated` イベントが処理されている
- [○] エラーなし

### 実施結果

**実施日時**:

**変更前の状態**:

```sql
[前のテスト結果と同じ]
```

**変更後の状態**:

```sql
[| plan_type | duration | stripe_subscription_id       | updated_at                    |
| --------- | -------- | ---------------------------- | ----------------------------- |
| feedback  | 3        | sub_1SXGeNKUVUnt8GtyFkhIAVEB | 2025-11-26 00:49:19.796673+00 |]
```

**Stripe Dashboard**:

```
[Subscription ID（変更前後で同じか確認）] = sub_1SXGeNKUVUnt8GtyFkhIAVEB
[プロレーション金額] = ￥26,400
[新しい期間: 3ヶ月] = YES
```

**Edge Functions Logs**:

```
• 26 Nov 25 09:50:37: 200 POST fce8991e-419a-4ca8-8825-d437faab11f9

- 26 Nov 25 09:50:37: 200 POST d80be52b-6095-415c-ae83-3c418041f389

- 26 Nov 25 09:50:37: 200 POST 77baa629-8d6a-40bb-9179-2f759f460164

- 26 Nov 25 09:50:37: 200 POST 5ef7cd25-7be2-4f91-a014-3533850584bd

- 26 Nov 25 09:50:36: 200 OPTIONS 86a07d04-bd86-4d8f-b1b6-b991ccbde664

- 26 Nov 25 09:50:36: 200 OPTIONS 5f3b709b-4160-4004-9b9e-1a8758424a49

- 26 Nov 25 09:50:36: 200 OPTIONS 68050e93-a58c-490b-a528-62d14a6fe25e

- 26 Nov 25 09:50:36: 200 OPTIONS c8dbcef4-c4f6-4b22-a241-a732d4b1bc31

- 26 Nov 25 09:49:19: 200 POST e2221121-0934-4c58-8fd2-1d36c44cbfcc

- 26 Nov 25 09:49:19: 200 POST a6acebb0-1fdd-42e7-8285-b41b995bee5b

- 26 Nov 25 09:49:18: 401 POST bfac0efa-7bfa-4c15-bf86-ebeb7bf15b78

- 26 Nov 25 09:49:18: 401 POST fcae80fa-69f7-402e-94a8-46968f707e6c

- 26 Nov 25 09:47:57: 200 POST 411bddfe-4ff3-45e5-8647-d85bdbff9321

- 26 Nov 25 09:47:56: 200 OPTIONS 6bcd6053-27d3-4ac5-b334-65864884ca59
```

**判定**: ✅ 成功 / ❌ 失敗 / ⚠️ 部分成功

**備考**:

```
このテストでEdgeFunctionのログの場所が今までみてる場所が違うと気づいた気がする？？
その中に「４０１」のものがあるので気になる。毎回のプランの変更やアプデのタイミングで1つは発生しているかもしれない？？
```

---

## Test 3B: 期間変更 - 短縮（3 ヶ月 → 1 ヶ月）

**テストの目的**: 長期プランから短期プランへの変更確認

### 前提条件

- [○] 任意のプランで 3 ヶ月登録済み → フィードバック 3 ヶ月からフィードバック 1 ヶ月に変更します。

### テスト手順

1. `/subscription` ページにアクセス
2. 現在のプランで「1 ヶ月」を選択
3. 「このプランに変更」ボタンをクリック
4. Customer Portal で変更内容を確認
5. 「確定」ボタンをクリック

### 期待される結果

#### ✅ フロントエンド

- [○] 期間が 1 ヶ月に変更されている
- [○] プロレーションが正しく表示される
- [○] ダウングレードの場合、通常は次回更新日から新プランに切り替わる

#### ✅ データベース

**変更前の状態を記録**:

```sql
SELECT plan_type, duration, stripe_subscription_id, updated_at
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

**変更後の状態を確認**:

```sql
SELECT plan_type, duration, stripe_subscription_id, updated_at
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

**期待値**:

- plan_type: （変更なし）
- duration: 3 → 1
- stripe_subscription_id: （同じ ID）
- updated_at: （更新されている）

#### ✅ Stripe Dashboard

- [○] サブスクリプション ID は変わらない
- [?] Subscription Items が更新されている
- [○] 価格: 3 ヶ月プラン → 1 ヶ月プラン（例: ¥13,680 → ¥4,980 または ¥10,980 → ¥3,980）
- [○] プロレーション: 差額がクレジットまたは次回請求時に調整される

#### ✅ Edge Functions Logs

```bash
npx supabase functions logs stripe-webhook-test --limit 20
```

**期待値**:

- [?] `POST | 200 | stripe-webhook-test`
- [?] `customer.subscription.updated` イベントが処理されている
- [?] エラーなし?→401 出てる

### 実施結果

**実施日時**:

**変更前の状態**:

```sql
[[
  {
    "plan_type": "feedback",
    "duration": 3,
    "stripe_subscription_id": "sub_1SXGeNKUVUnt8GtyFkhIAVEB",
    "updated_at": "2025-11-26 00:49:19.796673+00"
  }
]]
```

**変更後の状態**:

```sql
[[
  {
    "plan_type": "feedback",
    "duration": 1,
    "stripe_subscription_id": "sub_1SXGeNKUVUnt8GtyFkhIAVEB",
    "updated_at": "2025-11-26 01:02:13.796513+00"
  }
]]
```

**Stripe Dashboard**:

```
[Subscription ID（変更前後で同じか確認）]
[プロレーション金額]
[新しい期間: 1ヶ月]
```

**Edge Functions Logs**:

以下が 2 つずつ出てる

```
"POST | 200 | https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/check-subscription"
"OPTIONS | 200 | https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/check-subscription"
"POST | 200 | https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook-test"
"POST | 401 | https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook"
```

**判定**: ✅ 成功？？

**備考**:

```
401がなんなのか気になる
```

---

## Test 4: キャンセル

### 前提条件

- [○] 任意のプランに登録済み

### テスト手順

1. `/subscription` ページにアクセス
2. 「サブスクリプションを管理」ボタンをクリック
3. Customer Portal で「キャンセル」を選択
4. キャンセル理由を選択
5. 「キャンセル確定」ボタンをクリック

### 期待される結果

#### ✅ フロントエンド

- [○] 「キャンセル予定」バッジが表示される
  - [○] カスタマーポータルでは表示される `12/26にキャンセル`
  - [○] /account でも表示された キャンセル済み / サブスクリプションがキャンセルされています。プランを再開する
- [○] キャンセル日（次回更新日）が表示される
- **[×] コンテンツにはキャンセル日まで引き続きアクセス可能** ⬅️ **再テスト対象**
  - **前回の結果** (2025-11-26 初回テスト):
    - [×] 有料コンテンツは見れない状態でした
    - → このブランチでレッスンのメンバー限定表示がきちんと実装されているか把握してないが、有料コンテンツは見れない状態でした。
    - 他のプランに登録し直してみると、メンバー限定のロックが外れているのでこの部分は実装されてないことが判明しました。
  - **今回の修正内容**:
    - check-subscription Edge Function の `calculateAccessPermissions` 関数を修正
    - キャンセル済み (`cancel_at_period_end: true`) でも `current_period_end` までアクセス可能に変更
  - **再テスト結果** (2025-11-26 修正後):
    - [×] プレミアムコンテンツ（動画など）にアクセス可能か
    - [×] キャンセル後もロック画面が表示されないか
    - [ ] `/lessons` ページで「メンバー限定」タグが正しく表示されているか

#### ✅ データベース

**期待値**:

- status: 'active'（キャンセル日まではアクティブ）
- cancel_at_period_end: true
- current_period_end: （キャンセル日）

### 実施結果 (初回テスト - 2025-11-26)

**実施日時**: 2025-11-26

**テストユーザー**: `e118477b-9d42-4d5c-80b9-ad66f73b6b02`

**キャンセル後の状態**:

```sql
SELECT status, cancel_at_period_end, current_period_end
FROM user_subscriptions
WHERE user_id = 'e118477b-9d42-4d5c-80b9-ad66f73b6b02';
```

**フロントエンド表示**:

```
[表示されたバッジ・メッセージ]
 - [○] カスタマーポータルでは表示される `12/26にキャンセル`
  - [○] /account でも表示された キャンセル済み / サブスクリプションがキャンセルされています。プランを再開する
[キャンセル日]
11月26日にキャンセル。



```

**判定**: ⚠️ 部分成功

**備考**:

```
/subscriptionのページにいくと `現在のプラン: フィードバック（1ヶ月）`の表示がされている
間違ってはない。12月26日まではそう。ただキャンセル済みなので、少し戸惑う表示です。
なので `フィードバック（1ヶ月）`だけじゃなく｀キャンセル済み｀の表記がここでもほしいです。

```

---

### 🔄 再テスト結果 (修正後 - 2025-11-26)

**実施日時**: 2025-11-26 (check-subscription Edge Function 修正後)

**テストユーザー候補**:

- `e118477b-9d42-4d5c-80b9-ad66f73b6b02` (Feedback プラン)
- その他、アクティブなサブスクリプションを持つユーザー

**テスト手順**:

1. 上記ユーザーでログイン
2. Customer Portal でサブスクリプションをキャンセル
3. **キャンセル直後に**プレミアムコンテンツにアクセス
4. 結果を記録

**確認項目**:

- [ ] データベース状態: `cancel_at_period_end: true`, `is_active: true/false`
- [ ] プレミアムコンテンツ（動画など）にアクセス可能か
- [ ] `/lessons` ページで「メンバー限定」タグの表示
- [ ] ロック画面が表示されないか

**キャンセル後の状態**:

```sql
-- テスト実施後に記録
SELECT
  user_id,
  plan_type,
  is_active,
  cancel_at_period_end,
  current_period_end,
  updated_at
FROM user_subscriptions
WHERE user_id = '[テスト実施したユーザーID]';
👇
| user_id                              | plan_type | is_active | cancel_at_period_end | current_period_end     | updated_at                    |
| ------------------------------------ | --------- | --------- | -------------------- | ---------------------- | ----------------------------- |
| e118477b-9d42-4d5c-80b9-ad66f73b6b02 | feedback  | true      | true                 | 2025-12-26 01:02:09+00 | 2025-11-26 02:03:06.363854+00 |
```

**結果**:

```
[ここにテスト結果を記録]

❌ プレミアムコンテンツにアクセス可能
❌ ロック画面が表示されない
❌ 期待通りの動作

備考:
▼ キャンセル後の状態
キャンセル後に
http://localhost:8080/articles/three-structures-13
にアクセすると記事も動画も `プレミアムコンテンツ
この動画を視聴するには
スタンダードプラン以上が必要です


プランを見る
スタンダードプランで全ての動画とコンテンツにアクセス`
の表示が出ています。失敗してます。

▼ キャンセル状態を「グロースプラン」に戻して
http://localhost:8080/articles/three-structures-13

にアクセスしてもプレミアムコンテンツは閲覧できませんでした。どうなってる？？

この実装がちゃんとできてない、もしくはあなたが行った変更で狂った可能性も出てきています。

▼ その後プランを「スタンダード」に変更
http://localhost:8080/articles/three-structures-13
はきちんと表示されました。

可能性としてグロースプランの時にそもそも閲覧権限の制御ができてない可能性があります

▼ その後プランをキャンセル。→キャンセル済みの「スタンダード」に変更
http://localhost:8080/articles/three-structures-13
はきちんと表示されました。

```

**判定**: [ ] 成功 / [ ] 失敗 / [ ] 部分成功

---

## Test 5: 二重課金防止

### 前提条件

- [○] 既にサブスクリプション登録済み

### テスト手順

1. `/subscription` ページにアクセス
2. 別のプランの「今すぐ始める」ボタンをクリック
3. Stripe Checkout に遷移
4. 決済完了

### 期待される結果

#### ✅ データベース

- [○] user_subscriptions テーブルに**レコードが 1 件のみ**存在
- [○] 古いサブスクリプションが自動的にキャンセルされている

#### ✅ Stripe Dashboard

- [○] 古いサブスクリプションがキャンセルされている
- [○] 新しいサブスクリプションのみがアクティブ

### 実施結果

**実施日時**:
11/26 10:20

**データベース結果**:

```sql
SELECT COUNT(*) as subscription_count
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]' AND status = 'active';

-- 期待値: 1
```

結果 → 1 と出ました！

**Stripe Dashboard**:

```
[古いサブスクリプションのステータス]
kyasya00@gmail.com
新規顧客
名前が入力されていません
支払いを作成
請求書を作成
サブスクリプション
​
商品
​
頻度
次の請求書
スタンダードプラン
有効
毎月ごとに請求
[新しいサブスクリプションのステータス]
kyasya00@gmail.com
新規顧客
名前が入力されていません
支払いを作成
請求書を作成
サブスクリプション
​
商品
​
頻度
次の請求書
グロースプラン
有効
毎月ごとに請求

```

**判定**: ✅ 成功

**備考**:

```
[問題点・気づいた点があれば記入]
```

---

## テストサマリー

| Test                                  | 実施日 | 結果 | 備考 |
| ------------------------------------- | ------ | ---- | ---- |
| Test 1: 新規登録                      |        |      |      |
| Test 2A: プラン変更（ダウングレード） |        |      |      |
| Test 2B: プラン変更（アップグレード） |        |      |      |
| Test 3A: 期間変更（延長）             |        |      |      |
| Test 3B: 期間変更（短縮）             |        |      |      |
| Test 4: キャンセル                    |        |      |      |
| Test 5: 二重課金防止                  |        |      |      |

**総合判定**:

**次のアクション**:

```
[実施後の対応を記入]
```

---

## テストの優先順位

テスト実施時間が限られている場合は、以下の順番でテストすることを推奨:

### 最優先（必須）

1. **Test 1**: 新規登録
2. **Test 2A**: ダウングレード（Standard → Feedback）
3. **Test 2B**: アップグレード（Feedback → Standard）
4. **Test 4**: キャンセル
5. **Test 5**: 二重課金防止

### 推奨（時間があれば）

6. **Test 3A**: 期間延長（1M → 3M）
7. **Test 3B**: 期間短縮（3M → 1M）

### 理由

- Test 2A/2B: プラン変更の両方向（アップグレード・ダウングレード）でプロレーション計算が異なるため必須
- Test 3A/3B: 期間変更も価格変更を伴うが、Test 2A/2B で同様のロジックを検証済み

---

## 🐛 エラーケースと修正履歴

### Error Case 1: 環境変数 `useTestPrice` 未定義エラー (2025-11-27)

**発生日時**: 2025-11-27
**症状**: `/subscription` ページからプラン登録時に 500 エラーが発生し、Stripe Checkout が開かない

**エラーログ**:
```
POST https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/create-checkout 500 (Internal Server Error)
❌ Checkoutセッション作成エラー: FunctionsHttpError: Edge Function returned a non-2xx status code
❌ Response data: null
Error: 決済処理の準備に失敗しました。
```

**根本原因**:
環境分離実装時（commit: 50217e0）に、3つの Edge Functions で `useTestPrice` 変数の削除が不完全だった:

1. **create-checkout/index.ts:155**
   ```typescript
   // ❌ 修正前（未定義変数を参照）
   const envPrefix = useTestPrice ? "STRIPE_TEST_" : "STRIPE_";
   ```

2. **create-customer-portal/index.ts:44-49**
   ```typescript
   // ❌ 修正前
   const useTestPrice = body.useTestPrice || false;
   const environment = useTestPrice ? 'test' : 'live';
   ```

3. **update-subscription/index.ts:23-25**
   ```typescript
   // ❌ 修正前
   const { planType, duration = 1, useTestPrice = false } = await req.json();
   const environment = useTestPrice ? "test" : "live";
   ```

**修正内容**:

1. **create-checkout/index.ts**
   ```typescript
   // ✅ 修正後
   const envPrefix = ENVIRONMENT === 'test' ? "STRIPE_TEST_" : "STRIPE_";
   ```

2. **create-customer-portal/index.ts**
   ```typescript
   // ✅ 修正後（環境変数定義を追加）
   const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';

   // リクエストボディから useTestPrice を削除
   const body = await req.json();
   const returnUrl = body.returnUrl;
   const planType = body.planType as PlanType | undefined;
   const duration = body.duration as PlanDuration | undefined;

   // 環境はサーバー側で判定
   const environment: StripeEnvironment = ENVIRONMENT;
   ```

3. **update-subscription/index.ts**
   ```typescript
   // ✅ 修正後（環境変数定義を追加）
   const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';

   // リクエストボディから useTestPrice を削除
   const { planType, duration = 1 } = await req.json();
   const environment = ENVIRONMENT;
   ```

**影響範囲**:
- create-checkout: 新規登録時の全プラン選択
- create-customer-portal: Customer Portal URL 生成
- update-subscription: プラン変更機能

**デプロイ**:
```bash
npx supabase@latest functions deploy create-checkout
npx supabase@latest functions deploy create-customer-portal
npx supabase@latest functions deploy update-subscription
```

**再発防止策**:

1. **Edge Functions のテストカバレッジ向上**
   - 各 Edge Function に対するユニットテスト作成
   - CI/CD パイプラインでの自動テスト実施

2. **環境変数の一元管理**
   - すべての Edge Functions で同じ環境判定ロジックを使用
   - `_shared/` ディレクトリにユーティリティ関数を配置

3. **デプロイ前チェックリスト**
   - [ ] すべての Edge Functions で `useTestPrice` が削除されているか grep で確認
   - [ ] `ENVIRONMENT` 定数が正しく定義されているか確認
   - [ ] ローカルテスト（localhost）で動作確認
   - [ ] デプロイ後の動作確認

---

### Error Case 2: Deep Link使用時の二重課金問題 (2025-11-27)

**発生日時**: 2025-11-27
**テストケース**: Test 3A - 期間変更（スタンダード 1ヶ月 → 3ヶ月）
**症状**: Deep Linkを使ったプラン変更後、Stripeに2つのアクティブなサブスクリプションが存在

#### 🐛 問題の詳細

**Stripe Dashboard の状態**:
```
✅ スタンダード 3ヶ月 - 有効 (2026/02/27に ￥11,940)
⚠️ スタンダード 1ヶ月 - 有効 (12/27でキャンセル予定) ← 問題！
❌ スタンダード 3ヶ月 - キャンセル済み
❌ スタンダード 1ヶ月 - キャンセル済み
❌ グロース 1ヶ月 - キャンセル済み
```

**データベース (user_subscriptions)の状態**:
```sql
plan_type: standard
duration: 3
is_active: true
stripe_subscription_id: sub_1SXyS8KUVUnt8GtyfLQp9Gus
-- ✅ データベースには1つのアクティブサブスクのみ（正しい）
```

**プロレーション表示の異常**:
```
スタンダードプラン の比例配分のクレジット: -￥4,958
グロースプラン の比例配分のクレジット: -￥9,957  ⚠️ なぜ？
スタンダードプラン の比例配分の請求: ￥4,959
スタンダードプラン の比例配分のクレジット: -￥4,959  ⚠️ 重複
グロースプラン の比例配分の請求: ￥9,958  ⚠️ なぜ？
```

#### 💡 根本原因

**テスト履歴の影響**:
1. Test 2A: スタンダード → フィードバック
2. Test 2B: フィードバック → スタンダード
3. **Test 3A: スタンダード1ヶ月 → 3ヶ月（Deep Link使用）**

**Stripe Customer Portalの仕様問題**:

`create-customer-portal` のDeep Link実装（`subscription_update_confirm` flow_data）は、既存サブスクリプションの更新を保証しません。

```typescript
// create-customer-portal/index.ts (158-207行)
sessionConfig.flow_data = {
  type: 'subscription_update_confirm',
  subscription_update_confirm: {
    subscription: stripeSubscriptionId,  // 既存サブスクを指定しているが...
    items: [{
      id: subscriptionItemId,
      price: newPriceId,
      quantity: 1
    }]
  }
};
```

**問題**: Stripe Customer Portalは、ユーザーが確認画面で操作すると：
1. ✅ 既存サブスクリプションを更新する（期待される動作）
2. ❌ **新しいサブスクリプションを作成する**（今回発生したケース）

**なぜ古いサブスクが残ったのか**:
- 新しいサブスク（3ヶ月）が作成された
- 古いサブスク（1ヶ月）がキャンセルされずに残った
- → 二重課金のリスク

#### 🔧 応急処置（実施済み）

Stripeダッシュボードで古いサブスクリプション（スタンダード1ヶ月）を手動キャンセル:
```
Dashboard → Customers → (ユーザーのメール)
→ "スタンダード 1ヶ月 - 有効"
→ "Cancel subscription"
→ "Cancel immediately"
```

#### 💡 解決策の比較

| | Option 1 (update-subscription) | Option 2 (Deep Link修正) | **Option 3 (Checkout)** ✅ |
|---|---|---|---|
| **確認画面** | ❌ なし | ✅ Portal確認画面 | ✅ Checkout確認画面 |
| **プロレーション表示** | ❌ なし | ✅ あり | ✅ あり |
| **二重課金防止** | ✅ 確実 | ⚠️ 不確実 | ✅ 確実（実装済み） |
| **UX** | ⚠️ 即座に変更 | ✅ 良い | ✅ 良い |
| **実装状況** | ✅ 実装済み | ⚠️ 修正必要 | ✅ 二重課金防止済み |
| **一貫性** | ⚠️ 新規登録と異なる | ⚠️ 新規登録と異なる | ✅ 新規登録と同じフロー |

#### 🎯 推奨する修正方針: **Option 3 (Stripe Checkout)**

**理由**:
1. ✅ プロレーション金額の確認画面が表示される
2. ✅ 二重課金防止ロジックが既に実装されている（`create-checkout:194-289行`）
3. ✅ 新規登録と同じフローで一貫性がある
4. ✅ Stripe Checkoutの優れたUX

**実装方針**:
- `/subscription` ページでプラン変更時、`create-checkout` を呼び出す
- `create-checkout` は既存サブスクを自動キャンセル → 新規サブスク作成
- Stripe Checkoutページでプロレーション金額を確認 → 支払い確定

**動作フロー**:
```
1. /subscription ページでプラン選択（例: スタンダード3ヶ月）
2. create-checkout 呼び出し
   - 既存サブスク（スタンダード1ヶ月）を検出
   - Stripeで既存サブスクをキャンセル
   - 新規Checkoutセッション作成（スタンダード3ヶ月）
3. Stripe Checkout画面に遷移
   - プロレーション金額が明確に表示
   - 「今すぐ支払う」ボタンで確認
4. 支払い完了 → Success URLにリダイレクト
5. データベースが更新される（Webhook経由）
```

#### 📋 再発防止策

**短期的対応**:
1. **Option 3を実装**: プラン変更機能をStripe Checkoutベースに変更
2. **Deep Linkを無効化**: Customer Portalは「キャンセル専用」として使用
3. **二重課金チェックの強化**: Webhook処理で複数アクティブサブスクを検出したらアラート

**長期的対応**:
1. **統合テストの追加**: プラン変更フローの自動テスト
2. **監視アラート**: 同一ユーザーに複数のアクティブサブスクが存在した場合に通知
3. **ドキュメント整備**: プラン変更の正しいフローをドキュメント化

#### 🧪 修正後の再テスト計画

Option 3実装後、以下のシナリオを再テスト:

1. **Test 3A-R (Retry)**: スタンダード1ヶ月 → 3ヶ月
2. **Test 3B-R**: スタンダード3ヶ月 → 1ヶ月
3. **Test 2C**: フィードバック → グロース（異なるプランタイプへの変更）
4. **二重課金防止の確認**: Stripeダッシュボードで1つのサブスクのみがアクティブであることを確認

---
**確認コマンド**:
```bash
# useTestPrice が残っていないか確認
grep -r "useTestPrice" supabase/functions/

# ENVIRONMENT 定数の定義を確認
grep -r "const ENVIRONMENT" supabase/functions/
```

**テスト結果**:
- [✅] localhost で新規登録テスト実施
- [✅] Stripe Checkout が正常に開く
- [✅] 決済完了まで正常動作
- [✅] Console エラーなし
- [✅] Edge Function が正常動作

**実施日時**: 2025-11-27
**テストプラン**: スタンダード 1ヶ月
**テスト結果**: ✅ **完全成功**

**Console ログ**:
```
Edge Functionから取得したアクセス権限を使用: {
  hasMemberAccess: true,
  hasLearningAccess: true,
  planType: 'standard'
}
```

**確認事項**:
- ✅ `/subscription` ページからプラン選択
- ✅ Stripe Checkout が正常に開く
- ✅ テストカード（4242 4242 4242 4242）で決済完了
- ✅ `/subscription/success` ページにリダイレクト成功
- ✅ 正しいアクセス権限が付与されている
- ✅ 500エラーなし
- ✅ `useTestPrice` 未定義エラーなし

**判定**: ✅ **修正完了 - 問題解決**

**備考**:
- 修正前に発生していた500エラーは完全に解消
- Edge Function が正常に動作し、正しいアクセス権限を返している
- ログイン時の `check-subscription` エラーは別途調査が必要（タスクリストに追加済み）

**関連コミット**:
- 環境分離実装: `50217e0`
- 本修正: `1e2c36c`

---

**最終更新**: 2025-11-27
