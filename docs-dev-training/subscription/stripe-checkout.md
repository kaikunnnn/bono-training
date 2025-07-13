
# Stripe Checkout セッション作成API

## 目的

ユーザーがStripe Checkoutを通じてメンバーシップを購入できるようにする。

## 要件

- Stripeの`checkout.sessions.create()`を呼び出すAPIを作成する
- `stripe_customer_id`をSupabaseのDBから取得する
- 存在しない場合はStripeでCustomerを作成し、DBに保存する
- セッション作成時に`price_id`, `success_url`, `cancel_url`を指定する

## 実装タスク

- `user_id`から`stripe_customer_id`を検索
- StripeでCustomerを作成（必要に応じて）
- Checkoutセッションを作成してフロントにURLを返すAPIを用意
- APIの認証・エラー処理を実装
