# プレミアムアクセスバグ - 原因分析と対策

**作成日**: 2025-11-26
**深刻度**: 🚨 **CRITICAL**
**ステータス**: 🔍 調査完了 → 修正待ち

---

## 📊 問題の概要

### 現象
- **データベース**: `plan_type: "feedback"`, `is_active: true`, `hasMemberAccess: true`, `hasLearningAccess: true`
- **実際の動作**: 有料コンテンツに鍵マークが表示され、視聴不可

### ユーザーへの影響
- Feedbackプラン（9999円/月）を支払っているにもかかわらず、コンテンツが視聴できない
- 他のプラン（Standard）ユーザーも同様の問題がある可能性

---

## 🔍 根本原因

### 原因箇所: `src/utils/premiumAccess.ts:21`

```typescript
export const canAccessContent = (
  isPremium: boolean,
  planType: PlanType | null
): boolean => {
  // 無料コンテンツは誰でもアクセス可能
  if (!isPremium) {
    return true;
  }

  // プレミアムコンテンツの場合、standardまたはcommunity（feedback）プランが必要
  // 注: 'growth'プランも全コンテンツにアクセス可能
  return planType === 'standard' || planType === 'growth' || planType === 'community';
  //                                                                          ^^^^^^^^
  //                                                                          'feedback' が含まれていない！
};
```

### なぜこの問題が発生したか

#### 1. **plan_type の命名の混乱**

プロジェクト内で **2つの異なる名前** が混在しています：

| 表示名 | データベース | コメント |
|--------|-------------|----------|
| Feedbackプラン（Growth） | `plan_type: "feedback"` | Stripe Price ID: `price_1OIiMRKUVUnt8GtyMGSJIH8H` |
| Standardプラン | `plan_type: "standard"` | Stripe Price ID: `price_1RStBiKUVUnt8GtynMfKweby` |
| Communityプラン | `plan_type: "community"` | ❓ 実際には使用されていない？ |
| Growthプラン | `plan_type: "growth"` | ❓ 別名または将来のプラン？ |

**混乱のポイント:**
- コメントには「community（feedback）プラン」と書かれている → `'community'` をチェック
- 実際のデータベースには `'feedback'` として保存されている
- `'growth'` も含まれているが、これは別のプランか、`'feedback'` の別名か不明

#### 2. **過去に成功していた理由**

**仮説1**: 過去のテストでは `plan_type` が `'community'` または `'standard'` として保存されていた可能性
**仮説2**: 過去は `premiumAccess.ts` に `'feedback'` が含まれていた可能性

#### 3. **今回の実装で変更した箇所**

**私が行った変更:**
1. ✅ `stripe-webhook-test/index.ts`: Price ID マッピングで `plan_type: "feedback"` を設定
2. ✅ `check-subscription/handlers.ts`: デフォルトプランを `null` に変更
3. ❌ **`premiumAccess.ts` は変更していない** → この既存のバグに気づかなかった

**つまり:**
- Price ID マッピングは正しく実装され、`plan_type: "feedback"` として保存されている
- しかし、`premiumAccess.ts` が古い実装のままで `'feedback'` をチェックしていなかった
- この不整合により、正しいプランでもアクセスできない問題が発生

---

## 🛠️ 修正方針

### 修正箇所: `src/utils/premiumAccess.ts:21`

```typescript
// 修正前（バグ）
return planType === 'standard' || planType === 'growth' || planType === 'community';

// 修正後（正しい）
return planType === 'standard' || planType === 'growth' || planType === 'community' || planType === 'feedback';
```

### 根本的な解決策（将来の改善）

**Option 1: プランタイプを統一する**
```typescript
// すべてのプランをリストアップ
const PREMIUM_PLANS: PlanType[] = ['standard', 'growth', 'community', 'feedback'];

export const canAccessContent = (
  isPremium: boolean,
  planType: PlanType | null
): boolean => {
  if (!isPremium) return true;
  return planType !== null && PREMIUM_PLANS.includes(planType);
};
```

**Option 2: アクセス権限フラグを直接使用する**
```typescript
// check-subscription で hasMemberAccess, hasLearningAccess を返しているので、
// それを直接使用してプランタイプによる判定を廃止
export const canAccessContent = (
  isPremium: boolean,
  hasLearningAccess: boolean
): boolean => {
  if (!isPremium) return true;
  return hasLearningAccess;
};
```

---

## ✅ 修正前テスト計画

### テストケース

#### Test 1: Feedbackプラン（現在のユーザー）
- **user_id**: `c18e3b81-864d-46c7-894e-62ed0e889876`
- **plan_type**: `'feedback'`
- **期待結果**: 有料コンテンツにアクセス可能

