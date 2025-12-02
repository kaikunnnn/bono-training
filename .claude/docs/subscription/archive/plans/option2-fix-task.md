# Option 2 実装修正タスク

**作成日**: 2025-11-29
**目的**: プラン変更時のプロレーション表示を正確にする（料金データをStripeから動的取得に修正）

---

## 🎯 タスク概要

### 背景

**Option 2（プラン変更確認モーダル）は既に実装済み**だが、**致命的なバグ**を発見:

- ❌ **ハードコードされた固定料金**を使用（Phase 1の古い実装）
- ❌ **Stripeの実際の料金**と**2倍～6倍の差**がある
- ❌ プロレーション計算が**完全に間違っている**

### 影響

| 項目 | ハードコード料金 | Stripe実際の料金 | 差額 |
|------|-----------------|-----------------|------|
| Standard 1ヶ月 | ¥4,000 | ¥1,980 | **2倍以上** ❌ |
| Standard 3ヶ月 | ¥3,800 | ¥1,782 | **2倍以上** ❌ |
| Feedback 1ヶ月 | ¥1,480 | ¥9,800 | **6倍以上** ❌ |
| Feedback 3ヶ月 | ¥1,280 | ¥8,910 | **7倍以上** ❌ |

**ユーザー体験への影響**:
- モーダル表示: 「追加で¥1,000請求」
- 実際のStripe請求: 「追加で¥4,000請求」
- → **クレーム発生リスク** 🚨

---

## 📋 実装済みファイルの現状

### ✅ 実装済み（修正不要）

1. **`src/utils/prorationCalculator.ts`**
   - プロレーション計算ロジック
   - **問題なし**（計算式は正しい）

2. **`src/pages/Subscription.tsx`**
   - プラン変更確認モーダルの統合
   - **問題なし**（モーダル呼び出しは正しい）

### 🚨 実装済み（修正必要）

3. **`src/components/subscription/PlanChangeConfirmModal.tsx`**
   - プラン変更確認モーダルUI
   - **問題**: `getPlanMonthlyPrice()`（ハードコード）を使用
   - **必要な修正**: `getPlanPrices()`（Stripe動的取得）に変更

---

## 🔧 修正タスク

### Task 1: PlanChangeConfirmModal.tsxを修正

**目的**: ハードコードされた料金をStripe動的取得に変更

**修正ファイル**: `src/components/subscription/PlanChangeConfirmModal.tsx`

**修正内容**:

#### 修正前（現在）
```typescript
// src/components/subscription/PlanChangeConfirmModal.tsx:75-76

const currentPlanInfo: PlanInfo = {
  type: currentPlan.type,
  duration: currentPlan.duration,
  monthlyPrice: getPlanMonthlyPrice(currentPlan.type, currentPlan.duration), // ❌ ハードコード
};

const newPlanInfo: PlanInfo = {
  type: newPlan.type,
  duration: newPlan.duration,
  monthlyPrice: getPlanMonthlyPrice(newPlan.type, newPlan.duration), // ❌ ハードコード
};
```

#### 修正後（目標）
```typescript
// src/components/subscription/PlanChangeConfirmModal.tsx

import { getPlanPrices, PlanPrices } from '@/services/pricing';

export const PlanChangeConfirmModal: React.FC<PlanChangeConfirmModalProps> = ({
  currentPlan,
  newPlan,
  currentPeriodEnd,
  onConfirm,
  onCancel,
}) => {
  // Stripe料金を取得
  const [planPrices, setPlanPrices] = React.useState<PlanPrices | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPrices() {
      setLoading(true);
      const { prices, error } = await getPlanPrices();

      if (!error && prices) {
        setPlanPrices(prices);
      } else {
        console.error('料金取得エラー:', error);
      }

      setLoading(false);
    }

    fetchPrices();
  }, []);

  // ローディング中の表示
  if (loading || !planPrices) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Stripeから取得した実際の料金を使用
  const currentPriceKey = `${currentPlan.type}_${currentPlan.duration}m` as keyof PlanPrices;
  const newPriceKey = `${newPlan.type}_${newPlan.duration}m` as keyof PlanPrices;

  const currentPlanInfo: PlanInfo = {
    type: currentPlan.type,
    duration: currentPlan.duration,
    monthlyPrice: planPrices[currentPriceKey]?.unit_amount || 0, // ✅ Stripe動的取得
  };

  const newPlanInfo: PlanInfo = {
    type: newPlan.type,
    duration: newPlan.duration,
    monthlyPrice: planPrices[newPriceKey]?.unit_amount || 0, // ✅ Stripe動的取得
  };

  // プロレーション計算
  const proration = calculateProration(
    currentPlanInfo,
    newPlanInfo,
    currentPeriodEnd
  );

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      {/* ... 既存のUI（変更なし） ... */}
    </Dialog>
  );
};
```

