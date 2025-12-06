# サブスクリプション実装 現状レポート (完全版)

**作成日**: 2025-11-29
**最終更新**: 2025-11-29
**目的**: Stripe & Supabase サブスク実装の完全な現状把握
**状態**: ✅ Phase 1 完了 (Step 1/4)

---

## 📊 全体構成

### アーキテクチャ概要

```
┌─────────────┐
│  Frontend   │  React + TypeScript
│  (Vite)     │  - Subscription.tsx
└──────┬──────┘  - SubscriptionContext.tsx
       │         - useSubscription.ts
       ▼
┌─────────────┐
│  Supabase   │  Edge Functions (Deno)
│  Functions  │  - create-checkout
└──────┬──────┘  - stripe-webhook
       │         - check-subscription
       ▼         - update-subscription
┌─────────────┐
│   Stripe    │  決済・サブスク管理
│     API     │  - Checkout Session
└──────┬──────┘  - Subscriptions
       │         - Webhooks
       ▼
┌─────────────┐
│  Supabase   │  PostgreSQL Database
│  Database   │  - subscriptions テーブル
└─────────────┘  - stripe_price_cache テーブル
```

---

## 🗂️ ファイル構成

### Frontend (src/)

**ページ**:
- `pages/Subscription.tsx` - サブスクリプション管理ページ
- `pages/SubscriptionSuccess.tsx` - 決済成功ページ
- `pages/Training/Plan.tsx` - トレーニングプラン関連

**コンポーネント**:
- `components/subscription/PlanCard.tsx` - プランカード
- `components/subscription/PlanComparison.tsx` - プラン比較表
- `components/subscription/SubscriptionButton.tsx` - 登録ボタン
- `components/subscription/SubscriptionHeader.tsx` - ヘッダー
- `components/subscription/PlanChangeConfirmModal.tsx` - プラン変更確認モーダル
- `components/subscription/ContentGuard.tsx` - コンテンツアクセス制御
- `components/subscription/FallbackContent.tsx` - フォールバックコンテンツ
- `components/subscription/FeatureList.tsx` - 機能一覧
- `components/subscription/ProtectedPremiumRoute.tsx` - プレミアムルート保護
- `components/subscription/SubscriptionGuard.tsx` - サブスクガード
- `components/account/SubscriptionInfo.tsx` - アカウントページのサブスク情報

**State管理**:
- `contexts/SubscriptionContext.tsx` - サブスクContext
- `hooks/useSubscription.ts` - サブスクHook

**ユーティリティ**:
- `services/stripe.ts` - Stripe API呼び出し
- `utils/stripe.ts` - Stripeユーティリティ
- `utils/subscriptionPlans.ts` - プラン定義
- `utils/planDisplay.ts` - プラン表示ロジック
- `utils/planSession.ts` - プランセッション管理

### Backend (supabase/functions/)

**Edge Functions**:
- `create-checkout/index.ts` - Checkout Session作成
- `stripe-webhook/index.ts` - Stripe Webhook受信
- `stripe-webhook-test/index.ts` - Webhook テスト用
- `check-subscription/index.ts` - サブスク状態確認
- `update-subscription/index.ts` - サブスク更新

**共通モジュール**:
- `_shared/stripe-helpers.ts` - Stripe共通処理
- `check-subscription/subscription-service/` - サブスク管理サービス
  - `index.ts`
  - `db-operations.ts`
  - `stripe-operations.ts`
  - `plan-utils.ts`

### Database (supabase/migrations/)

**最新マイグレーション**:
- `20251128_create_price_cache_table.sql` - 価格キャッシュテーブル
- `20251121_add_unique_constraints.sql` - ユニーク制約追加
- `20251120_add_environment_column.sql` - 環境カラム追加
- `20250118_add_current_period_end.sql` - 期間終了日追加
- `20250107_add_duration_to_subscriptions.sql` - 期間追加
- `20250104_add_stripe_customer_id.sql` - Stripe顧客ID追加
- `20250103_create_progress_tables.sql` - 進捗テーブル作成

