# サブスクリプション実装マスタープラン

**最終ゴール**: 本番環境でサブスクリプション機能を完全稼働させる

**作成日**: 2025-11-29
**現在ステータス**: 🟡 Phase 1（料金バグ修正）

---

## 📊 現状サマリー

### 実装済み機能

| 機能         | 実装 | テスト | 本番 |
| ------------ | ---- | ------ | ---- |
| 新規登録     | ✅   | ✅     | ⏳   |
| プラン変更   | ✅   | 🟡     | ⏳   |
| キャンセル   | ✅   | ❌     | ⏳   |
| 料金表示     | ✅   | ✅     | ⏳   |
| 二重課金防止 | ✅   | ❌     | ⏳   |

### Critical Bugs

| Bug                              | 状態          | 修正日     |
| -------------------------------- | ------------- | ---------- |
| ブラウザバックで既存プラン解除   | ✅ 修正済     | 2025-11-28 |
| Webhook 環境変数バグ             | ✅ 修正済     | 2025-11-28 |
| **プロレーション表示の料金バグ** | **⏳ 対応中** | -          |

---

## 🎯 実装完了までの 3 ステップ

### Phase 1: 料金バグ修正（35 分）⏳

**現在のフェーズ**

**問題**: プラン変更時のプロレーション表示が間違った料金を使用

**料金の差異**:

- Standard 1mo: ハードコード ¥4,000 vs 実際 ¥1,980（2 倍）
- Feedback 1mo: ハードコード ¥1,480 vs 実際 ¥9,800（6.6 倍）

---

#### Task 1.1: PlanChangeConfirmModal.tsx 修正（15 分）

**ファイル**: `src/components/subscription/PlanChangeConfirmModal.tsx`

**修正内容**:

