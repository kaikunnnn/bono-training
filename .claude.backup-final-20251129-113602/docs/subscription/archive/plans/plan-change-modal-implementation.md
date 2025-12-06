# プラン変更確認モーダル - 仕様と実装計画

**作成日**: 2025-11-28
**実装方式**: Option 2（Option 3 + 独自UI確認モーダル）
**目的**: ユーザーがプロレーション（差額）を確認してからプラン変更できるようにする

---

## 📋 仕様

### 1. ユーザーフロー

```
[サブスクリプションページ]
  ↓ ユーザーが別プランを選択
[確認モーダル表示] ← NEW
  ├─ 現在のプラン表示
  ├─ 新しいプラン表示
  ├─ プロレーション（差額）計算表示
  ├─ 次回請求日・金額表示
  └─ [キャンセル] or [確定]
  ↓ 確定クリック
[Stripe Checkout]
  ↓ 決済完了
[サブスクリプションページ（更新完了）]
```

### 2. モーダル表示内容

#### レイアウト

```
┌─────────────────────────────────────────┐
│  プラン変更の確認                       │
├─────────────────────────────────────────┤
│                                         │
│  現在のプラン                           │
│  Standard 1ヶ月プラン                   │
│  ¥6,800/月                              │
│                                         │
│              ↓                          │
│                                         │
│  変更後のプラン                         │
│  Feedback 1ヶ月プラン                   │
│  ¥1,480/月                              │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  📊 今回のお支払い                      │
│                                         │
│  現在のプラン返金（15日分）             │
│                           -¥3,400       │
│                                         │
│  新プラン（15日分）                     │
│                           +¥740         │
│  ─────────────────────────────          │
│  今回のお支払い合計                     │
│                           -¥2,660 返金  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  次回請求日: 2025年12月13日             │
│  次回以降: ¥1,480/月                    │
│                                         │
├─────────────────────────────────────────┤
│  ⚠️ プラン変更を確定すると、現在のプラン│
│  はキャンセルされ、新しいプランに切り  │
│  替わります。                           │
├─────────────────────────────────────────┤
│           [キャンセル]  [プラン変更を確定] │
└─────────────────────────────────────────┘
```

### 3. プロレーション計算ロジック

#### 計算式

```typescript
// 1ヶ月 = 30日として計算

// 1. 現在のプランの日割り単価
const currentDailyRate = currentPlan.monthlyPrice / 30;

// 2. 新プランの日割り単価
const newDailyRate = newPlan.monthlyPrice / 30;

// 3. 残り日数（次回更新日までの日数）
const daysRemaining = Math.floor(
  (currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
);

// 4. 現在のプランの返金額（マイナス値）
const refund = -(currentDailyRate * daysRemaining);

// 5. 新プランの日割り請求額
const newCharge = newDailyRate * daysRemaining;

// 6. 合計
const total = refund + newCharge;
```

#### 計算例

**ケース1: Standard 1ヶ月（¥6,800/月）→ Feedback 1ヶ月（¥1,480/月）、15日残り**

```
currentDailyRate = 6800 / 30 = 226.67円/日
newDailyRate = 1480 / 30 = 49.33円/日
daysRemaining = 15日

refund = -(226.67 × 15) = -3,400円
newCharge = 49.33 × 15 = 740円
total = -3,400 + 740 = -2,660円（返金）
```

**ケース2: Feedback 1ヶ月（¥1,480/月）→ Standard 1ヶ月（¥6,800/月）、10日残り**

```
currentDailyRate = 1480 / 30 = 49.33円/日
newDailyRate = 6800 / 30 = 226.67円/日
daysRemaining = 10日

refund = -(49.33 × 10) = -493円
newCharge = 226.67 × 10 = 2,267円
total = -493 + 2,267 = 1,774円（追加請求）
```

### 4. 技術仕様

#### 使用技術
- **UI**: shadcn/ui Dialog
- **スタイル**: Tailwind CSS
- **日付フォーマット**: date-fns
- **アイコン**: lucide-react

