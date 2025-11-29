# 決済機能 詳細タスク整理ドキュメント

最終更新: 2025-11-18

## 📋 目次

1. [現状の問題と優先度](#現状の問題と優先度)
2. [タスク1: 二重課金問題の修正](#タスク1-二重課金問題の修正)
3. [タスク2: cancel_url設定の修正](#タスク2-cancel_url設定の修正)
4. [タスク3: 期間変更機能の実装](#タスク3-期間変更機能の実装)
5. [タスク4: 解約同期遅延の調査](#タスク4-解約同期遅延の調査)
6. [タスク5: エラーリトライ処理](#タスク5-エラーリトライ処理)
7. [タスク6: セキュリティ強化](#タスク6-セキュリティ強化)
8. [タスク7: テスト環境整備](#タスク7-テスト環境整備)

---

## 現状の問題と優先度

### 🔴 優先度: 高（緊急対応が必要）

| 問題 | 影響範囲 | 推定工数 |
|------|---------|---------|
| 1. 二重課金問題 | 全ユーザー（金銭的損害） | 2-3時間 |
| 2. cancel_url設定ミス | 新規登録ユーザー（UX低下） | 30分 |
| 3. 期間変更機能未実装 | 既存ユーザー（UX低下） | 1-2時間 |

### 🟡 優先度: 中（改善が望ましい）

| 問題 | 影響範囲 | 推定工数 |
|------|---------|---------|
| 4. 解約同期遅延 | 解約ユーザー | 1-2時間（調査） |
| 5. エラーリトライなし | エラー発生時 | 2-3時間 |

### 🔵 優先度: 低（余裕があれば対応）

| 問題 | 影響範囲 | 推定工数 |
|------|---------|---------|
| 6. RLS設定未確認 | セキュリティ | 1-2時間 |
| 7. テスト環境未整備 | 開発効率 | 1時間 |

---

## タスク1: 二重課金問題の修正

### 問題の詳細

**発生条件:**
1. ユーザーAが既に「フィードバックプラン」を契約中
2. ユーザーAが「スタンダードプラン」に変更しようとする
3. チェックアウト完了時に新しいサブスクリプションが作成される
4. Webhook処理で古いサブスクリプションのキャンセル処理が実行される

**問題点:**
- `replace_subscription_id` が正しく設定されているが、キャンセル処理が失敗する可能性がある
- キャンセル失敗時も処理が継続されるため、2つのサブスクリプションが同時にアクティブになる

### 技術的原因

**ファイル:** `supabase/functions/stripe-webhook/index.ts:210-232`

```typescript
if (replaceSubscriptionId) {
  console.log(`既存サブスクリプション ${replaceSubscriptionId} をキャンセルします`);
  try {
    // 既存サブスクリプションを即座にキャンセル
    await stripe.subscriptions.cancel(replaceSubscriptionId);
    // ...
  } catch (cancelError) {
    console.error(`既存サブスクリプションのキャンセルエラー:`, cancelError.message);
    // キャンセルに失敗しても新しいサブスクリプションは有効なので、処理を継続
  }
}
```

**問題:**
1. try-catchで例外を握りつぶしている
2. キャンセル失敗時に新しいサブスクリプションもロールバックすべき
3. DB更新は成功してもStripe側でキャンセル失敗の可能性

### 修正方針

#### オプション1: Stripe Checkout Sessionで自動置換（推奨）

Stripe APIの `subscription_data.replace_subscription` を使用すると、チェックアウト完了時に自動的に古いサブスクリプションを置換できます。

**メリット:**
- Stripe側で原子性が保証される
- Webhook処理が不要
- 二重課金のリスクがない

**実装場所:** `supabase/functions/create-checkout/index.ts`

```typescript
const session = await stripe.checkout.sessions.create({
  customer: stripeCustomerId,
  mode: 'subscription',
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: returnUrl,
  cancel_url: cancelUrl,
  metadata: sessionMetadata,
  // 既存サブスクリプションがある場合は置換
  ...(existingSubscriptionId && {
    subscription_data: {
      replace_subscription: existingSubscriptionId,
      // 日割り計算を有効化
      proration_behavior: 'create_prorations',
      metadata: {
        user_id: user.id,
        plan_type: planType,
        duration: duration.toString()
      }
    }
  })
});
```

#### オプション2: Webhook処理の改善

現在の実装を改善し、エラー時にロールバックする。

**実装場所:** `supabase/functions/stripe-webhook/index.ts`

```typescript
if (replaceSubscriptionId) {
  console.log(`既存サブスクリプション ${replaceSubscriptionId} をキャンセルします`);
  try {
    await stripe.subscriptions.cancel(replaceSubscriptionId);
    console.log(`既存サブスクリプション ${replaceSubscriptionId} をキャンセルしました`);

    // DBの古いサブスクリプション情報も更新
    const { error: oldSubError } = await supabase
      .from("subscriptions")
      .update({ end_timestamp: new Date().toISOString() })
      .eq("stripe_subscription_id", replaceSubscriptionId);

    if (oldSubError) {
      // DB更新失敗時は新しいサブスクリプションもキャンセル
      console.error("古いサブスクリプション情報の更新エラー:", oldSubError);
      await stripe.subscriptions.cancel(subscriptionId);
      throw new Error("サブスクリプション更新に失敗しました");
    }
  } catch (cancelError) {
    console.error(`既存サブスクリプションのキャンセルエラー:`, cancelError.message);
    // 新しいサブスクリプションもキャンセル
    await stripe.subscriptions.cancel(subscriptionId);
    throw new Error("サブスクリプション変更に失敗しました");
  }
}
```

### 推奨する修正手順

**オプション1を推奨**（Stripe側で自動置換）

1. `supabase/functions/create-checkout/index.ts` を修正
2. `subscription_data.replace_subscription` を追加
3. Webhook側の手動キャンセル処理を削除
4. デプロイ
5. テスト（既存契約者でプラン変更を実行）
6. Stripeダッシュボードで古いサブスクリプションがキャンセルされていることを確認

### テスト計画

**テストケース:**
1. ✅ フィードバックプラン（1ヶ月） → スタンダードプラン（1ヶ月）
2. ✅ フィードバックプラン（3ヶ月） → スタンダードプラン（3ヶ月）
3. ✅ スタンダードプラン（1ヶ月） → フィードバックプラン（1ヶ月）
4. ✅ 新規ユーザーの初回契約（既存サブスクリプションなし）

**確認項目:**
- [ ] Stripeダッシュボードでアクティブなサブスクリプションが1つだけ
- [ ] DBの `user_subscriptions` テーブルで正しいプランタイプが保存されている
- [ ] 古いサブスクリプションが `canceled` ステータスになっている
- [ ] 日割り計算が正しく適用されている

### 失敗を防ぐためのチェックリスト

- [ ] `existingSubscriptionId` の取得ロジックが正しいか確認
- [ ] `replace_subscription` は有効なサブスクリプションIDのみ指定できる（既にキャンセル済みはNG）
- [ ] Webhook処理から手動キャンセル処理を削除
- [ ] ログ出力で置換処理を追跡できるようにする
- [ ] テスト環境で動作確認してから本番デプロイ

---

## タスク2: cancel_url設定の修正

### 問題の詳細

**発生条件:**
1. ユーザーがプラン選択画面からチェックアウトを開始
2. Stripeのチェックアウト画面で「戻る」をクリック
3. `/subscription/success` にリダイレクトされる
4. 404エラーが表示される

**期待される動作:**
- `/subscription` ページに戻る

### 技術的原因

**ファイル:** `supabase/functions/create-checkout/index.ts:141-143`

```typescript
// cancel_urlは/subscriptionページに設定（returnUrlではなく）
const baseUrl = returnUrl.split('/subscription')[0];
const cancelUrl = `${baseUrl}/subscription`;
```

**問題:**
- `returnUrl` が `/subscription/success` の場合、`split('/subscription')[0]` は正しく動作する
- しかし、コメントと実装が矛盾している可能性がある

### 修正方針

**シンプルな修正:**

```typescript
// cancel_urlは常に/subscriptionページに設定
const baseUrl = new URL(returnUrl).origin;
const cancelUrl = `${baseUrl}/subscription`;
```

### 修正手順

1. `supabase/functions/create-checkout/index.ts:141-143` を修正
2. デプロイ
3. テスト（チェックアウトを開始してキャンセル）
4. `/subscription` ページに戻ることを確認

### テスト計画

**テストケース:**
1. ✅ チェックアウトを開始してすぐキャンセル
2. ✅ チェックアウトで情報入力後にキャンセル

**確認項目:**
- [ ] `/subscription` ページに正しくリダイレクトされる
- [ ] エラーメッセージが表示されない
- [ ] プラン選択画面が正しく表示される

---

## タスク3: 期間変更機能の実装

### 問題の詳細

**発生条件:**
1. ユーザーAが「スタンダードプラン（1ヶ月）」を契約中
2. 「スタンダードプラン（3ヶ月）」に変更しようとする
3. 「現在のプラン」と判定され、ボタンが無効化される

**期待される動作:**
- 同じプランでも期間が異なれば変更可能

### 技術的原因

**ファイル:** `src/pages/Subscription.tsx:132`

```typescript
const isCurrentPlan = isSubscribed && planType === plan.id && currentDuration === selectedDuration;
```

**問題:**
- `planType === plan.id` のみでプランの一致を判定
- 期間（`currentDuration === selectedDuration`）も考慮されているが、タブ切り替えで `selectedDuration` が変わると判定が正しくない

### 修正方針

**修正コード:**

```typescript
const isCurrentPlan = isSubscribed &&
                      planType === plan.id &&
                      duration === selectedDuration; // durationはuseSubscriptionから取得
```

**注意点:**
- `currentDuration` は不要（`duration` で統一）
- `selectedDuration` はUIのタブで選択された期間
- `duration` はDBから取得した現在契約中の期間

### 修正手順

1. `src/pages/Subscription.tsx` の `isCurrentPlan` 判定ロジックを修正
2. `useSubscription` から `duration` を取得していることを確認
3. テスト

### テスト計画

**テストケース:**
1. ✅ スタンダードプラン（1ヶ月）契約中 → 「3ヶ月」タブに切り替え → ボタンが有効
2. ✅ スタンダードプラン（3ヶ月）契約中 → 「1ヶ月」タブに切り替え → ボタンが有効
3. ✅ スタンダードプラン（1ヶ月）契約中 → 「1ヶ月」タブ → 「現在のプラン」と表示
4. ✅ フィードバックプラン（1ヶ月）契約中 → スタンダードプランに切り替え → ボタンが有効

**確認項目:**
- [ ] 期間のみ変更する場合にボタンが有効化される
- [ ] プランと期間が同じ場合は「現在のプラン」と表示される
- [ ] プラン変更が正しく実行される

---

## タスク4: 解約同期遅延の調査

### 問題の詳細

**報告内容:**
- Stripeカスタマーポータルで解約しても、アカウントページで即時反映されない可能性

### 調査方針

#### ステップ1: Webhook処理の確認

**ファイル:** `supabase/functions/stripe-webhook/index.ts:362-413`

```typescript
async function handleSubscriptionDeleted(supabase: any, event: any) {
  console.log("customer.subscription.deletedイベントを処理中");

  const subscription = event.data.object;
  const subscriptionId = subscription.id;
  const userId = subscription.metadata?.user_id;

  // ...

  // user_subscriptionsテーブルを更新
  const { error: updateError } = await supabase
    .from("user_subscriptions")
    .update({
      is_active: false,
      plan_members: false,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId);
}
```

**確認事項:**
- [ ] Webhookイベントが正しく受信されているか（Stripeダッシュボードで確認）
- [ ] `customer.subscription.deleted` イベントが発火しているか
- [ ] `handleSubscriptionDeleted` が実行されているか（ログ確認）
- [ ] DB更新が成功しているか

#### ステップ2: キャンセルフロー確認

**Stripeでのキャンセル方法:**
1. カスタマーポータルで「キャンセル」をクリック
2. 「期間終了時にキャンセル」を選択（デフォルト）
3. → `customer.subscription.updated` イベント発火（`cancel_at_period_end: true`）
4. 期間終了時に `customer.subscription.deleted` イベント発火

**即時キャンセルの場合:**
1. 「今すぐキャンセル」を選択
2. → `customer.subscription.deleted` イベント発火

#### ステップ3: フロントエンド更新確認

**ファイル:** `src/hooks/useSubscription.ts`

```typescript
const fetchSubscriptionStatus = async () => {
  // ...
  const response = await checkSubscriptionStatus();
  // ...
};

useEffect(() => {
  if (!authLoading) {
    fetchSubscriptionStatus();
  }
}, [user, authLoading]);
```

**問題の可能性:**
- Edge Functionが古いデータをキャッシュしている
- ブラウザのキャッシュが原因
- リフレッシュトークンの期限切れ

### 調査手順

1. Stripeダッシュボードで解約操作を実行
2. Webhookログを確認（イベントが届いているか）
3. Supabase Edge Functionログを確認（処理が実行されたか）
4. DBを直接確認（`is_active`, `cancel_at_period_end` の値）
5. ブラウザでアカウントページをリロード
6. ネットワークタブでAPIレスポンスを確認

### 対策案

**問題が確認された場合:**

#### 対策1: リアルタイム更新

Supabase Realtime Subscriptionsを使用して、DB変更時に即座にUIを更新。

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('user_subscriptions')
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'user_subscriptions', filter: `user_id=eq.${user.id}` },
      (payload) => {
        console.log('サブスクリプション更新:', payload);
        fetchSubscriptionStatus();
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [user]);
```

#### 対策2: 手動リフレッシュボタン

アカウントページに「更新」ボタンを追加。

```typescript
<button onClick={() => refresh()}>
  更新
</button>
```

---

## タスク5: エラーリトライ処理

### 問題の詳細

**現状:**
- ネットワークエラー時に自動リトライなし
- 一時的なエラーでも失敗扱い

### 実装方針

#### オプション1: axios-retryを使用

```typescript
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // ネットワークエラーまたは5xxエラーの場合のみリトライ
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           (error.response?.status >= 500 && error.response?.status < 600);
  }
});
```

#### オプション2: 手動リトライロジック

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries <= 0 || !isRetryableError(error)) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, maxRetries - 1, delay * 2);
  }
}

function isRetryableError(error: any): boolean {
  // ネットワークエラーまたは5xxエラー
  return !error.response || (error.response.status >= 500 && error.response.status < 600);
}
```

### 実装場所

- `src/services/stripe.ts` の全関数
- Supabase Edge Functionsからの呼び出し

### 実装手順

1. `retryWithBackoff` ユーティリティ関数を作成（`src/utils/retry.ts`）
2. `stripe.ts` の各関数を修正
3. エラーログに「リトライ中」の情報を追加
4. テスト

### テスト計画

**テストケース:**
1. ネットワークを切断してAPIを呼び出し
2. Supabase Edge Functionを停止してAPIを呼び出し
3. 一時的なエラーをシミュレート

---

## タスク6: セキュリティ強化

### RLS（Row Level Security）設定

#### 確認すべきテーブル

1. `stripe_customers`
2. `user_subscriptions`
3. `subscriptions`

#### 推奨されるRLSポリシー

**stripe_customers:**
```sql
-- ユーザーは自分のStripe顧客情報のみ参照可能
CREATE POLICY "Users can view own stripe customer"
  ON stripe_customers FOR SELECT
  USING (auth.uid() = user_id);

-- 挿入・更新は認証済みユーザーのみ
CREATE POLICY "Authenticated users can insert stripe customer"
  ON stripe_customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**user_subscriptions:**
```sql
-- ユーザーは自分のサブスクリプション情報のみ参照可能
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 更新はサービスロールのみ（Webhook経由）
-- INSERT/UPDATE/DELETEはサービスロールキーでのみ許可
```

**subscriptions:**
```sql
-- ユーザーは自分のサブスクリプション履歴のみ参照可能
CREATE POLICY "Users can view own subscription history"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

### 実装手順

1. Supabase SQL Editorで現在のRLS設定を確認
2. 不足しているポリシーを追加
3. テスト（別ユーザーのデータにアクセスできないことを確認）

---

## タスク7: テスト環境整備

### テスト用Price IDの設定

#### 必要な環境変数

```env
# テスト環境用Price ID
STRIPE_TEST_STANDARD_1M_PRICE_ID=price_xxx
STRIPE_TEST_STANDARD_3M_PRICE_ID=price_xxx
STRIPE_TEST_FEEDBACK_1M_PRICE_ID=price_xxx
STRIPE_TEST_FEEDBACK_3M_PRICE_ID=price_xxx
```

### 設定手順

1. Stripeダッシュボード（テストモード）で商品とPrice作成
2. Price IDをコピー
3. Supabaseプロジェクト設定 > Edge Functions > Environment Variablesで設定
4. `.env.local` にも追加（ローカル開発用）
5. テスト

---

## まとめ

### 推奨する実施順序

1. **🔴 タスク2: cancel_url修正**（30分）- すぐ対応可能
2. **🔴 タスク1: 二重課金問題**（2-3時間）- 最優先
3. **🔴 タスク3: 期間変更機能**（1-2時間）- UX向上
4. **🟡 タスク4: 解約同期調査**（1-2時間）- 問題の有無確認
5. **🟡 タスク5: エラーリトライ**（2-3時間）- 安定性向上
6. **🔵 タスク6: RLS設定**（1-2時間）- セキュリティ
7. **🔵 タスク7: テスト環境**（1時間）- 開発効率

### 総所要時間

- 最優先タスク（1-3）: 約4-6時間
- 中優先タスク（4-5）: 約3-5時間
- 低優先タスク（6-7）: 約2-3時間

**合計**: 約9-14時間

### 成功の判断基準

- [ ] 既存ユーザーがプラン変更しても二重課金されない
- [ ] チェックアウトキャンセル時に404エラーが表示されない
- [ ] 同じプラン内で期間変更ができる
- [ ] 解約がアカウントページで正しく反映される
- [ ] ネットワークエラー時に自動リトライが実行される
- [ ] 他ユーザーのサブスクリプション情報にアクセスできない
- [ ] テスト環境で決済フローをテストできる