```typescript
// 1. インポート追加
import { getPlanPrices, type PlanPrices } from "@/services/pricing";

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

const currentPriceKey =
  `${currentPlan.type}_${currentPlan.duration}m` as keyof PlanPrices;
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

**実施結果（記入欄）**:

**実施日時**: 2025-11-29 10:12

**修正内容**:

- ✅ `getPlanPrices()` インポート追加
- ✅ Stripe 動的料金取得の useEffect 追加
- ✅ `getPlanMonthlyPrice()` を削除し `planPrices[key].unit_amount` に置き換え

**検証結果**:

- ✅ TypeScript コンパイルエラーなし
- ✅ Vite HMR 更新成功
- ✅ Console warning/error なし

**ステータス**: ✅ 完了

---

#### Task 1.2: 動作確認テスト（15 分）

**目的**: ブラウザで実際にモーダルを表示し、Stripe 動的料金が正しく表示されることを確認

**前提条件**:

- テストユーザー: kyasya00@gmail.com
- 現在のプラン: Standard 1mo（Test 1 で登録済み）
- テスト環境: http://localhost:8080

---

**テストケース 1**: Standard 1mo → Feedback 1mo（アップグレード）

**手順**:

1. http://localhost:8080 にアクセス
2. kyasya00@gmail.com でログイン
3. `/subscription` ページに移動
4. 「グロースプラン（Feedback）」の「1 ヶ月」タブを選択
5. 「このプランに変更する」ボタンをクリック
6. **確認モーダルが表示される**

**確認項目（修正前の値 → 修正後の期待値）**:

- [ ] 現在のプラン料金: ~~¥4,000/月~~ → **¥1,980/月** ✅
- [ ] 新しいプラン料金: ~~¥1,480/月~~ → **¥9,800/月** ✅
- [ ] プロレーション（差額）: 正しく計算されている
- [ ] Console error なし

**参考（過去の Test 1 結果）**:

- Test 1（新規登録）は 2025-11-28 に成功済み
- Database: `plan_type='standard'`, `duration=1`, `is_active=true`
- Stripe: sub_1SYIEyKUVUnt8Gty1b8qsP1a (active)

---

**テストケース 2**: Feedback 1mo → Standard 1mo（ダウングレード）

**注意**: このテストは実際にプラン変更を完了させる必要はありません。モーダルの料金表示だけ確認してキャンセルして OK です。

**手順**:

1. （テストケース 1 でモーダルを確認後）「キャンセル」をクリック
2. 「スタンダードプラン」の「1 ヶ月」タブを選択
3. 「このプランに変更する」ボタンをクリック
4. **確認モーダルが表示される**

**確認項目**:

- [ ] 現在のプラン料金: **¥1,980/月** ✅（Standard として表示）
- [ ] 新しいプラン料金: **¥1,980/月** ✅（同じプラン）

**注意**: 同じプランなので料金は同じです。期間変更（1mo → 3mo）で料金差を確認する場合は以下。

---

**テストケース 3（オプション）**: Standard 1mo → Standard 3mo（期間変更）

**手順**:

1. 「スタンダードプラン」の「3 ヶ月」タブを選択
2. 「このプランに変更する」ボタンをクリック
3. **確認モーダルが表示される**

**確認項目**:

- [ ] 現在のプラン料金: ¥1,980/月（1 ヶ月プラン）
- [ ] 新しいプラン料金: **¥1,782/月**（3 ヶ月プラン、10%割引）✅
- [ ] 割引が反映されている

---

**実施結果（記入欄）**:

**実施日時**: 2025-11-29 10:29

**テストケース 1 結果**:

- [○] 現在のプラン料金: ¥4989/月（実際の表示）
- [○] 新しいプラン料金: ¥9999/月（実際の表示）
- [○] プロレーション差額: 📊 今回のお支払い

現在のプラン返金（29 日分）
-¥4,814
新プラン（29 日分）
+¥9,666
今回のお支払い合計
+¥4,852

- [○] Console error: **なし**

□ メモと確認

- モーダルの「変更するボタン」を押すと Strripe の画面で、"Subscribe to グロースプラン ¥9,999permont"の画面が出てるけどこれはただしいのですか？
- 画面的には新しいプランに登録するように見えますが、更新の画面を出すことはできないんですか？？
- 更新後の Console が失敗しているように見えます
- 購読状態確認結果: {subscribed: false, planType: 'feedback', duration: 1, isSubscribed: false, cancelAtPeriodEnd: false, …},Edge Function から取得したアクセス権限を使用: {hasMemberAccess: false, hasLearningAccess: false, planType: 'feedback'}
- 課金後の/subscription 画面、/account 画面で入っているはずのプランが表示されていません。
- Stripe ダッシュボードを見ると２重課金です。ばーか、お前何回コレで失敗してるんだよ。本気出せよ。昨日からずっと 5 回以上修正してずっと同じ結果だぞお前わかっているかちゃんとやれカス
- Stripe のアカウント画面の情報は以下です。
- kyasya00@gmail.com
  新規顧客
  名前が入力されていません
  支払いを作成
  請求書を作成
  サブスクリプション
  ​
  商品
  ​
  頻度
  次の請求書
  グロースプラン
  有効
  毎月ごとに請求
  12/29 に ￥ 185
  グロースプラン

**テストケース 2 結果**:

- [ ] 料金表示: 正しい / 間違い
- [ ] Console error: あり / **なし**

**テストケース 3 結果**（実施した場合）:

- [ ] 期間変更の料金差: 正しい / 間違い

**スクリーンショット（任意）**:

- モーダルのスクリーンショットを撮影して保存

**ステータス**: ⏸️ 実施待ち / ✅ 成功 / ❌ 失敗

**備考**:

---

**所要時間**: 15 分

---

#### Task 1.3: ドキュメント更新（5 分）

- [ ] このファイル（MASTER_PLAN.md）の Phase 1 を完了にマーク
- [ ] Phase 2 に進む

**所要時間**: 5 分

---

**Phase 1 合計**: 35 分

---

### Phase 2: 完全テスト（1 時間 45 分）⏸️

**前提条件**:

- Phase 1 完了（料金バグ修正済み）
- テスト環境（Stripe Test Mode）
- テストユーザー: kyasya00@gmail.com

---

#### Test 1: 新規登録 ✅

**ステータス**: ✅ 完了（2025-11-28）

**結果**: 正常動作確認済み

---

#### Test 2A: ダウングレード（15 分）⏸️

**テストケース**: Feedback 1mo → Standard 1mo

**前提条件**: アクティブな Feedback 1mo プラン

**手順**:

1. `/subscription` で Standard 1mo を選択
2. **確認モーダル**でプロレーション確認
   - 現在: Feedback ¥9,800/月
   - 新規: Standard ¥1,980/月
   - 返金額: 約 ¥7,820（残日数に応じて）
3. 「変更する」クリック
4. Stripe Checkout 画面に遷移
5. テストカード（4242 4242 4242 4242）で支払い
6. `/subscription?updated=true` にリダイレクト

**検証項目**:

- [ ] モーダルの料金が正しい
- [ ] Stripe Dashboard: アクティブなサブスクが 1 つだけ（Standard）
- [ ] Stripe Dashboard: 旧サブスク（Feedback）がキャンセル済み
- [ ] Database: `plan_type='standard'`, `is_active=true`
- [ ] Edge Function Logs: stripe-webhook 200 OK

**期待結果**: ダウングレード成功、二重課金なし

---

**実施結果（記入欄）**:

**実施日時**: 2025-11-\_\_ **:**

**検証結果**:

- [ ] モーダル料金表示: 正しい / 間違い
- [ ] Stripe Dashboard 確認:
  - アクティブサブスク: **\_\_\_\_**（Subscription ID）
  - プラン: Standard 1mo / その他
  - 旧サブスクキャンセル済み: はい / いいえ
- [ ] Database 確認:
  - `plan_type`: **\_\_\_\_**
  - `is_active`: **\_\_\_\_**
  - `duration`: **\_\_\_\_**
- [ ] Edge Function Logs: 200 OK / エラー

**ステータス**: ⏸️ 実施待ち / ✅ 成功 / ❌ 失敗

**備考**:

---

**所要時間**: 15 分

---

#### Test 2B: アップグレード（15 分）⏸️

**テストケース**: Standard 1mo → Feedback 1mo

**前提条件**: アクティブな Standard 1mo プラン

**手順**:

1. `/subscription` で Feedback 1mo を選択
2. **確認モーダル**でプロレーション確認
   - 現在: Standard ¥1,980/月
   - 新規: Feedback ¥9,800/月
   - 追加料金: 約 ¥7,820（残日数に応じて）
3. 「変更する」クリック
4. Stripe Checkout 画面に遷移
5. 支払い完了
6. `/subscription?updated=true` にリダイレクト

**検証項目**:

- [ ] モーダルの料金が正しい
- [ ] Stripe: アクティブなサブスクが 1 つだけ（Feedback）
- [ ] Stripe: 旧サブスク（Standard）がキャンセル済み
- [ ] DB: `plan_type='feedback'`, `is_active=true`
- [ ] Webhook: 200 OK

**期待結果**: アップグレード成功、二重課金なし

---

**実施結果（記入欄）**:

**実施日時**: 2025-11-\_\_ **:**

**検証結果**:

- [ ] モーダル料金表示: 正しい / 間違い
- [ ] Stripe Dashboard 確認:
  - アクティブサブスク: **\_\_\_\_**（Subscription ID）
  - プラン: Feedback 1mo / その他
  - 旧サブスクキャンセル済み: はい / いいえ
- [ ] Database 確認:
  - `plan_type`: **\_\_\_\_**
  - `is_active`: **\_\_\_\_**
  - `duration`: **\_\_\_\_**
- [ ] Edge Function Logs: 200 OK / エラー

**ステータス**: ⏸️ 実施待ち / ✅ 成功 / ❌ 失敗

**備考**:

---

**所要時間**: 15 分

---

#### Test 2C: ブラウザバック（10 分）⏸️

**テストケース**: Checkout 離脱で既存プランが維持される

**前提条件**: アクティブな Standard 1mo プラン

**手順**:

1. `/subscription` で Feedback 1mo を選択
2. 確認モーダルで「変更する」クリック
3. Stripe Checkout 画面に遷移
4. **ブラウザバックで `/subscription` に戻る**（支払いせず）
5. 既存プランが維持されているか確認

**検証項目**:

- [ ] Stripe: Standard 1mo がまだアクティブ
- [ ] DB: `is_active=true`, `plan_type='standard'`
- [ ] `/subscription`: 「現在のプラン: スタンダード（1 ヶ月）」表示
- [ ] Console: `subscribed: true`

**期待結果**: 既存プラン維持（修正済みバグの再確認）

---

**実施結果（記入欄）**:

**実施日時**: 2025-11-\_\_ **:**

**検証結果**:

- [ ] Stripe Dashboard 確認:
  - アクティブサブスク: Standard 1mo 維持 / キャンセル済み
  - Subscription ID: **\_\_\_\_**
- [ ] Database 確認:
  - `plan_type`: **\_\_\_\_**
  - `is_active`: **\_\_\_\_**
- [ ] `/subscription` 表示: 「現在のプラン: スタンダード（1 ヶ月）」 表示あり / なし
- [ ] Console 確認: `subscribed: true` / false

**参考（過去のバグ）**:

- 2025-11-28 修正: ブラウザバックで既存プランが解除される問題
- 詳細: `archive/issues/browser-back-bug-analysis.md`

**ステータス**: ⏸️ 実施待ち / ✅ 成功 / ❌ 失敗

**備考**:

---

**所要時間**: 10 分

---

#### Test 3A: 期間延長（15 分）⏸️

**テストケース**: Standard 1mo → Standard 3mo

**前提条件**: アクティブな Standard 1mo プラン

**手順**:

1. `/subscription` で期間タブ「3 ヶ月」を選択
2. Standard プランの「このプランに変更する」クリック
3. 確認モーダルでプロレーション確認
   - 現在: Standard 1mo ¥1,980/月
   - 新規: Standard 3mo ¥1,782/月（約 10%割引）
4. Stripe Checkout 画面に遷移
5. 支払い完了

**検証項目**:

- [ ] モーダルの料金が正しい
- [ ] Stripe: アクティブなサブスクが 1 つだけ（Standard 3mo）
- [ ] Stripe: 旧サブスク（1mo）がキャンセル済み
- [ ] DB: `duration=3`, `is_active=true`

**期待結果**: 期間延長成功、二重課金なし

---

**実施結果（記入欄）**:

**実施日時**: 2025-11-\_\_ **:**

**検証結果**:

- [ ] モーダル料金表示:
  - 現在のプラン料金: ¥**\_\_**/月（期待: ¥1,980）
  - 新しいプラン料金: ¥**\_\_**/月（期待: ¥1,782、約 10%割引）
  - 料金差: 正しい / 間違い
- [ ] Stripe Dashboard 確認:
  - アクティブサブスク: **\_\_\_\_**（Subscription ID）
  - プラン: Standard 3mo / その他
  - 旧サブスク（1mo）キャンセル済み: はい / いいえ
- [ ] Database 確認:
  - `plan_type`: **\_\_\_\_**
  - `duration`: **\_\_\_\_**（期待: 3）
  - `is_active`: **\_\_\_\_**
- [ ] Edge Function Logs: 200 OK / エラー

**ステータス**: ⏸️ 実施待ち / ✅ 成功 / ❌ 失敗

**備考**:

---

**所要時間**: 15 分

---

#### Test 3B: 期間短縮（15 分）⏸️

**テストケース**: Standard 3mo → Standard 1mo

**前提条件**: アクティブな Standard 3mo プラン

**手順**:

1. `/subscription` で期間タブ「1 ヶ月」を選択
2. Standard プランの「このプランに変更する」クリック
3. 確認モーダルでプロレーション確認
4. Stripe Checkout 画面に遷移
5. 支払い完了

**検証項目**:

- [ ] モーダルの料金が正しい
- [ ] Stripe: アクティブなサブスクが 1 つだけ（Standard 1mo）
- [ ] Stripe: クレジット残高が正しく計算されている
- [ ] DB: `duration=1`, `is_active=true`

**期待結果**: 期間短縮成功、二重課金なし

---

**実施結果（記入欄）**:

**実施日時**: 2025-11-\_\_ **:**

**検証結果**:

- [ ] モーダル料金表示:
  - 現在のプラン料金: ¥**\_\_**/月（期待: ¥1,782、3 ヶ月プラン）
  - 新しいプラン料金: ¥**\_\_**/月（期待: ¥1,980、1 ヶ月プラン）
  - 料金差: 正しい / 間違い
- [ ] Stripe Dashboard 確認:
  - アクティブサブスク: **\_\_\_\_**（Subscription ID）
  - プラン: Standard 1mo / その他
  - クレジット残高: 正しく計算 / 計算ミス
- [ ] Database 確認:
  - `plan_type`: **\_\_\_\_**
  - `duration`: **\_\_\_\_**（期待: 1）
  - `is_active`: **\_\_\_\_**
- [ ] Edge Function Logs: 200 OK / エラー

**ステータス**: ⏸️ 実施待ち / ✅ 成功 / ❌ 失敗

**備考**:

---

**所要時間**: 15 分

---

#### Test 4: キャンセル（15 分）⏸️

**テストケース**: サブスクリプションのキャンセル

**前提条件**: アクティブなサブスクリプション

**手順**:

1. アカウントページから「キャンセル」ボタンをクリック
2. Customer Portal 画面に遷移
3. キャンセル確認
4. キャンセル完了

**検証項目**:

- [ ] Stripe: `cancel_at_period_end=true`
- [ ] DB: `cancel_at_period_end=true`
- [ ] 期間終了まではアクセス可能
- [ ] `/subscription`: 「○ 月 ○ 日に終了予定」表示

**期待結果**: キャンセル成功、期間終了まで利用可能

---

**実施結果（記入欄）**:

**実施日時**: 2025-11-\_\_ **:**

**検証結果**:

- [ ] Stripe Customer Portal 遷移: 成功 / 失敗
- [ ] キャンセル操作: 完了 / エラー
- [ ] Stripe Dashboard 確認:
  - `cancel_at_period_end`: true / false
  - 終了予定日: **\_\_\_\_**
- [ ] Database 確認:
  - `cancel_at_period_end`: **\_\_\_\_**
  - `is_active`: **\_\_\_\_**（期待: true、期間終了まで）
- [ ] `/subscription` 表示: 「○ 月 ○ 日に終了予定」 表示あり / なし
- [ ] 期間終了までコンテンツアクセス可能: はい / いいえ

**ステータス**: ⏸️ 実施待ち / ✅ 成功 / ❌ 失敗

**備考**:

---

**所要時間**: 15 分

---

#### Test 5: 二重課金防止（20 分）⏸️

**テストケース**: 同時プラン変更でも二重課金なし

**前提条件**: アクティブな Standard 1mo プラン

**手順**:

1. ブラウザタブ 1: Standard 3mo に変更（Checkout 画面表示）
2. ブラウザタブ 2: Feedback 1mo に変更（Checkout 画面表示）
3. タブ 1 で支払い完了
4. タブ 2 で支払い完了

**検証項目**:

- [ ] Stripe: アクティブなサブスクが 1 つだけ（Feedback 1mo）
- [ ] Stripe: Standard 3mo サブスクがキャンセル済み
- [ ] 最後に支払ったプランが有効
- [ ] 二重課金が発生していない

**期待結果**: 二重課金なし、最後のプランのみ有効

---

**実施結果（記入欄）**:

**実施日時**: 2025-11-\_\_ **:**

**検証結果**:

**タブ 1（Standard 3mo）の結果**:

- [ ] Checkout 画面表示: 成功 / 失敗
- [ ] 支払い完了: 成功 / 失敗
- [ ] 支払い完了時の Subscription ID: **\_\_\_\_**

**タブ 2（Feedback 1mo）の結果**:

- [ ] Checkout 画面表示: 成功 / 失敗
- [ ] 支払い完了: 成功 / 失敗
- [ ] 支払い完了時の Subscription ID: **\_\_\_\_**

**最終的な Stripe Dashboard 確認**:

- [ ] アクティブなサブスク数: **\_\_\_\_**（期待: 1 つのみ）
- [ ] アクティブなプラン: Feedback 1mo / その他
- [ ] Standard 3mo サブスク: キャンセル済み / アクティブ
- [ ] 二重課金: なし / **あり（要修正）**

**Database 確認**:

- [ ] `plan_type`: **\_\_\_\_**（期待: feedback）
- [ ] `duration`: **\_\_\_\_**（期待: 1）
- [ ] `is_active`: **\_\_\_\_**

**Edge Function Logs 確認**:

- [ ] Webhook 呼び出し回数: **\_\_\_\_**回
- [ ] 最後の Webhook: 200 OK / エラー

**参考（二重課金防止の仕様）**:

- Webhook 完了後に旧サブスクをキャンセルする実装
- 詳細: `archive/specifications/system-specification.md`

**ステータス**: ⏸️ 実施待ち / ✅ 成功 / ❌ 失敗

**備考**:

---

**所要時間**: 20 分

---

**Phase 2 合計**: 1 時間 45 分

---

### Phase 3: 本番環境準備（1 時間 25 分）⏸️

**概要**: Stripe 本番環境と Vercel 本番環境への切り替え

---

#### Task 3.1: Stripe 本番環境準備（30 分）

**手順**:

1. Stripe Dashboard → 本番モードに切り替え
2. 本番用 Webhook エンドポイント設定
   - URL: `https://your-production-domain.vercel.app/functions/v1/stripe-webhook`
   - イベント:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
