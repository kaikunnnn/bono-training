# Stripe実装計画のレビューと改善提案

**作成日**: 2025-11-20
**目的**: 外部レビューの指摘を反映し、より安全で確実な実装計画を策定する

---

## レビュー結果の要約

### 評価された項目

| 項目 | 評価 | 状態 |
|-----|------|------|
| データベース設計 (environmentカラム) | ✅ 妥当 | そのまま実装可能 |
| シークレット管理 | ⚠️ 注意が必要 | 改善が必要 |
| Edge Functions修正 | ✅ 妥当 | Webhook部分に追加実装が必要 |
| テストユーザー再登録 | ✅ 安全 | そのまま実装可能 |

### 最重要の指摘

**Webhook署名検証の実装が不足している**

- Stripeの`Webhook Signing Secret`はテスト環境と本番環境で異なる
- 単一エンドポイントで両方を受け取る場合、署名検証の分岐が必須
- これを怠ると「署名検証エラーで全てのWebhookが失敗する」リスクがある

---

## 改善提案の詳細検討

### 改善1: 環境変数の命名を明確化

#### 現在の計画（曖昧）

```
STRIPE_SECRET_KEY          ← テスト用？本番用？不明確
STRIPE_LIVE_SECRET_KEY     ← 本番用
```

#### 改善後（明確）

```
STRIPE_TEST_SECRET_KEY     ← テスト環境用（明示的）
STRIPE_LIVE_SECRET_KEY     ← 本番環境用（明示的）
```

#### メリット

- コードを読む人が混乱しない
- 将来的な保守性が向上
- 環境の取り違えによる事故を防ぐ

#### デメリット

- 既存の`STRIPE_SECRET_KEY`を参照しているコードがあれば変更が必要

#### 決定

**採用する**。既存の`STRIPE_SECRET_KEY`を`STRIPE_TEST_SECRET_KEY`にリネームする。

---

### 改善2: Webhook署名検証の実装

#### 問題の詳細

**Stripeの仕組み**:
1. StripeはWebhookを送信する際、リクエストに署名を付ける
2. サーバー側は`Webhook Signing Secret`を使って署名を検証する
3. 検証に成功したら、そのリクエストが本物のStripeからのものだと確認できる

**現在の実装の問題**:
- `stripe-webhook/index.ts`は署名検証を行っているが、**1つの署名シークレット**しか想定していない
- テスト環境と本番環境で異なる署名シークレットが必要だが、現在の実装では対応できない

**結果**:
- 本番環境のWebhookが「署名が一致しない」エラーで失敗する
- またはテスト環境のWebhookが失敗する

#### 解決策の検討

##### オプションA: Webhookエンドポイントを2つに分ける（推奨）

**メリット**:
- シンプルで確実
- テスト環境と本番環境が完全に分離される
- トラブルシューティングが容易

**デメリット**:
- Edge Functionを2つ管理する必要がある（コードは同じ）

**実装**:
```
supabase/functions/stripe-webhook/index.ts       ← 本番環境用
supabase/functions/stripe-webhook-test/index.ts  ← テスト環境用
```

Stripe Dashboardで2つのWebhookエンドポイントを登録:
```
本番環境: https://...supabase.co/functions/v1/stripe-webhook
テスト環境: https://...supabase.co/functions/v1/stripe-webhook-test
```

##### オプションB: 単一エンドポイントで両方を受け取る

**メリット**:
- Edge Functionが1つで済む

**デメリット**:
- 実装が複雑になる
- 署名検証のロジックが難しい
- バグが入りやすい

**実装の難しさ**:
署名検証は**リクエストボディを読む前**に行う必要があるため、以下の問題がある：

1. リクエストボディから`livemode`を読んで環境を判定したい
2. でも署名検証にはリクエストボディが必要
3. リクエストボディは1回しか読めない（Denoの制約）
4. → 複雑な実装が必要

**実装例**（複雑）:
```typescript
// 両方の署名シークレットで検証を試みる
const testSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET_TEST');
const liveSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET_LIVE');

let event;
let environment: 'test' | 'live';

// まずテスト環境で検証を試みる
try {
  event = stripe.webhooks.constructEvent(body, signature, testSecret);
  environment = 'test';
} catch (err) {
  // テスト環境で失敗したら本番環境で試みる
  try {
    event = stripe.webhooks.constructEvent(body, signature, liveSecret);
    environment = 'live';
  } catch (err2) {
    // 両方失敗 → 不正なリクエスト
    return new Response('Webhook signature verification failed', { status: 400 });
  }
}
```

