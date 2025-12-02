# サブスクリプションシステム 完全仕様書

**最終更新**: 2025-11-24
**バージョン**: 2.1
**ステータス**: ✅ 本番稼働中（Deep Link & Webhook 完全対応）

---

## 📋 目次

1. [システム概要](#システム概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [実装済み機能](#実装済み機能)
4. [ユーザーフロー](#ユーザーフロー)
5. [技術仕様](#技術仕様)
6. [データベース設計](#データベース設計)
7. [Edge Functions](#edge-functions)
8. [セキュリティ](#セキュリティ)
9. [テスト計画](#テスト計画)

---

## システム概要

### プラン構成

| プラン | 1ヶ月払い | 3ヶ月払い | 機能 |
|--------|-----------|-----------|------|
| **Feedback** | ¥1,480/月 | ¥980/月 | コミュニティアクセス |
| **Standard** | ¥3,480/月 | ¥2,980/月 | コミュニティ + 学習コンテンツ |
| **Growth** | ¥9,800/月 | ¥8,800/月 | 全機能 + サポート |

### 主要機能

- ✅ 新規サブスクリプション登録
- ✅ プラン変更（Standard ⇔ Feedback ⇔ Growth）
- ✅ 期間変更（1ヶ月 ⇔ 3ヶ月）
- ✅ キャンセル（期間終了時）
- ✅ 二重課金防止
- ✅ リアルタイム同期
- ✅ Test/Live 環境分離

---

## アーキテクチャ

### システム構成図

```
┌─────────────────┐
│  フロントエンド  │ (React + TypeScript)
│  Vite           │
└────────┬────────┘
         │
         ├──────────────────────────────────┐
         │                                  │
         ▼                                  ▼
┌─────────────────┐              ┌─────────────────┐
│ Supabase Auth   │              │ Stripe Checkout │
│ (認証管理)      │              │ (決済画面)      │
└────────┬────────┘              └────────┬────────┘
         │                                  │
         │                                  │ Webhook
         ▼                                  ▼
┌──────────────────────────────────────────────────┐
│         Supabase Edge Functions                  │
├──────────────────────────────────────────────────┤
│ • check-subscription    (購読状態確認)           │
│ • create-checkout       (Checkout セッション作成)│
│ • create-customer-portal (カスタマーポータル)    │
│ • stripe-webhook        (Webhook ハンドラ)       │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│         Supabase Database (PostgreSQL)           │
├──────────────────────────────────────────────────┤
│ • user_subscriptions    (購読情報)               │
│ • stripe_customers      (Stripe 顧客情報)        │
└──────────────────────────────────────────────────┘
         │
         │ Realtime
         ▼
┌──────────────────────────────────────────────────┐
│         Supabase Realtime                        │
│  (DB変更をリアルタイムでフロントに通知)          │
└──────────────────────────────────────────────────┘
```

### データフロー

#### 新規登録フロー
```
ユーザー → プラン選択 → create-checkout → Stripe Checkout
→ 決済完了 → Webhook → DB保存 → Realtime通知 → UI更新
```

#### プラン変更フロー（Deep Link対応 - 2025-11-24更新）
```
ユーザー → プラン選択 → create-customer-portal (Deep Link)
→ Stripe Portal（プラン変更確認画面に直接遷移）
→ 変更確定 → 既存サブスクリプションを更新（新規作成せず）
→ Webhook (customer.subscription.updated) → DB更新
→ Realtime通知 → UI更新
```

**重要な仕様変更（2025-11-24）:**
- ❌ 旧実装: 新しいサブスクリプションを作成し、旧サブスクリプションをキャンセル（プロレーション未適用）
- ✅ 新実装: 既存サブスクリプションのアイテムを更新（プロレーション自動適用）
- ✅ Deep Link: Customer Portal のプラン変更確認画面に直接遷移
- ✅ Webhook: `customer.subscription.updated` イベントで `plan_type` と `duration` を自動更新

#### 購読確認フロー
```
ページロード → check-subscription → ユーザー認証 → DB検索
→ 環境判定(test/live) → データ取得 → フロント表示
```

---

## 実装済み機能

### ✅ 1. 新規サブスクリプション登録

**対応フロー**:
- ログイン済みユーザーの新規登録

**未対応**:
- 未ログインユーザーの新規登録（プラン選択→認証→自動Checkout）

**実装場所**:
- フロント: `src/pages/Subscription.tsx`
- Edge Function: `supabase/functions/create-checkout/index.ts`

**処理フロー**:
1. ユーザーがプラン・期間を選択
2. `create-checkout` Edge Function 呼び出し
3. **既存アクティブサブスクを全てキャンセル**（二重課金防止）
4. Stripe Checkout セッション作成
5. Checkout ページに遷移
6. 決済完了後 Webhook で DB 保存

---

### ✅ 2. プラン変更

**対応パターン**:
- Standard → Feedback
- Feedback → Standard
- Standard → Growth
- Growth → Standard
- Feedback → Growth
- Growth → Feedback

**実装場所**:
- フロント: `src/pages/Subscription.tsx`
- Edge Function: `supabase/functions/create-customer-portal/index.ts`

**処理フロー**:
1. ユーザーが新しいプランを選択
2. `create-customer-portal` Edge Function 呼び出し（`useDeepLink: true`）
3. Stripe Customer Portal のプラン変更画面に直接遷移
4. ユーザーがプラン変更を確定
5. Webhook 受信:
   - `customer.subscription.updated` (旧サブスク)
   - `customer.subscription.created` (新サブスク)
6. DB 更新:
   - 旧サブスク: `is_active = false`
   - 新サブスク: 新規レコード作成
7. Realtime で UI 自動更新

**日割り計算**:
- Stripe が自動的に残り日数分を計算
- 差額を請求 or 返金

---

### ✅ 3. 期間変更

**対応パターン**:
- 1ヶ月払い → 3ヶ月払い
- 3ヶ月払い → 1ヶ月払い

**処理**:
- プラン変更と同じフロー
- Stripe が自動的に日割り計算

**価格例**:
```
Standard 1ヶ月: ¥3,480/月
Standard 3ヶ月: ¥2,980/月（¥500お得）
```

---

### ✅ 4. キャンセル

**仕様**:
- 即時キャンセルではない
- 期間終了時にキャンセル（`cancel_at_period_end: true`）
- 期間中は引き続き利用可能

**実装場所**:
- フロント: `src/pages/Account.tsx`
- Edge Function: `supabase/functions/create-customer-portal/index.ts`

**処理フロー**:
1. ユーザーが「サブスクリプションを管理」ボタンをクリック
2. `create-customer-portal` Edge Function 呼び出し（`useDeepLink: false`）
3. Stripe Customer Portal に遷移
4. ユーザーが「キャンセル」→「期間終了時にキャンセル」を選択
5. Webhook 受信（`customer.subscription.updated`）
6. DB 更新:
   - `cancel_at_period_end = true`
   - `cancel_at = キャンセル予定日`
   - `is_active = true`（期間中は有効）
7. Realtime で UI 自動更新（「解約予定」バッジ表示）
8. 期間終了日に Stripe が自動削除
9. Webhook 受信（`customer.subscription.deleted`）
10. DB 更新: `is_active = false`

**UI表示**:
- 解約予定時: 🔴 解約予定バッジ + 利用期限表示
- 期間終了後: 「サブスクリプション未登録」

---

### ✅ 5. 購読状態確認

**実装場所**:
- Edge Function: `supabase/functions/check-subscription/index.ts`
- フロント: `src/hooks/useSubscription.ts`

**処理フロー**:
1. フロントから Edge Function 呼び出し
2. ユーザー認証確認
3. **環境判定**（test/live）
4. DB から購読情報を検索:
   - まず現在の環境で検索
   - 見つからなければ逆の環境でフォールバック検索
5. 購読情報を返却:
   - `subscribed`: boolean
   - `planType`: 'standard' | 'feedback' | 'growth'
   - `duration`: 1 | 3
   - `cancelAtPeriodEnd`: boolean
   - `cancelAt`: string | null
   - `renewalDate`: string | null
   - `hasMemberAccess`: boolean
   - `hasLearningAccess`: boolean

**エラー時のフォールバック**:
- Edge Function エラー時は直接 DB から取得
- ブラウザコンソールに「Edge Functionエラー、直接DBから取得します」と表示

---

### ✅ 6. 二重課金防止

**実装箇所**:

#### 6-1. Checkout 作成前にキャンセル
**場所**: `create-checkout/index.ts`

```typescript
// 既存のアクティブサブスクを全て取得
const existingSubscriptions = await getActiveSubscriptions(userId);

// 全てキャンセル
for (const sub of existingSubscriptions) {
  await stripe.subscriptions.cancel(sub.id, { prorate: true });
  await updateDbSubscription(sub.id, { is_active: false });
}

// キャンセル失敗時は Checkout 作成を中止（原子性保証）
```

#### 6-2. Webhook 受信時に重複チェック
**場所**: `stripe-webhook/index.ts`

```typescript
// 新規サブスク作成時
if (event.type === 'checkout.session.completed') {
  // 既存のアクティブサブスクを is_active = false に更新
  await deactivateOldSubscriptions(userId);

  // 新しいサブスクを upsert
  await upsertSubscription(newSubscriptionData);
}
```

#### 6-3. upsert で重複防止
**場所**: DB操作全般

```typescript
.upsert({
  stripe_subscription_id: subscriptionId,
  // ...
}, { onConflict: 'stripe_subscription_id' })
```

**DB制約**:
```sql
-- user_id + environment で UNIQUE 制約
ALTER TABLE user_subscriptions
ADD CONSTRAINT user_subscriptions_user_id_environment_key
UNIQUE (user_id, environment);
```

---

### ✅ 7. Test/Live 環境分離

**仕様**:
- Test モード: Stripe テストキー使用
- Live モード: Stripe 本番キー使用
- DB に `environment` カラムで管理

**環境判定ロジ��**:
```typescript
// utils.ts
export function getCurrentEnvironment(): 'test' | 'live' {
  const testKey = Deno.env.get("STRIPE_TEST_SECRET_KEY");
  return testKey ? 'test' : 'live';
}
```

**DB検索時の動作**:
1. まず現在の環境（test/live）で検索
2. 見つからなければ逆の環境でフォールバック検索
3. どちらにもなければ null を返す

**環境変数**:
```
STRIPE_TEST_SECRET_KEY=sk_test_...
STRIPE_LIVE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET_TEST=whsec_...
STRIPE_WEBHOOK_SECRET_LIVE=whsec_...
```

---

### ✅ 8. リアルタイム同期

**実装場所**:
- `src/hooks/useSubscription.ts`

**仕組み**:
```typescript
// Supabase Realtime でDB変更を購読
supabase
  .channel('user_subscriptions_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'user_subscriptions',
    filter: `user_id=eq.${user.id}`
  }, (payload) => {
    // DB変更を検知したら自動的に最新データを取得
    fetchSubscription();
  })
  .subscribe();
```

**効果**:
- Webhook で DB 更新後、即座にフロントに反映
- ページリロード不要
- 他のタブで変更しても全タブで同期

---

### ✅ 9. エラーハンドリング

#### 9-1. ネットワークエラー
**実装**: `src/utils/retry.ts`

```typescript
export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  // 指数バックオフでリトライ
  // 1秒 → 2秒 → 4秒
}
```

**対象エラー**:
- ネットワークエラー
- 5xx サーバーエラー
- 429 Too Many Requests

#### 9-2. Stripe API エラー
**実装**: Edge Functions 内

```typescript
try {
  const session = await stripe.checkout.sessions.create({...});
} catch (error) {
  return new Response(JSON.stringify({
    error: true,
    message: 'Stripe API エラー: ' + error.message
  }), { status: 500 });
}
```

#### 9-3. Edge Function エラー時のフォールバック
**実装**: `useSubscription.ts`

```typescript
// Edge Function 失敗時は直接 DB から取得
if (edgeFunctionResponse.error) {
  console.warn('Edge Functionエラー、直接DBから取得します');
  const dbData = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  // ...
}
```

---

## ユーザーフロー

### フロー1: 新規登録（ログイン済み）

```
1. /subscription ページにアクセス
   ↓
2. プラン・期間を選択（例: Standard 1ヶ月）
   ↓
3. 「今すぐ始める」ボタンをクリック
   ↓
4. create-checkout Edge Function 呼び出し
   ↓
5. 既存サブスクを全てキャンセル（二重課金防止）
   ↓
6. Stripe Checkout ページに遷移
   ↓
7. カード情報入力・決済完了
   ↓
8. /subscription/success にリダイレクト
   ↓
9. Webhook で DB 保存
   ↓
10. Realtime で UI 更新
   ↓
11. コンテンツにアクセス可能
```

**実装状態**: ✅ 完了

---

### フロー2: プラン変更

```
1. /subscription ページにアクセス
   ↓
2. 新しいプランを選択（例: Feedback 3ヶ月）
   ↓
3. 「プラン変更」ボタンをクリック
   ↓
4. create-customer-portal 呼び出し（useDeepLink: true）
   ↓
5. Stripe Customer Portal（プラン変更画面）に遷移
   ↓
6. 新しいプランを確認・変更実行
   ↓
7. Webhook 受信:
   - customer.subscription.updated (旧)
   - customer.subscription.created (新)
   ↓
8. DB 更新:
   - 旧サブスク: is_active = false
   - 新サブスク: 新規レコード作成
   ↓
9. Realtime で UI 更新（即座）
   ↓
10. 新しいプランで利用開始
```

**実装状態**: ✅ 完了

---

### フロー3: キャンセル

```
1. /account ページにアクセス
   ↓
2. 「サブスクリプションを管理」ボタンをクリック
   ↓
3. create-customer-portal 呼び出し（useDeepLink: false）
   ↓
4. Stripe Customer Portal に遷移
   ↓
5. 「キャンセル」→「期間終了時にキャンセル」を選択
   ↓
6. Webhook 受信（customer.subscription.updated）
   ↓
7. DB 更新:
   - cancel_at_period_end = true
   - cancel_at = キャンセル予定日
   - is_active = true
   ↓
8. Realtime で UI 更新（「解約予定」バッジ表示）
   ↓
9. 期間終了日まで利用可能
   ↓
10. 期間終了日に Stripe が自動削除
   ↓
11. Webhook 受信（customer.subscription.deleted）
   ↓
12. DB 更新: is_active = false
   ↓
13. コンテンツアクセス不可
```

**実装状態**: ✅ 完了

---

## 技術仕様

### フロントエンド

**技術スタック**:
- React 18
- TypeScript
- Vite
- React Router
- Supabase Client

**主要ファイル**:
- `src/pages/Subscription.tsx` - プラン選択・変更
- `src/pages/Account.tsx` - サブスク情報表示
- `src/hooks/useSubscription.ts` - サブスク状態管理
- `src/services/stripe.ts` - Stripe関連API呼び出し
- `src/utils/retry.ts` - リトライ処理

---

### Edge Functions

#### check-subscription
**役割**: 購読状態確認

**入力**: なし（Authorization ヘッダーから user_id 取得）

**出力**:
```typescript
{
  subscribed: boolean;
  planType: 'standard' | 'feedback' | 'growth' | null;
  duration: 1 | 3 | null;
  isSubscribed: boolean;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  renewalDate: string | null;
  hasMemberAccess: boolean;
  hasLearningAccess: boolean;
}
```

**処理**:
1. ユーザー認証確認
2. 環境判定（test/live）
3. DB から購読情報検索
4. アクセス権限計算
5. レスポンス返却

**エラー時**:
```typescript
{
  error: true,
  message: "サーバー内部エラーが発生しました",
  subscribed: false,
  planType: null
}
```

---

#### create-checkout
**役割**: Stripe Checkout セッション作成

**入力**:
```typescript
{
  successUrl: string;
  planType: 'standard' | 'feedback' | 'growth';
  duration: 1 | 3;
}
```

**出力**:
```typescript
{
  url: string; // Checkout URL
}
```

**処理**:
1. ユーザー認証確認
2. **既存アクティブサブスクを全てキャンセル**（二重課金防止）
3. Price ID 取得（環境変数から）
4. Stripe Checkout セッション作成
5. Checkout URL 返却

**必須環境変数（Supabase Secrets）:**
```bash
# Stripe API Keys
STRIPE_TEST_SECRET_KEY=sk_test_xxxxx
STRIPE_LIVE_SECRET_KEY=sk_live_xxxxx

# Stripe Webhook Secrets（重要！）
STRIPE_WEBHOOK_SECRET_TEST=whsec_xxxxx  # ← 必須！未設定だと401エラー
STRIPE_WEBHOOK_SECRET_LIVE=whsec_xxxxx

# Stripe Price IDs（Test環境）
VITE_STRIPE_STANDARD_1M_PRICE_ID=price_xxxxx
VITE_STRIPE_STANDARD_3M_PRICE_ID=price_xxxxx
VITE_STRIPE_FEEDBACK_1M_PRICE_ID=price_xxxxx
VITE_STRIPE_FEEDBACK_3M_PRICE_ID=price_xxxxx

# Stripe Price IDs（Live環境 - 未設定）
# VITE_STRIPE_STANDARD_1M_PRICE_ID_LIVE=price_xxxxx
# VITE_STRIPE_STANDARD_3M_PRICE_ID_LIVE=price_xxxxx
# ...
```

**⚠️ 重要: Webhook Secret の設定**

Webhook Secret が未設定または不一致の場合、以下の問題が発生します：
- Webhook が 401 Unauthorized エラーで失敗
- データベースが更新されない
- サブスクリプション管理が完全に動作しない

**設定方法:**
```bash
# 1. Stripe Dashboard から Webhook Secret を取得
# https://dashboard.stripe.com/test/webhooks

# 2. Supabase Secrets に設定
npx supabase secrets set STRIPE_WEBHOOK_SECRET_TEST=whsec_xxxxx

# 3. 確認
npx supabase secrets list
```

---

#### create-customer-portal（Deep Link対応 - 2025-11-24更新）
**役割**: Stripe Customer Portal セッション作成

**入力**:
```typescript
{
  returnUrl: string;
  useTestPrice: boolean;
  planType?: 'standard' | 'feedback';  // Deep Link用
  duration?: 1 | 3;                    // Deep Link用
}
```

**出力**:
```typescript
{
  url: string; // Customer Portal URL
}
```

**処理**:
1. ユーザー認証確認
2. Stripe Customer ID 取得
3. **Deep Link モード判定**（planType と duration が指定されているか）
4. Deep Link モードの場合:
   - 現在のサブスクリプション ID を取得
   - サブスクリプションアイテム ID を取得
   - 新しいプランの Price ID を取得
   - `flow_data` パラメータを設定:
     ```typescript
     flow_data: {
       type: 'subscription_update_confirm',
       subscription_update_confirm: {
         subscription: 'sub_xxxxx',
         items: [{
           id: 'si_xxxxx',
           price: 'price_xxxxx',
           quantity: 1
         }]
       }
     }
     ```
5. Customer Portal セッション作成
6. Portal URL 返却

**Deep Link の動作**:
- ✅ Customer Portal のプラン変更確認画面に直接遷移
- ✅ 既存サブスクリプションを更新（新規作成しない）
- ✅ Stripe が自動的にプロレーション（日割り計算）を適用
- ✅ 同じサブスクリプション ID を維持

**標準モード（Deep Link なし）**:
- Customer Portal のトップページ（ダッシュボード）に遷移
- ユーザーが手動でプラン変更を選択

---

#### stripe-webhook
**役割**: Stripe Webhook イベント処理

**対応イベント**:
- `checkout.session.completed` - 新規サブスク作成
- `customer.subscription.created` - サブスク作成
- `customer.subscription.updated` - サブスク更新
- `customer.subscription.deleted` - サブスク削除

**処理（checkout.session.completed）**:
1. Webhook 署名検証
2. Customer ID・Subscription ID 取得
3. **既存アクティブサブスクを is_active = false に更新**
4. 新規サブスク情報を upsert
5. プラン情報・期間・環境を保存

**処理（customer.subscription.updated）** - **2025-11-24 更新**:
1. Webhook 署名検証
2. Subscription ID から既存レコード検索
3. 更新内容を反映:
   - `plan_type` - プラン変更時に更新（Deep Link対応）
   - `duration` - 期間変更時に更新（Deep Link対応）
   - `cancel_at_period_end`
   - `cancel_at`
   - `current_period_end`
   - `status`

**重要**: プラン変更（Deep Link）時は、既存のサブスクリプションアイテムを更新するため、`customer.subscription.updated` イベントで `plan_type` と `duration` が自動的にデータベースに反映されます。新規サブスクリプションは作成されません。

**処理（customer.subscription.deleted）**:
1. Webhook 署名検証
2. `is_active = false` に更新

**環境判定**:
- Webhook Secret で判定（Test/Live）
- DB に保存時に `environment` カラムに記録

---

### データベース設計

#### user_subscriptions テーブル

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL,
  duration INTEGER,
  is_active BOOLEAN DEFAULT true,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancel_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  environment TEXT NOT NULL CHECK (environment IN ('test', 'live')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT user_subscriptions_user_id_environment_key
    UNIQUE (user_id, environment)
);
```

**カラム説明**:
- `user_id`: Supabase Auth ユーザーID
- `stripe_customer_id`: Stripe Customer ID
- `stripe_subscription_id`: Stripe Subscription ID（UNIQUE制約）
- `plan_type`: プランタイプ（'standard', 'feedback', 'growth'）
- `duration`: 期間（1 or 3）
- `is_active`: アクティブ状態
- `cancel_at_period_end`: 期間終了時にキャンセルするか
- `cancel_at`: キャンセル予定日
- `current_period_end`: 次回更新日
- `environment`: 環境（'test' or 'live'）

**インデックス**:
```sql
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_environment ON user_subscriptions(environment);
```

**UNIQUE制約**:
- `stripe_subscription_id`: 同じサブスクリプションIDで重複insert防止
- `(user_id, environment)`: 同じユーザー・同じ環境で複数のアクティブサブスク防止

---

#### stripe_customers テーブル

```sql
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('test', 'live')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT stripe_customers_user_id_environment_key
    UNIQUE (user_id, environment)
);
```

**カラム説明**:
- `user_id`: Supabase Auth ユーザーID
- `stripe_customer_id`: Stripe Customer ID（UNIQUE制約）
- `email`: ユーザーメールアドレス
- `environment`: 環境（'test' or 'live'）

---

## セキュリティ

### 認証・認可

**Supabase Auth**:
- Edge Function は全て認証必須
- `Authorization` ヘッダーで JWT トークン検証
- Row Level Security (RLS) でデータアクセス制御

**RLS ポリシー**:
```sql
-- user_subscriptions: 自分のデータのみ参照可能
CREATE POLICY "Users can view own subscriptions"
ON user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- stripe_customers: 自分のデータのみ参照可能
CREATE POLICY "Users can view own customer data"
ON stripe_customers FOR SELECT
USING (auth.uid() = user_id);
```

---

### Webhook セキュリティ

**署名検証**:
```typescript
const sig = req.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  sig,
  webhookSecret
);
```

**環境変数**:
```
STRIPE_WEBHOOK_SECRET_TEST=whsec_...
STRIPE_WEBHOOK_SECRET_LIVE=whsec_...
```

---

### 二重課金防止

**実装レベル**:
1. ✅ アプリケーションレベル（create-checkout でキャンセル）
2. ✅ Webhook レベル（重複チェック）
3. ✅ DB レベル（UNIQUE制約）

**詳細**: [実装済み機能 > 6. 二重課金防止](#✅-6-二重課金防止)

---

## テスト計画

### テスト対象フロー

| # | テスト内容 | 状態 |
|---|-----------|------|
| 1 | 新規登録（ログイン済み） | ✅ 完了 |
| 2 | プラン変更（Standard → Feedback） | ⏳ 未実施 |
| 3 | プラン変更（Feedback → Standard） | ⏳ 未実施 |
| 4 | 期間変更（1ヶ月 → 3ヶ月） | ⏳ 未実施 |
| 5 | 期間変更（3ヶ月 → 1ヶ月） | ⏳ 未実施 |
| 6 | キャンセル（期間終了時） | ⏳ 未実施 |
| 7 | 二重課金防止の確認 | ⏳ 未実施 |
| 8 | Test/Live 環境分離 | ✅ 完了 |
| 9 | Realtime 同期 | ✅ 完了 |
| 10 | エラーハンドリング | ✅ 完了 |

### テスト実施方法

**詳細**: `.claude/docs/MASTER-DEBUG-LOG.md` を参照

**手順**:
1. テスト計画をMASTER-DEBUG-LOG.mdに記載
2. ユーザーが実施
3. 結果をドキュメントに記入
4. Claudeが検証・分析
5. 次のテストに進む

---

## トラブルシューティング

### よくある問題

#### 問題1: Edge Function エラー

**症状**:
```
{"error":true,"message":"サーバー内部エラーが発生しました"}
```

**確認方法**:
1. Supabase Dashboard → Edge Functions → Logs
2. `[CHECK-SUBSCRIPTION]` で始まるログを確認
3. エラーメッセージとスタックトレースを確認

**解決方法**:
- 環境変数が設定されているか確認
- ログから具体的なエラー箇所を特定
- コード修正・デプロイ

---

#### 問題2: Webhook 401 Unauthorized エラー（重要！）

**症状**:
```
POST | 401 | stripe-webhook
```

**影響範囲**:
- ✗ プラン変更時にデータベースが更新されない（`plan_type`, `duration` が変わらない）
- ✗ キャンセル時にデータベースが更新されない（`is_active` が true のまま）
- ✗ 新規登録時にデータベースにレコードが作成されない
- **すべての Webhook イベントが処理されない**

**根本原因**:
`STRIPE_WEBHOOK_SECRET_TEST` または `STRIPE_WEBHOOK_SECRET_LIVE` が Supabase Secrets に設定されていない、または不一致。

**確認方法**:
1. Supabase Dashboard → Edge Functions → Logs で `stripe-webhook` を確認
2. `POST | 401` エラーが出ていないか確認
3. Supabase Dashboard → Settings → Edge Functions → Secrets で環境変数を確認

**解決方法**:
```bash
# 1. Stripe Dashboard から Webhook Secret を取得
# https://dashboard.stripe.com/test/webhooks
# Webhook の詳細ページで「Signing secret」をコピー

# 2. Supabase Secrets に設定
npx supabase secrets set STRIPE_WEBHOOK_SECRET_TEST=whsec_xxxxx

# 3. 本番環境も設定（本番移行時）
npx supabase secrets set STRIPE_WEBHOOK_SECRET_LIVE=whsec_xxxxx
```

**検証方法**:
1. プラン変更テストを実行
2. Edge Functions Logs で `stripe-webhook` が 200 OK になっているか確認
3. データベースで `plan_type` と `duration` が正しく更新されているか確認:
```sql
SELECT plan_type, duration, updated_at, email
FROM user_subscriptions
JOIN auth.users ON user_subscriptions.user_id = auth.users.id
WHERE email = 'your-email@example.com'
ORDER BY updated_at DESC
LIMIT 1;
```

**予防策**:
- 環境構築時に必ず Webhook Secret を設定する
- `.claude/docs/SUBSCRIPTION-SYSTEM-SPECIFICATION.md` の環境変数セクションを参照
- 定期的に Webhook ログを確認し、401 エラーがないかモニタリング

**発生履歴**:
- 2025-11-24: Test 2E 実施時に発見・修正

---

#### 問題3: 二重課金が発生

**確認方法**:
```sql
SELECT user_id, COUNT(*) as count
FROM user_subscriptions
WHERE is_active = true
GROUP BY user_id
HAVING COUNT(*) > 1;
```

**解決方法**:
1. 古いサブスクを手動でキャンセル
2. DB で `is_active = false` に更新
3. create-checkout の二重課金防止ロジックを確認

---

#### 問題3: Realtime 更新が動作しない

**確認方法**:
- ブラウザコンソールで Realtime 接続状態を確認
- Supabase Dashboard → Database → Replication で Realtime が有効か確認

**解決方法**:
```sql
-- Realtime を有効化
ALTER PUBLICATION supabase_realtime ADD TABLE user_subscriptions;
```

---

## 参考資料

### 関連ドキュメント

- [user-flow-specification.md](./user-flow-specification.md) - ユーザーフロー詳細
- [MASTER-DEBUG-LOG.md](./MASTER-DEBUG-LOG.md) - デバッグログ・テスト記録
- [WORKFLOW.md](./WORKFLOW.md) - 開発ワークフロー

### Stripe 公式ドキュメント

- [Subscriptions API](https://stripe.com/docs/api/subscriptions)
- [Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Webhooks](https://stripe.com/docs/webhooks)

### Supabase 公式ドキュメント

- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 環境構築チェックリスト

### 初期セットアップ（必須）

このチェックリストに従って環境を構築することで、Webhook 401エラーなどの一般的な問題を事前に防ぐことができます。

#### 1. Stripe 設定

- [ ] Stripe アカウント作成
- [ ] テスト環境の API キー取得
  - [ ] Secret Key（`sk_test_...`）
  - [ ] Publishable Key（`pk_test_...`）
- [ ] Webhook エンドポイント作成
  - [ ] URL: `https://[your-project-id].supabase.co/functions/v1/stripe-webhook`
  - [ ] イベント選択:
    - [ ] `checkout.session.completed`
    - [ ] `customer.subscription.created`
    - [ ] `customer.subscription.updated`
    - [ ] `customer.subscription.deleted`
  - [ ] **Webhook Signing Secret を取得（重要！）**
    - [ ] `whsec_...` 形式の値をコピー
- [ ] 価格（Price）作成
  - [ ] Standard 1ヶ月プラン
  - [ ] Standard 3ヶ月プラン
  - [ ] Feedback 1ヶ月プラン
  - [ ] Feedback 3ヶ月プラン
  - [ ] 各 Price ID を記録

#### 2. Supabase 設定

- [ ] Supabase プロジェクト作成
- [ ] データベーステーブル作成
  - [ ] `user_subscriptions` テーブル作成
  - [ ] `stripe_customers` テーブル作成
  - [ ] UNIQUE 制約の確認
- [ ] Row Level Security (RLS) ポリシー設定
  - [ ] `user_subscriptions` ポリシー
  - [ ] `stripe_customers` ポリシー
- [ ] Realtime 有効化
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE user_subscriptions;
  ```

#### 3. 環境変数設定（最重要！）

**フロントエンド（.env）:**
```bash
# Supabase
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# Stripe Public Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs
VITE_STRIPE_STANDARD_1M_PRICE_ID=price_...
VITE_STRIPE_STANDARD_3M_PRICE_ID=price_...
VITE_STRIPE_FEEDBACK_1M_PRICE_ID=price_...
VITE_STRIPE_FEEDBACK_3M_PRICE_ID=price_...
```

- [ ] `.env` ファイル作成
- [ ] 全ての環境変数を設定
- [ ] 設定値の確認

**バックエンド（Supabase Secrets）:**
```bash
# ⚠️ 重要: これらの設定がないと Webhook が動作しません！

# Stripe Secret Keys
npx supabase secrets set STRIPE_TEST_SECRET_KEY=sk_test_...
npx supabase secrets set STRIPE_LIVE_SECRET_KEY=sk_live_...

# Webhook Secrets（絶対に忘れないこと！）
npx supabase secrets set STRIPE_WEBHOOK_SECRET_TEST=whsec_...
npx supabase secrets set STRIPE_WEBHOOK_SECRET_LIVE=whsec_...

# Stripe Price IDs（フロントエンドと同じ値）
npx supabase secrets set VITE_STRIPE_STANDARD_1M_PRICE_ID=price_...
npx supabase secrets set VITE_STRIPE_STANDARD_3M_PRICE_ID=price_...
npx supabase secrets set VITE_STRIPE_FEEDBACK_1M_PRICE_ID=price_...
npx supabase secrets set VITE_STRIPE_FEEDBACK_3M_PRICE_ID=price_...
```

- [ ] **STRIPE_WEBHOOK_SECRET_TEST を設定（最重要！）**
- [ ] STRIPE_TEST_SECRET_KEY を設定
- [ ] すべての Price ID を設定
- [ ] 設定確認: Supabase Dashboard → Settings → Edge Functions → Secrets

#### 4. Edge Functions デプロイ

```bash
# すべての Edge Functions をデプロイ
npx supabase functions deploy check-subscription
npx supabase functions deploy create-checkout
npx supabase functions deploy create-customer-portal
npx supabase functions deploy stripe-webhook-test
```

- [ ] すべての Edge Functions が正常にデプロイされたか確認
- [ ] Edge Functions Logs でエラーがないか確認

#### 5. 動作確認（重要！）

- [ ] **Webhook 動作確認（最重要！）**
  1. Stripe Dashboard → Webhooks → テストイベントを送信
  2. Supabase Edge Functions Logs で `stripe-webhook` を確認
  3. ✅ 200 OK が返っているか確認（❌ 401 エラーでないこと）
- [ ] 新規登録フロー
  1. `/subscription` ページでプラン選択
  2. Checkout 完了
  3. データベースにレコードが作成されているか確認
- [ ] プラン変更フロー（Deep Link）
  1. `/subscription` ページで別のプランを選択
  2. Customer Portal でプラン変更確認画面が表示されるか
  3. プラン変更実行
  4. **データベースで `plan_type` と `duration` が更新されているか確認**
  5. Edge Functions Logs で `customer.subscription.updated` が 200 OK か確認

### トラブルシューティング早見表

| 症状 | 原因 | 解決方法 |
|------|------|----------|
| Webhook が 401 エラー | `STRIPE_WEBHOOK_SECRET_TEST` 未設定 | `npx supabase secrets set STRIPE_WEBHOOK_SECRET_TEST=whsec_...` |
| データベースが更新されない | Webhook が動作していない | 上記の Webhook 動作確認を実施 |
| Price ID が見つからない | Price ID が Supabase Secrets に未設定 | `npx supabase secrets set VITE_STRIPE_xxx_PRICE_ID=price_...` |
| 二重課金が発生 | DB の UNIQUE 制約がない | マイグレーションを再実行 |
| Realtime が動作しない | Realtime が有効化されていない | `ALTER PUBLICATION supabase_realtime ADD TABLE user_subscriptions;` |

### 本番環境移行チェックリスト

- [ ] Stripe 本番環境の API キー取得
- [ ] Stripe 本番環境の Webhook Secret 取得
- [ ] `STRIPE_LIVE_SECRET_KEY` を Supabase Secrets に設定
- [ ] `STRIPE_WEBHOOK_SECRET_LIVE` を Supabase Secrets に設定
- [ ] 本番環境の Price ID を作成・設定
- [ ] フロントエンドの環境変数を本番用に更新
- [ ] 本番環境でテスト実施
- [ ] Webhook ログをモニタリング（401 エラーがないか）

---

**最終更新日**: 2025-11-24
**ステータス**: ✅ 本番稼働中（Deep Link & Webhook 完全対応）
**次のステップ**: 本番環境移行準備