3. Webhook 署名シークレット取得
4. 本番用 API キー取得
   - Publishable Key: `pk_live_XXX`
   - Secret Key: `sk_live_XXX`

**検証項目**:

- [ ] Webhook URL が正しい
- [ ] 必要なイベントがすべて選択されている
- [ ] Webhook 署名シークレット取得完了
- [ ] API キー取得完了

---

**実施結果（記入欄）**:

**実施日時**: 2025-11-\_\_ **:**

**Webhook 設定**:

- [ ] Webhook URL: **\*\*\*\***\*\***\*\*\*\***\_\_**\*\*\*\***\*\***\*\*\*\***
- [ ] イベント選択:
  - [ ] `checkout.session.completed`: 追加済み / 未
  - [ ] `customer.subscription.updated`: 追加済み / 未
  - [ ] `customer.subscription.deleted`: 追加済み / 未
- [ ] Webhook 署名シークレット: `whsec_live_________`（一部のみ記録）

**API キー取得**:

- [ ] Publishable Key: `pk_live_________`（一部のみ記録）
- [ ] Secret Key: `sk_live_________`（一部のみ記録）

**注意**: セキュリティ上、完全なキーはこのドキュメントに記載しないこと。環境変数に安全に保存すること。

**ステータス**: ⏸️ 実施待ち / ✅ 完了 / ❌ エラー

