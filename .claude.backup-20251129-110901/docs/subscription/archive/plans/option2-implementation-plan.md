# Option 2 実装計画書（詳細版）

**作成日**: 2025-11-29
**目的**: プラン変更時のプロレーション表示機能を実装する（二重課金リスク0%を維持）

---

## 🎯 実装目標

### 実装前（現状）
- ✅ 二重課金リスク: 0%
- ❌ プロレーション表示: なし
- ❌ ユーザー体験: 「新規登録」として表示

### 実装後（目標）
- ✅ 二重課金リスク: 0%（維持）
- ✅ プロレーション表示: あり（独自UIで実装）
- ✅ ユーザー体験: 差額を確認してから決済

---

## 📋 実装の全体像

### アーキテクチャ

```
[ユーザー]
    ↓
[Subscription.tsx]
    ↓ (プラン変更ボタンをクリック)
    ↓
[既存契約者の判定]
    ↓
    ├─ YES → [PlanChangeConfirmModal表示]
    │           ↓ (プロレーション計算・表示)
    │           ↓ (ユーザーが「確定」をクリック)
    │           ↓
    │        [create-checkout Edge Function呼び出し]
    │           ↓
    │        [Stripe Checkout]
    │           ↓
    │        [stripe-webhook (checkout.session.completed)]
    │           ↓
    │        [既存サブスク自動キャンセル]
    │
    └─ NO → [直接 Stripe Checkoutへ]
```

### データフロー

```
1. useSubscription() → renewalDate を取得
   ↓
2. calculateDaysRemaining() → 残り日数を計算
   ↓
3. calculateProration() → プロレーション（差額）を計算
   ↓
4. PlanChangeConfirmModal → 差額を表示
   ↓
5. createCheckoutSession() → Option 3のロジックで決済
```

---

## 📂 実装するファイル

### 1. `src/utils/prorationCalculator.ts` (新規作成)

**目的**: プロレーション計算ロジックを実装

**実装内容**:

```typescript
/**
 * プラン情報の型定義
 */
export interface PlanInfo {
  type: 'standard' | 'feedback' | 'growth' | 'community';
  duration: 1 | 3;
  price: number; // 月額料金（円）
}

/**
 * プロレーション計算結果の型定義
 */
export interface ProrationResult {
  refund: number;         // 現在のプランの返金額（マイナス値）
  newCharge: number;      // 新プランの日割り請求額（プラス値）
  total: number;          // 合計（refund + newCharge）
  isUpgrade: boolean;     // アップグレードかどうか
  isDowngrade: boolean;   // ダウングレードかどうか
}

/**
 * プロレーション（差額）を計算する
 *
 * @param currentPlan 現在のプラン情報
 * @param newPlan 新しいプラン情報
 * @param daysRemaining 残り日数
 * @returns プロレーション計算結果
 *
 * @example
 * // Standard 1ヶ月(¥1,980) → Feedback 1ヶ月(¥9,800)、15日残り
 * const result = calculateProration(
 *   { type: 'standard', duration: 1, price: 1980 },
 *   { type: 'feedback', duration: 1, price: 9800 },
 *   15
 * );
 * // result = {
 * //   refund: -990,      // 現在のプランの返金
 * //   newCharge: 4900,   // 新プランの日割り請求
 * //   total: 3910,       // 合計（追加で3,910円請求）
 * //   isUpgrade: true,
 * //   isDowngrade: false
 * // }
 */
export function calculateProration(
  currentPlan: PlanInfo,
  newPlan: PlanInfo,
  daysRemaining: number
): ProrationResult {
  // 1ヶ月を30日として計算
  const daysInMonth = 30;

  // 現在のプランの日割り単価
  const currentDailyRate = currentPlan.price / daysInMonth;

  // 新プランの日割り単価
  const newDailyRate = newPlan.price / daysInMonth;

  // 現在のプランの返金額（マイナス値）
  const refund = -(currentDailyRate * daysRemaining);

  // 新プランの日割り請求額
  const newCharge = newDailyRate * daysRemaining;

  // 合計
  const total = refund + newCharge;

  // アップグレード/ダウングレードの判定
  const isUpgrade = newPlan.price > currentPlan.price;
  const isDowngrade = newPlan.price < currentPlan.price;

  return {
    refund: Math.round(refund),
    newCharge: Math.round(newCharge),
    total: Math.round(total),
    isUpgrade,
    isDowngrade,
  };
}

/**
 * 残り日数を計算する
 *
 * @param renewalDate 次回更新日（ISO 8601形式）
 * @returns 残り日数
 *
 * @example
 * calculateDaysRemaining('2025-12-15T00:00:00Z') // 現在が2025-12-01の場合 → 14
 */
export function calculateDaysRemaining(renewalDate: string): number {
  const now = new Date();
  const renewal = new Date(renewalDate);

  // ミリ秒単位の差分を日数に変換
  const diffMs = renewal.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays); // マイナスにならないようにする
}
```

