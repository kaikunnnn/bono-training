# /subscription ページ 実装仕様書

## 📋 現状の問題点

### 1. CORSエラー
- `update-subscription` Edge Functionがデプロイされていない
- ローカルで作成したが、Supabaseクラウドにデプロイされていないためアクセス不可

### 2. プラン表示の不一致
**`.env` で定義されているプラン:**
- `STANDARD` (1ヶ月: 4,000円/月、3ヶ月: 3,800円/月)
- `FEEDBACK` (1ヶ月: 1,480円/月、3ヶ月: 1,280円/月)

**現在のページ表示:**
- `standard` ✓
- `growth` ❌（.envに存在しない）
- `community` ❌（.envには`FEEDBACK`として存在）

### 3. 期間選択機能の欠如
- 1ヶ月プランと3ヶ月プランの選択機能がない
- 固定で1ヶ月プランのみ

---

## 🎯 実装要件

### 1. プラン構成（.envベース）

| プランタイプ | 期間 | 価格 | Price ID | 機能 |
|------------|------|------|----------|------|
| STANDARD | 1ヶ月 | 4,000円/月 | `price_1OIiOUKUVUnt8GtyOfXEoEvW` | 全コンテンツアクセス |
| STANDARD | 3ヶ月 | 3,800円/月 | `price_1OIiPpKUVUnt8Gty0OH3Pyip` | 全コンテンツアクセス |
| FEEDBACK | 1ヶ月 | 1,480円/月 | `price_1OIiMRKUVUnt8GtyMGSJIH8H` | 全コンテンツ + フィードバック |
| FEEDBACK | 3ヶ月 | 1,280円/月 | `price_1OIiMRKUVUnt8GtyttXJ71Hz` | 全コンテンツ + フィードバック |

### 2. UIデザイン要件

#### プランカードレイアウト
```
┌─────────────────┬─────────────────┐
│   STANDARD      │    FEEDBACK     │
│                 │   (おすすめ)      │
├─────────────────┼─────────────────┤
│ 期間選択:        │ 期間選択:        │
│ ○ 1ヶ月 4,000円 │ ○ 1ヶ月 1,480円 │
│ ○ 3ヶ月 3,800円 │ ○ 3ヶ月 1,280円 │
│                 │                 │
│ 機能リスト       │ 機能リスト       │
│ ✓ 項目1         │ ✓ 項目1         │
│ ✓ 項目2         │ ✓ 項目2         │
│                 │ ✓ フィードバック  │
│                 │                 │
│ [選択する]       │ [選択する]       │
└─────────────────┴─────────────────┘
```

#### 状態別ボタン表示
- **未契約**: 「選択する」
- **契約中（同プラン同期間）**: 「現在のプラン」（無効化）
- **契約中（別プラン or 別期間）**: 「プラン変更」

### 3. 機能要件

#### 3.1 新規登録フロー
1. ユーザーがプランと期間を選択
2. 「選択する」ボタンをクリック
3. `createCheckoutSession(planType, duration)` を呼び出し
4. Stripeチェックアウトページにリダイレクト
5. 決済完了後、Webhookでデータベース更新

#### 3.2 プラン変更フロー
1. 既存契約者がページにアクセス
2. 現在のプランと期間が「現在のプラン」として表示
3. 別のプラン/期間を選択
4. 「プラン変更」ボタンをクリック
5. `updateSubscription(planType, duration)` を呼び出し
6. Stripeで即座にサブスクリプション更新（日割り計算）
7. 成功トースト表示
8. サブスクリプション情報を再取得

### 4. データベース要件

#### 4.1 `user_subscriptions` テーブル
```sql
- user_id: UUID
- stripe_subscription_id: TEXT
- stripe_customer_id: TEXT
- plan_type: TEXT ('standard', 'feedback')
- duration: INTEGER (1 or 3) -- 新規追加が必要
- is_active: BOOLEAN
- updated_at: TIMESTAMP
```

**マイグレーション必要**: `duration` カラムの追加

### 5. Edge Function要件

#### 5.1 `update-subscription`
- **デプロイ必須**
- CORSヘッダー設定済み
- 環境変数から正しいPrice IDを取得
- プランタイプと期間の両方をサポート

#### 5.2 `create-checkout`
- 期間（duration）パラメータを正しく処理
- 環境変数から正しいPrice IDを取得

---

## 🔧 実装ステップ

### Step 1: データベースマイグレーション
- [ ] `user_subscriptions` テーブルに `duration` カラムを追加
- [ ] 既存データのマイグレーション（デフォルト値: 1）

### Step 2: Edge Functionsのデプロイ
- [ ] `update-subscription` をSupabaseにデプロイ
- [ ] `create-customer-portal` を再デプロイ（念のため）
- [ ] デプロイ確認とテスト

### Step 3: Subscription.tsx の改修
- [ ] プラン定義を`.env`に合わせて修正
  - `growth` を削除
  - `community` を `feedback` に変更
- [ ] 期間選択機能を追加
- [ ] 選択されたプランと期間をハンドラーに渡す

### Step 4: PlanCard コンポーネントの改修
- [ ] 期間選択UIを追加（ラジオボタン）
- [ ] 選択された期間を親に通知
- [ ] プラン比較時に期間も考慮

### Step 5: stripe.ts の修正
- [ ] `updateSubscription` で期間も渡す
- [ ] エラーハンドリング改善

### Step 6: subscriptionPlans.ts の更新
- [ ] プラン定義を`.env`と一致させる
- [ ] 期間情報を含める

### Step 7: 動作テスト
- [ ] 未契約状態で新規登録（1ヶ月・3ヶ月）
- [ ] 契約中にプラン変更（standard → feedback）
- [ ] 契約中に期間変更（1ヶ月 → 3ヶ月）
- [ ] カスタマーポータルへのアクセス確認

---

## 📝 実装の優先順位

### 最優先（Phase 1）
1. データベースマイグレーション
2. Edge Functionsのデプロイ
3. プラン表示の修正

### 次優先（Phase 2）
4. 期間選択UI実装
5. 動作確認とテスト

---

## 🚨 注意事項

1. **テスト環境**: 必ずStripeのテストモードでテスト
2. **Price ID**: `.env` のPrice IDが正しいか確認
3. **Webhook**: Stripeのwebhookが正しく設定されているか確認
4. **CORS**: Edge Functionsがデプロイされていることを確認
5. **既存データ**: 既存のサブスクリプションデータの互換性を保つ
