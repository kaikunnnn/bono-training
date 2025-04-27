
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

## コンテンツアクセスの仕組み

### プラン区分

サブスクリプションは以下の2つの大きな区分で管理されます：

1. **学習コンテンツ（Learning）**
   - アクセス可能なプラン: `standard`, `growth`
   - 基本的な学習コンテンツにアクセスできます

2. **メンバー限定コンテンツ（Member）**
   - アクセス可能なプラン: `standard`, `growth`, `community`
   - より高度または専門的なコンテンツにアクセスできます

### プランの階層

- `free`: すべての無料コンテンツにアクセス可能
- `standard`: 学習コンテンツと一部のメンバー限定コンテンツ
- `growth`: すべての学習コンテンツとほぼすべてのメンバー限定コンテンツ
- `community`: すべてのコンテンツにアクセス可能

### アクセス制御の基本ルール

1. 無料ユーザーは無料コンテンツのみ閲覧可能
2. サブスクリプション保持者は、そのプランに応じたコンテンツにアクセス可能
3. 上位プランは下位プランのコンテンツもすべて閲覧可能

## プラン詳細

### 価格設定

- standard: 4000 円
- growth: 9800 円
- community: 1480 円

## 補足

- STRIPE_SECRET_KEY はサーバー側でのみ利用（Webhook や Checkout API）
- NEXT_PUBLIC_〜はフロントで参照する場合用。セキュリティの観点で秘密情報を含まないよう注意する

