# サブスクリプションシステム - 開発者向けガイド

**作成日**: 2025-11-27
**最終更新**: 2025-11-27
**対象**: このシステムを保守・拡張する開発者

---

## 📖 目次

1. [システム概要](#システム概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [重要な設定値](#重要な設定値)
4. [⚠️ 変更禁止事項](#変更禁止事項)
5. [コンポーネント詳細](#コンポーネント詳細)
6. [トラブルシューティング](#トラブルシューティング)
7. [よくある質問](#よくある質問)

---

## システム概要

### 目的
ユーザーのStripeサブスクリプション状態を管理し、プレミアムコンテンツへのアクセスを制御する。

### 主要機能
1. **サブスクリプション登録**: Stripe Checkoutを使用
2. **プラン管理**: Standard/Feedbackプラン × 1ヶ月/3ヶ月
3. **アクセス制御**: プレミアムコンテンツの表示/非表示
4. **Webhook処理**: Stripeイベントの自動同期

### サポートプラン

| プラン名 | 価格 | Stripe Price ID | plan_type | duration |
|---------|------|-----------------|-----------|----------|
| Standardプラン 1ヶ月 | ¥5,000/月 | `price_1RStBiKUVUnt8GtynMfKweby` | `standard` | `1` |
| Standardプラン 3ヶ月 | ¥14,000/3ヶ月 | `price_1RStCiKUVUnt8GtyKJiieo6d` | `standard` | `3` |
| Feedbackプラン 1ヶ月 | ¥9,999/月 | `price_1OIiMRKUVUnt8GtyMGSJIH8H` | `feedback` | `1` |
| Feedbackプラン 3ヶ月 | ¥27,000/3ヶ月 | `price_1OIiMRKUVUnt8GtyttXJ71Hz` | `feedback` | `3` |

---

## アーキテクチャ

### システム全体図

```
┌─────────────┐
│   Stripe    │
│  Dashboard  │
└──────┬──────┘
       │ Webhook Events
       │ (subscription.created, updated, deleted)
       ↓
┌─────────────────────────────────────┐
│  Supabase Edge Function             │
│  stripe-webhook-test                │
│  ├─ Webhookイベント受信             │
│  ├─ Price ID → plan_type マッピング │
│  └─ user_subscriptions テーブル更新 │
└──────────────┬──────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│  Database: user_subscriptions        │
│  ├─ user_id                          │
│  ├─ plan_type (standard/feedback)    │
│  ├─ duration (1/3)                   │
│  ├─ is_active                        │
│  ├─ stripe_subscription_id           │
│  ├─ cancel_at_period_end             │
│  └─ current_period_end               │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│  Supabase Edge Function              │
│  check-subscription                  │
│  ├─ ユーザー認証                     │
│  ├─ サブスクリプション状態取得       │
│  └─ アクセス権限計算                 │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│  Frontend (React)                    │
│  ├─ useSubscription フック           │
│  ├─ premiumAccess.ts (アクセス判定)  │
│  └─ UI表示制御 (鍵マーク/動画)       │
└──────────────────────────────────────┘
```

### データフロー

#### 1. 新規登録フロー
```
1. ユーザーが「プランを見る」ボタンをクリック
2. Stripe Checkoutページへリダイレクト
3. ユーザーが支払い情報を入力
4. Stripeが subscription.created Webhookを送信
5. stripe-webhook-test が受信
6. Price IDから plan_type と duration を判定
7. user_subscriptions テーブルに保存
8. ユーザーがサクセスページに戻る
9. check-subscription APIを呼び出し
10. プレミアムコンテンツへのアクセス許可
```

#### 2. コンテンツアクセスフロー
```
1. ユーザーがプレミアムページにアクセス
2. useSubscription フックが check-subscription を呼び出し
3. Edge Functionがデータベースから状態を取得
4. アクセス権限を計算 (hasMemberAccess, hasLearningAccess)
5. premiumAccess.ts が canAccessContent() を実行
6. UI表示を制御 (鍵マーク or 動画プレイヤー)
```

---

## 重要な設定値

### 1. Price ID マッピング

**場所**: `supabase/functions/stripe-webhook-test/index.ts`

```typescript
const PRICE_ID_TO_PLAN: Record<string, { planType: string; duration: number }> = {
  'price_1RStBiKUVUnt8GtynMfKweby': { planType: 'standard', duration: 1 },
  'price_1RStCiKUVUnt8GtyKJiieo6d': { planType: 'standard', duration: 3 },
  'price_1OIiMRKUVUnt8GtyMGSJIH8H': { planType: 'feedback', duration: 1 },
  'price_1OIiMRKUVUnt8GtyttXJ71Hz': { planType: 'feedback', duration: 3 },
};
```

### 2. プランタイプ定義

**場所**: `src/utils/subscriptionPlans.ts`

```typescript
export type PlanType = 'standard' | 'feedback' | 'growth' | 'community';
```

### 3. アクセス権限ルール

**場所**: `supabase/functions/check-subscription/handlers.ts`

```typescript
function calculateByPlanType(planType: string) {
  // メンバーアクセス: すべての有料プラン
  const hasMemberAccess = ['standard', 'growth', 'community', 'feedback'].includes(planType);

  // 学習アクセス: standard, growth, feedback
  const hasLearningAccess = ['standard', 'growth', 'feedback'].includes(planType);

  return { hasMemberAccess, hasLearningAccess };
}
```

### 4. プレミアムアクセス判定

**場所**: `src/utils/premiumAccess.ts`

```typescript
export const canAccessContent = (
  isPremium: boolean,
  planType: PlanType | null
): boolean => {
  if (!isPremium) return true;

  return planType === 'standard' ||
         planType === 'growth' ||
         planType === 'community' ||
         planType === 'feedback';
};
```

---

## ⚠️ 変更禁止事項

### 🚨 絶対に変更してはいけないもの

#### 1. Price ID マッピング
**場所**: `supabase/functions/stripe-webhook-test/index.ts`

```typescript
// ❌ 絶対に削除・変更しないこと
const PRICE_ID_TO_PLAN: Record<string, { planType: string; duration: number }> = {
  'price_1OIiMRKUVUnt8GtyMGSJIH8H': { planType: 'feedback', duration: 1 },
  // ...
};
```

**理由**:
- 既存ユーザーのサブスクリプションが壊れる
- 過去のStripe Webhookが処理できなくなる

**新プラン追加時の正しい方法**:
```typescript
// ✅ 既存エントリは残して、新規追加のみ
const PRICE_ID_TO_PLAN: Record<string, { planType: string; duration: number }> = {
  // 既存のPrice ID（削除しない）
  'price_1OIiMRKUVUnt8GtyMGSJIH8H': { planType: 'feedback', duration: 1 },
  'price_1RStBiKUVUnt8GtynMfKweby': { planType: 'standard', duration: 1 },

  // ✅ 新規プランを追加
  'price_NEW_PLAN_ID_HERE': { planType: 'premium', duration: 12 },
};
```

#### 2. premiumAccess.ts のプランリスト

**場所**: `src/utils/premiumAccess.ts`

```typescript
// ❌ 'feedback' を削除しないこと
return planType === 'standard' ||
       planType === 'growth' ||
       planType === 'community' ||
       planType === 'feedback';  // ← これを削除すると既存ユーザーがアクセス不可に
```

**理由**:
- 'feedback' を削除すると、Feedbackプランユーザーがコンテンツにアクセスできなくなる
- 過去のバグ(.claude/docs/subscription/issues/premium-access-bug.md)が再発

**新プラン追加時の正しい方法**:
```typescript
// ✅ 既存プランは残して、新規追加
return planType === 'standard' ||
       planType === 'growth' ||
       planType === 'community' ||
       planType === 'feedback' ||
       planType === 'premium';  // ← 新規プラン追加
```

#### 3. データベーススキーマ

**テーブル**: `user_subscriptions`

```sql
-- ❌ 以下のカラムを削除・型変更しないこと
- user_id (uuid)
- plan_type (text)
- duration (integer)
- is_active (boolean)
- stripe_subscription_id (text)
- cancel_at_period_end (boolean)
- current_period_end (timestamp with time zone)
```

**理由**:
- Edge Functionが動作しなくなる
- 既存データが読めなくなる

### ⚠️ 注意が必要な変更

#### 1. アクセス権限ルールの変更

**場所**: `supabase/functions/check-subscription/handlers.ts`

```typescript
// ⚠️ 変更時は必ず全プランでテストが必要
function calculateByPlanType(planType: string) {
  const hasMemberAccess = ['standard', 'growth', 'community', 'feedback'].includes(planType);
  const hasLearningAccess = ['standard', 'growth', 'feedback'].includes(planType);
  return { hasMemberAccess, hasLearningAccess };
}
```

**変更時の手順**:
1. `.claude/docs/subscription/testing/comprehensive-test-plan.md` の全テストを実施
2. 既存ユーザーへの影響を確認
3. ロールバック手順を準備

#### 2. Stripe Webhook URLの変更

**現在のURL**: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook-test`

**変更時の手順**:
1. 新しいEdge Functionをデプロイ
2. Stripe Dashboardで新しいWebhook URLを追加（既存は削除しない）
3. 新URLで動作確認
4. 問題なければ古いURLを削除

---

## コンポーネント詳細

### 1. stripe-webhook-test Edge Function

**ファイル**: `supabase/functions/stripe-webhook-test/index.ts`

**役割**:
- Stripeからのwebhookイベントを受信
- Price IDからプラン情報を判定
- user_subscriptions テーブルを更新

**処理するイベント**:
- `customer.subscription.created`: 新規登録
- `customer.subscription.updated`: プラン変更
- `customer.subscription.deleted`: キャンセル

**主要な関数**:
```typescript
// Price IDからプラン情報を取得
function getPlanInfoFromPriceId(priceId: string): { planType: string; duration: number } | null

// サブスクリプションの更新・作成を処理
async function upsertSubscription(...)
```

### 2. check-subscription Edge Function

**ファイル**: `supabase/functions/check-subscription/handlers.ts`

**役割**:
- ユーザー認証
- サブスクリプション状態の取得
- アクセス権限の計算

**レスポンス形式**:
```typescript
{
  subscribed: boolean,
  planType: string | null,
  duration: number | null,
  isSubscribed: boolean,
  cancelAtPeriodEnd: boolean,
  cancelAt: string | null,
  renewalDate: string | null,
  hasMemberAccess: boolean,
  hasLearningAccess: boolean
}
```

**主要な関数**:
```typescript
// プランタイプからアクセス権限を計算
function calculateByPlanType(planType: string)

// キャンセル済みでも期間内ならアクセス許可
function calculateAccessPermissions(...)
```

### 3. useSubscription フック

**ファイル**: `src/hooks/useSubscription.ts`

**役割**:
- check-subscription APIの呼び出し
- サブスクリプション状態の管理
- コンソールログ出力（デバッグ用）

**使用例**:
```typescript
const { isSubscribed, planType, hasMemberAccess, hasLearningAccess } = useSubscription();

if (hasLearningAccess) {
  // プレミアムコンテンツを表示
}
```

### 4. premiumAccess.ts

**ファイル**: `src/utils/premiumAccess.ts`

**役割**:
- コンテンツがプレミアムかどうかの判定
- ユーザーがアクセス可能かの判定

**主要な関数**:
```typescript
// コンテンツへのアクセス可否を判定
export const canAccessContent = (isPremium: boolean, planType: PlanType | null): boolean

// コンテンツがロックされているか判定
export const isContentLocked = (isPremium: boolean, planType: PlanType | null): boolean
```

---

## トラブルシューティング

### 問題1: ユーザーが登録したのにコンテンツにアクセスできない

**確認手順**:

1. **データベース確認**
   ```sql
   SELECT * FROM user_subscriptions
   WHERE user_id = '[user_id]';
   ```

   **期待値**: `is_active: true`, `plan_type` が設定されている

2. **check-subscription API確認**
   - ブラウザConsoleを開く
   - 以下のログを確認:
     ```javascript
     購読状態確認結果: {
       subscribed: true,
       planType: 'feedback',
       hasMemberAccess: true,
       hasLearningAccess: true
     }
     ```

3. **premiumAccess.ts 確認**
   - `src/utils/premiumAccess.ts` を開く
   - `canAccessContent()` に該当プランタイプが含まれているか確認

**よくある原因**:
- ❌ `premiumAccess.ts` から該当プランタイプが抜けている
  - 修正: プランタイプを追加（[過去のバグ事例](.claude/docs/subscription/issues/premium-access-bug.md)参照）
- ❌ Stripe WebhookがSupabaseに届いていない
  - 修正: Stripe Dashboardでwebhook設定を確認

### 問題2: プラン変更が反映されない

**確認手順**:

1. **Stripe Webhookログ確認**
   ```bash
   # Edge Functionログ確認
   supabase functions logs stripe-webhook-test
   ```

2. **データベース確認**
   ```sql
   SELECT plan_type, duration, updated_at
   FROM user_subscriptions
   WHERE user_id = '[user_id]';
   ```

   **期待値**: `updated_at` が最近の日時、`plan_type`/`duration` が新プラン

**よくある原因**:
- ❌ `subscription.updated` Webhookが処理されていない
  - 修正: Stripe DashboardでWebhook設定を確認
- ❌ Price IDマッピングに新プランが登録されていない
  - 修正: `stripe-webhook-test/index.ts` の `PRICE_ID_TO_PLAN` に追加

### 問題3: キャンセル後もすぐにアクセスが切れてしまう

**確認手順**:

1. **データベース確認**
   ```sql
   SELECT is_active, cancel_at_period_end, current_period_end
   FROM user_subscriptions
   WHERE user_id = '[user_id]';
   ```

   **期待値**:
   - `is_active: true`（期間内）
   - `cancel_at_period_end: true`
   - `current_period_end` が未来の日時

2. **check-subscription レスポンス確認**
   ```javascript
   {
     subscribed: true,  // ← 期間内なのでtrue
     cancelAtPeriodEnd: true,
     hasMemberAccess: true  // ← 期間内はアクセス可能
   }
   ```

**よくある原因**:
- ❌ `calculateAccessPermissions()` の実装ミス
  - 修正: `handlers.ts:23-52` の実装を確認
  - 期間内（`current_period_end > now`）ならアクセス許可すべき

### 問題4: Edge Functionがデプロイできない

**エラー例**:
```
Error: Failed to deploy function
```

**確認手順**:

1. **Supabase CLI バージョン確認**
   ```bash
   supabase --version
   # 最新版にアップデート
   npm install -g supabase
   ```

2. **環境変数確認**
   ```bash
   # Stripe Secret Key が設定されているか
   supabase secrets list
   ```

3. **構文エラー確認**
   ```bash
   # TypeScriptコンパイルエラーチェック
   cd supabase/functions/stripe-webhook-test
   deno check index.ts
   ```

**よくある原因**:
- ❌ Stripe Secret Keyが設定されていない
  - 修正: `supabase secrets set STRIPE_SECRET_KEY=sk_...`
- ❌ TypeScript構文エラー
  - 修正: エディタのエラー表示を確認

---

## よくある質問

### Q1: 新しいプランを追加したい

**手順**:

1. **Stripe Dashboardで新プラン作成**
   - Product作成
   - Price作成（Price IDをメモ）

2. **Price IDマッピング追加**
   - ファイル: `supabase/functions/stripe-webhook-test/index.ts`
   ```typescript
   const PRICE_ID_TO_PLAN: Record<string, { planType: string; duration: number }> = {
     // 既存エントリ（削除しない）
     'price_1RStBiKUVUnt8GtynMfKweby': { planType: 'standard', duration: 1 },

     // ✅ 新規プラン追加
     'price_NEW_ID': { planType: 'premium', duration: 12 },
   };
   ```

3. **PlanType追加**（必要に応じて）
   - ファイル: `src/utils/subscriptionPlans.ts`
   ```typescript
   export type PlanType = 'standard' | 'feedback' | 'growth' | 'community' | 'premium';
   ```

4. **アクセス権限ルール更新**
   - ファイル: `supabase/functions/check-subscription/handlers.ts`
   ```typescript
   const hasMemberAccess = ['standard', 'growth', 'community', 'feedback', 'premium'].includes(planType);
   ```

5. **premiumAccess.ts 更新**
   - ファイル: `src/utils/premiumAccess.ts`
   ```typescript
   return planType === 'standard' ||
          planType === 'growth' ||
          planType === 'community' ||
          planType === 'feedback' ||
          planType === 'premium';  // ← 追加
   ```

6. **テスト実施**
   - `.claude/docs/subscription/testing/comprehensive-test-plan.md` に従ってテスト

### Q2: プランの価格を変更したい

**⚠️ 注意**: 既存ユーザーのサブスクリプションには影響しない

**手順**:

1. **Stripe Dashboardで新しいPriceを作成**
   - 既存のPriceは非アクティブ化（削除しない）
   - 新しいPriceを作成（新Price ID発行）

2. **Price IDマッピング追加**
   ```typescript
   const PRICE_ID_TO_PLAN: Record<string, { planType: string; duration: number }> = {
     // 旧Price ID（既存ユーザー用に残す）
     'price_OLD_ID': { planType: 'standard', duration: 1 },

     // 新Price ID（新規ユーザー用）
     'price_NEW_ID': { planType: 'standard', duration: 1 },
   };
   ```

3. **フロントエンドのPrice ID更新**
   - チェックアウトページで使用するPrice IDを新IDに変更

### Q3: Stripe Webhookが届かない

**確認手順**:

1. **Stripe Dashboardで確認**
   - Developers → Webhooks → イベント履歴
   - エラーが出ていないか確認

2. **Webhook URLが正しいか確認**
   - 現在のURL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook-test`
   - Stripe Dashboardの設定と一致しているか

3. **Webhook署名検証が正しいか確認**
   - `STRIPE_WEBHOOK_SECRET` が正しく設定されているか
   ```bash
   supabase secrets list
   ```

4. **Edge Functionログ確認**
   ```bash
   supabase functions logs stripe-webhook-test
   ```

### Q4: ローカル開発環境でテストしたい

**手順**:

1. **Supabase ローカル起動**
   ```bash
   supabase start
   ```

2. **Edge Functionをローカルで実行**
   ```bash
   supabase functions serve stripe-webhook-test --env-file .env.local
   ```

3. **Stripe CLIでWebhookをフォワード**
   ```bash
   stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook-test
   ```

4. **テストイベント送信**
   ```bash
   stripe trigger customer.subscription.created
   ```

### Q5: ユーザーのサブスクリプション状態を手動で変更したい

**⚠️ 注意**: データベースを直接変更すると、Stripeとの不整合が発生する可能性あり

**推奨方法**: Stripe Dashboard上で変更（自動的にWebhookが発火）

**緊急時のみ**: SQLで直接変更
```sql
-- ⚠️ 緊急時のみ使用
UPDATE user_subscriptions
SET is_active = true,
    plan_type = 'standard',
    duration = 1
WHERE user_id = '[user_id]';
```

**変更後**: ユーザーに再ログインしてもらう、またはキャッシュクリア

---

## 参考ドキュメント

- [包括的テスト計画](.claude/docs/subscription/testing/comprehensive-test-plan.md)
- [プレミアムアクセスバグ事例](.claude/docs/subscription/issues/premium-access-bug.md)
- [Stripe Webhook 公式ドキュメント](https://stripe.com/docs/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**作成者**: AI開発チーム
**最終更新**: 2025-11-27