---

## 🔴 現在の Critical Issues

### ISSUE-001: 二重課金問題

**症状**:
- Starter → Premium にプラン変更すると、両方のプランが課金される
- 古いStarterプランが自動キャンセルされない

**原因**:
Webhook 401エラーでデータベースが更新されない

**影響範囲**:
- プラン変更フロー全体
- ユーザーが実際に金銭的損失を被る可能性

**関連ファイル**:
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/create-checkout/index.ts`

---

### ISSUE-002: 決済完了後、画面が更新されない

**症状**:
- プラン変更完了後、/subscriptionページに戻っても新プランが表示されない
- リロードしても `subscribed: false` のまま

**原因**:
Webhook 401エラーでデータベースが更新されない（ISSUE-001と同根）

**影響範囲**:
- すべてのプラン変更・新規登録フロー
- ユーザー体験の著しい低下

**関連ファイル**:
- `supabase/functions/stripe-webhook/index.ts`
- `src/contexts/SubscriptionContext.tsx`
- `src/pages/Subscription.tsx`

---

## 🟡 Medium Issues

### ISSUE-101: プラン変更時の確認ダイアログがない

**症状**:
「このプランを選択」ボタンをクリックすると、確認なしでCheckoutページに遷移

**期待値**:
確認ダイアログで「本当に変更しますか？」を表示

**優先度**: 中（ISSUE-001/002解決後）

---

### ISSUE-102: 料金表示が分かりにくい

**症状**:
「¥4,989/月」と表示されているが、税込かどうか不明

**期待値**:
「¥4,989（税込）/月」と明示

---

## 🟢 Low Issues

### ISSUE-201: ローディング状態が不明確

**症状**:
ボタンクリック → Checkout遷移までの間、何も表示されない

**期待値**:
ローディングスピナー表示

---

### ISSUE-202: 次回更新日が表示されない

**症状**:
現在のプランは表示されるが、次回更新日が不明

**期待値**:
```
現在のプラン: Premium
次回更新日: 2025-12-29
次回請求額: ¥4,980（税込）
```

---

## ✅ 解決済み Issues

### ISSUE-301: ブラウザバックで既存プランが解除される

**解決日**: 2025-11-28
**解決方法**: Checkoutセッション作成時に `cancel_url` を設定

---

### ISSUE-302: Webhook環境変数バグ

**解決日**: 2025-11-28
**解決方法**: `STRIPE_WEBHOOK_SECRET_TEST` と `STRIPE_WEBHOOK_SECRET_LIVE` を分離

---

## 📋 データフロー分析

### 新規プラン登録フロー

```
1. ユーザー: [プランを選択] ボタンクリック
   ↓
2. Frontend: create-checkout Edge Function 呼び出し
   ↓
3. Edge Function: Stripe Checkout Session 作成
   ↓
4. Frontend: Stripe Checkoutページにリダイレクト
   ↓
5. ユーザー: 決済情報入力・決済完了
   ↓
6. Stripe: checkout.session.completed Webhook送信
   ↓
7. Edge Function (stripe-webhook):
   - ⚠️ 401エラー発生中
   - データベース更新されない
   ↓
8. Frontend: /subscription-success または /subscription に戻る
   - ❌ 画面更新されない（DBが更新されていないため）
```

**問題点**:
- Step 7 で Webhook 401エラー
- Step 8 で画面に反映されない

---

### プラン変更フロー

```
1. ユーザー: [Premiumプランを選択] ボタンクリック
   ↓
2. Frontend: create-checkout Edge Function 呼び出し
   - metadata に既存 subscription_id を渡す
   ↓
3. Edge Function: Stripe Checkout Session 作成
   ↓
4. ユーザー: 決済完了
   ↓
5. Stripe: checkout.session.completed Webhook送信
   ↓
6. Edge Function (stripe-webhook):
   - ⚠️ 401エラー発生中
   - 新プラン作成されない
   - 古いプランがキャンセルされない
   ↓
