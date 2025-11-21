# Stripe + Supabase サブスクリプションシステム 完全仕様書

**最終更新**: 2025-11-20
**バージョン**: 1.0
**ステータス**: 実装完了・テスト中

---

## 📋 目次

1. [システム概要](#システム概要)
2. [技術スタック](#技術スタック)
3. [データベーススキーマ](#データベーススキーマ)
4. [Edge Functions一覧](#edge-functions一覧)
5. [ユーザーフロー](#ユーザーフロー)
6. [Webhook処理](#webhook処理)
7. [実装済み機能](#実装済み機能)
8. [環境変数](#環境変数)
9. [重要な設計判断](#重要な設計判断)
10. [トラブルシューティング](#トラブルシューティング)

---

## システム概要

### プロダクト名
Bono Training - オンライン学習プラットフォーム

### サブスクリプションプラン

| プラン | 1ヶ月 | 3ヶ月 |
|--------|-------|-------|
| Community | 無料 | - |
| Feedback | 1,480円/月 | 1,280円/月 |
| Standard | 3,480円/月 | 2,980円/月 |
| Growth | 9,800円/月 | 8,480円/月 |

### システムの役割

**決済処理**: Stripe
**ユーザー認証**: Supabase Auth
**データベース**: Supabase PostgreSQL
**リアルタイム更新**: Supabase Realtime
**サーバーレス処理**: Supabase Edge Functions

---

## 技術スタック

### フロントエンド
- **React** (TypeScript)
- **Vite** (ビルドツール)
- **React Router** (ルーティング)
- **Tailwind CSS** (スタイリング)

### バックエンド
- **Supabase Auth** (認証)
- **Supabase PostgreSQL** (データベース)
- **Supabase Edge Functions** (Deno)
- **Supabase Realtime** (WebSocket)

### 決済
- **Stripe Checkout** (新規登録)
- **Stripe Customer Portal** (プラン変更・解約)
- **Stripe Webhooks** (イベント同期)

### その他
- **TypeScript** (型安全性)
- **Git** (バージョン管理)

---

## データベーススキーマ

### テーブル一覧

#### 1. `stripe_customers`
Supabase AuthユーザーとStripe顧客IDの紐付け

```sql
CREATE TABLE stripe_customers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**用途**:
- ユーザーごとにStripe Customer IDを保存
- Checkout作成時にCustomer IDを取得
- Customer Portal作成時に使用

---

#### 2. `user_subscriptions`
ユーザーのサブスクリプション情報

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('community', 'feedback', 'standard', 'growth')),
  duration INTEGER NOT NULL CHECK (duration IN (1, 3)),
  is_active BOOLEAN DEFAULT TRUE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancel_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_is_active ON user_subscriptions(is_active);
```

**重要カラム**:
- `is_active`: サブスクリプションがアクティブか（`true` = 有効、`false` = キャンセル済み）
- `cancel_at_period_end`: 期間終了時にキャンセル予定か（`true` = 解約予定）
- `current_period_end`: 利用期限（この日まで利用可能）

**用途**:
- ユーザーのプラン情報を管理
- コンテンツアクセス制御
- UI表示（プラン名、期限など）

---

## Edge Functions一覧

### 1. `create-checkout`
**役割**: Stripe Checkoutセッションを作成

**呼び出し元**:
- `/subscription` ページ（新規登録・プラン変更）

**処理フロー**:
1. ユーザー認証確認
2. Stripe Customer ID取得または作成
3. **既存アクティブサブスクリプションを全てキャンセル**（二重課金防止）
4. Stripe Checkoutセッション作成
5. セッションURLを返す

**重要な実装**:
- 複数サブスクリプション対応（`.single()` → `.eq('is_active', true)`）
- ループで全ての既存サブスクをキャンセル
- キャンセル失敗時はCheckout作成を中止（原子性保証）

**入力**:
```typescript
{
  returnUrl: string,
  planType: 'community' | 'feedback' | 'standard' | 'growth',
  duration: 1 | 3,
  useTestPrice: boolean
}
```

**出力**:
```typescript
{
  url: string // Stripe CheckoutのURL
}
```

**ファイル**: `supabase/functions/create-checkout/index.ts`

---

### 2. `create-customer-portal`
**役割**: Stripe Customer Portalセッションを作成

**呼び出し元**:
- `/subscription` ページ（既存ユーザーのプラン変更）
- `/account` ページ（サブスクリプション管理・解約）

**処理フロー**:
1. ユーザー認証確認
2. Stripe Customer ID取得
3. アクティブなサブスクリプションID取得（ディープリンク用）
4. Stripe Customer Portalセッション作成
5. セッションURLを返す

**ディープリンク機能**:
- `useDeepLink: true` の場合、プラン変更画面に直接遷移
- `flow_data.type: 'subscription_update'` を設定
- 既存サブスクリプションIDを指定

**入力**:
```typescript
{
  returnUrl: string,
  useDeepLink: boolean // プラン変更画面に直接遷移するか
}
```

**出力**:
```typescript
{
  url: string // Stripe Customer PortalのURL
}
```

**ファイル**: `supabase/functions/create-customer-portal/index.ts`

---

### 3. `stripe-webhook`
**役割**: Stripeからのイベントを受信してDBを更新

**処理するイベント**:
1. `checkout.session.completed` - 新規サブスクリプション作成
2. `customer.subscription.created` - サブスクリプション作成
3. `customer.subscription.updated` - サブスクリプション更新（プラン変更・解約予約）
4. `customer.subscription.deleted` - サブスクリプション削除

**重要な実装**:
- **重複チェック**: 新規作成時に既存アクティブサブスクを自動的に非アクティブ化
- **upsert処理**: 同じサブスクリプションIDの重複を防止
- **プラン判定**: Stripe Price IDからプランタイプと期間を判定
- **エラーハンドリング**: 失敗時もWebhook応答は200を返す

**ファイル**: `supabase/functions/stripe-webhook/index.ts`

---

### 4. `check-subscription`
**役割**: ユーザーのサブスクリプション状態を確認

**呼び出し元**:
- フロントエンドから定期的に呼び出し

**処理フロー**:
1. ユーザー認証確認
2. DBから最新のサブスクリプション情報を取得
3. プラン情報を返す

**出力**:
```typescript
{
  isSubscribed: boolean,
  planType: 'community' | 'feedback' | 'standard' | 'growth' | null,
  duration: 1 | 3 | null,
  currentPeriodEnd: string | null,
  cancelAtPeriodEnd: boolean
}
```

**ファイル**: `supabase/functions/check-subscription/index.ts`

---

## ユーザーフロー

### フロー1: 新規ユーザー登録

```
1. ユーザーが /subscription ページにアクセス
   ↓
2. プランと期間を選択
   ↓
3. 「今すぐ始める」ボタンをクリック
   ↓
4. create-checkout Edge Function呼び出し
   ↓
5. Stripe Checkoutページに遷移
   ↓
6. カード情報入力・決済
   ↓
7. /subscription/success にリダイレクト
   ↓
8. Webhook: checkout.session.completed 受信
   ↓
9. DB: user_subscriptions レコード作成
   ↓
10. ユーザーはコンテンツにアクセス可能
```

**実装ファイル**:
- フロントエンド: `src/pages/Subscription.tsx`
- API: `src/services/stripe.ts` (`createCheckoutSession`)
- Edge Function: `supabase/functions/create-checkout/index.ts`
- Webhook: `supabase/functions/stripe-webhook/index.ts`

---

### フロー2: 既存ユーザーのプラン変更

```
1. ユーザーが /subscription ページにアクセス
   ↓
2. 新しいプランと期間を選択
   ↓
3. 「プラン変更」ボタンをクリック
   ↓
4. create-customer-portal Edge Function呼び出し（useDeepLink: true）
   ↓
5. Stripe Customer Portal（プラン変更画面）に遷移
   ↓
6. 新しいプランを選択して確定
   ↓
7. Stripe側で自動処理:
   - 古いサブスクリプションをキャンセル
   - 新しいサブスクリプションを作成
   - 日割り計算
   ↓
8. Webhook: customer.subscription.updated / deleted / created 受信
   ↓
9. DB: 古いサブスクを is_active=false に更新
   ↓
10. DB: 新しいサブスクを user_subscriptions に追加
   ↓
11. Realtime: フロントエンドに変更を通知
   ↓
12. UI: ページリロードなしで自動更新
```

**実装ファイル**:
- フロントエンド: `src/pages/Subscription.tsx`
- API: `src/services/stripe.ts` (`getCustomerPortalUrl`)
- Edge Function: `supabase/functions/create-customer-portal/index.ts`
- Realtime: `src/hooks/useSubscription.ts`

---

### フロー3: 解約

```
1. ユーザーが /account ページにアクセス
   ↓
2. 「サブスクリプションを管理」ボタンをクリック
   ↓
3. create-customer-portal Edge Function呼び出し（useDeepLink: false）
   ↓
4. Stripe Customer Portalに遷移
   ↓
5. 「キャンセル」ボタンをクリック
   ↓
6. 「期間終了時にキャンセル」を選択
   ↓
7. Webhook: customer.subscription.updated 受信
   - cancel_at_period_end: true
   - cancel_at: 期間終了日
   ↓
8. DB: user_subscriptions を更新
   - cancel_at_period_end = true
   - cancel_at = キャンセル予定日
   ↓
9. Realtime: フロントエンドに変更を通知（即座）
   ↓
10. UI: 「解約予定」バッジを表示（ページリロードなし）
   ↓
11. 期間終了日まで利用可能
   ↓
12. 期間終了日に Stripe が自動的にサブスクを削除
   ↓
13. Webhook: customer.subscription.deleted 受信
   ↓
14. DB: is_active = false に更新
```

**実装ファイル**:
- フロントエンド: `src/pages/Account.tsx`
- Realtime: `src/hooks/useSubscription.ts`
- Edge Function: `supabase/functions/create-customer-portal/index.ts`

---

## Webhook処理

### Webhookエンドポイント
```
https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook
```

### イベント処理詳細

#### 1. `checkout.session.completed`
**トリガー**: Checkoutセッション完了時

**処理内容**:
1. セッションからユーザーIDを取得（`metadata.user_id`）
2. サブスクリプションIDを取得
3. **重複チェック**: 既存アクティブサブスクを検索
4. 既存アクティブサブスクがあれば `is_active=false` に更新
5. 新しいサブスクリプション情報をDBに保存（upsert）

**コード**: `supabase/functions/stripe-webhook/index.ts:155-240`

---

#### 2. `customer.subscription.created`
**トリガー**: サブスクリプション作成時

**処理内容**:
1. Stripe APIでサブスクリプション詳細を取得
2. Customer IDからユーザーIDを検索
3. Price IDからプランタイプと期間を判定
4. DBに保存（upsert）

**プラン判定ロジック**:
```typescript
// Price IDからプランを判定
if (priceId.includes('standard')) planType = 'standard';
else if (priceId.includes('feedback')) planType = 'feedback';
else if (priceId.includes('growth')) planType = 'growth';
else if (priceId.includes('community')) planType = 'community';

// 期間を判定
if (interval === 'month' && intervalCount === 1) duration = 1;
else if (interval === 'month' && intervalCount === 3) duration = 3;
```

**コード**: `supabase/functions/stripe-webhook/index.ts:242-396`

---

#### 3. `customer.subscription.updated`
**トリガー**: サブスクリプション更新時（プラン変更・解約予約など）

**処理内容**:
1. サブスクリプション情報を取得
2. プランタイプと期間を判定
3. `cancel_at_period_end`、`cancel_at`、`current_period_end` を取得
4. DBを更新（upsert）

**重要**: 解約予約時に `cancel_at_period_end: true` が設定される

**コード**: `supabase/functions/stripe-webhook/index.ts:434-547`

---

#### 4. `customer.subscription.deleted`
**トリガー**: サブスクリプション削除時（期間終了後の自動削除）

**処理内容**:
1. サブスクリプションIDで検索
2. `is_active=false` に更新

**コード**: `supabase/functions/stripe-webhook/index.ts:549-602`

---

## 実装済み機能

### ✅ コア機能

1. **新規ユーザー登録** - Stripe Checkout
2. **プラン変更** - Stripe Customer Portal（ディープリンク）
3. **解約** - Stripe Customer Portal
4. **サブスクリプション状態の取得** - check-subscription Edge Function

### ✅ 安全性機能

5. **二重課金防止**
   - Checkout作成前に既存サブスクを全てキャンセル
   - Webhook受信時に重複チェック
   - upsertで同一サブスクIDの重複を防止

6. **エラーリトライ処理**
   - 指数バックオフ（1秒 → 2秒 → 4秒）
   - 最大3回リトライ
   - ネットワークエラー・5xxエラー・429エラーに対応

### ✅ UX機能

7. **Realtime更新**
   - 解約時にページリロードなしでUI更新
   - WebSocket接続で即座に反映
   - `user_subscriptions` テーブルの変更を監視

8. **テスト環境対応**
   - `useTestPrice`フラグで本番/テスト切り替え
   - 環境変数で本番/テスト Price IDを管理

### ✅ セキュリティ

9. **認証必須**
   - 全Edge FunctionでSupabase Auth認証必須
   - JWTトークン検証

10. **Webhook署名検証**
    - Stripe署名を検証（実装推奨、現在は未実装）

---

## 環境変数

### Supabase Secrets（Edge Functions用）

#### 必須環境変数
```bash
SUPABASE_URL                     # Supabase プロジェクトURL
SUPABASE_ANON_KEY                # Supabase 匿名キー
SUPABASE_SERVICE_ROLE_KEY        # Supabase サービスロールキー
STRIPE_SECRET_KEY                # Stripe シークレットキー
```

#### 本番用 Price ID
```bash
STRIPE_COMMUNITY_1M_PRICE_ID     # Communityプラン 1ヶ月
STRIPE_FEEDBACK_1M_PRICE_ID      # Feedbackプラン 1ヶ月
STRIPE_FEEDBACK_3M_PRICE_ID      # Feedbackプラン 3ヶ月
STRIPE_STANDARD_1M_PRICE_ID      # Standardプラン 1ヶ月
STRIPE_STANDARD_3M_PRICE_ID      # Standardプラン 3ヶ月
STRIPE_GROWTH_1M_PRICE_ID        # Growthプラン 1ヶ月
STRIPE_GROWTH_3M_PRICE_ID        # Growthプラン 3ヶ月
```

#### テスト用 Price ID
```bash
STRIPE_TEST_COMMUNITY_1M_PRICE_ID
STRIPE_TEST_FEEDBACK_1M_PRICE_ID
STRIPE_TEST_FEEDBACK_3M_PRICE_ID
STRIPE_TEST_STANDARD_1M_PRICE_ID
STRIPE_TEST_STANDARD_3M_PRICE_ID
STRIPE_TEST_GROWTH_1M_PRICE_ID
STRIPE_TEST_GROWTH_3M_PRICE_ID
```

### ローカル環境変数（`.env`）

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://fryogvfhymnpiqwssmuu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe（フロントエンド用）
VITE_STRIPE_FEEDBACK_1M_PRICE_ID=price_1OIiMRKUVUnt8GtyMGSJIH8H
VITE_STRIPE_FEEDBACK_3M_PRICE_ID=price_1OIiMRKUVUnt8GtyttXJ71Hz
# ... その他
```

---

## 重要な設計判断

### 1. なぜCustomer Portalを使うのか？

**理由**:
- Stripeが提供する標準UI（多言語対応、セキュア）
- プラン変更・解約・請求書確認を1つのUIで提供
- 独自UIを作るより開発コストが低い
- Stripe側で自動的に古いサブスクをキャンセル + 新規作成 + 日割り計算

**トレードオフ**:
- ❌ UIカスタマイズが限定的
- ✅ メンテナンスコストが低い
- ✅ セキュリティが高い

---

### 2. なぜCheckout作成前にキャンセルするのか？

**理由**:
- Customer Portalでプラン変更する場合はStripe側で自動処理
- しかし、Checkoutから直接プラン変更する場合は手動でキャンセルが必要
- Webhook処理でキャンセルすると一瞬二重課金が発生するリスク

**実装**:
- `create-checkout` Edge Function内で既存サブスクを全てキャンセル
- キャンセル失敗時はCheckout作成を中止（原子性保証）

---

### 3. なぜ複数サブスクリプション対応が必要なのか？

**理由**:
- バグやエラーで複数のアクティブサブスクが作成される可能性
- `.single()` を使うと複数ある場合にエラーになる
- 二重課金を確実に防ぐため、全てのアクティブサブスクをキャンセル

**実装**:
- `.eq('is_active', true)` で全てのアクティブサブスクを取得
- `for` ループで全てをキャンセル

---

### 4. なぜRealtimeを使うのか？

**理由**:
- Stripe Customer Portalで解約した後、元のタブに戻っても反映されない
- ユーザーが混乱する（「解約したのにまだ有効になってる！」）
- ページリロードを強制するのはUXが悪い

**実装**:
- Supabase Realtime Subscriptionsで`user_subscriptions`テーブルを監視
- 変更検知時に自動的に`fetchSubscriptionStatus()`を実行
- UIが即座に更新される

**パフォーマンス**:
- WebSocket接続1つのみ（軽量）
- 変更時のみデータ取得（効率的）

---

### 5. なぜupsertを使うのか？

**理由**:
- Webhookは同じイベントを複数回送信する可能性がある
- `insert` を使うと重複エラーが発生
- `upsert` を使えば既存レコードを更新するだけ

**実装**:
```typescript
.upsert({
  stripe_subscription_id: subscriptionId,
  // ... その他のフィールド
}, { onConflict: 'stripe_subscription_id' })
```

---

## トラブルシューティング

### 問題1: 二重課金が発生する

**症状**: 同じユーザーに2つのアクティブサブスクリプションがある

**原因**:
1. `create-checkout`でキャンセル処理が失敗している
2. Webhookで重複チェックが動作していない

**確認方法**:
```sql
SELECT * FROM user_subscriptions
WHERE user_id = 'ユーザーID'
  AND is_active = true;
```

**対処法**:
1. Supabase Logsで`create-checkout`のログを確認
2. キャンセル処理が成功しているか確認
3. 手動で古いサブスクを`is_active=false`に更新

**ドキュメント**: `double-billing-prevention-implementation.md`

---

### 問題2: プラン変更ができない

**症状**: 「プラン変更」ボタンをクリックしても何も起こらない

**原因**:
1. `create-customer-portal` Edge Functionが404エラー
2. 環境変数が設定されていない
3. Stripe Customer IDが取得できない

**確認方法**:
1. ブラウザコンソールでエラーを確認
2. Supabase Logsで`create-customer-portal`のログを確認

**対処法**:
1. Edge Functionを再デプロイ: `npx supabase functions deploy create-customer-portal`
2. 環境変数を確認: `npx supabase secrets list`
3. `stripe_customers`テーブルにレコードがあるか確認

---

### 問題3: 解約が反映されない

**症状**: Customer Portalで解約しても、アカウントページに反映されない

**原因**:
1. Webhookが届いていない
2. Realtime Subscriptionが接続されていない

**確認方法**:
1. ブラウザコンソールで`Realtime Subscription status: SUBSCRIBED`を確認
2. Supabase Logsで`stripe-webhook`のログを確認
3. Stripe Dashboardでイベントが送信されているか確認

**対処法**:
1. Webhook URLをStripe Dashboardで確認
2. Realtimeが有効か確認: `SELECT * FROM pg_publication;`
3. RLSポリシーを確認

**ドキュメント**: `implementation-summary-tasks4-5.md`

---

### 問題4: Checkoutページに遷移できない

**症状**: 「今すぐ始める」ボタンをクリックしてもエラー

**原因**:
1. `create-checkout` Edge Functionが500エラー
2. Price ID環境変数が設定されていない
3. Stripe APIキーが無効

**確認方法**:
1. ブラウザコンソールで詳細エラーを確認
2. Supabase Logsで`create-checkout`のログを確認
3. 環境変数を確認: `npx supabase secrets list | grep PRICE_ID`

**対処法**:
1. Price ID環境変数を設定: `npx supabase secrets set STRIPE_FEEDBACK_1M_PRICE_ID=price_xxx`
2. Stripe APIキーを確認
3. Edge Functionを再デプロイ

---

### 問題5: リトライが動作しない

**症状**: ネットワークエラー時にリトライされない

**原因**:
1. `retry.ts`が正しくインポートされていない
2. エラーがリトライ対象外（4xxエラー）

**確認方法**:
1. ブラウザコンソールで「リトライ 1/3」のログを確認
2. エラーのステータスコードを確認

**対処法**:
1. `src/services/stripe.ts`で`retrySupabaseFunction`を使っているか確認
2. 4xxエラーはリトライ対象外なので、エラー原因を修正

**ドキュメント**: `implementation-summary-tasks4-5.md`

---

## 参考ドキュメント

### 実装詳細
- `critical-fixes-applied.md` - 二重課金防止の実装
- `double-billing-prevention-implementation.md` - 二重課金防止の詳細
- `implementation-summary-tasks4-5.md` - Realtime・リトライ実装
- `payment-tasks-detailed.md` - タスク詳細

### テスト
- `TESTING.md` - テスト手順
- `test-checklist-double-billing.md` - 二重課金テスト
- `test-plan-double-billing.md` - テスト計画

### データ移行
- `migration/stripe-migration-final-tasks.md` - 移行タスク
- `migration/migration-test-guide.md` - 移行手順

### その他
- `stripe-webhook-best-practices.md` - Webhookベストプラクティス
- `README.md` - ドキュメント構成

---

## バージョン履歴

### v1.0 (2025-11-20)
- 初版作成
- 全機能の仕様をまとめ

---

**最終更新日**: 2025-11-20
**作成者**: Claude Code
**ステータス**: ✅ 実装完了・テスト中
