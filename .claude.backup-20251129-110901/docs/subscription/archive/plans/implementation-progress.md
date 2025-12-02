# プラン変更確認モーダル - 実装進捗記録

**開始日**: 2025-11-28
**実装方式**: Option 2（Option 3 + 独自UI確認モーダル）
**計画ドキュメント**: `plan-change-modal-implementation.md`

---

## 📊 全体進捗

| Phase | ステータス | 完了日時 |
|-------|----------|---------|
| Phase 1: プロレーション計算ロジック | ✅ 完了 | 2025-11-28 |
| Phase 2: 確認モーダルUI | ✅ 完了 | 2025-11-28 |
| Phase 3: Subscription.tsx統合 | ✅ 完了 | 2025-11-28 |
| Phase 4: テスト | ⏸️ 未着手 | - |

---

## ✅ Phase 1: プロレーション計算ロジック実装

### Step 1-1: プロレーション計算関数作成 ✅

**実施内容**:
- ファイル作成: `src/utils/prorationCalculator.ts`
- 実装した関数:
  - `calculateProration()`: プロレーション計算のメイン関数
  - `calculateDaysRemaining()`: 残り日数計算のヘルパー関数

**実装詳細**:

```typescript
export interface PlanInfo {
  type: PlanType;
  duration: 1 | 3;
  monthlyPrice: number;
}

export interface ProrationResult {
  refund: number;          // 現在のプランの返金額（マイナス値）
  newCharge: number;       // 新プランの日割り請求額
  total: number;           // 合計（refund + newCharge）
  daysRemaining: number;   // 残り日数
}

export function calculateProration(
  currentPlan: PlanInfo,
  newPlan: PlanInfo,
  currentPeriodEnd: Date
): ProrationResult
```

**計算ロジック**:
1. 1ヶ月を30日として日割り単価を計算
2. 残り日数を計算（次回更新日までの日数）
3. 現在のプランの返金額 = -(日割り単価 × 残り日数)
4. 新プランの請求額 = 日割り単価 × 残り日数
5. 合計 = 返金額 + 請求額

**計算例（ドキュメントに記載）**:
- Standard 1ヶ月（¥4,000/月）→ Feedback 1ヶ月（¥1,480/月）、15日残り
  - 返金: -¥2,000
  - 新請求: ¥740
  - 合計: -¥1,260（返金）

**完了条件**:
- [x] 関数実装完了
- [x] JSDocコメント追加
- [x] 型定義完備
- [ ] ユニットテスト（Phase 4で実施）

---

### Step 1-2: プラン価格取得関数作成 ✅

**実施内容**:
- ファイル編集: `src/utils/subscriptionPlans.ts`
- 追加した関数:
  - `getPlanMonthlyPrice()`: プランの月額料金を取得
  - `getPlanDisplayName()`: プラン名を取得

**実装詳細**:

```typescript
export function getPlanMonthlyPrice(
  planType: PlanType,
  duration: PlanDuration
): number {
  const plan = AVAILABLE_PLANS.find(
    (p) => p.type === planType && p.duration === duration
  );

  if (!plan) {
    console.error('プランが見つかりません:', { planType, duration });
    return 0;
  }

  return plan.pricePerMonth;
}

export function getPlanDisplayName(planType: PlanType): string {
  const planNames: Record<PlanType, string> = {
    standard: 'スタンダード',
    feedback: 'フィードバック',
  };

  return planNames[planType] || planType;
}
```

**使用例**:
```typescript
getPlanMonthlyPrice('standard', 1);  // 4000
getPlanMonthlyPrice('feedback', 3);  // 1280
getPlanDisplayName('standard');      // 'スタンダード'
```

**完了条件**:
- [x] 関数実装完了
- [x] JSDocコメント追加
- [x] 既存のAVAILABLE_PLANSを活用
- [x] エラーハンドリング追加

---

## 📝 Phase 1 完了サマリー

### 作成したファイル
- `src/utils/prorationCalculator.ts` (新規作成)