#### データフロー

```typescript
// 1. ユーザーがプラン選択
handleSubscribe(selectedPlanType) {
  if (isSubscribed) {
    // 既存契約者 → モーダル表示
    setSelectedNewPlan(selectedPlanType);
    setShowConfirmModal(true);
  }
}

// 2. モーダル表示
<PlanChangeConfirmModal
  currentPlan={{ type, duration, price }}
  newPlan={{ type, duration, price }}
  subscriptionInfo={{ currentPeriodEnd, daysRemaining }}
  onConfirm={handleConfirmPlanChange}
  onCancel={() => setShowConfirmModal(false)}
/>

// 3. 確定ボタンクリック
handleConfirmPlanChange() {
  // Option 3のロジックを使用（二重課金防止）
  createCheckoutSession(returnUrl, newPlan, duration);
}
```

---

## 🛠️ 実装計画

### Phase 1: プロレーション計算ロジック実装

#### Step 1-1: プロレーション計算関数作成
**ファイル**: `src/utils/prorationCalculator.ts`（新規作成）

**実装内容**:
```typescript
export interface PlanInfo {
  type: PlanType;
  duration: 1 | 3;
  monthlyPrice: number;
}

export interface ProrationResult {
  refund: number;
  newCharge: number;
  total: number;
  daysRemaining: number;
}

export function calculateProration(
  currentPlan: PlanInfo,
  newPlan: PlanInfo,
  currentPeriodEnd: Date
): ProrationResult
```

**テストケース**:
- Standard 1ヶ月 → Feedback 1ヶ月（15日残り）
- Feedback 1ヶ月 → Standard 1ヶ月（10日残り）
- Standard 1ヶ月 → Standard 3ヶ月（20日残り）

**完了条件**:
- [ ] 関数実装完了
- [ ] 3つのテストケースが正しい値を返す
- [ ] 端数処理が正しい（Math.round使用）

---

#### Step 1-2: プラン価格取得関数作成
**ファイル**: `src/utils/subscriptionPlans.ts`（既存ファイルに追加）

**実装内容**:
```typescript
export function getPlanMonthlyPrice(
  planType: PlanType,
  duration: 1 | 3
): number {
  const plans = {
    standard: {
      1: 6800,
      3: 5800,
    },
    feedback: {
      1: 1480,
      3: 1280,
    },
  };

  return plans[planType][duration];
}
```

**完了条件**:
- [ ] 関数実装完了
- [ ] すべてのプラン・期間の価格が正しく取得できる

---

### Phase 2: 確認モーダルUI実装

#### Step 2-1: モーダルコンポーネントのスケルトン作成
**ファイル**: `src/components/subscription/PlanChangeConfirmModal.tsx`（新規作成）

**実装内容**:
```typescript
interface PlanChangeConfirmModalProps {
  currentPlan: PlanInfo;
  newPlan: PlanInfo;
  currentPeriodEnd: Date;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PlanChangeConfirmModal: React.FC<PlanChangeConfirmModalProps>
```

**UI構成**:
- Dialog（shadcn/ui）
- DialogHeader: タイトル
- DialogContent: 本体
- DialogFooter: ボタン

**完了条件**:
- [ ] コンポーネント作成
- [ ] モーダルが表示される
- [ ] キャンセルボタンで閉じる

---

#### Step 2-2: プラン表示部分の実装
**実装内容**:
- 現在のプラン表示
- 矢印（ArrowDown アイコン）
- 新しいプラン表示

**完了条件**:
- [ ] プラン名が正しく表示される
- [ ] 月額料金が正しく表示される
- [ ] デザインが整っている

---

#### Step 2-3: プロレーション表示部分の実装
**実装内容**:
- 「今回のお支払い」セクション
- 返金額（現在のプラン）
- 新プランの日割り請求額
- 合計金額