**変更点まとめ**:
1. ✅ `getPlanPrices()`をインポート
2. ✅ `useState`で料金データを管理
3. ✅ `useEffect`でStripeから料金を取得
4. ✅ ローディング中の表示を追加
5. ✅ `planPrices[key].unit_amount`で実際の料金を使用

**影響範囲**:
- ファイル数: **1ファイルのみ**
- 修正行数: 約30行
- 既存UIへの影響: **なし**（UIは変更なし）

---

### Task 2: 動作確認テスト

**目的**: 修正が正しく動作することを確認

**テストケース**:

#### Test 1: 料金表示の確認
1. 既存契約者でログイン（Standard 1ヶ月）
2. Feedback 1ヶ月プランの「選択」ボタンをクリック
3. ✅ モーダルが表示される
4. ✅ 現在のプラン: 「スタンダード 1ヶ月プラン ¥1,980/月」と表示される
5. ✅ 変更後のプラン: 「フィードバック 1ヶ月プラン ¥9,800/月」と表示される

#### Test 2: プロレーション計算の確認
**前提**: Standard 1ヶ月（¥1,980）契約中、15日残り

**期待される計算**:
```
現在のプラン返金（15日分）: -¥990
  計算式: -(1980 / 30 * 15) = -990

新プラン（15日分）: +¥4,900
  計算式: 9800 / 30 * 15 = 4900

今回のお支払い合計: +¥3,910
  計算式: -990 + 4900 = 3910
```

**確認項目**:
- ✅ 返金額が「-¥990」と表示される
- ✅ 新プラン請求額が「+¥4,900」と表示される
- ✅ 合計が「+¥3,910」と表示される

#### Test 3: 実際のプラン変更フロー
1. モーダルで「プラン変更を確定」ボタンをクリック
2. ✅ Stripe Checkoutに遷移
3. ✅ テストカード（4242 4242 4242 4242）で決済
4. ✅ 決済完了後、`/subscription?updated=true`にリダイレクト
5. ✅ Stripe Dashboardで請求額が「¥3,910」であることを確認
6. ✅ 二重課金が発生していないことを確認

#### Test 4: エッジケース（ダウングレード）
**前提**: Feedback 1ヶ月（¥9,800）契約中、10日残り

**期待される計算**:
```
現在のプラン返金（10日分）: -¥3,267
新プラン（10日分）: +¥660
今回のお支払い合計: -¥2,607（返金）
```

**確認項目**:
- ✅ 合計が「-¥2,607 返金」と表示される（緑色）
- ✅ Stripe Dashboardで実際に返金が発生することを確認

---

### Task 3: TypeScriptコンパイル確認

**目的**: 型エラーがないことを確認

**実行コマンド**:
```bash
npx tsc --noEmit
```

**期待結果**:
```
✅ エラー0件
```

---

### Task 4: TASK-TRACKER.mdの更新

**目的**: Issue 3のステータスを更新

**更新内容**:

```markdown
### Issue 3: プラン変更時のプロレーション表示なし問題 🟡

**発見日**: 2025-11-28
**優先度**: 🟡 MEDIUM
**ステータス**: ✅ 修正完了
**完了日**: 2025-11-29

**問題の内容**:
現在のプラン変更実装（Option 3）では、ユーザーがプロレーション（差額）を確認できない。

**解決策**:
Option 2（Option 3 + 独自UI確認モーダル）を実装

**実装内容**:
- ✅ `src/utils/prorationCalculator.ts` - プロレーション計算ロジック
- ✅ `src/components/subscription/PlanChangeConfirmModal.tsx` - 確認モーダルUI
- ✅ `src/pages/Subscription.tsx` - 既存ページへの統合

**修正内容（2025-11-29）**:
- ✅ PlanChangeConfirmModalをStripe動的料金取得に修正
- ✅ ハードコード料金の問題を解決
- ✅ Test 2B実施: プロレーション表示が正確であることを確認

**テスト結果**:
- ✅ Standard 1ヶ月 → Feedback 1ヶ月: プロレーション表示 ¥3,910（正確）
- ✅ Feedback 1ヶ月 → Standard 1ヶ月: プロレーション表示 -¥2,607 返金（正確）
- ✅ 二重課金なし
- ✅ Stripe請求額とモーダル表示が一致

**関連ドキュメント**:
- [option2-fix-task.md](./plans/option2-fix-task.md)
- [plan-change-comparison.md](./plans/plan-change-comparison.md)
```