### 修正したファイル
- `src/utils/subscriptionPlans.ts` (関数2つ追加)

### 実装した機能
1. ✅ プロレーション計算ロジック
2. ✅ 残り日数計算
3. ✅ プラン価格取得
4. ✅ プラン名取得

### 次のステップ
- Phase 2: 確認モーダルUI実装

---

## ✅ Phase 2: 確認モーダルUI実装

### 実装サマリー ✅

**実施内容**:
- ファイル作成: `src/components/subscription/PlanChangeConfirmModal.tsx`
- Step 2-1～2-5を統合して実装

**実装した機能**:
1. ✅ Dialogコンポーネント（shadcn/ui）
2. ✅ 現在のプラン表示
3. ✅ 矢印アイコン（ArrowDown）
4. ✅ 新しいプラン表示
5. ✅ プロレーション（差額）計算・表示
6. ✅ 次回請求日・金額表示
7. ✅ 注意事項
8. ✅ キャンセル・確定ボタン

---

### Step 2-1～2-5: 統合実装 ✅

**コンポーネント構成**:

```typescript
interface PlanChangeConfirmModalProps {
  currentPlan: { type: PlanType; duration: PlanDuration };
  newPlan: { type: PlanType; duration: PlanDuration };
  currentPeriodEnd: Date;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**UI構成**:
1. **DialogHeader**: タイトル「プラン変更の確認」
2. **DialogContent**:
   - 現在のプラン表示（プラン名、月額料金）
   - 矢印アイコン
   - 新しいプラン表示（プラン名、月額料金）
   - Separator
   - プロレーション表示セクション（青背景）
     - 返金額（緑色）
     - 新プラン請求額
     - 合計（返金=緑、追加請求=赤）
   - 次回請求日・金額
   - 注意事項（黄色背景）
3. **DialogFooter**: キャンセル・確定ボタン

**実装の特徴**:
- ✅ `getPlanMonthlyPrice()`で動的に価格取得
- ✅ `getPlanDisplayName()`でプラン名取得
- ✅ `calculateProration()`でプロレーション計算
- ✅ `format()`（date-fns）で日付を日本語フォーマット
- ✅ 金額は`toLocaleString()`でカンマ区切り
- ✅ 返金時は緑色、追加請求時は赤色で表示

**完了条件**:
- [x] コンポーネント作成
- [x] propsインターフェース定義
- [x] プラン表示実装
- [x] プロレーション計算・表示
- [x] 次回請求情報表示
- [x] 注意事項表示
- [x] ボタン実装
- [x] JSDocコメント追加
- [ ] 目視確認（Phase 3統合後）

---

## ✅ Phase 3: Subscription.tsx統合（完了）

### Step 3-1: 状態管理の追加 ✅

**実施内容**:
- `PlanChangeConfirmModal`コンポーネントをインポート
- `renewalDate`をcontextから取得
- 状態変数を追加:
  - `showConfirmModal`: モーダル表示フラグ
  - `selectedNewPlan`: ユーザーが選択した新プラン情報

**追加コード**:
```typescript
import { PlanChangeConfirmModal } from '@/components/subscription/PlanChangeConfirmModal';

const { isSubscribed, planType, duration: currentDuration, renewalDate } = useSubscriptionContext();

