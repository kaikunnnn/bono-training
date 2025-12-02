# サブスクリプション機能テストレポート

作成日: 2025-01-07
実装内容: プラン変更フローの改善（チェックアウト経由）

## 前提条件の確認

### 1. データベースマイグレーション

- [ ] `20250107_add_duration_to_subscriptions.sql` を実行済み
- [ ] `user_subscriptions` テーブルに `duration` カラムが存在する
- [ ] インデックスが正しく作成されている

**確認方法:**

```sql
-- Supabaseダッシュボードで実行
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_subscriptions' AND column_name = 'duration';
```

**結果:**

```
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = ‘user_subscriptions’ AND column_name = ‘duration’;⁠￼
```

**問題点:**

```
これでいいの？
```

---

### 2. Stripe Webhook 設定

- [ ] Webhook エンドポイントが登録されている
- [ ] エンドポイント URL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook`
- [ ] ステータスが「有効」になっている

**有効なイベント:**

- [ ] `checkout.session.completed`
- [ ] `invoice.paid`
- [ ] `customer.subscription.deleted`

**確認場所:**
https://dashboard.stripe.com/test/webhooks

**結果:**
`https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook`
はアクティブ。

以下の内容であっている？

````
リッスン対象
イベント 4 件
イベントを非表示にする
checkout.session.completed
customer.subscription.deleted
customer.subscription.updated
invoice.paid```

**問題点:**
````

[問題があれば記載]```

---

### 3. 環境変数の確認

はい、以下全部.env にあります

- [ ] `.env` に以下の Price ID が設定されている
  - [ ] `VITE_STRIPE_STANDARD_1M_PRICE_ID`
  - [ ] `VITE_STRIPE_STANDARD_3M_PRICE_ID`
  - [ ] `VITE_STRIPE_FEEDBACK_1M_PRICE_ID`
  - [ ] `VITE_STRIPE_FEEDBACK_3M_PRICE_ID`

はい、supabase にあります。

- [ ] Supabase Edge Functions の環境変数
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`

**確認方法:**
Supabase ダッシュボード → Edge Functions → Secrets

**結果:**

```
はい、以下全部.envにあります
てかコレってあなたがファイルを確認できないの？ .envファイルね
```

**問題点:**

```
[問題があれば記載]
```

---

### 4. Edge Functions デプロイ状態

- [ ] `create-checkout` がデプロイされている
- [ ] `stripe-webhook` がデプロイされている
- [ ] `update-subscription` がデプロイされている（未使用だが念のため）

**確認方法:**

```bash
npx supabase functions list
```

**結果:**

```


   ID                                   | NAME                   | SLUG                   | STATUS | VERSION | UPDATED_AT (UTC)
  --------------------------------------|------------------------|------------------------|--------|---------|---------------------
   e65c085b-4681-417d-b547-e31ba1177e4e | check-subscription     | check-subscription     | ACTIVE | 127     | 2025-08-06 02:07:38
   575d9a62-2021-42b4-b803-0c816c8742bf | create-checkout        | create-checkout        | ACTIVE | 133     | 2025-11-07 08:16:17
   0fbe36c2-e206-4f4e-b38b-abc4b6440c9a | stripe-webhook         | stripe-webhook         | ACTIVE | 128     | 2025-11-07 08:16:55
   e11533b2-27d8-49d3-b856-172e44f634f2 | get-content            | get-content            | ACTIVE | 105     | 2025-08-06 02:07:38
   7ad97a0d-69f2-4dbc-8156-0ad1718d402f | get-mdx-content        | get-mdx-content        | ACTIVE | 23      | 2025-05-25 04:20:42
   91ac02ad-7a2e-461e-acf1-88a452916d5f | get-training-meta      | get-training-meta      | ACTIVE | 22      | 2025-05-25 04:20:42
   03205b5f-e0aa-447a-b7c3-6a6e212515cf | get-task-content       | get-task-content       | ACTIVE | 15      | 2025-05-25 04:20:42
   5b3d5440-8df5-4b08-a5e5-8da56618a1e5 | get-training-detail    | get-training-detail    | ACTIVE | 74      | 2025-08-06 02:07:38
   65f579d4-ae2f-4b15-a076-ca7757ded469 | get-training-list      | get-training-list      | ACTIVE | 72      | 2025-08-06 02:07:38
   3399654f-9487-4956-8d8b-a785bf14b5b0 | debug-storage          | debug-storage          | ACTIVE | 13      | 2025-05-25 05:25:20
   666a787f-1fb5-4291-a46b-078f6add4eb3 | get-training-content   | get-training-content   | ACTIVE | 69      | 2025-08-06 02:07:38
   3c974878-17b2-4d92-9dfd-59fb809af1b4 | webflow-series         | webflow-series         | ACTIVE | 5       | 2025-11-04 08:42:10
   c426a997-4f55-46c8-a848-1c20f87547ea | create-customer-portal | create-customer-portal | ACTIVE | 5       | 2025-11-05 01:17:56
   af68bb95-476a-450a-8482-9771dc6e2854 | update-subscription    | update-subscription    | ACTIVE | 1       | 2025-11-07 07:45:30
```