7. 結果: 二重課金状態
```

**問題点**:
- Step 6 で Webhook 401エラー
- 古いプランがキャンセルされない → 二重課金

---

## 🔧 技術スタック

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **State**: React Context API
- **Router**: React Router v6
- **Styling**: Tailwind CSS

### Backend
- **Functions**: Supabase Edge Functions (Deno)
- **Database**: Supabase (PostgreSQL)
- **Payment**: Stripe API
- **Auth**: Supabase Auth

### Environment
- **Test**: Stripe Test Mode
- **Production**: Stripe Live Mode

---

## 📊 データベーススキーマ

### user_subscriptions テーブル

**マイグレーション履歴**:
- `20250104_add_stripe_customer_id.sql` - Stripe Customer ID追加
- `20250107_add_duration_to_subscriptions.sql` - 期間カラム追加
- `20250118_add_current_period_end.sql` - 更新日追加
- `20251120_add_environment_column.sql` - 環境カラム追加
- `20251121_add_unique_constraints.sql` - composite unique制約追加

**スキーマ** (マイグレーションから推測):
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  plan_type TEXT NOT NULL, -- 'community', 'standard', 'growth'
  duration INTEGER, -- 1 or 3 (months)
  is_active BOOLEAN DEFAULT false,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancel_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  environment TEXT NOT NULL CHECK (environment IN ('test', 'live')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Composite unique constraint
  CONSTRAINT user_subscriptions_stripe_subscription_id_environment_key
    UNIQUE (stripe_subscription_id, environment)
);
```

**インデックス**:
- `idx_user_subscriptions_environment` on `environment`

---

### stripe_customers テーブル

**マイグレーション**:
- `20251120_add_environment_column.sql` - 環境カラム追加
- `20251121_add_unique_constraints.sql` - composite unique制約追加

**スキーマ**:
```sql
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('test', 'live')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Composite unique constraint: one customer per user per environment
  CONSTRAINT stripe_customers_user_id_environment_key
    UNIQUE (user_id, environment)
);
```

**インデックス**:
- `idx_stripe_customers_environment` on `environment`

---

### price_cache テーブル

**マイグレーション**: `20251128_create_price_cache_table.sql`

**スキーマ**:
```sql
CREATE TABLE price_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  price_id TEXT NOT NULL,                       -- Stripe Price ID (e.g., price_xxx)
  product_id TEXT NOT NULL,                      -- Stripe Product ID
  plan_type TEXT NOT NULL,                       -- 'standard' or 'feedback'
  duration INTEGER NOT NULL,                     -- 1 or 3 (months)
  unit_amount INTEGER NOT NULL,                  -- Price in minor units (e.g., 4980 = ¥4,980)
  currency TEXT NOT NULL DEFAULT 'jpy',
  recurring_interval TEXT,                       -- 'month'
  recurring_interval_count INTEGER,              -- 1 or 3
  environment TEXT NOT NULL,                     -- 'test' or 'live'
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_price_per_env UNIQUE (price_id, environment)
);
```

**インデックス**:
- `idx_price_cache_plan` on `(plan_type, duration, environment)`
- `idx_price_cache_cached_at` on `cached_at`

**RLS Policies**:
- `Anyone can read price_cache` - SELECT public
- `Service role can manage price_cache` - ALL service_role only

**目的**: Stripe APIへのリクエストを削減し、価格表示を高速化 (500ms-1s → <50ms)

---

## 🔑 環境変数一覧

### Stripe API Keys

**Test Mode**:
- `STRIPE_TEST_SECRET_KEY` - Stripe Test環境のシークレットキー
- `STRIPE_WEBHOOK_SECRET_TEST` - Webhook署名検証用シークレット (Test)

**Live Mode**:
- `STRIPE_LIVE_SECRET_KEY` - Stripe Live環境のシークレットキー
- `STRIPE_WEBHOOK_SECRET_LIVE` - Webhook署名検証用シークレット (Live)

