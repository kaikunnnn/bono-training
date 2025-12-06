# 期間表示追加機能 - 詳細開発計画

**作成日**: 2025-11-18
**目的**: プラン名に期間（1ヶ月/3ヶ月）を追加表示し、ユーザーが契約内容を正しく理解できるようにする

---

## 📋 現状分析

### 現在の表示

| ページ | 現在の表示 | 問題点 |
|--------|-----------|--------|
| `/account` | スタンダード | 期間がわからない |
| `/subscription` | スタンダード（現在のプランバッジ） | 期間がわからない |
| Stripe Customer Portal | Standard - ¥4,980/month | ✅ 正しい |

### ユーザーの混乱ポイント

```
ユーザーの認識:
「私は今、スタンダードプランを使っている」

実際の契約:
「スタンダードプラン（3ヶ月）¥4,780/月」

↓

ユーザーが/subscriptionで「スタンダード1ヶ月」を選択
→ プラン変更だと思っている
→ 実際は同じプランの期間変更（アップグレード）
```

**結論**: 期間表示は必須

---

## 🎯 実装目標

### 表示仕様

| ページ | 表示形式 | 例 |
|--------|---------|---|
| `/account` | `{プラン名}（{期間}ヶ月）` | スタンダード（3ヶ月） |
| `/subscription` | 現在のプランバッジ内 | `現在のプラン: スタンダード（3ヶ月）` |

### 期間の表示ルール

| `duration`値 | 表示 |
|-------------|------|
| `1` | 1ヶ月 |
| `3` | 3ヶ月 |
| `null` / `undefined` | 表示なし（フリープラン） |

---

## 🔍 データフロー確認

### 1. データベーススキーマ

**テーブル**: `user_subscriptions`

```sql
CREATE TABLE user_subscriptions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  plan_type text NOT NULL,           -- 'standard', 'feedback', 'community'
  duration integer,                  -- 1 or 3
  is_active boolean DEFAULT true,
  stripe_subscription_id text,
  stripe_customer_id text,
  created_at timestamptz,
  updated_at timestamptz
);
```

**確認済み**: `duration`カラムが存在する ✅

### 2. SubscriptionContext

**ファイル**: `src/contexts/SubscriptionContext.tsx`

**型定義**:
```typescript
interface SubscriptionContextType {
  isSubscribed: boolean;
  planType: PlanType | null;
  duration: number | null; // ← これが存在するか確認必要
  isLoading: boolean;
}
```

**確認必要**:
- [ ] `duration`がContextに含まれているか
- [ ] `duration`が正しくデータベースから取得されているか

### 3. データ取得フロー

```
データベース (user_subscriptions)
    ↓
SupabaseクエリでSELECT duration
    ↓
SubscriptionContext (useEffect)
    ↓
state: { planType, duration }
    ↓
コンポーネント (Account.tsx, Subscription.tsx)
    ↓
表示: スタンダード（3ヶ月）
```

---

## 🚨 失敗しそうな点と対策

### 失敗パターン1: `duration`がContextに含まれていない

**問題**:
```typescript
// SubscriptionContext.tsx
const { data } = await supabase
  .from('user_subscriptions')
  .select('plan_type, is_active') // ← durationを取得していない！
  .eq('user_id', user.id)
  .single();
```

**対策**:
1. まず`SubscriptionContext.tsx`を読んで、`duration`が取得されているか確認
2. 取得されていない場合は、SELECTに`duration`を追加
3. 型定義に`duration`を追加

---

### 失敗パターン2: `duration`が`null`の場合の表示

**問題**:
```typescript
// duration が null の場合
<p>スタンダード（nullヶ月）</p> // ❌ おかしい
```

**対策**:
```typescript
// durationがnullの場合は表示しない
const displayText = duration
  ? `${planName}（${duration}ヶ月）`
  : planName;
```

---

### 失敗パターン3: フリープランの場合の表示

**問題**:
```typescript
// plan_type: 'community', duration: null
<p>コミュニティ（nullヶ月）</p> // ❌
```

