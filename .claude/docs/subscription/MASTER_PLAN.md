# サブスクリプション実装マスタープラン

**最終ゴール**: 本番環境でサブスクリプション機能を完全稼働させる

**作成日**: 2025-11-29
**現在ステータス**: 🟡 Phase 1（料金バグ修正）

---

## 📊 現状サマリー

### 実装済み機能

| 機能 | 実装 | テスト | 本番 |
|------|------|--------|------|
| 新規登録 | ✅ | ✅ | ⏳ |
| プラン変更 | ✅ | 🟡 | ⏳ |
| キャンセル | ✅ | ❌ | ⏳ |
| 料金表示 | ✅ | ✅ | ⏳ |
| 二重課金防止 | ✅ | ❌ | ⏳ |

### Critical Bugs

| Bug | 状態 | 修正日 |
|-----|------|--------|
| ブラウザバックで既存プラン解除 | ✅ 修正済 | 2025-11-28 |
| Webhook環境変数バグ | ✅ 修正済 | 2025-11-28 |
| **プロレーション表示の料金バグ** | **⏳ 対応中** | - |

---

## 🎯 実装完了までの3ステップ

### Phase 1: 料金バグ修正（35分）⏳

**現在のフェーズ**

**問題**: プラン変更時のプロレーション表示が間違った料金を使用

**料金の差異**:
- Standard 1mo: ハードコード ¥4,000 vs 実際 ¥1,980（2倍）
- Feedback 1mo: ハードコード ¥1,480 vs 実際 ¥9,800（6.6倍）

---

#### Task 1.1: PlanChangeConfirmModal.tsx修正（15分）

**ファイル**: `src/components/subscription/PlanChangeConfirmModal.tsx`

**修正内容**:

```typescript
// 1. インポート追加
import { getPlanPrices, type PlanPrices } from '@/services/pricing';

// 2. State追加
const [planPrices, setPlanPrices] = React.useState<PlanPrices | null>(null);
const [loading, setLoading] = React.useState(true);

// 3. useEffect追加
React.useEffect(() => {
  async function fetchPrices() {
    const { prices, error } = await getPlanPrices();
    if (!error && prices) {
      setPlanPrices(prices);
    }
    setLoading(false);
  }
  fetchPrices();
}, []);

// 4. 料金計算を修正（Lines 75-88）
if (!planPrices || loading) {
  return null; // またはローディング表示
}

const currentPriceKey = `${currentPlan.type}_${currentPlan.duration}m` as keyof PlanPrices;
const newPriceKey = `${newPlan.type}_${newPlan.duration}m` as keyof PlanPrices;

const currentPlanInfo: PlanInfo = {
  type: currentPlan.type,
  duration: currentPlan.duration,
  monthlyPrice: planPrices[currentPriceKey]?.unit_amount || 0, // ✅ 修正
};

const newPlanInfo: PlanInfo = {
  type: newPlan.type,
  duration: newPlan.duration,
  monthlyPrice: planPrices[newPriceKey]?.unit_amount || 0, // ✅ 修正
};
```

**検証**:
- [ ] TypeScriptコンパイルエラーなし
- [ ] npm run dev でConsole warning/errorなし

**所要時間**: 15分

---

#### Task 1.2: 動作確認（15分）

**テストケース 1**: Standard 1mo → Feedback 1mo

1. テストユーザーでログイン（kyasya00@gmail.com）
2. `/subscription` でFeedback 1moを選択
3. 確認モーダル表示
4. **確認項目**:
   - [ ] 現在のプラン料金: ¥1,980/月
   - [ ] 新しいプラン料金: ¥9,800/月
   - [ ] 差額（プロレーション）が正しく表示される

**テストケース 2**: Feedback 1mo → Standard 1mo

1. `/subscription` でStandard 1moを選択
2. 確認モーダル表示
3. **確認項目**:
   - [ ] 現在のプラン料金: ¥9,800/月
   - [ ] 新しいプラン料金: ¥1,980/月
   - [ ] 返金額（プロレーション）が正しく表示される

**所要時間**: 15分

---

#### Task 1.3: ドキュメント更新（5分）

- [ ] このファイル（MASTER_PLAN.md）のPhase 1を完了にマーク
- [ ] Phase 2に進む