**テストケース**:
- Standard 1ヶ月(¥1,980) → Feedback 1ヶ月(¥9,800)、15日残り
- Standard 1ヶ月(¥1,980) → Standard 3ヶ月(¥1,782)、20日残り
- Feedback 1ヶ月(¥9,800) → Standard 1ヶ月(¥1,980)、10日残り

---

### 2. `src/components/subscription/PlanChangeConfirmModal.tsx` (新規作成)

**目的**: プラン変更確認モーダルを実装

**必要なデータ**:
```typescript
interface PlanChangeConfirmModalProps {
  currentPlan: {
    type: PlanType;
    duration: 1 | 3;
  };
  newPlan: {
    type: PlanType;
    duration: 1 | 3;
  };
  currentPeriodEnd: Date;  // renewalDateから取得
  onConfirm: () => void;
  onCancel: () => void;
}
```

**データの取得元**:
- `currentPlan.type`, `currentPlan.duration` → `useSubscriptionContext()`から取得
- `currentPeriodEnd` → `useSubscriptionContext().renewalDate`から取得
- 料金情報 → `getPlanPrices()`から取得

**UI構成**:
1. **モーダルヘッダー**: 「プラン変更の確認」
2. **現在のプラン表示**: プラン名、期間、月額料金
3. **矢印アイコン**: 変更を視覚的に表現
4. **新しいプラン表示**: プラン名、期間、月額料金
5. **プロレーション（差額）表示**:
   - 現在のプラン返金額（15日分）: -¥990
   - 新プラン日割り請求額（15日分）: +¥4,900
   - 今回のお支払い合計: ¥3,910
6. **次回以降の請求**: 次回請求日、次回以降の料金
7. **注意事項**: プラン変更の注意点
8. **ボタン**: キャンセル、プラン変更を確定

**依存コンポーネント**:
- `@/components/ui/dialog` → モーダル表示
- `@/components/ui/button` → ボタン
- `@/components/ui/separator` → 区切り線
- `lucide-react` → アイコン（ArrowDown）
- `date-fns` → 日付フォーマット