#### 推奨する解決策

**オプションA: Webhookエンドポイントを2つに分ける**

理由:
- シンプルで確実
- バグが入りにくい
- 運用時のトラブルシューティングが容易
- 将来的に片方だけを無効化するなど、柔軟な運用ができる

---

### 改善3: データベース設計の追加考慮事項

#### RLS (Row Level Security) の考慮

**レビューの指摘**:
> テストデータは本番の管理画面に出したくない場合、RLSポリシーが必要になる

**検討**:
- 現時点では不要（開発者しかアクセスしない）
- 将来的に管理画面を作る場合は、以下のようなRLSポリシーを追加:

```sql
-- 本番データのみ表示
CREATE POLICY "Show only live data to admin"
ON stripe_customers
FOR SELECT
TO authenticated
USING (environment = 'live');
```

**決定**: 今回は実装しない。必要になったら追加する。

---

## 改善後の実装計画

### ステップ1: データベーススキーマ変更（変更なし）

```sql
ALTER TABLE stripe_customers
ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'live' CHECK (environment IN ('test', 'live'));

ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'live' CHECK (environment IN ('test', 'live'));

CREATE INDEX IF NOT EXISTS idx_stripe_customers_environment ON stripe_customers(environment);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_environment ON user_subscriptions(environment);

UPDATE stripe_customers SET environment = 'live' WHERE environment IS NULL;
UPDATE user_subscriptions SET environment = 'live' WHERE environment IS NULL;
```

**変更なし**: そのまま実装

---

### ステップ2: 環境変数の設定（改善版）

#### 2-1. 既存の環境変数をリネーム

```bash
# 現在の値を確認
npx supabase secrets get STRIPE_SECRET_KEY

# 新しい名前で設定
npx supabase secrets set STRIPE_TEST_SECRET_KEY="<既存の値>"

# 古い環境変数を削除（念のため最後に）
npx supabase secrets unset STRIPE_SECRET_KEY
```

#### 2-2. 本番環境の環境変数を追加

```bash
# Stripe Dashboardから本番環境のSecret Keyを取得
# https://dashboard.stripe.com/apikeys

npx supabase secrets set STRIPE_LIVE_SECRET_KEY="sk_live_xxxxx"
```

#### 2-3. Webhook署名シークレットを追加

```bash
# Stripe Dashboardから取得
# テスト環境: https://dashboard.stripe.com/test/webhooks
# 本番環境: https://dashboard.stripe.com/webhooks

npx supabase secrets set STRIPE_WEBHOOK_SECRET_TEST="whsec_test_xxxxx"
npx supabase secrets set STRIPE_WEBHOOK_SECRET_LIVE="whsec_xxxxx"
```

#### 最終的な環境変数リスト

```
STRIPE_TEST_SECRET_KEY          ← テスト環境のSecret Key
STRIPE_LIVE_SECRET_KEY          ← 本番環境のSecret Key
STRIPE_WEBHOOK_SECRET_TEST      ← テスト環境のWebhook署名シークレット
STRIPE_WEBHOOK_SECRET_LIVE      ← 本番環境のWebhook署名シークレット
```

---

### ステップ3: Edge Functionsの修正（改善版）

#### 3-1. 共通ヘルパー関数の作成

**ファイル**: `supabase/functions/_shared/stripe-helpers.ts`

```typescript
import Stripe from 'https://esm.sh/stripe@14.21.0';

/**
 * 環境に応じたStripe APIキーを取得
 */
export function getStripeKey(environment: 'test' | 'live'): string {
  if (environment === 'test') {
    const key = Deno.env.get('STRIPE_TEST_SECRET_KEY');
    if (!key) throw new Error('STRIPE_TEST_SECRET_KEY not found');
    return key;
  } else {
    const key = Deno.env.get('STRIPE_LIVE_SECRET_KEY');
    if (!key) throw new Error('STRIPE_LIVE_SECRET_KEY not found');
    return key;
  }
}

/**
 * 環境に応じたStripeクライアントを作成
 */
export function createStripeClient(environment: 'test' | 'live'): Stripe {
  const apiKey = getStripeKey(environment);
  return new Stripe(apiKey, {
    apiVersion: '2023-10-16',
  });
}

/**
 * デバッグログ
 */
export function logEnvironment(functionName: string, environment: 'test' | 'live', userId: string) {
  console.log(`[${functionName}] 環境: ${environment === 'test' ? 'テスト' : '本番'}, ユーザー: ${userId}`);
}
```

