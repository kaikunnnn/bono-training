# キャンセル後のプレミアムコンテンツアクセス不可問題

**作成日**: 2025-11-26
**ステータス**: 🚨 CRITICAL - 未実装
**影響範囲**: すべてのキャンセルユーザー

---

## 📋 問題概要

サブスクリプションをキャンセルした直後に、ユーザーがプレミアムコンテンツへアクセスできなくなる。

**期待される動作**:
- キャンセル後も `current_period_end` (契約期間終了日) までプレミアムコンテンツにアクセス可能

**実際の動作**:
- キャンセル直後にプレミアムコンテンツへのアクセスが失われる

**発見経緯**:
Test 4 (キャンセルテスト) で発見 ([user-flow-test.md](../testing/user-flow-test.md) line 801-803)

```markdown
- [×] コンテンツにはキャンセル日まで引き続きアクセス可能
  - → 有料コンテンツは見れない状態でした。
  - 他のプランに登録し直してみると、メンバー限定のロックが外れている
```

---

## 🔍 原因分析

### 1. アクセス権限判定ロジックの問題

**ファイル**: `/supabase/functions/check-subscription/handlers.ts` (line 9-21)

```typescript
function calculateAccessPermissions(planType: string | null, isActive: boolean): {
  hasMemberAccess: boolean;
  hasLearningAccess: boolean
} {
  if (!isActive || !planType) {
    return { hasMemberAccess: false, hasLearningAccess: false };
  }

  // メンバーアクセス: すべての有料プラン
  const hasMemberAccess = ['standard', 'growth', 'community', 'feedback'].includes(planType);

  // 学習アクセス: standard, growth, feedback
  const hasLearningAccess = ['standard', 'growth', 'feedback'].includes(planType);

  return { hasMemberAccess, hasLearningAccess };
}
```

**問題点**:
- `isActive` が `false` の場合、即座に `hasMemberAccess = false` を返す
- `current_period_end` (契約期間終了日) をチェックしていない
- `cancel_at_period_end` フラグを考慮していない

### 2. データベースの状態

Test 4完了時の `user_subscriptions` テーブル:

```json
{
  "user_id": "e118477b-9d42-4d5c-80b9-ad66f73b6b02",
  "plan_type": "feedback",
  "duration": 1,
  "is_active": false,  // ← ここが問題
  "cancel_at_period_end": true,
  "current_period_end": "2025-12-26 07:26:59+00",
  "stripe_subscription_id": "sub_1SXGeNKUVUnt8GtyFkhIAVEB"
}
```

**期待される判定**:
```typescript
// 2025-11-26 時点では current_period_end (2025-12-26) までアクセス可能
if (
  is_active === true
  || (cancel_at_period_end === true && current_period_end > NOW())
) {
  // アクセス許可
}
```

### 3. is_active フラグの更新タイミング

#### 3.1 customer.subscription.updated イベント

**ファイル**: `/supabase/functions/stripe-webhook-test/index.ts` (line 422-527)

```typescript
async function handleSubscriptionUpdated(stripe: any, supabase: any, subscription: any) {
  // Line 496
  is_active: subscription.status === "active",
  cancel_at_period_end: cancelAtPeriodEnd,
  cancel_at: cancelAt,
  current_period_end: currentPeriodEnd,
}
```

**動作**:
- キャンセル時、Stripeの `subscription.status` は `"active"` のまま
- `cancel_at_period_end` が `true` になる
- `is_active` は `true` のまま維持されるはず

#### 3.2 customer.subscription.deleted イベント

**ファイル**: `/supabase/functions/stripe-webhook-test/index.ts` (line 366-417)

```typescript
async function handleSubscriptionDeleted(stripe: any, supabase: any, subscription: any) {
  // Line 398-406
  const { error: userSubError } = await supabase
    .from("user_subscriptions")
    .update({
      is_active: false,  // ← ここで false に設定
      plan_members: false,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId)
    .eq("environment", ENVIRONMENT);
}
```

**問題点**:
- `customer.subscription.deleted` イベントが発火すると即座に `is_active: false` に更新
- キャンセル時に即座にこのイベントが発火している可能性

### 4. Stripeの動作確認が必要

**仮説1**: キャンセル時に `customer.subscription.deleted` イベントが即座に発火
- Customer Portal で「キャンセル」ボタンを押した直後に発火
- `current_period_end` まで待たずに `is_active: false` になる

**仮説2**: Stripe側の設定問題
- Stripe Dashboardで即座削除の設定になっている可能性

**検証が必要**:
1. キャンセル時にどのWebhookイベントが発火するか確認
2. `customer.subscription.deleted` の発火タイミング確認
3. Stripeの`subscription.status`の遷移確認