**実装の詳細**:
```typescript
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
import { ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PlanType } from '@/utils/subscriptionPlans';
import { formatPlanDisplay } from '@/utils/planDisplay';
import {
  calculateProration,
  calculateDaysRemaining,
  PlanInfo,
} from '@/utils/prorationCalculator';
import { getPlanPrices, PlanPrices } from '@/services/pricing';

interface PlanChangeConfirmModalProps {
  currentPlan: {
    type: PlanType;
    duration: 1 | 3;
  };
  newPlan: {
    type: PlanType;
    duration: 1 | 3;
  };
  currentPeriodEnd: Date;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PlanChangeConfirmModal: React.FC<PlanChangeConfirmModalProps> = ({
  currentPlan,
  newPlan,
  currentPeriodEnd,
  onConfirm,
  onCancel,
}) => {
  // 料金情報を取得（getPlanPrices()で取得済みの料金を使用）
  const [planPrices, setPlanPrices] = React.useState<PlanPrices | null>(null);

  React.useEffect(() => {
    async function fetchPrices() {
      const { prices } = await getPlanPrices();
      setPlanPrices(prices);
    }
    fetchPrices();
  }, []);

  if (!planPrices) {
    return null; // ローディング中
  }

  // 現在のプランの料金を取得
  const currentPrice =
    planPrices[`${currentPlan.type}_${currentPlan.duration}m`]?.unit_amount || 0;

  // 新プランの料金を取得
  const newPrice =
    planPrices[`${newPlan.type}_${newPlan.duration}m`]?.unit_amount || 0;

  // 残り日数を計算
  const daysRemaining = calculateDaysRemaining(currentPeriodEnd.toISOString());

  // プロレーションを計算
  const proration = calculateProration(
    {
      type: currentPlan.type,
      duration: currentPlan.duration,
      price: currentPrice,
    },
    {
      type: newPlan.type,
      duration: newPlan.duration,
      price: newPrice,
    },
    daysRemaining
  );

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>プラン変更の確認</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 現在のプラン */}
          <div>
            <p className="text-sm text-muted-foreground">現在のプラン</p>
            <p className="font-bold text-lg">
              {formatPlanDisplay(currentPlan.type, currentPlan.duration)}
            </p>
            <p className="text-sm text-muted-foreground">
              ¥{currentPrice.toLocaleString()}/月
            </p>
          </div>

          {/* 矢印 */}
          <div className="flex justify-center">
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* 新しいプラン */}
          <div>
            <p className="text-sm text-muted-foreground">変更後のプラン</p>
            <p className="font-bold text-lg">
              {formatPlanDisplay(newPlan.type, newPlan.duration)}
            </p>
            <p className="text-sm text-muted-foreground">
              ¥{newPrice.toLocaleString()}/月
            </p>
          </div>

          <Separator />

          {/* プロレーション（差額）表示 */}
          <div className="bg-blue-50 p-4 rounded-md space-y-2">
            <p className="text-sm font-semibold">今回のお支払い</p>

            {/* 残り期間の返金 */}
            <div className="flex justify-between text-sm">
              <span>現在のプラン返金（{daysRemaining}日分）</span>
              <span className="text-green-600 font-medium">
                -¥{Math.abs(proration.refund).toLocaleString()}
              </span>
            </div>

            {/* 新プランの日割り */}
            <div className="flex justify-between text-sm">
              <span>新プラン（{daysRemaining}日分）</span>
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
            <p className="text-sm text-muted-foreground">
              次回請求日:{' '}
              {format(currentPeriodEnd, 'yyyy年M月d日', { locale: ja })}
            </p>
            <p className="text-sm text-muted-foreground">
              次回以降: ¥{newPrice.toLocaleString()}/月
            </p>
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-50 p-3 rounded-md">
            <p className="text-xs text-gray-700">
              ⚠️
              プラン変更を確定すると、現在のプランはキャンセルされ、新しいプランに切り替わります。
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

### 3. `src/pages/Subscription.tsx` (修正)

**修正箇所**:

#### 3.1 インポート追加

```typescript
import { PlanChangeConfirmModal } from '@/components/subscription/PlanChangeConfirmModal';
```

#### 3.2 状態管理追加

```typescript
// プラン変更確認モーダル用の状態
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [selectedNewPlan, setSelectedNewPlan] = useState<{
  type: PlanType;
  duration: 1 | 3;
} | null>(null);
```

#### 3.3 `handleSubscribe` 関数の修正

**修正前**:
```typescript
const handleSubscribe = async (selectedPlanType: PlanType) => {
  setIsLoading(true);
  try {
    // 新規ユーザー・既存契約者問わず、直接Checkoutに遷移
    const returnUrl = window.location.origin + '/subscription/success';
    const { url, error } = await createCheckoutSession(returnUrl, selectedPlanType, selectedDuration);
    // ...
  }
};
```

**修正後**:
```typescript
const handleSubscribe = async (selectedPlanType: PlanType) => {
  setIsLoading(true);
  try {
    // 既存契約者かどうかで分岐
    if (isSubscribed) {
      // 既存契約者 → 確認モーダルを表示
      console.log('既存契約者: プラン変更確認モーダルを表示します', {
        currentPlan: planType,
        currentDuration: currentDuration,
        selectedPlan: selectedPlanType,
        selectedDuration: selectedDuration
      });

      // モーダル表示
      setSelectedNewPlan({
        type: selectedPlanType,
        duration: selectedDuration,
      });
      setShowConfirmModal(true);
      setIsLoading(false);
    } else {
      // 新規ユーザー → Checkoutに遷移
      console.log('新規ユーザー: Checkoutに遷移します', {
        planType: selectedPlanType,
        duration: selectedDuration
      });

      const returnUrl = window.location.origin + '/subscription/success';
      const { url, error } = await createCheckoutSession(returnUrl, selectedPlanType, selectedDuration);

      if (error) {
        throw error;
      }

      if (url) {
        window.location.href = url;
      }
      setIsLoading(false);
    }
  } catch (error) {
    console.error('購読エラー:', error);
    toast({
      title: "エラーが発生しました",
      description: error instanceof Error ? error.message : "処理の開始に失敗しました。もう一度お試しください。",
      variant: "destructive",
    });
    setIsLoading(false);
  }
};
```

#### 3.4 確認ハンドラーの追加

```typescript
/**
 * プラン変更確認モーダルで「確定」ボタンが押されたときの処理
 */