**対策**:
```typescript
// フリープランの場合は期間を表示しない
if (!isSubscribed || planType === 'community') {
  return <p>フリープラン</p>;
}

// 有料プランの場合のみ期間を表示
return <p>{planName}（{duration}ヶ月）</p>;
```

---

### 失敗パターン4: `/subscription`ページの「現在のプラン」判定

**問題**:
```typescript
// 現在のコード（想定）
const isCurrentPlan = isSubscribed && planType === plan.id;

// これだと期間が考慮されていない
// Standard 1ヶ月 と Standard 3ヶ月 の両方が「現在のプラン」になる
```

**対策**:
```typescript
// 期間も含めて判定
const isCurrentPlan = isSubscribed
  && planType === plan.id
  && currentDuration === selectedDuration;
```

**確認**: すでに実装されているか確認（`Subscription.tsx:143`付近）

---

### 失敗パターン5: 表示のブレ（統一性）

**問題**:
```
/account: スタンダード（3ヶ月）
/subscription: スタンダード 3ヶ月  ← カッコがない
```

**対策**:
共通の表示関数を作成

```typescript
// src/utils/planDisplay.ts （新規作成）
export function formatPlanDisplay(
  planType: PlanType | null,
  duration: number | null
): string {
  if (!planType || planType === 'community') {
    return 'フリープラン';
  }

  const planNames: Record<PlanType, string> = {
    standard: 'スタンダード',
    feedback: 'フィードバック',
    community: 'フリープラン',
    growth: 'グロース'
  };

  const planName = planNames[planType] || 'フリープラン';

  // 期間がある場合は追加
  if (duration) {
    return `${planName}（${duration}ヶ月）`;
  }

  return planName;
}
```

---

## 📁 修正が必要なファイル

### 1. `src/contexts/SubscriptionContext.tsx`

**確認事項**:
- [ ] `duration`がstateに含まれているか
- [ ] データベースから`duration`を取得しているか
- [ ] 型定義に`duration: number | null`があるか

**修正内容（必要な場合）**:
```typescript
// 型定義
interface SubscriptionContextType {
  isSubscribed: boolean;
  planType: PlanType | null;
  duration: number | null; // 追加
  isLoading: boolean;
}

// データ取得
const { data } = await supabase
  .from('user_subscriptions')
  .select('plan_type, duration, is_active') // duration追加
  .eq('user_id', user.id)
  .single();

// state設定
setPlanType(data.plan_type);
setDuration(data.duration); // 追加
```

---

### 2. `src/utils/planDisplay.ts`（新規作成）

**目的**: プラン表示の統一

**内容**:
```typescript
import { PlanType } from './subscriptionPlans';

/**
 * プラン名と期間を統一フォーマットで表示
 * @param planType - プランタイプ
 * @param duration - 期間（1または3）
 * @returns フォーマットされた表示文字列
 */
export function formatPlanDisplay(
  planType: PlanType | null,
  duration: number | null
): string {
  if (!planType || planType === 'community') {
    return 'フリープラン';
  }

  const planNames: Record<PlanType, string> = {
    standard: 'スタンダード',
    feedback: 'フィードバック',
    community: 'フリープラン',
    growth: 'グロース'
  };

  const planName = planNames[planType] || 'フリープラン';

  // 期間がある場合は追加
  if (duration) {
    return `${planName}（${duration}ヶ月）`;
  }

  return planName;
}

/**
 * 短縮形式のプラン表示（バッジ用）
 */
export function formatPlanBadge(
  planType: PlanType | null,
  duration: number | null
): string {
  const fullDisplay = formatPlanDisplay(planType, duration);
  return fullDisplay;
}
```

---

### 3. `src/pages/Account.tsx`

**現在の表示箇所を確認**:
```typescript
// 現在（想定）
<p>現在のプラン: {getCurrentPlanName()}</p>
```

**修正内容**:
```typescript
import { formatPlanDisplay } from '@/utils/planDisplay';

// ...

// Context から duration を取得
const { isSubscribed, planType, duration } = useSubscriptionContext();

// 表示
<p>現在のプラン: {formatPlanDisplay(planType, duration)}</p>
```

