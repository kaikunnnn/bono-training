# 'community' プランバグの完全な根本原因分析

**日付**: 2025-11-30
**重大度**: 🔴 Critical
**ステータス**: 🔄 分析完了・修正プラン提示中

---

## 📊 Executive Summary

kyasya00@gmail.com のユーザーが「スタンダードプラン（1ヶ月）」を購入したにも関わらず、データベースに `plan_type='community'` として保存された問題について、**完全な根本原因分析**を実施しました。

結論: **表面的なバグではなく、システム設計レベルの複数の欠陥が重なって発生**していました。

---

## 🔍 根本原因（Root Causes）

### Root Cause 1: 無効な 'community' プランタイプがデフォルト値として使用されていた

**問題**: PlanType型定義には `'standard' | 'feedback'` の2種類しか存在しないにも関わらず、6箇所で `'community'` がデフォルト値として設定されていた。

**影響範囲**:
1. `src/services/stripe.ts:14` - createCheckoutSession関数のデフォルト引数
2. `supabase/functions/create-checkout/index.ts:36` - **最重要**（Checkoutセッション作成時のデフォルト）
3. `supabase/functions/stripe-webhook/index.ts:280` - checkout.session.completed ハンドラーのフォールバック
4. `supabase/functions/stripe-webhook/index.ts:460` - invoice.paid ハンドラーのフォールバック
5. `supabase/functions/stripe-webhook/index.ts:672` - customer.subscription.updated ハンドラーのフォールバック
6. `src/pages/Training/Plan.tsx:49, 77` - Trainingページのハードコード値

**なぜ発生したか**:
- 過去に 'community' プランが存在していた可能性
- PlanType型定義変更時に、全ての参照箇所を更新しなかった
- TypeScriptの型チェックが文字列リテラルと `as const` によって回避された

**修正済み**: ✅ 全6箇所で 'community' → 'standard' に変更

---

### Root Cause 2: 🚨 Webhook がTEST環境でLIVE環境変数を読み込んでいた

**問題**: `invoice.paid` と `customer.subscription.updated` の2つのWebhookハンドラーが、環境（TEST/LIVE）を無視して常にLIVE環境変数を読み込んでいた。

**該当コード**:

#### invoice.paid ハンドラー (stripe-webhook/index.ts:438-441)
```typescript
// ❌ 常にLIVE環境変数を読み込む
const STANDARD_1M = Deno.env.get("STRIPE_STANDARD_1M_PRICE_ID");
const STANDARD_3M = Deno.env.get("STRIPE_STANDARD_3M_PRICE_ID");
const FEEDBACK_1M = Deno.env.get("STRIPE_FEEDBACK_1M_PRICE_ID");
const FEEDBACK_3M = Deno.env.get("STRIPE_FEEDBACK_3M_PRICE_ID");
```

#### customer.subscription.updated ハンドラー (stripe-webhook/index.ts:653-656)
```typescript
// ❌ 常にLIVE環境変数を読み込む
const STANDARD_1M = Deno.env.get("STRIPE_STANDARD_1M_PRICE_ID");
const STANDARD_3M = Deno.env.get("STRIPE_STANDARD_3M_PRICE_ID");
const FEEDBACK_1M = Deno.env.get("STRIPE_FEEDBACK_1M_PRICE_ID");
const FEEDBACK_3M = Deno.env.get("STRIPE_FEEDBACK_3M_PRICE_ID");
```

**実際の環境変数（.env）**:
```bash
# TEST環境用（定義されている）
STRIPE_TEST_STANDARD_1M_PRICE_ID=price_1OIiOUKUVUnt8GtyOfXEoEvW
STRIPE_TEST_STANDARD_3M_PRICE_ID=price_1OIiPpKUVUnt8Gty0OH3Pyip
STRIPE_TEST_FEEDBACK_1M_PRICE_ID=price_1OIiMRKUVUnt8GtyMGSJIH8H
STRIPE_TEST_FEEDBACK_3M_PRICE_ID=price_1OIiMRKUVUnt8GtyttXJ71Hz

# LIVE環境用（定義されていない！）
STRIPE_STANDARD_1M_PRICE_ID=（未定義）
STRIPE_STANDARD_3M_PRICE_ID=（未定義）
STRIPE_FEEDBACK_1M_PRICE_ID=（未定義）
STRIPE_FEEDBACK_3M_PRICE_ID=（未定義）
```

**影響**:
- TEST環境では、全てのPrice ID マッチングが失敗する
- 全てのWebhookイベント（invoice.paid, customer.subscription.updated）でフォールバック処理が発動する
- フォールバック処理で `planType = "community"` が設定される（Root Cause 1と連鎖）

**なぜ発生したか**:
- checkout.session.completed ハンドラー（正しい実装）では metadata を使用
- invoice.paid と customer.subscription.updated ハンドラー（誤った実装）では Price ID マッチングを使用
- 環境変数の命名規則（`STRIPE_TEST_*` vs `STRIPE_*`）を考慮せずに実装された

