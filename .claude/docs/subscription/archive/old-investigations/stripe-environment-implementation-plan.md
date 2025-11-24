# Stripe環境分離実装計画書

**作成日**: 2025-11-20
**目的**: テスト環境と本番環境を正しく分離して、両方を同時に使えるようにする

---

## 実装の全体像

### 最終目標

1. **開発者（あなた）**: テスト環境のStripe APIでテストできる
2. **既存ユーザー（2,162件）**: 本番環境のStripe APIで引き続き利用できる
3. **新規ユーザー**: 本番公開後は本番環境、開発中はテスト環境を使う

### 実装方針

データベースに`environment`カラムを追加し、各レコードがテスト環境か本番環境かを記録する。
Edge Functionsは`environment`を見て、適切なStripe APIキーを使用する。

---

## 前提条件の確認

### 質問1: Stripe APIキーについて

現在、以下のStripe APIキーを持っていますか？

- [ ] **テスト環境のSecret Key** (`sk_test_...`で始まる)
- [ ] **本番環境のSecret Key** (`sk_live_...`で始まる)

**確認方法**:
1. https://dashboard.stripe.com/test/apikeys （テスト環境）
2. https://dashboard.stripe.com/apikeys （本番環境）

もし本番環境のSecret Keyを持っていない、または確認できない場合は、Stripe Dashboardで取得してください。

### 質問2: 既存の環境変数

現在、Supabaseに設定されている`STRIPE_SECRET_KEY`は、テスト環境と本番環境のどちらですか？

**確認方法**:
```bash
# キーを確認（先頭の文字列だけ）
npx supabase secrets get STRIPE_SECRET_KEY | head -c 10
```

- `sk_test_` → テスト環境
- `sk_live_` → 本番環境

**現在の予想**: テスト環境（エラーメッセージから推測）

---

## 実装ステップ

### ステップ1: データベーススキーマ変更

#### 目的

`stripe_customers`と`user_subscriptions`テーブルに`environment`カラムを追加する。

#### 実装内容

**SQLマイグレーション**:
```sql
-- stripe_customersテーブルにenvironmentカラムを追加
ALTER TABLE stripe_customers
ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'live' CHECK (environment IN ('test', 'live'));

-- user_subscriptionsテーブルにenvironmentカラムを追加
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'live' CHECK (environment IN ('test', 'live'));

-- インデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_stripe_customers_environment ON stripe_customers(environment);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_environment ON user_subscriptions(environment);

-- 既存データは全て本番環境として設定
UPDATE stripe_customers SET environment = 'live' WHERE environment IS NULL;
UPDATE user_subscriptions SET environment = 'live' WHERE environment IS NULL;

-- コメントを追加
COMMENT ON COLUMN stripe_customers.environment IS 'Stripe環境: test（テスト環境）またはlive（本番環境）';
COMMENT ON COLUMN user_subscriptions.environment IS 'Stripe環境: test（テスト環境）またはlive（本番環境）';
```

#### 期待される結果

- `stripe_customers`テーブルに`environment`カラムが追加される
- `user_subscriptions`テーブルに`environment`カラムが追加される
- 既存の2,162件のデータは全て`environment='live'`になる

#### 検証方法

```sql
-- 確認1: カラムが追加されたか
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'stripe_customers' AND column_name = 'environment';

-- 確認2: 既存データが全てliveになっているか
SELECT environment, COUNT(*)
FROM stripe_customers
GROUP BY environment;

-- 確認3: インデックスが作成されたか
SELECT indexname FROM pg_indexes WHERE tablename = 'stripe_customers' AND indexname = 'idx_stripe_customers_environment';
```

#### リスク

- **低リスク**: カラム追加は既存データに影響しない
- **ロールバック方法**:
  ```sql
  ALTER TABLE stripe_customers DROP COLUMN environment;
  ALTER TABLE user_subscriptions DROP COLUMN environment;
  ```

---

### ステップ2: 環境変数の設定

#### 目的

本番環境のStripe Secret Keyを環境変数に追加する。

#### 実装内容

**Supabase Secretsに追加**:
```bash
npx supabase secrets set STRIPE_LIVE_SECRET_KEY="sk_live_XXXXXXXXXXXXXXXX"
```

**注意事項**:
- 本番環境のSecret Keyは**絶対に**公開しない
- GitHubやログに記録しない
- `.env`ファイルにも保存しない（Supabase Secretsのみ）

#### 期待される結果

- `STRIPE_SECRET_KEY`: テスト環境用（既存）
- `STRIPE_LIVE_SECRET_KEY`: 本番環境用（新規）

#### 検証方法

```bash
npx supabase secrets list | grep STRIPE
```

以下が表示されるはず:
```
STRIPE_SECRET_KEY                 | ...
STRIPE_LIVE_SECRET_KEY            | ...
```

#### リスク

- **低リスク**: 環境変数の追加は既存の動作に影響しない
- **ロールバック方法**:
  ```bash
  npx supabase secrets unset STRIPE_LIVE_SECRET_KEY
  ```

---

### ステップ3: Edge Functionsの修正