#### Test 2: Standardプラン
- **plan_type**: `'standard'`
- **期待結果**: 有料コンテンツにアクセス可能

#### Test 3: Communityプラン（存在する場合）
- **plan_type**: `'community'`
- **期待結果**: 有料コンテンツにアクセス可能？（仕様確認が必要）

#### Test 4: プランなし（未登録）
- **plan_type**: `null`
- **期待結果**: 有料コンテンツにアクセス不可（鍵マーク表示）

### テスト手順

1. **修正前の状態をConsoleで確認**
   - ブラウザのConsoleを開く
   - 以下のコマンドを実行:
     ```javascript
     console.log('planType:', window.__SUBSCRIPTION_STATE__?.planType);
     console.log('canAccessContent(true):', window.__SUBSCRIPTION_STATE__?.canAccessContent(true));
     ```
   - 期待: `planType: 'feedback'`, `canAccessContent(true): false` ❌

2. **修正を適用**
   - `src/utils/premiumAccess.ts` を修正
   - アプリケーションをリロード

3. **修正後の状態をConsoleで確認**
   - 同じコマンドを実行
   - 期待: `planType: 'feedback'`, `canAccessContent(true): true` ✅

4. **実際の動作確認**
   - 有料コンテンツページにアクセス
   - 鍵マークが消えて、動画が表示されることを確認

---

## 🔄 再発防止策

### 1. **プランタイプの定義を一元管理**

`src/utils/subscriptionPlans.ts` にすべてのプランタイプを定義:

```typescript
// すべてのプランタイプを一箇所で管理
export const PLAN_TYPES = {
  STANDARD: 'standard',
  FEEDBACK: 'feedback',  // Growthプラン
  GROWTH: 'growth',      // 将来のプラン？
  COMMUNITY: 'community' // 無料プラン？
} as const;

export type PlanType = typeof PLAN_TYPES[keyof typeof PLAN_TYPES];

// プレミアムプランのリスト
export const PREMIUM_PLANS: PlanType[] = [
  PLAN_TYPES.STANDARD,
  PLAN_TYPES.FEEDBACK,
  PLAN_TYPES.GROWTH,
  // PLAN_TYPES.COMMUNITY は含めない（仕様確認が必要）
];
```

### 2. **テストケースの追加**

`premiumAccess.test.ts` を作成:

```typescript
import { canAccessContent } from './premiumAccess';

describe('canAccessContent', () => {
  it('Feedbackプランはプレミアムコンテンツにアクセス可能', () => {
    expect(canAccessContent(true, 'feedback')).toBe(true);
  });

  it('Standardプランはプレミアムコンテンツにアクセス可能', () => {
    expect(canAccessContent(true, 'standard')).toBe(true);
  });

  it('プランなしはプレミアムコンテンツにアクセス不可', () => {
    expect(canAccessContent(true, null)).toBe(false);
  });

  it('無料コンテンツは誰でもアクセス可能', () => {
    expect(canAccessContent(false, null)).toBe(true);
    expect(canAccessContent(false, 'feedback')).toBe(true);
  });
});
```

### 3. **ドキュメント整備**

- プランタイプの命名規則を明確化
- `'feedback'` と `'growth'` の関係を明確化
- `'community'` の位置づけを明確化

---

## 📝 学んだ教訓

### 1. **既存コードの完全な理解が必要**
- 今回、`stripe-webhook-test` と `check-subscription` は修正したが、`premiumAccess.ts` を見落とした
- **すべての関連ファイル**をGrep検索して確認すべきだった

### 2. **End-to-Endテストの重要性**
- データベースが正しくても、フロントエンドで動作しなければ意味がない
- 「Phase 4テスト完了」と判断する前に、**実際の動作確認**を必須とすべき

### 3. **命名の一貫性**
- `'feedback'`, `'growth'`, `'community'` の関係が曖昧
- プランタイプの定義を一元管理し、コメントで説明を追加すべき

### 4. **Consoleログの活用**
- `useSubscription.ts` は既に詳細なログを出力している
- テスト時はConsoleを確認して、各ステップで状態をチェックすべき

---

## 次のステップ

1. ✅ 原因特定完了
2. ⏳ `premiumAccess.ts` を修正
3. ⏳ 修正後の動作確認
4. ⏳ 他のプラン（Standard）でも同様にテスト
5. ⏳ 再発防止策の実装（プランタイプの一元管理、テスト追加）

---

**作成者**: AI開発チーム
**最終更新**: 2025-11-26