### Stripe Price IDs

**命名規則**: `STRIPE_[TEST_]PLANTYPE_DURATION_PRICE_ID`

**Test Mode**:
- `STRIPE_TEST_COMMUNITY_1M_PRICE_ID` - Communityプラン 1ヶ月 (Test)
- `STRIPE_TEST_COMMUNITY_3M_PRICE_ID` - Communityプラン 3ヶ月 (Test)
- `STRIPE_TEST_STANDARD_1M_PRICE_ID` - Standardプラン 1ヶ月 (Test)
- `STRIPE_TEST_STANDARD_3M_PRICE_ID` - Standardプラン 3ヶ月 (Test)
- `STRIPE_TEST_GROWTH_1M_PRICE_ID` - Growthプラン 1ヶ月 (Test)
- `STRIPE_TEST_GROWTH_3M_PRICE_ID` - Growthプラン 3ヶ月 (Test)

**Live Mode**:
- `STRIPE_COMMUNITY_1M_PRICE_ID` - Communityプラン 1ヶ月 (Live)
- `STRIPE_COMMUNITY_3M_PRICE_ID` - Communityプラン 3ヶ月 (Live)
- `STRIPE_STANDARD_1M_PRICE_ID` - Standardプラン 1ヶ月 (Live)
- `STRIPE_STANDARD_3M_PRICE_ID` - Standardプラン 3ヶ月 (Live)
- `STRIPE_GROWTH_1M_PRICE_ID` - Growthプラン 1ヶ月 (Live)
- `STRIPE_GROWTH_3M_PRICE_ID` - Growthプラン 3ヶ月 (Live)

### Environment Control

- `STRIPE_MODE` - 環境切り替え (`test` または `live`)

**使用箇所**:
- `supabase/functions/create-checkout/index.ts:154-165` - 動的Price ID選択
- `supabase/functions/_shared/stripe-helpers.ts:14-34` - API Key選択
- `supabase/functions/_shared/stripe-helpers.ts:52-64` - Webhook Secret選択

---

## 🎨 Frontend実装詳細

### useSubscription Hook (`src/hooks/useSubscription.ts`)

**主要機能**:

1. **サブスクリプション状態管理**:
   ```typescript
   interface SubscriptionState {
     isSubscribed: boolean;
     planType: PlanType | null;
     duration: number | null;
     cancelAtPeriodEnd: boolean;
     cancelAt: string | null;
     renewalDate: string | null;
     loading: boolean;
     error: Error | null;
     refresh: () => Promise<void>;
     hasMemberAccess: boolean;
     hasLearningAccess: boolean;
     canAccessContent: (isPremium: boolean) => boolean;
   }
   ```

2. **Realtime Subscription** (lines 115-143):
   - `user_subscriptions` テーブルのUPDATEを監視
   - Webhook完了後、即座にフロントエンドに反映
   - `filter: user_id=eq.${user.id}` で自分のサブスクのみ監視

   ```typescript
   const channel = supabase
     .channel('user_subscriptions_changes')
     .on('postgres_changes', {
       event: 'UPDATE',
       schema: 'public',
       table: 'user_subscriptions',
       filter: `user_id=eq.${user.id}`
     }, (payload) => {
       console.log('サブスクリプション更新を検知:', payload);
       fetchSubscriptionStatus();
     })
     .subscribe();
   ```

3. **Edge Function + DBフォールバック** (lines 42-106):
   - `check-subscription` Edge Functionを呼び出し
   - エラー時は直接DBから取得 (冗長性確保)
   - アクセス権限をローカルで計算

### SubscriptionContext (`src/contexts/SubscriptionContext.tsx`)

**役割**:
- `useSubscription` をラップしてグローバルに提供
- テスト用の `overrideValue` プロパティをサポート

### services/stripe.ts

**主要関数**:

1. **createCheckoutSession** (lines 12-141):
   - Edge Function `create-checkout` を呼び出し
   - エラーハンドリング (複雑なエラーレスポンスのパース)
   - Checkoutページへのリダイレクト

2. **checkSubscriptionStatus** (lines 146-280):
   - Edge Function `check-subscription` を呼び出し
   - フォールバック: 直接DB取得 (lines 191-248)
   - `renewalDate` の計算ロジック (キャンセル済みの場合は `cancel_at` を使用)

3. **getCustomerPortalUrl** (lines 289-332):
   - Stripeカスタマーポータルへのリンク生成
   - Deep Link対応 (planType, duration指定可能)

4. **updateSubscription** (lines 341-385):
   - Edge Function `update-subscription` を呼び出し
   - プラン変更処理

---

## ⚡ Webhook処理詳細 (`stripe-webhook/index.ts`)

### イベントハンドラー一覧

**処理対象イベント**:
1. `checkout.session.completed` - 新規サブスク作成・プラン変更
2. `invoice.paid` - サブスク更新・継続
3. `customer.subscription.deleted` - サブスクキャンセル
4. `customer.subscription.updated` - プラン変更

### 1. checkout.session.completed (lines 114-257)

**処理フロー**:
```
1. Checkoutセッションから情報取得
   ↓
2. Stripe顧客を取得/作成
   ↓
3. 既存のアクティブサブスクを確認
   ↓
4. 既存サブスクがあれば非アクティブ化 & Stripeでキャンセル
   ↓
5. 新規サブスクをDBに挿入
   ↓
6. metadata.replace_subscription_id があればStripeでキャンセル
```

**重要ロジック** (lines 162-199):
- 同一ユーザーの既存アクティブサブスクを全て非アクティブ化
- Stripe側でも `stripe.subscriptions.cancel()` を実行
- 二重課金防止のための重要な処理

**問題点**:
- Webhook 401エラーでこの処理が実行されない → 二重課金発生

### 2. invoice.paid (lines 262-380)

**処理フロー**:
```
1. Invoiceから subscription_id 取得
   ↓
2. Stripe Subscriptionを取得
   ↓
3. DBのサブスクを更新
   - is_active = true
   - current_period_end 更新
```

**目的**: 月次更新時にサブスク状態を同期

### 3. customer.subscription.deleted (lines 385-439)

**処理フロー**:
```
1. DBで該当サブスクを検索
   ↓
2. is_active = false に更新
   ↓
3. cancel_at, cancel_at_period_end 設定
```

**目的**: ユーザーがStripe側でキャンセルした時にDBを同期

### 4. customer.subscription.updated (lines 445-563)

**処理フロー**:
```
1. Stripe Subscriptionから情報取得
   ↓
2. DBのサブスクを更新
   - plan_type
   - duration
   - is_active
   - cancel_at_period_end
   - current_period_end
```

**目的**: プラン変更時にDBを同期

### Webhook署名検証 (lines 52-70)

```typescript
const webhookSecret = getWebhookSecret(ENVIRONMENT);

let event;
try {
  event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  console.log(`✅ [LIVE環境] Webhook署名検証成功: ${event.type}`);
} catch (err) {
  console.error(`❌ [LIVE環境] Webhook署名検証エラー: ${err.message}`);
  return new Response(JSON.stringify({ error: `Webhook署名検証エラー: ${err.message}` }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 400,
  });
}
```

**検証フロー**:
1. `stripe-signature` ヘッダー取得
2. `STRIPE_WEBHOOK_SECRET_[TEST|LIVE]` で署名検証
3. 検証失敗 → 400エラー返却

**問題**: 現在401エラーが発生中 (署名検証失敗の可能性)

---

## 🚨 最優先修正項目

### 1. Webhook 401エラーの根本原因特定と修正

**症状**:
- Stripe Webhook が 401 エラーを返す
- データベースが更新されない
- 二重課金が発生

**調査ポイント**:
1. Webhook署名検証の実装確認
2. 環境変数の設定確認
3. Stripe Dashboardの設定確認
4. Edge Function のログ確認