#### 目的

`environment`カラムを見て、適切なStripe APIキーを使用するようにする。

#### 対象ファイル

1. `supabase/functions/create-customer-portal/index.ts`
2. `supabase/functions/create-checkout/index.ts`
3. `supabase/functions/stripe-webhook/index.ts`

#### 実装内容

##### 3-1. 共通ヘルパー関数の作成

**ファイル**: `supabase/functions/_shared/stripe-helpers.ts`（新規作成）

```typescript
import Stripe from 'https://esm.sh/stripe@14.21.0';

/**
 * 環境に応じたStripe APIキーを取得
 */
export function getStripeKey(environment: 'test' | 'live'): string {
  if (environment === 'test') {
    return Deno.env.get('STRIPE_SECRET_KEY') || '';
  } else {
    return Deno.env.get('STRIPE_LIVE_SECRET_KEY') || '';
  }
}

/**
 * 環境に応じたStripeクライアントを作成
 */
export function createStripeClient(environment: 'test' | 'live'): Stripe {
  const apiKey = getStripeKey(environment);
  if (!apiKey) {
    throw new Error(`Stripe API key not found for environment: ${environment}`);
  }
  return new Stripe(apiKey, {
    apiVersion: '2023-10-16',
  });
}

/**
 * デバッグログ
 */
export function logEnvironment(functionName: string, environment: 'test' | 'live', userId: string) {
  console.log(`[${functionName}] 環境: ${environment}, ユーザー: ${userId}`);
}
```

##### 3-2. create-customer-portal の修正

**変更前**（現在）:
```typescript
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
});
```

**変更後**:
```typescript
import { createStripeClient, logEnvironment } from '../_shared/stripe-helpers.ts';

// ... 省略 ...

// ユーザーのStripe Customer IDを取得（既存コード）
let stripeCustomerId: string | null = null;
let environment: 'test' | 'live' = 'live'; // デフォルトは本番

// アクティブなサブスクリプションから顧客IDと環境を取得
const { data: activeSubscription } = await supabase
  .from('user_subscriptions')
  .select('stripe_customer_id, environment')
  .eq('user_id', user.id)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (activeSubscription?.stripe_customer_id) {
  stripeCustomerId = activeSubscription.stripe_customer_id;
  environment = activeSubscription.environment || 'live';
  console.log('アクティブなサブスクリプションから顧客IDを取得:', stripeCustomerId);
} else {
  // アクティブなサブスクリプションがない場合は、最新の顧客IDを取得
  const { data: customers } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id, environment')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (customers && customers.length > 0) {
    stripeCustomerId = customers[0].stripe_customer_id;
    environment = customers[0].environment || 'live';
    console.log('最新の顧客IDを取得:', stripeCustomerId);
  }
}

// 環境に応じたStripeクライアントを作成
const stripe = createStripeClient(environment);
logEnvironment('create-customer-portal', environment, user.id);
```

##### 3-3. create-checkout の修正

**修正箇所1**: Stripe顧客作成時に環境を保存

```typescript
// テスト環境か本番環境かを判定
const useTestPrice = isTest || import.meta.env.MODE !== 'production';
const environment: 'test' | 'live' = useTestPrice ? 'test' : 'live';

console.log(`Checkout開始: プラン=${planType}, 期間=${duration}ヶ月, 環境=${environment}`);

// Stripe顧客を作成
const customer = await stripe.customers.create({
  email: user.email,
  metadata: {
    user_id: user.id,
    environment: environment // 環境を記録
  }
});

// 作成した顧客情報をDBに保存
const { error: insertError } = await supabaseClient
  .from("stripe_customers")
  .upsert({
    user_id: user.id,
    stripe_customer_id: customer.id,
    environment: environment // ← 追加
  }, { onConflict: 'user_id' });
```

**修正箇所2**: Stripeクライアント作成

```typescript
import { createStripeClient, logEnvironment } from '../_shared/stripe-helpers.ts';

// 既存の顧客がいる場合、その環境を使用
let environment: 'test' | 'live' = 'test'; // デフォルトはテスト（開発中のため）

if (customerData) {
  // 既存顧客の環境を取得
  const { data: customerEnv } = await supabaseClient
    .from('stripe_customers')
    .select('environment')
    .eq('user_id', user.id)
    .single();

  environment = customerEnv?.environment || 'live';
} else {
  // 新規顧客の場合、現在のモードから判定
  const useTestPrice = isTest || import.meta.env.MODE !== 'production';
  environment = useTestPrice ? 'test' : 'live';
}

// 環境に応じたStripeクライアントを作成
const stripe = createStripeClient(environment);
logEnvironment('create-checkout', environment, user.id);
```

##### 3-4. stripe-webhook の修正

**修正箇所**: サブスクリプション作成/更新時に環境を保存