---

## 🏗️ システムアーキテクチャ

### プレミアムコンテンツアクセス制御フロー

```
ユーザーがページアクセス
    ↓
useSubscription フックが起動
    ↓
checkSubscriptionStatus() 呼び出し
    ↓
check-subscription Edge Function へリクエスト
    ↓
handleAuthenticatedRequest() 実行
    ├─ ユーザー認証 (JWT検証)
    ├─ user_subscriptions テーブルクエリ
    └─ calculateAccessPermissions() 呼び出し ← ★ここで判定
        ├─ isActive === false → hasMemberAccess: false
        └─ isActive === true → planTypeで判定
    ↓
レスポンス返却 { hasMemberAccess, hasLearningAccess }
    ↓
useSubscription が状態更新
    ↓
SubscriptionContext が全アプリに提供
    ↓
VideoSection コンポーネント
    ├─ isPremium && !canAccessContent() → ロック画面表示
    └─ それ以外 → 動画再生
```

### 関連ファイル一覧

| ファイル | 役割 | 問題との関連 |
|---------|------|------------|
| `/supabase/functions/check-subscription/handlers.ts` | アクセス権限計算 | ⚠️ **修正必要** - Line 9-21 |
| `/supabase/functions/stripe-webhook-test/index.ts` | Webhook処理 | ⚠️ **確認必要** - Line 366-417, 422-527 |
| `/src/hooks/useSubscription.ts` | サブスクリプション状態管理 | 動作正常 |
| `/src/components/article/VideoSection.tsx` | ビデオロック表示 | 動作正常 |
| `/src/utils/premiumAccess.ts` | アクセス判定ロジック | 動作正常 |
| `/src/contexts/SubscriptionContext.tsx` | グローバル状態管理 | 動作正常 |

---

## 💡 解決策の方向性

### Option 1: calculateAccessPermissions の修正 (推奨)

**修正箇所**: `/supabase/functions/check-subscription/handlers.ts`

**現在のロジック**:
```typescript
function calculateAccessPermissions(planType: string | null, isActive: boolean) {
  if (!isActive || !planType) {
    return { hasMemberAccess: false, hasLearningAccess: false };
  }
  // ...
}
```

**修正後のロジック**:
```typescript
function calculateAccessPermissions(
  planType: string | null,
  isActive: boolean,
  cancelAtPeriodEnd: boolean,
  currentPeriodEnd: string | null
) {
  // プランタイプがない場合はアクセス不可
  if (!planType) {
    return { hasMemberAccess: false, hasLearningAccess: false };
  }

  // アクティブな場合はアクセス可能
  if (isActive) {
    return calculateByPlanType(planType);
  }

  // キャンセル済みでも期間内ならアクセス可能
  if (cancelAtPeriodEnd && currentPeriodEnd) {
    const periodEnd = new Date(currentPeriodEnd);
    const now = new Date();

    if (periodEnd > now) {
      return calculateByPlanType(planType);  // 期間内はアクセス可能
    }
  }

  // それ以外はアクセス不可
  return { hasMemberAccess: false, hasLearningAccess: false };
}

function calculateByPlanType(planType: string) {
  const hasMemberAccess = ['standard', 'growth', 'community', 'feedback'].includes(planType);
  const hasLearningAccess = ['standard', 'growth', 'feedback'].includes(planType);
  return { hasMemberAccess, hasLearningAccess };
}
```

**メリット**:
- Edge Functionだけの修正で済む
- フロントエンド側の変更不要
- データベーススキーマ変更不要

**デメリット**:
- なし

### Option 2: customer.subscription.deleted の処理変更

**修正箇所**: `/supabase/functions/stripe-webhook-test/index.ts` Line 366-417

**現在のロジック**:
```typescript
async function handleSubscriptionDeleted(stripe: any, supabase: any, subscription: any) {
  const { error: userSubError } = await supabase
    .from("user_subscriptions")
    .update({
      is_active: false,
      plan_members: false,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId)
    .eq("environment", ENVIRONMENT);
}
```

**修正後のロジック**:
```typescript
async function handleSubscriptionDeleted(stripe: any, supabase: any, subscription: any) {
  // current_period_end まではアクティブを維持
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : new Date();

  const now = new Date();
  const shouldDeactivate = currentPeriodEnd <= now;

  const { error: userSubError } = await supabase
    .from("user_subscriptions")
    .update({
      is_active: !shouldDeactivate,  // 期間内はtrueを維持
      plan_members: !shouldDeactivate,
      cancel_at_period_end: true,
      cancel_at: currentPeriodEnd.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId)
    .eq("environment", ENVIRONMENT);
}
```