**備考**:

---

**所要時間**: 30 分

---

#### Task 3.2: 本番 Price ID 追加（10 分）

**手順**:

1. Stripe Dashboard → Products → 各プランの Price ID を確認
2. `src/utils/subscriptionPlans.ts` に本番 Price ID 追加

**修正箇所**:

```typescript
export const STRIPE_PRICE_IDS = {
  test: {
    standard_1m: "price_1SX...", // 既存
    standard_3m: "price_1SX...",
    feedback_1m: "price_1SX...",
    feedback_3m: "price_1SX...",
  },
  live: {
    standard_1m: "price_LIVE_XXX", // 追加
    standard_3m: "price_LIVE_YYY",
    feedback_1m: "price_LIVE_ZZZ",
    feedback_3m: "price_LIVE_AAA",
  },
};
```

**検証項目**:

- [ ] すべてのプランに本番 Price ID が設定
- [ ] Price ID が正しい（Stripe Dashboard と一致）

---

**実施結果（記入欄）**:

**実施日時**: 2025-11-\_\_ **:**

**Stripe Dashboard 確認**:

- [ ] Standard 1mo Price ID: **\_\_\_\_**
- [ ] Standard 3mo Price ID: **\_\_\_\_**
- [ ] Feedback 1mo Price ID: **\_\_\_\_**
- [ ] Feedback 3mo Price ID: **\_\_\_\_**