```typescript
// Stripeのイベントから環境を判定
// Stripe APIのモード（livemode）を確認
const environment: 'test' | 'live' = event.livemode ? 'live' : 'test';

console.log(`Webhook受信: イベント=${event.type}, 環境=${environment}`);

// サブスクリプションデータを保存
const subscriptionData = {
  user_id: userId,
  stripe_subscription_id: subscription.id,
  stripe_customer_id: subscription.customer as string,
  plan_type: planType,
  duration: duration,
  is_active: subscription.status === 'active' || subscription.status === 'trialing',
  cancel_at_period_end: subscription.cancel_at_period_end,
  cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  environment: environment, // ← 追加
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
```

#### 期待される結果

- テスト環境の顧客ID → テスト用APIキーで処理
- 本番環境の顧客ID → 本番用APIキーで処理
- 新規作成時に`environment`が自動的に保存される

#### 検証方法

1. テスト環境で新規登録
2. データベースで`environment='test'`になっているか確認
3. Customer Portalが正常に開くか確認

#### リスク

- **中リスク**: Edge Functionsの修正ミスでエラーが発生する可能性
- **対策**:
  - デプロイ前にローカルでテスト
  - デプロイ後、すぐに動作確認
  - エラーが出たら前のバージョンに戻す

---

### ステップ4: テストユーザーの準備

#### 目的

あなたのアカウント（`takumi.kai.skywalker@gmail.com`）をテスト環境用に設定する。

#### 実装内容

**オプションA: 既存データを削除して新規登録**

```sql
-- あなたのアカウントのStripe情報を削除
DELETE FROM user_subscriptions WHERE user_id = '71136a45-a876-48fa-a16a-79b031226b8a';
DELETE FROM stripe_customers WHERE user_id = '71136a45-a876-48fa-a16a-79b031226b8a';
```

その後、`/subscription`ページでテスト環境のカードで新規登録。

**オプションB: 新しいテスト用アカウントを作成**

別のメールアドレスで新規アカウントを作成。

**推奨**: オプションA（既存アカウントを使う）

理由:
- 本番環境に同じメールアドレスがあっても問題ない（環境が分離されているため）
- テスト用に別メールアドレスを用意する必要がない

#### 期待される結果

- テスト環境の顧客IDが作成される
- `environment='test'`が保存される

#### 検証方法

```sql
SELECT stripe_customer_id, environment
FROM stripe_customers
WHERE user_id = '71136a45-a876-48fa-a16a-79b031226b8a';
```

`environment`が`test`になっているはず。

---

## 実装スケジュール

### 所要時間見積もり

1. **ステップ1**: データベーススキーマ変更 → **10分**
2. **ステップ2**: 環境変数の設定 → **5分**
3. **ステップ3**: Edge Functionsの修正 → **60分**
4. **ステップ4**: テストユーザーの準備 → **10分**
5. **動作確認とデバッグ** → **30分**

**合計**: 約2時間

### 実施順序

```
ステップ1 → ステップ2 → ステップ3 → デプロイ → ステップ4 → 動作確認
```

---

## トラブルシューティング

### 問題1: マイグレーションが失敗する

**症状**: `ALTER TABLE`でエラーが出る

**原因**: カラムが既に存在する

**解決策**: `IF NOT EXISTS`を使っているので、再実行すれば問題ない

### 問題2: Edge Functionでエラーが出る

**症状**: デプロイ後に500エラーが出る

**原因**: 環境変数が設定されていない、またはコードにバグがある

**解決策**:
1. 環境変数を確認: `npx supabase secrets list`
2. ログを確認: Supabase Dashboard
3. 前のバージョンに戻す

### 問題3: テスト環境と本番環境が逆になる

**症状**: テストユーザーなのに本番APIキーが使われる

**原因**: `environment`カラムの値が間違っている

**解決策**:
```sql
-- 確認
SELECT user_id, stripe_customer_id, environment FROM stripe_customers;

-- 修正
UPDATE stripe_customers SET environment = 'test' WHERE user_id = 'XXX';
```

---

## 実装前のチェックリスト

実装を開始する前に、以下を確認してください：

- [ ] Stripe Dashboard（テスト環境）のSecret Keyを確認済み
- [ ] Stripe Dashboard（本番環境）のSecret Keyを確認済み
- [ ] 現在の`STRIPE_SECRET_KEY`がテスト環境か本番環境か把握している
- [ ] データベースのバックアップを取っている（念のため）
- [ ] 時間が確保できている（2-3時間）

---

## 質問事項

実装を開始する前に、以下の質問に答えてください：

### Q1: Stripe Secret Keyについて

本番環境のStripe Secret Key（`sk_live_...`）を持っていますか？

- [ ] はい、持っている
- [ ] いいえ、これから取得する
- [ ] わからない、確認が必要

### Q2: テストユーザーについて

あなたのアカウント（`takumi.kai.skywalker@gmail.com`）の既存Stripeデータを削除しても良いですか？

- [ ] はい、削除して新規登録する
- [ ] いいえ、新しいテスト用アカウントを作る

### Q3: 実装タイミング

今すぐ実装を開始しますか？それとも後で？

- [ ] 今すぐ開始する
- [ ] 計画を確認してから決める
- [ ] 後で実装する

---

## 次のステップ

上記の3つの質問に答えていただければ、正確な手順で実装を開始します。