**メリット**:
- Webhook時点で正しい状態を保存できる

**デメリット**:
- `customer.subscription.deleted` の発火タイミング次第では効果がない
- Option 1 との併用が望ましい

---

## 🎯 実装計画 (次ステップ)

### Phase 1: 原因の最終確認

1. ✅ 現状実装の調査完了
2. ✅ 原因特定完了
3. ⏳ **Webhookログの確認** (次)
   - Test 4実施時のWebhookイベント順序を確認
   - `customer.subscription.updated` と `customer.subscription.deleted` の発火タイミング確認

### Phase 2: 実装

1. `calculateAccessPermissions` 関数の修正
   - `cancelAtPeriodEnd` と `currentPeriodEnd` パラメータ追加
   - 期間内判定ロジック追加
2. `handleAuthenticatedRequest` の修正
   - `calculateAccessPermissions` 呼び出しに追加パラメータを渡す
3. `handleSubscriptionDeleted` の修正 (Optional)
   - 期間内は `is_active: true` を維持

### Phase 3: テスト

1. Test 4 (キャンセル) 再実施
   - キャンセル直後にプレミアムコンテンツアクセス確認
   - `current_period_end` 以降にアクセス拒否確認
2. エッジケーステスト
   - `current_period_end` 直前のアクセス
   - `current_period_end` 直後のアクセス
   - 再登録後のアクセス

### Phase 4: ドキュメント更新

1. `subscription/specifications/system-specification.md` にキャンセル後アクセス仕様を追加
2. `subscription/testing/user-flow-test.md` の Test 4 結果を更新

---

## 📊 影響範囲

### 影響を受けるユーザー

- キャンセルしたすべてのユーザー
- 期間内にもかかわらずプレミアムコンテンツにアクセスできない

### 影響を受けるコンポーネント

| コンポーネント | 影響 | 修正必要 |
|--------------|------|---------|
| `check-subscription` Edge Function | ⚠️ HIGH | ✅ 必須 |
| `stripe-webhook-test` Edge Function | ⚠️ MEDIUM | 🔄 推奨 |
| `useSubscription` フック | ✅ 正常 | ❌ 不要 |
| `VideoSection` | ✅ 正常 | ❌ 不要 |
| `ContentGuard` | ✅ 正常 | ❌ 不要 |

---

## 🔗 関連ドキュメント

- [user-flow-test.md](../testing/user-flow-test.md) - Test 4でこの問題を発見
- [system-specification.md](../specifications/system-specification.md) - サブスクリプションシステム仕様
- [premium-content-access.md](../specifications/premium-content-access.md) - プレミアムコンテンツアクセス制御仕様

---

## 🔄 実装状況 (2025-11-26)

### ✅ Phase 1: 完了
- Webhook処理の調査完了
- 原因特定: `calculateAccessPermissions` 関数が `cancel_at_period_end` を考慮していない

### ✅ Phase 2: 完了
- `calculateAccessPermissions` 関数を修正
- `calculateByPlanType` ヘルパー関数を追加
- 新しいパラメータ追加: `cancelAtPeriodEnd`, `currentPeriodEnd`
- 呼び出し側4箇所を修正

### ✅ Phase 3.1: 完了
- check-subscription Edge Function を本番環境にデプロイ完了

### ⚠️ Phase 3.2: テスト中に新たな問題発見

**問題**: Test 4 再テスト時に、Feedbackプラン（Growthプラン）でアクセス不可

**原因**: `plan_type` が `"standard"` として保存されている（本来は `"growth"` であるべき）

**詳細**: [plan-type-detection-issue.md](./plan-type-detection-issue.md) 参照

**現在の対応**:
- ✅ 一時的にデータベースを手動修正（`plan_type: "growth"` に変更）
- ⏳ 根本原因（Webhook処理）の調査・修正が必要

### ⏳ 残タスク

1. **plan_type 判定問題の根本解決** (優先度: HIGH)
   - Webhook処理の調査・修正
   - 既存ユーザーの一括修正

2. **Phase 3.2-3.4: テスト完了**
   - 手動修正後の動作確認
   - エッジケーステスト
   - 回帰テスト (Test 1-5)

3. **Phase 4: ドキュメント更新**
   - system-specification.md にキャンセル後アクセス仕様を追加
   - user-flow-test.md の Test 4 結果を最終更新

---

**作成者**: AI開発チーム
**最終更新**: 2025-11-26
**ステータス**: 実装完了（デプロイ済み）/ テスト中に新たな問題発見
**次のアクション**: plan_type 判定問題の根本解決