**コード修正確認**:

- [ ] `src/utils/subscriptionPlans.ts` 修正: 完了 / 未
- [ ] TypeScript コンパイル: エラーなし / エラーあり
- [ ] Git commit: 完了 / 未

**ステータス**: ⏸️ 実施待ち / ✅ 完了 / ❌ エラー

**備考**:

---

**所要時間**: 10 分

---

#### Task 3.3: Vercel 環境変数設定（15 分）

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
- [ ] Supabase URL が本番用

---

**実施結果（記入欄）**:

**実施日時**: 2025-11-\_\_ **:**

**Vercel 環境変数設定確認**:

- [ ] `STRIPE_MODE`: live / 未設定
- [ ] `STRIPE_PUBLISHABLE_KEY`: pk_live_xxx 設定済み / 未
- [ ] `STRIPE_SECRET_KEY`: sk_live_xxx 設定済み / 未
- [ ] `STRIPE_WEBHOOK_SECRET`: whsec_live_xxx 設定済み / 未
- [ ] `VITE_SUPABASE_URL`: 本番 URL 設定済み / 未
- [ ] `VITE_SUPABASE_ANON_KEY`: 本番 Key 設定済み / 未
- [ ] スコープ: Production / その他

**スクリーンショット**:

- [ ] Vercel 環境変数画面のスクリーンショット保存: 完了 / 未