**所要時間**: 5分

---

**Phase 1 合計**: 35分

---

### Phase 2: 完全テスト（1時間45分）⏸️

**前提条件**:
- Phase 1完了（料金バグ修正済み）
- テスト環境（Stripe Test Mode）
- テストユーザー: kyasya00@gmail.com

---

#### Test 1: 新規登録 ✅

**ステータス**: ✅ 完了（2025-11-28）

**結果**: 正常動作確認済み

---

#### Test 2A: ダウングレード（15分）⏸️

**テストケース**: Feedback 1mo → Standard 1mo

**前提条件**: アクティブなFeedback 1moプラン

**手順**:
1. `/subscription` でStandard 1moを選択
2. **確認モーダル**でプロレーション確認
   - 現在: Feedback ¥9,800/月
   - 新規: Standard ¥1,980/月
   - 返金額: 約¥7,820（残日数に応じて）
3. 「変更する」クリック
4. Stripe Checkout画面に遷移
5. テストカード（4242 4242 4242 4242）で支払い
6. `/subscription?updated=true` にリダイレクト

**検証項目**:
- [ ] モーダルの料金が正しい
- [ ] Stripe Dashboard: アクティブなサブスクが1つだけ（Standard）
- [ ] Stripe Dashboard: 旧サブスク（Feedback）がキャンセル済み
- [ ] Database: `plan_type='standard'`, `is_active=true`
- [ ] Edge Function Logs: stripe-webhook 200 OK

**期待結果**: ダウングレード成功、二重課金なし

**所要時間**: 15分

---

#### Test 2B: アップグレード（15分）⏸️

**テストケース**: Standard 1mo → Feedback 1mo

**前提条件**: アクティブなStandard 1moプラン

**手順**:
1. `/subscription` でFeedback 1moを選択
2. **確認モーダル**でプロレーション確認
   - 現在: Standard ¥1,980/月
   - 新規: Feedback ¥9,800/月
   - 追加料金: 約¥7,820（残日数に応じて）
3. 「変更する」クリック
4. Stripe Checkout画面に遷移
5. 支払い完了
6. `/subscription?updated=true` にリダイレクト

**検証項目**:
- [ ] モーダルの料金が正しい
- [ ] Stripe: アクティブなサブスクが1つだけ（Feedback）
- [ ] Stripe: 旧サブスク（Standard）がキャンセル済み
- [ ] DB: `plan_type='feedback'`, `is_active=true`
- [ ] Webhook: 200 OK

**期待結果**: アップグレード成功、二重課金なし

**所要時間**: 15分

---

#### Test 2C: ブラウザバック（10分）⏸️

**テストケース**: Checkout離脱で既存プランが維持される

**前提条件**: アクティブなStandard 1moプラン

**手順**:
1. `/subscription` でFeedback 1moを選択
2. 確認モーダルで「変更する」クリック
3. Stripe Checkout画面に遷移
4. **ブラウザバックで `/subscription` に戻る**（支払いせず）
5. 既存プランが維持されているか確認

**検証項目**:
- [ ] Stripe: Standard 1moがまだアクティブ
- [ ] DB: `is_active=true`, `plan_type='standard'`
- [ ] `/subscription`: 「現在のプラン: スタンダード（1ヶ月）」表示
- [ ] Console: `subscribed: true`

**期待結果**: 既存プラン維持（修正済みバグの再確認）

**所要時間**: 10分

---

#### Test 3A: 期間延長（15分）⏸️

**テストケース**: Standard 1mo → Standard 3mo

**前提条件**: アクティブなStandard 1moプラン

**手順**:
1. `/subscription` で期間タブ「3ヶ月」を選択
2. Standardプランの「このプランに変更する」クリック
3. 確認モーダルでプロレーション確認
   - 現在: Standard 1mo ¥1,980/月
   - 新規: Standard 3mo ¥1,782/月（約10%割引）
4. Stripe Checkout画面に遷移
5. 支払い完了

**検証項目**:
- [ ] モーダルの料金が正しい
- [ ] Stripe: アクティブなサブスクが1つだけ（Standard 3mo）
- [ ] Stripe: 旧サブスク（1mo）がキャンセル済み
- [ ] DB: `duration=3`, `is_active=true`