---

## 📊 タスク実行順序

### Phase 1: 修正実装（15分）

```
1. PlanChangeConfirmModal.tsx を修正
   ├─ getPlanPrices() をインポート
   ├─ useState/useEffect で料金取得
   ├─ ローディング表示を追加
   └─ 料金データをStripe動的取得に変更

2. TypeScriptコンパイル確認
   └─ npx tsc --noEmit
```

### Phase 2: 動作確認（15分）

```
3. Test 1: 料金表示の確認
   └─ モーダルでStripe料金が表示されることを確認

4. Test 2: プロレーション計算の確認
   └─ 計算結果が正確であることを確認

5. Test 3: 実際のプラン変更フロー
   └─ Stripe Checkoutで決済完了まで確認
```

### Phase 3: ドキュメント更新（5分）

```
6. TASK-TRACKER.md を更新
   └─ Issue 3 を「✅ 修正完了」に変更
```

**合計所要時間**: 約35分

---

## ✅ 完了の定義（Definition of Done）

- [ ] PlanChangeConfirmModal.tsx が Stripe動的料金を使用している
- [ ] TypeScriptコンパイルエラーが0件
- [ ] Test 1: 料金表示が正確（Stripe実際の料金と一致）
- [ ] Test 2: プロレーション計算が正確
- [ ] Test 3: Stripe Checkoutで決済完了
- [ ] Test 4: Stripe Dashboardで請求額とモーダル表示が一致
- [ ] 二重課金が発生しない
- [ ] TASK-TRACKER.md の Issue 3 が「✅ 修正完了」

---

## 🔗 関連ドキュメント

- [option2-implementation-plan.md](./option2-implementation-plan.md) - 当初の実装計画
- [plan-change-comparison.md](./plan-change-comparison.md) - Option 1とOption 2の比較
- [TASK-TRACKER.md](../TASK-TRACKER.md) - Issue 3: プロレーション表示なし問題
- [phase2-stripe-pricing-final.md](./phase2-stripe-pricing-final.md) - Phase 2実装（Stripe動的料金取得）

---

## 📝 実装コード（完全版）

### 修正後の PlanChangeConfirmModal.tsx（完全版）