**ステータス**: ⏸️ 実施待ち / ✅ 完了 / ❌ エラー

**備考**:

---

**所要時間**: 15 分

---

#### Task 3.4: 本番環境切り替え（30 分）

**手順**:

1. main branch にマージ
2. Vercel 自動デプロイ待機
3. デプロイ完了後、本番環境で新規登録テスト:
   - **実際のクレジットカード**を使用
   - 最小額プラン（Standard 1mo）で検証
4. Stripe Dashboard 確認
5. Database 確認
6. Edge Function Logs 確認

**検証項目**:

- [ ] デプロイ成功
- [ ] Stripe 本番モードで決済成功
- [ ] Database 更新成功（`is_active=true`, `environment='live'`）
- [ ] Webhook 200 OK
- [ ] アクセス権限付与成功

**重要**: 最初は小額プラン（Standard 1mo ¥1,980）で検証

---

**実施結果（記入欄）**:

**実施日時**: 2025-11-\_\_ **:**

**デプロイ確認**:

- [ ] main branch マージ: 完了 / 未
- [ ] Vercel デプロイステータス: 成功 / 失敗
- [ ] デプロイ URL: **\*\*\*\***\*\***\*\*\*\***\_\_**\*\*\*\***\*\***\*\*\*\***
- [ ] デプロイ完了時刻: **:**

