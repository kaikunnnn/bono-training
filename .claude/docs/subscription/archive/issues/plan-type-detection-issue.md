# プラン判定の問題 (plan_type Detection Issue)

**作成日**: 2025-11-26
**ステータス**: 🔍 調査中
**優先度**: 🔴 HIGH
**影響範囲**: Feedbackプラン（Growthプラン）のすべてのユーザー

---

## 📋 問題概要

Test 4 (キャンセルテスト) の再テスト中に、以下の問題を発見:

**症状**:
- Feedbackプラン（Stripeでは "Growth"）に登録したユーザーが、プレミアムコンテンツにアクセスできない
- データベースの `user_subscriptions.plan_type` が `"growth"` ではなく `"standard"` として保存されている

**発見経緯**:
1. キャンセル後のアクセス機能を実装・デプロイ
2. Test 4 を再実施
3. Feedbackプラン（キャンセル済み）でプレミアムコンテンツにアクセス → ❌ アクセス不可
4. データベース確認 → `plan_type: "standard"` と判明

---

## 🔍 原因分析

### 1. プラン構成の理解

| Stripe表示名 | フロントエンド表示名 | データベース保存値 | 価格 | アクセス権限 |
|------------|-----------------|---------------|------|-----------|
| Community | コミュニティ | `community` | ≤1500円 | メンバー限定のみ |
| Standard | スタンダード | `standard` | ≤4000円 | メンバー限定 + 学習コンテンツ |
| **Growth** | **フィードバック** | `growth` | **4980円** | メンバー限定 + 学習コンテンツ |

### 2. 現在のプラン判定ロジック

**ファイル**: `/supabase/functions/check-subscription/subscription-service/plan-utils.ts`

```typescript
determinePlanInfo(amount: number): [string, boolean] {
  if (amount <= 1500) {
    return ["community", false];
  } else if (amount <= 4000) {
    return ["standard", false];
  } else {
    return ["growth", true];  // 4000円超 → "growth"
  }
}
```

**期待される動作**:
- Feedbackプラン（4980円） → `"growth"` と判定されるはず

### 3. 実際のデータベース状態

**テストユーザー**: `e118477b-9d42-4d5c-80b9-ad66f73b6b02`

```sql
SELECT user_id, plan_type, stripe_subscription_id
FROM user_subscriptions
WHERE user_id = 'e118477b-9d42-4d5c-80b9-ad66f73b6b02';
```

**結果**:
```json
{
  "plan_type": "standard",  // ← 本来は "growth" であるべき
  "stripe_subscription_id": "sub_1SXGeNKUVUnt8GtyFkhIAVEB"
}
```

**Stripeでの実際の価格**:
```json
{
  "unit_amount": 4980  // ← 4000円超なので "growth" と判定されるはず
}
```

### 4. 矛盾点

- ✅ プラン判定ロジックは正しい（4980円 > 4000円 → "growth"）
- ❌ データベースには `"standard"` として保存されている
- ❓ **なぜ間違った値が保存されたのか？**

---

## 💡 仮説

### 仮説1: Webhook処理時の上書き

**ファイル**: `/supabase/functions/stripe-webhook-test/index.ts`

Webhook処理（`customer.subscription.updated`, `customer.subscription.created`）で、プラン判定ロジックを**通らずに**直接 `plan_type` を設定している箇所がある可能性。

**確認が必要**:
- Webhook処理の全体フロー
- `updateSubscriptionStatus` の呼び出し箇所とパラメータ

### 仮説2: 複数回のプラン変更

ユーザーが以下の順序でプラン変更した場合:
1. 最初に Standard プラン（≤4000円）に登録 → `plan_type: "standard"` 保存
2. Growth プラン（4980円）に変更
3. Webhook処理が `plan_type` を更新しない

**確認が必要**:
- プラン変更時のWebhook処理
- `updateSubscriptionStatus` が既存の `plan_type` を上書きするか

### 仮説3: テスト環境での手動操作

開発中に手動で `plan_type: "standard"` を設定した可能性。