**修正未完**: ❌ この問題はまだ修正されていない

---

### Root Cause 3: 'community' プランタイプへの依存が残存

**問題**: PlanType型定義から削除されたにも関わらず、`determineMembershipAccess` 関数で 'community' プランタイプへの参照が残っている。

**該当コード** (stripe-webhook/index.ts:22):
```typescript
function determineMembershipAccess(planType: string, amount?: number): boolean {
  // コミュニティプランは常にメンバーアクセス権あり
  if (planType === "community") {  // ❌ 無効なプランタイプ
    return true;
  }
  // ...
}
```

**影響**:
- 現在は直接的な悪影響はないが、'community' が有効なプランとして扱われる余地を残している
- コードの一貫性が損なわれている

**修正未完**: ❌ この問題はまだ修正されていない

---

## 🎯 影響範囲分析

### 影響を受けるプラン

| プラン | TEST環境 | LIVE環境 |
|--------|----------|----------|
| standard (1ヶ月) | ❌ 影響あり | ❌ 影響あり（未確認） |
| standard (3ヶ月) | ❌ 影響あり | ❌ 影響あり（未確認） |
| feedback (1ヶ月) | ❌ 影響あり | ❌ 影響あり（未確認） |
| feedback (3ヶ月) | ❌ 影響あり | ❌ 影響あり（未確認） |

**結論**: 全てのプランがTEST環境で影響を受けており、LIVE環境も同様の問題を抱えている可能性が高い。

### 影響を受けるWebhookイベント

1. ✅ **checkout.session.completed** - 影響なし（metadata使用、正しい実装）
2. ❌ **invoice.paid** - 影響あり（Price IDマッチング失敗）
3. ❌ **customer.subscription.updated** - 影響あり（Price IDマッチング失敗）

---

## 📋 完全な修正プラン

### Phase 1: 完了済み（✅）

#### 1-1. 'community' デフォルト値の全修正（6箇所）

- ✅ create-checkout/index.ts:36
- ✅ stripe-webhook/index.ts:280
- ✅ stripe-webhook/index.ts:460
- ✅ stripe-webhook/index.ts:672
- ✅ stripe.ts:14
- ✅ Training/Plan.tsx:49, 77

**修正内容**: `'community'` → `'standard'`

### Phase 2: 環境変数の動的読み込み修正（❌ 未実施）

#### 2-1. stripe-webhook/index.ts の修正

**対象箇所**:
- Lines 438-441 (invoice.paid ハンドラー)
- Lines 653-656 (customer.subscription.updated ハンドラー)

**修正方針**:
```typescript
// ❌ BEFORE: 常にLIVE環境変数を読み込む
const STANDARD_1M = Deno.env.get("STRIPE_STANDARD_1M_PRICE_ID");
const STANDARD_3M = Deno.env.get("STRIPE_STANDARD_3M_PRICE_ID");
const FEEDBACK_1M = Deno.env.get("STRIPE_FEEDBACK_1M_PRICE_ID");
const FEEDBACK_3M = Deno.env.get("STRIPE_FEEDBACK_3M_PRICE_ID");

// ✅ AFTER: 環境に応じて適切な環境変数を読み込む
const envPrefix = ENVIRONMENT === 'test' ? 'STRIPE_TEST_' : 'STRIPE_';
const STANDARD_1M = Deno.env.get(`${envPrefix}STANDARD_1M_PRICE_ID`);
const STANDARD_3M = Deno.env.get(`${envPrefix}STANDARD_3M_PRICE_ID`);
const FEEDBACK_1M = Deno.env.get(`${envPrefix}FEEDBACK_1M_PRICE_ID`);
const FEEDBACK_3M = Deno.env.get(`${envPrefix}FEEDBACK_3M_PRICE_ID`);
```

**実装箇所**: 2箇所
1. invoice.paid ハンドラー（Lines 438-441）
2. customer.subscription.updated ハンドラー（Lines 653-656）

### Phase 3: 'community' プランタイプ参照の削除（❌ 未実施）

#### 3-1. determineMembershipAccess 関数の修正

**対象箇所**: stripe-webhook/index.ts:20-31

**修正方針**:
```typescript
// ❌ BEFORE
function determineMembershipAccess(planType: string, amount?: number): boolean {
  // コミュニティプランは常にメンバーアクセス権あり
  if (planType === "community") {
    return true;
  } else if (planType === "standard" || planType === "growth") {
    return true;
  } else if (amount) {
    // プランタイプが不明な場合は金額で判断（1000円以上）
    return amount >= 1000;
  }
  return false;
}

// ✅ AFTER
function determineMembershipAccess(planType: string, amount?: number): boolean {
  // standardとfeedbackプランはメンバーアクセス権あり
  if (planType === "standard" || planType === "feedback") {
    return true;
  } else if (amount) {
    // プランタイプが不明な場合は金額で判断（1000円以上）
    return amount >= 1000;
  }
  return false;
}
```