**本番決済テスト**（Standard 1mo ¥1,980）:

- [ ] Stripe Checkout 表示: 成功 / 失敗
- [ ] 決済完了: 成功 / 失敗（実際のクレジットカード使用）
- [ ] リダイレクト: `/subscription?session_id=XXX` / エラー

**Stripe Dashboard 確認（本番モード）**:

- [ ] Customer 作成: 成功 / 失敗
- [ ] Subscription 作成: 成功 / 失敗
- [ ] Subscription ID: **\_\_\_\_**
- [ ] ステータス: active / その他
- [ ] Webhook 送信: 成功（200 OK） / 失敗

**Database 確認（本番 DB）**:

- [ ] `subscriptions` テーブル更新: あり / なし
- [ ] `plan_type`: **\_\_\_\_**（期待: standard）
- [ ] `duration`: **\_\_\_\_**（期待: 1）
- [ ] `is_active`: **\_\_\_\_**（期待: true）
- [ ] `environment`: **\_\_\_\_**（期待: live）

**Edge Function Logs 確認**:

- [ ] `stripe-webhook` ログ: 200 OK / エラー
- [ ] エラーメッセージ: なし / **\_\_\_\_**

**アクセス権限確認**:

- [ ] トレーニングコンテンツアクセス: 可能 / 不可

