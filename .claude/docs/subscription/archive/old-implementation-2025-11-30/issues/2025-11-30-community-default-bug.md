# 'community' デフォルト値バグ

**日付**: 2025-11-30
**発見者**: kyasya00@gmail.com テスト中に発見
**重大度**: 🔴 Critical
**ステータス**: ✅ 修正完了

---

## 🐛 バグの概要

スタンダードプラン（1ヶ月）を購入したユーザーのサブスクリプションが、データベースに `plan_type='community'` として保存される問題。

`'community'` は **PlanType 型定義に存在しない** 無効なプランタイプです。

---

## 📋 症状

### 実際の動作

1. ユーザーが `/subscription` ページで「スタンダードプラン 1ヶ月」を選択
2. Stripe Checkout で決済完了
3. Webhook が発火してサブスクリプションを作成
4. **データベースに `plan_type='community'` として保存される** ❌
5. フロントエンドで「コミュニティプラン」と表示される ❌

### 期待される動作

- `plan_type='standard'` として保存されるべき
- フロントエンドで「スタンダードプラン」と表示されるべき

---

## 🔍 根本原因

### PlanType 型定義（src/utils/subscriptionPlans.ts:2）

```typescript
export type PlanType = 'standard' | 'feedback';
```

**'community' は存在しない無効なプランタイプ！**

### 問題のあったコード

#### 1. src/services/stripe.ts:14

```typescript
export const createCheckoutSession = async (
  returnUrl: string,
  planType: PlanType = "community",  // ❌ 無効なデフォルト値
  duration: 1 | 3 = 1,
  isTest?: boolean
)
```

#### 2. supabase/functions/stripe-webhook/index.ts:280

```typescript
const planType = session.metadata?.plan_type || "community";  // ❌ 無効なデフォルト値
```

#### 3. src/pages/Training/Plan.tsx:49, 77

```typescript
const planSessionData = {
  planType: 'community' as const,  // ❌ 無効なプランタイプ
  // ...
};

const { url, error } = await createCheckoutSession(
  returnUrl,
  'community',  // ❌ 無効なプランタイプ
  selectedDuration
);
```

---

## 💡 なぜ TypeScript エラーが出なかったのか？

1. **`as const` を使用**していたため、型推論が厳密にチェックされなかった
2. **デフォルト引数**は関数定義時にのみチェックされ、呼び出し元で省略されても実行時エラーにならない
3. **文字列リテラル**として扱われたため、型エラーが発生しなかった

---

## ✅ 修正内容

### 修正1: src/services/stripe.ts

```typescript
export const createCheckoutSession = async (
  returnUrl: string,
  planType: PlanType = "standard",  // ✅ 'community' → 'standard'
  duration: 1 | 3 = 1,
  isTest?: boolean
)
```

### 修正2: supabase/functions/stripe-webhook/index.ts

```typescript
const planType = session.metadata?.plan_type || "standard";  // ✅ 'community' → 'standard'
```

### 修正3: src/pages/Training/Plan.tsx

```typescript
// TODO コメント追加 + 'community' → 'standard' に変更
const planSessionData = {
  planType: 'standard' as const,  // ✅ 修正
  // ...
};

const { url, error } = await createCheckoutSession(
  returnUrl,
  'standard',  // ✅ 修正
  selectedDuration
);
```

**重要**: Training/Plan.tsx は「コミュニティプラン」として表示していますが、実際には `'standard'` プランを販売しています。このページの扱いは後で再検討する必要があります（TODO コメント追加済み）。

---

## 🧪 テストケース

### テスト前（バグ状態）

```typescript
// ユーザー: kyasya00@gmail.com
// 購入: Standard Plan 1 month (price_1OIiOUKUVUnt8GtyOfXEoEvW)
// 結果: plan_type='community' ❌
```

### データベース修正（手動）

```sql
UPDATE user_subscriptions
SET plan_type = 'standard', updated_at = NOW()
WHERE id = 'fc917523-ad3e-4913-83a9-c33dfef42baa';
```

### テスト後（修正後）

**実施予定**: 新規ユーザーで Standard Plan 1 month を購入
**期待結果**: `plan_type='standard'` として正しく保存される

---

## 📚 関連ファイル

- `src/utils/subscriptionPlans.ts:2` - PlanType 型定義
- `src/services/stripe.ts:14` - createCheckoutSession 関数
- `supabase/functions/stripe-webhook/index.ts:280` - Webhook ハンドラー
- `src/pages/Training/Plan.tsx:49, 77` - Training プランページ

---

## 🔮 今後の対策

### 1. 型安全性の向上

デフォルト値を使わず、必須パラメータにする：

```typescript
export const createCheckoutSession = async (
  returnUrl: string,
  planType: PlanType,  // デフォルト値なし
  duration: 1 | 3,     // デフォルト値なし
  isTest?: boolean
)
```

### 2. Webhook でのバリデーション追加

```typescript
const planType = session.metadata?.plan_type;

// バリデーション
if (!planType || !['standard', 'feedback'].includes(planType)) {
  console.error(`❌ 無効なプランタイプ: ${planType}`);
  throw new Error(`Invalid plan type: ${planType}`);
}
```

### 3. Training/Plan.tsx の見直し

「コミュニティプラン」ページの扱いを決定:
- Option A: ページを削除
- Option B: 正しいプラン名に変更
- Option C: 新しい 'community' プランを PlanType に追加

---

## ✅ 完了チェックリスト

- [x] 根本原因特定
- [x] stripe.ts のデフォルト値修正
- [x] stripe-webhook のデフォルト値修正
- [x] Training/Plan.tsx の修正 + TODO コメント追加
- [x] TypeScript 型チェック（エラーなし）
- [x] バグドキュメント作成
- [ ] 修正後の動作確認テスト（新規購読）

---

**修正日時**: 2025-11-30
**修正者**: Claude Code
**レビュー**: 未実施