**期待結果**: 期間延長成功、二重課金なし

**所要時間**: 15分

---

#### Test 3B: 期間短縮（15分）⏸️

**テストケース**: Standard 3mo → Standard 1mo

**前提条件**: アクティブなStandard 3moプラン

**手順**:
1. `/subscription` で期間タブ「1ヶ月」を選択
2. Standardプランの「このプランに変更する」クリック
3. 確認モーダルでプロレーション確認
4. Stripe Checkout画面に遷移
5. 支払い完了

**検証項目**:
- [ ] モーダルの料金が正しい
- [ ] Stripe: アクティブなサブスクが1つだけ（Standard 1mo）
- [ ] Stripe: クレジット残高が正しく計算されている
- [ ] DB: `duration=1`, `is_active=true`

**期待結果**: 期間短縮成功、二重課金なし

**所要時間**: 15分

---

#### Test 4: キャンセル（15分）⏸️

**テストケース**: サブスクリプションのキャンセル

**前提条件**: アクティブなサブスクリプション

**手順**:
1. アカウントページから「キャンセル」ボタンをクリック
2. Customer Portal画面に遷移
3. キャンセル確認
4. キャンセル完了

**検証項目**:
- [ ] Stripe: `cancel_at_period_end=true`
- [ ] DB: `cancel_at_period_end=true`
- [ ] 期間終了まではアクセス可能
- [ ] `/subscription`: 「○月○日に終了予定」表示

**期待結果**: キャンセル成功、期間終了まで利用可能

**所要時間**: 15分

---

#### Test 5: 二重課金防止（20分）⏸️

**テストケース**: 同時プラン変更でも二重課金なし

**前提条件**: アクティブなStandard 1moプラン

**手順**:
1. ブラウザタブ1: Standard 3moに変更（Checkout画面表示）
2. ブラウザタブ2: Feedback 1moに変更（Checkout画面表示）
3. タブ1で支払い完了
4. タブ2で支払い完了

**検証項目**:
- [ ] Stripe: アクティブなサブスクが1つだけ（Feedback 1mo）
- [ ] Stripe: Standard 3moサブスクがキャンセル済み
- [ ] 最後に支払ったプランが有効
- [ ] 二重課金が発生していない

**期待結果**: 二重課金なし、最後のプランのみ有効

**所要時間**: 20分

---

**Phase 2 合計**: 1時間45分

---

### Phase 3: 本番環境準備（1時間25分）⏸️

**概要**: Stripe本番環境とVercel本番環境への切り替え

---

#### Task 3.1: Stripe本番環境準備（30分）

**手順**:

1. Stripe Dashboard → 本番モードに切り替え
2. 本番用Webhookエンドポイント設定
   - URL: `https://your-production-domain.vercel.app/functions/v1/stripe-webhook`
   - イベント:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
3. Webhook署名シークレット取得
4. 本番用APIキー取得
   - Publishable Key: `pk_live_XXX`
   - Secret Key: `sk_live_XXX`

**検証項目**:
- [ ] Webhook URLが正しい
- [ ] 必要なイベントがすべて選択されている
- [ ] Webhook署名シークレット取得完了
- [ ] APIキー取得完了

**所要時間**: 30分

---

#### Task 3.2: 本番Price ID追加（10分）

**手順**:

1. Stripe Dashboard → Products → 各プランのPrice IDを確認
2. `src/utils/subscriptionPlans.ts` に本番Price ID追加

**修正箇所**:

```typescript
export const STRIPE_PRICE_IDS = {
  test: {
    standard_1m: 'price_1SX...', // 既存
    standard_3m: 'price_1SX...',
    feedback_1m: 'price_1SX...',
    feedback_3m: 'price_1SX...',
  },
  live: {
    standard_1m: 'price_LIVE_XXX', // 追加
    standard_3m: 'price_LIVE_YYY',
    feedback_1m: 'price_LIVE_ZZZ',
    feedback_3m: 'price_LIVE_AAA',
  }
};
```

**検証項目**:
- [ ] すべてのプランに本番Price IDが設定
- [ ] Price IDが正しい（Stripe Dashboardと一致）

**所要時間**: 10分

---

#### Task 3.3: Vercel環境変数設定（15分）