const handleConfirmPlanChange = async () => {
  if (!selectedNewPlan) return;

  setIsLoading(true);
  setShowConfirmModal(false);

  try {
    console.log('プラン変更を確定します', {
      currentPlan: planType,
      currentDuration: currentDuration,
      newPlan: selectedNewPlan.type,
      newDuration: selectedNewPlan.duration
    });

    // Option 3: Stripe Checkoutでプラン変更
    const returnUrl = window.location.origin + '/subscription?updated=true';
    const { url, error } = await createCheckoutSession(
      returnUrl,
      selectedNewPlan.type,
      selectedNewPlan.duration
    );

    if (error) {
      throw error;
    }

    if (url) {
      window.location.href = url;
    }
  } catch (error) {
    console.error('プラン変更エラー:', error);
    toast({
      title: "エラーが発生しました",
      description: error instanceof Error ? error.message : "プラン変更に失敗しました。もう一度お試しください。",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
    setSelectedNewPlan(null);
  }
};

/**
 * プラン変更確認モーダルで「キャンセル」ボタンが押されたときの処理
 */
const handleCancelPlanChange = () => {
  setShowConfirmModal(false);
  setSelectedNewPlan(null);
  setIsLoading(false);
};
```

#### 3.5 JSX追加（returnの最後）

```typescript
return (
  <Layout>
    {/* ... 既存のUI ... */}

    {/* プラン変更確認モーダル */}
    {showConfirmModal && selectedNewPlan && planType && currentDuration && renewalDate && (
      <PlanChangeConfirmModal
        currentPlan={{
          type: planType,
          duration: currentDuration as 1 | 3,
        }}
        newPlan={selectedNewPlan}
        currentPeriodEnd={new Date(renewalDate)}
        onConfirm={handleConfirmPlanChange}
        onCancel={handleCancelPlanChange}
      />
    )}
  </Layout>
);
```

#### 3.6 Success URL処理の追加

```typescript
// Success URL処理: プラン変更完了時のトースト表示
useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  if (params.get('updated') === 'true') {
    toast({
      title: "プランを変更しました",
      description: "サブスクリプションの変更が完了しました。",
    });
    // URLをクリーンアップ
    window.history.replaceState({}, '', '/subscription');
  }
}, [toast]);
```

---

## 🧪 テスト計画

### Unit Tests (prorationCalculator.ts)

```typescript
// src/utils/__tests__/prorationCalculator.test.ts

describe('calculateProration', () => {
  test('Standard 1ヶ月 → Feedback 1ヶ月（15日残り）', () => {
    const result = calculateProration(
      { type: 'standard', duration: 1, price: 1980 },
      { type: 'feedback', duration: 1, price: 9800 },
      15
    );

    expect(result.refund).toBe(-990);      // -1980 / 30 * 15
    expect(result.newCharge).toBe(4900);   // 9800 / 30 * 15
    expect(result.total).toBe(3910);       // -990 + 4900
    expect(result.isUpgrade).toBe(true);
    expect(result.isDowngrade).toBe(false);
  });

  test('Feedback 1ヶ月 → Standard 1ヶ月（10日残り）', () => {
    const result = calculateProration(
      { type: 'feedback', duration: 1, price: 9800 },
      { type: 'standard', duration: 1, price: 1980 },
      10
    );

    expect(result.refund).toBe(-3267);     // -9800 / 30 * 10
    expect(result.newCharge).toBe(660);    // 1980 / 30 * 10
    expect(result.total).toBe(-2607);      // -3267 + 660 (返金)
    expect(result.isUpgrade).toBe(false);
    expect(result.isDowngrade).toBe(true);
  });
});

