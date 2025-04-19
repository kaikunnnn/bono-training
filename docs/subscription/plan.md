# サービスで提供する有料プランの定義

## 目的

Stripe 上で提供する有料プラン（Product と Price）を 1 種類に統一し、Checkout セッションの作成時に正しい Price ID を参照できるようにする。

## 要件

Stripe 上では、すでに以下の Price が作成されている：

- 本番用：price_1QisOmKUVUnt8Gty3x1P7GyW
- テスト用：price_1Qit9MKUVUnt8GtyoXFzn2Ui

Checkout セッション作成時に、環境によって適切な Price ID を使い分ける

## 環境変数（すでに設定済み）

```env
NEXT_PUBLIC_STRIPE_PRICE_ID=price_1QisOmKUVUnt8Gty3x1P7GyW
NEXT_PUBLIC_STRIPE_TEST_PRICE_ID=price_1Qit9MKUVUnt8GtyoXFzn2Ui
STRIPE_SECRET_KEY=sk_test_51HDQT3KUVUnt8GtyBvbE1xjTcOZUDnXQBSoYyiSpaf5OIRDftnZZfeIsRGuSqHseAS6uhBFGNsfJ96kCyYgdgYSy00sDvQHQMO
```

## 実装タスク

- Checkout セッション作成 API で process.env.NEXT_PUBLIC_STRIPE_PRICE_ID を参照
- 環境（開発・本番）によって、Price ID を使い分けられるようにするロジックを追加
- Checkout セッションの line_items に適切な Price ID を設定する
- 今後複数プランができた場合に備え、Price ID の管理を共通ユーティリティに切り出してもよい

## プラン

#### 出しワケの仕組み

learning: ['standard','growth'],
member: ['standard','growth','community']

#### プランの種類と値段

- standard: 4000 円
- growth: 9800 円
- community 1480 円

## 補足

- STRIPE_SECRET_KEY はサーバー側でのみ利用（Webhook や Checkout API）
- NEXT*PUBLIC*〜はフロントで参照する場合用。セキュリティの観点で秘密情報を含まないよう注意する