**完了条件**:
- [ ] プロレーション計算が正しく実行される
- [ ] 金額がカンマ区切りで表示される
- [ ] 返金の場合は「返金」と表示される
- [ ] 色分け（返金=緑、追加請求=赤）

---

#### Step 2-4: 次回請求情報の実装
**実装内容**:
- 次回請求日
- 次回以降の月額料金

**完了条件**:
- [ ] 日付が日本語フォーマットで表示される
- [ ] 新プランの月額料金が表示される

---

#### Step 2-5: 注意事項とボタンの実装
**実装内容**:
- 注意事項テキスト
- キャンセルボタン
- 確定ボタン

**完了条件**:
- [ ] 注意事項が目立つデザイン
- [ ] ボタンクリックでイベント発火

---

### Phase 3: Subscription.tsxへの統合

#### Step 3-1: 状態管理の追加
**ファイル**: `src/pages/Subscription.tsx`

**実装内容**:
```typescript
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [selectedNewPlan, setSelectedNewPlan] = useState<{
  type: PlanType;
  duration: 1 | 3;
} | null>(null);
```

**完了条件**:
- [ ] 状態変数追加完了

---

#### Step 3-2: handleSubscribe関数の修正
**実装内容**:
```typescript
const handleSubscribe = async (selectedPlanType: PlanType) => {
  if (isSubscribed) {
    // 既存契約者 → 確認モーダル表示
    setSelectedNewPlan({
      type: selectedPlanType,
      duration: selectedDuration,
    });
    setShowConfirmModal(true);
  } else {
    // 新規ユーザー → 直接Checkout
    // ... 既存ロジック
  }
};
```

**完了条件**:
- [ ] 既存契約者の場合、モーダルが表示される
- [ ] 新規ユーザーは従来通りCheckoutに遷移

---

#### Step 3-3: handleConfirmPlanChange関数の実装
**実装内容**:
```typescript
const handleConfirmPlanChange = async () => {
  setIsLoading(true);
  try {
    const returnUrl = window.location.origin + '/subscription?updated=true';
    const { url, error } = await createCheckoutSession(
      returnUrl,
      selectedNewPlan!.type,
      selectedNewPlan!.duration
    );

    if (error) throw error;
    if (url) window.location.href = url;
  } catch (error) {
    toast({
      title: "エラー",
      description: "プラン変更に失敗しました。",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
    setShowConfirmModal(false);
  }
};
```

**完了条件**:
- [ ] 確定ボタンでCheckoutに遷移
- [ ] エラー時にトースト表示
- [ ] ローディング状態が正しく管理される

---

#### Step 3-4: モーダルコンポーネントの配置
**実装内容**:
```typescript
return (
  <>
    {/* 既存のUI */}

    {/* 確認モーダル */}
    {showConfirmModal && selectedNewPlan && (
      <PlanChangeConfirmModal
        currentPlan={{
          type: planType!,
          duration: currentDuration!,
          monthlyPrice: getPlanMonthlyPrice(planType!, currentDuration!),
        }}
        newPlan={{
          type: selectedNewPlan.type,
          duration: selectedNewPlan.duration,
          monthlyPrice: getPlanMonthlyPrice(
            selectedNewPlan.type,
            selectedNewPlan.duration
          ),
        }}
        currentPeriodEnd={subscriptionEndDate!}
        onConfirm={handleConfirmPlanChange}
        onCancel={() => setShowConfirmModal(false)}
      />
    )}
  </>
);
```

**完了条件**:
- [ ] モーダルが正しく表示される
- [ ] プロップスが正しく渡される

---

### Phase 4: テスト実施

#### Step 4-1: ユニットテスト
**テスト対象**: `prorationCalculator.ts`

**テストケース**:
```typescript
describe('calculateProration', () => {
  test('Standard 1ヶ月 → Feedback 1ヶ月、15日残り', () => {
    const result = calculateProration(
      { type: 'standard', duration: 1, monthlyPrice: 6800 },
      { type: 'feedback', duration: 1, monthlyPrice: 1480 },
      new Date('2025-12-13') // 15日後
    );

    expect(result.refund).toBe(-3400);
    expect(result.newCharge).toBe(740);
    expect(result.total).toBe(-2660);
  });

  // 他のケースも同様
});
```