**修正箇所**:
- プラン名表示部分（1箇所）

---

### 4. `src/pages/Subscription.tsx`

**現在の実装を確認**:
```typescript
// getCurrentPlanName 関数
const getCurrentPlanName = () => {
  if (!isSubscribed || !planType) return 'フリープラン';

  const planMap: Record<PlanType, string> = {
    standard: 'スタンダード',
    feedback: 'フィードバック',
    community: 'フィードバック',
    growth: 'グロース'
  };

  return planMap[planType] || 'フリープラン';
};
```

**修正内容**:
```typescript
import { formatPlanDisplay } from '@/utils/planDisplay';

// getCurrentPlanName関数を削除（不要になる）

// ヘッダー部分
<SubscriptionHeader
  isSubscribed={isSubscribed}
  currentPlanName={formatPlanDisplay(planType, duration)} // 修正
/>
```

**注意**: `currentDuration`変数名と、Context の`duration`が混同しないように注意

---

### 5. `src/components/subscription/SubscriptionHeader.tsx`

**確認事項**:
- 期間付きの表示でレイアウトが崩れないか
- 長い文字列でもデザインが保たれるか

**修正内容（必要に応じて）**:
```typescript
// レスポンシブ対応
<h2 className="text-lg md:text-xl">
  {currentPlanName} {/* スタンダード（3ヶ月） */}
</h2>
```

---

## 📝 実装ステップ

### ステップ1: SubscriptionContextの確認と修正

1. `src/contexts/SubscriptionContext.tsx`を読む
2. `duration`が含まれているか確認
3. 含まれていない場合:
   - 型定義に`duration: number | null`を追加
   - データ取得クエリに`duration`を追加
   - stateとして`duration`を管理
   - Contextに`duration`を含める

**確認コマンド**:
```typescript
// ブラウザのコンソールで確認
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
const { planType, duration } = useSubscriptionContext();
console.log({ planType, duration });
```

---

### ステップ2: 共通表示関数の作成

1. `src/utils/planDisplay.ts`を作成
2. `formatPlanDisplay`関数を実装
3. テストケースを考慮:
   - `planType: 'standard', duration: 1` → "スタンダード（1ヶ月）"
   - `planType: 'standard', duration: 3` → "スタンダード（3ヶ月）"
   - `planType: 'feedback', duration: 1` → "フィードバック（1ヶ月）"
   - `planType: 'community', duration: null` → "フリープラン"
   - `planType: null, duration: null` → "フリープラン"

---

### ステップ3: Account.tsxの修正

1. `src/pages/Account.tsx`を読む
2. プラン表示箇所を特定
3. `formatPlanDisplay`をimport
4. 表示を修正
5. ブラウザで確認

**確認ポイント**:
- [ ] 期間が表示される
- [ ] フリープランの場合は期間が表示されない
- [ ] レイアウトが崩れていない

---

### ステップ4: Subscription.tsxの修正

1. `src/pages/Subscription.tsx`を読む
2. `getCurrentPlanName`関数を確認
3. `formatPlanDisplay`に置き換え
4. `SubscriptionHeader`に期間付きプラン名を渡す
5. ブラウザで確認

**確認ポイント**:
- [ ] 現在のプランバッジに期間が表示される
- [ ] 期間が一致するプランカードに「現在のプラン」バッジが表示される
- [ ] レイアウトが崩れていない

---

### ステップ5: 表示の統一性確認

すべてのページで同じ形式で表示されているか確認:

1. `/account`ページ
2. `/subscription`ページ
3. その他、プラン名を表示している箇所

**確認コマンド**:
```bash
# プラン表示箇所を検索
grep -r "planType" src/pages/
grep -r "getCurrentPlanName" src/
```

---

### ステップ6: エッジケースのテスト

以下のケースで正しく表示されるか確認:

#### テストケース1: フリープラン
- ログアウト状態
- 未契約ユーザー

**期待結果**: "フリープラン"（期間なし）