**問題点:**

```
[問題があれば記載]
```

---

## 機能テスト

### テスト 1: UI 動作確認

#### 1-1. 期間タブの動作

- [ok] ページに期間選択タブ（1 ヶ月/3 ヶ月）が表示される
- [ok] タブを切り替えると全プランの価格が変わる
- [ok] 1 ヶ月選択時:
  - [ ] スタンダード: 4,000 円/月
  - [ ] フィードバック: 1,480 円/月
- [ok] 3 ヶ月選択時:
  - [ ] スタンダード: 3,800 円/月（一括 11,400 円）
  - [ ] フィードバック: 1,280 円/月（一括 3,840 円）
- [ok] 3 ヶ月選択時に一括料金が表示される

**テスト実行日時:**

```
1108
```

**結果:**

```
[正常]
```

**スクリーンショット:**

```
[必要に応じて添付]
```

**問題点:**

```
[問題があれば記載]
```

---

#### 1-2. プランカードの表示

- [ok] 2 つのプランカード（スタンダード、フィードバック）が表示される
- [ok] フィードバックプランに「おすすめ」バッジが表示される
- [ok] 現在契約中のプランに「現在のプラン」バッジが表示される
- [ok] 各プランの特典リストが正しく表示される

**結果:**

```
[正常]
```

**問題点:**

```
[問題があれば記載]
```

---

### テスト 2: 新規ユーザーのサブスクリプション登録

#### 2-1. スタンダードプラン（1 ヶ月）

- [ ] 「選択する」ボタンをクリック
- [ ] Stripe チェックアウトページに遷移する
- [ ] チェックアウトページに正しい金額（4,000 円/月）が表示される
- [ ] テストカード（4242 4242 4242 4242）で決済
- [ ] 決済完了後、`/subscription/success` にリダイレクトされる
- [ ] DB の `user_subscriptions` テーブルにレコードが作成される
  - [ ] `plan_type` = 'standard'
  - [ ] `duration` = 1
  - [ ] `is_active` = true
- [ ] DB の `subscriptions` テーブルにレコードが作成される

**テスト実行日時:**

```
[日時を記載]
```

**結果:**

```
[正常/異常 を記載]
```

**DB クエリ結果:**

```sql
SELECT user_id, plan_type, duration, is_active, stripe_subscription_id
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

```
[結果を記載]
```

**問題点:**

```
[問題があれば記載]
```

---

#### 2-2. フィードバックプラン（3 ヶ月）

- [ ] 期間タブを「3 ヶ月」に切り替え
- [ ] フィードバックプランの「選択する」ボタンをクリック
- [ ] Stripe チェックアウトページに遷移する
- [ ] チェックアウトページに正しい金額が表示される
  - [ ] 1,280 円/月
  - [ ] 合計 3,840 円（3 ヶ月分）
- [ ] テストカードで決済
- [ ] 決済完了後、成功ページにリダイレクトされる
- [ ] DB に正しく保存される
  - [ ] `plan_type` = 'feedback'
  - [ ] `duration` = 3

**テスト実行日時:**

```
[日時を記載]
```

**結果:**

```
[正常/異常 を記載]
```

**問題点:**

```
[問題があれば記載]
```

---

### テスト 3: 既存契約者のプラン変更

#### 事前準備

- 既存のアクティブなサブスクリプションを持つテストユーザーでログイン
- 現在のプラン: [プラン名と stripe_subscription_id を記載]

---

#### 3-1. プラン種類の変更（スタンダード → フィードバック）

- [ok] /subscription ページにアクセス
- [ok] 現在のプランに「現在のプラン」バッジが表示される
- [?] 別プラン（フィードバック）の「プラン変更」ボタンをクリック
- [?] Stripe チェックアウトページに遷移する
- [?] 新しいプランの価格が表示される
- [ ] テストカードで決済
- [ ] 決済完了
- [ ] DB の `user_subscriptions` が更新される
  - [ ] `plan_type` = 'feedback'
  - [ ] `stripe_subscription_id` = [新しいサブスクリプション ID]
- [ ] 古いサブスクリプションがキャンセルされる

**古いサブスクリプション ID:**

```
[記載]
```

**新しいサブスクリプション ID:**

```
[記載]
```

**Stripe ダッシュボードで確認:**

- [ ] 古いサブスクリプションのステータスが「Canceled」になっている
- [ ] 新しいサブスクリプションが「Active」になっている

**テスト実行日時:**

```
[日時を記載]
```

**結果:**

```
takumi.kai.skywalker@gmail.comのアカウントでテスト
→20251108 09:40 ごろテスト
- 同じプランの中で「１ヶ月」「３ヶ月」が選択できません→現在のプラン、とボタンに表示されて非活性になってしまう
- 別プランのボタンは変更でクリック可能。そのカスタマーポータルが開くが、「新規で課金するような画面」が表示される。＝クレジットを入力、名前入力など。理想だと、アップデートなので、今のプラントの差分が表示される画面が表示されないとユーザーは不安になると思う
  - このときにStripeチェックアウトの「戻る」を押すと/subsription/successの画面に戻ってしまい今は404になる。/successはしてないのでもとのページに戻る仕様が望ましい
  - 一応課金を進めたらストライプチェックアウト上では課金は成功したように見えるが、/accountのページではプランの内容が変わってない
  - そしてやっぱりに重課金になっている＝２つのプランが選択されています。