**注**: 'growth' も無効なプランタイプのため削除

---

## 🧪 テストプラン

### Phase 2修正後のテスト

#### Test 2-1: TEST環境でのStandard Plan購入（1ヶ月）
- ユーザー: kyasya00@gmail.com
- 期待結果: `plan_type='standard', duration=1`
- 検証ポイント: invoice.paid で正しくPrice IDがマッチ

#### Test 2-2: TEST環境でのFeedback Plan購入（1ヶ月）
- 新規テストユーザー
- 期待結果: `plan_type='feedback', duration=1`
- 検証ポイント: invoice.paid で正しくPrice IDがマッチ

#### Test 2-3: TEST環境でのプラン変更
- ユーザー: kyasya00@gmail.com
- Standard 1M → Standard 3M
- 期待結果: `plan_type='standard', duration=3`
- 検証ポイント: customer.subscription.updated で正しくPrice IDがマッチ

---

## 💡 根本原因まとめ

### なぜこのバグが発生したのか？

1. **歴史的経緯**: 過去に 'community' プランが存在していた可能性があり、PlanType型定義から削除された際に全ての参照箇所が更新されなかった

2. **設計の不整合**:
   - checkout.session.completed: metadata経由（環境非依存、正しい）
   - invoice.paid / customer.subscription.updated: Price IDマッチング（環境依存、誤り）

3. **環境変数管理の欠如**: TEST/LIVE環境で異なる環境変数を使用する設計なのに、Webhook側がこれを考慮していなかった

4. **型安全性の限界**: TypeScriptの型システムでは文字列リテラルとデフォルト引数の組み合わせを完全に防げない

### なぜ今まで発見されなかったのか？

- **TEST環境での動作確認不足**: 新規購入フローは metadata 経由のため正常動作していた
- **invoice.paid イベントの軽視**: 初回購入では checkout.session.completed が先に処理されるため、invoice.paid のバグが隠れていた
- **プラン変更フローの未テスト**: customer.subscription.updated は主にプラン変更時に発火するため、新規購入テストでは発見されなかった

---

## 🔮 再発防止策

### 1. 型安全性の向上

```typescript
// デフォルト値を使わず、必須パラメータにする
export const createCheckoutSession = async (
  returnUrl: string,
  planType: PlanType,  // デフォルト値なし（必須）
  duration: 1 | 3,     // デフォルト値なし（必須）
  isTest?: boolean
)
```

### 2. Webhookでのバリデーション追加

```typescript
const planType = session.metadata?.plan_type;

// 厳格なバリデーション
if (!planType || !['standard', 'feedback'].includes(planType)) {
  console.error(`❌ 無効なプランタイプ: ${planType}`);
  throw new Error(`Invalid plan type: ${planType}`);
}
```

### 3. 環境変数の一元管理

```typescript
// ヘルパー関数を作成
function getPriceId(planType: PlanType, duration: 1 | 3): string {
  const envPrefix = ENVIRONMENT === 'test' ? 'STRIPE_TEST_' : 'STRIPE_';
  const planUpper = planType.toUpperCase();
  const durationSuffix = duration === 1 ? '1M' : '3M';
  return Deno.env.get(`${envPrefix}${planUpper}_${durationSuffix}_PRICE_ID`) || '';
}
```

### 4. 包括的なテストスイート

- ✅ Phase 1完了: Webhook署名検証テスト
- ✅ Phase 2完了: 冪等性テスト
- ❌ Phase 3未完: プラン変更テスト（invoice.paid, customer.subscription.updated）
- ❌ Phase 4未完: キャンセルフローテスト

---

## ✅ 次のステップ

### 即座に実施すべき修正

1. **Phase 2修正**: Webhook環境変数ロジックの修正（2箇所）
2. **Phase 3修正**: 'community' プラン参照の削除（1箇所）
3. **Edge Functions再起動**: 修正コードの反映
4. **Phase 2テスト**: 全プランタイプでの動作確認

### 長期的な改善

1. LIVE環境用の環境変数定義
2. 型安全性の向上（デフォルト値の削除）
3. バリデーション強化
4. 包括的なテストスイート構築

---

**修正完了後の確認事項**:
- [ ] Phase 2修正完了（環境変数ロジック）
- [ ] Phase 3修正完了（'community' 参照削除）
- [ ] Edge Functions再起動
- [ ] Test 2-1完了（Standard 1M）
- [ ] Test 2-2完了（Feedback 1M）
- [ ] Test 2-3完了（プラン変更）

---

**作成日時**: 2025-11-30
**作成者**: Claude Code
**レビュー**: 未実施
