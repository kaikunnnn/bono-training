
# サービスで提供する有料プランの定義

## 目的
Stripe上で提供する有料プラン（ProductとPrice）を1種類に統一し、Checkoutセッションの作成時に正しいPrice IDを参照できるようにする。

## 要件

Stripe上では、すでに以下のPriceが作成されている：

- 本番用：price_1QisOmKUVUnt8Gty3x1P7GyW
- テスト用：price_1Qit9MKUVUnt8GtyoXFzn2Ui

Checkoutセッション作成時に、環境によって適切なPrice IDを使い分ける

## 環境変数（すでに設定済み）

```env
NEXT_PUBLIC_STRIPE_PRICE_ID=price_1QisOmKUVUnt8Gty3x1P7GyW
NEXT_PUBLIC_STRIPE_TEST_PRICE_ID=price_1Qit9MKUVUnt8GtyoXFzn2Ui
STRIPE_SECRET_KEY=sk_test_51HDQT3KUVUnt8GtyBvbE1xjTcOZUDnXQBSoYyiSpaf5OIRDftnZZfeIsRGuSqHseAS6uhBFGNsfJ96kCyYgdgYSy00sDvQHQMO
```

## 実装タスク

- Checkoutセッション作成APIでprocess.env.NEXT_PUBLIC_STRIPE_PRICE_IDを参照
- 環境（開発・本番）によって、Price IDを使い分けられるようにするロジックを追加
- Checkoutセッションのline_itemsに適切なPrice IDを設定する
- 今後複数プランができた場合に備え、Price IDの管理を共通ユーティリティに切り出してもよい

## 補足

- STRIPE_SECRET_KEYはサーバー側でのみ利用（WebhookやCheckout API）
- NEXT_PUBLIC_〜はフロントで参照する場合用。セキュリティの観点で秘密情報を含まないよう注意する