```

**問題点:**

```
[問題があれば記載]
```

---

#### 3-2. 期間の変更（1 ヶ月 → 3 ヶ月）

できません。上述の関係

- [ ] 現在の契約: [プラン名] 1 ヶ月
- [ ] 期間タブを「3 ヶ月」に切り替え
- [ ] 同じプランの「プラン変更」ボタンをクリック
- [ ] Stripe チェックアウトページで 3 ヶ月プランの価格を確認
- [ ] 決済完了
- [ ] DB の `duration` が 3 に更新される
- [ ] 古いサブスクリプションがキャンセルされる

**テスト実行日時:**

```
[日時を記載]
```

**結果:**

```
[正常/異常 を記載]
```

**問題点:**

```
[問題があれば記載]
```

---

### テスト 4: Webhook 動作確認

→MCP であなたができませんか

#### 4-1. checkout.session.completed

- [ ] 新規サブスクリプション作成時に Webhook が発火する
- [ ] ログに「checkout.session.completed イベントを処理中」が出力される
- [ ] `user_subscriptions` テーブルが正しく作成/更新される
- [ ] `subscriptions` テーブルにレコードが挿入される
- [ ] `stripe_customers` テーブルが作成/更新される

**Supabase Edge Function ログ:**

```
[ログを記載]
```

**問題点:**

```
[問題があれば記載]
```

---

#### 4-2. 既存サブスクリプションの自動キャンセル

- [ ] プラン変更時、メタデータに `replace_subscription_id` が含まれる
- [ ] Webhook で古いサブスクリプションをキャンセルする処理が実行される
- [ ] ログに「既存サブスクリプション [ID] をキャンセルします」が出力される
- [ ] Stripe で古いサブスクリプションが実際にキャンセルされる
- [ ] DB の古い `subscriptions` レコードの `end_timestamp` が更新される

**Webhook ログ:**

```
[ログを記載]
```

**問題点:**

```
[問題があれば記載]
```

---

## エラーログ

テスト中に発生したエラーをすべて記載してください。

### エラー 1

**発生日時:**

```
2025 1108 0944
```

**テストケース:**

```
- kyasya00@gmail.com
- フィードバックプランに加入中
- カスタマーポーターるを開こうと /accountで「プランの管理」ボタンをクリック
```

**エラー内容:**

```
カスタマーポータルが開けませんでした。
```

**再現手順:**

```
1.
2.
3.
```

**原因:**

```
- 可能性
  - Stripeでkyasya00@gmail.comのアカウントをみたがグロースプランに所属しているものがなかった可能性？→それでバグったかもしれない
- takumi.kai.skywalker@gmail.comでテストしたら開けた。アカウントのバグの可能性。このkyasya00@gmail.comは一旦データから削除したい
```

**対処方法:**

```
[修正方法]
```

**ステータス:**

- [ ] 未対応
- [ ] 対応中
- [ ] 解決済み

---

### エラー 2

2025 1108 0944

- 試したこと
  - プランが二重に入っていたtakumi.kai.skywalker@gmail.comのアカウントを stripe 上でプランの解約を行った。サブスクリプションのキャンセル。
  - だが/account 上ではサブスク情報：フィードバックの記載になっている。
  - supbase と stripe 連携がおかしい可能性がある

image.png
image.png

---

## 追加の問題・気づき

テスト中に気づいた問題点、改善提案などを記載してください。

### 問題 1

**内容:**

```
[問題の説明]
```

**優先度:**

- [ ] 高（機能が使えない）
- [ ] 中（不便だが使える）
- [ ] 低（改善提案）

**対処状況:**

```
[未対応/対応中/解決済み]
```

---

## テスト結果サマリー

### 全体評価

- [ ] すべてのテストケースが正常に動作
- [ ] 一部に問題があるが主要機能は動作
- [ ] 重大な問題があり修正が必要

### 次のステップ

```
[必要な修正作業をリストアップ]
1.
2.
3.
```

---

## 備考

その他、特記事項があれば記載してください。

```
[備考]
```