**手順**:

1. Vercel Dashboard → Settings → Environment Variables
2. 本番環境用の環境変数を追加:

```
STRIPE_MODE=live
STRIPE_PUBLISHABLE_KEY=pk_live_XXX
STRIPE_SECRET_KEY=sk_live_XXX
STRIPE_WEBHOOK_SECRET=whsec_live_XXX
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJXXX...
```

3. 環境変数のスコープを「Production」に設定

**検証項目**:
- [ ] すべての環境変数が設定されている
- [ ] 本番用のキーが使用されている
- [ ] Supabase URLが本番用

**所要時間**: 15分

---

#### Task 3.4: 本番環境切り替え（30分）

**手順**:

1. main branchにマージ
2. Vercel自動デプロイ待機
3. デプロイ完了後、本番環境で新規登録テスト:
   - **実際のクレジットカード**を使用
   - 最小額プラン（Standard 1mo）で検証
4. Stripe Dashboard確認
5. Database確認
6. Edge Function Logs確認

**検証項目**:
- [ ] デプロイ成功
- [ ] Stripe本番モードで決済成功
- [ ] Database更新成功（`is_active=true`, `environment='live'`）
- [ ] Webhook 200 OK
- [ ] アクセス権限付与成功

**重要**: 最初は小額プラン（Standard 1mo ¥1,980）で検証

**所要時間**: 30分

---

**Phase 3 合計**: 1時間25分

---

## 📋 完了チェックリスト

### Phase 1: 料金バグ修正 ⏳

- [ ] Task 1.1: PlanChangeConfirmModal.tsx修正
- [ ] Task 1.2: 動作確認
- [ ] Task 1.3: ドキュメント更新

### Phase 2: 完全テスト ⏸️

- [✅] Test 1: 新規登録
- [ ] Test 2A: ダウングレード
- [ ] Test 2B: アップグレード
- [ ] Test 2C: ブラウザバック
- [ ] Test 3A: 期間延長
- [ ] Test 3B: 期間短縮
- [ ] Test 4: キャンセル
- [ ] Test 5: 二重課金防止

### Phase 3: 本番環境準備 ⏸️

- [ ] Task 3.1: Stripe本番環境準備
- [ ] Task 3.2: 本番Price ID追加
- [ ] Task 3.3: Vercel環境変数設定
- [ ] Task 3.4: 本番環境切り替え

---

## 🎯 完了条件

以下のすべてを満たしたら完了:

1. ✅ すべてのバグ修正完了
2. ✅ テスト環境で全テストケース合格（8/8）
3. ✅ 本番環境で新規登録・プラン変更・キャンセルが正常動作
4. ✅ Webhook正常動作確認
5. ✅ 二重課金が発生しないことを確認

---

## 📊 進捗状況

| Phase | 進捗 | 所要時間 |
|-------|------|---------|
| Phase 1: 料金バグ修正 | 0% | 35分 |
| Phase 2: 完全テスト | 12.5%（1/8） | 1時間45分 |
| Phase 3: 本番環境準備 | 0% | 1時間25分 |

**全体進捗**: 約4%

**残り所要時間**: 約3時間45分

---

## 📚 参考情報

### 修正済みBugs

1. ✅ **ブラウザバックで既存プラン解除**（2025-11-28修正）
   - 詳細: `archive/issues/browser-back-bug-analysis.md`

2. ✅ **Webhook環境変数バグ**（2025-11-28修正）
   - 詳細: `archive/issues/2025-11-28-webhook-environment-bug.md`

### システム仕様

- **アーキテクチャ**: `archive/specifications/system-specification.md`
- **プラン変更フロー**: Option 3（Stripe Checkout方式）
- **二重課金防止**: Webhook完了後にキャンセル方式
- **料金取得**: 3段階キャッシュ（メモリ → localStorage → Edge Function）

### 開発ガイド

- **環境変数管理**: `archive/environment-management.md`
- **デプロイチェックリスト**: `archive/deployment-checklist.md`
- **トラブルシューティング**: `archive/guides/troubleshooting/`

---

**最終更新**: 2025-11-29
**作成者**: Claude Code
**次のアクション**: Phase 1 Task 1.1実行（PlanChangeConfirmModal.tsx修正）