#### テストケース2: スタンダード1ヶ月
- データベース: `plan_type: 'standard', duration: 1`

**期待結果**: "スタンダード（1ヶ月）"

#### テストケース3: スタンダード3ヶ月
- データベース: `plan_type: 'standard', duration: 3`

**期待結果**: "スタンダード（3ヶ月）"

#### テストケース4: フィードバック1ヶ月
- データベース: `plan_type: 'feedback', duration: 1`

**期待結果**: "フィードバック（1ヶ月）"

#### テストケース5: フィードバック3ヶ月
- データベース: `plan_type: 'feedback', duration: 3`

**期待結果**: "フィードバック（3ヶ月）"

#### テストケース6: durationがnull
- データベース: `plan_type: 'standard', duration: null`

**期待結果**: "スタンダード"（期間なし）

---

## 🔍 デバッグ方法

### 問題: 期間が表示されない

**確認1**: Contextに`duration`が含まれているか
```typescript
// ブラウザコンソール
const { duration } = useSubscriptionContext();
console.log('duration:', duration);
```

**確認2**: データベースに`duration`が保存されているか
```sql
SELECT plan_type, duration FROM user_subscriptions WHERE user_id = 'xxx';
```

**確認3**: `formatPlanDisplay`が正しく呼ばれているか
```typescript
// Account.tsx や Subscription.tsx に追加
console.log('formatPlanDisplay:', formatPlanDisplay(planType, duration));
```

---

### 問題: 「undefined」や「null」が表示される

**原因**: `duration`が`undefined`または`null`で、それが文字列として表示されている

**対策**:
```typescript
// ❌ 悪い例
<p>{planName}（{duration}ヶ月）</p>

// ✅ 良い例
<p>{duration ? `${planName}（${duration}ヶ月）` : planName}</p>
```

---

### 問題: 期間が間違っている

**確認1**: データベースの値
```sql
SELECT * FROM user_subscriptions WHERE user_id = 'xxx';
```

**確認2**: Webhook処理が正しく動作しているか
- Supabase Edge Function logsを確認
- `handleSubscriptionUpdated`と`handleInvoicePaid`で`duration`が正しく設定されているか

---

## ✅ 完了チェックリスト

### コード実装
- [ ] `SubscriptionContext`に`duration`が含まれている
- [ ] `src/utils/planDisplay.ts`を作成
- [ ] `Account.tsx`で期間付き表示
- [ ] `Subscription.tsx`で期間付き表示
- [ ] すべての表示が統一されている

### テスト
- [ ] フリープランで期間が表示されない
- [ ] スタンダード1ヶ月で「（1ヶ月）」と表示
- [ ] スタンダード3ヶ月で「（3ヶ月）」と表示
- [ ] フィードバック1ヶ月で「（1ヶ月）」と表示
- [ ] フィードバック3ヶ月で「（3ヶ月）」と表示
- [ ] レイアウトが崩れていない
- [ ] すべてのページで一貫した表示

### ドキュメント
- [ ] 修正内容をコミットメッセージに記載
- [ ] 実装完了レポートを作成

---

## 📊 見積もり

| ステップ | 所要時間 |
|---------|---------|
| ステップ1: Context確認・修正 | 10分 |
| ステップ2: 共通関数作成 | 5分 |
| ステップ3: Account.tsx修正 | 5分 |
| ステップ4: Subscription.tsx修正 | 5分 |
| ステップ5: 統一性確認 | 5分 |
| ステップ6: テスト | 10分 |
| **合計** | **40分** |

---

## 🚀 次のアクション

### 今すぐ実施

1. `src/contexts/SubscriptionContext.tsx`を読んで、`duration`の状態を確認
2. 修正が必要なら、まず`SubscriptionContext`を修正
3. `src/utils/planDisplay.ts`を作成
4. 各ページを順次修正
5. テスト

### 実施後の確認

- すべてのページで期間が正しく表示されている
- ユーザーが契約内容を正しく理解できる
- エッジケースでも問題なく動作する

---

**作成者**: Claude Code
**作成日**: 2025-11-18