**関連ファイル**:
- `supabase/functions/stripe-webhook/index.ts`
- 環境変数設定

---

### 2. プラン変更時の古いプラン自動キャンセル

**現状**:
新しいプランが作成されても、古いプランがキャンセルされない

**必要な実装**:
```typescript
// Webhook内で
if (metadata.old_subscription_id) {
  await stripe.subscriptions.cancel(metadata.old_subscription_id);
}
```

---

### 3. 画面更新ロジックの見直し

**現状**:
決済完了後も画面が古い状態のまま

**必要な実装**:
- Webhook成功後、フロントエンドに通知
- または、ポーリングでサブスク状態を確認
- リアルタイム同期（Supabase Realtime）

---

## 📝 次のステップ

### ✅ Step 1 完了: 現状レポート作成 (本ドキュメント)

このレポートで把握した内容:
- ✅ アーキテクチャ全体像
- ✅ 全ファイル構成 (Frontend/Backend/Database)
- ✅ データベーススキーマ詳細
- ✅ 環境変数一覧
- ✅ Frontend実装詳細 (Realtime subscription含む)
- ✅ Webhook処理詳細
- ✅ データフロー分析
- ✅ Critical Issues の特定
- ✅ 最優先修正項目の明確化

---

### 🔄 Step 2 (並行作業中): UX定義を書く

**Takumiさんの作業**:

以下のファイルを確認・更新:

1. **flows.md** - ユーザーフロー定義
   - 新規プラン登録
   - プラン変更
   - キャンセル
   - 継続・更新

2. **requirements.md** - UX要件定義
   - 絶対に守るべきUX原則
   - パフォーマンス要件
   - エラーハンドリング要件

3. **edge-cases.md** - エッジケース定義
   - Webhook失敗時
   - 二重課金防止
   - ネットワークエラー時

4. **issues.md** - UX問題トラッキング
   - Critical/Medium/Low Issues
   - 優先度の確認

**確認事項**:
- ✅ UX要件に不足はないか？
- ✅ 新しいエッジケースはないか？
- ✅ 優先度は適切か？

---

### ⏭️ Step 3: 既存実装評価

**実施内容**:
- UX定義 (Step 2) と現状実装 (Step 1) を比較
- UX要件を満たしていない箇所を特定
- 実装の良い点・悪い点を評価

**成果物**: `implementation/specifications/implementation-evaluation.md`

---

### ⏭️ Step 4: 実装計画・実装

**実施内容**:
1. **Phase 2**: Webhook 401エラー修正計画作成
2. **Phase 3**: 計画レビュー
3. **Phase 4**: 実装
4. **Phase 5**: ドキュメント更新
5. **Phase 6**: 完了報告

**重点項目**:
- 🔴 Webhook 401エラー修正 (最優先)
- 🔴 二重課金防止の確実な実装
- 🔴 決済完了後の即座な画面更新
- 🟡 プラン変更確認ダイアログ
- 🟡 料金表示の改善

---

## 🎯 成功基準

### 完了の定義

**Critical Issues がすべて解決**:
- ✅ 二重課金が発生しない
- ✅ 決済完了後、即座に画面が更新される
- ✅ プラン変更時、古いプランが自動キャンセルされる
- ✅ Webhook 401エラーが解消される

**Medium/Low Issues の対応**:
- Critical解決後に順次対応

---

## 📚 参考ドキュメント

### 既存ドキュメント
- `docs/subscription/user-experience/flows.md`
- `docs/subscription/user-experience/requirements.md`
- `docs/subscription/user-experience/edge-cases.md`
- `docs/subscription/user-experience/issues.md`
- `docs/subscription/troubleshooting/error-database.md`

### Archive
- `docs/subscription/archive/` - 過去の調査・実装記録

---

**このレポートをもとに、Step 2 (UX定義) → Step 3 (既存実装評価) → Step 4 (実装計画・実装) へ進みます。**