const [showConfirmModal, setShowConfirmModal] = useState(false);
const [selectedNewPlan, setSelectedNewPlan] = useState<{
  type: PlanType;
  duration: 1 | 3;
} | null>(null);
```

**完了条件**:
- [x] インポート追加
- [x] 状態変数宣言
- [x] renewalDate取得

---

### Step 3-2: handleSubscribe関数の修正 ✅

**実施内容**:
- 既存契約者の場合、Checkoutに直接遷移せず、確認モーダルを表示するように変更

**修正箇所（src/pages/Subscription.tsx:78-126）**:
```typescript
const handleSubscribe = async (selectedPlanType: PlanType) => {
  setIsLoading(true);
  try {
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
      // 新規ユーザー → Checkoutに遷移（既存ロジック）
      const returnUrl = window.location.origin + '/subscription/success';
      const { url, error } = await createCheckoutSession(returnUrl, selectedPlanType, selectedDuration);

      if (error) throw error;
      if (url) window.location.href = url;
      setIsLoading(false);
    }
  } catch (error) {
    // エラーハンドリング
    toast({
      title: "エラーが発生しました",
      description: error instanceof Error ? error.message : "処理の開始に失敗しました。もう一度お試しください。",
      variant: "destructive",
    });
    setIsLoading(false);
  }
};
```

**変更点**:
- 既存契約者フロー: Checkout直接遷移 → モーダル表示
- ローディング状態の管理を最適化

**完了条件**:
- [x] 既存契約者ブランチでモーダル表示
- [x] 新規ユーザーブランチは既存ロジックのまま
- [x] ローディング状態管理

---

### Step 3-3: handleConfirmPlanChange関数の実装 ✅

**実施内容**:
- モーダルの「確定」ボタン押下時の処理を実装
- モーダルの「キャンセル」ボタン押下時の処理を実装

**追加関数（src/pages/Subscription.tsx:128-180）**:
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

    if (error) throw error;
    if (url) window.location.href = url;
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

**完了条件**:
- [x] 確定ボタン処理実装
- [x] キャンセルボタン処理実装
- [x] エラーハンドリング
- [x] 状態クリーンアップ

---

### Step 3-4: モーダルコンポーネントの配置 ✅

**実施内容**:
- JSX return内にモーダルコンポーネントを配置
- 条件付きレンダリング（必要なデータが全て揃っている場合のみ表示）

**追加JSX（src/pages/Subscription.tsx:242-254）**:
```typescript
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
```

**データ検証**:
- `showConfirmModal`: モーダル表示フラグ
- `selectedNewPlan`: ユーザー選択プラン
- `planType`: 現在のプランタイプ（必須）
- `currentDuration`: 現在の契約期間（必須）
- `renewalDate`: 次回請求日（必須、プロレーション計算に使用）

**完了条件**:
- [x] モーダルコンポーネント配置
- [x] 条件付きレンダリング
- [x] 全プロパティ正しく渡す
- [x] TypeScript型エラーなし

---

## 📝 Phase 3 完了サマリー

### 修正したファイル
- `src/pages/Subscription.tsx` (統合完了)

### 実装した機能
1. ✅ 状態管理の追加
2. ✅ プラン変更フローの変更（既存契約者）
3. ✅ 確認モーダルのハンドラー実装
4. ✅ モーダルコンポーネント配置

### TypeScript型チェック
```bash
npx tsc --noEmit
# → エラーなし
```

### 次のステップ
- Phase 4: テスト実施

---

## 🧪 Phase 4: テスト

### Step 4-1: ユニットテスト ✅

**実施内容**:
- プロレーション計算関数のユニットテストを作成
- 13個のテストケースを実装

**作成ファイル**: `src/utils/__tests__/prorationCalculator.test.ts`

**テストケース**:
1. ✅ Standard 1ヶ月 → Standard 3ヶ月（15日残り）
2. ✅ Feedback 1ヶ月 → Feedback 3ヶ月（20日残り）
3. ✅ Standard 1ヶ月 → Feedback 1ヶ月（15日残り）
4. ✅ Feedback 1ヶ月 → Standard 1ヶ月（10日残り）
5. ✅ 残り0日の場合（期限当日）
6. ✅ 残り1日の場合
7. ✅ 残り30日の場合（1ヶ月丸々）
8. ✅ 過去の日付を指定した場合（負の日数にならない）
9. ✅ Test 2B実際のケース（Standard → Feedback、15日残り）
10. ✅ `calculateDaysRemaining`: 15日後
11. ✅ `calculateDaysRemaining`: 0日（今日）
12. ✅ `calculateDaysRemaining`: 過去の日付
13. ✅ `calculateDaysRemaining`: 30日後

**テスト結果**:
```bash
PASS src/utils/__tests__/prorationCalculator.test.ts
Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```

**完了条件**:
- [x] ユニットテスト作成
- [x] 全テストケースパス（13/13）
- [x] エッジケースカバー（0日、1日、30日、過去の日付）
- [x] 実際のTest 2Bケースを含む

---

### Step 4-2: UIの目視確認 ⏸️

**テストガイド**: `phase4-testing-guide.md` の「Phase 4-2: UIの目視確認」セクション参照

**テスト内容**:
- モーダル表示確認（8テストケース）
- プロレーション表示確認
- レスポンシブデザイン確認
- 複数プランパターン確認
- エッジケース確認

**実施手順**:
1. 開発サーバー起動: `npm run dev`
2. 既存サブスクリプション契約のユーザーでログイン
3. テストガイドに従って各テストケースを実施
4. スクリーンショット撮影

**成功条件**:
- [ ] 全テストケース合格
- [ ] モーダルが正しく表示される
- [ ] プロレーション計算が正確
- [ ] UIが崩れていない

---

### Step 4-3: Test 2B実施（E2Eテスト） ⏸️

**テストガイド**: `phase4-testing-guide.md` の「Phase 4-3: Test 2B実施」セクション参照

**テスト内容**:
- Standard 1ヶ月 → Feedback 1ヶ月への完全なプラン変更フロー
- Stripe Checkout画面確認（Update subscription表示）
- 二重課金が発生しないことの確認
- データベース更新確認

**実施手順（10ステップ）**:
1. 現在の状態確認（Standard 1ヶ月契約中）
2. プラン変更開始
3. モーダル内容確認（プロレーション表示）
4. プラン変更確定
5. **Stripe Checkout画面確認（最重要）**
6. 支払い完了
7. 変更後の状態確認
8. Stripeダッシュボード確認
9. Edge Functionログ確認
10. データベース確認（オプション）

**成功条件（全て必須）**:
- [ ] Checkout画面で「Update subscription」と表示
- [ ] プロレーション計算が正確
- [ ] 二重課金が発生しない
- [ ] 変更後のプランが正しく反映
- [ ] Edge Functionログにエラーなし

**失敗パターン（これらが発生したら問題）**:
- ❌ Checkout画面で「Subscribe to...」と表示 → Deep Link問題再発
- ❌ 二重課金発生 → Option 3未動作
- ❌ プロレーション計算エラー → 計算ロジックバグ

---

## 📊 統計

| 項目 | 完了 | 未完了 | 合計 |
|------|------|--------|------|
| Phase | 3 | 1 | 4 |
| Step | 12 | 2 | 14 |
| ファイル作成 | 3 | 0 | 3 |
| ファイル修正 | 2 | 0 | 2 |
| ドキュメント作成 | 4 | 0 | 4 |

---

**最終更新**: 2025-11-28
**次の作業**: Phase 4 Step 4-2（UIの目視確認）

---

## ✅ 実装完了サマリー

### 作成したファイル（3ファイル）
1. `src/utils/prorationCalculator.ts` - プロレーション計算ロジック
2. `src/components/subscription/PlanChangeConfirmModal.tsx` - 確認モーダルコンポーネント
3. `src/utils/__tests__/prorationCalculator.test.ts` - ユニットテスト

### 修正したファイル（2ファイル）
1. `src/utils/subscriptionPlans.ts` - ヘルパー関数2つ追加
2. `src/pages/Subscription.tsx` - モーダル統合

### 実装した機能
- ✅ プロレーション（日割り）計算ロジック
- ✅ プラン変更確認モーダルUI
- ✅ Subscription.tsxへの統合
- ✅ ユニットテスト（13テストケース、全パス）

### 実装方式
**Option 2 (Option 3 + Custom UI)**:
- 二重課金防止: Option 3のCheckoutロジックを使用
- プロレーション表示: 独自UIで事前表示
- ユーザー体験: 確認→Checkout→完了の3ステップ

### 次のステップ
1. ⏸️ Phase 4-2: UIの目視確認（開発サーバーで動作確認）
2. ⏸️ Phase 4-3: Test 2B実施（E2Eテスト）