```typescript
/**
 * プラン変更確認モーダル
 *
 * ユーザーがプラン変更時にプロレーション（差額）を確認できるモーダル
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  calculateProration,
  type PlanInfo,
} from '@/utils/prorationCalculator';
import {
  getPlanDisplayName,
  type PlanType,
  type PlanDuration,
} from '@/utils/subscriptionPlans';
import { getPlanPrices, type PlanPrices } from '@/services/pricing';

interface PlanChangeConfirmModalProps {
  /** 現在のプラン情報 */
  currentPlan: {
    type: PlanType;
    duration: PlanDuration;
  };
  /** 新しいプラン情報 */
  newPlan: {
    type: PlanType;
    duration: PlanDuration;
  };
  /** 現在のサブスクリプション期間終了日 */
  currentPeriodEnd: Date;
  /** 確定ボタンクリック時のコールバック */
  onConfirm: () => void;
  /** キャンセルボタンクリック時のコールバック */
  onCancel: () => void;
}

/**
 * プラン変更確認モーダルコンポーネント
 *
 * @example
 * ```tsx
 * <PlanChangeConfirmModal
 *   currentPlan={{ type: 'standard', duration: 1 }}
 *   newPlan={{ type: 'feedback', duration: 1 }}
 *   currentPeriodEnd={new Date('2025-12-13')}
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const PlanChangeConfirmModal: React.FC<PlanChangeConfirmModalProps> = ({
  currentPlan,
  newPlan,
  currentPeriodEnd,
  onConfirm,
  onCancel,
}) => {
  // Stripe料金を動的に取得
  const [planPrices, setPlanPrices] = React.useState<PlanPrices | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPrices() {
      setLoading(true);
      const { prices, error } = await getPlanPrices();

      if (!error && prices) {
        setPlanPrices(prices);
        console.log('✅ 料金取得成功（PlanChangeConfirmModal）:', prices);
      } else {
        console.error('❌ 料金取得エラー（PlanChangeConfirmModal）:', error);
      }

      setLoading(false);
    }

    fetchPrices();
  }, []);

  // ローディング中の表示
  if (loading || !planPrices) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              料金情報を読み込み中...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Stripeから取得した実際の料金を使用
  const currentPriceKey = `${currentPlan.type}_${currentPlan.duration}m` as keyof PlanPrices;
  const newPriceKey = `${newPlan.type}_${newPlan.duration}m` as keyof PlanPrices;

  const currentMonthlyPrice = planPrices[currentPriceKey]?.unit_amount || 0;
  const newMonthlyPrice = planPrices[newPriceKey]?.unit_amount || 0;

  // プラン情報を構築
  const currentPlanInfo: PlanInfo = {
    type: currentPlan.type,
    duration: currentPlan.duration,
    monthlyPrice: currentMonthlyPrice,
  };

  const newPlanInfo: PlanInfo = {
    type: newPlan.type,
    duration: newPlan.duration,
    monthlyPrice: newMonthlyPrice,
  };

  // プロレーション計算
  const proration = calculateProration(
    currentPlanInfo,
    newPlanInfo,
    currentPeriodEnd
  );

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>プラン変更の確認</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 現在のプラン */}
          <div>
            <p className="text-sm text-gray-600">現在のプラン</p>
            <p className="font-bold text-lg">
              {getPlanDisplayName(currentPlan.type)} {currentPlan.duration}ヶ月プラン
            </p>
            <p className="text-sm text-gray-700">
              ¥{currentMonthlyPrice.toLocaleString()}/月
            </p>
          </div>

          {/* 矢印 */}
          <div className="flex justify-center">
            <ArrowDown className="h-6 w-6 text-gray-400" />
          </div>

          {/* 新しいプラン */}
          <div>
            <p className="text-sm text-gray-600">変更後のプラン</p>
            <p className="font-bold text-lg">
              {getPlanDisplayName(newPlan.type)} {newPlan.duration}ヶ月プラン
            </p>
            <p className="text-sm text-gray-700">
              ¥{newMonthlyPrice.toLocaleString()}/月
            </p>
          </div>

          <Separator />

          {/* プロレーション（差額）表示 */}
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm font-semibold mb-3">📊 今回のお支払い</p>

            {/* 残り期間の返金 */}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700">
                現在のプラン返金（{proration.daysRemaining}日分）
              </span>
              <span className="text-green-600 font-medium">
                -¥{Math.abs(proration.refund).toLocaleString()}
              </span>
            </div>

            {/* 新プランの日割り */}
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-700">
                新プラン（{proration.daysRemaining}日分）
              </span>
              <span className="font-medium">
                +¥{proration.newCharge.toLocaleString()}
              </span>
            </div>

            <Separator className="my-2" />

            {/* 合計 */}
            <div className="flex justify-between font-bold">
              <span>今回のお支払い合計</span>
              <span
                className={
                  proration.total >= 0 ? 'text-red-600' : 'text-green-600'
                }
              >
                {proration.total >= 0 ? '+' : ''}
                ¥{Math.abs(proration.total).toLocaleString()}
                {proration.total < 0 ? ' 返金' : ''}
              </span>
            </div>
          </div>

          {/* 次回以降の請求 */}
          <div>
            <p className="text-sm text-gray-600">
              次回請求日:{' '}
              {format(currentPeriodEnd, 'yyyy年M月d日', { locale: ja })}
            </p>
            <p className="text-sm text-gray-600">
              次回以降: ¥{newMonthlyPrice.toLocaleString()}/月
            </p>
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <p className="text-xs text-gray-700">
              ⚠️ プラン変更を確定すると、現在のプランはキャンセルされ、新しいプランに切り替わります。
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={onConfirm}>プラン変更を確定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

---

**最終更新**: 2025-11-29
**作成者**: AI開発チーム
**ステータス**: 実装準備完了