**完了条件**:
- [ ] 3つのテストケースがすべてパス

---

#### Step 4-2: UIの目視確認

**詳細テストガイド**: `phase4-testing-guide.md` の「Phase 4-2: UIの目視確認」セクション参照

**確認項目**:
- [ ] モーダルが正しく表示される
- [ ] プラン名が正しい
- [ ] プロレーション金額が正しい
- [ ] 次回請求日が正しい
- [ ] キャンセルボタンでモーダルが閉じる
- [ ] 確定ボタンでCheckoutに遷移する

**テストケース数**: 8ケース + レスポンシブ + 複数パターン + エッジケース

---

#### Step 4-3: Test 2B実施（E2Eテスト）

**詳細テストガイド**: `phase4-testing-guide.md` の「Phase 4-3: Test 2B実施」セクション参照

**テストフロー（10ステップ）**:
1. 現在の状態確認（Standard 1ヶ月契約中）
2. プラン変更開始
3. モーダル内容確認（プロレーション表示）
4. プラン変更確定
5. **Stripe Checkout画面確認（最重要: "Update subscription"表示）**
6. 支払い完了
7. 変更後の状態確認
8. Stripeダッシュボード確認
9. Edge Functionログ確認
10. データベース確認（オプション）

**完了条件**:
- [ ] Checkout画面で「Update subscription」と表示（新規購読ではない）
- [ ] プロレーション金額が正しい
- [ ] 二重課金が発生していない
- [ ] データベースが正しく更新されている
- [ ] Edge Functionログにエラーなし

---

## 📂 ファイル構成

### 新規作成ファイル
```
src/
├── utils/
│   └── prorationCalculator.ts          # プロレーション計算ロジック
└── components/
    └── subscription/
        └── PlanChangeConfirmModal.tsx  # 確認モーダルUI
```

### 修正ファイル
```
src/
├── utils/
│   └── subscriptionPlans.ts  # getPlanMonthlyPrice関数追加
└── pages/
    └── Subscription.tsx      # モーダル統合
```

---

## ✅ 全体チェックリスト

### Phase 1: プロレーション計算ロジック
- [ ] Step 1-1: プロレーション計算関数作成
- [ ] Step 1-2: プラン価格取得関数作成

### Phase 2: 確認モーダルUI
- [ ] Step 2-1: モーダルコンポーネントのスケルトン作成
- [ ] Step 2-2: プラン表示部分の実装
- [ ] Step 2-3: プロレーション表示部分の実装
- [ ] Step 2-4: 次回請求情報の実装
- [ ] Step 2-5: 注意事項とボタンの実装

### Phase 3: Subscription.tsx統合
- [ ] Step 3-1: 状態管理の追加
- [ ] Step 3-2: handleSubscribe関数の修正
- [ ] Step 3-3: handleConfirmPlanChange関数の実装
- [ ] Step 3-4: モーダルコンポーネントの配置

### Phase 4: テスト
- [ ] Step 4-1: ユニットテスト
- [ ] Step 4-2: UIの目視確認
- [ ] Step 4-3: Test 2B実施（E2Eテスト）

---

## 📊 見積もり

| Phase | 所要時間（目安） |
|-------|-----------------|
| Phase 1 | 30分 |
| Phase 2 | 1時間 |
| Phase 3 | 30分 |
| Phase 4 | 1時間 |
| **合計** | **3時間** |

---

## 🎯 成功基準

1. ✅ ユーザーがプロレーション（差額）を確認できる
2. ✅ 金額が正確に計算・表示される
3. ✅ 二重課金が発生しない
4. ✅ Test 2Bがすべてパスする

---

**作成日**: 2025-11-28
**ステータス**: 実装準備完了
**次のアクション**: Phase 1から順次実装開始