---

## 🛠️ 一時的な対処（実施済み）

### 手動でのデータベース修正

```sql
UPDATE user_subscriptions
SET plan_type = 'growth',
    updated_at = NOW()
WHERE user_id = 'e118477b-9d42-4d5c-80b9-ad66f73b6b02';
```

**目的**: キャンセル後アクセス機能の動作確認を先に進めるため

**注意**: これは根本解決ではない。Webhook処理を修正しないと、次回のプラン変更時に再び `"standard"` に戻る可能性がある。

---

## 🎯 根本解決策（実装予定）

### Phase 1: 原因特定

1. **Webhook処理の調査**:
   - `customer.subscription.created` イベント
   - `customer.subscription.updated` イベント
   - `plan_type` がどこで、どのように決定されているか

2. **ログ確認**:
   - テストユーザーのサブスクリプション作成/更新時のWebhookログ
   - `determinePlanInfo` が呼ばれているか
   - 呼ばれている場合、どの値を返しているか

### Phase 2: 修正実装

**修正方針（仮）**:

Webhook処理で、**常に最新のStripe価格から `plan_type` を再計算**する。

```typescript
// stripe-webhook-test/index.ts の修正例
async function handleSubscriptionUpdated(stripe, supabase, subscription) {
  // 価格情報を取得
  const price = subscription.items.data[0]?.price;
  const amount = price?.unit_amount || 0;

  // プラン判定ロジックを呼び出し
  const planUtils = new PlanUtils();
  const [planType, hasTraining] = planUtils.determinePlanInfo(amount);

  // データベース更新
  await supabase
    .from("user_subscriptions")
    .update({
      plan_type: planType,  // ← 再計算した値を使用
      is_active: subscription.status === "active",
      // ...
    })
    .eq("stripe_subscription_id", subscription.id);
}
```

### Phase 3: テスト

1. 新しいテストユーザーで Feedback プラン（Growth）に登録
2. Webhook処理後のデータベース確認 → `plan_type: "growth"` であることを確認
3. プラン変更（Standard → Growth） → 正しく更新されることを確認
4. キャンセル → `plan_type` が維持されることを確認

---

## 🔗 関連ファイル

| ファイル | 役割 | 修正必要 |
|---------|------|---------|
| `/supabase/functions/check-subscription/subscription-service/plan-utils.ts` | プラン判定ロジック | ✅ 正常（修正不要） |
| `/supabase/functions/stripe-webhook-test/index.ts` | Webhook処理 | ⚠️ **要調査・修正** |
| `/supabase/functions/check-subscription/handlers.ts` | アクセス権限計算 | ✅ 修正済み（キャンセル後アクセス対応） |

---

## 📊 影響範囲

### 現在影響を受けているユーザー

```sql
-- plan_type が誤っている可能性のあるユーザーを抽出
SELECT DISTINCT u.user_id, u.plan_type, s.unit_amount
FROM user_subscriptions u
JOIN stripe.subscriptions s ON u.stripe_subscription_id = s.id
WHERE (s.unit_amount > 4000 AND u.plan_type != 'growth')
   OR (s.unit_amount <= 4000 AND s.unit_amount > 1500 AND u.plan_type != 'standard')
   OR (s.unit_amount <= 1500 AND u.plan_type != 'community');
```

**対応方針**: 上記クエリで該当ユーザーを特定し、Webhook修正後に一括修正スクリプトを実行。

---

## 📝 次のアクション

- [ ] Webhook処理のコード調査（`stripe-webhook-test/index.ts`）
- [ ] Webhookログの確認（テストユーザーのサブスクリプション作成時）
- [ ] 修正実装
- [ ] 新規ユーザーでのテスト
- [ ] 既存ユーザーの一括修正スクリプト作成・実行
- [ ] Test 4 再実施（Feedbackプランでのキャンセル後アクセス確認）

---

**作成者**: AI開発チーム
**最終更新**: 2025-11-26
**ステータス**: 調査中 → 修正実装待ち