describe('calculateDaysRemaining', () => {
  test('2025-12-15の残り日数（現在: 2025-12-01）', () => {
    // モックで現在日時を固定
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-12-01T00:00:00Z'));

    const result = calculateDaysRemaining('2025-12-15T00:00:00Z');
    expect(result).toBe(14);

    jest.useRealTimers();
  });
});
```

### Manual Tests (UI)

#### Test Case 1: モーダル表示確認
1. 既存契約者でログイン
2. 別のプランの「選択」ボタンをクリック
3. ✅ プラン変更確認モーダルが表示される
4. ✅ プロレーション金額が正しく表示される
5. ✅ 次回請求日が正しく表示される

#### Test Case 2: プラン変更フロー
1. モーダルで「プラン変更を確定」ボタンをクリック
2. ✅ Stripe Checkoutに遷移する
3. ✅ テストカードで決済完了
4. ✅ `/subscription?updated=true`にリダイレクト
5. ✅ トーストで「プランを変更しました」が表示される
6. ✅ Stripe Dashboardで二重課金がないことを確認

#### Test Case 3: キャンセル動作
1. モーダルで「キャンセル」ボタンをクリック
2. ✅ モーダルが閉じる
3. ✅ プラン変更されない

---

## 🔧 環境変数

**不要**（既存のOption 3実装を使用）

---

## 📊 リスク分析

| リスク | 発生確率 | 深刻度 | 対策 |
|--------|---------|--------|------|
| UI実装ミス | 🟡 中（10-15%） | 🟡 Medium | 目視テストで即発見 |
| プロレーション計算ミス | 🟢 低（5-10%） | 🟠 High | ユニットテストで発見 |
| 環境変数ミス | 🟢 低（5-10%） | 🚨 Critical | 既存のOption 3を使用（不要） |
| 二重課金 | ✅ 0% | - | Option 3のロジックで完全防止 |

**合計バグ発生確率**: **20-35%**（Option 1の35-60%より低い）

---

## 📅 実装スケジュール

### Phase 1: 基盤実装（30分）
- [ ] `prorationCalculator.ts` 作成
- [ ] ユニットテスト作成・実行

### Phase 2: UI実装（60分）
- [ ] `PlanChangeConfirmModal.tsx` 作成
- [ ] `Subscription.tsx` 修正

### Phase 3: テスト（30分）
- [ ] ローカルで動作確認
- [ ] TypeScriptコンパイルエラー確認
- [ ] UI表示確認

### Phase 4: デプロイ・検証（30分）
- [ ] Vercel Previewデプロイ
- [ ] Test 2B実施（Standard → Feedback）
- [ ] Stripe Dashboardで二重課金チェック

**合計**: 約2.5時間

---

## 🎯 完了の定義（Definition of Done）

- [ ] prorationCalculator.ts のユニットテストが全て通過
- [ ] TypeScriptコンパイルエラーがゼロ
- [ ] プラン変更確認モーダルが正しく表示される
- [ ] プロレーション金額が正確に計算・表示される
- [ ] Test 2B（Standard → Feedback）で二重課金が発生しない
- [ ] Stripe Dashboardで既存サブスクが自動キャンセルされることを確認
- [ ] TASK-TRACKER.mdのIssue 3を「完了」に更新

---

## 🔗 関連ドキュメント

- [plan-change-comparison.md](./plan-change-comparison.md) - Option 1とOption 2の比較分析
- [2025-11-28-deeplink-disabled-root-cause.md](../issues/2025-11-28-deeplink-disabled-root-cause.md) - Deep Link無効化の根本原因
- [TASK-TRACKER.md](../TASK-TRACKER.md) - Issue 3: プロレーション表示なし問題

---

**最終更新**: 2025-11-29
**作成者**: AI開発チーム