**⚠️ 注意事項**:

- 本番決済テストは**実際のお金が動きます**
- テスト後、必要に応じてサブスクをキャンセルすること
- 問題があれば即座にロールバックすること

**ステータス**: ⏸️ 実施待ち / ✅ 成功 / ❌ 失敗

**備考**:

---

**所要時間**: 30 分

---

**Phase 3 合計**: 1 時間 25 分

---

## 📋 完了チェックリスト

### Phase 1: 料金バグ修正 ⏳

- [ ] Task 1.1: PlanChangeConfirmModal.tsx 修正
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

- [ ] Task 3.1: Stripe 本番環境準備
- [ ] Task 3.2: 本番 Price ID 追加
- [ ] Task 3.3: Vercel 環境変数設定
- [ ] Task 3.4: 本番環境切り替え

---

## 🎯 完了条件

以下のすべてを満たしたら完了:

1. ✅ すべてのバグ修正完了
2. ✅ テスト環境で全テストケース合格（8/8）
3. ✅ 本番環境で新規登録・プラン変更・キャンセルが正常動作
4. ✅ Webhook 正常動作確認
5. ✅ 二重課金が発生しないことを確認

---

## 📊 進捗状況

| Phase                 | 進捗         | 所要時間     |
| --------------------- | ------------ | ------------ |
| Phase 1: 料金バグ修正 | 0%           | 35 分        |
| Phase 2: 完全テスト   | 12.5%（1/8） | 1 時間 45 分 |
| Phase 3: 本番環境準備 | 0%           | 1 時間 25 分 |

**全体進捗**: 約 4%

**残り所要時間**: 約 3 時間 45 分

---

## 📚 参考情報

### 修正済み Bugs

1. ✅ **ブラウザバックで既存プラン解除**（2025-11-28 修正）

   - 詳細: `archive/issues/browser-back-bug-analysis.md`

2. ✅ **Webhook 環境変数バグ**（2025-11-28 修正）
   - 詳細: `archive/issues/2025-11-28-webhook-environment-bug.md`

### システム仕様

- **アーキテクチャ**: `archive/specifications/system-specification.md`
- **プラン変更フロー**: Option 3（Stripe Checkout 方式）
- **二重課金防止**: Webhook 完了後にキャンセル方式
- **料金取得**: 3 段階キャッシュ（メモリ → localStorage → Edge Function）

### 開発ガイド

- **環境変数管理**: `archive/environment-management.md`
- **デプロイチェックリスト**: `archive/deployment-checklist.md`
- **トラブルシューティング**: `archive/guides/troubleshooting/`

---

**最終更新**: 2025-11-29
**作成者**: Claude Code
**次のアクション**: Phase 1 Task 1.1 実行（PlanChangeConfirmModal.tsx 修正）
