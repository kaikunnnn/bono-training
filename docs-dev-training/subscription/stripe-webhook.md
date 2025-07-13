
# Webhookエンドポイントの実装

**目的**

Stripeからのイベントを受け取り、DBにSubscription情報を反映させる。

**要件**

- 以下のイベントに対応する：
    - `checkout.session.completed`
    - `invoice.paid`
    - `customer.subscription.deleted`
- `subscriptions`テーブルの`is_active`や期限情報を更新する

**実装タスク**

- Stripe Webhookの署名検証を含むエンドポイントを実装
- 各イベントごとにDBの`subscriptions`テーブルを更新
- 該当ユーザーの`stripe_customer_id`や`stripe_subscription_id`を取得して紐付け