#### 3-2. stripe-webhook-test の作成（新規）

**ファイル**: `supabase/functions/stripe-webhook-test/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get('STRIPE_TEST_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET_TEST') || '';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook署名検証失敗:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`✅ [TEST] Webhook受信: ${event.type}`);

  // 既存のstripe-webhookと同じ処理ロジックを実行
  // ただし environment = 'test' を明示的に設定

  // ... 省略（既存のstripe-webhook/index.tsの処理ロジックをコピー）

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**注意**: 処理ロジックは既存の`stripe-webhook`と同じだが、`environment='test'`を明示的に設定する。

#### 3-3. stripe-webhook の修正（本番環境用）

既存の`supabase/functions/stripe-webhook/index.ts`を本番環境専用に修正:

```typescript
// 環境変数を本番環境用に変更
const stripe = new Stripe(Deno.env.get('STRIPE_LIVE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET_LIVE') || '';

// ... 既存の処理ロジック（変更なし）

// ただし、DBに保存する際に environment = 'live' を明示的に設定
const subscriptionData = {
  // ... 既存のフィールド
  environment: 'live', // ← 追加
};
```

---

### ステップ4: Stripe Dashboardでの設定

#### 4-1. テスト環境のWebhookエンドポイントを設定

1. https://dashboard.stripe.com/test/webhooks にアクセス
2. 「エンドポイントを追加」をクリック
3. URL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook-test`
4. イベントを選択:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. 保存後、**署名シークレット**（`whsec_test_...`）をコピー
6. Supabaseに設定: `npx supabase secrets set STRIPE_WEBHOOK_SECRET_TEST="whsec_test_..."`

#### 4-2. 本番環境のWebhookエンドポイントを設定

1. https://dashboard.stripe.com/webhooks にアクセス
2. 「エンドポイントを追加」をクリック
3. URL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook`
4. イベントを選択（テスト環境と同じ）
5. 保存後、**署名シークレット**（`whsec_...`）をコピー
6. Supabaseに設定: `npx supabase secrets set STRIPE_WEBHOOK_SECRET_LIVE="whsec_..."`

---

### ステップ5: テストユーザーの再登録（変更なし）

```sql
DELETE FROM user_subscriptions WHERE user_id = '71136a45-a876-48fa-a16a-79b031226b8a';
DELETE FROM stripe_customers WHERE user_id = '71136a45-a876-48fa-a16a-79b031226b8a';
```

その後、`/subscription`ページでテスト環境のカードで新規登録。

---

## 改善後の実装スケジュール

| ステップ | 内容 | 所要時間 |
|---------|------|---------|
| 1 | データベーススキーマ変更 | 10分 |
| 2 | 環境変数の設定（改善版） | 15分 |
| 3-1 | 共通ヘルパー関数作成 | 10分 |
| 3-2 | stripe-webhook-test作成 | 20分 |
| 3-3 | stripe-webhook修正 | 10分 |
| 3-4 | create-checkout修正 | 20分 |
| 3-5 | create-customer-portal修正 | 10分 |
| 4 | Stripe Dashboardでの設定 | 15分 |
| 5 | テストユーザー再登録 | 10分 |
| **合計** | | **約2時間** |

---

## リスク評価（改善後）

| リスク | 発生確率 | 影響度 | 対策 |
|--------|---------|--------|------|
| Webhook署名検証エラー | **低** | 高 | 2つのエンドポイントで完全分離 |
| 環境変数の取り違え | **低** | 高 | 明確な命名規則 |
| 既存ユーザーへの影響 | **極低** | 高 | 既存データは全て`environment='live'` |
| Edge Function実装ミス | **中** | 中 | デプロイ後すぐに動作確認 |

---

## 最終確認項目

実装を開始する前に、以下を確認してください:

- [ ] Stripe Dashboard（テスト環境）にアクセスできる
- [ ] Stripe Dashboard（本番環境）にアクセスできる
- [ ] テスト環境のSecret Key (`sk_test_...`) を確認した
- [ ] 本番環境のSecret Key (`sk_live_...`) を確認した
- [ ] 作業時間（2時間）を確保できる
- [ ] 改善内容（特にWebhook分離）を理解した

---

## 次のステップ

この改善計画で問題なければ、「改善計画で実装を開始してください」と言っていただければ、ステップ1から順番に進めます。
